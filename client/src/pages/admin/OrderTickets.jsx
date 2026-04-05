import { useState, useEffect, useCallback } from 'react';
import { adminGetOrders, adminUpdateStatus } from '../../api/api';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
  { key: 'active', label: 'Active', emoji: '🔴' },
  { key: 'completed', label: 'Completed', emoji: '✅' },
  { key: 'cancelled', label: 'Cancelled', emoji: '❌' },
];

const STATUS_LABELS = {
  received: 'Received',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_NEXT = {
  received: 'preparing',
  preparing: 'out_for_delivery',
  out_for_delivery: 'delivered',
};

function Countdown({ deadline }) {
  const [remaining, setRemaining] = useState(0);
  const [total] = useState(45 * 60 * 1000);

  useEffect(() => {
    const tick = () => {
      const ms = new Date(deadline) - Date.now();
      setRemaining(Math.max(0, ms));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const pct = Math.max(0, Math.min(100, (1 - remaining / total) * 100));
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const color = pct < 60 ? '#1ec41e' : pct < 80 ? '#FFD600' : '#EF4444';

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>⏱ Time remaining</span>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{mins}:{secs.toString().padStart(2,'0')}</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 3, background: color, transition: 'width 1s linear, background 0.5s' }} />
      </div>
    </div>
  );
}

export default function OrderTickets() {
  const [tab, setTab] = useState('active');
  const [orders, setOrders] = useState([]);
  const [updating, setUpdating] = useState(null);
  const last = { active: null, completed: null, cancelled: null };

  const fetchOrders = useCallback(async () => {
    const r = await adminGetOrders({ tab });
    setOrders(r.data.data.orders);
  }, [tab]);

  useEffect(() => {
    fetchOrders();
    const id = setInterval(fetchOrders, 10000);
    return () => clearInterval(id);
  }, [fetchOrders]);

  const advance = async (orderId, nextStatus) => {
    setUpdating(orderId);
    await adminUpdateStatus(orderId, { status: nextStatus });
    await fetchOrders();
    setUpdating(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 700 }}>Order Tickets</h1>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Auto-refreshes every 10s</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: '9px 20px', borderRadius: 99, border: 'none', background: tab === t.key ? 'rgba(255,87,34,0.12)' : 'rgba(255,255,255,0.04)', color: tab === t.key ? 'var(--orange)' : 'var(--text-sub)', fontSize: '0.83rem', fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer', border: tab === t.key ? '1px solid rgba(255,87,34,0.35)' : '1px solid rgba(255,255,255,0.06)', transition: 'all 0.2s' }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* Tickets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: 16 }}>
        <AnimatePresence>
          {orders.map(order => (
            <motion.div key={order._id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
              className="glass-card" style={{ padding: 24, borderTopColor: order.status === 'received' ? 'rgba(255,87,34,0.5)' : 'var(--glass-border)', borderTopWidth: 2 }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>ORDER #{order._id.slice(-6).toUpperCase()}</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>{order.restaurantName}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.userId?.name || '—'} · {order.deliveryAddress?.city}</p>
                </div>
                <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700, background: order.status === 'received' ? 'rgba(255,87,34,0.15)' : order.status === 'preparing' ? 'rgba(255,214,0,0.1)' : order.status === 'out_for_delivery' ? 'rgba(30,196,30,0.1)' : 'rgba(255,255,255,0.06)', color: order.status === 'received' ? 'var(--orange)' : order.status === 'preparing' ? '#FFD600' : order.status === 'out_for_delivery' ? '#1ec41e' : 'var(--text-muted)', border: '1px solid currentColor' }}>
                  {STATUS_LABELS[order.status]}
                </span>
              </div>

              {/* Items */}
              <div style={{ marginBottom: 14, borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', padding: '10px 0' }}>
                {order.items.map(item => (
                  <div key={item.menuItemId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-sub)' }}>• {item.name} ×{item.quantity}</span>
                    <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontWeight: 700, fontSize: '0.9rem' }}>
                  <span>Total</span><span style={{ color: 'var(--orange)' }}>₹{order.totalAmount}</span>
                </div>
              </div>

              {/* Countdown (admin only) */}
              {order.adminDeadline && tab === 'active' && <Countdown deadline={order.adminDeadline} />}

              {/* Action buttons */}
              {STATUS_NEXT[order.status] && tab === 'active' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button onClick={() => advance(order._id, STATUS_NEXT[order.status])} disabled={updating === order._id}
                    className="btn-primary" style={{ flex: 1, padding: '10px 0', fontSize: '0.8rem', borderRadius: 10, opacity: updating === order._id ? 0.6 : 1 }}>
                    {updating === order._id ? '…' : `Mark ${STATUS_LABELS[STATUS_NEXT[order.status]]}`}
                  </button>
                  <button onClick={() => advance(order._id, 'cancelled')} disabled={updating === order._id}
                    className="btn-ghost" style={{ padding: '10px 14px', fontSize: '0.8rem' }}>
                    Cancel
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {orders.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', gridColumn: '1/-1' }}>No {tab} orders.</p>}
      </div>
    </div>
  );
}
