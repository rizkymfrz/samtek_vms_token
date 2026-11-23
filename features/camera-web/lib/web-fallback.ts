const WEB_PAGE = /^\/api\/cameras\/(\d+)\/web(?:\/|$)/;
const APP_PATHS = ["/_next/", "/api/"];

export const webFallbackPath = (pathname: string, referer: string | null) => {
  if (!referer || APP_PATHS.some((path) => pathname.startsWith(path))) {
    return null;
  }
  let page: string;
  try {
    page = new URL(referer).pathname;
  } catch {
    return null;
  }
  const id = WEB_PAGE.exec(page)?.[1];
  return id ? `/api/cameras/${id}/web${pathname}` : null;
};
