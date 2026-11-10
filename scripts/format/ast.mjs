import { parse } from "@babel/parser";

export const parseSource = (source, file) => {
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

export const walk = (
  node,
  visit,
  parent = null,
  key = null,
  ancestors = [],
) => {
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

export const applyEdits = (source, edits) => {
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

export const topLevelBindings = (body) => {
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
