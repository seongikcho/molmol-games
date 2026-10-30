const games = {
  space: {
    title: '스페이스 가디언즈',
    meta: 'SPACE GUARDIANS / 개발 중',
    image: 'assets/space-guardians.png',
    description: '귀여운 가디언과 함께하는 우주 액션. 드론과 원거리 무기를 강화하고, 쏟아지는 적과 보스의 공격에 맞서 나만의 전투를 펼쳐보세요.',
    note: '현재 개발 및 내부 테스트 중입니다. 정식 출시 일정은 추후 안내합니다.'
  },
  sword: {
    title: '초검행',
    meta: '초검행 / 무협 / 개발 중',
    image: 'assets/chogeomhaeng.png?v=20261029v28',
    description: '소녀. 그리고 강호. 첫 검으로 시작하는 강호의 여정, 몰몰게임즈가 준비하는 새로운 무협 게임 초검행을 만나보세요.',
    note: '현재 개발 중입니다. 게임 상세 정보와 출시 일정은 추후 공개합니다.'
  },
  earth: {
    title: '더 어스 · The Earth',
    meta: 'THE EARTH / AR · VR / 개발 예정',
    image: 'assets/earth.svg',
    description: '현실과 가상 사이, 새로운 플레이의 가능성. AR/VR을 기반으로 기획하는 몰몰게임즈의 다음 프로젝트입니다.',
    note: '개발 예정 프로젝트입니다. 상세 콘텐츠와 출시 일정은 아직 정해지지 않았습니다.'
  }
};

/* ==========================================================================
   PHOTOREALISTIC 3D ROTATING EARTH GLOBE ENGINE (Sphere Raycasting + Day/Night)
   ========================================================================== */
class PhotorealisticGlobe {
  constructor() {
    this.dayData = null;
    this.nightData = null;
    this.texW = 0;
    this.texH = 0;
    this.canvases = new Set();
    this.lonOffset = 2.15; // Start centered on East Asia & Western Pacific
    this.lastTime = performance.now();
    this.ready = false;
    this.initTextures();
  }

