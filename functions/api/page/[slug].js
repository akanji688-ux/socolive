import { json, handleOptions, getConfig } from '../../_lib.js';

export async function onRequestGet({ params, env }) {
  const cfg  = await getConfig(env.DB);
  const page = cfg.pages?.[params.slug];
  if (!page) return json({ error: 'Không tìm thấy trang' }, 404);

  return json({
    ...page,
    banners: page.banners || cfg.banners,
    buttons: page.buttons || cfg.buttons,
  });
}

export async function onRequestOptions() {
  return handleOptions();
}
