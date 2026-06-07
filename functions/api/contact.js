import { json, handleOptions } from '../_lib.js';

export async function onRequestPost({ request, env }) {
  const { name, email, message } = await request.json();
  if (!name || !email || !message)
    return json({ success: false, error: 'Vui lòng điền đầy đủ thông tin' }, 400);

  await env.DB.prepare('INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)')
    .bind(name, email, message).run();

  return json({ success: true, message: 'Cảm ơn! Chúng tôi sẽ liên hệ sớm.' });
}

export async function onRequestOptions() {
  return handleOptions();
}