  async initTextures() {
    try {
      const [dayImg, nightImg] = await Promise.all([
        this.loadImage('assets/earth-texture.jpg?v=20261029v28'),
        this.loadImage('assets/earth-night.jpg?v=20261029v28').catch(() => null)
      ]);
      const w = dayImg.naturalWidth || 1024;
      const h = dayImg.naturalHeight || 512;
      this.texW = w;
      this.texH = h;

      const off = document.createElement('canvas');
      off.width = w;
      off.height = h;
      const ctx = off.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(dayImg, 0, 0, w, h);
      this.dayData = ctx.getImageData(0, 0, w, h).data;

      if (nightImg) {
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(nightImg, 0, 0, w, h);
        this.nightData = ctx.getImageData(0, 0, w, h).data;
      }

      this.ready = true;
      this.canvases.forEach(entry => this.precomputeSphere(entry));
      requestAnimationFrame(t => this.animate(t));
    } catch (err) {
      const fb = document.querySelector('.earth-fallback-img');
      if (fb) fb.style.opacity = '1';
    }
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  registerCanvas(canvas, renderSize = 260) {
    if (!canvas) return;
    canvas.width = renderSize;
    canvas.height = renderSize;
    const entry = {
      canvas,
      ctx: canvas.getContext('2d'),
      size: renderSize,
      imgData: null,
      sphereMap: null
    };
    if (this.ready) {
      this.precomputeSphere(entry);
    }
    this.canvases.add(entry);
    return entry;
  }

  unregisterCanvas(canvas) {
    for (const entry of this.canvases) {
      if (entry.canvas === canvas) {
        this.canvases.delete(entry);
      }
    }
  }

  precomputeSphere(entry) {
    const S = entry.size;
    const cx = S / 2;
    const cy = S / 2;
    const R = S * 0.435;
    entry.imgData = entry.ctx.createImageData(S, S);
    const out = entry.imgData.data;

    const tilt = 19 * (Math.PI / 180);
    const cosT = Math.cos(tilt);
    const sinT = Math.sin(tilt);

    // Light direction (top-left-front)
    const lx = -0.56, ly = -0.34, lz = 0.754;
    // Halfway vector for ocean specular reflection
    let hx = lx, hy = ly, hz = lz + 1.0;
    const hn = Math.hypot(hx, hy, hz);
    hx /= hn; hy /= hn; hz /= hn;

    const indices = [];
    const vCoords = [];
    const baseLon = [];
    const diffuses = [];
    const dayFactors = [];
    const specs = [];
    const fresnels = [];
    const edgeAlphas = [];

    for (let py = 0; py < S; py++) {
      const dy = (py - cy) / R;
      for (let px = 0; px < S; px++) {
        const dx = (px - cx) / R;
        const r2 = dx * dx + dy * dy;
        const dist = Math.sqrt(r2);
        const pIdx = (py * S + px) * 4;

        if (dist <= 1.0) {
          const z = Math.sqrt(Math.max(0, 1.0 - r2));
          const yRot = dy * cosT - z * sinT;
          const zRot = dy * sinT + z * cosT;
          const xRot = dx;

          const lat = Math.asin(Math.max(-1, Math.min(1, yRot)));
          const lon = Math.atan2(xRot, zRot);

          const v = Math.min(this.texH - 1, Math.max(0, ((0.5 + lat / Math.PI) * (this.texH - 1)) | 0));
          const ndotl = dx * lx + dy * ly + z * lz;
          const dayFactor = Math.max(0, Math.min(1, (ndotl + 0.10) / 0.26));
          const diffuse = 0.13 + 0.96 * Math.pow(Math.max(0, ndotl), 0.82);

          const ndoth = Math.max(0, dx * hx + dy * hy + z * hz);
          const spec = Math.pow(ndoth, 30) * 125 * dayFactor;
          const fresnel = Math.pow(1.0 - z, 2.65) * (0.35 + 0.65 * dayFactor);
          const alpha = Math.min(255, Math.max(0, ((1.0 - dist) * R * 0.95 * 255) | 0));

          indices.push(pIdx);
          vCoords.push(v * this.texW);
          baseLon.push(lon);
          diffuses.push(diffuse);
          dayFactors.push(dayFactor);
          specs.push(spec);
          fresnels.push(fresnel);
          edgeAlphas.push(alpha);
        } else if (dist <= 1.20) {
          // Outer atmospheric Rayleigh glow
          const halo = Math.pow(Math.max(0, 1.0 - (dist - 1.0) / 0.20), 2.5);
          out[pIdx] = (145 * halo) | 0;
          out[pIdx + 1] = (195 * halo) | 0;
          out[pIdx + 2] = (255 * halo) | 0;
          out[pIdx + 3] = (185 * halo) | 0;
        }
      }
    }

    entry.sphereMap = {
      count: indices.length,
      indices: new Int32Array(indices),
      vCoords: new Int32Array(vCoords),
      baseLon: new Float32Array(baseLon),
      diffuses: new Float32Array(diffuses),
      dayFactors: new Float32Array(dayFactors),
      specs: new Float32Array(specs),
      fresnels: new Float32Array(fresnels),
      edgeAlphas: new Uint8Array(edgeAlphas)
    };
  }

  renderEntry(entry) {
    if (!entry.sphereMap || !this.dayData) return;
    const { count, indices, vCoords, baseLon, diffuses, dayFactors, specs, fresnels, edgeAlphas } = entry.sphereMap;
    const out = entry.imgData.data;
    const day = this.dayData;
    const night = this.nightData;
    const tw = this.texW;
    const twoPi = Math.PI * 2;

    for (let i = 0; i < count; i++) {
      let lon = (baseLon[i] + this.lonOffset) % twoPi;
      if (lon < -Math.PI) lon += twoPi;
      else if (lon > Math.PI) lon -= twoPi;

      const u = (((lon + Math.PI) / twoPi) * (tw - 1)) | 0;
      const tIdx = (vCoords[i] + u) * 4;

      const dr = day[tIdx];
      const dg = day[tIdx + 1];
      const db = day[tIdx + 2];

      const diff = diffuses[i];
      const df = dayFactors[i];
      const fres = fresnels[i];

      // Ocean check for specular sun glint
      const isOcean = db > dr * 1.12 ? 1.0 : 0.15;
      const sp = specs[i] * isOcean;

      let r = dr * diff + sp + fres * 145;
      let g = dg * diff + sp + fres * 198;
      let b = db * diff + sp * 1.08 + fres * 255;

      if (night && df < 0.85) {
        const nf = (1.0 - df) * (1.0 - df) * 1.25;
        r += night[tIdx] * nf * 1.3;
        g += night[tIdx + 1] * nf * 1.0;
        b += night[tIdx + 2] * nf * 0.65;
      }

      const pIdx = indices[i];
      out[pIdx] = r > 255 ? 255 : r | 0;
      out[pIdx + 1] = g > 255 ? 255 : g | 0;
      out[pIdx + 2] = b > 255 ? 255 : b | 0;
      out[pIdx + 3] = edgeAlphas[i];
    }

    entry.ctx.putImageData(entry.imgData, 0, 0);
  }

  animate(now) {
    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;
    this.lonOffset -= dt * 0.24; // Smooth realistic axial rotation

    for (const entry of this.canvases) {
      this.renderEntry(entry);
    }
    requestAnimationFrame(t => this.animate(t));
  }
}

const globeEngine = new PhotorealisticGlobe();
const cardGlobeCanvas = document.querySelector('#earth-globe-canvas');
if (cardGlobeCanvas) {
  globeEngine.registerCanvas(cardGlobeCanvas, 280);
}

/* ==========================================================================
   MODAL DIALOG LOGIC
   ========================================================================== */
const dialog = document.querySelector('#game-dialog');
let lastTrigger;
let dialogCanvas = null;

document.querySelectorAll('[data-game]').forEach(button =>
  button.addEventListener('click', () => {
    lastTrigger = button;
    const key = button.dataset.game;
    if (key === 'studio') {
      const s = document.querySelector('#studio');
      if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const g = games[key];
    document.querySelector('#dialog-title').textContent = g.title;
    document.querySelector('#dialog-meta').textContent = g.meta;
    document.querySelector('#dialog-description').textContent = g.description;
    document.querySelector('#dialog-note').textContent = g.note;

    const art = document.querySelector('#dialog-art');
    art.className = key;
    if (dialogCanvas) {
      globeEngine.unregisterCanvas(dialogCanvas);
      dialogCanvas = null;
    }

    if (key === 'earth') {
      dialogCanvas = document.createElement('canvas');
      dialogCanvas.className = 'dialog-earth-canvas';
      art.replaceChildren(dialogCanvas);
      globeEngine.registerCanvas(dialogCanvas, 260);
    } else {
      art.replaceChildren(
        Object.assign(document.createElement('img'), {
          src: g.image,
          alt: g.title
        })
      );
    }

    dialog.showModal();
    document.body.style.overflow = 'hidden';
  })
);

document.querySelectorAll('.dialog-close,.dialog-done').forEach(button =>
  button.addEventListener('click', () => dialog.close())
);

dialog.addEventListener('click', event => {
  if (event.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    ) {
      dialog.close();
    }
  }
});

dialog.addEventListener('close', () => {
  if (dialogCanvas) {
    globeEngine.unregisterCanvas(dialogCanvas);
    dialogCanvas = null;
  }
  document.body.style.overflow = '';
  lastTrigger?.focus();
});


/* ==========================================================================
   SHIFT UP STYLE HERO SHOWCASE SLIDER (3 KEY ART SLIDES)
   ========================================================================== */
const heroSlidesData = [
  {
    edition: "01 / MOLMOL UNIVERSE · FLAGSHIP LINEUP",
    index: "01",
    title: "MOLMOL UNIVERSE",
    tag: "KEY ART SHOWCASE",
    subcopy: "가볍게 시작해, 깊이 빠져드는 세계.<br>독창적인 아트웍과 상상력으로 새로운 플레이를 만듭니다.",
    quickGame: "studio",
    quickLabel: "몰몰게임즈 정보 보기"
  },
  {
    edition: "02 / CHOGEOMHAENG · NEW WUXIA RPG",
    index: "02",
    title: "초검행 (初劍行)",
    tag: "무협 · 개발 중",
    subcopy: "소녀. 그리고 강호.<br>운해를 가르는 푸른 검기와 함께 나만의 강호가 열립니다.",
    quickGame: "sword",
    quickLabel: "초검행 자세히 보기"
  },
  {
    edition: "03 / SPACE GUARDIANS · COSMIC ACTION",
    index: "03",
    title: "스페이스 가디언즈 (Space Guardians)",
    tag: "SPACE ACTION · 개발 중",
    subcopy: "작은 가디언의 커다란 우주 전투.<br>드론과 함께 쏟아지는 우주의 위협에 맞서세요.",
    quickGame: "space",
    quickLabel: "스페이스 가디언즈 보기"
  }
];

const slideEls = document.querySelectorAll(".hero-slide");
const tabEls = document.querySelectorAll(".hero-tab");
const editionBadge = document.querySelector("#hero-edition-badge");
const pillIndex = document.querySelector("#hero-pill-index");
const pillTitle = document.querySelector("#hero-pill-title");
const pillTag = document.querySelector("#hero-pill-tag");
const heroSubcopy = document.querySelector("#hero-subcopy");
const heroQuickBtn = document.querySelector("#hero-quick-btn");

let currentHeroSlide = 0;
let heroSlideTimer = null;

function setHeroSlide(idx) {
  if (!slideEls.length) return;
  currentHeroSlide = (idx + slideEls.length) % slideEls.length;
  slideEls.forEach((el, i) => {
    el.classList.toggle("is-active", i === currentHeroSlide);
  });
  tabEls.forEach((btn, i) => {
    const active = i === currentHeroSlide;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
    const bar = btn.querySelector(".tab-bar");
    if (bar) {
      bar.style.animation = "none";
      void bar.offsetWidth;
      bar.style.animation = active ? "" : "none";
    }
  });
  const d = heroSlidesData[currentHeroSlide];
  if (d) {
    if (editionBadge) editionBadge.textContent = d.edition;
    if (pillIndex) pillIndex.textContent = d.index;
    if (pillTitle) pillTitle.textContent = d.title;
    if (pillTag) pillTag.textContent = d.tag;
    if (heroSubcopy) heroSubcopy.innerHTML = d.subcopy;
    if (heroQuickBtn) {
      heroQuickBtn.dataset.game = d.quickGame;
      heroQuickBtn.innerHTML = `${d.quickLabel} <span>+</span>`;
    }
  }
}

function restartHeroTimer() {
  if (heroSlideTimer) clearInterval(heroSlideTimer);
  heroSlideTimer = setInterval(() => {
    setHeroSlide(currentHeroSlide + 1);
  }, 6000);
}

if (tabEls.length) {
  tabEls.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetIdx = Number(btn.dataset.slideTarget || 0);
      setHeroSlide(targetIdx);
      restartHeroTimer();
    });
  });
  restartHeroTimer();
}

