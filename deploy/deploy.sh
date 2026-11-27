#!/usr/bin/env bash
set -euo pipefail

here=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
repo=$(dirname "$here")
self=$here/deploy.sh
dry_run=0
work=""
readonly STAGING=${SAMTEK_ROOT:-}
readonly SERVICE=samtek-vms-new
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
readonly SETTLE_SECONDS=${SAMTEK_VERIFY_SETTLE_SECONDS:-20}
readonly DEFAULT_PORT=7300
readonly DEFAULT_HTTP_PORT=80

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
  { grep -E "^$2=" "$1" 2>/dev/null || true; } | tail -n1 | cut -d= -f2-
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

usage() {
  cat <<USAGE
Usage: deploy/deploy.sh <command> [options]

Commands
  package    build the release package (tarball)          desktop    build the desktop app (AppImage, deb)
  install    install a package on this machine            upgrade    switch to a new package, verify, roll back on failure
  uninstall  remove the installation                      verify     read-only check of the installation

package [--out <dir>] [--version <name>] [--worktree]
  --out       where the tarball goes, default dist-package/
  --version   default: git describe (--dirty marks uncommitted changes)
  --worktree  build the working tree (with uncommitted changes) instead of HEAD
  Needs node_modules in the repo (npm install) and Node 20 or newer on this machine; the Node binary
  that builds is the one shipped. The NEXT_PUBLIC_* values are built in as placeholders and written
  at install time, so one package serves every installation.

desktop [--out <dir>] [--version <name>] [--public-env <file>] [--worktree] [-- <electron-builder args>]
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

sudo deploy/deploy.sh install [options]
  --from <folder>         payload/ of an extracted package (bin/node and app/); default: payload/
  --version <name>        release name; default: VERSION of the package
  --port <n>              port of the Node server, default $DEFAULT_PORT (127.0.0.1 only)
  --http-port <n>         port of the nginx site, default $DEFAULT_HTTP_PORT
  --server-name <name>    nginx server_name, default _ (answers every host)
  --public-url <url>      what the browsers use, e.g. https://vms.example.com; default: http://<ip of
                          this machine>[:http-port]. The browser MQTT address is built from it.
  --api-url <url>         the API the server calls; default: the samtek-api of this machine, else asked
  --scan-logins <list>    user:password pairs, comma separated (at most 8), the camera scan tries; the
                          browser receives them, so they are visible to anyone who opens the site; default: NEXT_PUBLIC_SCAN_LOGINS
                          of the .env.example inside the package, else none
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

sudo deploy/deploy.sh upgrade [--from <folder>] [--version <name>] [--keep N] [--no-verify] [--dry-run]
  Run it from the new package. The browser values are taken again from $PUBLICENV.
  --keep N     releases to keep, default 3 (the active and the previous are always kept)
  --no-verify  skip verify and therefore the automatic rollback

sudo deploy/deploy.sh uninstall [--purge-config] [--purge-data] [--dry-run]
  (default)       stop and disable the service; remove the unit, the nginx site and $PREFIX
  --purge-config  also remove $CONF (vms.env and public.env)
  --purge-data    also remove $DATA (the Next.js cache); asks you to type a phrase
  Backups in $BACKUP and the user $SERVICE_USER are never removed. nginx itself stays.

sudo deploy/deploy.sh verify
  Read-only check of the release, the config, the service and the network.
USAGE
}

public_env() {
  local node=$1
  shift
  "$node" --input-type=module - "$@" <<'JS'
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const placeholders = {
  NEXT_PUBLIC_MQTT_WS_URL: "ws://samtek-placeholder.invalid/mqtt-ws-url",
  NEXT_PUBLIC_MQTT_USERNAME: "samtek-placeholder-mqtt-username",
  NEXT_PUBLIC_MQTT_PASSWORD: "samtek-placeholder-mqtt-password",
  NEXT_PUBLIC_SCAN_LOGINS: "samtek-placeholder-scan-logins",
};

const textExtensions = new Set([
  ".js",
  ".mjs",
  ".cjs",
  ".html",
  ".rsc",
  ".json",
  ".body",
  ".txt",
]);

const walk = (directory, visit) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(path, visit);
    } else if (
      entry.isFile() &&
      textExtensions.has(path.slice(path.lastIndexOf(".")))
    ) {
      visit(path);
    }
  }
};

