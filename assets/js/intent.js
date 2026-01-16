(function(){
  const WA_NUMBER = "966562526395";

  // Level 2 = إعادة ترتيب أقسام الصفحة (Modules) حسب نية الزائر
  const LEVEL2 = true;

  const INTENTS = {
    laser: {
      key: "laser",
      label: "مظلات ليزر",
      cta: "اطلب تسعيرة مظلات ليزر الآن",
      pageHint: "مزودة بتصاميم قص ليزر وإضاءة فخمة حسب الطلب.",
      keywords: ["ليزر","laser","قص","قص ليزر","مظلات ليزر","ليزر مظلات"]
    },
    wood: {
      key: "wood",
      label: "بديل خشب",
      cta: "اطلب تسعيرة بديل خشب الآن",
      pageHint: "شكل خشبي فاخر بخامات مقاومة للشمس والحرارة.",
      keywords: ["بديل خشب","خشب","wood","خشبي","بديل"]
    },
    sandwich: {
      key: "sandwich",
      label: "ساندوتش بانل",
      cta: "اطلب تسعيرة ساندوتش بانل الآن",
      pageHint: "حلول عزل حراري وسرعة تركيب للملاحق والغرف والسقوف.",
      keywords: ["ساندوتش","بانل","panel","sandwich","ساندوتش بانل","ملاحق"]
    }
  };

  function normalize(str){
    return (str || "").toString().toLowerCase();
  }

  function getParam(name){
    try{
      const u = new URL(window.location.href);
      return u.searchParams.get(name);
    }catch(e){ return null; }
  }

  function detectIntent(){
    // 1) Explicit param
    const p = normalize(getParam("intent"));
    if(p && INTENTS[p]) return p;

    // 2) UTM signals
    const utm = ["utm_term","utm_content","utm_campaign","utm_source"].map(getParam).filter(Boolean).join(" ");
    const utmN = normalize(utm);
    if(utmN){
      for(const k in INTENTS){
        if(INTENTS[k].keywords.some(w => utmN.includes(normalize(w)))) return k;
      }
    }

    // 3) Page path hint
    const path = normalize(window.location.pathname);
    if(path.includes("sandwich")) return "sandwich";
    if(path.includes("mazallat")) {
      // If user came from laser/wood keyword in referrer, use it
      const ref = normalize(document.referrer);
      if(ref){
        for(const k of ["laser","wood"]){
          if(INTENTS[k].keywords.some(w => ref.includes(normalize(w)))) return k;
        }
      }
      return "wood"; // sensible default within mazallat page
    }

    // 4) Previous choice
    try{
      const saved = JSON.parse(localStorage.getItem("ibdaa_intent") || "null");
      if(saved && saved.key && INTENTS[saved.key]) return saved.key;
    }catch(e){}

    return null;
  }

  function saveIntent(key){
    try{
      localStorage.setItem("ibdaa_intent", JSON.stringify({key, ts: Date.now()}));
    }catch(e){}
  }

  function clearIntent(){
    try{ localStorage.removeItem("ibdaa_intent"); }catch(e){}
  }

  function buildWhatsAppMessage(intentKey, extra){
    const base = "السلام عليكم، أرغب في معاينة مجانية وتسعيرة لـ";
    const service = intentKey && INTENTS[intentKey] ? INTENTS[intentKey].label : "(حدد الخدمة)";
    const lines = [
      `${base} ${service}.`,
      extra?.city ? `الموقع: ${extra.city}` : null,
      extra?.size ? `المقاس التقريبي: ${extra.size}` : null,
      extra?.name ? `الاسم: ${extra.name}` : null,
      extra?.phone ? `الجوال: ${extra.phone}` : null,
      extra?.note ? `ملاحظات: ${extra.note}` : null
    ].filter(Boolean);
    return lines.join("\n");
  }

  function setWAHrefs(intentKey, extra){
    const msg = encodeURIComponent(buildWhatsAppMessage(intentKey, extra));
    const href = `https://wa.me/${WA_NUMBER}?text=${msg}`;
    document.querySelectorAll('a[data-wa], a[href*="wa.me/'+WA_NUMBER+'"]').forEach(a => {
      a.href = href;
    });
  }

  function applyIntentUI(intentKey){
    document.documentElement.dataset.intent = intentKey || "";
    // Pills active state
    document.querySelectorAll("[data-intentbar] .intent-pill").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.intent === intentKey);
    });

    // Home spotlight
    const spot = document.querySelector("[data-intent-spotlight]");
    if(spot){
      if(intentKey && INTENTS[intentKey]){
        spot.hidden = false;
        const t = spot.querySelector("[data-intent-title]");
        const l = spot.querySelector("[data-intent-lead]");
        const cta = spot.querySelector("[data-intent-cta]");
        if(t) t.textContent = INTENTS[intentKey].label + " — خيارات مختارة لك";
        if(l) l.textContent = INTENTS[intentKey].pageHint;
        if(cta) cta.textContent = INTENTS[intentKey].cta;

        // Inject thumbnails
        const gal = spot.querySelector("[data-intent-gallery]");
        if(gal){
          const images = getIntentImages(intentKey);
          gal.innerHTML = images.slice(0,6).map(src => (
            `<button class="sg-thumb" type="button" data-open-lightbox data-src="${src}">
              <img src="${src}" alt="${INTENTS[intentKey].label} - الرياض السعودية" loading="lazy">
             </button>`
          )).join("");
        }
      }else{
        spot.hidden = true;
      }
    }

    // Reorder & focus services on home
    const services = document.querySelector("#services .grid");
    if(services){
      const cards = Array.from(services.querySelectorAll(".card.service"));
      const primary = findPrimaryCard(cards, intentKey);
      if(primary){
        services.insertBefore(primary, cards[0]);
        cards.forEach(c => c.classList.toggle("dim", c !== primary && !!intentKey));
      }else{
        cards.forEach(c => c.classList.remove("dim"));
      }
    }

    // Update WhatsApp links
    setWAHrefs(intentKey);

    // Level 2: Reorder modules + collapse non-primary sections + filter portfolio gallery
    if(LEVEL2) applyLevel2(intentKey);
  }

  function findPrimaryCard(cards, intentKey){
    if(!intentKey) return null;
    if(intentKey === "sandwich"){
      return cards.find(c => c.querySelector('a[href*="sandwich.html"]'));
    }
    if(intentKey === "laser" || intentKey === "wood"){
      return cards.find(c => c.querySelector('a[href*="mazallat.html"]'));
    }
    return null;
  }

  function getIntentImages(intentKey){
    // Keep it simple & robust: use known folders with fallbacks
    const map = {
      laser: [
        "assets/img/mazallat_modern/17.webp",
        "assets/img/mazallat_modern/18.webp",
        "assets/img/mazallat_modern/19.webp",
        "assets/img/mazallat_modern/20.webp",
        "assets/img/mazallat_modern/21.webp"
      ],
      wood: [
        "assets/img/mazallat_modern/20.webp",
        "assets/img/mazallat_modern/21.webp",
        "assets/img/mazallat_modern/19.webp",
        "assets/img/mazallat_modern/18.webp",
        "assets/img/mazallat_modern/17.webp"
      ],
      sandwich: [
        "assets/img/sandwich_panel/20.webp",
        "assets/img/sandwich_panel/21.webp",
        "assets/img/sandwich_panel/22.webp",
        "assets/img/sandwich_panel/23.webp",
        "assets/img/sandwich_panel/24.webp",
        "assets/img/sandwich_panel/25.webp"
      ]
    };
    return map[intentKey] || [];
  }

  // ---------------- Level 2 (Module-based page generation) ----------------
  const LEVEL2_STATE = {
    ready: false,
    originalKeys: [],
    nodesByKey: new Map(),
    footer: null,
  };

  function initLevel2(){
    if(LEVEL2_STATE.ready) return;
    const mods = Array.from(document.querySelectorAll("[data-module]"));
    mods.forEach(m => {
      const k = m.dataset.module;
      if(k) LEVEL2_STATE.nodesByKey.set(k, m);
    });
    LEVEL2_STATE.originalKeys = mods.map(m => m.dataset.module);
    LEVEL2_STATE.footer = document.querySelector(".footer");
    LEVEL2_STATE.ready = true;
  }

  function applyLevel2(intentKey){
    initLevel2();
    const { footer, nodesByKey, originalKeys } = LEVEL2_STATE;
    if(!footer || !footer.parentNode) return;

    const orderMap = {
      laser:   ["hero","spotlight","services","portfolio","beforeafter","car","about","why","cta"],
      wood:    ["hero","spotlight","services","car","portfolio","beforeafter","about","why","cta"],
      sandwich:["hero","spotlight","services","portfolio","about","why","beforeafter","cta","car"],
    };

    const order = (intentKey && orderMap[intentKey]) ? orderMap[intentKey] : originalKeys;
    order.forEach(k => {
      const el = nodesByKey.get(k);
      if(el) footer.parentNode.insertBefore(el, footer);
    });

    // Hide modules that are not relevant for a given intent
    const car = nodesByKey.get("car");
    if(car) car.hidden = (intentKey === "sandwich");

    // Filter portfolio images to the selected intent
    filterPortfolio(intentKey);

    // Collapse non-primary sections to keep the flow focused
    collapseNonPrimary(intentKey, order);
  }

  function filterPortfolio(intentKey){
    const sec = document.querySelector('[data-module="portfolio"]');
    if(!sec) return;
    const items = Array.from(sec.querySelectorAll('.g-item'));
    if(!intentKey){
      items.forEach(i => i.hidden = false);
      return;
    }

    const allow = new Set(getIntentImages(intentKey));
    items.forEach(i => {
      const src = i.querySelector('img')?.getAttribute('src') || "";
      i.hidden = allow.size ? !allow.has(src) : false;
    });

    // Fallback by folder if the exact list doesn't match
    if(items.every(i => i.hidden)){
      items.forEach(i => {
        const src = i.querySelector('img')?.getAttribute('src') || "";
        const ok = intentKey === "sandwich" ? src.includes("sandwich_panel") : src.includes("mazallat_modern");
        i.hidden = !ok;
      });
    }
  }

  function collapseNonPrimary(intentKey, order){
    const sections = Array.from(document.querySelectorAll('[data-module]'));
    if(!intentKey){
      sections.forEach(sec => {
        sec.classList.remove('module-collapsed','expanded');
        const bar = sec.querySelector('.collapse-bar');
        if(bar) bar.hidden = true;
      });
      return;
    }

    const keepCount = intentKey === 'sandwich' ? 4 : 5;
    const keep = new Set(order.slice(0, keepCount).concat(['hero','spotlight','cta']));

    sections.forEach(sec => {
      const key = sec.dataset.module;
      if(!key) return;
      if(key === 'hero' || key === 'spotlight') return;

      const shouldCollapse = !keep.has(key);
      if(shouldCollapse){
        ensureCollapser(sec);
        sec.classList.add('module-collapsed');
        sec.classList.remove('expanded');
        const bar = sec.querySelector('.collapse-bar');
        if(bar) bar.hidden = false;
      }else{
        sec.classList.remove('module-collapsed');
        const bar = sec.querySelector('.collapse-bar');
        if(bar) bar.hidden = true;
      }
    });
  }

  function ensureCollapser(section){
    if(section.querySelector('.collapse-bar')) return;
    const container = section.querySelector('.container');
    if(!container) return;

    const bar = document.createElement('div');
    bar.className = 'collapse-bar';
    bar.innerHTML = '<button type="button" class="btn ghost collapse-toggle">عرض المزيد</button>';
    container.appendChild(bar);

    const btn = bar.querySelector('button');
    btn.addEventListener('click', () => {
      const expanded = section.classList.toggle('expanded');
      if(expanded){
        section.classList.remove('module-collapsed');
        btn.textContent = 'إخفاء';
      }else{
        section.classList.add('module-collapsed');
        btn.textContent = 'عرض المزيد';
        section.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  }

  function wireIntentBar(){
    const bar = document.querySelector("[data-intentbar]");
    if(!bar) return;

    bar.querySelectorAll(".intent-pill").forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.intent;
        saveIntent(key);
        applyIntentUI(key);
        // smooth scroll on home
        const spot = document.querySelector("[data-intent-spotlight]");
        if(spot) spot.scrollIntoView({behavior:"smooth", block:"start"});
      });
    });

    const clear = bar.querySelector("[data-intent-clear]");
    if(clear){
      clear.addEventListener("click", (e) => {
        e.preventDefault();
        clearIntent();
        applyIntentUI(null);
      });
    }
  }

  function wireSpotlightForm(){
    const form = document.querySelector("[data-intent-form]");
    if(!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const intentKey = document.documentElement.dataset.intent || null;
      const data = Object.fromEntries(new FormData(form).entries());
      const msg = encodeURIComponent(buildWhatsAppMessage(intentKey, data));
      const href = `https://wa.me/${WA_NUMBER}?text=${msg}`;
      window.open(href, "_blank", "noopener");
    });
  }

  function wireSpotlightLightbox(){
    // If the page already has lightbox.js, reuse it by simulating clicks on a hidden gallery.
    // Simple local lightbox for spotlight thumbs:
    const overlay = document.createElement("div");
    overlay.className = "spotlight-lb";
    overlay.innerHTML = `
      <div class="slb-backdrop" data-s-close></div>
      <div class="slb-dialog" role="dialog" aria-modal="true" aria-label="تكبير الصورة">
        <button class="slb-close" type="button" data-s-close aria-label="إغلاق">✕</button>
        <img class="slb-img" alt="">
      </div>
    `;
    document.body.appendChild(overlay);
    const img = overlay.querySelector(".slb-img");

    function open(src){
      img.src = src;
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden","false");
    }
    function close(){
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden","true");
      img.src = "";
    }
    overlay.querySelectorAll("[data-s-close]").forEach(el => el.addEventListener("click", close));
    document.addEventListener("keydown", (e) => {
      if(e.key === "Escape") close();
    });

    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-open-lightbox]");
      if(!btn) return;
      const src = btn.getAttribute("data-src");
      if(src) open(src);
    });
  }

  // Init
  const intentKey = detectIntent();
  if(intentKey) saveIntent(intentKey);

  wireIntentBar();
  wireSpotlightForm();
  wireSpotlightLightbox();
  applyIntentUI(intentKey);

})();