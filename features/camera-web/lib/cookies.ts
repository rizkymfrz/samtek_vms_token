const OWN = new Set([
  "access_token",
  "refresh_token",
  "remember_me",
  "sidebar_state",
]);

const SCOPE = /^\s*(domain|path|secure|samesite)\b/i;
const nameOf = (cookie: string) => cookie.split("=")[0].trim();

export const cameraCookies = (header: string | null) => {
  const kept = (header ?? "")
    .split(";")
    .filter((cookie) => cookie.trim() !== "" && !OWN.has(nameOf(cookie)));
  return kept.length > 0
    ? kept.map((cookie) => cookie.trim()).join("; ")
    : null;
};

export const scopeSetCookie = (value: string, prefix: string) => {
  const [pair, ...attributes] = value.split(";");
  if (OWN.has(nameOf(pair))) return null;
  const kept = attributes.filter((attribute) => !SCOPE.test(attribute));
  return [
    pair.trim(),
    ...kept.map((a) => a.trim()),
    `Path=${prefix}`,
    "SameSite=Lax",
  ].join("; ");
};
