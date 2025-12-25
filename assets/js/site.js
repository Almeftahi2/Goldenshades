/* Ebda Trend v2.9 */
/* ========== Ebda Al-Dhil - Site JS (Trend 2.8) ==========
   Features:
   - Mobile menu (overlay, ESC)
   - Scroll progress
   - ToTop button
   - Fade-up reveal
   - Hero crossfade slider + dots
   - Lightbox (gallery)
   - Before/After compare slider
   - WhatsApp form builder
   - Trend Offer Popup (service select + countdown + gallery swipe/zoom/double-tap + indicator)
   - Social proof live toasts (click to open popup)
   - Persist selected service (localStorage)
=========================================================== */

(() => {
  'use strict';

  /* ---------- Helpers ---------- */
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // --- Image extension fallback (png/jpg/png) ---
  const attachImgFallback = (img) => {
    if (!img || img.dataset.fallbackBound) return;
    img.dataset.fallbackBound = '1';

    img.addEventListener(
      'error',
      () => {
        const cur = img.getAttribute('src') || '';
        if (!cur || img.dataset.fallbackTried) return;
        img.dataset.fallbackTried = '1';

        // جرّب تبديل الامتداد بدون ما ندخل في حلقة لا نهائية
        if (/\.png$/i.test(cur)) img.src = cur.replace(/\.png$/i, '.jpg');
        else if (/\.jpg$/i.test(cur)) img.src = cur.replace(/\.jpg$/i, '.png');
        else if (/\.png$/i.test(cur)) img.src = cur.replace(/\.png$/i, '.jpg');
      },
      { once: false }
    );
  };

  const initImageFallbacks = () => {
    // اربط على كل الصور الحالية
    qsa('img[src]').forEach(attachImgFallback);

    // راقب أي صور جديدة تُضاف (احتياطًا)
    const mo = new MutationObserver((muts) => {
      muts.forEach((m) => {
        m.addedNodes &&
          m.addedNodes.forEach((n) => {
            if (n && n.nodeType === 1) {
              if (n.tagName === 'IMG') attachImgFallback(n);
              n.querySelectorAll && n.querySelectorAll('img[src]').forEach(attachImgFallback);
            }
          });
      });
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  };



// --- Dynamic Markup (حتى كل الصفحات تشتغل بدون نسخ مودالات) ---
function ensureLightboxMarkup() {
  if (qs('#lightbox')) return;
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div id="lightbox" class="fixed inset-0 z-[100]">
      <div id="lightboxOverlay" class="absolute inset-0 bg-black/70"></div>
      <div class="relative max-w-4xl mx-auto px-4 h-full flex items-center justify-center">
        <div class="glass border border-white/10 rounded-2xl overflow-hidden w-full">
          <div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div id="lightboxTitle" class="text-sm font-extrabold text-slate-50">عرض الصورة</div>
            <button id="lightboxClose" class="w-10 h-10 rounded-xl bg-primary/60 border border-white/10 hover:border-accent" aria-label="إغلاق" title="إغلاق">✕</button>
          </div>
          <img id="lightboxImg" src="" alt="" class="w-full max-h-[70vh] object-contain bg-black/30" />
          <div class="px-4 py-3 text-[11px] text-slate-300">إذا أعجبك الشكل… أرسل لنا صور المكان والأبعاد على واتساب.</div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(wrap.firstElementChild);
}

function ensureOfferModalMarkup() {
  if (qs('#offerModal')) return;
  const wrap = document.createElement('div');
  wrap.innerHTML = `
  <div id="offerModal" class="hidden fixed inset-0 z-[110]">
    <div id="offerOverlay" class="absolute inset-0 bg-black/70"></div>
    <div class="relative max-w-5xl mx-auto px-4 h-full flex items-center justify-center">
      <div class="glass metallic-border border border-white/10 rounded-3xl overflow-hidden w-full shadow-soft">
        <div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div class="text-sm font-extrabold text-slate-50">🎁 عرض اليوم — خصم/ميزة + تثبيت حجز سريع</div>
          <button id="offerClose" class="w-10 h-10 rounded-xl bg-primary/60 border border-white/10 hover:border-accent" aria-label="إغلاق" title="إغلاق">✕</button>
        </div>

        <div class="grid lg:grid-cols-2 gap-0">
          <!-- Gallery -->
          <div class="p-4 border-b lg:border-b-0 lg:border-l border-white/10">
            <div class="offer-gallery" id="offerGallery" aria-label="معرض داخل العرض">
              <div class="offer-stage" id="offerStage">
                <img id="offerMainImg" src="images/4.png" alt="معرض" class="offer-main" />
                <div class="offer-hint">اسحب ↔ • قرّب 🔎 • Double tap</div>
                <div class="offer-indicator" id="offerIndicator">1 / 6</div>
              </div>
              <div class="offer-thumbs" id="offerThumbs" aria-label="مصغرات"></div>
            </div>
          </div>

          <!-- Content -->
          <div class="p-5 space-y-4">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-[11px] text-accent">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-[pulse_1.5s_infinite]"></span>
              عرض ترندي — لقطات + قرار أسرع
            </div>

            <div class="space-y-1">
              <div class="text-xl md:text-2xl font-extrabold text-slate-50">خلّنا نطلع لك أفضل حل “على قد المكان”</div>
              <div class="text-sm text-slate-300">اختر الخدمة… وراح نجهز لك تقدير مبدئي + توصية سماكة/خامة.</div>
            </div>

            <div class="grid sm:grid-cols-2 gap-3">
              <label class="offer-radio">
                <input type="radio" name="offerService" value="سندوتش بنل" />
                <span>سندوتش بنل</span>
              </label>
              <label class="offer-radio">
                <input type="radio" name="offerService" value="مظلات سيارات" />
                <span>مظلات سيارات</span>
              </label>
              <label class="offer-radio">
                <input type="radio" name="offerService" value="مستودعات/هناجر" />
                <span>مستودعات/هناجر</span>
              </label>
              <label class="offer-radio">
                <input type="radio" name="offerService" value="سواتر/حدادة" />
                <span>سواتر/حدادة</span>
              </label>
            </div>

            <div class="glass rounded-2xl border border-white/10 p-4">
              <div class="flex items-center justify-between">
                <div class="text-sm font-extrabold text-slate-50">⏱️ مهلة العرض</div>
                <div class="text-accent font-extrabold" id="offerCountdown">00:59</div>
              </div>
              <div class="text-[11px] text-slate-300 mt-1">(عداد خفيف) الهدف يعطيك إحساس “الفرصة” بدون إزعاج.</div>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <a id="offerCTA" href="#contact" class="btn-main inline-flex items-center gap-2 rounded-full bg-accent text-primary px-5 py-2 font-extrabold shadow-soft">اطلب عرض سعر الآن <span>→</span></a>
              <a id="offerWhats" target="_blank" class="btn-main inline-flex items-center gap-2 rounded-full bg-emerald-500 text-white px-5 py-2 font-extrabold shadow-soft hover:bg-emerald-400">واتساب مباشر 💬</a>
              <button id="offerCopy" class="btn-outline inline-flex items-center gap-2 rounded-full border border-white/10 bg-primary/40 px-4 py-2 text-xs">نسخ رسالة جاهزة</button>
            </div>

            <div class="text-[11px] text-slate-400">نحفظ اختيار الخدمة للزيارة القادمة لسهولة التواصل.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
  document.body.appendChild(wrap.firstElementChild);
}

function ensureSendConfirmMarkup() {
  if (qs('#sendConfirmModal')) return;
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div id="sendConfirmModal" class="hidden fixed inset-0 z-[120]">
      <div id="sendConfirmOverlay" class="absolute inset-0 bg-black/70"></div>
      <div class="relative max-w-3xl mx-auto px-4 h-full flex items-center justify-center">
        <div class="glass metallic-border border border-white/10 rounded-3xl overflow-hidden w-full shadow-soft">
          <div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div class="text-sm font-extrabold text-slate-50">📧 ملخص الطلب قبل الإرسال</div>
            <button id="sendConfirmClose" class="w-10 h-10 rounded-xl bg-primary/60 border border-white/10 hover:border-accent" aria-label="إغلاق" title="إغلاق">✕</button>
          </div>

          <div class="p-5 space-y-4">
            <div class="grid md:grid-cols-2 gap-4">
              <div class="glass rounded-2xl border border-white/10 p-4">
                <div class="text-xs text-slate-400">تفاصيلك</div>
                <div id="sendConfirmSummary" class="mt-2 text-sm text-slate-200 leading-relaxed"></div>
              </div>

              <div class="glass rounded-2xl border border-accent/30 p-4">
                <div class="flex items-center justify-between">
                  <div class="text-sm font-extrabold text-slate-50">👀 ليش هذا الملخص؟</div>
                  <div class="text-accent font-extrabold" id="sendConfirmTimer">00:20</div>
                </div>
                <p class="text-[12px] text-slate-300 mt-2 leading-relaxed">
                  عشان تشوف الرسالة قبل ما تنرسل… وتأكد أن كل شيء صحيح. هذه خطوة بسيطة ترفع الثقة وتقلل الأخطاء.
                </p>
                <div class="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                  <span class="px-2 py-1 rounded-full bg-primary/50 border border-white/10 text-center">واضح</span>
                  <span class="px-2 py-1 rounded-full bg-primary/50 border border-white/10 text-center">سريع</span>
                  <span class="px-2 py-1 rounded-full bg-primary/50 border border-white/10 text-center">بدون حفظ</span>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <button id="sendConfirmEdit" class="btn-outline inline-flex items-center gap-2 rounded-full border border-white/10 bg-primary/40 px-5 py-2 text-xs">تعديل المعلومات</button>
              <button id="sendConfirmCopy" class="btn-outline inline-flex items-center gap-2 rounded-full border border-white/10 bg-primary/40 px-5 py-2 text-xs">نسخ الرسالة</button>
              <a id="sendConfirmGo" target="_blank" class="btn-main inline-flex items-center gap-2 rounded-full bg-accent text-primary px-6 py-2 font-extrabold shadow-soft">تأكيد وفتح واتساب 💬</a>
            </div>

            <div class="text-[11px] text-slate-400">
              ملاحظة: عند التأكيد يتم فتح واتساب فقط — أنت اللي تضغط إرسال هناك.
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(wrap.firstElementChild);
}

function openSendConfirm(payload) {
  ensureSendConfirmMarkup();
  const modal = qs('#sendConfirmModal');
  const overlay = qs('#sendConfirmOverlay');
  const closeBtn = qs('#sendConfirmClose');
  const editBtn = qs('#sendConfirmEdit');
  const copyBtn = qs('#sendConfirmCopy');
  const goBtn = qs('#sendConfirmGo');
  const summary = qs('#sendConfirmSummary');
  const timerEl = qs('#sendConfirmTimer');

  let t = 20;
  let timerId = null;

  const htmlEscape = (str) => String(str || "").replace(/[&<>"']/g, (m) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","\x27":"&#39;"}[m]));
  const lines = [
    ['الخدمة', payload.fields?.service],
    ['الاسم', payload.fields?.name],
    ['الجوال', payload.fields?.phone],
    ['الحي/المنطقة', payload.fields?.city],
  ];
  const details = payload.fields?.details;
  summary.innerHTML = `
    <div class="space-y-1">
      ${lines.map(([k,v]) => `<div><span class="text-slate-400">${htmlEscape(k)}:</span> <span class="font-semibold">${htmlEscape(v || '—')}</span></div>`).join('')}
      <div class="pt-2"><span class="text-slate-400">تفاصيل:</span><div class="mt-1 text-slate-200">${htmlEscape(details || '—').replace(/\n/g,'<br>')}</div></div>
    </div>
  `;

  goBtn.href = payload.url;

  function close() {
    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    if (timerId) clearInterval(timerId);
    timerId = null;
  }

  function open() {
    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    timerEl.textContent = `00:${String(t).padStart(2,'0')}`;
    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => {
      t = Math.max(0, t - 1);
      timerEl.textContent = `00:${String(t).padStart(2,'0')}`;
      if (t === 0) {
        clearInterval(timerId);
        timerId = null;
      }
    }, 1000);
  }

  overlay.onclick = close;
  closeBtn.onclick = close;
  editBtn.onclick = close;
  copyBtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(payload.plainText);
      copyBtn.textContent = 'تم النسخ ✅';
      setTimeout(() => (copyBtn.textContent = 'نسخ الرسالة'), 1200);
    } catch (_) {
      copyBtn.textContent = 'انسخ يدويًا ✋';
      setTimeout(() => (copyBtn.textContent = 'نسخ الرسالة'), 1200);
    }
  };

  // Esc close
  const onKey = (e) => {
    if (e.key === 'Escape') {
      close();
      window.removeEventListener('keydown', onKey);
    }
  };
  window.addEventListener('keydown', onKey);

  open();
}

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const ls = {
    get(key, fallback = null) {
      try {
        const v = localStorage.getItem(key);
        return v === null ? fallback : v;
      } catch (_) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (_) {}
    },
    del(key) {
      try {
        localStorage.removeItem(key);
      } catch (_) {}
    },
  };

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  /* ---------- App Config ---------- */
  const WHATSAPP_NUMBER = window.WHATSAPP_NUMBER || '966554803704';
  const HERO_SLIDES = Array.isArray(window.HERO_SLIDES) && window.HERO_SLIDES.length
    ? window.HERO_SLIDES
    : ['images/12.png', 'images/16.png', 'images/28.png', 'images/28.png'];

  // Service catalog for popup + persistence
  const SERVICES = [
    {
      id: 'sandwich',
      label: 'سندوتش بنل (غرفة/ملحق/سقف)',
      keywords: 'سندوتش بنل, غرف, ملاحق, عزل',
      cta: 'أبغى عرض سعر لسندوتش بنل',
      images: [
        { src: 'images/4.png', cap: 'سندوتش بنل — تنفيذ نظيف' },
        { src: 'images/30.png', cap: 'ألواح وسماكات — عزل ممتاز' },
        { src: 'images/16.png', cap: 'غرفة/ملحق — تشطيب مرتب' },
        { src: 'images/12.png', cap: 'مستودع — عزل عالي' },
      ],
    },
    {
      id: 'car-shades',
      label: 'مظلات سيارات ومداخل',
      keywords: 'مظلات سيارات, مداخل, ظل, حماية',
      cta: 'أبغى عرض سعر لمظلة سيارات',
      images: [
        { src: 'images/2.jpg', cap: 'مظلات سيارات — تصميم حديث' },
        { src: 'images/18.png', cap: 'تفاصيل التثبيت والتشطيب' },
        { src: 'images/16.png', cap: 'تنفيذ عملي + شكل مرتب' },
        { src: 'images/30.png', cap: 'خيارات خامات متعددة' },
      ],
    },
    {
      id: 'stores',
      label: 'مستودعات وهناجر',
      keywords: 'مستودعات, هناجر, هياكل, ورش',
      cta: 'أبغى عرض سعر لمستودع/هنجر',
      images: [
        { src: 'images/12.png', cap: 'مستودع سندوتش بنل — عزل عالي' },
        { src: 'images/16.png', cap: 'فتحات تهوية محسوبة' },
        { src: 'images/30.png', cap: 'سماكات مناسبة للتخزين' },
        { src: 'images/4.png', cap: 'تشطيب نهائي نظيف' },
      ],
    },
    {
      id: 'steel',
      label: 'سواتر وحدادة',
      keywords: 'سواتر, حدادة, خصوصية, بوابات',
      cta: 'أبغى عرض سعر لسواتر/حدادة',
      images: [
        { src: 'images/12.png', cap: 'سواتر — خصوصية وشكل مرتب' },
        { src: 'images/16.jpg', cap: 'تناغم مع الواجهة' },
        { src: 'images/20.png', cap: 'تشطيب دهان وقطع' },
        { src: 'images/2.png', cap: 'حلول حسب الموقع' },
      ],
    },
  ];

  const SERVICE_STORAGE_KEY = 'ebda_service_v1';
  const POPUP_DISMISS_KEY = 'ebda_offer_dismissed_until_v1';
  const POPUP_COUNTDOWN_KEY = 'ebda_offer_countdown_until_v1';

  /* ---------- DOM Ready ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initScrollProgress();
    initToTop();
    initFadeUp();
    initHeroSlider();
    initLightbox();
    initCompare();
    initWhatsAppForm();
    initOfferPopup();
    initSocialProof();
    initLiveViewersBadge();
    initResumePill();
    hydrateServiceSelection();
  });

  /* ---------- Mobile Menu ---------- */
  function initMobileMenu() {
    const btn = qs('#menuBtn');
    const menu = qs('#mobileMenu');
    const overlay = qs('#menuOverlay');
    const closeBtn = qs('#menuClose');

    if (!btn || !menu || !overlay) return;

    const open = () => {
      overlay.classList.remove('hidden');
      menu.classList.remove('translate-x-full');
      document.body.style.overflow = 'hidden';
      btn.setAttribute('aria-expanded', 'true');
    };

    const close = () => {
      overlay.classList.add('hidden');
      menu.classList.add('translate-x-full');
      document.body.style.overflow = '';
      btn.setAttribute('aria-expanded', 'false');
    };

    btn.addEventListener('click', open);
    overlay.addEventListener('click', close);
    closeBtn?.addEventListener('click', close);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    // Close when clicking a link
    qsa('a', menu).forEach((a) => a.addEventListener('click', close));
  }

  /* ---------- Scroll Progress ---------- */
  function initScrollProgress() {
    const bar = qs('#scrollProgressBar');
    if (!bar) return;

    const update = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const height = doc.scrollHeight - doc.clientHeight;
      const pct = height > 0 ? (scrollTop / height) * 100 : 0;
      bar.style.width = `${pct}%`;
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  /* ---------- ToTop ---------- */
  function initToTop() {
    const btn = qs('#toTop');
    if (!btn) return;

    const toggle = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      btn.style.opacity = y > 700 ? '1' : '0';
      btn.style.pointerEvents = y > 700 ? 'auto' : 'none';
      btn.style.transform = y > 700 ? 'translateY(0)' : 'translateY(10px)';
    };

    toggle();
    window.addEventListener('scroll', toggle, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Fade Up Reveal ---------- */
  function initFadeUp() {
    const els = qsa('.fade-up');
    if (!els.length) return;

    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      els.forEach((el) => el.classList.add('show'));
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    els.forEach((el) => obs.observe(el));
  }

  /* ---------- Hero Slider (Crossfade 2 imgs) ---------- */
  function initHeroSlider() {
    const img1 = qs('#heroSlide1');
    const img2 = qs('#heroSlide2');
    if (!img1 || !img2) return;

    const dotsRoot = qs('#heroDots');
    const dots = dotsRoot ? qsa('[data-dot]', dotsRoot) : [];

    let current = 0;
    let showingFirst = true;

    img1.src = HERO_SLIDES[0];
    img2.src = HERO_SLIDES[1] || HERO_SLIDES[0];

    const setDots = (i) => {
      dots.forEach((d, idx) => {
        d.style.opacity = idx === i ? '0.95' : '0.35';
        d.style.transform = idx === i ? 'scale(1.15)' : 'scale(1)';
      });
    };
    setDots(0);

    const step = () => {
      const next = (current + 1) % HERO_SLIDES.length;

      if (showingFirst) {
        img2.src = HERO_SLIDES[next];
        img1.classList.remove('opacity-100');
        img1.classList.add('opacity-0');
        img2.classList.remove('opacity-0');
        img2.classList.add('opacity-100');
      } else {
        img1.src = HERO_SLIDES[next];
        img2.classList.remove('opacity-100');
        img2.classList.add('opacity-0');
        img1.classList.remove('opacity-0');
        img1.classList.add('opacity-100');
      }

      showingFirst = !showingFirst;
      current = next;
      setDots(current);
    };

    if (!prefersReducedMotion) {
      setInterval(step, 2400);
    }
  }

  /* ---------- Lightbox ---------- */
  function initLightbox() {
    ensureLightboxMarkup();

    initImageFallbacks();
    const lightbox = qs('#lightbox');
    const overlay = qs('#lightboxOverlay');
    const closeBtn = qs('#lightboxClose');
    const img = qs('#lightboxImg');
    const title = qs('#lightboxTitle');

    if (!lightbox || !overlay || !closeBtn || !img) return;
    lightbox.setAttribute('aria-hidden', 'true');

    const open = (src, caption) => {
      // ملاحظة: إذا كانت الصورة غير موجودة (امتداد غلط مثل png بدل jpg)
      // نفتح اللايت بوكس أولاً ثم نحاول fallback حتى ما يصير "تعليق" بدون نافذة.
      try {
        lightbox.classList.add('open', 'is-open');
        lightbox.setAttribute('aria-hidden', 'false');

        if (title) title.textContent = caption || 'عرض الصورة';

        // آلية fallback بسيطة: png -> jpg -> png
        const tryFallback = () => {
          const cur = img.getAttribute('src') || '';
          if (img.dataset.fallbackTried) return;
          img.dataset.fallbackTried = '1';

          if (/\.png$/i.test(cur)) img.src = cur.replace(/\.png$/i, '.jpg');
          else if (/\.jpg$/i.test(cur)) img.src = cur.replace(/\.jpg$/i, '.png');
          else if (/\.png$/i.test(cur)) img.src = cur.replace(/\.png$/i, '.jpg');
        };

        img.dataset.fallbackTried = '';
        img.onerror = tryFallback;

        img.src = src;
        img.alt = caption || 'صورة';

        // اقفل التمرير بعد فتح النافذة
        document.body.style.overflow = 'hidden';
      } catch (err) {
        console.error(err);
        close();
      }
    };

    const close = () => {
      lightbox.classList.remove('open', 'is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      img.onerror = null;
      img.src = '';
      img.alt = '';
      delete img.dataset.fallbackTried;
    };

    qsa('[data-lightbox]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const src = btn.getAttribute('data-src');
        const cap = btn.getAttribute('data-caption') || 'عرض الصورة';
        if (src) open(src, cap);
      });
    });

    overlay.addEventListener('click', close);
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    // expose for popup
    window.__EBDA_LIGHTBOX_OPEN__ = open;
    window.__EBDA_LIGHTBOX_CLOSE__ = close;
  }

  /* ---------- Before/After Compare ---------- */
  function initCompare() {
    qsa('[data-compare]').forEach((root) => {
      const range = qs('.compare__range', root);
      const after = qs('img.after', root);
      const handle = qs('.compare__handle', root);

      if (!range || !after || !handle) return;

      const update = () => {
        const v = Number(range.value || 50);
        root.style.setProperty('--pos', `${v}%`);
      };

      range.addEventListener('input', update, { passive: true });
      update();
    });
  }

  /* ---------- WhatsApp Form ---------- */
  function initWhatsAppForm() {
    const form = qs('#whatsappForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = (qs('#name')?.value || '').trim();
      const phone = (qs('#phone')?.value || '').trim();
      const city = (qs('#city')?.value || '').trim();
      const service = (qs('#service')?.value || '').trim();
      const details = (qs('#details')?.value || '').trim();

      let msg = `طلب عرض سعر من موقع مؤسسة إبداع الظل:\n\n`;
      if (name) msg += `الاسم: ${name}\n`;
      if (phone) msg += `الجوال: ${phone}\n`;
      if (city) msg += `المنطقة/الحي: ${city}\n`;
      if (service) msg += `نوع الخدمة: ${service}\n`;
      if (details) msg += `\nتفاصيل إضافية:\n${details}\n`;

      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

      // يعرض ملخص ويطلب تأكيد قبل الإرسال (أفضل للثقة)
      openSendConfirm({
        url,
        message: msg,
        fields: { name, phone, city, service, details },
      });
    });
  }

  /* ---------- Persist Service Selection ---------- */
  function hydrateServiceSelection() {
    const savedId = ls.get(SERVICE_STORAGE_KEY, '');
    if (!savedId) return;

    const svc = SERVICES.find((s) => s.id === savedId);
    if (!svc) return;

    // Contact form select
    const contactSelect = qs('#service');
    if (contactSelect) {
      // Try to match existing option text; fallback keep
      const options = qsa('option', contactSelect).map((o) => o.textContent.trim());
      const preferred = guessBestContactOption(svc);
      if (options.includes(preferred)) contactSelect.value = preferred;
    }
  }

  function guessBestContactOption(svc) {
    if (svc.id === 'sandwich') return 'سندوتش بنل - غرفة أو ملحق';
    if (svc.id === 'stores') return 'سندوتش بنل - مستودع / هنجر';
    if (svc.id === 'car-shades') return 'مظلات سيارات';
    if (svc.id === 'steel') return 'سواتر حديد / خشب';
    return '';
  }

  /* ---------- Offer Popup (Trend 2.8) ---------- */
  function initOfferPopup() {
  ensureOfferModalMarkup();
  const modal = qs('#offerModal');
    if (!modal) return;

    const overlay = qs('#offerOverlay', modal);
    const closeBtn = qs('#offerClose', modal);
    const openBtns = qsa('[data-open-offer]');
    const serviceSelect = qs('#offerService', modal);

    const timerEl = qs('#offerTimer', modal);
    const ctaBtn = qs('#offerCta', modal);

    // Gallery elements inside popup
    const galleryRoot = qs('#offerGallery', modal);
    const mainStage = qs('#offerStage', modal);
    const mainImg = qs('#offerMainImg', modal);
    const mainCap = qs('#offerCaption', modal);
    const dotsRoot = qs('#offerDots', modal);
    const thumbsRoot = qs('#offerThumbs', modal);

    // indicator
    const indicator = qs('#offerIndicator', modal);

    // Guard: missing markup
    if (!overlay || !closeBtn || !serviceSelect || !timerEl || !ctaBtn || !galleryRoot || !mainStage || !mainImg || !dotsRoot || !thumbsRoot) {
      return;
    }

    // Populate select
    serviceSelect.innerHTML = `<option value="">اختر الخدمة</option>` + SERVICES.map(s => `<option value="${s.id}">${s.label}</option>`).join('');

    // Countdown: 10 minutes from first ever open, then renew if closed for long
    const now = Date.now();
    let until = Number(ls.get(POPUP_COUNTDOWN_KEY, '0')) || 0;
    if (!until || until < now) {
      until = now + 10 * 60 * 1000; // 10 minutes
      ls.set(POPUP_COUNTDOWN_KEY, String(until));
    }

    let countdownInterval = null;
    const startCountdown = () => {
      stopCountdown();
      const tick = () => {
        const t = until - Date.now();
        const clamped = Math.max(0, t);
        const mm = String(Math.floor(clamped / 60000)).padStart(2, '0');
        const ss = String(Math.floor((clamped % 60000) / 1000)).padStart(2, '0');
        timerEl.textContent = `${mm}:${ss}`;
        if (clamped <= 0) {
          timerEl.textContent = '00:00';
          // "Soft" end: keep open but change label
          const badge = qs('#offerBadge', modal);
          if (badge) badge.textContent = 'العرض مستمر (اليوم)';
          stopCountdown();
        }
      };
      tick();
      countdownInterval = setInterval(tick, 1000);
    };
    const stopCountdown = () => {
      if (countdownInterval) clearInterval(countdownInterval);
      countdownInterval = null;
    };

    // Dismiss policy: show at most once per 24h unless user manually opens
    const canAutoShow = () => {
      const untilDismiss = Number(ls.get(POPUP_DISMISS_KEY, '0')) || 0;
      return Date.now() > untilDismiss;
    };

    const setDismissForDay = () => {
      const day = Date.now() + 24 * 60 * 60 * 1000;
      ls.set(POPUP_DISMISS_KEY, String(day));
    };

    // Gallery state
    const g = createOfferGallery({
      root: galleryRoot,
      stage: mainStage,
      img: mainImg,
      captionEl: mainCap,
      dotsRoot,
      thumbsRoot,
      indicator,
      onZoomChange: (zoomed) => {
        // help text toggle
        const hint = qs('#offerHint', modal);
        if (hint) hint.textContent = zoomed ? 'اسحب للتنقل داخل الصورة • اضغط مرتين للخروج من الزوم' : 'اسحب للتنقل بين الصور • اضغط مرتين للزوم';
      },
    });

  // Deep-link: ?service=sandwich|car|stores|steel (يفتح العرض تلقائياً)
  try {
    const params = new URLSearchParams(location.search);
    const svc = (params.get('service') || '').toLowerCase().trim();
    if (svc && SERVICE_CONFIG[svc]) {
      serviceSelect.value = svc;
      setService(svc);
      setTimeout(() => openModal('deeplink'), 450);
    }
  } catch (e) {}

  // Keyboard navigation داخل البوباب
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); g.next?.(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); g.prev?.(); }
    if (e.key === '+' || e.key === '=') { e.preventDefault(); g.zoomIn?.(); }
    if (e.key === '-' || e.key === '_') { e.preventDefault(); g.zoomOut?.(); }
  });

    // Set initial service
    const saved = ls.get(SERVICE_STORAGE_KEY, '');
    if (saved && SERVICES.some((s) => s.id === saved)) {
      serviceSelect.value = saved;
      g.setService(saved);
      updateCtaFromService(saved);
    } else {
      // Default to sandwich
      serviceSelect.value = 'sandwich';
      g.setService('sandwich');
      updateCtaFromService('sandwich');
    }

    // Save selection + sync to contact form
    serviceSelect.addEventListener('change', () => {
      const id = serviceSelect.value;
      if (!id) return;
      ls.set(SERVICE_STORAGE_KEY, id);
      g.setService(id);
      updateCtaFromService(id);

      const contactSelect = qs('#service');
      if (contactSelect) {
        const preferred = guessBestContactOption(SERVICES.find((s) => s.id === id));
        if (preferred) contactSelect.value = preferred;
      }
    });

    function updateCtaFromService(id) {
      const svc = SERVICES.find((s) => s.id === id);
      const title = qs('#offerTitle', modal);
      const subtitle = qs('#offerSubtitle', modal);
      if (title) title.textContent = svc ? `عرض سريع — ${svc.label}` : 'عرض سريع';
      if (subtitle) subtitle.textContent = svc
        ? `أرسل صور المكان + المقاسات… ونرجع لك بتقدير واضح لنفس الخدمة.`
        : 'أرسل صور المكان… ونرجع لك بتقدير واضح.';
      ctaBtn.dataset.serviceId = id;
    }

    const open = (opts = {}) => {
      // If called with service
      if (opts.serviceId && SERVICES.some((s) => s.id === opts.serviceId)) {
        serviceSelect.value = opts.serviceId;
        ls.set(SERVICE_STORAGE_KEY, opts.serviceId);
        g.setService(opts.serviceId);
        updateCtaFromService(opts.serviceId);
      }

      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      startCountdown();

      // mark auto show as dismissed for day after first open
      if (opts.auto) setDismissForDay();
    };

    const close = () => {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
      stopCountdown();
      // optional: dismiss for day
      setDismissForDay();
      g.resetZoom();
    };

    // open triggers
    openBtns.forEach((b) => b.addEventListener('click', () => open({ auto: false })));

    // Close triggers
    overlay.addEventListener('click', close);
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    // CTA -> WhatsApp with service
    ctaBtn.addEventListener('click', () => {
      const id = ctaBtn.dataset.serviceId || serviceSelect.value || 'sandwich';
      const svc = SERVICES.find((s) => s.id === id) || SERVICES[0];

      const msg =
        `عرض سريع من نافذة الموقع:\n` +
        `الخدمة: ${svc.label}\n\n` +
        `الرجاء إرسال:\n` +
        `1) صور المكان (2-4 صور)\n` +
        `2) المقاسات تقريبًا (طول×عرض×ارتفاع)\n` +
        `3) الموقع/الحي\n` +
        `4) هل تحتاج تكييف/كهرباء؟\n\n` +
        `ملاحظة: أحتاج تقدير مبدئي + مدة التنفيذ.`;

      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

      // يعرض ملخص ويطلب تأكيد قبل الإرسال (أفضل للثقة)
      openSendConfirm({
        url,
        message: msg,
        fields: { name, phone, city, service, details },
      });
    });

    // Auto open: after delay OR after scroll 40% (once)
    let autoOpened = false;
    const tryAuto = () => {
      if (autoOpened) return;
      if (!canAutoShow()) return;
      autoOpened = true;
      open({ auto: true });
    };

    if (!prefersReducedMotion) {
      setTimeout(tryAuto, 7000);
      const onScroll = () => {
        const doc = document.documentElement;
        const pct = (doc.scrollTop / (doc.scrollHeight - doc.clientHeight || 1)) * 100;
        if (pct > 40) {
          window.removeEventListener('scroll', onScroll);
          tryAuto();
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });

      // Exit intent (desktop)
      document.addEventListener('mouseout', (e) => {
        if (autoOpened) return;
        if (!canAutoShow()) return;
        if (e.clientY <= 0) tryAuto();
      });
    }

    // Expose open function for social proof
    window.__EBDA_OPEN_OFFER__ = (serviceId) => open({ auto: false, serviceId });
  }

  /* ---------- Offer Gallery: swipe + zoom + double tap + indicator ---------- */
  function createOfferGallery({ root, stage, img, captionEl, dotsRoot, thumbsRoot, indicator, onZoomChange }) {
    let serviceId = 'sandwich';

  const slideKey = (sid) => `EBDA_OFFER_LAST_SLIDE_${sid || 'all'}`;
  const loadSavedIndex = (sid) => {
    const v = ls.get(slideKey(sid), '0');
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };
  const saveIndex = (sid, idx) => {
    try { ls.set(slideKey(sid), String(idx)); } catch (e) {}
  };
    let images = [];
    let index = 0;

    // Transform state
    let scale = 1;
    let tx = 0;
    let ty = 0;

    // Pointer tracking for pinch/pan
    const pointers = new Map(); // id -> {x,y}
    let startDist = 0;
    let startScale = 1;
    let startTx = 0;
    let startTy = 0;
    let lastTapAt = 0;

    // Swipe tracking (when not zoomed)
    let swipeStartX = 0;
    let swipeStartY = 0;
    let swiping = false;

    // Build UI
    const setService = (id) => {
      const svc = SERVICES.find((s) => s.id === id) || SERVICES[0];
      serviceId = svc.id;
      images = svc.images.slice();
      index = Math.min(Math.max(loadSavedIndex(serviceId), 0), Math.max(images.length - 1, 0));
      render();
      resetZoom(true);
    };

    const render = () => {
      // main
      setMain(index, true);

      // dots
      dotsRoot.innerHTML = images.map((_, i) =>
        `<button class="offer-dot ${i === index ? 'is-active' : ''}" data-dot="${i}" aria-label="الصورة ${i + 1}"></button>`
      ).join('');

      // thumbs
      thumbsRoot.innerHTML = images.map((it, i) => `
        <button class="offer-thumb ${i === index ? 'is-active' : ''}" data-thumb="${i}" aria-label="مصغّر ${i + 1}">
          <img src="${it.src}" alt="${it.cap || 'صورة'}" loading="lazy" />
        </button>
      `).join('');


    // Metallic hover spotlight داخل المصغرات (خفيف جدًا)
    qsa('.offer-thumb', thumbsRoot).forEach((btn) => {
      const set = (e) => {
        const r = btn.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        if (Number.isFinite(x) && Number.isFinite(y)) {
          btn.style.setProperty('--mx', x + '%');
          btn.style.setProperty('--my', y + '%');
        }
      };
      btn.addEventListener('pointerenter', set, { passive: true });
      btn.addEventListener('pointermove', set, { passive: true });
    });

      // events for dots/thumbs
      qsa('[data-dot]', dotsRoot).forEach((b) => b.addEventListener('click', () => goTo(Number(b.dataset.dot))));
      qsa('[data-thumb]', thumbsRoot).forEach((b) => b.addEventListener('click', () => goTo(Number(b.dataset.thumb))));
    };

    const setMain = (i, immediate = false) => {
      index = clamp(i, 0, images.length - 1);
      const it = images[index];
      img.style.transition = immediate ? 'none' : '';
      img.src = it.src;
      img.alt = it.cap || 'صورة';
      if (captionEl) captionEl.textContent = it.cap || '';

      // active markers
      qsa('.offer-dot', dotsRoot).forEach((d, k) => d.classList.toggle('is-active', k === index));
      qsa('.offer-thumb', thumbsRoot).forEach((t, k) => t.classList.toggle('is-active', k === index));
    };

    const goTo = (i) => {
      if (!images.length) return;
      resetZoom(true);
      setMain(i);
    };

    const next = () => goTo((index + 1) % images.length);
    const prev = () => goTo((index - 1 + images.length) % images.length);

    function applyTransform() {
      img.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;
      img.classList.toggle('is-zoomed', scale > 1.01);
      onZoomChange?.(scale > 1.01);
    }

    function resetZoom(immediate = false) {
      scale = 1;
      tx = 0;
      ty = 0;
      img.style.transition = immediate ? 'none' : '';
      applyTransform();
      setTimeout(() => (img.style.transition = ''), 0);
    }

    function clampPan() {
      // clamp translate so image doesn't leave big empty spaces
      const rect = stage.getBoundingClientRect();
      const maxX = ((scale - 1) * rect.width) / 2;
      const maxY = ((scale - 1) * rect.height) / 2;
      tx = clamp(tx, -maxX, maxX);
      ty = clamp(ty, -maxY, maxY);
    }

    function showIndicator(x, y, mode) {
      if (!indicator) return;
      indicator.classList.add('is-on');
      indicator.dataset.mode = mode || 'swipe';
      indicator.style.left = `${x}px`;
      indicator.style.top = `${y}px`;
    }

    function hideIndicator() {
      if (!indicator) return;
      indicator.classList.remove('is-on');
      indicator.dataset.mode = '';
    }

    // Pointer events on stage
    stage.style.touchAction = 'none';

  // Hover spotlight (desktop)
  stage.addEventListener('pointerenter', () => stage.classList.add('is-hover'));
  stage.addEventListener('pointerleave', () => {
    stage.classList.remove('is-hover');
    stage.style.removeProperty('--mx');
    stage.style.removeProperty('--my');
  });

    stage.addEventListener('pointerdown', (e) => {
      stage.setPointerCapture?.(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      // Double tap
      const now = Date.now();
      const isDouble = now - lastTapAt < 260;
      lastTapAt = now;

      const rect = stage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      showIndicator(x, y, scale > 1.01 ? 'pan' : 'swipe');

      if (isDouble) {
        // Toggle zoom to 2.2 and center around tap
        if (scale <= 1.01) {
          scale = 2.2;
          // Translate so tap point stays closer to center
          tx = (rect.width / 2 - x) * (scale - 1) * 0.35;
          ty = (rect.height / 2 - y) * (scale - 1) * 0.35;
          clampPan();
        } else {
          resetZoom();
        }
        applyTransform();
        return;
      }

      // If one pointer: start swipe/pan
      if (pointers.size === 1) {
        swipeStartX = e.clientX;
        swipeStartY = e.clientY;
        startTx = tx;
        startTy = ty;
        swiping = true;
      }

      // If two pointers: start pinch
      if (pointers.size === 2) {
        const pts = Array.from(pointers.values());
        startDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        startScale = scale;
        startTx = tx;
        startTy = ty;
      }
    });

    stage.addEventListener('pointermove', (e) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      const rect = stage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      showIndicator(x, y, scale > 1.01 ? 'pan' : 'swipe');

      if (pointers.size === 2) {
        // pinch zoom
        const pts = Array.from(pointers.values());
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const ratio = dist / (startDist || dist);
        scale = clamp(startScale * ratio, 1, 3);
        // keep pan within bounds
        tx = startTx;
        ty = startTy;
        clampPan();
        applyTransform();
        return;
      }

      if (!swiping) return;

      const dx = e.clientX - swipeStartX;
      const dy = e.clientY - swipeStartY;

      if (scale > 1.01) {
        // pan
        tx = startTx + dx;
        ty = startTy + dy;
        clampPan();
        applyTransform();
      } else {
        // swipe hint (translate a bit)
        img.style.transform = `translate3d(${dx * 0.25}px, ${dy * 0.05}px, 0) scale(1)`;
      }
    });

    stage.addEventListener('pointerup', (e) => {
      pointers.delete(e.pointerId);
      swiping = false;

      // If not zoomed: decide swipe
      if (scale <= 1.01) {
        const dx = e.clientX - swipeStartX;
        const dy = e.clientY - swipeStartY;

        // restore transform
        img.style.transform = 'translate3d(0,0,0) scale(1)';

        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
          dx < 0 ? next() : prev();
        } else {
          applyTransform();
        }
      } else {
        clampPan();
        applyTransform();
      }

      if (pointers.size === 0) {
        setTimeout(hideIndicator, 120);
      }
    });

    stage.addEventListener('pointercancel', () => {
      pointers.clear();
      swiping = false;
      applyTransform();
      hideIndicator();
    });

    // Wheel zoom (desktop)
    stage.addEventListener('wheel', (e) => {
      if (!e.ctrlKey && !e.metaKey) {
        // allow normal scroll if not hovering? but stage is inside modal, stop to avoid scroll
        e.preventDefault();
      }
      const delta = -e.deltaY;
      const step = delta > 0 ? 0.15 : -0.15;
      const nextScale = clamp(scale + step, 1, 3);
      if (nextScale === scale) return;
      scale = nextScale;
      clampPan();
      applyTransform();
    }, { passive: false });

    // Click on image to open global lightbox
    img.addEventListener('click', () => {
      // if zoomed, treat click as no-op to avoid annoyance
      if (scale > 1.01) return;
      const it = images[index];
      window.__EBDA_LIGHTBOX_OPEN__?.(it.src, it.cap || 'عرض الصورة');
    });

    // Init with default
    setService(serviceId);

    return {
      setService,
      resetZoom,
    };
  }

  /* ---------- Social Proof Live (Trend) ---------- */
  
function initLiveViewersBadge() {
  const badge = document.createElement('div');
  badge.className = 'live-viewers';
  badge.innerHTML =
    '<span class="dot" aria-hidden="true"></span><span>الآن <b id="lvNum">3</b> زائر يشاهد الصفحة</span>';
  document.body.appendChild(badge);

  let n = 3 + Math.floor(Math.random() * 4);
  const numEl = badge.querySelector('#lvNum');

  const tick = () => {
    const delta = Math.random() < 0.5 ? -1 : 1;
    n = Math.min(12, Math.max(2, n + delta));
    if (numEl) numEl.textContent = String(n);
  };

  setInterval(tick, 4200);
}

function initResumePill() {
  // Shows a small “continue last service” pill (uses SERVICE_STORAGE_KEY)
  const lastService = ls.get(SERVICE_STORAGE_KEY, '');
  if (!lastService || !SERVICE_CONFIG[lastService]) return;

  // If offer dismissed within 24h, don’t show pill
  try {
    const dismissedAt = Number(ls.get(DISMISS_STORAGE_KEY, '0') || '0');
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_TTL_MS) return;
  } catch (e) {}

  const host = document.createElement('div');
  host.className = 'resume-pill';
  host.innerHTML = `
    <div class="card">
      <div class="meta">
        <div class="badge" aria-hidden="true">⏪</div>
        <div style="min-width:0">
          <div class="title">متابعة آخر اختيار</div>
          <div class="sub">الخدمة: <b style="color:#f3e4b3">${SERVICE_CONFIG[lastService].label}</b></div>
        </div>
      </div>
      <div class="actions">
        <button class="ghost" type="button" data-resume-close>إخفاء</button>
        <button class="primary" type="button" data-resume-open>افتح العرض</button>
      </div>
    </div>
  `;
  document.body.appendChild(host);

  host.querySelector('[data-resume-close]')?.addEventListener('click', () => host.remove());
  host.querySelector('[data-resume-open]')?.addEventListener('click', () => {
    const select = document.getElementById('offerService');
    if (select) select.value = lastService;
    document.getElementById('offerOpen')?.click();
  });
}

function initSocialProof() {
    const host = qs('#socialProof');
    if (!host) return;

    // Do not spam users with reduced motion
    if (prefersReducedMotion) return;

    const neighborhoods = ['الياسمين', 'الملقا', 'العارض', 'النرجس', 'الملز', 'الروابي', 'النسيم', 'ظهرة لبن', 'العقيق', 'لبن', 'السويدي', 'قرطبة'];
    const quickTimes = ['قبل دقيقة', 'قبل دقيقتين', 'قبل 5 دقائق', 'قبل 8 دقائق', 'قبل 12 دقيقة', 'قبل 20 دقيقة'];
    const actions = [
      { svc: 'sandwich', text: 'طلب معاينة لسندوتش بنل' },
      { svc: 'car-shades', text: 'استفسار عن مظلات سيارات' },
      { svc: 'stores', text: 'طلب تسعير مستودع/هنجر' },
      { svc: 'steel', text: 'طلب سواتر وحدادة' },
    ];

    let timer = null;
    let showing = false;

    const show = () => {
      if (showing) return;
      showing = true;

      const n = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
      const t = quickTimes[Math.floor(Math.random() * quickTimes.length)];
      const a = actions[Math.floor(Math.random() * actions.length)];

      host.innerHTML = `
        <button class="sp-toast" type="button" aria-label="إشعار اجتماعي (اضغط لفتح العرض)">
          <span class="sp-live"><span class="sp-dot"></span> Live</span>
          <div class="sp-body">
            <div class="sp-title">${a.text}</div>
            <div class="sp-sub">حي ${n} • ${t}</div>
          </div>
          <div class="sp-cta">فتح</div>
        </button>
      `;

      const btn = qs('.sp-toast', host);
      requestAnimationFrame(() => btn?.classList.add('is-show'));

      btn?.addEventListener('click', () => {
        window.__EBDA_OPEN_OFFER__?.(a.svc);
        hide(true);
      });

      // auto hide after 5s
      setTimeout(() => hide(), 5200);
    };

    const hide = (fast = false) => {
      const btn = qs('.sp-toast', host);
      if (!btn) {
        showing = false;
        return;
      }
      btn.classList.remove('is-show');
      setTimeout(() => {
        host.innerHTML = '';
        showing = false;
      }, fast ? 120 : 260);
    };

    const loop = () => {
      // random interval 10-18s
      const wait = 10000 + Math.floor(Math.random() * 8000);
      timer = setTimeout(() => {
        show();
        loop();
      }, wait);
    };

    loop();

    // pause when offer modal is open
    const modal = qs('#offerModal');
    if (modal) {
      const obs = new MutationObserver(() => {
        if (modal.classList.contains('is-open')) {
          if (timer) clearTimeout(timer);
          timer = null;
          hide(true);
        } else if (!timer) {
          loop();
        }
      });
      obs.observe(modal, { attributes: true, attributeFilter: ['class'] });
    }
  }

})();