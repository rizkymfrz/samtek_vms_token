readonly STAGING=${SAMTEK_ROOT:-}
readonly SERVICE=samtek-vms
readonly SERVICE_USER=samtek-vms
readonly PREFIX=$STAGING/opt/samtek/vms
readonly CONF=$STAGING/etc/samtek/vms
readonly ENVFILE=$CONF/vms.env
readonly PUBLICENV=$CONF/public.env
readonly DATA=$STAGING/var/lib/samtek/vms
readonly BACKUP=$STAGING/var/backups/samtek/vms
readonly UNIT=$STAGING/etc/systemd/system/${SERVICE}.service
readonly NGINX_CONF=$STAGING/etc/nginx/conf.d/samtek-vms.conf
readonly MARKER='# samtek-deploy:'
dry_run=${dry_run:-0}

die() { echo "${0##*/}: $*" >&2; exit 1; }
note() { echo "${0##*/}: $*"; }

run() {
  if ((dry_run)); then
    printf '  [dry-run]'
    printf ' %q' "$@"
    printf '\n'
  else
    "$@"
  fi
}

require_root() {
  ((dry_run)) || [[ -n $STAGING ]] || [[ $EUID -eq 0 ]] || die "run as root (sudo)"
}

file_value() {
  grep -E "^$2=" "$1" 2>/dev/null | tail -n1 | cut -d= -f2-
}

env_value() {
  local value
  value=$(file_value "$ENVFILE" "$1")
  value=${value#\"}; value=${value%\"}
  printf '%s' "$value"
}

current_release() {
  readlink -f "$PREFIX/current" 2>/dev/null || true
}

listener_process() {
  local listening
  listening=$(ss -ltnpH 2>/dev/null || true)
  grep -E "[:.]$1\s" <<<"$listening" | grep -oE '\(\("[^"]+"' | head -n1 | tr -d '("'
}

port_in_use() {
  local listening
  listening=$(ss -ltn 2>/dev/null || true)
  grep -qE "[:.]$1\s" <<<"$listening"
}
