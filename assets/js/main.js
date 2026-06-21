(function(){
  // Footer year
  const yearEl = document.getElementById('year');
  if(yearEl){
    yearEl.textContent = new Date().getFullYear();
  }

  const hamburger = document.querySelector('[data-hamburger]');
  const menu = document.querySelector('[data-menu]');
  if(hamburger && menu){
    hamburger.addEventListener('click', () => {
      menu.classList.toggle('mobile-open');
      hamburger.setAttribute('aria-expanded', menu.classList.contains('mobile-open') ? 'true' : 'false');
    });
    document.addEventListener('click', (e) => {
      const isClickInside = hamburger.contains(e.target) || menu.contains(e.target);
      if(!isClickInside) menu.classList.remove('mobile-open');
    });
  }

  // Contact form -> WhatsApp
  const form = document.querySelector('[data-wa-form]');
  if(form){
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = (fd.get('name')||'').toString().trim();
      const phone = (fd.get('phone')||'').toString().trim();
      const service = (fd.get('service')||'').toString().trim();
      const area = (fd.get('area')||'').toString().trim();
      const msg = (fd.get('message')||'').toString().trim();

      const lines = [
        'السلام عليكم، أرغب في معاينة مجانية.',
        name ? ('الاسم: ' + name) : '',
        phone ? ('الجوال: ' + phone) : '',
        service ? ('الخدمة: ' + service) : '',
        area ? ('الموقع/الحي: ' + area) : '',
        msg ? ('التفاصيل: ' + msg) : '',
      ].filter(Boolean);

      const text = lines.join('\n');
      const waBase = form.getAttribute('data-wa-base');
      const url = waBase + '?text=' + encodeURIComponent(text);
      window.open(url, '_blank');
    });
  }

  // Reveal on scroll
  const revealEls = document.querySelectorAll('[data-reveal]');
  if(revealEls.length){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, {threshold:0.12});
    revealEls.forEach(el=>io.observe(el));
  }

  // Animated counters (small, safe numbers)
  const countEls = document.querySelectorAll('[data-count], [data-target]');
  if(countEls.length){
    const cio = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.getAttribute('data-count') || el.getAttribute('data-target') || el.textContent || '0', 10);
        if(!Number.isFinite(target) || target <= 0){
          cio.unobserve(el);
          return;
        }
        const current = parseInt(el.textContent || '', 10);
        const start = Number.isFinite(current) && current > 0 ? current : target;
        el.textContent = String(start);
        if(start === target){
          cio.unobserve(el);
          return;
        }
        const dur = 900;
        const t0 = performance.now();
        const step = (t)=>{
          const p = Math.min(1, (t - t0) / dur);
          const val = Math.round(start + (target - start) * (1 - Math.pow(1-p, 3)));
          el.textContent = String(val);
          if(p < 1) requestAnimationFrame(step);
          else el.textContent = String(target);
        };
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, {threshold:0.6});
    countEls.forEach(el=>cio.observe(el));
  }


  // Gold border pointer (interactive)
  const goldTargets = document.querySelectorAll('.card, .ba-card');
  goldTargets.forEach((el)=>{
    const set = (e)=>{
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      el.style.setProperty('--mx', x.toFixed(2) + '%');
      el.style.setProperty('--my', y.toFixed(2) + '%');
    };
    el.addEventListener('pointermove', set, {passive:true});
    el.addEventListener('pointerdown', set, {passive:true});
    el.addEventListener('pointerleave', ()=>{
      el.style.removeProperty('--mx');
      el.style.removeProperty('--my');
    });
  });

  // Before/After sliders
  document.querySelectorAll('.ba-wrap').forEach((wrap)=>{
    const range = wrap.querySelector('.ba-range');
    if(!range) return;
    const setPos = (v)=> wrap.style.setProperty('--pos', v + '%');
    setPos(parseInt(range.value || '50', 10));
    range.addEventListener('input', ()=> setPos(parseInt(range.value, 10)));
  });

})();

// Auto active Navbar link based on current page
document.addEventListener("DOMContentLoaded", function () {
  const navLinks = document.querySelectorAll("nav.menu a");

  function normalizePage(url) {
    if (!url) return "";

    // تجاهل الروابط الخارجية أو روابط الاتصال
    if (
      url.startsWith("#") ||
      url.startsWith("tel:") ||
      url.startsWith("mailto:") ||
      url.startsWith("javascript:")
    ) {
      return "";
    }

    let pathname = "";

    try {
      pathname = new URL(url, window.location.origin).pathname;
    } catch (e) {
      pathname = url;
    }

    // إزالة / الزائدة من النهاية
    pathname = pathname.replace(/\/+$/, "");

    const page = pathname.split("/").pop();

    // توحيد الصفحة الرئيسية
    if (!page || page === "index.html") {
      return "home";
    }

    return page;
  }

  const currentPage = normalizePage(window.location.pathname);

  navLinks.forEach(function (link) {
    const linkHref = link.getAttribute("href");
    const linkPage = normalizePage(linkHref);

    // Remove old active state from all links
    link.classList.remove("active");
    link.removeAttribute("aria-current");

    // Add active state to the current page link only
    if (linkPage && linkPage === currentPage) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });
});
