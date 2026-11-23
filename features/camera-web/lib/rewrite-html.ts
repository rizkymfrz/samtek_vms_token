import { autofillScript, hasPasswordField, type Login } from "./autofill";

const ROOT_ATTRIBUTE = /(\s(?:href|src|action|poster)\s*=\s*["'])\/(?!\/)/gi;

const PARENT_ATTRIBUTE =
  /(\s(?:href|src|action|poster)\s*=\s*["']\s*)((?:\.\.\/)+)/gi;

const TOP =
  /(?<![\w$.'"])window\.top(?![\w$])|(?<![\w$.'"])top(?=\.[A-Za-z_$]|\[|\s*[!=]==?\s*(?:self|window)\b)|(?<=\b(?:self|window)\s*[!=]==?\s*)top(?![\w$.:'"])/g;

export const rewriteTop = (source: string) =>
  source.replace(TOP, "window.__camTop");

const HOST =
  /(?<!"\/\/"\+)(?<![\w$.'"])window\.location\.(?:host|hostname)(?![\w$])/g;

const PORT = /(?<![\w$.'"])window\.location\.port(?![\w$])/g;

export const rewriteHost = (source: string) =>
  source.replace(HOST, "window.__camHost").replace(PORT, "window.__camPort");

export const rewriteScript = (source: string) =>
  rewriteHost(rewriteTop(source));

const RECT = /([A-Za-z_$][\w$]*)\.getBoundingClientRect\(\)/g;
const VIEWPORT = /(?<![\w$.])window\.inner(Width|Height)(?![\w$])/g;

export const rewritePlugin = (source: string) =>
  source
    .replace(RECT, "window.__camRect($1)")
    .replace(VIEWPORT, "window.top.inner$1");

const patchScript = (prefix: string, host?: string) =>
  `<script>window.__camHost=${host ? JSON.stringify(host) : "location.host"};window.__camPort="";window.__camRect=function(e){var r=e.getBoundingClientRect(),x=0,y=0,w=window,f;try{while(w!==w.top&&(f=w.frameElement)){var b=f.getBoundingClientRect();x+=b.left+f.clientLeft;y+=b.top+f.clientTop;w=w.parent}}catch(c){}return{left:r.left+x,top:r.top+y,right:r.right+x,bottom:r.bottom+y,width:r.width,height:r.height,x:r.left+x,y:r.top+y}};window.__camTop=(function(){var w=window;try{while(w.parent!==w&&w.parent!==w.top)w=w.parent}catch(e){}return w})();(function(p){var f=function(u){if(typeof u!=="string")return u;var a;try{a=new URL(u,location.href)}catch(e){return u}if(a.origin!==location.origin||a.pathname===p||a.pathname.indexOf(p+"/")===0)return u;return p+a.pathname+a.search+a.hash};var F=window.fetch;window.fetch=function(i,o){return F.call(this,i instanceof Request?i:f(i),o)};var O=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){arguments[1]=f(u);return O.apply(this,arguments)}})(${JSON.stringify(prefix)})</script>`;

export const rewriteHtml = (
  html: string,
  prefix: string,
  {
    depth = 0,
    isRoot = false,
    login = null,
    host,
  }: {
    depth?: number;
    isRoot?: boolean;
    login?: Login | null;
    host?: string;
  } = {},
) => {
  const rewritten = rewriteScript(html)
    .replace(ROOT_ATTRIBUTE, `$1${prefix}/`)
    .replace(
      PARENT_ATTRIBUTE,
      (_, head: string, up: string) =>
        head + "../".repeat(Math.min(up.length / 3, Math.max(depth, 0))),
    );
  const injected =
    (isRoot ? `<base href="${prefix}/">` : "") +
    patchScript(prefix, host) +
    (login && hasPasswordField(rewritten) ? autofillScript(login) : "");
  const head = rewritten.search(/<head[^>]*>/i);
  if (head === -1) return injected + rewritten;
  const end = rewritten.indexOf(">", head) + 1;
  return rewritten.slice(0, end) + injected + rewritten.slice(end);
};

export const rewriteLocation = (
  location: string,
  origin: string,
  prefix: string,
) => {
  if (location.startsWith(origin))
    return prefix + location.slice(origin.length);
  return location.startsWith("/") && !location.startsWith("//")
    ? prefix + location
    : location;
};

export const looksLikeHtml = (bytes: Uint8Array) =>
  /^\s*<(!doctype|html|head|body|meta|script|frameset)/i.test(
    new TextDecoder().decode(bytes.subarray(0, 512)),
  );
