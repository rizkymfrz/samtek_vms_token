import { parseSource } from "./ast.mjs";

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

export const sortImports = (source, file) => {
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