/* Touch swipe on hero (mobile) */
(function () {
  const heroEl = document.querySelector(".hero");
  if (!heroEl || !slideEls.length) return;
  let sx = 0, sy = 0, tracking = false;
  heroEl.addEventListener("touchstart", e => {
    if (e.touches.length !== 1) return;
    sx = e.touches[0].clientX; sy = e.touches[0].clientY; tracking = true;
  }, { passive: true });
  heroEl.addEventListener("touchend", e => {
    if (!tracking) return;
    tracking = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      setHeroSlide(currentHeroSlide + (dx < 0 ? 1 : -1));
      restartHeroTimer();
    }
  }, { passive: true });
})();


/* ==========================================================================
   NEWS & CORPORATE (RECRUIT / IR) DIALOG HANDLERS
   ========================================================================== */
const newsItemsData = {
  news1: {
    title: "몰몰게임즈(MOLMOL GAMES) 공식 브랜드 사이트 오픈 안내",
    meta: "NOTICE · 2026.10",
    description: "‘몰몰하게, 제대로.’ 몰몰게임즈가 대표 라인업 3종(스페이스 가디언즈, 초검행, 더 어스)과 스튜디오 소식을 담은 공식 웹사이트를 오픈했습니다.",
    note: "카테고리: 공지사항 / 몰몰게임즈 사이트 오픈",
    image: "assets/hero-studio.jpg?v=20261029v28"
  },
  news2: {
    title: "‘스페이스 가디언즈’, 전술 드론과 우주 탄막 액션 전투 개발 소식 공개",
    meta: "SPACE GUARDIANS · 2026.10",
    description: "우주 곳곳의 위협에 맞서는 ‘스페이스 가디언즈’의 핵심 플레이 메커니즘인 자율 비행 드론 시너지 시스템과 시원한 타격감의 우주 탄막 액션 전투를 개발 중입니다.",
    note: "카테고리: 개발 소식 / 스페이스 가디언즈",
    image: "assets/space-guardians.png?v=20261029v28"
  },
  news3: {
    title: "차세대 AR/VR 프로젝트 ‘더 어스(The Earth)’ R&D 착수",
    meta: "R&D · 2026.10",
    description: "화면 너머 더 넓은 세계를 향해 나아가는 몰몰게임즈의 차세대 AR/VR 프로젝트 ‘더 어스(The Earth)’가 핵심 공간 인터랙션 기술 R&D에 착수했습니다.",
    note: "카테고리: 신규 프로젝트 / 더 어스 R&D 착수",
    image: "assets/earth-texture.jpg?v=20261029v28"
  }
};

