import { json, handleOptions, getConfig, saveConfig } from '../../_lib.js';

export async function onRequestGet({ params, env }) {
    const cfg  = await getConfig(env.DB);
    const page = cfg.pages?.[params.slug];
    if (!page) return json({ error: 'Khong tim thay trang' }, 404);

  return json({
        ...page,
        banners: page.banners || cfg.banners,
        buttons: page.buttons || cfg.buttons,
  });
}

// POST /api/page/:slug — create or update a page in D1
export async function onRequestPost({ params, request, env }) {
    const cfg = await getConfig(env.DB);
    const body = await request.json();
    cfg.pages = cfg.pages || {};
    cfg.pages[params.slug] = body;
    await saveConfig(env.DB, cfg);
    return json({ ok: true, slug: params.slug });
}

export async function onRequestOptions() {
    return handleOptions();
}
