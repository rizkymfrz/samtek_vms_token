export const SCAN_LOGINS = (process.env.NEXT_PUBLIC_SCAN_LOGINS ?? "")
  .split(",")
  .map((login) => login.trim())
  .filter(Boolean)
  .join("\n");
