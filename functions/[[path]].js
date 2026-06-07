// Catch-all: phục vụ page.html cho các dynamic routes (/live, /vip, v.v.)
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Các route có function riêng — bỏ qua (Pages tự xử lý)
  if (
    path.startsWith('/api/') ||
    path.startsWith('/images/')
  ) {
    return env.ASSETS.fetch(request);
  }

  // Thử phục vụ file tĩnh trước (index.html, style.css, app.js, v.v.)
  try {
    const res = await env.ASSETS.fetch(request);
    if (res.status !== 404) return res;
  } catch {}

  // Fallback → phục vụ page.html (SPA route)
  const pageReq = new Request(new URL('/page.html', request.url), request);
  return env.ASSETS.fetch(pageReq);
}
