#!/usr/bin/env bash
set -uo pipefail

here=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
source "$here/common.sh"

readonly SETTLE_SECONDS=${SAMTEK_VERIFY_SETTLE_SECONDS:-20}
if [[ -z $STAGING && $EUID -ne 0 ]]; then
  echo "verify: run as root (sudo): $CONF is not readable otherwise" >&2
  exit 2
fi
failed=0
pass() { printf '  ok    %s\n' "$*"; }
warn() { printf '  warn  %s\n' "$*"; }
fail() { printf '  FAIL  %s\n' "$*"; failed=1; }

check_release() {
  echo "release"
  if [[ ! -L $PREFIX/current ]]; then
    fail "$PREFIX/current is not a symlink"
    return
  fi
  local release
  release=$(readlink -f "$PREFIX/current")
  pass "current -> $release"
  if [[ -x $release/bin/node ]]; then
    pass "node $("$release/bin/node" --version 2>/dev/null)"
  else
    fail "$release/bin/node not executable"
    return
  fi
  [[ -f $release/app/server.js ]] && pass "app/server.js" || fail "$release/app/server.js missing"
  if "$release/bin/node" "$here/apply-public-env.mjs" --check "$release/app" 2>/dev/null; then
    pass "the browser values are written into the app (no placeholder left)"
  else
    fail "placeholders are still in the app: run deploy/install.sh --reapply"
  fi
  [[ -L $release/app/.next/cache && -d $release/app/.next/cache ]] && pass "cache folder is linked to $DATA/cache" || fail ".next/cache link broken"
}

check_config() {
  echo "config"
  local file mode
  for file in "$ENVFILE" "$PUBLICENV"; do
    if [[ ! -f $file ]]; then
      fail "$file missing"
      continue
    fi
    mode=$(stat -c %a "$file")
    [[ $mode =~ [0-7][0-7]0$ ]] && pass "$(basename "$file") mode $mode" || fail "$(basename "$file") mode $mode is readable by everyone"
  done
  [[ -n $(env_value CENTRAL_API_URL) ]] && pass "CENTRAL_API_URL $(env_value CENTRAL_API_URL)" || fail "CENTRAL_API_URL empty"
  [[ -n $(file_value "$PUBLICENV" NEXT_PUBLIC_MQTT_WS_URL) ]] && pass "browser MQTT address set" || warn "NEXT_PUBLIC_MQTT_WS_URL empty: the live panels get no MQTT"
}

check_service() {
  echo "service"
  [[ -z $STAGING ]] || { warn "staging: systemd not checked"; return; }
  systemctl is-enabled --quiet "$SERVICE" 2>/dev/null || fail "$SERVICE not enabled"
  if ! systemctl is-active --quiet "$SERVICE"; then
    fail "$SERVICE not active"
    return
  fi
  pass "$SERVICE active"
  local before after since uptime
  before=$(systemctl show "$SERVICE" -p NRestarts --value)
  since=$(systemctl show "$SERVICE" -p ActiveEnterTimestampMonotonic --value)
  uptime=0
  [[ -z $since ]] || uptime=$(( ($(cut -d. -f1 /proc/uptime) * 1000000 - since) / 1000000 ))
  if ((uptime < SETTLE_SECONDS)); then
    echo "  wait  active for ${uptime}s, waiting $((SETTLE_SECONDS - uptime))s to see whether it stays up"
    sleep $((SETTLE_SECONDS - uptime))
  fi
  after=$(systemctl show "$SERVICE" -p NRestarts --value)
  if ! systemctl is-active --quiet "$SERVICE"; then
    fail "$SERVICE stopped while waiting"
  elif [[ ${after:-0} -gt ${before:-0} ]]; then
    fail "NRestarts rose from ${before:-0} to $after during the settle time"
  elif [[ ${after:-0} -gt 0 ]]; then
    warn "NRestarts=$after since the last reset (systemctl reset-failed $SERVICE clears it)"
  else
    pass "NRestarts=0"
  fi
}

http_code() {
  curl -s -o /dev/null -m 8 -w '%{http_code}' "$@" || true
}

check_network() {
  echo "network"
  local port listening code
  port=$(env_value PORT); port=${port:-7300}
  listening=$(ss -ltn 2>/dev/null || true)
  if grep -qE "127\.0\.0\.1:${port}\s" <<<"$listening"; then
    pass "Node listens on 127.0.0.1:$port only"
  elif grep -qE "[:.]${port}\s" <<<"$listening"; then
    fail "port $port listens on an address other than 127.0.0.1: the VMS is reachable without nginx"
  else
    fail "port $port not listening"
    return
  fi
  command -v curl >/dev/null || { warn "curl missing, HTTP not probed"; return; }
  code=$(http_code "http://127.0.0.1:${port}/login")
  [[ $code == 200 ]] && pass "/login answers 200" || fail "/login answered ${code:-000}"
  if [[ ! -f $NGINX_CONF ]]; then
    warn "no $NGINX_CONF: nginx is not set up by this installer"
    return
  fi
  local http_port
  http_port=$(grep -oE 'listen +[0-9]+' "$NGINX_CONF" | head -n1 | grep -oE '[0-9]+')
  [[ -z $STAGING ]] && { nginx -t >/dev/null 2>&1 && pass "nginx -t" || fail "nginx -t fails"; }
  code=$(http_code "http://127.0.0.1:${http_port}/login")
  [[ $code == 200 ]] && pass "nginx on $http_port forwards /login (200)" || fail "nginx on $http_port answered ${code:-000} for /login"
  if grep -q 'location = /mqtt' "$NGINX_CONF"; then
    code=$(http_code -H 'Connection: Upgrade' -H 'Upgrade: websocket' -H 'Sec-WebSocket-Version: 13' \
      -H 'Sec-WebSocket-Key: c2Ftc2FtcGxlbm9uY2UxMjM0NQ==' -H 'Sec-WebSocket-Protocol: mqtt' "http://127.0.0.1:${http_port}/mqtt")
    [[ $code == 101 ]] && pass "/mqtt reaches the broker (WebSocket handshake 101)" || fail "/mqtt answered ${code:-000}, not 101"
  else
    warn "no /mqtt in nginx: the browser has no MQTT path"
  fi
}

check_release
check_config
check_service
check_network
if ((failed)); then echo "verify: FAILED"; exit 1; fi
echo "verify: ok"