const readValues = (file) => {
  const values = {};
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (match) values[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return values;
};

const escapeForJavaScriptString = (value) => {
  return JSON.stringify(value).slice(1, -1);
};

const [command, argument, valuesFile] = process.argv.slice(2);

if (command === "--print-build-env") {
  for (const [key, token] of Object.entries(placeholders))
    console.log(`${key}=${token}`);
} else if (command === "--check") {
  const left = Object.fromEntries(
    Object.keys(placeholders).map((key) => [key, 0]),
  );
  walk(argument, (path) => {
    const text = readFileSync(path, "utf8");
    for (const [key, token] of Object.entries(placeholders))
      if (text.includes(token)) left[key] += 1;
  });
  const remaining = Object.entries(left).filter(([, count]) => count > 0);
  for (const [key, count] of remaining)
    console.error(`${key}: placeholder still in ${count} file(s)`);
  process.exit(remaining.length > 0 ? 1 : 0);
} else if (command === "--require") {
  const found = Object.fromEntries(
    Object.keys(placeholders).map((key) => [key, 0]),
  );
  walk(argument, (path) => {
    const text = readFileSync(path, "utf8");
    for (const [key, token] of Object.entries(placeholders))
      if (text.includes(token)) found[key] += 1;
  });
  const missing = Object.entries(found).filter(([, count]) => count === 0);
  for (const [key] of missing)
    console.error(`${key}: the placeholder is not in the build`);
  process.exit(missing.length > 0 ? 1 : 0);
} else if (command === "--apply") {
  const values = readValues(valuesFile);
  const found = Object.fromEntries(
    Object.keys(placeholders).map((key) => [key, 0]),
  );
  walk(argument, (path) => {
    const text = readFileSync(path, "utf8");
    let changed = text;
    for (const [key, token] of Object.entries(placeholders)) {
      if (!changed.includes(token)) continue;
      found[key] += 1;
      changed = changed
        .split(token)
        .join(escapeForJavaScriptString(values[key] ?? ""));
    }
    if (changed !== text) writeFileSync(path, changed);
  });
  const missing = Object.entries(found).filter(([, count]) => count === 0);
  for (const [key, count] of Object.entries(found))
    console.log(`${key}: ${count} file(s)`);
  for (const [key] of missing)
    console.error(
      `warning: ${key} placeholder not found: the build no longer reads it`,
    );
  process.exit(0);
} else {
  console.error(
    "usage: public_env --print-build-env | --require <dir> | --check <dir> | --apply <dir> <public.env>",
  );
  process.exit(2);
}
JS
}

prepare_source() {
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
  (cd "$src" && node scripts/dev.mjs worker >/dev/null)
  note "building (Next.js, standalone)"
}

build_next() {
  (cd "$src" && env SAMTEK_STANDALONE=1 "${build_env[@]}" npx next build >"$work/build.log" 2>&1) \
    || { tail -n 30 "$work/build.log" >&2; die "next build failed"; }
  [[ -f $src/.next/standalone/server.js ]] || die "the build made no standalone server.js (is SAMTEK_STANDALONE read by next.config.ts?)"
}

