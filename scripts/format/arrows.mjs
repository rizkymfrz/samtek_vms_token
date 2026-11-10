import { applyEdits, parseSource, walk } from "./ast.mjs";

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

export const functionsToArrows = (source, file, warn) => {
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
