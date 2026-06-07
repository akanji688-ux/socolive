import { json, handleOptions, getConfig } from '../_lib.js';

export async function onRequestGet({ env }) {
  const cfg = await getConfig(env.DB);
  return json(cfg.stats);
}

export async function onRequestOptions() {
  return handleOptions();
}