cmd_package() {
  local out=$repo/dist-package version="" worktree=0 src line
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
  trap '[[ -z $work ]] || rm -rf "$work"' EXIT
  prepare_source
  local -a build_env=()
  while IFS= read -r line; do build_env+=("$line"); done < <(public_env node --print-build-env)
  build_next
  local name=samtek-vms-$version-linux-x86_64 root script
  root=$work/$name
  mkdir -p "$root/payload/bin" "$root/deploy"
  cp -a "$src/.next/standalone" "$root/payload/app"
  mkdir -p "$root/payload/app/.next"
  cp -a "$src/.next/static" "$root/payload/app/.next/static"
  [[ ! -d $src/public ]] || cp -a "$src/public" "$root/payload/app/public"
  rm -rf "$root/payload/app/.next/cache"
  cp -a "$(command -v node)" "$root/payload/bin/node"
  for script in deploy.sh samtek-vms-new.service samtek-vms.nginx.conf; do
    cp -a "$here/$script" "$root/deploy/"
  done
  cp -a "$repo/.env.example" "$root/"
  printf '%s' "$version" >"$root/VERSION"
  note "checking the placeholders are in the build"
  public_env node --require "$root/payload/app" || die "a NEXT_PUBLIC placeholder is not in the build: the VMS no longer reads it"
  (cd "$root" && find . -type f ! -name SHA256SUMS -print0 | sort -z | xargs -0 sha256sum >SHA256SUMS)
  mkdir -p "$out"
  local tarball=$out/$name.tar.gz
  tar --owner=0 --group=0 --numeric-owner -C "$work" -czf "$tarball" "$name"
  (cd "$out" && sha256sum "$name.tar.gz" >"$name.tar.gz.sha256")
  note "wrote $tarball ($(du -h "$tarball" | cut -f1))"
}

