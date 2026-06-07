// Single-segment dynamic routes: /live, /vip, /contact, etc.
// Does NOT match: / (root), /api/*, /images/* (those have their own handlers)
export async function onRequest({ request, env, params }) {
    const { slug } = params;

  // Pass through static files (anything with a file extension)
  if (slug && slug.includes('.')) {
        return env.ASSETS.fetch(request);
  }

  // Serve page.html content, keeping the original URL
  const url = new URL(request.url);
    const res = await env.ASSETS.fetch(
          new Request(new URL('/page', url.origin), { headers: request.headers })
        );
    return new Response(res.body, { status: 200, headers: res.headers });
}
