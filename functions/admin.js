// Dedicated handler for /admin — serves public/admin/index.html
// Takes precedence over [[path]].js catch-all
export async function onRequest({ request, env }) {
    const url = new URL(request.url);
    try {
          const res = await env.ASSETS.fetch(
                  new Request(new URL('/admin/index.html', url.origin), { headers: request.headers })
                );
          return new Response(res.body, { status: 200, headers: res.headers });
    } catch {
          return new Response('Admin panel not found', { status: 404 });
    }
}
