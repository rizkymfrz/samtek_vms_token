const TAILWIND_UNIT_PX = 4;
const REM_PX = 16;
const CLASS_HELPERS = new Set(["cn", "cva", "clsx", "twMerge", "classNames"]);

const SPACING_UTILITY = new RegExp(
  "^(?:p|px|py|ps|pe|pt|pr|pb|pl|m|mx|my|ms|me|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y|scroll-m|scroll-p)-(.+)$",
);

export const SCALE_HINT =
  "0, 0.5, 1, 2, 4, 8, 16, 32, 64, 128… (2, 4, 8, 16, 32, 64… px)";

const isOnScale = (px) => {
  if (px === 0) return true;
  if (!Number.isInteger(px) || px < 0) return false;
  return (px & (px - 1)) === 0 && px >= 2;
};

const utilityOf = (token) => {
  let depth = 0;
  let start = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token[i];
    if (char === "[" || char === "(") depth++;
    else if (char === "]" || char === ")") depth--;
    else if (char === ":" && depth === 0) start = i + 1;
  }
  return token
    .slice(start)
    .replace(/^!/, "")
    .replace(/!$/, "")
    .replace(/^-/, "");
};

const pxOfValue = (value) => {
  if (value === "auto" || value === "reverse") return null;
  if (/^\d+(\.\d+)?$/.test(value)) return Number(value) * TAILWIND_UNIT_PX;
  if (value === "px") return 1;
  const arbitrary = value.match(/^\[(\d+(?:\.\d+)?)(px|rem)\]$/);
  if (arbitrary) {
    return Number(arbitrary[1]) * (arbitrary[2] === "rem" ? REM_PX : 1);
  }
  return null;
};

const SPACING_FN = /--spacing\(\s*(\d+(?:\.\d+)?)\s*\)/g;
const SPACING_VAR =
  /\[--([\w-]*(?:gap|peek|bleed|spacing)[\w-]*):(\d*\.?\d+)(px|rem)\]/g;

const findViolations = (classString) => {
  const violations = [];
  for (const match of classString.matchAll(SPACING_FN)) {
    if (!isOnScale(Number(match[1]) * TAILWIND_UNIT_PX))
      violations.push(match[0]);
  }
  for (const match of classString.matchAll(SPACING_VAR)) {
    const px = Number(match[2]) * (match[3] === "rem" ? REM_PX : 1);
    if (!isOnScale(px)) violations.push(`--${match[1]}:${match[2]}${match[3]}`);
  }
  for (const token of classString.split(/\s+/)) {
    if (!token) continue;
    const utility = utilityOf(token);
    const match = utility.match(SPACING_UTILITY);
    if (!match) continue;
    const px = pxOfValue(match[1]);
    if (px !== null && !isOnScale(px)) violations.push(utility);
  }
  return violations;
};

const isClassContext = (ancestors) => {
  return ancestors.some(
    (node) =>
      (node.type === "JSXAttribute" &&
        node.name.type === "JSXIdentifier" &&
        node.name.name === "className") ||
      (node.type === "CallExpression" &&
        node.callee.type === "Identifier" &&
        CLASS_HELPERS.has(node.callee.name)),
  );
};

const rule = {
  meta: {
    type: "problem",
    docs: { description: "Restrict spacing utilities to a power-of-two scale" },
    schema: [],
    messages: {
      offScale: `Spacing "{{utility}}" is not on the scale. Allowed: ${SCALE_HINT}.`,
    },
  },
  create(context) {
    const check = (node, text) => {
      const ancestors = context.sourceCode.getAncestors(node);
      if (!isClassContext(ancestors)) return;
      for (const utility of findViolations(text)) {
        context.report({ node, messageId: "offScale", data: { utility } });
      }
    };
    return {
      Literal(node) {
        if (typeof node.value === "string") check(node, node.value);
      },
      TemplateElement(node) {
        check(node, node.value.cooked ?? "");
      },
    };
  },
};

const plugin = { rules: { "spacing-scale": rule } };

export default plugin;
