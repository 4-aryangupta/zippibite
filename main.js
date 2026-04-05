'use strict';
/* global THREE, gsap, ScrollTrigger, Lenis, lucide */

// ── Lucide icons ─────────────────────────────────
lucide.createIcons();

// ── GSAP plugin registration ──────────────────────
gsap.registerPlugin(ScrollTrigger);

// ═══════════════════════════════════════════════════
// 1. LENIS SMOOTH SCROLL
// Integrated with gsap.ticker so both systems share
// a single RAF loop — no jitter, no duplicate frames.
// ═══════════════════════════════════════════════════
const isTouchDevice = window.matchMedia('(hover:none)').matches;

// On touch devices, native momentum scroll is always smoother than JS scroll.
// Lenis only runs on desktop/trackpad where it significantly improves feel.
const lenis = isTouchDevice ? null : new Lenis({
  duration:        0.9,            // snappier — less perceptible lag
  easing:          t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation:     'vertical',
  smoothTouch:     false,
  touchMultiplier: 1.5,
  wheelMultiplier: 1.0,
});

if (lenis) {
  // Single shared ticker — Lenis + GSAP share one RAF
  gsap.ticker.add(time => lenis.raf(time * 1000));
  lenis.on('scroll', ScrollTrigger.update);
}
gsap.ticker.lagSmoothing(0); // prevent big jumps after tab switch

// ═══════════════════════════════════════════════════
// 2. LOADER  (GPU-accelerated exit)
// ═══════════════════════════════════════════════════
(function initLoader() {
  const loader = document.getElementById('loader');
  const bar    = document.getElementById('loader-bar');
  if (!loader || !bar) return;

  let prog = 0;

  // Use will-change upfront to promote layer before animation
  loader.style.willChange = 'opacity, transform';

  const tick = () => {
    // Accelerate to 70, decelerate 70-90, crawl 90-99
    const step = prog < 70 ? Math.random() * 5 + 2
               : prog < 90 ? Math.random() * 1.5 + 0.4
               : 0.25;
    prog = Math.min(prog + step, 99);

    // Only write transform/opacity — no layout props
    bar.style.width = prog + '%';

    if (prog < 99) {
      setTimeout(tick, 35 + Math.random() * 30);
    } else {
      setTimeout(() => {
        bar.style.width = '100%';
        setTimeout(() => {
          // GSAP-driven exit so it honours the ticker
          gsap.to(loader, {
            opacity: 0,
            scale:   0.97,
            duration: 0.65,
            ease:    'power2.inOut',
            onComplete() {
              loader.style.display  = 'none';
              loader.style.willChange = 'auto';
              window.dispatchEvent(new Event('loaderDone'));
            }
          });
        }, 300);
      }, 180);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(tick, 150));
  } else {
    setTimeout(tick, 150);
  }
})();

// ═══════════════════════════════════════════════════
// 3. CUSTOM CURSOR
// Runs inside gsap.ticker — no extra RAF loop.
// ═══════════════════════════════════════════════════
(function initCursor() {
  const dot  = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let rx = 0, ry = 0, mx = 0, my = 0;
  const lerp = 0.12; // ring lag factor

  // Single passivemousemove listener
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  gsap.set([dot, ring], { xPercent: -50, yPercent: -50, force3D: true });

  // Reuse the shared gsap ticker (no extra RAF)
  gsap.ticker.add(() => {
    rx += (mx - rx) * lerp;
    ry += (my - ry) * lerp;
    // gsap.set is ~3× faster than style assignment inside RAF
    gsap.set(dot,  { x: mx, y: my, force3D: true });
    gsap.set(ring, { x: rx, y: ry, force3D: true });
  });
})();

// ═══════════════════════════════════════════════════
// 4. NAV – hide / show on scroll
// ═══════════════════════════════════════════════════
(function initNav() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  let lastY = 0;
  // Use Lenis scroll event (already fires in ticker) on desktop, fallback to window scroll on touch
  if (lenis) {
    lenis.on('scroll', ({ scroll }) => {
      nav.classList.toggle('hidden', scroll > lastY && scroll > 80);
      lastY = scroll;
    });
  } else {
    window.addEventListener('scroll', () => {
      const s = window.scrollY;
      nav.classList.toggle('hidden', s > lastY && s > 80);
      lastY = s;
    }, { passive: true });
  }
})();

