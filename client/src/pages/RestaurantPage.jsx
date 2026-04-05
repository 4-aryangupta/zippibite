import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getRestaurant, getMenu, addToCart } from '../api/api';
import { useAuth, useCart, showToast } from '../context/AppContext';

export default function RestaurantPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState({});
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [conflict, setConflict] = useState(null); // { currentRestaurantName, newRestaurantName, pendingItem }
  const [addingItem, setAddingItem] = useState(null);
  const categoryRefs = useRef({});

  useEffect(() => {
    Promise.all([getRestaurant(id), getMenu(id)]).then(([r1, r2]) => {
      setRestaurant(r1.data.data.restaurant);
      const m = r2.data.data.menu;
      setMenu(m);
      setActiveCategory(Object.keys(m)[0] || '');
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async (item, forceReplace = false) => {
    if (!user) { window.__openAuth?.(); return; }
    setAddingItem(item._id);
    try {
      await addToCart({ menuItemId: item._id, quantity: 1, forceReplace });
      await refreshCart();
      setConflict(null);
      showToast(`🛍️ ${item.name} added to cart!`);
    } catch (err) {
      if (err.response?.data?.message === 'cart_conflict') {
        setConflict({ ...err.response.data.data, pendingItem: item });
      }
    } finally { setAddingItem(null); }
  };

  const scrollToCategory = (cat) => {
    setActiveCategory(cat);
    categoryRefs.current[cat]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) return <div style={{ paddingTop: 68, minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading…</div>;
  if (!restaurant) return null;

  const categories = Object.keys(menu);

  return (
    <div style={{ paddingTop: 68, minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Conflict modal */}
      <AnimatePresence>
        {conflict && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(6,6,8,0.8)', backdropFilter: 'blur(20px)' }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ background: 'rgba(12,12,20,0.97)', border: '1px solid var(--glass-border)', borderRadius: 24, padding: 32, maxWidth: 420, textAlign: 'center', boxShadow: '0 0 80px rgba(255,87,34,0.1)' }}>
              <p style={{ fontSize: '1.5rem', marginBottom: 12 }}>🛒</p>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, marginBottom: 12 }}>Cart has items from another restaurant</h3>
              <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: 24 }}>
                Your cart has items from <strong style={{ color: 'var(--white)' }}>{conflict.currentRestaurantName}</strong>.<br />
                Clear it to add from <strong style={{ color: 'var(--orange)' }}>{conflict.newRestaurantName}</strong>?
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setConflict(null)} className="btn-ghost" style={{ flex: 1, padding: '12px 0' }}>Keep Current</button>
                <button onClick={() => handleAdd(conflict.pendingItem, true)} className="btn-primary" style={{ flex: 1, padding: '12px 0', borderRadius: 12 }}>Clear & Add</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <div style={{ height: 260, position: 'relative', background: 'linear-gradient(135deg,#1a0800,#0a0a0f)', display: 'flex', alignItems: 'flex-end' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent 40%,rgba(6,6,8,0.95) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, padding: 'clamp(16px,4vw,60px)', maxWidth: 1400, width: '100%', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: 16, background: 'rgba(255,87,34,0.15)', border: '1px solid rgba(255,87,34,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>🍽️</div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>{restaurant.name}</h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', color: 'var(--text-sub)', fontSize: '0.82rem' }}>
                <span style={{ color: '#FFD600', fontWeight: 600 }}>★ {restaurant.rating}</span>
                <span>⏱ {restaurant.deliveryTime}</span>
                <span>💰 Min ₹{restaurant.minOrder}</span>
                {restaurant.cuisine.map(c => <span key={c} style={{ padding: '3px 10px', background: 'rgba(255,255,255,0.08)', borderRadius: 99, fontSize: '0.72rem' }}>{c}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px clamp(16px,4vw,60px)', display: 'flex', gap: 32 }}>
        {/* Category sidebar */}
        <div style={{ width: 200, flexShrink: 0, display: window.innerWidth > 768 ? 'block' : 'none', position: 'sticky', top: 80, height: 'fit-content' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => scrollToCategory(cat)}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: 12, border: 'none', background: activeCategory === cat ? 'rgba(255,87,34,0.1)' : 'transparent', color: activeCategory === cat ? 'var(--orange)' : 'var(--text-sub)', fontSize: '0.85rem', fontWeight: activeCategory === cat ? 600 : 400, fontFamily: 'var(--font-body)', cursor: 'pointer', marginBottom: 4, transition: 'all 0.2s', borderLeft: activeCategory === cat ? '2px solid var(--orange)' : '2px solid transparent' }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Menu items */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {categories.map(cat => (
            <div key={cat} ref={el => categoryRefs.current[cat] = el} style={{ marginBottom: 40 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--glass-border)' }}>{cat}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {menu[cat].map(item => (
                  <motion.div key={item._id} whileHover={{ y: -2 }} className="glass-card"
                    style={{ padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    {/* Left content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div className={`veg-badge ${item.isVeg ? 'veg' : 'nonveg'}`} />
                        {item.isBestseller && <span style={{ fontSize: '0.65rem', fontWeight: 600, background: 'rgba(255,87,34,0.12)', color: 'var(--orange)', border: '1px solid rgba(255,87,34,0.25)', borderRadius: 4, padding: '2px 7px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Bestseller</span>}
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>{item.name}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</p>
                      <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>₹{item.price}</p>
                    </div>
                    {/* Right: image + add */}
                    <div style={{ flexShrink: 0, position: 'relative' }}>
                      <div style={{ width: 100, height: 80, borderRadius: 12, overflow: 'hidden', background: 'rgba(255,87,34,0.1)', marginBottom: 8 }}>
                        {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🍽️</div>}
                      </div>
                      <button onClick={() => handleAdd(item)} className="btn-primary" disabled={addingItem === item._id}
                        style={{ width: '100%', padding: '7px 0', fontSize: '0.78rem', borderRadius: 10, opacity: addingItem === item._id ? 0.7 : 1 }}>
                        {addingItem === item._id ? '…' : '+ Add'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
