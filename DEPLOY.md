# Hướng dẫn Deploy SocoLive lên Cloudflare

## Yêu cầu
- Node.js 18+
- Tài khoản Cloudflare (cloudflare.com)

---

## Bước 1 — Cài Wrangler

```bash
cd socolive-cf
npm install
```

Đăng nhập Cloudflare:
```bash
npx wrangler login
```

---

## Bước 2 — Tạo D1 Database

```bash
npx wrangler d1 create socolive-db
```

Lệnh này sẽ in ra `database_id`. **Copy ID đó** vào `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "socolive-db"
database_id = "PASTE_ID_HERE"   ← thay chỗ này
```

Sau đó chạy migration để tạo bảng:
```bash
npm run db:init:remote
```

---

## Bước 3 — Tạo R2 Bucket (lưu ảnh)

```bash
npx wrangler r2 bucket create socolive-images
```

> Nếu bạn muốn ảnh có URL công khai (không qua Worker):  
> Vào Cloudflare Dashboard → R2 → socolive-images → Settings → bật **Public Access**  
> Rồi thay URL `/images/` trong frontend thành URL R2 public.

---

## Bước 4 — Tạo Pages Project & Deploy

```bash
npm run deploy
```

Lần đầu chạy, Wrangler sẽ hỏi tên project — nhập `socolive`.

**Quan trọng:** Sau khi deploy lần đầu, vào **Cloudflare Dashboard → Pages → socolive → Settings → Functions → Bindings** và thêm:

| Type | Variable name | Value |
|------|--------------|-------|
| D1 Database | `DB` | `socolive-db` |
| R2 Bucket   | `IMAGES` | `socolive-images` |

Sau đó deploy lại một lần nữa để áp dụng bindings:
```bash
npm run deploy
```

---

## Bước 5 — Upload ảnh lên R2

Để upload ảnh banner, logo đã có sẵn:
```bash
npx wrangler r2 object put socolive-images/logo.jpg --file=public/images/logo.jpg
npx wrangler r2 object put socolive-images/banner1.jpg --file=public/images/banner1.jpg
npx wrangler r2 object put socolive-images/banner2.jpg --file=public/images/banner2.jpg
npx wrangler r2 object put socolive-images/bg.jpg --file=public/images/bg.jpg
```

---

## Dev local

Test local với D1 + R2 giả lập:
```bash
npm run dev
```

Mở http://localhost:8788

---

## Cấu trúc project

```
socolive-cf/
├── wrangler.toml           ← Cloudflare config (D1 + R2 bindings)
├── package.json
├── migrations/
│   └── 0001_init.sql       ← Schema D1
├── functions/
│   ├── _lib.js             ← Helpers dùng chung (D1, default config)
│   ├── api/
│   │   ├── config.js       ← GET /api/config
│   │   ├── version.js      ← GET /api/version
│   │   ├── stats.js        ← GET /api/stats
│   │   ├── contact.js      ← POST /api/contact → lưu vào D1
│   │   ├── subscribe.js    ← POST /api/subscribe → lưu vào D1
│   │   ├── admin/
│   │   │   └── config.js   ← GET+POST /api/admin/config
│   │   ├── page/
│   │   │   └── [slug].js   ← GET /api/page/:slug
│   │   └── upload/
│   │       └── [name].js   ← POST /api/upload/:name → lưu vào R2
│   └── images/
│       └── [name].js       ← GET /images/:name → đọc từ R2
└── public/                 ← Static files (deploy lên Cloudflare Pages)
    ├── index.html
    ├── page.html
    ├── app.js
    ├── page.js
    ├── style.css
    ├── _redirects          ← Route /* → page.html
    └── admin/
        └── index.html      ← Admin panel
```
