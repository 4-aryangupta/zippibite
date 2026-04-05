import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AppContext';

export default function LandingPage({ onAuthOpen }) {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect logged-in users straight to dashboard.
  // Guard on authLoading so we don't flash landing content before the
  // session check resolves — keeps the experience flicker-free.
  useEffect(() => {
    if (!authLoading && user) navigate('/dashboard', { replace: true });
  }, [user, authLoading, navigate]);

  // ── Inject / eject landing-page CSS ──────────────────────────────────────────
  // style.css sets cursor:none on body, grain/vignette overlays, etc.
  // Inject it immediately on mount (before auth resolves) so styles are ready
  // the moment we render the landing page.  Remove it on unmount so it never
  // bleeds into the dashboard or other React routes.
  useEffect(() => {
    const LINK_ID = 'zb-landing-styles';
    if (!document.getElementById(LINK_ID)) {
      const link = document.createElement('link');
      link.id   = LINK_ID;
      link.rel  = 'stylesheet';
      link.href = '/style.css';
      document.head.appendChild(link);
    }
    return () => {
      document.getElementById('zb-landing-styles')?.remove();
      document.body.style.cursor = ''; // restore cursor for React pages
    };
  }, []); // run once on mount / cleanup on unmount

  // Load main.js ONCE — CDN libs are already in index.html, so main.js
  // can access THREE / gsap / Lenis / lucide as globals immediately.
  useEffect(() => {
    // While auth is loading or user is already logged in, skip script injection.
    // The redirect above handles the logged-in case; this prevents double injection.
    if (authLoading || user) return;
    if (window.__mainJsLoaded) return; // guard against double-mount (StrictMode)
    window.__mainJsLoaded = true;

    const script = document.createElement('script');
    script.src = '/main.js';
    script.async = false; // must run synchronously after DOM is ready
    document.body.appendChild(script);

    return () => {
      // On unmount (leaving landing page), stop Lenis to prevent conflicts
      if (window.lenis) {
        window.lenis.destroy?.();
        window.lenis = null;
      }
      window.__mainJsLoaded = false; // allow reload if user comes back
    };
  }, [authLoading, user]);

  // While the session check is still in flight, render nothing.
  // This prevents a flicker of landing page content for returning users.
  if (authLoading) return null;

  const handleAuth = (e) => {
    e.preventDefault();
    onAuthOpen();
  };

  return (
    <>
      {/* ── Cinematic Overlays ────────────────────────── */}
      {/* NOTE: #cursor and #cursor-ring are NOT here — they are rendered globally
          by <CustomCursor> in AppShell and persist across all routes. */}
      <div className="grain"></div>
      <div className="vignette"></div>

      {/* ── Loader ────────────────────────────────────── */}
      <div id="loader">
        <div className="loader-streaks">
          <span></span><span></span><span></span><span></span>
        </div>
        <div className="loader-inner">
          <div className="loader-glow"></div>
          <svg className="loader-logo" viewBox="0 0 200 48" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lg0" x1="0" y1="0" x2="200" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FF5722" />
                <stop offset="100%" stopColor="#FFD600" />
              </linearGradient>
            </defs>
            <path d="M1,3 L25,3 L25,11 L19,22 L23,22 L23,26 L9,26 L3,37 L27,37 L27,45 L1,45 L1,37 L15,26 L11,26 L11,22 L17,22 Z" fill="url(#lg0)" />
            <text x="31" y="40" fontFamily="'Clash Display',sans-serif" fontWeight="700" fontSize="34" fill="url(#lg0)">ipp</text>
            <text x="99" y="41" fontFamily="'Clash Display',sans-serif" fontWeight="700" fontSize="38" fill="url(#lg0)">Bite</text>
          </svg>
          <div className="loader-bar-wrap">
            <div id="loader-bar"></div>
          </div>
        </div>
      </div>

      {/* ── Nav ───────────────────────────────────────── */}
      <nav id="navbar">
        <a href="#hero" className="nav-logo-link">
          <svg className="zippbite-logo logo-nav" viewBox="0 0 200 48" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lgN" x1="0" y1="0" x2="200" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FF5722" />
                <stop offset="100%" stopColor="#FFD600" />
              </linearGradient>
            </defs>
            <path d="M1,3 L25,3 L25,11 L19,22 L23,22 L23,26 L9,26 L3,37 L27,37 L27,45 L1,45 L1,37 L15,26 L11,26 L11,22 L17,22 Z" fill="url(#lgN)" />
            <text x="31" y="40" fontFamily="'Clash Display',sans-serif" fontWeight="700" fontSize="34" fill="url(#lgN)">ipp</text>
            <text x="99" y="41" fontFamily="'Clash Display',sans-serif" fontWeight="700" fontSize="38" fill="url(#lgN)">Bite</text>
          </svg>
        </a>
        <ul className="nav-links">
          <li><a href="#howitworks">How It Works</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#stats">Story</a></li>
          <li><a href="#join">Get Started</a></li>
        </ul>
        <a href="#" onClick={handleAuth} className="btn btn-ghost nav-cta">Order Now</a>
      </nav>

      {/* ── 1. Hero ───────────────────────────────────── */}
      <section id="hero">
        <canvas id="hero-canvas"></canvas>
        <div className="hero-noise"></div>
        <div className="hero-content">
          <div className="hero-eyebrow reveal">
            <span className="dot-pulse"></span>Live in 24 cities · Delivering now
          </div>
          <h1 className="hero-headline">
            <span className="line">Food, at the</span>
            <span className="line grad-text">Speed of Craving</span>
          </h1>
          <p className="hero-sub reveal">Hot meals. Real speed. Zero compromise.</p>
          <div className="hero-actions">
            <a href="#" onClick={handleAuth} className="btn btn-primary btn-magnetic" id="cta-main">
              <span className="btn-text">Order Now</span>
              <i data-lucide="arrow-right" className="btn-icon"></i>
            </a>
            <a href="#problem" className="btn btn-ghost reveal">See the story</a>
          </div>
          <div className="hero-trust reveal">
            <span><i data-lucide="star" className="icon-xs"></i>4.9 App Store</span>
            <span className="vdiv"></span>
            <span>12M+ customers</span>
            <span className="vdiv"></span>
            <span>Free first delivery</span>
          </div>
        </div>
        <div className="hero-scroll-hint reveal">
          <i data-lucide="chevrons-down" className="icon-sm"></i>
        </div>
      </section>

      {/* ── 2. Problem ────────────────────────────────── */}
      <section id="problem">
        <div className="problem-inner container">
          <p className="problem-label">The Problem</p>
          <h2 className="problem-headline">
            <div className="line"><span className="word">It's</span> <span className="word">11 pm.</span></div>
            <div className="line"><span className="word">You're</span> <span className="word">starving.</span></div>
            <div className="line problem-accent">
              <span className="word">Everything</span> <span className="word">takes</span> <span className="word">forever.</span>
            </div>
          </h2>
          <div className="problem-facts">
            <div className="problem-fact">
              <span className="fact-num">38</span>
              <span className="fact-label">minutes. Average delivery in your city.</span>
            </div>
            <div className="problem-fact">
              <span className="fact-num">Cold.</span>
              <span className="fact-label">That's how your food usually arrives.</span>
            </div>
            <div className="problem-fact">
              <span className="fact-num">0</span>
              <span className="fact-label">places that feel built for you. Until now.</span>
            </div>
          </div>
        </div>
        <div className="problem-glow"></div>
      </section>

      {/* ── 3. Solution ───────────────────────────────── */}
      <section id="solution">
        <div className="solution-beam"></div>
        <div className="container solution-inner">
          <p className="solution-eyebrow reveal-up">Introducing</p>
          <div className="solution-logo-wrap reveal-up">
            <div className="solution-logo-burst"></div>
            <svg className="solution-logo" viewBox="0 0 200 48" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="lgS" x1="0" y1="0" x2="200" y2="48" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FF5722" />
                  <stop offset="100%" stopColor="#FFD600" />
                </linearGradient>
              </defs>
              <path d="M1,3 L25,3 L25,11 L19,22 L23,22 L23,26 L9,26 L3,37 L27,37 L27,45 L1,45 L1,37 L15,26 L11,26 L11,22 L17,22 Z" fill="url(#lgS)" />
              <text x="31" y="40" fontFamily="'Clash Display',sans-serif" fontWeight="700" fontSize="34" fill="url(#lgS)">ipp</text>
              <text x="99" y="41" fontFamily="'Clash Display',sans-serif" fontWeight="700" fontSize="38" fill="url(#lgS)">Bite</text>
            </svg>
          </div>
          <h2 className="solution-headline reveal-up">
            Delivery reimagined.<br />
            <span className="grad-text">18 minutes. Always hot.</span>
          </h2>
          <p className="solution-sub reveal-up">AI-dispatched. Thermally sealed. Built for humans who don't compromise.</p>
        </div>
      </section>

      {/* ── 4. How It Works ───────────────────────────── */}
      <section id="howitworks">
        <div className="how-sticky">
          <div className="how-progress-bar">
            <div id="how-fill"></div>
          </div>
          <svg className="how-path-svg" viewBox="0 0 100 800" preserveAspectRatio="none">
            <path id="how-path-line" d="M 50,0 Q 80,200 50,400 T 50,800" fill="none" stroke="url(#hpGrad)" strokeWidth="2"
              strokeDasharray="1000" strokeDashoffset="1000" />
            <defs>
              <linearGradient id="hpGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF5722" />
                <stop offset="100%" stopColor="#FFD600" />
              </linearGradient>
            </defs>
          </svg>

          <div className="how-step" data-step="0">
            <div className="how-icon-wrap"><i data-lucide="smartphone" className="how-icon"></i></div>
            <span className="how-count">01</span>
            <h3 className="how-title">Browse &amp; Choose</h3>
            <p className="how-body">Hundreds of restaurants. Curated by your taste. Add to cart in seconds—our AI already knows what you love.</p>
          </div>

          <div className="how-step" data-step="1">
            <div className="how-icon-wrap"><i data-lucide="cpu" className="how-icon"></i></div>
            <span className="how-count">02</span>
            <h3 className="how-title">AI Assigns a Rider</h3>
            <p className="how-body">Our dispatch engine analyses 200+ data points in under 80ms. The nearest, fastest rider is assigned before you close the menu.</p>
          </div>

          <div className="how-step" data-step="2">
            <div className="how-icon-wrap"><i data-lucide="activity" className="how-icon"></i></div>
            <span className="how-count">03</span>
            <h3 className="how-title">Watch It Move</h3>
            <p className="how-body">Cinematic live tracking. Watch your rider navigate the city in real time—every turn, every signal, every second.</p>
            <div className="how-track-demo">
              <div className="track-path">
                <div className="track-rider"><i data-lucide="bike" className="rider-icon"></i></div>
              </div>
            </div>
          </div>

          <div className="how-step" data-step="3">
            <div className="how-icon-wrap"><i data-lucide="home" className="how-icon"></i></div>
            <span className="how-count">04</span>
            <h3 className="how-title">Door in 18 Minutes</h3>
            <p className="how-body">Thermal-sealed. Still hot. Still perfect. That's not a promise—that's our guarantee. Late? It's free.</p>
          </div>

          <div className="how-visual">
            <div className="how-ring how-ring-1"></div>
            <div className="how-ring how-ring-2"></div>
            <div className="how-orb"></div>
          </div>
        </div>
      </section>

      {/* ── 5. Feature Cards ──────────────────────────── */}
      <section id="features">
        <div className="cards-sticky">
          <div className="cards-label">
            <span className="section-eyebrow">Why ZippBite</span>
            <h2 className="cards-heading">Features that<br /><span className="grad-text">feel different</span></h2>
          </div>
          <div className="cards-stage">
            <div className="card-item glass-card tilt-card" data-idx="0">
              <div className="card-glow-edge" style={{ '--glow': '#FF5722' }}></div>
              <div className="ci-icon"><i data-lucide="zap"></i></div>
              <h3>Lightning Dispatch</h3>
              <p>Rider assigned in 80ms. Not a typo. Our infrastructure runs faster than you can blink.</p>
              <div className="ci-tag">Speed</div>
            </div>
            <div className="card-item glass-card tilt-card" data-idx="1">
              <div className="card-glow-edge" style={{ '--glow': '#FF7A2F' }}></div>
              <div className="ci-icon"><i data-lucide="radar"></i></div>
              <h3>Live Radar Tracking</h3>
              <p>Not a status update. A cinematic live map showing your rider's every move in real time.</p>
              <div className="ci-tag">Tracking</div>
            </div>
            <div className="card-item glass-card tilt-card" data-idx="2">
              <div className="card-glow-edge" style={{ '--glow': '#FFD600' }}></div>
              <div className="ci-icon"><i data-lucide="thermometer"></i></div>
              <h3>Temperature Sealed</h3>
              <p>Phase-change thermal lining keeps food at 72°C minimum. Engineering meets your appetite.</p>
              <div className="ci-tag">Quality</div>
            </div>
            <div className="card-item glass-card tilt-card" data-idx="3">
              <div className="card-glow-edge" style={{ '--glow': '#8B5CF6' }}></div>
              <div className="ci-icon"><i data-lucide="moon"></i></div>
              <h3>Night Owl Mode</h3>
              <p>24/7 operations. Premium late-night menus. Midnight biryani isn't a craving—it's a right.</p>
              <div className="ci-tag">Always On</div>
            </div>
            <div className="card-item glass-card tilt-card" data-idx="4">
              <div className="card-glow-edge" style={{ '--glow': '#10B981' }}></div>
              <div className="ci-icon"><i data-lucide="gem"></i></div>
              <h3>ZippBite Premium</h3>
              <p>Zero fees. Priority lanes. Exclusive chef tables. The app rewires your relationship with food.</p>
              <div className="ci-tag">Premium</div>
            </div>
          </div>
          <div className="cards-dots">
            <span className="dot active" data-i="0"></span>
            <span className="dot" data-i="1"></span>
            <span className="dot" data-i="2"></span>
            <span className="dot" data-i="3"></span>
            <span className="dot" data-i="4"></span>
          </div>
        </div>
      </section>

      {/* ── 6. 3D Network Section ─────────────────────── */}
      <section id="scene3d">
        <canvas id="network-canvas"></canvas>
        <div className="orb-content container">
          <p className="section-eyebrow reveal-up">The Engine</p>
          <h2 className="orb-heading reveal-up">Speed is not<br /><span className="grad-text">an accident</span></h2>
          <p className="orb-sub reveal-up">Under the hood: a distributed AI dispatch system, real-time geofencing, and a network of 40,000+ trained riders. This is what 18 minutes looks like from the inside.</p>
        </div>
      </section>

      {/* ── 7. Stats ──────────────────────────────────── */}
      <section id="stats">
        <div className="container">
          <div className="stats-label">
            <p className="section-eyebrow">By the Numbers</p>
            <h2 className="section-title">Proof, not<br /><span className="grad-text">promises</span></h2>
          </div>
          <div className="stats-grid">
            <div className="stat-card glass-card">
              <div className="stat-bar-wrap"><div className="stat-bar" style={{ '--p': '84%' }}></div></div>
              <div className="stat-num" data-target="12" data-suffix="M+">0</div>
              <div className="stat-label">Customers served</div>
            </div>
            <div className="stat-card glass-card">
              <div className="stat-bar-wrap"><div className="stat-bar" style={{ '--p': '65%' }}></div></div>
              <div className="stat-num" data-target="18" data-suffix=" min">0</div>
              <div className="stat-label">Avg delivery time</div>
            </div>
            <div className="stat-card glass-card">
              <div className="stat-bar-wrap"><div className="stat-bar" style={{ '--p': '92%' }}></div></div>
              <div className="stat-num" data-target="500" data-suffix="+">0</div>
              <div className="stat-label">Restaurant partners</div>
            </div>
            <div className="stat-card glass-card">
              <div className="stat-bar-wrap"><div className="stat-bar" style={{ '--p': '98%' }}></div></div>
              <div className="stat-num" data-target="4.9" data-suffix="★">0</div>
              <div className="stat-label">App rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Join / CTA ─────────────────────────────── */}
      <section id="join">
        <div className="container join-inner">
          <div className="join-copy">
            <p className="section-eyebrow">The Future</p>
            <h2 className="section-title">Ready to<br /><span className="grad-text">stop waiting?</span></h2>
            <p className="join-sub">Join ZippBite web now. Get ₹200 off your first order. Millions of users already upgraded their cravings.</p>
            <div className="join-actions">
              <button onClick={handleAuth} className="btn btn-primary btn-magnetic">
                <span className="btn-text">Create Account</span>
                <i data-lucide="arrow-right" className="btn-icon"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer id="footer">
        <div className="container footer-inner">
          <svg className="zippbite-logo logo-footer" viewBox="0 0 200 48" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lgF" x1="0" y1="0" x2="200" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FF5722" />
                <stop offset="100%" stopColor="#FFD600" />
              </linearGradient>
            </defs>
            <path d="M1,3 L25,3 L25,11 L19,22 L23,22 L23,26 L9,26 L3,37 L27,37 L27,45 L1,45 L1,37 L15,26 L11,26 L11,22 L17,22 Z" fill="url(#lgF)" />
            <text x="31" y="40" fontFamily="'Clash Display',sans-serif" fontWeight="700" fontSize="34" fill="url(#lgF)">ipp</text>
            <text x="99" y="41" fontFamily="'Clash Display',sans-serif" fontWeight="700" fontSize="38" fill="url(#lgF)">Bite</text>
          </svg>
          <p className="footer-copy">© 2026 ZippBite Technologies. All rights reserved.</p>
          <ul className="footer-links">
            <li><a href="#">Privacy</a></li>
            <li><a href="#">Terms</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
      </footer>
    </>
  );
}
