import { json, handleOptions } from '../../_lib.js';

// Upload ảnh vào public/images/ trên GitHub repo
// Cloudflare Pages tự deploy sau khi commit (~30 giây)
export async function onRequestPost({ params, request, env }) {
  if (!env.GITHUB_TOKEN) {
    return json({ success: false, error: 'Chưa cấu hình GITHUB_TOKEN. Vào Cloudflare Pages → Settings → Environment variables để thêm.' }, 503);
  }

  const { name } = params;
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file) return json({ success: false, error: 'Không có file' }, 400);
  if (file.size > 5 * 1024 * 1024) return json({ success: false, error: 'File quá lớn (tối đa 5MB)' }, 400);

  const ext = name.split('.').pop()?.toLowerCase();
  const allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  if (!allowed.includes(ext)) return json({ success: false, error: 'Chỉ hỗ trợ JPG, PNG, GIF, WebP, SVG' }, 400);

  const buffer = await file.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

  const repo   = env.GITHUB_REPO   || 'akanji688-ux/socolive';
  const branch = env.GITHUB_BRANCH || 'main';
  const path   = `public/images/${name}`;
  const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    'User-Agent':  'SocoLive-Admin/1.0',
    Accept:        'application/vnd.github+json',
    'Content-Type':'application/json',
  };

  let sha;
  try {
    const check = await fetch(`${apiUrl}?ref=${branch}`, { headers });
    if (check.ok) { const d = await check.json(); sha = d.sha; }
  } catch {}

  const res = await fetch(apiUrl, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: `Upload: ${name}`,
      content: base64,
      branch,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return json({ success: false, error: err.message || `GitHub API lỗi ${res.status}` }, 500);
  }

  return json({
    success: true,
    filename: name,
    url: `/images/${name}`,
    note: 'Đang deploy... ảnh xuất hiện sau ~30 giây.',
  });
}

export async function onRequestOptions() {
  return handleOptions();
}
