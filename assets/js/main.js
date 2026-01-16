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
  const countEls = document.querySelectorAll('[data-count]');
  if(countEls.length){
    const cio = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.getAttribute('data-count') || '0', 10);
        const start = 0;
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

  // Scrollytelling (Sandwich Panel) — Scroll-linked & pinned
  const scrolly = document.querySelector('[data-scrolly="sandwich"]');
  if(scrolly){
    const steps = Array.from(scrolly.querySelectorAll('.step'));
    const build = scrolly.querySelector('.build');
    const pinEl = scrolly.querySelector('.scrolly-wrap') || scrolly;
    // Graphic element used for micro camera shakes.
    // (Bug fix) Previously referenced as `graphicEl` without being defined.
    const graphicEl = scrolly.querySelector('.scrolly-graphic') || build || scrolly;

    const layers = {
      foundation: scrolly.querySelector('[data-layer="foundation"]'),
      frame: scrolly.querySelector('[data-layer="frame"]'),
	      walls: scrolly.querySelector('[data-layer="walls"]'),
      roof: scrolly.querySelector('[data-layer="roof"]'),
      shine: scrolly.querySelector('[data-layer="shine"]'),
      delivery: scrolly.querySelector('[data-layer="delivery"]'),
    };

    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Cinematic micro-interactions (sound + shake + golden shine) ---
    // NOTE: Browsers block audio until a user gesture. We'll "arm" audio on first interaction.
    let audioCtx = null;
    let audioArmed = false;
    const armAudio = ()=>{
      if(audioArmed) return;
      try{
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if(!Ctx) return;
        audioCtx = new Ctx();
        audioArmed = true;
      }catch(_){/* ignore */}
    };
    window.addEventListener('pointerdown', armAudio, { once:true, passive:true });

    const playHit = ()=>{
      if(!audioCtx) return;
      const t = audioCtx.currentTime;
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'square';
      o.frequency.setValueAtTime(190, t);
      o.frequency.exponentialRampToValueAtTime(110, t + 0.06);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start(t);
      o.stop(t + 0.10);
    };

    const playChime = ()=>{
      if(!audioCtx) return;
      const t = audioCtx.currentTime;
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(880, t);
      o.frequency.exponentialRampToValueAtTime(660, t + 0.22);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.14, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start(t);
      o.stop(t + 0.36);
    };

    const activateStep = (idx)=>{
      steps.forEach((s,i)=> s.classList.toggle('active', i === idx));
    };

    const setOrb = (p)=>{
      if(!build) return;
      const ox = Math.sin(p * Math.PI * 2) * 22;
      const oy = Math.cos(p * Math.PI * 2) * 14;
      build.style.setProperty('--sx', ox.toFixed(1)+'px');
      build.style.setProperty('--sy', oy.toFixed(1)+'px');
    };

    // Preferred: GSAP ScrollTrigger (pinned + scrub)
    if(window.gsap && window.ScrollTrigger && !prefersReduced){
      try{
        window.gsap.registerPlugin(window.ScrollTrigger);

        // Clear any inline styles from fallback mode
        Object.values(layers).forEach((el)=>{
          if(!el) return;
          el.style.removeProperty('opacity');
          el.style.removeProperty('transform');
        });

        const mm = window.gsap.matchMedia();
        mm.add(
          {
            isDesktop: '(min-width: 901px)',
            isMobile: '(max-width: 900px)',
          },
          (ctx)=>{
            const endDist = ctx.conditions.isMobile ? 1600 : 2400;

            // Initial states (scenario: foundation → steel frame → walls → roof → shine)
            window.gsap.set(layers.foundation, { opacity: 0, y: 20 });
            window.gsap.set(layers.frame, { opacity: 0, y: -160, scale: 1.01, filter: 'contrast(1.12) brightness(1.06)' });

	            // Walls stage (single full image) – show it as the third step
	            window.gsap.set(layers.walls, { opacity: 0, y: 10, scale: 1.005, filter: 'contrast(1.06) brightness(1.02)' });

            window.gsap.set(layers.roof, { opacity: 0, y: -180, scale: 0.99, transformOrigin: '50% 15%' });
            window.gsap.set(layers.shine, { opacity: 0, scale: 1.02, backgroundPosition: '0% 50%' });
            window.gsap.set(layers.delivery, { opacity: 0, y: 18, scale: 0.98, transformOrigin: '100% 100%' });

            // Progress thresholds (for 1-shot sound triggers)
            let prevP = 0;

            // Timeline linked to scroll progress
            const tl = window.gsap.timeline({
              defaults: { ease: 'none' },
              scrollTrigger: {
                trigger: scrolly,
                start: ctx.conditions.isMobile ? 'top top+=64' : 'top top+=80',
                end: '+=' + endDist,
                scrub: 0.9,
                pin: pinEl,
                anticipatePin: 1,
                onUpdate: (self)=>{
                  const p = self.progress || 0;
                  const stepIdx = (p < 0.24) ? 0 : (p < 0.48) ? 1 : (p < 0.76) ? 2 : 3;
                  activateStep(stepIdx);
                  setOrb(p);

                  // Cinematic sound cues (forward direction only)
                  if(p > prevP){
                    if(prevP < 0.26 && p >= 0.26) playHit();        // steel locks in
                    if(prevP < 0.74 && p >= 0.74) playChime();      // roof completion
                  }
                  prevP = p;
                },
              },
            });

            // Keyframes (scroll-linked, scrubbed)
            tl.to(layers.foundation, { opacity: 1, y: 0 }, 0.02)
              // Steel skeleton lands and “locks”
              .to(layers.frame, { opacity: 1, y: 0, scale: 1 }, 0.26)

              // Subtle camera shake when the steel skeleton "clicks" into place
              .to(graphicEl, { x: -5, y: 2, rotation: -0.35, duration: 0.018, ease: 'power4.out' }, 0.315)
              .to(graphicEl, { x: 4, y: -2, rotation: 0.25, duration: 0.018, ease: 'power4.out' }, 0.335)
              .to(graphicEl, { x: -3, y: 1, rotation: -0.18, duration: 0.018, ease: 'power4.out' }, 0.355)
              .to(graphicEl, { x: 0, y: 0, rotation: 0, duration: 0.03, ease: 'power4.out' }, 0.375)

              // Walls (single stage image)
              .to(layers.walls, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, 0.50)

              // Roof lands and completes the build
              .to(layers.roof, { opacity: 1, y: 0, scale: 1 }, 0.74)
              // Golden flash + shine sweep when roof completes
              .to(graphicEl, { x: -3, y: 1, rotation: -0.18, duration: 0.015, ease: 'power4.out' }, 0.765)
              .to(graphicEl, { x: 2, y: -1, rotation: 0.12, duration: 0.015, ease: 'power4.out' }, 0.78)
              .to(graphicEl, { x: 0, y: 0, rotation: 0, duration: 0.02, ease: 'power4.out' }, 0.80)

              .to(layers.roof, { filter: 'contrast(1.10) brightness(1.05) saturate(1.06) drop-shadow(0 24px 66px rgba(0,0,0,.62)) drop-shadow(0 12px 24px rgba(0,0,0,.45)) drop-shadow(0 0 30px rgba(181,137,81,.62))', duration: 0.07 }, 0.80)
              .to(layers.roof, { filter: '', duration: 0.08 }, 0.90)

              .to(layers.shine, { opacity: 1, scale: 1 }, 0.82)
              .to(layers.shine, { backgroundPosition: '200% 50%', duration: 0.18 }, 0.82)
              .to(layers.shine, { opacity: 0.0, duration: 0.12 }, 0.94)

              // Delivery stamp (final handover)
              .to(layers.delivery, { opacity: 1, y: 0, scale: 1, duration: 0.22, ease: 'power2.out' }, 0.90);

// A subtle “lock-in” at the end (cinematic)
	            tl.to([layers.foundation, layers.frame, layers.walls, layers.roof], { y: -2 }, 0.92)
	              .to([layers.foundation, layers.frame, layers.walls, layers.roof], { y: 0 }, 0.96);

// Ensure correct state on load
            activateStep(0);
            setOrb(0);

            return ()=> {};
          }
        );

      }catch(e){
        console.warn('Scrolly GSAP init failed; falling back.', e);
      }
    }

    // Fallback: lightweight scroll-linked progress (no external libs)
    if(!(window.gsap && window.ScrollTrigger) || prefersReduced){
      const clamp = (v)=> Math.max(0, Math.min(1, v));
      const lerp = (a,b,t)=> a + (b-a)*t;
      const smoothstep = (t)=> t*t*(3-2*t);
      const reveal = (p, a, b)=> smoothstep(clamp((p-a)/Math.max(1e-6,(b-a))));

      let raf2 = 0;
      const onScroll = ()=>{
        if(raf2) return;
        raf2 = requestAnimationFrame(()=>{
          raf2 = 0;
          const rect = scrolly.getBoundingClientRect();
          const start = rect.top + window.scrollY;
          const end = start + scrolly.offsetHeight - window.innerHeight;
          const denom = Math.max(1, end - start);
          const p = clamp((window.scrollY - start) / denom);

          const stepIdx = (p < 0.24) ? 0 : (p < 0.48) ? 1 : (p < 0.76) ? 2 : 3;
          activateStep(stepIdx);

          const setLayer = (el, t0, t1, xFrom, yFrom)=>{
            if(!el) return;
            const t = reveal(p, t0, t1);
            const x = lerp(xFrom, 0, t);
            const y = lerp(yFrom, 0, t);
            el.style.opacity = (0.02 + 0.98*t).toFixed(3);
            el.style.transform = `translate(${x}px, ${y}px)`;
          };
          setLayer(layers.foundation, 0.00, 0.24, 0, 18);
          setLayer(layers.frame, 0.18, 0.48, 0, -140);
	          setLayer(layers.walls, 0.40, 0.76, 0, 60);
          setLayer(layers.roof, 0.66, 0.95, 0, -160);
          setLayer(layers.shine, 0.80, 1.00, 0, 0);
          setOrb(p);
});
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      onScroll();
    }
  }
})();