import { json, handleOptions } from '../../_lib.js';

export async function onRequestPost({ params, request, env }) {
  if (!env.IMAGES) {
    return json({ success: false, error: 'R2 chưa được cấu hình. Vui lòng thêm R2 bucket trong Settings.' }, 503);
  }

  const { name } = params;
  const formData  = await request.formData();
  const file      = formData.get('file');

  if (!file) return json({ success: false, error: 'Không có file' }, 400);
  if (file.size > 5 * 1024 * 1024) return json({ success: false, error: 'File quá lớn (tối đa 5MB)' }, 400);

  const ext = name.split('.').pop()?.toLowerCase();
  const types = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp' };
  const contentType = types[ext] || file.type || 'application/octet-stream';

  const arrayBuffer = await file.arrayBuffer();
  await env.IMAGES.put(name, arrayBuffer, { httpMetadata: { contentType } });

  const { getConfig, saveConfig } = await import('../../_lib.js');
  const cfg = await getConfig(env.DB);
  if (name.startsWith('logo')) cfg.site.logoImage = name;
  if (name.startsWith('bg'))   cfg.site.bgImage   = name;
  await saveConfig(env.DB, cfg);

  return json({ success: true, filename: name, url: `/images/${name}` });
}

export async function onRequestOptions() {
  return handleOptions();
}
