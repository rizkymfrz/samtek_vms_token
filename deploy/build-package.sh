#!/usr/bin/env bash
set -euo pipefail

here=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
repo=$(dirname "$here")
out=$repo/dist-package
version=""
worktree=0

source "$here/common.sh"

usage() {
  cat <<USAGE
Usage: deploy/build-package.sh [--out <dir>] [--version <name>] [--worktree]

  --out       where the tarball goes, default dist-package/
  --version   default: git describe (--dirty marks uncommitted changes)
  --worktree  build the working tree (with uncommitted changes) instead of HEAD

Needs node_modules in the repo (npm install) and Node 20 or newer on this machine; the Node binary
that builds is the one shipped. The NEXT_PUBLIC_* values are built in as placeholders and written
at install time (deploy/apply-public-env.mjs), so one package serves every installation.
USAGE
}

while (($#)); do
  case $1 in
    --out) out=${2:-}; shift 2 ;;
    --version) version=${2:-}; shift 2 ;;
    --worktree) worktree=1; shift ;;
    -h | --help) usage; exit 0 ;;
    *) usage >&2; die "unknown argument: $1" ;;
  esac
done
[[ $(uname -s) == Linux && $(uname -m) == x86_64 ]] || die "Linux x86_64 only"
[[ -d $repo/node_modules ]] || die "$repo/node_modules missing: run npm install"
command -v node >/dev/null || die "node is required"
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
while IFS= read -r line; do build_env+=("$line"); done < <(node "$here/apply-public-env.mjs" --print-build-env)
(cd "$src" && env SAMTEK_STANDALONE=1 DATA_SOURCE=mock "${build_env[@]}" npx next build >"$work/build.log" 2>&1) \
  || { tail -n 30 "$work/build.log" >&2; die "next build failed"; }
[[ -f $src/.next/standalone/server.js ]] || die "the build made no standalone server.js (is SAMTEK_STANDALONE read by next.config.ts?)"
name=samtek-vms-$version-linux-x86_64
root=$work/$name
mkdir -p "$root/payload/bin" "$root/deploy"
cp -a "$src/.next/standalone" "$root/payload/app"
mkdir -p "$root/payload/app/.next"
cp -a "$src/.next/static" "$root/payload/app/.next/static"
[[ ! -d $src/public ]] || cp -a "$src/public" "$root/payload/app/public"
rm -rf "$root/payload/app/.next/cache"
cp -a "$(command -v node)" "$root/payload/bin/node"
for script in common.sh install.sh upgrade.sh uninstall.sh verify.sh build-package.sh apply-public-env.mjs samtek-vms.service samtek-vms.nginx.conf; do
  cp -a "$here/$script" "$root/deploy/"
done
cp -a "$repo/.env.example" "$root/"
printf '%s' "$version" >"$root/VERSION"
note "checking the placeholders are in the build"
node "$root/deploy/apply-public-env.mjs" --require "$root/payload/app" || die "a NEXT_PUBLIC placeholder is not in the build: the VMS no longer reads it"
(cd "$root" && find . -type f ! -name SHA256SUMS -print0 | sort -z | xargs -0 sha256sum >SHA256SUMS)
mkdir -p "$out"
tarball=$out/$name.tar.gz
tar --owner=0 --group=0 --numeric-owner -C "$work" -czf "$tarball" "$name"
(cd "$out" && sha256sum "$name.tar.gz" >"$name.tar.gz.sha256")
note "wrote $tarball ($(du -h "$tarball" | cut -f1))"
