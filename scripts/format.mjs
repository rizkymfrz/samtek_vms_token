import { execFileSync } from "node:child_process";
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, relative, resolve } from "node:path";
import { parse } from "@babel/parser";
import * as prettier from "prettier";

const parseSource = (source, file) => {
  const isTypeScript = /\.tsx?$/.test(file);
  const plugins = [];
  if (isTypeScript) plugins.push("typescript");
  if (file.endsWith("x")) plugins.push("jsx");
  return parse(source, { sourceType: "module", plugins });
};

const SKIPPED_KEYS = new Set([
  "loc",
  "extra",
  "leadingComments",
  "trailingComments",
  "innerComments",
]);

const isNode = (value) =>
  value !== null && typeof value === "object" && typeof value.type === "string";

const walk = (node, visit, parent = null, key = null, ancestors = []) => {
  if (visit(node, parent, key, ancestors) === false) return;
  const next = [...ancestors, node];
  for (const [childKey, value] of Object.entries(node)) {
    if (SKIPPED_KEYS.has(childKey)) continue;
    if (Array.isArray(value)) {
      for (const child of value) {
        if (isNode(child)) walk(child, visit, node, childKey, next);
      }
    } else if (isNode(value)) {
      walk(value, visit, node, childKey, next);
    }
  }
};

const applyEdits = (source, edits) => {
  const ordered = [...edits].sort((a, b) => b.start - a.start || b.end - a.end);
  let text = source;
  let limit = Infinity;
  for (const edit of ordered) {
    if (edit.end > limit) throw new Error("Overlapping edits");
    text = text.slice(0, edit.start) + edit.text + text.slice(edit.end);
    limit = edit.start;
  }
  return text;
};

const topLevelBindings = (body) => {
  const bindings = new Map();
  const addPattern = (pattern) => {
    walk(pattern, (node) => {
      if (node.type === "Identifier")
        bindings.set(node.name, { kind: "local" });
    });
  };
  const addDeclaration = (declaration) => {
    if (declaration.type === "VariableDeclaration") {
      for (const item of declaration.declarations) addPattern(item.id);
    } else if (declaration.id) {
      bindings.set(declaration.id.name, { kind: "local" });
    }
  };
  for (const node of body) {
    if (node.type === "ImportDeclaration") {
      for (const specifier of node.specifiers) {
        bindings.set(specifier.local.name, {
          kind: "import",
          source: node.source.value,
          imported: specifier.imported?.name ?? null,
        });
      }
    } else if (node.type === "ExportNamedDeclaration" && node.declaration) {
      addDeclaration(node.declaration);
    } else if (node.type !== "ExportDefaultDeclaration") {
      addDeclaration(node);
    }
  }
  return bindings;
};

