import { json, handleOptions, getConfig, saveConfig } from '../../_lib.js';

export async function onRequestGet({ env }) {
  const cfg = await getConfig(env.DB);
  return json(cfg);
}

export async function onRequestPost({ request, env }) {
  const body = await request.json();
  const { section, index, field, value, action } = body;

  try {
    const cfg = await getConfig(env.DB);

    if (section === 'site') {
      cfg.site[field] = value;

    } else if (section === 'stats') {
      cfg.stats[field] = Number(value);

    } else if (section === 'banners') {
      if (action === 'add') {
        cfg.banners.push({ badge: '🆕 MỚI', title: 'Tiêu Đề Slide', desc: 'Mô tả slide', image: '', bg: `slide-${cfg.banners.length + 1}` });
      } else if (action === 'delete' && index !== undefined && cfg.banners.length > 1) {
        cfg.banners.splice(index, 1);
      } else if (index !== undefined) {
        cfg.banners[index][field] = value;
      }

    } else if (section === 'buttons') {
      if (action === 'add') {
        cfg.buttons.push({ icon: '', label: 'Nút mới', desc: '', link: '#', featured: false, badge: null });
      } else if (action === 'delete' && index !== undefined && cfg.buttons.length > 1) {
        cfg.buttons.splice(index, 1);
      } else if (index !== undefined) {
        cfg.buttons[index][field] = value;
      }

    } else if (section === 'pages') {
      const { slug, itemIndex } = body;

      if (action === 'add-page') {
        const newSlug = slug || `page-${Date.now()}`;
        cfg.pages[newSlug] = {
          title: field || 'Trang Mới', heading: 'Tiêu đề', desc: 'Mô tả',
          banners: JSON.parse(JSON.stringify(cfg.banners)),
          buttons: JSON.parse(JSON.stringify(cfg.buttons)),
          content: [],
        };
      } else if (action === 'delete-page' && slug) {
        delete cfg.pages[slug];
      } else if (action === 'update-page' && slug) {
        cfg.pages[slug][field] = value;
      } else if (action === 'rename-page' && slug) {
        if (!cfg.pages[value]) { cfg.pages[value] = cfg.pages[slug]; delete cfg.pages[slug]; }
      } else if (action === 'add-item' && slug) {
        cfg.pages[slug].content.push({ label: 'Mục mới', value: '', link: '#' });
      } else if (action === 'delete-item' && slug && itemIndex !== undefined) {
        cfg.pages[slug].content.splice(itemIndex, 1);
      } else if (action === 'update-item' && slug && itemIndex !== undefined) {
        cfg.pages[slug].content[itemIndex][field] = value;
      } else if (action === 'update-banner' && slug && itemIndex !== undefined) {
        if (!cfg.pages[slug].banners) cfg.pages[slug].banners = JSON.parse(JSON.stringify(cfg.banners));
        cfg.pages[slug].banners[itemIndex][field] = value;
      } else if (action === 'add-banner' && slug) {
        if (!cfg.pages[slug].banners) cfg.pages[slug].banners = JSON.parse(JSON.stringify(cfg.banners));
        const bs = cfg.pages[slug].banners;
        bs.push({ badge: '🆕 MỚI', title: 'Tiêu Đề Slide', desc: 'Mô tả slide', image: '', bg: `slide-${bs.length + 1}` });
      } else if (action === 'delete-banner' && slug && itemIndex !== undefined) {
        if (cfg.pages[slug].banners?.length > 1) cfg.pages[slug].banners.splice(itemIndex, 1);
      } else if (action === 'update-button' && slug && itemIndex !== undefined) {
        if (!cfg.pages[slug].buttons) cfg.pages[slug].buttons = JSON.parse(JSON.stringify(cfg.buttons));
        cfg.pages[slug].buttons[itemIndex][field] = value;
      } else if (action === 'add-button' && slug) {
        if (!cfg.pages[slug].buttons) cfg.pages[slug].buttons = JSON.parse(JSON.stringify(cfg.buttons));
        cfg.pages[slug].buttons.push({ icon: '', label: 'Nút mới', desc: '', link: '#', featured: false, badge: null });
      } else if (action === 'delete-button' && slug && itemIndex !== undefined) {
        if (cfg.pages[slug].buttons?.length > 1) cfg.pages[slug].buttons.splice(itemIndex, 1);
      }
    }

    const newV = await saveConfig(env.DB, cfg);
    return json({ success: true, config: { ...cfg, v: newV } });

  } catch (e) {
    return json({ success: false, error: e.message }, 400);
  }
}

export async function onRequestOptions() {
  return handleOptions();
}
