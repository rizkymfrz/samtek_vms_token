#!/usr/bin/env bash
set -euo pipefail

here=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
repo=$(dirname "$here")
from=""
version=""
dry_run=0
start=1
reapply=0
rewrite_nginx=0
port=3100
http_port=80
server_name=_
public_url=""
api_url=""
mqtt_ws=""
use_nginx=1
install_deps=0
disable_default_site=0

source "$here/common.sh"

usage() {
  cat <<USAGE
Usage: sudo deploy/install.sh [options]

  --from <folder>         payload/ of an extracted package (bin/node and app/); default: payload/
  --version <name>        release name; default: VERSION of the package
  --port <n>              port of the Node server, default $port (127.0.0.1 only)
  --http-port <n>         port of the nginx site, default $http_port
  --server-name <name>    nginx server_name, default _ (answers every host)
  --public-url <url>      what the browsers use, e.g. https://vms.example.com; default: http://<ip of
                          this machine>[:http-port]. The browser MQTT address is built from it.
  --api-url <url>         the API the server calls; default: the samtek-api of this machine, else asked
  --mqtt-ws <host:port>   WebSocket listener of the broker that nginx forwards /mqtt to; default: the
                          samtek-mosquitto of this machine; none means no /mqtt
  --no-nginx              do not touch nginx (you put a proxy in front yourself)
  --install-deps          apt-get install nginx when it is missing
  --disable-default-site  remove the stock nginx "default" site (it holds default_server on port 80); done by
                          itself when the site is the unmodified stock one and this site answers every host
  --reapply               copy the app of the package again into the active release and write the
                          browser values again (after editing $PUBLICENV)
  --rewrite-nginx         write the nginx site again with the options of this run (it is written once and
                          kept on later installs and upgrades, so --http-port and --server-name stay)
  --no-start              install and enable the unit without starting it
  --dry-run               print every action, change nothing, root not required

The browser values (MQTT address and account, scan logins) are in $PUBLICENV and are written into the
app at install time. They reach every browser: use an account that may only read.
USAGE
}

while (($#)); do
  case $1 in
    --from) from=${2:-}; shift 2 ;;
    --version) version=${2:-}; shift 2 ;;
    --port) port=${2:-}; shift 2 ;;
    --http-port) http_port=${2:-}; shift 2 ;;
    --server-name) server_name=${2:-}; shift 2 ;;
    --public-url) public_url=${2:-}; shift 2 ;;
    --api-url) api_url=${2:-}; shift 2 ;;
    --mqtt-ws) mqtt_ws=${2:-}; shift 2 ;;
    --no-nginx) use_nginx=0; shift ;;
    --install-deps) install_deps=1; shift ;;
    --disable-default-site) disable_default_site=1; shift ;;
    --reapply) reapply=1; shift ;;
    --rewrite-nginx) rewrite_nginx=1; shift ;;
    --no-start) start=0; shift ;;
    --dry-run) dry_run=1; shift ;;
    -h | --help) usage; exit 0 ;;
    *) usage >&2; die "unknown argument: $1" ;;
  esac
done
[[ -n $from || ! -d $repo/payload ]] || from=$repo/payload
[[ -n $from ]] || { usage >&2; die "--from is required"; }
[[ $port =~ ^[0-9]+$ && $http_port =~ ^[0-9]+$ ]] || die "ports must be numbers"
[[ $server_name =~ ^[A-Za-z0-9._*-]+$ ]] || die "--server-name may only hold letters, digits, . _ * -"
api_env=$STAGING/etc/samtek/api/api.env
mosquitto_env=$STAGING/etc/samtek/mosquitto/client.env
first_install=0

preflight() {
  [[ $(uname -s) == Linux && $(uname -m) == x86_64 ]] || die "Linux x86_64 only"
  require_root
  command -v systemctl >/dev/null || [[ -n $STAGING ]] || die "systemd is required"
  [[ -x $from/bin/node && -f $from/app/server.js ]] || die "$from has no bin/node and app/server.js"
  if [[ -z $version ]]; then
    [[ -f $repo/VERSION ]] || die "--version is required outside a package"
    version=$(<"$repo/VERSION")
  fi
  [[ $version =~ ^[A-Za-z0-9._-]+$ ]] || die "--version may only hold letters, digits, . _ -"
  if [[ ! -L $PREFIX/current ]] && port_in_use "$port"; then
    die "port $port is already in use: choose another with --port"
  fi
  if ((use_nginx)); then
    if ! command -v nginx >/dev/null && [[ -z $STAGING ]]; then
      ((install_deps)) || die "nginx is missing: apt-get install nginx (or --install-deps, or --no-nginx)"
      run env DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends nginx
    fi
    if { [[ ! -e $NGINX_CONF ]] || ((rewrite_nginx)); } && port_in_use "$http_port"; then
      local owner
      owner=$(listener_process "$http_port")
      if [[ $owner != nginx ]]; then
        die "port $http_port is used by ${owner:-another service}, not nginx: choose another with --http-port, or free it"
      fi
    fi
  fi
}

