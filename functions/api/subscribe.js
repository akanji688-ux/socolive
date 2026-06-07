import { json, handleOptions } from '../_lib.js';

export async function onRequestPost({ request, env }) {
  const { email } = await request.json();
  if (!email) return json({ success: false, error: 'Email không hợp lệ' }, 400);

  try {
    await env.DB.prepare('INSERT INTO subscribers (email) VALUES (?)').bind(email).run();
    return json({ success: true, message: 'Đăng ký thành công!' });
  } catch {
    return json({ success: false, error: 'Email đã đăng ký trước đó' }, 409);
  }
}

export async function onRequestOptions() {
  return handleOptions();
}
