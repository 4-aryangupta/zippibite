import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

import {
  fetchMe,
  loginUser,
  registerUser,
  logoutUser,
  getCart,
} from '../api/api';

// ── AuthModal control — global open/close without prop-drilling ───────────────
// Consumers call window.__openAuth?.() from anywhere (Navbar, LandingPage, etc.)
const AuthModalContext = createContext(null);
export const useAuthModal = () => useContext(AuthModalContext);

// ── Contexts ──────────────────────────────────────────────────────────────────
const AuthContext  = createContext(null);
const CartContext  = createContext(null);
const ToastContext = createContext(null);

// ── Normalise error messages from Axios responses ─────────────────────────────
function extractMessage(err) {
  return (
    err?.response?.data?.message ||
    err?.message ||
    'Something went wrong. Please try again.'
  );
}

// ── AppProvider ───────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [user,            setUser]            = useState(null);
  const [authLoading,     setAuthLoading]     = useState(true);
  const [cart,            setCart]            = useState(null);
  const [toast,           setToast]           = useState({ msg: '', visible: false });
  const [authModalOpen,   setAuthModalOpen]   = useState(false);
  // pendingRedirect: set after login/signup; cleared by AuthNavigator after navigate()
  const [pendingRedirect, setPendingRedirect] = useState(null);
  const toastTimer = useRef(null);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg, duration = 2800) => {
    clearTimeout(toastTimer.current);
    setToast({ msg, visible: true });
    toastTimer.current = setTimeout(() => setToast({ msg: '', visible: false }), duration);
  }, []);

  // Expose on window for legacy JS calls (main.js, etc.)
  useEffect(() => {
    window.__showToast = showToast;
    return () => { delete window.__showToast; };
  }, [showToast]);

  // ── Session bootstrap — GET /api/auth/me ──────────────────────────────────
  useEffect(() => {
    fetchMe()
      .then((r) => setUser(r.data.data.user))
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  // ── 401 / session-expired handler ─────────────────────────────────────────
  // The Axios interceptor fires 'zb:session-expired' when a protected call
  // returns 401, so we clear state and notify the user without needing
  // a navigate() inside the api module (keeps separation of concerns).
  useEffect(() => {
    const handle = () => {
      setUser(null);
      setCart(null);
      showToast('Session expired — please log in again');
      // Use React routing instead of a hard reload — toast stays visible
      // and there’s no blank screen during the transition.
      setTimeout(() => {
        setPendingRedirect('/');
      }, 1800);
    };
    window.addEventListener('zb:session-expired', handle);
    return () => window.removeEventListener('zb:session-expired', handle);
  }, [showToast]);

  // ── Cart ──────────────────────────────────────────────────────────────────
  const refreshCart = useCallback(async () => {
    try {
      const r = await getCart();
      setCart(r.data.data.cart || null);
    } catch {
      setCart(null);
    }
  }, []);

  // Refresh cart whenever auth state changes
  useEffect(() => {
    if (user) refreshCart();
    else setCart(null);
  }, [user, refreshCart]);

  // ── Auth actions ──────────────────────────────────────────────────────────
  // login() and signup() set `pendingRedirect` so that AuthNavigator (a stable
  // component inside BrowserRouter) handles navigation — this prevents the
  // race condition where navigate() was called on an unmounting AuthModal.
  const login = async (credentials) => {
    try {
      const r = await loginUser(credentials);
      const u = r.data.data.user;
      setUser(u);
      // Refresh cart but never let its failure block navigation
      try { await refreshCart(); } catch (_) {}
      // Queue redirect AFTER setting user — AuthNavigator picks it up
      setPendingRedirect(u.role === 'admin' ? '/admin' : '/dashboard');
      return u;
    } catch (err) {
      throw new Error(extractMessage(err));
    }
  };

  const signup = async (data) => {
    try {
      const r = await registerUser(data);
      const u = r.data.data.user;
      setUser(u);
      // Refresh cart but never let its failure block navigation
      try { await refreshCart(); } catch (_) {}
      setPendingRedirect('/dashboard');
      return u;
    } catch (err) {
      throw new Error(extractMessage(err));
    }
  };

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (_) {
      // Even if the network call fails, clear client state.
    } finally {
      setUser(null);
      setCart(null);
      // Signal AuthNavigator to go home — keeps routing inside React
      setPendingRedirect('/');
    }
  }, []);

  const cartCount = cart?.items?.reduce((n, i) => n + i.quantity, 0) || 0;
  const cartTotal = cart?.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;

  return (
    <ToastContext.Provider value={{ showToast }}>
      <AuthContext.Provider value={{ user, authLoading, login, signup, logout, pendingRedirect, clearRedirect: () => setPendingRedirect(null) }}>
        <CartContext.Provider value={{ cart, setCart, refreshCart, cartCount, cartTotal }}>
          <AuthModalContext.Provider value={{ authModalOpen, openAuthModal: () => setAuthModalOpen(true), closeAuthModal: () => setAuthModalOpen(false) }}>
            {children}

            {/* ── Global Toast ──────────────────────────────────────── */}
            <div className={`toast ${toast.visible ? 'show' : ''}`}>
              {toast.msg}
            </div>
          </AuthModalContext.Provider>
        </CartContext.Provider>
      </AuthContext.Provider>
    </ToastContext.Provider>
  );
}

// ── Hooks ─────────────────────────────────────────────────────────────────────
export const useAuth  = () => useContext(AuthContext);
export const useCart  = () => useContext(CartContext);
export const useToast = () => useContext(ToastContext);

// showToast helper — works from any module (falls back to window if called
// before context is mounted, e.g. from legacy JS).
export const showToast = (msg) => window.__showToast?.(msg);
