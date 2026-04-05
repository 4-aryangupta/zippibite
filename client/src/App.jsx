import { useEffect, useRef, Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider, useAuth, useAuthModal } from './context/AppContext';
import AuthModal from './components/AuthModal';
import AppLoader from './components/AppLoader';
import CustomCursor from './components/CustomCursor';
import LandingPage from './pages/LandingPage';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import RestaurantPage from './pages/RestaurantPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccess from './pages/OrderSuccess';
import OrderTracking from './pages/OrderTracking';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import OrderTickets from './pages/admin/OrderTickets';
import RestaurantManager from './pages/admin/RestaurantManager';
import MenuManager from './pages/admin/MenuManager';
import UserManager from './pages/admin/UserManager';
import './index.css';

// ── Route error boundary ─────────────────────────────────────────────────────────────
// Catches render errors in any wrapped route so a crash never produces a blank screen.
class RouteErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('[ZippBite] Route render error:', error, info); }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
        background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-body)',
      }}>
        <p style={{ fontSize: '2.5rem' }}>⚠️</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>Something went wrong</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', maxWidth: 320 }}>
          {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <button
          className="btn-primary"
          style={{ padding: '12px 28px', fontSize: '0.9rem', borderRadius: 12 }}
          onClick={() => { this.setState({ hasError: false }); window.history.back(); }}
        >
          Go Back
        </button>
      </div>
    );
  }
}

// ── Route guards ──────────────────────────────────────────────────────────────
function PrivateRoute({ children }) {
  const { user, authLoading } = useAuth();
  if (authLoading) return <AppLoader />;
  return user ? children : <Navigate to="/" replace />;
}

function AdminRoute({ children }) {
  const { user, authLoading } = useAuth();
  if (authLoading) return <AppLoader label="Verifying access…" />;
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
}

// ── AuthNavigator ─────────────────────────────────────────────────────────────
// Sits inside BrowserRouter and never unmounts, so navigate() is always safe.
// Watches `pendingRedirect` from context and executes navigation cleanly.
function AuthNavigator() {
  const { pendingRedirect, clearRedirect } = useAuth();
  const { closeAuthModal }                 = useAuthModal();
  const navigate = useNavigate();
  const inFlight = useRef(false); // prevent double-fire from React StrictMode

  useEffect(() => {
    if (!pendingRedirect || inFlight.current) return;
    inFlight.current = true;

    // Only close the modal when navigating away from landing page (not on logout→/)
    const isPostLogin = pendingRedirect !== '/';
    if (isPostLogin) closeAuthModal();

    // Small delay lets modal exit animation start before route change
    const timer = setTimeout(() => {
      try {
        navigate(pendingRedirect, { replace: true });
      } catch (e) {
        console.error('[ZippBite] Navigation failed:', e);
      } finally {
        clearRedirect();
        inFlight.current = false;
      }
    }, isPostLogin ? 60 : 0);

    return () => {
      clearTimeout(timer);
      inFlight.current = false;
    };
  }, [pendingRedirect]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

// ── App shell ─────────────────────────────────────────────────────────────────
function AppShell() {
  const { openAuthModal, authModalOpen, closeAuthModal } = useAuthModal();

  // Signal to main.js that React is in control — prevents vanilla auth modal
  useEffect(() => { window.__reactApp = true; }, []);

  // Expose auth opener globally for landing page and any vanilla JS to call
  useEffect(() => {
    window.__openAuth = openAuthModal;
    return () => { delete window.__openAuth; };
  }, [openAuthModal]);

  return (
    <BrowserRouter>
      {/* ── Global custom cursor — matches original index.html dot+ring design.
          Mounted once here (never unmounts) so it works on every route.
          It sets window.__reactCursorActive so main.js initCursor() defers to React. */}
      <CustomCursor />

      {/* AuthNavigator sits inside BrowserRouter so it has access to navigate().
          It is always mounted — never conditionally rendered — so navigate() is safe. */}
      <AuthNavigator />

      <Routes>
        <Route path="/"           element={<LandingPage onAuthOpen={openAuthModal} />} />
        <Route path="/dashboard"  element={<RouteErrorBoundary><Navbar /><Dashboard /></RouteErrorBoundary>} />
        <Route path="/restaurant/:id" element={<RouteErrorBoundary><Navbar /><RestaurantPage /></RouteErrorBoundary>} />

        {/* Protected routes */}
        <Route path="/cart"      element={<PrivateRoute><Navbar /><CartPage /></PrivateRoute>} />
        <Route path="/checkout"  element={<PrivateRoute><Navbar /><CheckoutPage /></PrivateRoute>} />
        <Route path="/order-success/:id" element={<PrivateRoute><Navbar /><OrderSuccess /></PrivateRoute>} />
        <Route path="/orders/:id"        element={<PrivateRoute><Navbar /><OrderTracking /></PrivateRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index             element={<AdminDashboard />} />
          <Route path="orders"       element={<OrderTickets />} />
          <Route path="restaurants"  element={<RestaurantManager />} />
          <Route path="menu"         element={<MenuManager />} />
          <Route path="users"        element={<UserManager />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Auth modal — always rendered in-tree (never conditionally mounted/unmounted
          based on authOpen flag) so navigate() within it is safe. Visibility is
          controlled by the `open` prop passed to AnimatePresence inside the modal. */}
      <AuthModal open={authModalOpen} onClose={closeAuthModal} />
    </BrowserRouter>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}