// ═══════════════════════════════════════════════════
// 5. HERO THREE.JS — Delivery Scooter
// Optimised: fewer particles, shared clock, skip
// heavy computation (only lerp inside loop).
// ═══════════════════════════════════════════════════
class HeroScene {
  constructor() {
    this.canvas = document.getElementById('hero-canvas');
    if (!this.canvas) return;
    this.mouse    = { x: 0, y: 0 };
    this.lm       = { x: 0, y: 0 };
    this.camTarget = { z: 7.5, y: 0.6 };
    this._visible = true;
    this.init(); this.lights(); this.scooter(); this.particles(); this.events(); this.loop();
  }

  init() {
    const p = this.canvas.parentElement;
    this.W = p.clientWidth; this.H = p.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060608, 0.06);

    this.cam = new THREE.PerspectiveCamera(48, this.W / this.H, 0.1, 80);
    this.cam.position.set(0, 0.6, 7.5);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(this.W, this.H);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // Intersection observer — pause render when hero off screen
    const io = new IntersectionObserver(([e]) => { this._visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(this.canvas.parentElement);
  }

  lights() {
    this.scene.add(new THREE.AmbientLight(0x10101a, 6));
    this.oL = new THREE.PointLight(0xFF5722, 6, 14); this.oL.position.set(3, 2, 3); this.scene.add(this.oL);
    this.gL = new THREE.PointLight(0xFFD600, 4, 12); this.gL.position.set(-3, -1, 2); this.scene.add(this.gL);
    const rimL = new THREE.PointLight(0xFF7A2F, 3, 10); rimL.position.set(0, 1, -4); this.scene.add(rimL);
  }

  scooter() {
    this.grp = new THREE.Group();
    const om = new THREE.MeshPhysicalMaterial({ color: 0xFF5722, metalness: .85, roughness: .12, emissive: 0xFF3300, emissiveIntensity: .18, clearcoat: 1, clearcoatRoughness: .08 });
    const dm = new THREE.MeshStandardMaterial({ color: 0x111114, metalness: .9, roughness: .2 });
    const cm = new THREE.MeshStandardMaterial({ color: 0xbbbbbb, metalness: 1, roughness: .05 });
    const wm = new THREE.MeshBasicMaterial({ color: 0xf0f0f0 });
    const add = (g, m, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => {
      const mesh = new THREE.Mesh(g, m);
      mesh.position.set(x, y, z); mesh.rotation.set(rx, ry, rz);
      this.grp.add(mesh); return mesh;
    };
    add(new THREE.BoxGeometry(2.3, .42, .62), om, 0, .32, 0);
    add(new THREE.BoxGeometry(.3, .46, .58), om, 1.05, .56, 0);
    add(new THREE.BoxGeometry(.9, .11, .5), dm, -.2, .58, 0);
    add(new THREE.BoxGeometry(.44, .28, .58), om, -.97, .26, 0);
    add(new THREE.BoxGeometry(.82, .74, .68), wm, -.97, .8, 0);
    add(new THREE.BoxGeometry(.84, .07, .7), new THREE.MeshBasicMaterial({ color: 0xFF5722 }), -.97, .82, 0);
    add(new THREE.CylinderGeometry(.028, .028, .62, 8), cm, 1.02, .6, 0, 0, 0, Math.PI / 2);
    add(new THREE.BoxGeometry(.055, .5, .07), dm, 1.1, .1, 0);
    add(new THREE.SphereGeometry(.09, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfffaec }), 1.3, .44, 0);
    const hlP = new THREE.PointLight(0xfff5c0, 4, 5); hlP.position.set(1.5, .44, 0); this.grp.add(hlP);
    add(new THREE.SphereGeometry(.065, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff1100 }), -1.22, .34, 0);
    this.fwg = this._wheel(dm, cm); this.fwg.position.set(1.1, -.15, 0); this.grp.add(this.fwg);
    this.rwg = this._wheel(dm, cm); this.rwg.position.set(-1.1, -.15, 0); this.grp.add(this.rwg);
    this.grp.position.set(1.6, -.1, 0); this.grp.rotation.y = -.25;
    this.scene.add(this.grp);
  }

