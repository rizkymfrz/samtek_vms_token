// Rewrites off-scale spacing utilities to the nearest value on the scale
// (see eslint-rules/spacing-scale.mjs). Ties round up.
//
//   npm run fix:spacing            rewrite files in place
//   npm run fix:spacing -- --check list what would change, exit 1 if anything
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const ROOTS = ["app", "components", "hooks"]
const UNIT_PX = 4
const REM_PX = 16
const SCALE = [2, 4, 8, 16, 32, 64, 128, 256, 512]

const PREFIX = "gap-x|gap-y|gap|space-x|space-y|px|py|ps|pe|pt|pr|pb|pl|p|mx|my|ms|me|mt|mr|mb|ml|m"
const NUMERIC = new RegExp(`(?<![\\w-])(-?)(${PREFIX})-(\\d+(?:\\.\\d+)?|px)(?![\\w.\\[/%-])`, "g")
const ARBITRARY = new RegExp(`(?<![\\w-])(-?)(${PREFIX})-\\[(\\d*\\.?\\d+)(px|rem)\\]`, "g")
const SPACING_FN = /--spacing\(\s*(\d+(?:\.\d+)?)\s*\)/g
const SPACING_VAR = /\[--([\w-]*(?:gap|peek|bleed|spacing)[\w-]*):(\d*\.?\d+)(px|rem)\]/g

const onScale = (px) => px === 0 || (Number.isInteger(px) && px >= 2 && (px & (px - 1)) === 0)
const nearest = (px) => SCALE.reduce((a, b) => (Math.abs(b - px) <= Math.abs(a - px) ? b : a))

function fix(source) {
  return source
    .replace(NUMERIC, (all, sign, prefix, value) => {
      const px = value === "px" ? 1 : Number(value) * UNIT_PX
      return onScale(px) ? all : `${sign}${prefix}-${nearest(px) / UNIT_PX}`
    })
    .replace(ARBITRARY, (all, sign, prefix, value, unit) => {
      const px = Number(value) * (unit === "rem" ? REM_PX : 1)
      return onScale(px) ? all : `${sign}${prefix}-${nearest(px) / UNIT_PX}`
    })
    .replace(SPACING_FN, (all, value) => {
      const px = Number(value) * UNIT_PX
      return onScale(px) ? all : `--spacing(${nearest(px) / UNIT_PX})`
    })
    .replace(SPACING_VAR, (all, name, value, unit) => {
      const px = Number(value) * (unit === "rem" ? REM_PX : 1)
      if (onScale(px)) return all
      const next = nearest(px)
      return `[--${name}:${unit === "rem" ? next / REM_PX : next}${unit}]`
    })
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) yield* walk(path)
    else if (/\.(ts|tsx)$/.test(path)) yield path
  }
}

const check = process.argv.includes("--check")
const changed = []
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const before = readFileSync(file, "utf8")
    const after = fix(before)
    if (before === after) continue
    changed.push(file)
    if (!check) writeFileSync(file, after)
  }
}

if (check && changed.length) {
  console.error(`Off-scale spacing in:\n${changed.map((file) => `  ${file}`).join("\n")}`)
  process.exit(1)
}
console.log(check ? "Spacing is on scale." : `Fixed ${changed.length} file(s).`)
