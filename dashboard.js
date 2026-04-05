/* ══════════════════════════════════════════════════════
   ZippBite Dashboard — dashboard.js
   Pure Vanilla JS, no frameworks, safe side-effects only
   ══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Lucide icons ─────────────────────── */
  if (typeof lucide !== 'undefined') lucide.createIcons();

  /* ── Greeting + user state ────────────── */
  function getGreeting() {
    const h = new Date().getHours();
    if (h < 5)  return 'Good night';
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    if (h < 21) return 'Good evening';
    return 'Good night';
  }

  function initUserState() {
    const userName = localStorage.getItem('userName') || '';
    const displayName = userName.trim() || 'there';
    const initial = displayName !== 'there' ? displayName[0].toUpperCase() : '👤';

    const greetingNameEl = document.getElementById('greeting-name');
    const dashUserNameEl = document.getElementById('dash-user-name');
    const dashAvatarEl   = document.getElementById('dash-avatar');
    const greetingTextEl = document.getElementById('dash-greeting');

    if (greetingNameEl) greetingNameEl.textContent = displayName;
    if (dashUserNameEl) dashUserNameEl.textContent = displayName;
    if (dashAvatarEl)  dashAvatarEl.textContent = initial !== '👤' ? initial : 'Z';

    if (greetingTextEl) {
      greetingTextEl.innerHTML =
        getGreeting() + ', <span class="grad-text" id="greeting-name">' + displayName + '</span> 👋';
    }
  }

  initUserState();

  /* ── Sticky nav scroll shadow ─────────── */
  const dashNav = document.getElementById('dash-nav');
  if (dashNav) {
    let lastY = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      dashNav.classList.toggle('scrolled', y > 10);
      lastY = y;
    }, { passive: true });
  }

  /* ── Cuisine pills filter ─────────────── */
  const pills = document.querySelectorAll('.cuisine-pill');
  const restaurantCards = document.querySelectorAll('.restaurant-card');

  function setActivePill(pill) {
    pills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    filterRestaurants(pill.dataset.cuisine);
    pill.style.transform = 'translateY(-2px) scale(1.05)';
    setTimeout(() => { pill.style.transform = ''; }, 200);
  }

  function filterRestaurants(cuisine) {
    restaurantCards.forEach(card => {
      const match = cuisine === 'all' || card.dataset.cuisine === cuisine;
      card.style.transition = 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
      if (match) {
        card.style.opacity = '1';
        card.style.transform = '';
        card.style.pointerEvents = 'auto';
      } else {
        card.style.opacity = '0.2';
        card.style.transform = 'scale(0.95)';
        card.style.pointerEvents = 'none';
      }
    });
  }

  pills.forEach(pill => {
    pill.addEventListener('click', () => setActivePill(pill));
  });

  /* ── Reels drag scroll ────────────────── */
  function initDragScroll(el) {
    if (!el) return;
    let isDown = false, startX, scrollLeft;

    el.addEventListener('mousedown', e => {
      isDown = true;
      el.classList.add('active');
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    });
    el.addEventListener('mouseleave', () => { isDown = false; });
    el.addEventListener('mouseup', () => { isDown = false; });
    el.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.4;
      el.scrollLeft = scrollLeft - walk;
    });
  }

  initDragScroll(document.getElementById('reels-scroll'));
  initDragScroll(document.getElementById('order-again-scroll'));

  /* ── Like button toggle ───────────────── */
  window.toggleLike = function (btn) {
    const wasLiked = btn.classList.contains('liked');
    btn.classList.toggle('liked');
    btn.classList.add('pop');
    btn.addEventListener('animationend', () => btn.classList.remove('pop'), { once: true });

    const svg = btn.querySelector('svg');
    if (svg) {
      svg.setAttribute('fill', wasLiked ? 'none' : 'currentColor');
    }
    showToast(wasLiked ? 'Removed from favourites' : '❤️ Added to favourites');
  };

  /* ── Order Now from reel ──────────────── */
  window.handleOrderNow = function (btn) {
    const card = btn.closest('.reel-card');
    const restaurantName = card?.querySelector('.reel-restaurant')?.textContent || 'this restaurant';
    showToast('🛍️ Opening ' + restaurantName + '…');

    // Bump cart count
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
      const n = parseInt(cartCountEl.textContent, 10) || 0;
      cartCountEl.textContent = n + 1;
      cartCountEl.style.transform = 'scale(1.5)';
      setTimeout(() => { cartCountEl.style.transform = ''; }, 300);
    }
  };

  /* ── Reorder button ───────────────────── */
  window.handleReorder = function (btn) {
    const card = btn.closest('.order-again-card');
    const dish = card?.querySelector('.oa-dish')?.textContent || 'Item';
    showToast('🔄 Reordering ' + dish + '…');

    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
      const n = parseInt(cartCountEl.textContent, 10) || 0;
      cartCountEl.textContent = n + 1;
      cartCountEl.style.transform = 'scale(1.5)';
      setTimeout(() => { cartCountEl.style.transform = ''; }, 300);
    }
  };

  /* ── Toast ────────────────────────────── */
  let toastTimer = null;
  function showToast(msg) {
    const toast = document.getElementById('dash-toast');
    const msgEl = document.getElementById('dash-toast-msg');
    if (!toast || !msgEl) return;
    msgEl.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  /* ── Search keyboard shortcut (⌘K / Ctrl+K) ── */
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      const searchEl = document.getElementById('dash-search');
      if (searchEl) {
        searchEl.focus();
        searchEl.select();
      }
    }
  });

  /* ── GSAP entrance animations ────────── */
  if (typeof gsap !== 'undefined') {
    // Nav
    gsap.from('#dash-nav', {
      y: -60, opacity: 0, duration: 0.8,
      ease: 'power3.out', delay: 0.1
    });

    // Greeting
    gsap.from('.dash-greeting-content > *', {
      y: 30, opacity: 0, duration: 0.7, stagger: 0.12,
      ease: 'power3.out', delay: 0.3
    });

    // Pills
    gsap.from('.cuisine-pill', {
      y: 16, opacity: 0, duration: 0.5, stagger: 0.06,
      ease: 'power2.out', delay: 0.65
    });

    // Reel cards
    gsap.from('.reel-card', {
      x: 40, opacity: 0, duration: 0.6, stagger: 0.08,
      ease: 'power2.out', delay: 0.85
    });

    // Restaurant cards
    gsap.from('.restaurant-card', {
      y: 30, opacity: 0, duration: 0.55, stagger: 0.07,
      ease: 'power2.out', delay: 1.05
    });

    // Order again cards
    gsap.from('.order-again-card', {
      x: 30, opacity: 0, duration: 0.5, stagger: 0.08,
      ease: 'power2.out', delay: 1.25
    });
  }

  /* ── Restaurant card hover particle glow ── */
  document.querySelectorAll('.restaurant-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });

  /* ── Cart button ripple ─────────────────── */
  const cartBtn = document.getElementById('dash-cart');
  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      showToast('🛒 Your cart — 3 items');
    });
  }

  /* ── Reel infinite looping particles (canvas accent) ── */
  function createParticleAccent() {
    const reelWrap = document.getElementById('reels-scroll');
    if (!reelWrap) return;
    const cards = reelWrap.querySelectorAll('.reel-gradient-bg');
    cards.forEach((bg) => {
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        dot.className = 'reel-particle';
        dot.style.cssText = `
          position:absolute; border-radius:50%; pointer-events:none;
          width:${3 + Math.random()*4}px; height:${3 + Math.random()*4}px;
          background:rgba(255,255,255,${0.15 + Math.random()*0.2});
          left:${10 + Math.random()*80}%; top:${10 + Math.random()*80}%;
          animation: particleDrift ${3 + Math.random()*4}s ease-in-out ${Math.random()*2}s infinite alternate;
        `;
        bg.appendChild(dot);
      }
    });

    if (!document.getElementById('reel-particle-style')) {
      const style = document.createElement('style');
      style.id = 'reel-particle-style';
      style.textContent = `
        @keyframes particleDrift {
          0% { transform: translate(0,0) scale(1); opacity:0.3; }
          100% { transform: translate(${(Math.random()-0.5)*30}px, ${(Math.random()-0.5)*30}px) scale(1.5); opacity:0.7; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  createParticleAccent();

})();