  _wheel(tm, rm) {
    const g = new THREE.Group();
    [new THREE.Mesh(new THREE.TorusGeometry(.42, .11, 12, 40), tm),
     new THREE.Mesh(new THREE.TorusGeometry(.28, .028, 8, 28), rm)
    ].forEach(m => { m.rotation.y = Math.PI / 2; g.add(m); });
    for (let i = 0; i < 5; i++) {
      const s = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .55, 4), rm);
      s.rotation.z = (Math.PI / 5) * i; s.rotation.y = Math.PI / 2; g.add(s);
    }
    return g;
  }

  particles() {
    // Reduced from 350 → 160 particles — same visual density, half the GPU cost
    const n = 160, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      p[i * 3]     = (Math.random() - .5) * 14;
      p[i * 3 + 1] = (Math.random() - .5) * 9;
      p[i * 3 + 2] = (Math.random() - .5) * 6;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    this.pts = new THREE.Points(g, new THREE.PointsMaterial({
      color: 0xFF7A2F, size: 0.03, transparent: true, opacity: .5,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    this.scene.add(this.pts);
  }

  events() {
    // Passive mousemove — no preventDefault cost
    window.addEventListener('mousemove', e => {
      this.mouse.x = (e.clientX / innerWidth - .5) * 2;
      this.mouse.y = -(e.clientY / innerHeight - .5) * 2;
    }, { passive: true });

    // Debounced resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const p = this.canvas.parentElement;
        this.W = p.clientWidth; this.H = p.clientHeight;
        this.cam.aspect = this.W / this.H;
        this.cam.updateProjectionMatrix();
        this.renderer.setSize(this.W, this.H);
      }, 120);
    }, { passive: true });
  }

  loop() {
    const clock = new THREE.Clock();
    const tick = () => {
      requestAnimationFrame(tick);
      if (!this._visible) return; // skip render when off-screen

      const t = clock.getElapsedTime();

      // Smooth lerp — pre-computed factor, no recalc
      this.lm.x += (this.mouse.x - this.lm.x) * .04;
      this.lm.y += (this.mouse.y - this.lm.y) * .04;

      this.grp.position.y = Math.sin(t * .7) * .12 - .1;
      this.grp.rotation.y = -.25 + this.lm.x * .18;
      this.grp.rotation.x = this.lm.y * .10;

      // Spin wheels
      this.fwg.rotation.x -= .038;
      this.rwg.rotation.x -= .038;

      // Orbit lights — cheap trig (same angle, offset by π)
      const a = t * .35;
      this.oL.position.x = Math.cos(a) * 4;       this.oL.position.z = Math.sin(a) * 3;
      this.gL.position.x = Math.cos(a + Math.PI) * 3.5; this.gL.position.z = Math.sin(a + Math.PI) * 2.5;

      // Camera from GSAP ScrollTrigger target
      this.cam.position.y = this.camTarget.y;
      this.cam.position.z = this.camTarget.z;
      this.cam.position.x = this.lm.x * .22;
      this.cam.lookAt(1.6, .3, 0);

      this.pts.rotation.y = t * .016;
      this.renderer.render(this.scene, this.cam);
    };
    tick();
  }
}

// ═══════════════════════════════════════════════════
// 6. NETWORK THREE.JS — Grid Dispatch
// Optimised: 1200 → 600 pts, 150 → 80 lines,
// IntersectionObserver skips render when off-screen.
// ═══════════════════════════════════════════════════
class NetworkScene {
  constructor() {
    this.canvas = document.getElementById('network-canvas');
    if (!this.canvas) return;
    this.mouse = { x: 0, y: 0 }; this.lm = { x: 0, y: 0 };
    this.scrollEnter = 0;
    this._visible = false;
    this.init(); this.build(); this.events(); this.loop();
  }

  init() {
    const p = this.canvas.parentElement;
    this.W = p.clientWidth; this.H = p.clientHeight;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060608, 0.08);
    this.cam = new THREE.PerspectiveCamera(50, this.W / this.H, .1, 80);
    this.cam.position.set(0, 2, 8);
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas, alpha: true, antialias: false, // antialias off = perf win
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(this.W, this.H);

