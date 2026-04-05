/**
 * CustomCursor
 *
 * Exact replica of the original index.html cursor:
 *   • 8×8 white dot  — snaps directly to mouse (no lag)
 *   • 36×36 ring     — trails mouse with lerp = 0.12  (same coefficient as GSAP version)
 *   • Both use mix-blend-mode:difference so they look white on dark, black on white
 *   • Ring subtly expands + turns orange on hover over interactive elements
 *
 * Runs 100% outside React's render cycle (pure RAF + mutable ref objects).
 * Sets window.__reactCursorActive = true so main.js initCursor() skips its own GSAP loop
 * when this component is mounted.
 *
 * Place this component once, directly inside <BrowserRouter>, so it persists across routes.
 */

import { useEffect, useRef } from 'react';

// Half-dimensions — used to center elements at the cursor point
const DOT_HALF  = 4;   // 8px  / 2
const RING_HALF = 18;  // 36px / 2
const RING_HOVER_SIZE = 52;
const RING_HOVER_HALF = 26;
const LERP = 0.12;     // same trailing factor as original GSAP version

// Interactive elements that trigger hover expansion
const HOVER_SEL = 'button, a, [role="button"], input, textarea, select, label, ' +
                  '.cursor-pointer, .cuisine-pill, .reel-card, .glass-card, .dot, .auth-tab';

export default function CustomCursor() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // ── Signal to main.js: React owns the cursor DOM elements ──────────────────
    window.__reactCursorActive = true;

    // ── Mutable state (never triggers re-render) ────────────────────────────────
    const pos = { mx: -200, my: -200, rx: -200, ry: -200 };
    let hovered     = false;
    let prevHovered = false;
    let rafId;

    // ── Mouse tracking ──────────────────────────────────────────────────────────
    const onMove = (e) => {
      pos.mx = e.clientX;
      pos.my = e.clientY;
    };

    // ── Hover detection via event delegation (no per-element listeners) ─────────
    const onOver = (e) => {
      if (e.target.closest(HOVER_SEL)) hovered = true;
    };
    const onOut = (e) => {
      if (e.target.closest(HOVER_SEL)) hovered = false;
    };

    // ── Hide/show when mouse enters/leaves the browser window ───────────────────
    const onWinLeave  = () => { dot.style.opacity = '0'; ring.style.opacity = '0'; };
    const onWinEnter  = () => { dot.style.opacity = '1'; ring.style.opacity = '1'; };

    // ── RAF animation loop (lerp matching original GSAP ticker rate) ────────────
    const animate = () => {
      // Lerp ring toward mouse
      pos.rx += (pos.mx - pos.rx) * LERP;
      pos.ry += (pos.my - pos.ry) * LERP;

      // Dot — instant snap (same as original gsap.set(dot, { x:mx, y:my }))
      dot.style.transform = `translate3d(${pos.mx - DOT_HALF}px,${pos.my - DOT_HALF}px,0)`;

      // Ring — apply size + color change only when hover state flips (not every frame)
      if (hovered !== prevHovered) {
        prevHovered = hovered;
        if (hovered) {
          ring.style.width       = `${RING_HOVER_SIZE}px`;
          ring.style.height      = `${RING_HOVER_SIZE}px`;
          ring.style.borderColor = 'rgba(255,87,34,0.75)'; // orange on hover
        } else {
          ring.style.width       = '36px';
          ring.style.height      = '36px';
          ring.style.borderColor = 'rgba(255,255,255,0.4)'; // default white
        }
      }

      const rh = hovered ? RING_HOVER_HALF : RING_HALF;
      ring.style.transform = `translate3d(${pos.rx - rh}px,${pos.ry - rh}px,0)`;

      rafId = requestAnimationFrame(animate);
    };

    // ── Attach all listeners ────────────────────────────────────────────────────
    document.addEventListener('mousemove',  onMove,     { passive: true });
    document.addEventListener('mouseover',  onOver,     { passive: true });
    document.addEventListener('mouseout',   onOut,      { passive: true });
    document.addEventListener('mouseleave', onWinLeave);
    document.addEventListener('mouseenter', onWinEnter);

    rafId = requestAnimationFrame(animate);

    // ── Cleanup ─────────────────────────────────────────────────────────────────
    return () => {
      window.__reactCursorActive = false;
      cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove',  onMove);
      document.removeEventListener('mouseover',  onOver);
      document.removeEventListener('mouseout',   onOut);
      document.removeEventListener('mouseleave', onWinLeave);
      document.removeEventListener('mouseenter', onWinEnter);
    };
  }, []); // run once — cursor lives for the entire app lifetime

  return (
    <>
      {/* ── Dot: snaps exactly to mouse ── */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          width:         8,
          height:        8,
          borderRadius:  '50%',
          background:    '#fff',
          pointerEvents: 'none',
          zIndex:        10001,
          willChange:    'transform',
          mixBlendMode:  'difference',
          transform:     'translate3d(-200px,-200px,0)', // start off-screen
        }}
      />
      {/* ── Ring: trails with lerp = 0.12 ── */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          width:         36,
          height:        36,
          borderRadius:  '50%',
          border:        '1px solid rgba(255,255,255,0.4)',
          pointerEvents: 'none',
          zIndex:        10000,
          willChange:    'transform',
          mixBlendMode:  'difference',
          transform:     'translate3d(-200px,-200px,0)', // start off-screen
          transition:    'width 0.28s cubic-bezier(0.16,1,0.3,1), height 0.28s cubic-bezier(0.16,1,0.3,1), border-color 0.28s',
        }}
      />
    </>
  );
}
