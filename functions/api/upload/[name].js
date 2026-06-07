import { json, handleOptions, getConfig, saveConfig } from '../../_lib.js';

// Upload ảnh vào Cloudflare R2 — hiện ngay, không cần deploy
export async function onRequestPost({ params, request, env }) {
  if (!env.IMAGES) {
    return json({ success: false, error: 'R2 chưa được cấu hình. Vào Cloudflare Pages → Settings → Bindings → R2 bucket → đặt tên IMAGES.' }, 503);
  }

  const { name } = params;
  const formData = await request.formData();
  const file     = formData.get('file');

  if (!file) return json({ success: false, error: 'Không có file' }, 400);
  if (file.size > 5 * 1024 * 1024) return json({ success: false, error: 'File quá lớn (tối đa 5MB)' }, 400);

  const ext = name.split('.').pop()?.toLowerCase();
  const allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  if (!allowed.includes(ext)) return json({ success: false, error: 'Chỉ hỗ trợ JPG, PNG, GIF, WebP, SVG' }, 400);

  const types = { jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', gif:'image/gif', webp:'image/webp', svg:'image/svg+xml' };
  const contentType = types[ext] || file.type || 'application/octet-stream';

  const arrayBuffer = await file.arrayBuffer();
  await env.IMAGES.put(name, arrayBuffer, { httpMetadata: { contentType } });

  // Tự động cập nhật config nếu là logo hoặc bg
  try {
    const cfg = await getConfig(env.DB);
    if (name.startsWith('logo')) cfg.site.logoImage = name;
    if (name.startsWith('bg'))   cfg.site.bgImage   = name;
    await saveConfig(env.DB, cfg);
  } catch(e) { /* config update optional */ }

  return json({ success: true, filename: name, url: `/images/${name}`, note: 'Ảnh đã lưu!' });
}

export async function onRequestOptions() {
  return handleOptions();
}