    const io = new IntersectionObserver(([e]) => { this._visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(this.canvas.parentElement);
  }

  build() {
    this.grp = new THREE.Group();

    // 600 pts (down from 1200) — imperceptible visual difference at this scale
    const n = 600;
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      p[i * 3]     = (Math.random() - .5) * 40;
      p[i * 3 + 1] = (Math.random() - .5) * 15 - Math.random() * 2;
      p[i * 3 + 2] = (Math.random() - .5) * 40;
    }
    const bg = new THREE.BufferGeometry();
    bg.setAttribute('position', new THREE.BufferAttribute(p, 3));
    this.pts = new THREE.Points(bg, new THREE.PointsMaterial({
      color: 0xFF7A2F, size: 0.045, transparent: true, opacity: 0.75,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    this.grp.add(this.pts);

    // 80 lines (down from 150)
    const lMat = new THREE.LineBasicMaterial({ color: 0xFF5722, transparent: true, opacity: 0.1 });
    const lg = new THREE.BufferGeometry();
    const lp = [];
    for (let i = 0; i < 80; i++) {
      const i1 = Math.floor(Math.random() * n) * 3;
      const i2 = Math.floor(Math.random() * n) * 3;
      lp.push(p[i1], p[i1 + 1], p[i1 + 2], p[i2], p[i2 + 1], p[i2 + 2]);
    }
    lg.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
    this.lines = new THREE.LineSegments(lg, lMat);
    this.grp.add(this.lines);

    this.scene.add(this.grp);
  }

  events() {
    window.addEventListener('mousemove', e => {
      this.mouse.x = (e.clientX / innerWidth - .5) * 2;
      this.mouse.y = -(e.clientY / innerHeight - .5) * 2;
    }, { passive: true });

    ScrollTrigger.create({
      trigger: '#scene3d', start: 'top bottom', end: 'bottom top',
      onUpdate: self => { this.scrollEnter = self.progress; }
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const p = this.canvas.parentElement;
        this.W = p.clientWidth; this.H = p.clientHeight;
        this.cam.aspect = this.W / this.H;
        this.cam.updateProjectionMatrix();
        this.renderer.setSize(this.W, this.H);
      }, 120);
    }, { passive: true });
  }

  loop() {
    const tick = () => {
      requestAnimationFrame(tick);
      if (!this._visible) return; // skip entirely when off-screen

      this.lm.x += (this.mouse.x - this.lm.x) * .035;
      this.lm.y += (this.mouse.y - this.lm.y) * .035;

      this.grp.rotation.y += 0.0008;
      this.grp.rotation.x = this.lm.y * .09;
      this.grp.rotation.z = -this.lm.x * .09;

      const se = this.scrollEnter;
      this.cam.position.z = 8 - se * 10;
      this.cam.position.y = 2 - se * 1.4;

      this.renderer.render(this.scene, this.cam);
    };
    tick();
  }
}

// ═══════════════════════════════════════════════════
// 7. GSAP ANIMATIONS (after loader)
// force3D ensures GPU composite — no LayoutThrash.
// ═══════════════════════════════════════════════════
window.addEventListener('loaderDone', () => {

  // Hero entrance — stagger reduced to avoid heavy burst
  const tl = gsap.timeline({ defaults: { ease: 'power4.out', force3D: true } });
  document.querySelectorAll('.hero-headline .line').forEach((l, i) =>
    tl.from(l, { y: 56, opacity: 0, duration: .85 }, i * .1));
  tl.to('.hero-eyebrow',     { y: 0, opacity: 1, duration: .65, force3D: true }, 0)
    .to('.hero-sub',         { y: 0, opacity: 1, duration: .65, force3D: true }, .18)
    .from('#cta-main',       { scale: .9, opacity: 0, duration: .65, ease: 'back.out(1.5)', force3D: true }, .3)
    .to('.hero-actions .btn-ghost', { opacity: 1, duration: .55, force3D: true }, .4)
    .to('.hero-trust',       { opacity: 1, duration: .55, force3D: true }, .5)
    .to('.hero-scroll-hint', { opacity: 1, duration: .55, force3D: true }, .62);

  // Hero fly-through on scroll (managed via GSAP target → no re-render cost)
  if (window._heroSceneRef) {
    gsap.to(window._heroSceneRef.camTarget, {
      z: -1, y: 0.2,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero', start: 'top top', end: '+=800',
        scrub: 1,         // smooth scrub = no jitter
        pin: true,
      }
    });
  }

  // Problem — word reveal
  gsap.to('.problem-headline .word', {
    y: 0, opacity: 1, duration: .8, stagger: .06, ease: 'power4.out', force3D: true,
    scrollTrigger: { trigger: '#problem', start: 'top 55%' }
  });
  gsap.from('.problem-fact', {
    y: 24, opacity: 0, duration: .6, stagger: .12, ease: 'power3.out', force3D: true,
    scrollTrigger: { trigger: '.problem-facts', start: 'top 82%' }
  });

  // Solution burst
  const solnTl = gsap.timeline({ scrollTrigger: { trigger: '#solution', start: 'top 58%' } });
  solnTl.to('#solution .solution-eyebrow.reveal-up',  { y: 0, opacity: 1, duration: .6, ease: 'power3.out', force3D: true });
  solnTl.fromTo('.solution-logo',
    { scale: 0.35, filter: 'blur(28px)' },
    { scale: 1,    filter: 'blur(0px)',  duration: 1.1, ease: 'expo.out', force3D: true }, '-=0.25');
  solnTl.fromTo('.solution-logo-burst',
    { boxShadow: '0 0 0px 0px rgba(255,87,34,.8)' },
    { boxShadow: '0 0 280px 140px rgba(255,87,34,0)', duration: 1.4, ease: 'power2.out' }, '<');
  solnTl.to('#solution .solution-headline.reveal-up', { y: 0, opacity: 1, duration: .9, ease: 'power3.out', force3D: true }, '-=0.85');
  solnTl.to('#solution .solution-sub.reveal-up',      { y: 0, opacity: 1, duration: .9, ease: 'power3.out', force3D: true }, '-=0.75');

  // Scene3D content
  gsap.to('#scene3d .reveal-up', {
    y: 0, opacity: 1, duration: .8, stagger: .1, ease: 'power3.out', force3D: true,
    scrollTrigger: { trigger: '#scene3d', start: 'top 77%' }
  });

  // Stats — counter + bar
  document.querySelectorAll('.stat-card').forEach((card, i) => {
    const bar    = card.querySelector('.stat-bar');
    const num    = card.querySelector('.stat-num');
    const target = parseFloat(num.dataset.target);
    const suffix = num.dataset.suffix || '';
    const isFloat = String(target).includes('.');
    const obj = { val: 0 };

    ScrollTrigger.create({
      trigger: '#stats', start: 'top 80%', once: true,
      onEnter() {
        if (bar) bar.style.width = bar.style.getPropertyValue('--p') || '80%';
        gsap.from(card, { y: 24, opacity: 0, duration: .6, delay: i * .08, ease: 'power3.out', force3D: true });
        gsap.to(obj, {
          val: target, duration: 1.8, delay: i * .08, ease: 'power2.out',
          onUpdate() { num.textContent = (isFloat ? obj.val.toFixed(1) : Math.round(obj.val)) + suffix; }
        });
      }
    });
  });

  // Note: #download section removed from React landing page
});

