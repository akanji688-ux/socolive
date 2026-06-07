import { json, handleOptions, getConfig, saveConfig } from '../../_lib.js';

// Convert ArrayBuffer → base64 (chunked to avoid call stack overflow)
function bufToBase64(buf) {
  const bytes = new Uint8Array(buf);
  let str = '';
  for (let i = 0; i < bytes.length; i += 8192) {
    str += String.fromCharCode(...bytes.subarray(i, i + 8192));
  }
  return btoa(str);
}

// Upload ảnh — lưu vào D1 (không cần R2), hiện ngay không cần deploy
export async function onRequestPost({ params, request, env }) {
  const { name } = params;
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file) return json({ success: false, error: 'Không có file' }, 400);
  if (file.size > 2 * 1024 * 1024) return json({ success: false, error: 'File quá lớn (tối đa 2MB)' }, 400);

  const ext = name.split('.').pop()?.toLowerCase();
  const allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  if (!allowed.includes(ext)) return json({ success: false, error: 'Chỉ hỗ trợ JPG, PNG, GIF, WebP, SVG' }, 400);

  const types = { jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', gif:'image/gif', webp:'image/webp', svg:'image/svg+xml' };
  const contentType = types[ext] || file.type || 'application/octet-stream';
  const arrayBuffer = await file.arrayBuffer();

  // Try R2 first if configured, otherwise use D1
  if (env.IMAGES) {
    await env.IMAGES.put(name, arrayBuffer, { httpMetadata: { contentType } });
  } else if (env.DB) {
    const b64 = bufToBase64(arrayBuffer);
    await env.DB.prepare(
      'CREATE TABLE IF NOT EXISTS images (name TEXT PRIMARY KEY, data TEXT NOT NULL, ct TEXT NOT NULL)'
    ).run();
    await env.DB.prepare(
      'INSERT OR REPLACE INTO images (name, data, ct) VALUES (?, ?, ?)'
    ).bind(name, b64, contentType).run();
  } else {
    return json({ success: false, error: 'Không cö storage. Liên hệ admin.' }, 503);
  }

  try {
    const cfg = await getConfig(env.DB);
    if (name.startsWith('logo')) cfg.site.logoImage = name;
    if (name.startsWith('bg'))   cfg.site.bgImage   = name;
    await saveConfig(env.DB, cfg);
  } catch(e) { /* optional */ }

  return json({ success: true, filename: name, url: `/images/${name}`, note: 'ảnh đã lưu!' });
}

export async function onRequestOptions() {
  return handleOptions();
}