ensure_user() {
  [[ -z $STAGING ]] || return 0
  if ! id "$SERVICE_USER" >/dev/null 2>&1; then
    note "creating system user $SERVICE_USER"
    run useradd --system --home-dir "$DATA" --shell /usr/sbin/nologin "$SERVICE_USER"
  fi
}

ensure_dirs() {
  run install -d -m 0755 "$PREFIX" "$PREFIX/releases" "$BACKUP"
  if [[ -n $STAGING ]]; then
    run install -d -m 0750 "$CONF" "$DATA" "$DATA/cache"
  else
    run install -d -m 0755 /etc/samtek /var/lib/samtek
    run install -d -m 0750 -o root -g "$SERVICE_USER" "$CONF"
    run install -d -m 0750 -o "$SERVICE_USER" -g "$SERVICE_USER" "$DATA" "$DATA/cache"
  fi
}

fresh_app=0

install_release() {
  local release=$PREFIX/releases/$version
  if [[ -d $release ]] && ((! reapply)); then
    note "release $version already present, files kept"
    return
  fi
  note "copying release $version"
  run install -d -m 0755 "$release/bin"
  run install -m 0755 "$from/bin/node" "$release/bin/node"
  run rm -rf -- "${release:?}/app"
  run cp -a "$from/app" "$release/app"
  run ln -sfn "$DATA/cache" "$release/app/.next/cache"
  [[ -n $STAGING ]] || run chown -R root:root "$release"
  fresh_app=1
}

detect_host() {
  local address
  address=$(hostname -I 2>/dev/null | awk '{print $1}')
  printf '%s' "${address:-localhost}"
}

