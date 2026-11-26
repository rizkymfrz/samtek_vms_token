#!/usr/bin/env bash
set -euo pipefail

here=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
repo=$(dirname "$here")
out=$repo/dist-package
version=""
public_env=""
worktree=0

source "$here/common.sh"

usage() {
  cat <<USAGE
Usage: deploy/build-desktop.sh [--out <dir>] [--version <name>] [--public-env <file>] [--worktree] [-- <electron-builder args>]

  --out         where the installers go, default dist-package/
  --version     default: git describe (--dirty marks uncommitted changes)
  --public-env  file with the NEXT_PUBLIC_* values built into this desktop app (see .env.example); without it
                the browser features that need them (MQTT, camera scan logins) are off
  --worktree    build the working tree (with uncommitted changes) instead of HEAD
  --            the rest goes to electron-builder, default --linux (AppImage and deb)

The desktop app is a client for operators' PCs, not a server component: it is not part of the samtek .run file.
It carries its own Next.js standalone server on 127.0.0.1 and opens the central API set in its Settings page.
Needs node_modules in the repo (npm install) and Node 20 or newer; electron-builder downloads its tools, so the
build machine needs internet. Build each OS on that OS.
USAGE
}

while (($#)); do
  case $1 in
    --out) out=${2:-}; shift 2 ;;
    --version) version=${2:-}; shift 2 ;;
    --public-env) public_env=${2:-}; shift 2 ;;
    --worktree) worktree=1; shift ;;
    -h | --help) usage; exit 0 ;;
    --) shift; break ;;
    *) usage >&2; die "unknown argument: $1" ;;
  esac
done
builder_args=("$@")
((${#builder_args[@]})) || builder_args=(--linux)
[[ -d $repo/node_modules/electron && -d $repo/node_modules/electron-builder ]] || die "electron and electron-builder are missing: run npm install"
command -v node >/dev/null || die "node is required"
[[ -z $public_env || -f $public_env ]] || die "$public_env not found"
[[ -n $version ]] || version=$(git -C "$repo" describe --always --dirty 2>/dev/null || date +%Y%m%d%H%M%S)
[[ $version =~ ^[A-Za-z0-9._-]+$ ]] || die "--version may only hold letters, digits, . _ -"
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
src=$work/src
mkdir -p "$src"
if ((worktree)); then
  note "copying the working tree"
  tar -C "$repo" --exclude=./node_modules --exclude=./.next --exclude=./.git --exclude=./logs \
    --exclude=./dist-package --exclude='./.env*' -cf - . | tar -C "$src" -xf -
else
  note "exporting HEAD"
  git -C "$repo" archive HEAD | tar -C "$src" -xf -
fi
note "copying node_modules"
cp -a "$repo/node_modules" "$src/node_modules"
(cd "$src" && node scripts/copy-maplibre-worker.mjs >/dev/null)
note "building (Next.js, standalone)"
build_env=()
if [[ -n $public_env ]]; then
  while IFS= read -r line; do build_env+=("$line"); done < <(grep -E '^NEXT_PUBLIC_[A-Z0-9_]+=' "$public_env" || true)
fi
(cd "$src" && env SAMTEK_STANDALONE=1 "${build_env[@]}" npx next build >"$work/build.log" 2>&1) \
  || { tail -n 30 "$work/build.log" >&2; die "next build failed"; }
[[ -f $src/.next/standalone/server.js ]] || die "the build made no standalone server.js (is SAMTEK_STANDALONE read by next.config.ts?)"
stage=$work/stage
cp -a "$src/.next/standalone" "$stage"
mkdir -p "$stage/.next"
cp -a "$src/.next/static" "$stage/.next/static"
[[ ! -d $src/public ]] || cp -a "$src/public" "$stage/public"
rm -rf "$stage/.next/cache"
note "packing (electron-builder ${builder_args[*]})"
mkdir -p "$out"
(cd "$src" && env SAMTEK_DESKTOP_VERSION="$version" SAMTEK_DESKTOP_STAGE="$stage" SAMTEK_DESKTOP_OUT="$work/out" \
  npx electron-builder --config deploy/electron-builder.json --publish never "${builder_args[@]}" >"$work/builder.log" 2>&1) \
  || { tail -n 30 "$work/builder.log" >&2; die "electron-builder failed"; }
built=0
for file in "$work"/out/samtek-vms-desktop-*; do
  [[ -f $file ]] || continue
  cp -a "$file" "$out/"
  (cd "$out" && sha256sum "$(basename "$file")" >"$(basename "$file").sha256")
  note "wrote $out/$(basename "$file") ($(du -h "$file" | cut -f1))"
  built=1
done
((built)) || die "electron-builder made no installer"
