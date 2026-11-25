#!/usr/bin/env bash
# Removes the VMS. By default only the unit, the nginx site and the releases; config and cache stay.
set -euo pipefail

here=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=deploy/common.sh
source "$here/common.sh"

dry_run=0
purge_config=0
purge_data=0

usage() {
  cat <<USAGE
Usage: sudo deploy/uninstall.sh [--purge-config] [--purge-data] [--dry-run]

  (default)       stop and disable the service; remove the unit, the nginx site and $PREFIX
  --purge-config  also remove $CONF (vms.env and public.env)
  --purge-data    also remove $DATA (the Next.js cache); asks you to type a phrase
Backups in $BACKUP and the user $SERVICE_USER are never removed. nginx itself stays.
USAGE
}

while (($#)); do
  case $1 in
    --purge-config) purge_config=1; shift ;;
    --purge-data) purge_data=1; shift ;;
    --dry-run) dry_run=1; shift ;;
    -h | --help) usage; exit 0 ;;
    *) usage >&2; die "unknown argument: $1" ;;
  esac
done

require_root

remove_tree() {
  case $1 in
    "$PREFIX" | "$CONF" | "$DATA") ;;
    *) die "refusing to remove $1" ;;
  esac
  [[ -e $1 || -L $1 ]] || return 0
  note "removing $1"
  run rm -rf -- "$1"
}

if ((purge_data)); then
  echo "This deletes $DATA (a cache that Next.js rebuilds)."
  if ((dry_run)); then
    note "dry-run: would ask for 'delete samtek vms data'"
  else
    [[ -t 0 ]] || die "--purge-data needs a terminal to type the confirmation"
    read -r -p "Type 'delete samtek vms data' to continue: " answer
    [[ $answer == "delete samtek vms data" ]] || die "not confirmed, nothing removed"
  fi
fi

if [[ -z $STAGING ]]; then
  run systemctl stop "$SERVICE" || true
  run systemctl disable "$SERVICE" || true
fi
if [[ -f $UNIT ]]; then
  if grep -q "^${MARKER}" "$UNIT"; then run rm -f -- "$UNIT"; else note "$UNIT was not made by this installer, left in place"; fi
fi
if [[ -f $NGINX_CONF ]]; then
  if grep -q "^${MARKER}" "$NGINX_CONF"; then
    run rm -f -- "$NGINX_CONF"
    [[ -n $STAGING ]] || run systemctl reload nginx || true
  else
    note "$NGINX_CONF was not made by this installer, left in place"
  fi
fi
if [[ -z $STAGING ]]; then
  run systemctl daemon-reload
  run systemctl reset-failed "$SERVICE" 2>/dev/null || true
fi

remove_tree "$PREFIX"
((purge_config)) && remove_tree "$CONF"
((purge_data)) && remove_tree "$DATA"
note "done"