write_env() {
  if [[ -e $ENVFILE ]]; then
    note "$ENVFILE exists, not touched"
    local key missing=()
    while IFS= read -r key; do
      grep -q "^${key}=" "$ENVFILE" "$PUBLICENV" 2>/dev/null || missing+=("$key")
    done < <(grep -oE '^[A-Z][A-Z0-9_]+' "$repo/.env.example" 2>/dev/null)
    ((${#missing[@]} == 0)) || note "keys in .env.example but in neither file: ${missing[*]}"
    return
  fi
  first_install=1
  if [[ -z $api_url && -f $api_env ]]; then
    local api_host api_port
    api_host=$(file_value "$api_env" LISTEN_HOST); api_host=${api_host:-127.0.0.1}
    [[ $api_host == 0.0.0.0 ]] && api_host=127.0.0.1
    api_port=$(file_value "$api_env" PORT)
    [[ -z $api_port ]] || api_url=http://$api_host:$api_port
  fi
  [[ -n $api_url ]] || die "the API address is unknown: pass --api-url (no samtek-api found on this machine)"
  if [[ -z $public_url ]]; then
    public_url=http://$(detect_host)
    [[ $http_port == 80 ]] || public_url=$public_url:$http_port
  fi
  local secure=false
  [[ $public_url == https://* ]] && secure=true
  note "writing $ENVFILE (API $api_url, public $public_url)"
  if ((dry_run)); then
    printf '  [dry-run] create %s and %s\n' "$ENVFILE" "$PUBLICENV"
    return
  fi
  umask 0137
  cat >"$ENVFILE" <<ENV
NODE_ENV=production
HOSTNAME=127.0.0.1
PORT=$port
DATA_SOURCE=live
CENTRAL_API_URL=$api_url
EDGE_TIMEOUT_MS=8000
COOKIE_SECURE=$secure
MAP_MATCHING_URL=
ENV
  local ws_url="" mqtt_user="" mqtt_pass=""
  if [[ -z $mqtt_ws && -f $mosquitto_env ]]; then
    local ws_host ws_port
    ws_host=$(file_value "$mosquitto_env" MQTT_WS_HOST); ws_host=${ws_host:-127.0.0.1}
    ws_port=$(file_value "$mosquitto_env" MQTT_WS_PORT)
    [[ -z $ws_port ]] || mqtt_ws=$ws_host:$ws_port
    mqtt_user=$(file_value "$mosquitto_env" MQTT_USERNAME)
    mqtt_pass=$(file_value "$mosquitto_env" MQTT_PASSWORD)
  fi
  if [[ -n $mqtt_ws ]]; then
    ws_url=${public_url/#http/ws}/mqtt
  fi
  cat >"$PUBLICENV" <<ENV
NEXT_PUBLIC_MQTT_WS_URL=$ws_url
NEXT_PUBLIC_MQTT_USERNAME=$mqtt_user
NEXT_PUBLIC_MQTT_PASSWORD=$mqtt_pass
NEXT_PUBLIC_SCAN_LOGINS=
ENV
  umask 0022
  chmod 0640 "$ENVFILE" "$PUBLICENV"
  [[ -n $STAGING ]] || chown "root:$SERVICE_USER" "$ENVFILE" "$PUBLICENV"
}

apply_public_values() {
  ((fresh_app)) || return 0
  note "writing the browser values into the app"
  ((dry_run)) && { printf '  [dry-run] node apply-public-env.mjs --apply\n'; return; }
  "$PREFIX/releases/$version/bin/node" "$here/apply-public-env.mjs" --apply "$PREFIX/releases/$version/app" "$PUBLICENV" >/dev/null
}

nginx_upstream() {
  if [[ -n $mqtt_ws ]]; then
    printf '%s' "$mqtt_ws"
  elif [[ -f $mosquitto_env ]]; then
    local host port
    host=$(file_value "$mosquitto_env" MQTT_WS_HOST); port=$(file_value "$mosquitto_env" MQTT_WS_PORT)
    [[ -z $port ]] || printf '%s:%s' "${host:-127.0.0.1}" "$port"
  fi
}

install_nginx() {
  ((use_nginx)) || return 0
  if [[ -e $NGINX_CONF ]] && ! grep -q "^${MARKER}" "$NGINX_CONF"; then
    die "$NGINX_CONF exists and was not made by this installer"
  fi
  if [[ -e $NGINX_CONF ]] && ((! rewrite_nginx)); then
    note "$NGINX_CONF exists, not touched (--rewrite-nginx writes it again)"
    return
  fi
  local upstream block="" default_server=""
  upstream=$(nginx_upstream)
  if [[ -n $upstream ]]; then
    block=$(cat <<BLOCK

  location = /mqtt {
    proxy_pass http://$upstream/;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
  }
BLOCK
)
  fi
  [[ $server_name == _ ]] && default_server=" default_server"
  note "writing $NGINX_CONF${upstream:+ (/mqtt -> $upstream)}"
  if ((dry_run)); then
    printf '  [dry-run] write %s and reload nginx\n' "$NGINX_CONF"
    return
  fi
  install -d -m 0755 "$(dirname "$NGINX_CONF")"
  local text
  text=$(<"$here/samtek-vms.nginx.conf")
  text=${text//@HTTP_PORT@/$http_port}
  text=${text//@DEFAULT_SERVER@/$default_server}
  text=${text//@SERVER_NAME@/$server_name}
  text=${text//@VMS_PORT@/$port}
  text=${text//@MQTT_BLOCK@/$block}
  printf '%s\n' "$text" >"$NGINX_CONF"
  [[ -z $STAGING ]] || { note "staging: nginx not reloaded"; return; }
  local stock=/etc/nginx/sites-enabled/default
  if [[ -L $stock && $server_name == _ ]]; then
    if ((disable_default_site)) || ! dpkg -V nginx-common 2>/dev/null | grep -q '/etc/nginx/sites-available/default'; then
      note "removing the stock nginx site $stock, which holds default_server (the file stays in sites-available)"
      rm -f "$stock"
    fi
  elif ((disable_default_site)) && [[ -L $stock ]]; then
    note "removing the stock site $stock (kept in sites-available)"
    rm -f "$stock"
  fi
  if ! nginx -t >/dev/null 2>&1; then
    nginx -t >&2 || true
    rm -f "$NGINX_CONF"
    die "nginx -t failed with the new site (another default_server on port $http_port? try --disable-default-site or --server-name), the site was removed"
  fi
  systemctl enable nginx >/dev/null 2>&1 || true
  systemctl reload nginx 2>/dev/null || systemctl start nginx
}

install_unit() {
  if [[ -e $UNIT ]] && ! grep -q "^${MARKER}" "$UNIT"; then
    note "replacing a unit not made by this installer: $UNIT (kept in $BACKUP)"
    run cp -a "$UNIT" "$BACKUP/$(basename "$UNIT").$(date +%Y%m%d%H%M%S)"
  fi
  [[ -z $STAGING ]] || run install -d -m 0755 "$(dirname "$UNIT")"
  run install -m 0644 "$here/samtek-vms.service" "$UNIT"
  [[ -n $STAGING ]] || run systemctl daemon-reload
}

activate() {
  run ln -sfn "$PREFIX/releases/$version" "$PREFIX/current.new"
  run mv -T "$PREFIX/current.new" "$PREFIX/current"
  [[ -z $STAGING ]] || { note "staging: systemd not touched"; return; }
  run systemctl enable "$SERVICE"
  if ((start)); then
    run systemctl restart "$SERVICE"
  else
    note "not started (--no-start)"
  fi
}

preflight
ensure_user
ensure_dirs
install_release
write_env
apply_public_values
install_nginx
install_unit
activate
note "done: release $version. Open the VMS at the public address; verify with deploy/verify.sh"
