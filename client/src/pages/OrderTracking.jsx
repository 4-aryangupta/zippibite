import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getOrder } from '../api/api';

const STATUSES = [
  { key: 'received', label: 'Order Received', icon: '📋', desc: 'We got your order!' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳', desc: 'Chef is cooking your food' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🛵', desc: 'On the way to you!' },
  { key: 'delivered', label: 'Delivered', icon: '✅', desc: 'Enjoy your meal!' },
];

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const intervalRef = useRef(null);

  const fetchOrder = () => getOrder(id).then(r => setOrder(r.data.data.order));

  useEffect(() => {
    fetchOrder();
    intervalRef.current = setInterval(fetchOrder, 10000);
    return () => clearInterval(intervalRef.current);
  }, [id]);

  if (!order) return <div style={{ paddingTop: 68, minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading…</div>;

  const activeIdx = STATUSES.findIndex(s => s.key === order.status);

  return (
    <div style={{ paddingTop: 68, minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px clamp(16px,4vw,32px)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 700, marginBottom: 8 }}>Track Order</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 32 }}>Order from <strong style={{ color: 'var(--text-sub)' }}>{order.restaurantName}</strong></p>

        {/* Status steps */}
        <div className="glass-card" style={{ padding: '28px 32px', marginBottom: 28 }}>
          {STATUSES.map((s, i) => {
            const isActive = i === activeIdx;
            const isDone = i < activeIdx;
            const isFuture = i > activeIdx || order.status === 'cancelled';
            return (
              <div key={s.key} style={{ display: 'flex', gap: 20, paddingBottom: i < STATUSES.length - 1 ? 28 : 0, position: 'relative' }}>
                {/* Line */}
                {i < STATUSES.length - 1 && <div style={{ position: 'absolute', left: 22, top: 44, bottom: 0, width: 2, background: isDone ? 'linear-gradient(var(--orange),rgba(255,87,34,0.3))' : 'var(--glass-border)' }} />}
                {/* Circle */}
                <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', background: isDone || isActive ? 'rgba(255,87,34,0.1)' : 'rgba(255,255,255,0.03)', border: `2px solid ${isDone || isActive ? 'rgba(255,87,34,0.5)' : 'rgba(255,255,255,0.08)'}`, position: 'relative', zIndex: 2, boxShadow: isActive ? '0 0 16px rgba(255,87,34,0.3)' : 'none', opacity: isFuture ? 0.3 : 1 }}>
                  {s.icon}
                </div>
                <div style={{ opacity: isFuture ? 0.35 : 1 }}>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 2, color: isActive ? 'var(--orange)' : 'var(--text)' }}>{s.label}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Items */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Your Items</h3>
          {order.items.map(item => (
            <div key={item.menuItemId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-sub)' }}>{item.name} × {item.quantity}</span>
              <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--glass-border)', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
            <span>Total</span><span className="grad-text">₹{order.totalAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
