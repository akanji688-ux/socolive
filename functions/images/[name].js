export async function onRequestGet({ params, env }) {
  const { name } = params;
  const obj = await env.IMAGES.get(name);
  if (!obj) return new Response('Not Found', { status: 404 });

  const ext = name.split('.').pop()?.toLowerCase();
  const types = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp' };
  const contentType = types[ext] || obj.httpMetadata?.contentType || 'application/octet-stream';

  return new Response(obj.body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