const KEPT =
  /^\s*(?:eslint-|@ts-|prettier-ignore|#__|@vite|istanbul|@jsx|@license|@preserve)|^\/\s*</;

const removalRange = (source, start, end) => {
  const lineStart = source.lastIndexOf("\n", start - 1) + 1;
  const newline = source.indexOf("\n", end);
  const lineEnd = newline === -1 ? source.length : newline;
  const before = source.slice(lineStart, start);
  const after = source.slice(end, lineEnd);
  if (!before.trim() && !after.trim()) {
    return [lineStart, Math.min(lineEnd + 1, source.length)];
  }
  if (!after.trim()) {
    return [start - (before.length - before.trimEnd().length), end];
  }
  return [start, source[end] === " " ? end + 1 : end];
};

const stripComments = (source, file) => {
  const ast = parseSource(source, file);
  const comments = ast.comments ?? [];
  const removedContainers = [];
  walk(ast.program, (node) => {
    if (
      node.type === "JSXExpressionContainer" &&
      node.expression.type === "JSXEmptyExpression" &&
      !comments.some(
        (comment) =>
          comment.start >= node.start &&
          comment.end <= node.end &&
          KEPT.test(comment.value),
      )
    ) {
      removedContainers.push(node);
      return false;
    }
  });
  const edits = removedContainers.map((node) => {
    const [start, end] = removalRange(source, node.start, node.end);
    return { start, end, text: "" };
  });
  for (const comment of comments) {
    const insideContainer = removedContainers.some(
      (node) => comment.start >= node.start && comment.end <= node.end,
    );
    if (insideContainer || KEPT.test(comment.value)) continue;
    const [start, end] = removalRange(source, comment.start, comment.end);
    edits.push({ start, end, text: "" });
  }
  return applyEdits(source, edits);
};

const NAMESPACE_SPECIFIERS = new Set([
  "ImportNamespaceSpecifier",
  "ImportDefaultSpecifier",
]);

const isReference = (parent, key) => {
  if (!parent) return true;
  if (parent.type === "MemberExpression" && key === "property") {
    return parent.computed;
  }
  if (parent.type === "ObjectProperty" && key === "key") return parent.computed;
  return true;
};

const convertReactNamespace = (source, file, warn) => {
  const ast = parseSource(source, file);
  const body = ast.program.body;
  const bindings = topLevelBindings(body);
  const reactImports = body.filter(
    (node) =>
      node.type === "ImportDeclaration" && node.source.value === "react",
  );
  const namespaceNames = new Set();
  for (const declaration of reactImports) {
    for (const specifier of declaration.specifiers) {
      if (NAMESPACE_SPECIFIERS.has(specifier.type)) {
        namespaceNames.add(specifier.local.name);
      }
    }
  }
  if (namespaceNames.size === 0 && !bindings.has("React")) {
    namespaceNames.add("React");
  }
  if (namespaceNames.size === 0) return source;
  const uses = new Map();
  const edits = [];
  let hasBareReference = false;
  const record = (name, isType, node) => {
    const use = uses.get(name) ?? { isValue: false, nodes: [] };
    if (!isType) use.isValue = true;
    use.nodes.push(node);
    uses.set(name, use);
  };
  walk(ast.program, (node, parent, key) => {
    if (node.type === "ImportDeclaration") return false;
    if (
      node.type === "MemberExpression" &&
      !node.computed &&
      node.object.type === "Identifier" &&
      namespaceNames.has(node.object.name) &&
      node.property.type === "Identifier"
    ) {
      record(node.property.name, false, node);
      return false;
    }
    if (
      node.type === "TSQualifiedName" &&
      node.left.type === "Identifier" &&
      namespaceNames.has(node.left.name)
    ) {
      record(node.right.name, true, node);
      return false;
    }
    if (
      node.type === "JSXMemberExpression" &&
      node.object.type === "JSXIdentifier" &&
      namespaceNames.has(node.object.name)
    ) {
      record(node.property.name, false, node);
      return false;
    }
    if (
      node.type === "Identifier" &&
      namespaceNames.has(node.name) &&
      isReference(parent, key)
    ) {
      hasBareReference = true;
    }
  });
  const named = new Map();
  const unconverted = [];
  for (const [name, use] of uses) {
    const existing = bindings.get(name);
    const importedFromReact =
      existing?.kind === "import" &&
      existing.source === "react" &&
      existing.imported === name;
    if (existing && !importedFromReact && !namespaceNames.has(name)) {
      unconverted.push(name);
      continue;
    }
    if (existing && namespaceNames.has(name)) {
      unconverted.push(name);
      continue;
    }
    if (!importedFromReact) named.set(name, !use.isValue);
    for (const node of use.nodes) {
      const right = node.right ?? node.property;
      edits.push({ start: node.start, end: node.end, text: right.name });
    }
  }
  const keepNamespace = hasBareReference || unconverted.length > 0;
  if (keepNamespace) {
    warn(
      `React namespace kept (${hasBareReference ? "bare reference" : `name clash: ${unconverted.join(", ")}`})`,
    );
  }
  const addedSpecifiers = [...named].map(
    ([name, isType]) => `${isType ? "type " : ""}${name}`,
  );
  if (!keepNamespace) {
    for (const declaration of reactImports) {
      const isNamespace = declaration.specifiers.some((specifier) =>
        NAMESPACE_SPECIFIERS.has(specifier.type),
      );
      if (!isNamespace) continue;
      const remaining = declaration.specifiers
        .filter((specifier) => specifier.type === "ImportSpecifier")
        .map((specifier) => {
          const imported = specifier.imported.name;
          const alias =
            specifier.local.name === imported
              ? ""
              : ` as ${specifier.local.name}`;
          const isType =
            specifier.importKind === "type" ||
            declaration.importKind === "type";
          return `${isType ? "type " : ""}${imported}${alias}`;
        });
      edits.push({
        start: declaration.start,
        end: declaration.end,
        text:
          remaining.length > 0
            ? `import { ${remaining.join(", ")} } from "react";`
            : "",
      });
    }
  }
  if (addedSpecifiers.length > 0 && body.length > 0) {
    edits.push({
      start: body[0].start,
      end: body[0].start,
      text: `import { ${addedSpecifiers.join(", ")} } from "react";\n`,
    });
  }
  return applyEdits(source, edits);
};

const FUNCTION_LIKE = new Set([
  "FunctionDeclaration",
  "FunctionExpression",
  "ArrowFunctionExpression",
  "ObjectMethod",
  "ClassMethod",
  "ClassPrivateMethod",
]);

const NON_ARROW_BOUNDARIES = new Set([
  "FunctionDeclaration",
  "FunctionExpression",
  "ObjectMethod",
  "ClassMethod",
  "ClassPrivateMethod",
  "ClassBody",
]);

const usesOwnContext = (fn) => {
  let found = false;
  const visit = (node) => {
    if (found) return false;
    if (
      node.type === "ThisExpression" ||
      node.type === "Super" ||
      (node.type === "MetaProperty" && node.meta.name === "new") ||
      (node.type === "Identifier" && node.name === "arguments")
    ) {
      found = true;
      return false;
    }
    if (NON_ARROW_BOUNDARIES.has(node.type)) return false;
  };
  for (const param of fn.params) walk(param, visit);
  walk(fn.body, visit);
  return found;
};

const mentionsName = (root, name) => {
  let found = false;
  walk(root, (node, parent, key) => {
    if (
      node.type === "Identifier" &&
      node.name === name &&
      !(parent?.type === "MemberExpression" && key === "property")
    ) {
      found = true;
    }
  });
  return found;
};

const isConstructed = (ast, name) => {
  let found = false;
  walk(ast.program, (node) => {
    if (
      node.type === "NewExpression" &&
      node.callee.type === "Identifier" &&
      node.callee.name === name
    ) {
      found = true;
    }
  });
  return found;
};

const isUsedBeforeDeclaration = (ast, fn, ancestors) => {
  const scopeIndex = ancestors.findLastIndex(
    (ancestor) =>
      ancestor.type === "Program" || FUNCTION_LIKE.has(ancestor.type),
  );
  const scope = ancestors[scopeIndex];
  let found = false;
  walk(scope, (node, parent, key, path) => {
    if (found) return false;
    if (
      node.type === "Identifier" &&
      node.name === fn.id.name &&
      node.start < fn.start &&
      !(parent?.type === "MemberExpression" && key === "property") &&
      !(parent?.type === "ObjectProperty" && key === "key" && !parent.shorthand)
    ) {
      const nested = [...path.slice(path.indexOf(scope) + 1)];
      if (!nested.some((ancestor) => FUNCTION_LIKE.has(ancestor.type))) {
        found = true;
      }
    }
  });
  return found;
};

const describeSkip = (ast, candidate, overloaded) => {
  const { node: fn, ancestors } = candidate;
  if (fn.generator) return "generator function";
  if (fn.params[0]?.type === "Identifier" && fn.params[0].name === "this") {
    return "explicit this parameter";
  }
  if (usesOwnContext(fn)) return "uses this/arguments/super";
  if (fn.type === "FunctionDeclaration") {
    if (!fn.id) return "anonymous default export needs a name";
    if (overloaded.has(fn.id.name)) return "has overload signatures";
    if (isConstructed(ast, fn.id.name)) return "used with new";
    if (isUsedBeforeDeclaration(ast, fn, ancestors)) {
      return "used before its declaration (hoisting)";
    }
  } else if (fn.id && mentionsName(fn.body, fn.id.name)) {
    return "named function expression refers to itself";
  }
  return null;
};

const buildArrow = (source, fn, file) => {
  const headStart = fn.id
    ? fn.id.end
    : source.indexOf("function", fn.start) + "function".length;
  let head;
  const typeParameters = fn.typeParameters;
  if (typeParameters) {
    const [only] = typeParameters.params;
    const needsComma =
      file.endsWith("x") &&
      typeParameters.params.length === 1 &&
      !only.constraint;
    const declared = source.slice(typeParameters.start, typeParameters.end);
    const generic = needsComma ? `${declared.slice(0, -1)},>` : declared;
    head = generic + source.slice(typeParameters.end, fn.body.start);
  } else {
    head = source.slice(headStart, fn.body.start);
  }
  const body = source.slice(fn.body.start, fn.body.end);
  return `${fn.async ? "async " : ""}${head.trim()} => ${body}`;
};

const needsParentheses = (parent, key, fn) =>
  !fn.extra?.parenthesized &&
  ((parent.type === "MemberExpression" && key === "object") ||
    (parent.type === "CallExpression" && key === "callee") ||
    (parent.type === "NewExpression" && key === "callee") ||
    parent.type === "TaggedTemplateExpression");

const convertOnce = (source, file, warn) => {
  const ast = parseSource(source, file);
  const candidates = [];
  const overloaded = new Set();
  walk(ast.program, (node, parent, key, ancestors) => {
    if (node.type === "TSDeclareFunction" && node.id) {
      overloaded.add(node.id.name);
    }
    if (
      node.type === "FunctionDeclaration" ||
      node.type === "FunctionExpression"
    ) {
      candidates.push({ node, parent, key, ancestors });
    }
  });
  const accepted = [];
  for (const candidate of candidates) {
    const reason = describeSkip(ast, candidate, overloaded);
    if (reason) {
      const name = candidate.node.id?.name ?? "(anonymous)";
      warn(
        `function ${name} at line ${candidate.node.loc.start.line} not converted: ${reason}`,
      );
    } else {
      accepted.push(candidate);
    }
  }
  const leaves = accepted.filter(
    (candidate) =>
      !accepted.some(
        (other) =>
          other !== candidate &&
          other.node.start >= candidate.node.start &&
          other.node.end <= candidate.node.end,
      ),
  );
  if (leaves.length === 0)
    return {
      text: source,
      changed: false,
      skipped: candidates.length - accepted.length,
    };
  const edits = [];
  for (const { node: fn, parent, key } of leaves) {
    const arrow = buildArrow(source, fn, file);
    if (fn.type === "FunctionExpression") {
      edits.push({
        start: fn.start,
        end: fn.end,
        text: needsParentheses(parent, key, fn) ? `(${arrow})` : arrow,
      });
    } else if (parent.type === "ExportDefaultDeclaration") {
      edits.push({
        start: parent.start,
        end: parent.end,
        text: `const ${fn.id.name} = ${arrow};`,
      });
      edits.push({
        start: source.length,
        end: source.length,
        text: `\nexport default ${fn.id.name};\n`,
      });
    } else {
      edits.push({
        start: fn.start,
        end: fn.end,
        text: `const ${fn.id.name} = ${arrow};`,
      });
    }
  }
  return { text: applyEdits(source, edits), changed: true };
};

const functionsToArrows = (source, file, warn) => {
  const seen = new Set();
  const quietWarn = (message) => {
    if (seen.has(message)) return;
    seen.add(message);
    warn(message);
  };
  let text = source;
  for (let round = 0; round < 20; round++) {
    const result = convertOnce(text, file, quietWarn);
    if (!result.changed) break;
    text = result.text;
  }
  return text;
};

const groupOf = (source) => {
  if (source.startsWith("node:")) return 0;
  if (source.startsWith("@/")) return 2;
  if (source.startsWith("..")) return 4;
  if (source.startsWith(".")) return 3;
  return 1;
};

const sourceKey = (source) => source.toLowerCase().replace(/[-_./]/g, "");
const compareText = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

const compareNames = (a, b) => {
  const lowered = compareText(a.toLowerCase(), b.toLowerCase());
  if (lowered !== 0) return lowered;
  if (a === b) return 0;
  return a === a.toUpperCase() ? -1 : 1;
};

const compareEntries = (a, b) =>
  a.group - b.group ||
  compareText(sourceKey(a.source), sourceKey(b.source)) ||
  compareText(a.source, b.source) ||
  a.order - b.order;

const collect = (declarations) => {
  const bySource = new Map();
  const sideEffects = [];
  for (const declaration of declarations) {
    const source = declaration.source.value;
    if (declaration.specifiers.length === 0) {
      if (!declaration.importKind || declaration.importKind === "value") {
        sideEffects.push(declaration);
      }
      continue;
    }
    const entry = bySource.get(source) ?? {
      source,
      defaultImport: null,
      namespaces: [],
      named: new Map(),
    };
    const declarationIsType = declaration.importKind === "type";
    for (const specifier of declaration.specifiers) {
      const isType = declarationIsType || specifier.importKind === "type";
      if (specifier.type === "ImportDefaultSpecifier") {
        entry.defaultImport = { name: specifier.local.name, isType };
      } else if (specifier.type === "ImportNamespaceSpecifier") {
        entry.namespaces.push({ name: specifier.local.name, isType });
      } else {
        const imported = specifier.imported.name ?? specifier.imported.value;
        const local = specifier.local.name;
        const key = `${imported} as ${local}`;
        const previous = entry.named.get(key);
        entry.named.set(key, {
          imported,
          local,
          isType: previous ? previous.isType && isType : isType,
        });
      }
    }
    bySource.set(source, entry);
  }
  return { entries: [...bySource.values()], sideEffects };
};

const renderNamed = (specifiers, inline) =>
  specifiers
    .sort(
      (a, b) =>
        compareNames(a.imported, b.imported) || compareNames(a.local, b.local),
    )
    .map((specifier) => {
      const alias =
        specifier.local === specifier.imported ? "" : ` as ${specifier.local}`;
      return `${inline && specifier.isType ? "type " : ""}${specifier.imported}${alias}`;
    })
    .join(", ");

const render = (entry) => {
  const statements = [];
  const quoted = JSON.stringify(entry.source);
  const named = [...entry.named.values()];
  const defaultImport = entry.defaultImport;
  const allNamedAreTypes =
    named.length > 0 && named.every((item) => item.isType);
  if (defaultImport && !defaultImport.isType) {
    const braces = named.length > 0 ? `, { ${renderNamed(named, true)} }` : "";
    statements.push(`import ${defaultImport.name}${braces} from ${quoted};`);
  } else {
    if (defaultImport) {
      statements.push(`import type ${defaultImport.name} from ${quoted};`);
    }
    if (named.length > 0) {
      statements.push(
        allNamedAreTypes
          ? `import type { ${renderNamed(named, false)} } from ${quoted};`
          : `import { ${renderNamed(named, true)} } from ${quoted};`,
      );
    }
  }
  for (const namespace of entry.namespaces) {
    statements.push(
      `import ${namespace.isType ? "type " : ""}* as ${namespace.name} from ${quoted};`,
    );
  }
  return statements;
};

const sortImports = (source, file) => {
  const ast = parseSource(source, file);
  const { body, directives } = ast.program;
  let count = 0;
  while (body[count]?.type === "ImportDeclaration") count++;
  if (count === 0) return source;
  const declarations = body.slice(0, count);
  const { entries, sideEffects } = collect(declarations);
  entries.forEach((entry, index) => {
    entry.group = groupOf(entry.source);
    entry.order = index;
  });
  const lines = entries
    .sort(compareEntries)
    .flatMap(render)
    .concat(
      sideEffects.map((declaration) =>
        source.slice(declaration.start, declaration.end),
      ),
    );
  const head = directives.map((directive) =>
    source.slice(directive.start, directive.end),
  );
  const prefixEnd = (directives[0] ?? declarations[0]).start;
  const rest = source.slice(declarations[count - 1].end).replace(/^\s+/, "");
  const header = [...head, ...lines].join("\n");
  return `${source.slice(0, prefixEnd)}${header}\n\n${rest}`;
};

const isSingleLine = (node) => node.loc.start.line === node.loc.end.line;

const kindOf = (node) => {
  if (node.type === "ImportDeclaration") return "import";
  if (node.type === "ExportNamedDeclaration") {
    return node.declaration ? kindOf(node.declaration) : "export-list";
  }
  if (node.type === "VariableDeclaration") return `variable:${node.kind}`;
  return node.type;
};

const needsBlankLine = (previous, next) => {
  if (previous.type === "Directive") return next.type !== "ImportDeclaration";
  const previousKind = kindOf(previous);
  const nextKind = kindOf(next);
  if (previousKind === "import" && nextKind === "import") return false;
  if (previousKind !== nextKind) return true;
  return !(isSingleLine(previous) && isSingleLine(next));
};

const LISTS = {
  BlockStatement: ["directives", "body"],
  StaticBlock: ["body"],
  SwitchStatement: ["cases"],
  SwitchCase: ["consequent"],
  ClassBody: ["body"],
  ObjectExpression: ["properties"],
  ObjectPattern: ["properties"],
  ArrayExpression: ["elements"],
  TSTypeLiteral: ["members"],
  TSInterfaceBody: ["body"],
  TSEnumDeclaration: ["members"],
  TSModuleBlock: ["body"],
};

const collapse = (gap) => gap.replace(/\n[ \t]*(?:\n[ \t]*)+/g, "\n");

const normalizeBlankLines = (source, file) => {
  const ast = parseSource(source, file);
  const edits = [];
  const addGap = (previous, next, replacement) => {
    const gap = source.slice(previous.end, next.start);
    if (gap.trim().replace(/,/g, "") !== "") return;
    const text = replacement ?? collapse(gap);
    if (text !== gap)
      edits.push({ start: previous.end, end: next.start, text });
  };
  const top = [...ast.program.directives, ...ast.program.body];
  for (let index = 1; index < top.length; index++) {
    const previous = top[index - 1];
    const next = top[index];
    const gap = source.slice(previous.end, next.start);
    const separator = needsBlankLine(previous, next) ? "\n\n" : "\n";
    if (gap.trim() === "" && gap !== separator) {
      edits.push({ start: previous.end, end: next.start, text: separator });
    }
  }
  walk(ast.program, (node) => {
    const keys = LISTS[node.type];
    if (!keys) return;
    const items = keys.flatMap((key) => node[key] ?? []).filter(Boolean);
    for (let index = 1; index < items.length; index++) {
      addGap(items[index - 1], items[index]);
    }
  });
  return applyEdits(source, edits);
};

const ROOTS = ["app", "components", "features", "hooks"];
const UNIT_PX = 4;
const REM_PX = 16;
const SCALE = [2, 4, 8, 16, 32, 64, 128, 256, 512];

const PREFIX =
  "gap-x|gap-y|gap|space-x|space-y|px|py|ps|pe|pt|pr|pb|pl|p|mx|my|ms|me|mt|mr|mb|ml|m";

const NUMERIC = new RegExp(
  `(?<![\\w-])(-?)(${PREFIX})-(\\d+(?:\\.\\d+)?|px)(?![\\w.\\[/%-])`,
  "g",
);

const ARBITRARY = new RegExp(
  `(?<![\\w-])(-?)(${PREFIX})-\\[(\\d*\\.?\\d+)(px|rem)\\]`,
  "g",
);

const SPACING_FN = /--spacing\(\s*(\d+(?:\.\d+)?)\s*\)/g;

const SPACING_VAR =
  /\[--([\w-]*(?:gap|peek|bleed|spacing)[\w-]*):(\d*\.?\d+)(px|rem)\]/g;

const onScale = (px) =>
  px === 0 || (Number.isInteger(px) && px >= 2 && (px & (px - 1)) === 0);

const nearest = (px) =>
  SCALE.reduce((a, b) => (Math.abs(b - px) <= Math.abs(a - px) ? b : a));

const fix = (source) => {
  return source
    .replace(NUMERIC, (all, sign, prefix, value) => {
      const px = value === "px" ? 1 : Number(value) * UNIT_PX;
      return onScale(px) ? all : `${sign}${prefix}-${nearest(px) / UNIT_PX}`;
    })
    .replace(ARBITRARY, (all, sign, prefix, value, unit) => {
      const px = Number(value) * (unit === "rem" ? REM_PX : 1);
      return onScale(px) ? all : `${sign}${prefix}-${nearest(px) / UNIT_PX}`;
    })
    .replace(SPACING_FN, (all, value) => {
      const px = Number(value) * UNIT_PX;
      return onScale(px) ? all : `--spacing(${nearest(px) / UNIT_PX})`;
    })
    .replace(SPACING_VAR, (all, name, value, unit) => {
      const px = Number(value) * (unit === "rem" ? REM_PX : 1);
      if (onScale(px)) return all;
      const next = nearest(px);
      return `[--${name}:${unit === "rem" ? next / REM_PX : next}${unit}]`;
    });
};

const fixSpacing = (text, file) => {
  const path = relative(process.cwd(), file);
  const scoped =
    /\.(ts|tsx)$/.test(path) &&
    ROOTS.some((root) => path.startsWith(`${root}/`));
  return scoped ? fix(text) : text;
};

const EXTENSIONS = new Set([".ts", ".tsx", ".mjs"]);
const EXCLUDED = /(^|\/)(node_modules|\.next|public)\/|\.d\.ts$/;

const runPrettier = async (text, file) =>
  prettier.format(text, {
    ...(await prettier.resolveConfig(file)),
    filepath: file,
  });

const STAGES = [
  fixSpacing,
  stripComments,
  convertReactNamespace,
  functionsToArrows,
  sortImports,
  runPrettier,
  normalizeBlankLines,
  runPrettier,
];

const formatSource = async (source, file, warn = () => {}) => {
  let text = source;
  for (const stage of STAGES) text = await stage(text, file, warn);
  return text;
};

const listFiles = (targets) => {
  const output = execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard"],
    { encoding: "utf8" },
  );
  const files = output
    .split("\n")
    .filter((file) => file && EXTENSIONS.has(extname(file)))
    .filter((file) => !EXCLUDED.test(file));
  if (targets.length === 0) return files;
  const prefixes = targets.map((target) => {
    const path = relative(process.cwd(), resolve(target));
    return statSync(target).isDirectory() ? `${path}/` : path;
  });
  return files.filter((file) =>
    prefixes.some((prefix) => file === prefix || file.startsWith(prefix)),
  );
};

const formatFiles = async (args) => {
  const check = args.includes("--check");
  const targets = args.filter((arg) => !arg.startsWith("--"));
  const changed = [];
  const failed = [];
  for (const file of listFiles(targets)) {
    const path = resolve(file);
    const source = readFileSync(path, "utf8");
    try {
      const formatted = await formatSource(source, path, (message) =>
        console.warn(`warn  ${file}: ${message}`),
      );
      if (formatted !== source) {
        changed.push(file);
        if (!check) writeFileSync(path, formatted);
      }
    } catch (error) {
      failed.push(file);
      console.error(`error ${file}: ${error.message}`);
    }
  }
  for (const file of changed)
    console.log(`${check ? "needs format" : "formatted"}  ${file}`);
  console.log(
    `${changed.length} ${check ? "need formatting" : "formatted"}, ${failed.length} failed`,
  );
  if (failed.length > 0 || (check && changed.length > 0)) process.exitCode = 1;
};

await formatFiles(process.argv.slice(2));
