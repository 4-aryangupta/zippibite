import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { updateCart, clearCart } from '../api/api';
import { useCart, showToast } from '../context/AppContext';

const GST_RATE         = 0.05;
const DELIVERY_FEE     = 30;
const FREE_DELIVERY_ABOVE = 499;

// ── Responsive grid: stack on narrow screens ──────────────────────────────────
function useIsMobile(breakpoint = 720) {
  const [mobile, setMobile] = useState(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handler, { passive: true });
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);
  return mobile;
}

export default function CartPage() {
  const { cart, refreshCart } = useCart();
  const navigate  = useNavigate();
  const isMobile  = useIsMobile();

  useEffect(() => { refreshCart(); }, []);

  const handleQty = async (menuItemId, qty) => {
    await updateCart({ menuItemId, quantity: qty });
    await refreshCart();
    if (qty === 0) showToast('Item removed');
  };

  const handleClear = async () => {
    await clearCart();
    await refreshCart();
    showToast('Cart cleared');
  };

  // ── Empty cart ────────────────────────────────────────────────────────────
  if (!cart || !cart.items?.length) {
    return (
      <div style={{ paddingTop: 68, minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <p style={{ fontSize: '5rem' }}>🛒</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700 }}>Your cart is empty</h2>
        <p style={{ color: 'var(--text-muted)' }}>Add items from a restaurant to get started</p>
        <button className="btn-primary" onClick={() => navigate('/dashboard')} style={{ padding: '13px 32px', fontSize: '0.95rem', borderRadius: 12 }}>Browse Restaurants</button>
      </div>
    );
  }

  const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const gst      = Math.round(subtotal * GST_RATE);
  const delivery = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  const total    = subtotal + gst + delivery;

  return (
    <div style={{ paddingTop: 68, minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: 'clamp(24px,4vw,48px) clamp(16px,4vw,32px)',
        // On mobile: single column stack; on desktop: side-by-side
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr min(380px,100%)',
        gap: isMobile ? 24 : 32,
      }}>

        {/* ── Cart items ──────────────────────────────────────── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, marginBottom: 4 }}>Your Cart</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>From: <strong style={{ color: 'var(--text-sub)' }}>{cart.restaurantName}</strong></p>
            </div>
            <button onClick={handleClear} className="btn-ghost" style={{ padding: '7px 14px', fontSize: '0.78rem' }}>Clear</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cart.items.map((item) => (
              <motion.div key={item.menuItemId} layout className="glass-card" style={{ padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
                {item.image
                  ? <img src={item.image} alt={item.name} style={{ width: 64, height: 52, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 64, height: 52, borderRadius: 10, background: 'rgba(255,87,34,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>🍽️</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>{item.name}</p>
                  <p style={{ color: 'var(--orange)', fontWeight: 700, fontSize: '0.85rem' }}>₹{item.price} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>each</span></p>
                </div>
                {/* Stepper */}
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,87,34,0.08)', border: '1px solid rgba(255,87,34,0.2)', borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                  <button onClick={() => handleQty(item.menuItemId, item.quantity - 1)} style={{ width: 34, height: 34, background: 'transparent', border: 'none', color: 'var(--orange)', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ minWidth: 30, textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>{item.quantity}</span>
                  <button onClick={() => handleQty(item.menuItemId, item.quantity + 1)} style={{ width: 34, height: 34, background: 'transparent', border: 'none', color: 'var(--orange)', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
                <p style={{ minWidth: 60, textAlign: 'right', fontWeight: 700, fontSize: '0.9rem' }}>₹{item.price * item.quantity}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Bill summary ────────────────────────────────────── */}
        {/* On desktop: sticky sidebar. On mobile: normal block below items. */}
        <div style={{ position: isMobile ? 'static' : 'sticky', top: 84, height: 'fit-content' }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>Bill Details</h2>
            {[
              { label: 'Subtotal',    val: `₹${subtotal}` },
              { label: 'GST (5%)',    val: `₹${gst}` },
              { label: 'Packaging',   val: `₹${cart.packagingCharge || 0}` },
              { label: 'Delivery fee', val: delivery === 0 ? <span style={{ color: '#1ec41e', fontWeight: 600 }}>FREE</span> : `₹${delivery}` },
            ].map(({ label, val }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                <span>{label}</span><span style={{ color: 'var(--text)' }}>{val}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--glass-border)', margin: '16px 0', paddingTop: 16, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem' }}>
              <span>Total</span><span className="grad-text">₹{total}</span>
            </div>
            {subtotal < FREE_DELIVERY_ABOVE && (
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                Add ₹{FREE_DELIVERY_ABOVE - subtotal} more for free delivery
              </p>
            )}
            <button className="btn-primary" onClick={() => navigate('/checkout')} style={{ width: '100%', padding: '14px', fontSize: '0.95rem', borderRadius: 12 }}>
              Proceed to Checkout  ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
