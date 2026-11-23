export type Login = { user: string; password: string };

const PASSWORD_FIELD = /<input[^>]+type\s*=\s*["']?password/i;
const RETRY_GUARD_MS = 30_000;
export const hasPasswordField = (html: string) => PASSWORD_FIELD.test(html);
const LINE_SEPARATOR = new RegExp(String.fromCharCode(0x2028), "g");
const PARAGRAPH_SEPARATOR = new RegExp(String.fromCharCode(0x2029), "g");

const safeJson = (value: unknown) =>
  JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(LINE_SEPARATOR, "\\u2028")
    .replace(PARAGRAPH_SEPARATOR, "\\u2029");

export const autofillScript = (login: Login) =>
  `<script>(function(c,g){var n=0;(function t(){var p=document.querySelector("input[type=password]");var u=document.getElementById("userName")||document.querySelector("input[type=text]");if(!p||!u||!p.offsetParent){if(n++<150)setTimeout(t,100);return}setTimeout(function(){var s=function(e,v){e.value=v;e.dispatchEvent(new Event("input",{bubbles:true}));e.dispatchEvent(new Event("change",{bubbles:true}))};s(u,c.user);s(p,c.password);var k="camera_web_login",l=0;try{l=+sessionStorage.getItem(k)||0}catch(e){}if(Date.now()-l<g)return;try{sessionStorage.setItem(k,String(Date.now()))}catch(e){}var b=document.getElementById("login")||document.querySelector("[type=submit]");if(b)b.click()},300)})()})(${safeJson(login)},${RETRY_GUARD_MS})</script>`;
