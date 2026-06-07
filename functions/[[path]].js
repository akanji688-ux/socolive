// Catch-all: phục vụ page.html cho các dynamic routes (/live, /vip, v.v.)
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Thử phục vụ asset tĩnh trước (index.html, style.css, app.js, v.v.)
  try {
    const res = await env.ASSETS.fetch(request);
    if (res.status !== 404 && res.status !== 301) return res;
  } catch {}

  // Fallback → trả về nội dung page.html với URL gốc giữ nguyên
  const pageReq = new Request(
    new URL('/page', url.origin),
    { method: request.method, headers: request.headers }
  );
  const pageRes = await env.ASSETS.fetch(pageReq);

  // Trả về response với URL không thay đổi
  return new Response(pageRes.body, {
    status: 200,
    headers: pageRes.headers,
  });
}
