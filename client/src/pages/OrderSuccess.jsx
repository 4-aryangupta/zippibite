import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getOrder } from '../api/api';

export default function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => { getOrder(id).then(r => setOrder(r.data.data.order)); }, [id]);

  return (
    <div style={{ paddingTop: 68, minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: 480, padding: 40 }}>
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 18, stiffness: 250, delay: 0.1 }}
          style={{ width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle,rgba(30,196,30,0.2),rgba(30,196,30,0.04))', border: '2px solid rgba(30,196,30,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 40px rgba(30,196,30,0.2)' }}>
          <svg width={50} height={50} viewBox="0 0 24 24" fill="none" stroke="#1ec41e" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <motion.path d="M20 6L9 17l-5-5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }} />
          </svg>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>
          Order Placed! 🎉
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          style={{ color: 'var(--text-sub)', fontSize: '0.95rem', marginBottom: 12 }}>
          Your order has been received and is being prepared 🍳
        </motion.p>

        {order && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            className="glass-card" style={{ padding: 24, marginBottom: 28, textAlign: 'left' }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 2 }}>Order ID</p>
            <p style={{ fontWeight: 700, marginBottom: 16, fontFamily: 'var(--font-display)', fontSize: '0.95rem' }}>{order._id}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginBottom: 8 }}>
              <strong style={{ color: 'var(--text)' }}>{order.restaurantName}</strong> · {order.items.length} items
            </p>
            <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--orange)' }}>₹{order.totalAmount}</p>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
          style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to={`/orders/${id}`} className="btn-primary" style={{ padding: '12px 28px', fontSize: '0.9rem', borderRadius: 12, textDecoration: 'none', display: 'inline-flex' }}>
            Track Order →
          </Link>
          <button onClick={() => navigate('/dashboard')} className="btn-ghost" style={{ padding: '12px 24px', fontSize: '0.9rem' }}>
            Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
}
