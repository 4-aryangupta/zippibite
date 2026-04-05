import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useCart, useAuthModal } from '../context/AppContext';

export default function Navbar() {
  const { user, logout }  = useAuth();
  const { cartCount }     = useCart();
  const { openAuthModal } = useAuthModal();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search,  setSearch]   = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // window.__openAuth is set in App.jsx's AppShell — no need to override here

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(6,6,8,0.8)',
        borderBottom: '1px solid var(--glass-border)',
        transition: 'box-shadow 0.3s var(--ease)',
        boxShadow: scrolled ? '0 4px 40px rgba(0,0,0,0.5)' : 'none',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 clamp(16px,4vw,60px)', height: 68, display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Logo */}
          <Link to="/dashboard" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <svg style={{ height: 34, width: 'auto', overflow: 'visible', filter: 'drop-shadow(0 0 8px rgba(255,87,34,0.6))' }} viewBox="0 0 200 48" xmlns="http://www.w3.org/2000/svg">
              <defs><linearGradient id="lgNav" x1="0" y1="0" x2="200" y2="48" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#FF5722"/><stop offset="100%" stopColor="#FFD600"/></linearGradient></defs>
              <path d="M1,3 L25,3 L25,11 L19,22 L23,22 L23,26 L9,26 L3,37 L27,37 L27,45 L1,45 L1,37 L15,26 L11,26 L11,22 L17,22 Z" fill="url(#lgNav)"/>
              <text x="31" y="40" fontFamily="'Clash Display',sans-serif" fontWeight="700" fontSize="34" fill="url(#lgNav)">ipp</text>
              <text x="99" y="41" fontFamily="'Clash Display',sans-serif" fontWeight="700" fontSize="38" fill="url(#lgNav)">Bite</text>
            </svg>
          </Link>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 480, position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/></svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && navigate(`/dashboard?q=${search}`)}
              placeholder="Search restaurants, cuisines…"
              style={{
                width: '100%', padding: '10px 44px 10px 40px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                borderRadius: 99, color: 'var(--text)', fontSize: '0.87rem',
                fontFamily: 'var(--font-body)', outline: 'none',
                transition: 'all 0.3s var(--ease)',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(255,87,34,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,87,34,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--glass-border)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Right */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
            {/* Cart */}
            <button onClick={() => user ? navigate('/cart') : openAuthModal()}
              style={{ position: 'relative', width: 42, height: 42, borderRadius: '50%', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s var(--ease)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.color = 'var(--orange)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--text-sub)'; }}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={8} cy={21} r={1}/><circle cx={19} cy={21} r={1}/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg,var(--orange),var(--gold))', color: '#fff', fontSize: '0.62rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg)' }}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* User / Login */}
            {user ? (
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button onClick={() => setMenuOpen(!menuOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px 6px 6px', borderRadius: 99, border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'all 0.3s' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--orange),var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
                    {user.name[0].toUpperCase()}
                  </div>
                  <span style={{ color: 'var(--text)', fontSize: '0.82rem', fontWeight: 600 }}>{user.name.split(' ')[0]}</span>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth={2}><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      style={{ position: 'absolute', right: 0, top: '110%', minWidth: 180, background: 'rgba(15,15,20,0.97)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: 8, zIndex: 300 }}>
                      <Link to="/dashboard" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 16px', color: 'var(--text-sub)', textDecoration: 'none', borderRadius: 10, fontSize: '0.87rem', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.06)'} onMouseLeave={e => e.target.style.background = 'transparent'}>My Orders</Link>
                      {user.role === 'admin' && <Link to="/admin" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 16px', color: 'var(--orange)', textDecoration: 'none', borderRadius: 10, fontSize: '0.87rem', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.06)'} onMouseLeave={e => e.target.style.background = 'transparent'}>Admin Panel</Link>}
                      <button onClick={() => { logout(); setMenuOpen(false); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', color: 'var(--text-sub)', background: 'transparent', border: 'none', borderRadius: 10, fontSize: '0.87rem', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.06)'} onMouseLeave={e => e.target.style.background = 'transparent'}>Log Out</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button className="btn-primary" onClick={openAuthModal} style={{ padding: '10px 24px', fontSize: '0.88rem', borderRadius: 99 }}>Order Now</button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
