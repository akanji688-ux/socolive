// Catch-all: phục vụ index.html cho / và page.html cho các dynamic routes
export async function onRequest({ request, env }) {
    const url = new URL(request.url);
    const pathname = url.pathname;

  // Root "/" → phục vụ index.html trực tiếp (tránh để ASSETS tự redirect)
  if (pathname === '/' || pathname === '') {
        const res = await env.ASSETS.fetch(
                new Request(new URL('/index.html', url.origin), { headers: request.headers })
              );
        return new Response(res.body, { status: 200, headers: res.headers });
  }

  // Thử phục vụ asset tĩnh (CSS, JS, images, v.v.) — chỉ lấy 200
  try {
        const res = await env.ASSETS.fetch(request);
        if (res.status === 200) return res;
  } catch {}

  // Dynamic routes (/live, /vip, /contact, v.v.) → nội dung page.html
  const res = await env.ASSETS.fetch(
        new Request(new URL('/page', url.origin), { headers: request.headers })
      );
    return new Response(res.body, { status: 200, headers: res.headers });
}
