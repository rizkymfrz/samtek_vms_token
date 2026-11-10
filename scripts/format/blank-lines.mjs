import { applyEdits, parseSource, walk } from "./ast.mjs";

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

export const normalizeBlankLines = (source, file) => {
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
