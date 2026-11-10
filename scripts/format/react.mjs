import { applyEdits, parseSource, topLevelBindings, walk } from "./ast.mjs";

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

export const convertReactNamespace = (source, file, warn) => {
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