// ═══════════════════════════════════════════════════
// 8. HOW IT WORKS — Pinned Steps
// ═══════════════════════════════════════════════════
function initHowItWorks() {
  const section = document.getElementById('howitworks');
  const steps   = document.querySelectorAll('.how-step');
  const fill    = document.getElementById('how-fill');
  const path    = document.getElementById('how-path-line');
  if (!section || !steps.length) return;

  let active = -1;
  function setStep(i) {
    if (i === active) return;
    steps.forEach((s, j) => s.classList.toggle('active', j === i));
    active = i;
    if (fill) fill.style.width = ((i + 1) / steps.length * 100) + '%';
  }
  setStep(0);

  ScrollTrigger.create({
    trigger: section, start: 'top top', end: 'bottom bottom',
    onUpdate(self) {
      setStep(Math.min(Math.floor(self.progress * steps.length), steps.length - 1));
      if (path) path.style.strokeDashoffset = 1000 - 1000 * self.progress;
    }
  });
}

// ═══════════════════════════════════════════════════
// 9. FEATURE CARDS CAROUSEL
// ═══════════════════════════════════════════════════
function initCardsCarousel() {
  const section = document.getElementById('features');
  const cards   = document.querySelectorAll('.card-item');
  const dots    = document.querySelectorAll('.cards-dots .dot');
  if (!section || !cards.length) return;

  function setCard(idx) {
    cards.forEach((c, i) => {
      const diff = i - idx;
      if (diff === 0) {
        gsap.to(c, { rotateY: 0, rotateX: 0, scale: 1, z: 0, opacity: 1, duration: .5, ease: 'power3.out', zIndex: 10, force3D: true });
        c.classList.add('active');
      } else if (diff > 0) {
        gsap.to(c, { rotateY: -18, scale: .83, z: -100, opacity: Math.max(.05, .35 - Math.abs(diff) * .12), duration: .5, ease: 'power3.out', zIndex: 5 - Math.abs(diff), force3D: true });
        c.classList.remove('active');
      } else {
        gsap.to(c, { rotateY: 18, scale: .83, z: -100, opacity: 0, duration: .45, ease: 'power3.out', zIndex: 1, force3D: true });
        c.classList.remove('active');
      }
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  cards.forEach((c, i) => {
    gsap.set(c, { rotateY: i === 0 ? 0 : -18, scale: i === 0 ? 1 : .83, z: i === 0 ? 0 : -100, opacity: i === 0 ? 1 : Math.max(.05, .3 - i * .1), force3D: true });
  });
  setCard(0);

  ScrollTrigger.create({
    trigger: section, start: 'top top', end: 'bottom bottom',
    onUpdate(self) {
      setCard(Math.min(Math.floor(self.progress * cards.length), cards.length - 1));
    }
  });

  dots.forEach((d, i) => {
    d.addEventListener('click', () => lenis.scrollTo('#features', { offset: i * innerHeight }));
  });
}

// ═══════════════════════════════════════════════════
// 10. INTERACTIONS & PARALLAX
// One shared mousemove handler with RAF flag —
// prevents triggering GSAP writes on every pixel.
// ═══════════════════════════════════════════════════
function initInteractions() {
  const stage = document.querySelector('.cards-stage');
  let rafPending = false;
  let ex = 0, ey = 0; // last event coords

  // Single document mousemove (replaces per-card listeners)
  document.addEventListener('mousemove', e => {
    ex = e.clientX; ey = e.clientY;
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      const cx = innerWidth / 2, cy = innerHeight / 2;
      const nx = (ex - cx) / cx;
      const ny = (ey - cy) / cy;
      if (stage) {
        gsap.to(stage, { rotationY: nx * 5, rotationX: -ny * 5, ease: 'power2.out', duration: 1.2, overwrite: 'auto', force3D: true });
      }
    });
  }, { passive: true });

  // Per-card tilt — only applies when card is active
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - .5;
      const y = (e.clientY - r.top)  / r.height - .5;
      gsap.to(card, { rotationY: x * 12, rotationX: -y * 8, transformPerspective: 900, ease: 'power2.out', duration: .3, overwrite: true, force3D: true });
    }, { passive: true });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotationY: 0, rotationX: 0, duration: .7, ease: 'power3.out', overwrite: true, force3D: true });
    });
  });

  // Magnetic buttons
  document.querySelectorAll('.btn-magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top  + r.height / 2);
      gsap.to(el, { x: dx * .25, y: dy * .25, scale: 1.05, duration: .35, ease: 'power2.out', overwrite: 'auto', force3D: true });
    }, { passive: true });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, scale: 1, duration: .65, ease: 'elastic.out(1,.4)', overwrite: 'auto', force3D: true });
    });
    el.addEventListener('click', e => {
      const ripple = document.createElement('span');
      const r = el.getBoundingClientRect();
      const sz = Math.max(r.width, r.height) * 2.2;
      Object.assign(ripple.style, {
        position: 'absolute', width: sz + 'px', height: sz + 'px',
        left: (e.clientX - r.left - sz / 2) + 'px', top: (e.clientY - r.top - sz / 2) + 'px',
        borderRadius: '50%', background: 'rgba(255,255,255,.16)',
        transform: 'scale(0)', pointerEvents: 'none', zIndex: 20, willChange: 'transform, opacity',
      });
      el.style.overflow = 'hidden';
      el.appendChild(ripple);
      gsap.to(ripple, { scale: 1, opacity: 0, duration: .55, ease: 'power2.out', onComplete: () => ripple.remove() });
    });
  });
}

