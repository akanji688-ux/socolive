// Handles /:slug - single-segment dynamic routes like /live, /vip, /contact
// Does NOT match / (root), /api/*, /images/* - those have dedicated handlers
export async function onRequest({ request, env, params }) {
      const { slug } = params;

  // Guard: root path with empty slug - pass through to static index.html
  if (!slug) {
          return env.ASSETS.fetch(request);
  }

  // Static files (.css, .js, .png, etc.) - serve directly from ASSETS
  if (slug.includes('.')) {
          try {
                    return await env.ASSETS.fetch(request);
          } catch {
                    return new Response('Not Found', { status: 404 });
          }
  }

  // Dynamic route - serve page.html content, URL stays as-is
  const url = new URL(request.url);
      try {
              const res = await env.ASSETS.fetch(
                        new Request(new URL('/page', url.origin), { headers: request.headers })
                      );
              return new Response(res.body, { status: 200, headers: res.headers });
      } catch {
              return new Response('Error', { status: 500 });
      }
}