const corpItemsData = {
  recruit: {
    title: "몰몰게임즈 채용 안내 (RECRUIT)",
    meta: "CAREERS · SMALL STUDIO. BIG PLAY.",
    description: "몰몰게임즈는 자율과 몰입을 바탕으로, 우리가 직접 플레이하고 싶은 게임을 제대로 만드는 올인원 게임 개발 스튜디오입니다. 현재 게임 아트/디자인 및 마케팅/광고 분야의 인재를 영입하고 있습니다. 지원 및 문의: seong9513@gmail.com",
    note: "모집 분야: 게임 아트/디자인 · 마케팅/광고 (포트폴리오 및 이력서: seong9513@gmail.com)",
    image: "assets/hero-studio.jpg?v=20261029v28"
  }
};

function openCustomDialog(item, keyClass) {
  document.querySelector("#dialog-title").textContent = item.title;
  document.querySelector("#dialog-meta").textContent = item.meta;
  document.querySelector("#dialog-description").textContent = item.description;
  document.querySelector("#dialog-note").textContent = item.note;
  const art = document.querySelector("#dialog-art");
  art.className = keyClass || "space";
  if (dialogCanvas) {
    globeEngine.unregisterCanvas(dialogCanvas);
    dialogCanvas = null;
  }
  art.replaceChildren(
    Object.assign(document.createElement("img"), {
      src: item.image,
      alt: item.title
    })
  );
  dialog.showModal();
  document.body.style.overflow = "hidden";
}

