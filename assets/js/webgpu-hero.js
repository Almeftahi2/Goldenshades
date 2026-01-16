/* WebGPU Hero (Progressive Enhancement)
   - Adds subtle animated gold lighting behind the hero content.
   - Falls back automatically if WebGPU is not available.
*/

(() => {
  const hero = document.querySelector('.hero');
  const canvas = document.querySelector('[data-webgpu-hero]');
  if (!hero || !canvas) return;

  const reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const lowEnd = (!!navigator.deviceMemory && navigator.deviceMemory <= 4) || (!!navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  if (reduced || lowEnd || !navigator.gpu) {
    hero.classList.add('webgpu-off');
    return;
  }

  const dpr = () => Math.min(window.devicePixelRatio || 1, 1.5);
  const scale = 0.75; // internal render scale for speed

  let tx = 0.30, ty = 0.22;
  let mx = tx, my = ty;

  const setPointer = (clientX, clientY) => {
    const r = hero.getBoundingClientRect();
    const x = (clientX - r.left) / Math.max(1, r.width);
    const y = (clientY - r.top) / Math.max(1, r.height);
    // Boost interaction ~20% by expanding motion around the center
    const boost = 1.2;
    const bx = 0.5 + (x - 0.5) * boost;
    const by = 0.5 + (y - 0.5) * boost;
    tx = Math.min(1, Math.max(0, bx));
    ty = Math.min(1, Math.max(0, by));
  };

  hero.addEventListener('pointermove', (e) => setPointer(e.clientX, e.clientY), { passive: true });

  // Smart focus: when hovering the headline or CTA buttons, shift the light toward them
  let focusOn = false;
  let focusEl = null;
  let fx = tx, fy = ty;

  const clamp01 = (v)=> Math.min(1, Math.max(0, v));
  const updateFocusFromEl = () => {
    if(!focusEl) return;
    const r = hero.getBoundingClientRect();
    const er = focusEl.getBoundingClientRect();
    fx = clamp01(((er.left + er.width/2) - r.left) / Math.max(1, r.width));
    fy = clamp01(((er.top + er.height/2) - r.top) / Math.max(1, r.height));
  };

  const enableFocus = (el) => { focusOn = true; focusEl = el; updateFocusFromEl(); };
  const disableFocus = () => { focusOn = false; focusEl = null; };

  hero.querySelectorAll('.hero-title-box, .actions .btn.primary, .actions .btn.ghost').forEach((el)=>{
    el.addEventListener('pointerenter', ()=> enableFocus(el));
    el.addEventListener('pointerleave', disableFocus);
    el.addEventListener('focus', ()=> enableFocus(el));
    el.addEventListener('blur', disableFocus);
  });


  const WGSL = `
struct U { time: f32, aspect: f32, mx: f32, my: f32 };
@group(0) @binding(0) var<uniform> u: U;

struct Out { @builtin(position) pos: vec4<f32>, @location(0) uv: vec2<f32> };

@vertex fn vs(@builtin(vertex_index) i: u32) -> Out {
  var p = array<vec2<f32>,3>(
    vec2<f32>(-1.0,-1.0),
    vec2<f32>( 3.0,-1.0),
    vec2<f32>(-1.0, 3.0)
  );
  var o: Out;
  o.pos = vec4<f32>(p[i], 0.0, 1.0);
  o.uv = o.pos.xy*0.5 + vec2<f32>(0.5,0.5);
  return o;
}

fn hash(p: vec2<f32>) -> f32 {
  return fract(sin(dot(p, vec2<f32>(127.1,311.7))) * 43758.5453);
}

fn noise(p: vec2<f32>) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let a = hash(i);
  let b = hash(i + vec2<f32>(1.0,0.0));
  let c = hash(i + vec2<f32>(0.0,1.0));
  let d = hash(i + vec2<f32>(1.0,1.0));
  let u2 = f*f*(3.0-2.0*f);
  return mix(a,b,u2.x) + (c-a)*u2.y*(1.0-u2.x) + (d-b)*u2.x*u2.y;
}

@fragment fn fs(i: Out) -> @location(0) vec4<f32> {
  let gold = vec3<f32>(0.71, 0.54, 0.32); // ~ #B58951
  var uv = i.uv;
  uv.x = (uv.x - 0.5) * u.aspect + 0.5;

  let lp = vec2<f32>(u.mx, u.my);
  let d = distance(uv, lp);
  let core = exp(-d*7.0);
  let rim = exp(-d*2.6) - exp(-d*6.2);

  let bands = 0.5 + 0.5 * sin(uv.y*10.0 + u.time*0.35 + uv.x*3.0);
  let n = noise(uv*18.0 + vec2<f32>(u.time*0.05, u.time*0.03));

  let glow = gold * (0.28*core + 0.14*rim) + gold*(0.05*bands) + gold*(0.04*n);
  let vign = smoothstep(0.95, 0.25, distance(i.uv, vec2<f32>(0.5,0.5)));
  let col = glow * vign;
  return vec4<f32>(col, 1.0);
}
`;

  async function init() {
    const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'low-power' });
    if (!adapter) throw new Error('no-adapter');
    const device = await adapter.requestDevice();

    const ctx = canvas.getContext('webgpu');
    const format = navigator.gpu.getPreferredCanvasFormat();
    ctx.configure({ device, format, alphaMode: 'premultiplied' });

    const shader = device.createShaderModule({ code: WGSL });
    const pipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: { module: shader, entryPoint: 'vs' },
      fragment: { module: shader, entryPoint: 'fs', targets: [{ format }] },
      primitive: { topology: 'triangle-list' }
    });

    const ubuf = device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    const bind = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: ubuf } }]
    });

    const resize = () => {
      const r = hero.getBoundingClientRect();
      const w = Math.max(1, Math.floor(r.width * dpr() * scale));
      const h = Math.max(1, Math.floor(r.height * dpr() * scale));
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(hero);
    resize();

    const start = performance.now();

    let raf = 0;
    const io = new IntersectionObserver((entries) => {
      const on = entries[0]?.isIntersecting ?? true;
      if (on && !raf) raf = requestAnimationFrame(frame);
      if (!on && raf) { cancelAnimationFrame(raf); raf = 0; }
    }, { threshold: 0.05 });
    io.observe(hero);

    function frame(now) {
      // Ease pointer
      if (focusOn) updateFocusFromEl();
      const gx = focusOn ? fx : tx;
      const gy = focusOn ? fy : ty;
      mx += (gx - mx) * 0.10;
      my += (gy - my) * 0.10;

      const t = (now - start) / 1000;
      const aspect = canvas.width / Math.max(1, canvas.height);
      device.queue.writeBuffer(ubuf, 0, new Float32Array([t, aspect, mx, my]));

      const encoder = device.createCommandEncoder();
      const pass = encoder.beginRenderPass({
        colorAttachments: [{
          view: ctx.getCurrentTexture().createView(),
          loadOp: 'clear',
          storeOp: 'store',
          clearValue: { r: 0, g: 0, b: 0, a: 0 }
        }]
      });
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bind);
      pass.draw(3);
      pass.end();
      device.queue.submit([encoder.finish()]);

      raf = requestAnimationFrame(frame);
    }

    // Nice default light position
    const r = hero.getBoundingClientRect();
    setPointer(r.left + r.width * tx, r.top + r.height * ty);
  }

  init().catch(() => hero.classList.add('webgpu-off'));
})();