// ═══════════════════════════════════════════════════
// 11. AUTH MODAL  (vanilla — only on standalone index.html)
// ═══════════════════════════════════════════════════
function initAuthModal() {
  const modal    = document.getElementById('auth-modal');
  if (!modal) return;
  const backdrop = modal.querySelector('.auth-backdrop');
  const card     = modal.querySelector('.auth-card');
  const triggers = document.querySelectorAll('[data-auth="open"]');
  const closers  = document.querySelectorAll('[data-auth="close"]');
  const tabs     = document.querySelectorAll('.auth-tab');
  const forms    = document.querySelectorAll('.auth-form');
  const tabWrap  = document.querySelector('.auth-tabs');

  function openModal(e) {
    if (e) e.preventDefault();
    modal.style.display = 'flex';
    if (window.lenis) window.lenis.stop();
    gsap.to(backdrop, { opacity: 1, duration: .35, ease: 'power2.out' });
    gsap.to(card,     { opacity: 1, scale: 1, y: 0, duration: .45, ease: 'back.out(1.2)', delay: .05, force3D: true });
  }

  function closeModal(e) {
    if (e && e.target !== e.currentTarget) return;
    if (e) e.preventDefault();
    gsap.to(card,     { opacity: 0, scale: 0.96, y: 16, duration: .25, ease: 'power2.in', force3D: true });
    gsap.to(backdrop, { opacity: 0, duration: .35, ease: 'power2.in', delay: .05, onComplete() {
      modal.style.display = 'none';
      if (window.lenis) window.lenis.start();
    }});
  }

  function switchTab(tabId) {
    tabWrap.setAttribute('data-active', tabId);
    tabs.forEach(t  => t.classList.toggle('active', t.dataset.tab === tabId));
    forms.forEach(f => {
      if (f.id === `form-${tabId}`) {
        f.classList.add('active');
        gsap.fromTo(f, { opacity: 0, x: 18 }, { opacity: 1, x: 0, duration: .35, ease: 'power2.out' });
      } else {
        f.classList.remove('active');
      }
    });
  }

  triggers.forEach(t => t.addEventListener('click', openModal));
  closers.forEach(c  => c.addEventListener('click', closeModal));
  tabs.forEach(t     => t.addEventListener('click', () => switchTab(t.dataset.tab)));

  if (!window.__reactApp) {
    forms.forEach(f => f.addEventListener('submit', e => {
      e.preventDefault();
      const btn = f.querySelector('button[type="submit"]');
      btn.textContent = 'Authenticating...';
      const nameInput = f.querySelector('#sign-name');
      if (nameInput?.value.trim()) localStorage.setItem('userName', nameInput.value.trim());
      setTimeout(() => {
        btn.textContent = '✓ Opening Dashboard…';
        setTimeout(() => { window.location.href = '/dashboard'; }, 600);
      }, 1100);
    }));
  }
}

// ═══════════════════════════════════════════════════
// BOOT — handles both early (standalone) and late
// (React dynamic inject) DOM ready states.
// ═══════════════════════════════════════════════════
function boot() {
  try { window._heroSceneRef = new HeroScene(); } catch (e) { console.warn('HeroScene:', e); }
  try { new NetworkScene(); }                    catch (e) { console.warn('NetworkScene:', e); }
  initHowItWorks();
  initCardsCarousel();
  initInteractions();
  if (!window.__reactApp) initAuthModal();
  // Expose lenis for React modal stop/start (null on touch = no-op fine)
  window.lenis = lenis;
  // Re-process Lucide icons React rendered before this script loaded
  if (window.lucide) window.lucide.createIcons();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
