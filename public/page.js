// Lấy slug từ URL (vd: /live → 'live')
const PAGE_SLUG = location.pathname.replace('/', '').split('/')[0];
let currentVersion = 0;

async function init() {
  const [cfgRes, pageRes] = await Promise.all([
    fetch('/api/config'),
    fetch(`/api/page/${PAGE_SLUG}`)
  ]);
  const cfg  = await cfgRes.json();
  const page = await pageRes.json();
  if (page.error) { document.body.innerHTML = '<div style="text-align:center;padding:80px 20px;color:#8b949e"><h2>404</h2><p>Trang không tồn tại</p><a href="/" style="color:#00c853">← Về trang chủ</a></div>'; return; }
  currentVersion = cfg.v || 1;

  document.title = `${page.title} — ${cfg.site.name}`;
  render(cfg, page);
  startPolling();
}

function render(cfg, page) {
  setupNav(cfg.site);
  renderSlider(page.banners, page.buttons);
  renderButtons(page.buttons, page);
  renderPageContent(page);
  const ft = document.querySelector('.section-title');
  const fs = document.querySelector('.section-sub');
  if (ft && cfg.site.featuresTitle) ft.textContent = cfg.site.featuresTitle;
  if (fs && cfg.site.featuresSub)   fs.textContent = cfg.site.featuresSub;
}

// ── AUTO-SYNC ──
function startPolling() {
  setInterval(async () => {
    try {
      const r = await fetch('/api/version');
      const { v } = await r.json();
      if (v !== currentVersion) {
        currentVersion = v;
        const [cfgRes, pageRes] = await Promise.all([fetch('/api/config'), fetch(`/api/page/${PAGE_SLUG}`)]);
        const cfg = await cfgRes.json();
        const page = await pageRes.json();
        if (page.error) return;
        document.title = `${page.title} — ${cfg.site.name}`;
        render(cfg, page);
        showSyncToast();
      }
    } catch {}
  }, 2000);
}

function showSyncToast() {
  let t = document.getElementById('syncToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'syncToast';
    t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#1a2235;border:1px solid #00c853;color:#00c853;padding:10px 22px;border-radius:50px;font-size:.85rem;font-weight:600;z-index:999;opacity:0;transition:opacity .3s';
    t.textContent = '✓ Nội dung đã được cập nhật';
    document.body.appendChild(t);
  }
  t.style.opacity = '1';
  setTimeout(() => { t.style.opacity = '0'; }, 2500);
}

// Hỗ trợ URL đầy đủ (https://...) lẫn file local (/images/...)
function imgUrl(v) { return v ? (v.startsWith('http') ? v : '/images/' + v) : ''; }

// ── NAV ──
function setupNav(site) {
  const logoWrap = document.getElementById('logoText');
  if (site.logoImage) {
    logoWrap.innerHTML = `<img src="${imgUrl(site.logoImage)}" alt="${site.name}" class="logo-img"/>`;
  } else {
    logoWrap.innerHTML = `<span class="logo logo-fallback">${site.logo}</span>`;
  }
  document.getElementById('logoMobile').textContent = site.name;
  const bgLayer = document.getElementById('bgLayer');
  if (bgLayer) {
    if (site.bgImage) {
      bgLayer.style.backgroundImage = `url('${imgUrl(site.bgImage)}')`;
      bgLayer.style.display = 'block';
    } else {
      bgLayer.style.backgroundImage = '';
      bgLayer.style.display = 'none';
    }
  }
}

