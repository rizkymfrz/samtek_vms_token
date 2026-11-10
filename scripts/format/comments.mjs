import { applyEdits, parseSource, walk } from "./ast.mjs";

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

export const stripComments = (source, file) => {
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