cmd_desktop() {
  local out=$repo/dist-package version="" public_env_file="" worktree=0 src line
  while (($#)); do
    case $1 in
      --out) out=${2:-}; shift 2 ;;
      --version) version=${2:-}; shift 2 ;;
      --public-env) public_env_file=${2:-}; shift 2 ;;
      --worktree) worktree=1; shift ;;
      -h | --help) usage; exit 0 ;;
      --) shift; break ;;
      *) usage >&2; die "unknown argument: $1" ;;
    esac
  done
  local -a builder_args=("$@")
  ((${#builder_args[@]})) || builder_args=(--linux)
  [[ -d $repo/node_modules/electron && -d $repo/node_modules/electron-builder ]] || die "electron and electron-builder are missing: run npm install"
  command -v node >/dev/null || die "node is required"
  [[ -z $public_env_file || -f $public_env_file ]] || die "$public_env_file not found"
  [[ -n $version ]] || version=$(git -C "$repo" describe --always --dirty 2>/dev/null || date +%Y%m%d%H%M%S)
  [[ $version =~ ^[A-Za-z0-9._-]+$ ]] || die "--version may only hold letters, digits, . _ -"
  work=$(mktemp -d)
  trap '[[ -z $work ]] || rm -rf "$work"' EXIT
  prepare_source
  local -a build_env=()
  if [[ -n $public_env_file ]]; then
    while IFS= read -r line; do build_env+=("$line"); done < <(grep -E '^NEXT_PUBLIC_[A-Z0-9_]+=' "$public_env_file" || true)
  fi
  build_next
  local stage=$src/desktop-stage
  cp -a "$src/.next/standalone" "$stage"
  mkdir -p "$stage/.next"
  cp -a "$src/.next/static" "$stage/.next/static"
  [[ ! -d $src/public ]] || cp -a "$src/public" "$stage/public"
  rm -rf "$stage/.next/cache"
  note "packing (electron-builder ${builder_args[*]})"
  mkdir -p "$out"
  (cd "$src" && env SAMTEK_DESKTOP_VERSION="$version" SAMTEK_DESKTOP_STAGE=desktop-stage SAMTEK_DESKTOP_OUT="$work/out" \
    npx electron-builder --config deploy/electron-builder.json --publish never "${builder_args[@]}" >"$work/builder.log" 2>&1) \
    || { tail -n 30 "$work/builder.log" >&2; die "electron-builder failed"; }
  local built=0 file
  for file in "$work"/out/samtek-vms-desktop-*; do
    [[ -f $file ]] || continue
    cp -a "$file" "$out/"
    (cd "$out" && sha256sum "$(basename "$file")" >"$(basename "$file").sha256")
    note "wrote $out/$(basename "$file") ($(du -h "$file" | cut -f1))"
    built=1
  done
  ((built)) || die "electron-builder made no installer"
}

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

install_release() {
  local release=$PREFIX/releases/$version
  if [[ -d $release ]] && ((! reapply)); then
    note "release $version already present, files kept"
    return
  fi
  note "copying release $version"
  local partial=$release.partial
  run rm -rf -- "${partial:?}" "${release:?}"
  run install -d -m 0755 "$partial/bin"
  run install -m 0755 "$from/bin/node" "$partial/bin/node"
  run cp -a "$from/app" "$partial/app"
  run ln -sfn "$DATA/cache" "$partial/app/.next/cache"
  [[ -n $STAGING ]] || run chown -R root:root "$partial"
  run mv -T "$partial" "$release"
  fresh_app=1
}

detect_host() {
  local address
  address=$(hostname -I 2>/dev/null | awk '{print $1}')
  printf '%s' "${address:-localhost}"
}

check_scan_logins() {
  [[ -z $scan_logins || $scan_logins =~ ^[^:,[:space:]]+:[^,[:space:]]+(,[^:,[:space:]]+:[^,[:space:]]+){0,7}$ ]] || die "the scan logins are user:password pairs separated by commas, at most 8, without spaces"
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
    local api_port
    api_port=$(file_value "$api_env" PORT)
    [[ -z $api_port ]] || api_url=http://127.0.0.1:$api_port
  fi
  [[ -n $api_url ]] || die "the API address is unknown: pass --api-url (no samtek-api found on this machine)"
  if [[ -z $public_url ]]; then
    public_url=http://$(detect_host)
    [[ $http_port == 80 ]] || public_url=$public_url:$http_port
  fi
  local secure=false
  [[ $public_url == https://* ]] && secure=true
  [[ -n $scan_logins ]] || scan_logins=$(file_value "$repo/.env.example" NEXT_PUBLIC_SCAN_LOGINS)
  check_scan_logins
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
NEXT_PUBLIC_SCAN_LOGINS=$scan_logins
ENV
  umask 0022
  chmod 0640 "$ENVFILE" "$PUBLICENV"
  [[ -n $STAGING ]] || chown "root:$SERVICE_USER" "$ENVFILE" "$PUBLICENV"
}

apply_public_values() {
  local node=$PREFIX/releases/$version/bin/node app=$PREFIX/releases/$version/app
  ((fresh_app)) || ! [[ -x $node ]] || ! public_env "$node" --check "$app" >/dev/null 2>&1 || return 0
  note "writing the browser values into the app"
  ((dry_run)) && { printf '  [dry-run] write the browser values into the app\n'; return; }
  public_env "$PREFIX/releases/$version/bin/node" --apply "$PREFIX/releases/$version/app" "$PUBLICENV" >/dev/null
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
  run install -m 0644 "$here/samtek-vms-new.service" "$UNIT"
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


cmd_install() {
  local from="" version="" start=1 reapply=0 rewrite_nginx=0
  local port=$DEFAULT_PORT http_port=$DEFAULT_HTTP_PORT server_name=_ public_url="" api_url="" mqtt_ws="" scan_logins=""
  local use_nginx=1 install_deps=0 disable_default_site=0
  local api_env=$STAGING/etc/samtek/api/api.env
  local mosquitto_env=$STAGING/etc/samtek/mosquitto/client.env
  local first_install=0 fresh_app=0
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
      --scan-logins) scan_logins=${2:-}; shift 2 ;;
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
  check_scan_logins
  [[ $server_name =~ ^[A-Za-z0-9._*-]+$ ]] || die "--server-name may only hold letters, digits, . _ * -"
  preflight
  ensure_user
  ensure_dirs
  install_release
  write_env
  apply_public_values
  install_nginx
  install_unit
  activate
  note "done: release $version. Open the VMS at the public address; verify with deploy/deploy.sh verify"
}

service_stop() {
  [[ -z $STAGING ]] || { note "staging: service stop skipped"; return 0; }
  run systemctl stop "$SERVICE"
}
service_start() {
  [[ -z $STAGING ]] || { note "staging: service start skipped"; return 0; }
  run systemctl start "$SERVICE"
}

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

cmd_upgrade() {
  local keep=3 verify=1 from="" version=""
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
  [[ -L $PREFIX/current ]] || die "nothing installed at $PREFIX (use deploy.sh install first)"
  local previous
  previous=$(current_release)
  [[ -d $previous ]] || die "current release $previous is missing: the install is broken, repair it with deploy/deploy.sh install from the new package"
  if [[ -z $version ]]; then
    [[ -f $repo/VERSION ]] || die "--version is required outside a package"
    version=$(<"$repo/VERSION")
  fi
  [[ $(basename "$previous") != "$version" ]] || die "release $version is already the active one"
  local -a install_args=(--no-start --version "$version")
  [[ -z $from ]] || install_args+=(--from "$from")
  ((dry_run)) && install_args+=(--dry-run)
  local backup
  backup=$BACKUP/$(date +%Y%m%d-%H%M%S)
  note "upgrading $(basename "$previous") -> $version"
  service_stop
  run install -d -m 0700 "$backup"
  if ((! dry_run)); then
    cp -a "$ENVFILE" "$backup/vms.env"
    cp -a "$PUBLICENV" "$backup/public.env"
    printf '%s\n' "$(basename "$previous")" >"$backup/previous-release"
  fi
  if ! "$self" install "${install_args[@]}"; then
    ((dry_run)) || rollback
    die "install step failed"
  fi
  ((dry_run)) && { note "dry-run: stopping here"; exit 0; }
  service_start
  if ((verify)); then
    if ! "$self" verify; then
      rollback
      die "verify failed after the upgrade, rolled back to $(basename "$previous")"
    fi
  fi
  prune
  note "upgrade to $version done"
}

remove_tree() {
  case $1 in
    "$PREFIX" | "$CONF" | "$DATA") ;;
    *) die "refusing to remove $1" ;;
  esac
  [[ -e $1 || -L $1 ]] || return 0
  note "removing $1"
  run rm -rf -- "$1"
}

cmd_uninstall() {
  local purge_config=0 purge_data=0 answer
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
}

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
  if public_env "$release/bin/node" --check "$release/app" 2>/dev/null; then
    pass "the browser values are written into the app (no placeholder left)"
  else
    fail "placeholders are still in the app: run deploy/deploy.sh install --reapply"
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

cmd_verify() {
  local failed=0
  set +e
  if [[ -z $STAGING && $EUID -ne 0 ]]; then
    echo "verify: run as root (sudo): $CONF is not readable otherwise" >&2
    exit 2
  fi
  check_release
  check_config
  check_service
  check_network
  if ((failed)); then echo "verify: FAILED"; return 1; fi
  echo "verify: ok"
}

main() {
  local command=${1:-}
  [[ -n $command ]] || { usage >&2; exit 1; }
  shift
  case $command in
    package) cmd_package "$@" ;;
    desktop) cmd_desktop "$@" ;;
    install) cmd_install "$@" ;;
    upgrade) cmd_upgrade "$@" ;;
    uninstall) cmd_uninstall "$@" ;;
    verify) cmd_verify "$@" ;;
    -h | --help) usage ;;
    *) usage >&2; die "unknown command: $command" ;;
  esac
}

main "$@"
