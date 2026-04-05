import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AppContext';

// ── Eye icons ─────────────────────────────────────────────────────────────────
const EyeOpen = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx={12} cy={12} r={3} />
  </svg>
);
const EyeOff = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 9000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '16px',
  },
  backdrop: {
    position: 'absolute', inset: 0,
    background: 'rgba(6,6,8,0.85)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
  },
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: 440,
    maxHeight: 'calc(100dvh - 32px)',
    overflowY: 'auto',
    borderRadius: 28,
    padding: 'clamp(24px, 5vw, 40px)',
    background: 'rgba(12,12,20,0.98)',
    border: '1px solid var(--glass-border)',
    boxShadow: '0 0 80px rgba(255,87,34,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
    zIndex: 1,
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  },
  closeBtn: {
    position: 'absolute', top: 16, right: 16,
    width: 36, height: 36, borderRadius: '50%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s',
    flexShrink: 0,
    zIndex: 10,
  },
  tabBar: {
    position: 'relative', display: 'flex',
    background: 'rgba(0,0,0,0.4)',
    borderRadius: 99, padding: 4,
    marginBottom: 28,
    border: '1px solid var(--glass-border)',
  },
  tabSlider: {
    position: 'absolute', top: 4, bottom: 4, left: 4,
    width: 'calc(50% - 4px)', borderRadius: 99,
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  tabBtn: (active) => ({
    flex: 1, padding: '10px 0',
    background: 'transparent', border: 'none', borderRadius: 99,
    cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600,
    color: active ? '#fff' : 'var(--text-muted)',
    position: 'relative', zIndex: 2,
    transition: 'color 0.3s',
    fontFamily: 'var(--font-body)',
    minHeight: 44,
  }),
  heading: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(1.4rem, 4vw, 1.7rem)',
    fontWeight: 700, marginBottom: 8,
  },
  sub: { color: 'var(--text-sub)', fontSize: '0.85rem', marginBottom: 24, lineHeight: 1.5 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  error: {
    color: '#FF4569', fontSize: '0.82rem',
    display: 'flex', alignItems: 'center', gap: 6,
  },
  hint: {
    fontSize: '0.78rem', marginTop: -8, paddingLeft: 4,
    transition: 'color 0.2s',
  },
  submitBtn: (loading) => ({
    padding: '16px', fontSize: '1rem', borderRadius: 14,
    marginTop: 4, opacity: loading ? 0.7 : 1,
    minHeight: 52,
  }),
  pwWrap: { position: 'relative' },
  pwToggle: {
    position: 'absolute', right: 16, top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent', border: 'none',
    color: 'var(--text-muted)', cursor: 'pointer',
    padding: 4, display: 'flex', alignItems: 'center',
    transition: 'color 0.2s',
    zIndex: 2,
  },
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function AuthModal({ open, onClose }) {
  const { login, signup } = useAuth();

  const [tab,     setTab]     = useState('login');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [showPw,  setShowPw]  = useState(false);
  const [form,    setForm]    = useState({ name: '', email: '', phone: '', password: '' });

  const set     = useCallback((k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setError('');
  }, []);

  const switchTab = useCallback((t) => {
    setTab(t);
    setError('');
    setShowPw(false);
  }, []);

  // ── Password strength hint ─────────────────────────────────────────────────
  const pwLen    = form.password.length;
  const pwWeak   = pwLen > 0 && pwLen < 6;
  const pwHintColor = pwWeak ? '#FF4569' : pwLen >= 6 ? '#1ec41e' : 'var(--text-muted)';
  const pwHintText  = pwWeak
    ? `${6 - pwLen} more character${6 - pwLen > 1 ? 's' : ''} needed`
    : pwLen >= 6 ? 'Looks good ✓' : '';

  // ── Submit ─────────────────────────────────────────────────────────────────
  // Navigation is handled by AuthNavigator (a stable component in App.jsx).
  // Context sets `pendingRedirect` after login/signup, AuthNavigator picks it up.
  // We just need to reset the form on success.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // prevent double-submit
    setLoading(true);
    setError('');
    try {
      if (tab === 'login') {
        await login({ email: form.email, password: form.password });
        // AuthNavigator will handle the redirect; modal closes via closeAuthModal in context
        setForm({ name: '', email: '', phone: '', password: '' });
      } else {
        await signup({ name: form.name, email: form.email, phone: form.phone, password: form.password });
        setForm({ name: '', email: '', phone: '', password: '' });
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = useCallback((e) => { if (e.key === 'Escape') onClose(); }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="auth-overlay"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={S.overlay}
          onKeyDown={handleKeyDown}
          role="dialog" aria-modal="true" aria-label={tab === 'login' ? 'Log in' : 'Sign up'}
        >
          {/* Backdrop */}
          <div style={S.backdrop} onClick={onClose} />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            style={S.card}
          >
            {/* ── Close ─────────────────────────────────────────── */}
            <button
              onClick={onClose}
              style={S.closeBtn}
              aria-label="Close"
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* ── Tab bar ───────────────────────────────────────── */}
            <div style={S.tabBar}>
              <motion.div
                animate={{ x: tab === 'login' ? 0 : '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                style={S.tabSlider}
              />
              {['login', 'signup'].map((t) => (
                <button key={t} onClick={() => switchTab(t)} style={S.tabBtn(tab === t)}>
                  {t === 'login' ? 'Log In' : 'Sign Up'}
                </button>
              ))}
            </div>

            {/* ── Heading ───────────────────────────────────────── */}
            <h3 style={S.heading}>
              {tab === 'login' ? 'Welcome back' : 'Join ZippBite'}
            </h3>
            <p style={S.sub}>
              {tab === 'login' ? 'Enter your details to continue.' : 'Create your premium account in seconds.'}
            </p>

            {/* ── Form ──────────────────────────────────────────── */}
            <form onSubmit={handleSubmit} style={S.form} noValidate>
              <AnimatePresence mode="wait">
                {tab === 'signup' && (
                  <motion.div key="name"
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}
                    className="form-group"
                  >
                    <input
                      className="form-input" type="text" placeholder=" "
                      value={form.name} onChange={set('name')}
                      required disabled={loading}
                      autoComplete="name"
                      id="auth-name"
                    />
                    <label className="floating-label" htmlFor="auth-name">Full Name</label>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="form-group">
                <input
                  className="form-input" type="email" placeholder=" "
                  value={form.email} onChange={set('email')}
                  required disabled={loading}
                  autoComplete="email"
                  id="auth-email"
                />
                <label className="floating-label" htmlFor="auth-email">Email</label>
              </div>

              <AnimatePresence mode="wait">
                {tab === 'signup' && (
                  <motion.div key="phone"
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}
                    className="form-group"
                  >
                    <input
                      className="form-input" type="tel" placeholder=" "
                      value={form.phone} onChange={set('phone')}
                      disabled={loading} autoComplete="tel"
                      id="auth-phone"
                    />
                    <label className="floating-label" htmlFor="auth-phone">Phone (optional)</label>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Password field with toggle ───────────────────── */}
              <div>
                <div className="form-group" style={S.pwWrap}>
                  <input
                    className="form-input"
                    type={showPw ? 'text' : 'password'}
                    placeholder=" "
                    value={form.password}
                    onChange={set('password')}
                    required
                    minLength={6}
                    disabled={loading}
                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                    id="auth-password"
                    style={{ paddingRight: 48 }}
                  />
                  <label className="floating-label" htmlFor="auth-password">Password</label>

                  {/* Show/hide toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    style={S.pwToggle}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    {showPw ? <EyeOff /> : <EyeOpen />}
                  </button>
                </div>

                {/* Real-time password hint — only visible during signup */}
                <AnimatePresence>
                  {tab === 'signup' && pwHintText && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      style={{ ...S.hint, color: pwHintColor }}
                    >
                      {pwHintText}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Error ───────────────────────────────────────── */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    key="err"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    style={S.error}
                    role="alert"
                  >
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <circle cx={12} cy={12} r={10} /><line x1={12} y1={8} x2={12} y2={12} /><line x1={12} y1={16} x2={12.01} y2={16} />
                    </svg>
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* ── Submit ──────────────────────────────────────── */}
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={S.submitBtn(loading)}
                aria-busy={loading}
              >
                {loading
                  ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <SpinDot /> Please wait…
                    </span>
                  : tab === 'login' ? 'Continue' : 'Create Account'
                }
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Minimal inline spinner for submit button ──────────────────────────────────
function SpinDot() {
  return (
    <>
      <style>{`@keyframes zbSpin { to { transform: rotate(360deg); } }`}</style>
      <span style={{
        width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: '#fff', borderRadius: '50%',
        display: 'inline-block',
        animation: 'zbSpin 0.7s linear infinite',
        flexShrink: 0,
      }} />
    </>
  );
}
