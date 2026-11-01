#!/usr/bin/env node
// Verifica que el copy comercial (ES / EN / PT-BR) no cambie sin revisión.
// Uso:
//   node scripts/verify-content-preservation.mjs          compara con scripts/content-baseline.json
//   node scripts/verify-content-preservation.mjs --write  regenera el baseline (solo tras revisión humana)
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const baselinePath = join(root, "scripts", "content-baseline.json");

const COPY_FILES = [
  "src/lib/content.ts",
  "src/lib/i18n.tsx",
  "src/lib/operational-challenges.ts",
  "src/lib/whatsapp.ts",
  ...readdirSync(join(root, "src/components/site"))
    .filter((name) => /\.tsx$/.test(name))
    .map((name) => `src/components/site/${name}`),
];

// Atributos que contienen texto visible o accesible; el resto (className, id, href, etc.) no es copy.
const COPY_ATTRIBUTES = new Set(["alt", "title", "aria-label", "placeholder"]);
// Llamadas cuyos argumentos son clases CSS o nombres de eventos de analítica, no copy.
const NON_COPY_CALLS = new Set(["cn", "cva", "clsx", "twMerge", "track"]);
const NON_COPY_VALUE = /^(https?:|mailto:|tel:|\/|#|\.)/;

function ancestors(node) {
  const chain = [];
  for (let current = node.parent; current; current = current.parent) chain.push(current);
  return chain;
}

function isCopy(node, value) {
  if (!/\p{L}/u.test(value) || NON_COPY_VALUE.test(value)) return false;
  const parent = node.parent;
  if (ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent)) return false;
  if (ts.isLiteralTypeNode(parent)) return false;
  if (ts.isPropertyAssignment(parent) && parent.name === node) return false;

  const jsxExpression = ts.isJsxExpression(parent) ? parent : null;
  const attribute = ts.isJsxAttribute(parent) ? parent : jsxExpression?.parent;
  if (attribute && ts.isJsxAttribute(attribute)) {
    return ts.isIdentifier(attribute.name) && COPY_ATTRIBUTES.has(attribute.name.text);
  }

  return !ancestors(node).some(
    (ancestor) =>
      ts.isCallExpression(ancestor) &&
      ts.isIdentifier(ancestor.expression) &&
      NON_COPY_CALLS.has(ancestor.expression.text),
  );
}

// Nombre del bloque de nivel superior (p. ej. `es`, `en`, `Hero`) para separar idiomas y componentes.
function scopeOf(node) {
  const topLevel = ancestors(node).find(
    (ancestor) => ancestor.parent && ts.isSourceFile(ancestor.parent),
  );
  if (!topLevel) return "module";
  if (ts.isVariableStatement(topLevel))
    return topLevel.declarationList.declarations[0]?.name.getText() ?? "module";
  if (ts.isFunctionDeclaration(topLevel)) return topLevel.name?.text ?? "module";
  return "module";
}

function collect(file) {
  const text = readFileSync(join(root, file), "utf8");
  const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
  const entries = new Map();

  const add = (node, value) => {
    const key = `${file}#${scopeOf(node)}`;
    entries.set(key, [...(entries.get(key) ?? []), value]);
  };

  const visit = (node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      if (isCopy(node, node.text)) add(node, node.text);
    } else if (ts.isJsxText(node)) {
      const value = node.text.replace(/\s+/g, " ").trim();
      if (value && isCopy(node, value)) add(node, value);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return entries;
}

function buildCurrent() {
  const current = {};
  for (const file of COPY_FILES) {
    for (const [key, values] of collect(file)) current[key] = values;
  }
  return Object.fromEntries(Object.entries(current).sort(([a], [b]) => a.localeCompare(b)));
}

// Comparación por multiconjunto: detecta cadenas añadidas o eliminadas sin importar su posición.
function diff(before, after) {
  const counts = new Map();
  for (const value of before) counts.set(value, (counts.get(value) ?? 0) + 1);
  const added = [];
  for (const value of after) {
    const remaining = counts.get(value) ?? 0;
    if (remaining > 0) counts.set(value, remaining - 1);
    else added.push(value);
  }
  const removed = [...counts].flatMap(([value, count]) => Array(count).fill(value));
  return { added, removed };
}

const current = buildCurrent();
const totalStrings = Object.values(current).reduce((sum, values) => sum + values.length, 0);

if (process.argv.includes("--write")) {
  const payload = {
    version: 1,
    note: "Generado por scripts/verify-content-preservation.mjs --write. No editar a mano.",
    entries: current,
  };
  writeFileSync(baselinePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(
    `Baseline escrito: ${totalStrings} cadenas en ${Object.keys(current).length} bloques.`,
  );
  process.exit(0);
}

const baseline = JSON.parse(readFileSync(baselinePath, "utf8")).entries;
const keys = [...new Set([...Object.keys(baseline), ...Object.keys(current)])].sort();
const changes = [];
for (const key of keys) {
  const result = diff(baseline[key] ?? [], current[key] ?? []);
  if (result.added.length || result.removed.length) changes.push({ key, ...result });
}

if (changes.length === 0) {
  console.log(
    `OK: ${totalStrings} cadenas de copy coinciden con el baseline (${keys.length} bloques).`,
  );
  process.exit(0);
}

console.error("FALLO: el copy comercial cambió respecto al baseline.");
for (const { key, added, removed } of changes) {
  console.error(`\n[${key}]`);
  removed.forEach((value) => console.error(`  - ${JSON.stringify(value)}`));
  added.forEach((value) => console.error(`  + ${JSON.stringify(value)}`));
}
console.error(
  "\nSi el cambio fue aprobado por el equipo comercial, regenere con --write en el mismo commit.",
);
process.exit(1);
