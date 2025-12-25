/*
  Trend 3.2 — Ebda Althil
  Adds 3 pages (each feature in a dedicated page):
  1) Cinematic Gallery
  2) Material Playground
  3) Project Configurator

  Notes:
  - Designed to be lightweight and not interfere with existing site.js.
  - Runs only when matching data attributes exist.
*/

(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* -------------------------
     Small Utilities
  -------------------------- */
  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function safeJSONParse(str, fallback) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return fallback;
    }
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try {
        ok = document.execCommand('copy');
      } catch (_) {}
      document.body.removeChild(ta);
      return ok;
    }
  }

  function toast(msg) {
    const existing = $('#trendToast');
    if (existing) existing.remove();
    const t = document.createElement('div');
    t.id = 'trendToast';
    t.className =
      'fixed left-1/2 -translate-x-1/2 bottom-6 z-[120] px-4 py-2 rounded-full text-xs font-extrabold ' +
      'bg-black/70 border border-white/10 text-slate-100 shadow-soft backdrop-blur-xl';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }

  /* -------------------------
     1) Cinematic Gallery
  -------------------------- */
  function initCinematicGallery() {
    const root = $('[data-cinema-gallery]');
    if (!root) return;

    const row = $('[data-cinema-row]', root);
    const dotsWrap = $('[data-cinema-dots]', root);
    const cards = $$('[data-cinema-card]', root);
    if (!row || cards.length === 0) return;

    // Dots
    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      cards.forEach((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className =
          'w-2.5 h-2.5 rounded-full bg-white/25 hover:bg-white/50 transition';
        b.setAttribute('aria-label', 'انتقال للصورة ' + (i + 1));
        b.addEventListener('click', () => {
          cards[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        });
        dotsWrap.appendChild(b);
      });
    }

    function setActiveDot(index) {
      if (!dotsWrap) return;
      const dots = Array.from(dotsWrap.children);
      dots.forEach((d, i) => {
        d.className =
          'w-2.5 h-2.5 rounded-full transition ' +
          (i === index ? 'bg-white/90' : 'bg-white/25 hover:bg-white/50');
      });
    }

    // Observe which card is centered
    let current = 0;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = cards.indexOf(e.target);
            if (idx !== -1) {
              current = idx;
              setActiveDot(current);
            }
          }
        });
      },
      {
        root: row,
        threshold: 0.55,
      }
    );
    cards.forEach((c) => obs.observe(c));
    setActiveDot(0);

    // Gentle auto-play (pauses on hover/touch)
    let auto = true;
    let timer = null;
    const start = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        if (!auto) return;
        const next = (current + 1) % cards.length;
        cards[next].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }, 2600);
    };

    row.addEventListener('mouseenter', () => (auto = false));
    row.addEventListener('mouseleave', () => (auto = true));
    row.addEventListener('touchstart', () => (auto = false), { passive: true });
    row.addEventListener('touchend', () => (auto = true), { passive: true });

    start();

    // Copy link
    const copyBtn = $('[data-copy-link]');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const ok = await copyText(location.href);
        toast(ok ? 'تم نسخ الرابط ✅' : 'تعذر النسخ');
      });
    }

    // Micro-tilt for the hero (optional)
    const tilt = $('[data-tilt]');
    if (tilt) {
      const onMove = (ev) => {
        const r = tilt.getBoundingClientRect();
        const x = (ev.clientX - r.left) / r.width;
        const y = (ev.clientY - r.top) / r.height;
        const rx = (0.5 - y) * 6;
        const ry = (x - 0.5) * 10;
        tilt.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      };
      const reset = () => (tilt.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)');
      tilt.addEventListener('mousemove', onMove);
      tilt.addEventListener('mouseleave', reset);
    }
  }

  /* -------------------------
     2) Material Playground
  -------------------------- */
  function initMaterialPlayground() {
    const stage = $('[data-material-playground]');
    if (!stage) return;

    const KEY = 'ebda_material_v1';
    const defaultState = {
      finish: 'matte', // matte|gloss|brushed
      panel: 'obsidian', // obsidian|graphite|sand|storm
      trim: 'gold', // gold|silver|black
      rib: 'micro', // micro|flat
      thickness: '75', // 50|75|100
      shine: 0.7, // 0..1
    };
    let state = { ...defaultState, ...(safeJSONParse(localStorage.getItem(KEY), {})) };

    function applyState() {
      stage.dataset.finish = state.finish;
      stage.dataset.panel = state.panel;
      stage.dataset.trim = state.trim;
      stage.dataset.rib = state.rib;
      stage.style.setProperty('--shine', String(state.shine));
      stage.style.setProperty('--thick', state.thickness + 'mm');

      // UI sync
      const map = {
        finish: '[data-mat=finish]',
        panel: '[data-mat=panel]',
        trim: '[data-mat=trim]',
        rib: '[data-mat=rib]',
        thickness: '[data-mat=thickness]',
      };
      Object.keys(map).forEach((k) => {
        const el = $(map[k]);
        if (!el) return;
        el.value = String(state[k]);
      });
      const shineRange = $('[data-mat=shine]');
      if (shineRange) shineRange.value = String(Math.round(state.shine * 100));

      const out = $('[data-mat=output]');
      if (out) {
        out.textContent =
          `تشطيب: ${labelFinish(state.finish)}\n` +
          `لون اللوح: ${labelPanel(state.panel)}\n` +
          `لون الحليات: ${labelTrim(state.trim)}\n` +
          `النقشة: ${labelRib(state.rib)}\n` +
          `السماكة: ${state.thickness}mm`;
      }
    }

    function labelFinish(v) {
      return v === 'matte' ? 'أسود مطفي' : v === 'gloss' ? 'لامع' : 'معدني (Brushed)';
    }
    function labelPanel(v) {
      return v === 'obsidian'
        ? 'Obsidian Black'
        : v === 'graphite'
          ? 'Graphite'
          : v === 'sand'
            ? 'Desert Sand'
            : 'Storm Grey';
    }
    function labelTrim(v) {
      return v === 'gold' ? 'ذهبي' : v === 'silver' ? 'فضي' : 'أسود';
    }
    function labelRib(v) {
      return v === 'micro' ? 'Micro Rib' : 'Smooth Flat';
    }

    function save() {
      localStorage.setItem(KEY, JSON.stringify(state));
      toast('تم حفظ الاختيار ✅');
    }

    // Bind inputs
    $$('[data-mat]', document).forEach((el) => {
      const key = el.getAttribute('data-mat');
      if (!key) return;
      el.addEventListener('change', () => {
        if (key === 'shine') {
          state.shine = clamp(Number(el.value) / 100, 0, 1);
        } else {
          state[key] = String(el.value);
        }
        applyState();
        save();
      });
    });

    // Presets
    $$('[data-preset]', stage).forEach((b) => {
      b.addEventListener('click', () => {
        const preset = b.getAttribute('data-preset');
        if (preset === 'luxe') {
          state = { ...state, finish: 'matte', panel: 'obsidian', trim: 'gold', rib: 'micro', thickness: '75', shine: 0.8 };
        } else if (preset === 'industrial') {
          state = { ...state, finish: 'brushed', panel: 'storm', trim: 'silver', rib: 'flat', thickness: '100', shine: 0.65 };
        } else if (preset === 'desert') {
          state = { ...state, finish: 'matte', panel: 'sand', trim: 'black', rib: 'micro', thickness: '75', shine: 0.55 };
        }
        applyState();
        save();
      });
    });

    const resetBtn = $('[data-mat-reset]');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        state = { ...defaultState };
        applyState();
        save();
      });
    }

    const copyBtn = $('[data-mat-copy]');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const out = $('[data-mat=output]');
        if (!out) return;
        const ok = await copyText(out.textContent || '');
        toast(ok ? 'تم نسخ المواصفات ✅' : 'تعذر النسخ');
      });
    }

    applyState();
  }

  /* -------------------------
     3) Configurator
  -------------------------- */
  function initConfigurator() {
    const root = $('[data-configurator]');
    if (!root) return;

    const KEY_SERVICE = 'ebda_service_pref';
    const serviceCards = $$('[data-service]', root);
    const nextBtns = $$('[data-next]', root);
    const prevBtns = $$('[data-prev]', root);
    const steps = $$('[data-step]', root);
    const progress = $('[data-step-progress]', root);
    const summaryBox = $('[data-summary]', root);
    const btnSend = $('[data-send]', root);

    let step = 0;
    let state = {
      service: localStorage.getItem(KEY_SERVICE) || '',
      length: '',
      width: '',
      height: '',
      city: '',
      usage: '',
      thickness: '75',
      insulation: 'PU',
      doors: '1',
      windows: '1',
      speed: 'عادي',
      notes: '',
    };

    function showStep(i) {
      step = clamp(i, 0, steps.length - 1);
      steps.forEach((s, idx) => {
        s.classList.toggle('hidden', idx !== step);
      });
      if (progress) {
        const pct = Math.round(((step + 1) / steps.length) * 100);
        progress.style.width = pct + '%';
      }
      updateSummary();
    }

    function selectService(value) {
      state.service = value;
      localStorage.setItem(KEY_SERVICE, value);
      serviceCards.forEach((c) => {
        c.classList.toggle('ring-2', c.getAttribute('data-service') === value);
        c.classList.toggle('ring-amber-400/70', c.getAttribute('data-service') === value);
      });
    }

    serviceCards.forEach((card) => {
      card.addEventListener('click', () => selectService(card.getAttribute('data-service') || ''));
      // preselect
      if (state.service && card.getAttribute('data-service') === state.service) {
        selectService(state.service);
      }
    });

    // Bind inputs
    const bind = (sel, key, transform = (v) => v) => {
      const el = $(sel, root);
      if (!el) return;
      el.value = state[key] || '';
      el.addEventListener('input', () => {
        state[key] = transform(el.value);
        updateSummary();
      });
      el.addEventListener('change', () => {
        state[key] = transform(el.value);
        updateSummary();
      });
    };

    bind('[name=length]', 'length');
    bind('[name=width]', 'width');
    bind('[name=height]', 'height');
    bind('[name=city]', 'city');
    bind('[name=usage]', 'usage');
    bind('[name=thickness]', 'thickness');
    bind('[name=insulation]', 'insulation');
    bind('[name=doors]', 'doors');
    bind('[name=windows]', 'windows');
    bind('[name=speed]', 'speed');
    bind('[name=notes]', 'notes');

    function estimateRange() {
      // Very rough ranges (intentionally conservative) — for trust, show as "تقريبي".
      // We only give a range, not a fixed price.
      const L = Number(state.length) || 0;
      const W = Number(state.width) || 0;
      const area = L > 0 && W > 0 ? L * W : 0;

      let baseMin = 0;
      let baseMax = 0;
      const thick = Number(state.thickness) || 75;
      const thickFactor = thick >= 100 ? 1.22 : thick >= 75 ? 1.1 : 1.0;

      if (state.service === 'sandwich') {
        baseMin = 240;
        baseMax = 420;
      } else if (state.service === 'car') {
        baseMin = 180;
        baseMax = 320;
      } else if (state.service === 'stores') {
        baseMin = 260;
        baseMax = 480;
      } else if (state.service === 'steel') {
        baseMin = 140;
        baseMax = 280;
      } else {
        baseMin = 0;
        baseMax = 0;
      }

      let min = area ? Math.round(area * baseMin * thickFactor) : 0;
      let max = area ? Math.round(area * baseMax * thickFactor) : 0;

      // Add simple add-ons
      const doors = Number(state.doors) || 0;
      const windows = Number(state.windows) || 0;
      min += doors * 350 + windows * 250;
      max += doors * 900 + windows * 650;

      if (state.speed === 'مستعجل') {
        min = Math.round(min * 1.08);
        max = Math.round(max * 1.15);
      }

      return { area, min, max };
    }

    function serviceLabel(v) {
      return v === 'sandwich'
        ? 'سندوتش بنل'
        : v === 'car'
          ? 'مظلات سيارات'
          : v === 'stores'
            ? 'مستودعات/هناجر'
            : v === 'steel'
              ? 'سواتر/حدادة'
              : '';
    }

    function insulationLabel(v) {
      return v === 'PU' ? 'PU (بولي يوريثان)' : v === 'PIR' ? 'PIR' : 'صوف صخري';
    }

    function updateSummary() {
      if (!summaryBox) return;
      const est = estimateRange();
      const svc = serviceLabel(state.service) || '—';
      const dims = state.length && state.width ? `${state.length}×${state.width}` : '—';
      const h = state.height ? state.height + 'م' : '—';
      const areaTxt = est.area ? est.area.toFixed(1) + ' م²' : '—';
      const priceTxt = est.min && est.max ? `${formatSAR(est.min)} – ${formatSAR(est.max)}` : '—';

      summaryBox.innerHTML = `
        <div class="grid sm:grid-cols-2 gap-3 text-[11px] text-slate-200">
          <div class="glass rounded-2xl border border-white/10 p-3">
            <div class="text-slate-400">الخدمة</div>
            <div class="font-extrabold text-slate-50 mt-1">${svc}</div>
          </div>
          <div class="glass rounded-2xl border border-white/10 p-3">
            <div class="text-slate-400">الأبعاد</div>
            <div class="font-extrabold text-slate-50 mt-1">${dims} (ارتفاع: ${h})</div>
          </div>
          <div class="glass rounded-2xl border border-white/10 p-3">
            <div class="text-slate-400">المساحة التقريبية</div>
            <div class="font-extrabold text-slate-50 mt-1">${areaTxt}</div>
          </div>
          <div class="glass rounded-2xl border border-white/10 p-3">
            <div class="text-slate-400">تقدير مبدئي (تقريبي)</div>
            <div class="font-extrabold text-accent mt-1">${priceTxt}</div>
          </div>
        </div>
        <div class="mt-3 text-[11px] text-slate-400 leading-relaxed">
          هذا التقدير <span class="text-slate-200 font-semibold">مبدئي</span> ويتغير حسب موقع التنفيذ، نوع الحديد، التشطيب، والملحقات.
          النتيجة النهائية تكون بعد المعاينة أو استلام صور واضحة للموقع.
        </div>
      `;
    }

    function formatSAR(n) {
      try {
        return new Intl.NumberFormat('ar-SA').format(n) + ' ر.س';
      } catch (_) {
        return String(n) + ' ر.س';
      }
    }

    function validateStep(i) {
      if (i === 0) {
        if (!state.service) {
          toast('اختر الخدمة أولاً');
          return false;
        }
      }
      if (i === 1) {
        if (!state.city) {
          toast('اكتب الحي/المنطقة');
          return false;
        }
        // dimensions optional, but if one provided require others
        const any = state.length || state.width || state.height;
        if (any && (!state.length || !state.width || !state.height)) {
          toast('اكتب الطول + العرض + الارتفاع');
          return false;
        }
      }
      return true;
    }

    nextBtns.forEach((b) => {
      b.addEventListener('click', () => {
        if (!validateStep(step)) return;
        showStep(step + 1);
      });
    });
    prevBtns.forEach((b) => {
      b.addEventListener('click', () => showStep(step - 1));
    });

    // WhatsApp send with "trust" summary confirmation
    if (btnSend) {
      btnSend.addEventListener('click', () => {
        if (!validateStep(steps.length - 1)) return;
        const est = estimateRange();
        const msg = buildMessage(est);
        openConfirm(msg);
      });
    }

    function buildMessage(est) {
      const lines = [];
      lines.push('طلب معاينة/تسعير (من مُكوّن المشروع):');
      lines.push('');
      if (state.service) lines.push('الخدمة: ' + serviceLabel(state.service));
      if (state.city) lines.push('الموقع: ' + state.city);
      if (state.usage) lines.push('الاستخدام: ' + state.usage);
      if (state.length && state.width && state.height) {
        lines.push(`الأبعاد: ${state.length}×${state.width} (ارتفاع ${state.height}م)`);
        lines.push('المساحة التقريبية: ' + (est.area ? est.area.toFixed(1) : '—') + ' م²');
      }
      lines.push('السماكة: ' + state.thickness + 'mm');
      lines.push('العزل: ' + insulationLabel(state.insulation));
      lines.push('الأبواب: ' + state.doors + ' | النوافذ: ' + state.windows);
      lines.push('السرعة: ' + state.speed);
      if (state.notes) {
        lines.push('');
        lines.push('ملاحظات: ' + state.notes);
      }
      if (est.min && est.max) {
        lines.push('');
        lines.push('تقدير مبدئي (تقريبي): ' + formatSAR(est.min) + ' – ' + formatSAR(est.max));
      }
      lines.push('');
      lines.push('أرفقت صور المكان إن أمكن 🙏');
      return lines.join('\n');
    }

    function openConfirm(message) {
      const overlay = $('[data-confirm]');
      const body = $('[data-confirm-body]');
      const ok = $('[data-confirm-ok]');
      const cancel = $('[data-confirm-cancel]');
      if (!overlay || !body || !ok || !cancel) {
        openWhatsApp(message);
        return;
      }
      body.textContent = message;
      overlay.classList.remove('hidden');
      document.documentElement.classList.add('overflow-hidden');

      const close = () => {
        overlay.classList.add('hidden');
        document.documentElement.classList.remove('overflow-hidden');
      };

      cancel.onclick = close;
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
      });
      ok.onclick = () => {
        close();
        openWhatsApp(message);
      };
    }

    function openWhatsApp(text) {
      const num = window.WHATSAPP_NUMBER || '966554803704';
      const url = `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank', 'noopener');
    }

    // Start
    showStep(0);
    updateSummary();
  }

  /* -------------------------
     Boot
  -------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initCinematicGallery();
    initMaterialPlayground();
    initConfigurator();
  });
})();
