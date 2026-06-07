import { json, handleOptions } from '../_lib.js';

export async function onRequestGet({ env }) {
  const row = await env.DB.prepare('SELECT v FROM config WHERE id = 1').first();
  return json({ v: row?.v ?? 1 });
}

export async function onRequestOptions() {
  return handleOptions();
}
