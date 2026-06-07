// ── Shared helpers for all Cloudflare Functions ──

export const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

export function handleOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

// ── Default config (same as server.js) ──
export const DEFAULT_CONFIG = {
  v: 1,
  site: {
    name: 'SocoLive',
    logo: '⚽ SocoLive',
    logoImage: '',
    bgImage: '',
    description: 'Xem bóng đá trực tuyến HD',
    featuresTitle: 'Khám Phá SocoLive',
    featuresSub: 'Tất cả những gì bạn cần cho trải nghiệm bóng đá đỉnh cao',
  },
  banners: [
    { badge: '🔴 LIVE NOW', title: 'Xem Bóng Đá\nTrực Tuyến HD', desc: 'Hàng nghìn trận đấu mỗi ngày — không giật, không lag', image: '', bg: 'slide-1' },
    { badge: '⚡ PREMIUM',  title: 'Chất Lượng 4K\nSiêu Nét',       desc: 'Trải nghiệm bóng đá như đang ngồi trên khán đài',       image: '', bg: 'slide-2' },
    { badge: '📱 MOBILE',   title: 'Xem Mọi Lúc\nMọi Nơi',          desc: 'Tương thích PC, điện thoại, máy tính bảng',              image: '', bg: 'slide-3' },
  ],
  buttons: [
    { icon: '📺', label: 'Xem Live',      desc: 'Xem trực tiếp tất cả giải đấu lớn',          link: '/live',     featured: false, badge: null },
    { icon: '⭐', label: 'Đăng Ký VIP',   desc: 'Mở khóa toàn bộ nội dung premium',           link: '/vip',      featured: true,  badge: 'HOT' },
    { icon: '💬', label: 'Liên Hệ',       desc: 'Hỗ trợ 24/7 — phản hồi trong vài phút',     link: '/contact',  featured: false, badge: null },
    { icon: '📅', label: 'Lịch Thi Đấu', desc: 'Lịch các trận đấu sắp diễn ra',              link: '/schedule', featured: false, badge: 'MỚI' },
  ],
  stats: { users: 12400, matches: 3800, live: 47 },
  pages: {
    live: {
      title: '📺 Xem Live', heading: 'Đang Phát Trực Tiếp', desc: 'Chọn trận đấu bạn muốn xem',
      content: [
        { label: 'Premier League',   time: '20:00', teams: 'Man City vs Arsenal',   link: '#' },
        { label: 'La Liga',          time: '22:00', teams: 'Real Madrid vs Barca',  link: '#' },
        { label: 'Champions League', time: '02:00', teams: 'Bayern vs PSG',         link: '#' },
      ],
    },
    vip: {
      title: '⭐ Gói VIP', heading: 'Nâng Cấp Trải Nghiệm', desc: 'Xem 4K, không quảng cáo, hỗ trợ ưu tiên',
      content: [
        { label: 'Gói Tháng',    price: '49.000đ',  note: 'Thanh toán hàng tháng' },
        { label: 'Gói Năm',      price: '399.000đ', note: 'Tiết kiệm 32%' },
        { label: 'Gói Trọn Đời', price: '999.000đ', note: 'Một lần, dùng mãi' },
      ],
    },
    contact: {
      title: '💬 Liên Hệ', heading: 'Liên Hệ Với Chúng Tôi', desc: 'Phản hồi trong vòng 15 phút',
      content: [
        { label: 'Facebook', value: 'facebook.com/socolive', link: '#' },
        { label: 'Telegram', value: '@socolive',             link: '#' },
        { label: 'Email',    value: 'support@socolive.vn',   link: '#' },
      ],
    },
  },
};

// ── D1 helpers ──
export async function getConfig(DB) {
  const row = await DB.prepare('SELECT data, v FROM config WHERE id = 1').first();
  if (!row) {
    const data = { ...DEFAULT_CONFIG };
    delete data.v;
    await DB.prepare('INSERT INTO config (id, data, v) VALUES (1, ?, 1)')
      .bind(JSON.stringify(data)).run();
    return { ...DEFAULT_CONFIG, v: 1 };
  }
  return { ...JSON.parse(row.data), v: row.v };
}

export async function saveConfig(DB, cfg) {
  const { v, ...data } = cfg;
  const newV = (v || 1) + 1;
  await DB.prepare('INSERT INTO config (id, data, v) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data, v = excluded.v')
    .bind(JSON.stringify(data), newV).run();
  return newV;
}