document.querySelectorAll("[data-news]").forEach(btn => {
  btn.addEventListener("click", () => {
    lastTrigger = btn;
    const item = newsItemsData[btn.dataset.news];
    if (item) openCustomDialog(item, btn.dataset.news === "news5" ? "sword" : "space");
  });
});

document.querySelectorAll("[data-corp]").forEach(btn => {
  btn.addEventListener("click", () => {
    lastTrigger = btn;
    const item = corpItemsData[btn.dataset.corp];
    if (item) openCustomDialog(item, "space");
  });
});

/* Investment inquiry: Contact us popup (v28) */
(function () {
  const btn = document.querySelector("#contact-btn");
  const dlg = document.querySelector("#contact-dialog");
  const copy = document.querySelector("#contact-copy");
  const close = document.querySelector("#contact-close");
  if (!btn || !dlg) return;
  const shut = () => { if (dlg.open) dlg.close(); };
  btn.addEventListener("click", () => { dlg.showModal(); document.body.style.overflow = "hidden"; });
  dlg.addEventListener("close", () => { document.body.style.overflow = ""; btn.focus(); });
  if (close) close.addEventListener("click", shut);
  dlg.addEventListener("click", e => { if (e.target === dlg) shut(); });
  if (copy) copy.addEventListener("click", async () => {
    const email = "seong9513@gmail.com";
    try { await navigator.clipboard.writeText(email); }
    catch (e) {
      const t = document.createElement("textarea"); t.value = email; dlg.appendChild(t); t.select();
      try { document.execCommand("copy"); } catch (_) {} t.remove();
    }
    copy.textContent = "복사됨 ✓";
    setTimeout(() => { copy.textContent = "복사"; }, 1600);
  });
})();
