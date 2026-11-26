#!/usr/bin/env bash
set -euo pipefail

here=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
repo=$(dirname "$here")
keep=3
dry_run=0
verify=1
from=""
version=""

source "$here/common.sh"

usage() {
  cat <<USAGE
Usage: sudo deploy/upgrade.sh [--from <folder>] [--version <name>] [--keep N] [--no-verify] [--dry-run]

  Run it from the new package. The browser values are taken again from $PUBLICENV.
  --keep N     releases to keep, default 3 (the active and the previous are always kept)
  --no-verify  skip verify.sh and therefore the automatic rollback
USAGE
}

while (($#)); do
  case $1 in
    --from) from=${2:-}; shift 2 ;;
    --version) version=${2:-}; shift 2 ;;
    --keep) keep=${2:-}; shift 2 ;;
    --no-verify) verify=0; shift ;;
    --dry-run) dry_run=1; shift ;;
    -h | --help) usage; exit 0 ;;
    *) usage >&2; die "unknown argument: $1" ;;
  esac
done
[[ $keep =~ ^[0-9]+$ ]] && ((keep >= 2)) || die "--keep must be a number of at least 2"
require_root
[[ -L $PREFIX/current ]] || die "nothing installed at $PREFIX (use install.sh first)"
previous=$(current_release)
[[ -d $previous ]] || die "current release $previous is missing: the install is broken, repair it with deploy/install.sh from the new package"
if [[ -z $version ]]; then
  [[ -f $repo/VERSION ]] || die "--version is required outside a package"
  version=$(<"$repo/VERSION")
fi
[[ $(basename "$previous") != "$version" ]] || die "release $version is already the active one"
install_args=(--no-start --version "$version")
[[ -z $from ]] || install_args+=(--from "$from")
((dry_run)) && install_args+=(--dry-run)

service_stop() {
  [[ -z $STAGING ]] || { note "staging: service stop skipped"; return 0; }
  run systemctl stop "$SERVICE"
}
service_start() {
  [[ -z $STAGING ]] || { note "staging: service start skipped"; return 0; }
  run systemctl start "$SERVICE"
}

backup=$BACKUP/$(date +%Y%m%d-%H%M%S)

rollback() {
  note "ROLLBACK to $(basename "$previous")"
  service_stop || true
  ln -sfn "$previous" "$PREFIX/current.new"
  mv -T "$PREFIX/current.new" "$PREFIX/current"
  service_start || true
  note "rolled back; the files of the failed attempt stay in $PREFIX/releases"
}

prune() {
  local active
  active=$(current_release)
  local -a releases
  mapfile -t releases < <(ls -1dt "$PREFIX"/releases/*/ 2>/dev/null | sed 's:/$::')
  local index=0 release
  for release in "${releases[@]}"; do
    index=$((index + 1))
    ((index > keep)) || continue
    [[ $release == "$active" || $release == "$previous" ]] && continue
    note "removing old release $(basename "$release")"
    run rm -rf -- "${PREFIX:?}/releases/$(basename "$release")"
  done
}

note "upgrading $(basename "$previous") -> $version"
service_stop
run install -d -m 0700 "$backup"
if ((! dry_run)); then
  cp -a "$ENVFILE" "$backup/vms.env"
  cp -a "$PUBLICENV" "$backup/public.env"
  printf '%s\n' "$(basename "$previous")" >"$backup/previous-release"
fi
if ! "$here/install.sh" "${install_args[@]}"; then
  ((dry_run)) || rollback
  die "install step failed"
fi
((dry_run)) && { note "dry-run: stopping here"; exit 0; }
service_start
if ((verify)); then
  if ! "$here/verify.sh"; then
    rollback
    die "verify failed after the upgrade, rolled back to $(basename "$previous")"
  fi
fi
prune
note "upgrade to $version done"