// ── SLIDER ──
function renderSlider(banners, buttons) {
  const slider  = document.getElementById('slider');
  const dotsWrap = document.getElementById('sliderDots');
  const link1   = buttons[0]?.link || '#';
  const link2   = buttons[1]?.link || '#';
  const link3   = buttons[2]?.link || '#';
  slider.innerHTML = '';
  dotsWrap.innerHTML = '';

  banners.forEach((b, i) => {
    const label1 = b.btn1Label || 'Xem Ngay';
    const label2 = b.btn2Label || 'Đăng Ký';
    const label3 = b.btn3Label || 'Liên Hệ';
    const div = document.createElement('div');
    div.className = `slide ${b.bg}`;
    if (b.image) div.style.backgroundImage = `url('${imgUrl(b.image)}')`;
    div.innerHTML = `
      <div class="slide-content">
        <span class="badge">${b.badge}</span>
        <h1>${b.title.replace(/\n/g, '<br/>')}</h1>
        <p>${b.desc}</p>
        <div class="cta-group">
          <a href="${link1}" class="btn btn-primary">${label1}</a>
          <a href="${link2}" class="btn btn-ghost">${label2}</a>
          <a href="${link3}" class="btn btn-outline">${label3}</a>
        </div>
      </div>`;
    slider.appendChild(div);

    const d = document.createElement('div');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.onclick = () => goTo(i);
    dotsWrap.appendChild(d);
  });

  startSlider(banners.length);
}

let current = 0, timer, totalSlides = 0;

function startSlider(count) {
  totalSlides = count;
  clearInterval(timer);
  timer = setInterval(() => goTo(current + 1), 5000);
  const slider = document.getElementById('slider');
  const newSlider = slider.cloneNode(true);
  slider.parentNode.replaceChild(newSlider, slider);
  let startX = 0;
  newSlider.addEventListener('touchstart', e => startX = e.touches[0].clientX, { passive: true });
  newSlider.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) { goTo(current + (dx < 0 ? 1 : -1)); reset(); }
  });
}

function goTo(n) {
  current = (n + totalSlides) % totalSlides;
  const s = document.getElementById('slider');
  if (s) s.style.transform = `translateX(-${current * 100}%)`;
  document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === current));
}
function reset() { clearInterval(timer); timer = setInterval(() => goTo(current + 1), 5000); }

document.getElementById('prevBtn').onclick = () => { goTo(current - 1); reset(); };
document.getElementById('nextBtn').onclick = () => { goTo(current + 1); reset(); };

// ── BUTTONS — hiển thị với heading/desc của trang con ──
function stripEmoji(s) { return (s||'').replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27FF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FEFF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FAFF}]/gu,'').replace(/\s+/g,' ').trim(); }

function renderButtons(buttons, page) {
  document.getElementById('pageHeading').textContent = page.heading || '';
  document.getElementById('pageDesc').textContent    = page.desc    || '';

  const grid = document.getElementById('btnGrid');
  grid.innerHTML = '';
  buttons.forEach(b => {
    const a = document.createElement('a');
    a.href = b.link;
    a.className = 'feature-btn' + (b.featured ? ' featured' : '') + (b.highlight ? ' highlight' : '') + (b.link === `/${PAGE_SLUG}` ? ' active-page' : '');
    if (b.badge) {
      const s = document.createElement('span'); s.className = 'badge-btn'; s.textContent = b.badge; a.appendChild(s);
    }
    const label = document.createElement('span'); label.className = 'feature-label'; label.textContent = stripEmoji(b.label);
    const desc  = document.createElement('span'); desc.className  = 'feature-desc';  desc.textContent = b.desc;
    a.append(label, desc);
    grid.appendChild(a);
  });
}

// ── NỘI DUNG TRANG CON ──
function renderPageContent(page) {
  const section = document.getElementById('pageContentSection');
  const wrap    = document.getElementById('pageItems');
  const items   = page.content || [];

  if (!items.length) { section.style.display = 'none'; return; }
  section.style.display = '';
  wrap.innerHTML = '';

  items.forEach(item => {
    const card = document.createElement('a');
    card.href = item.link || '#';
    card.className = 'page-item-card';
    const label = document.createElement('span'); label.className = 'pi-label'; label.textContent = item.label || '';
    const value = document.createElement('span'); value.className = 'pi-value'; value.textContent = item.value || '';
    card.append(label, value);
    if (item.link && item.link !== '#') {
      const arr = document.createElement('span'); arr.className = 'pi-arrow'; arr.textContent = '→';
      card.appendChild(arr);
    }
    wrap.appendChild(card);
  });
}

// ── HAMBURGER ──
document.getElementById('hamburger').onclick = () =>
  document.getElementById('mobileMenu').classList.toggle('open');

init();
