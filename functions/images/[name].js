export async function onRequestGet({ params, env }) {
  const { name } = params;

  // Try R2 first if configured
  if (env.IMAGES) {
    const obj = await env.IMAGES.get(name);
    if (obj) {
      const ext = name.split('.').pop()?.toLowerCase();
      const types = { jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', gif:'image/gif', webp:'image/webp', svg:'image/svg+xml' };
      const contentType = types[ext] || obj.httpMetadata?.contentType || 'application/octet-stream';
      return new Response(obj.body, {
        headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=86400', 'Access-Control-Allow-Origin': '*' },
      });
    }
  }

  // Fallback: read from D1
  if (env.DB) {
    try {
      const row = await env.DB.prepare('SELECT data, ct FROM images WHERE name = ?').bind(name).first();
      if (row) {
        const binary = Uint8Array.from(atob(row.data), c => c.charCodeAt(0));
        return new Response(binary, {
          headers: { 'Content-Type': row.ct, 'Cache-Control': 'public, max-age=86400', 'Access-Control-Allow-Origin': '*' },
        });
      }
    } catch(e) { /* table may not exist yet */ }
  }

  return new Response('Not Found', { status: 404 });
}
