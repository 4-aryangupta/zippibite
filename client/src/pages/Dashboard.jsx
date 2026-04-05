import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AppContext';
import { useRestaurants } from '../hooks/useRestaurants';
import { useOrderHistory } from '../hooks/useOrderHistory';
import ReelSection from '../components/ReelSection';

const CUISINES = [
  { label: 'All',          emoji: '🍽️', value: 'all' },
  { label: 'Biryani',      emoji: '🍚', value: 'biryani' },
  { label: 'North Indian', emoji: '🫕', value: 'north indian' },
  { label: 'South Indian', emoji: '🥘', value: 'south indian' },
  { label: 'Chinese',      emoji: '🥡', value: 'chinese' },
  { label: 'Desserts',     emoji: '🍰', value: 'desserts' },
  { label: 'Grills',       emoji: '🔥', value: 'grills' },
  { label: 'Cafe',         emoji: '☕', value: 'cafe' },
  { label: 'Beverages',    emoji: '🥤', value: 'beverages' },
  { label: 'Fusion',       emoji: '✨', value: 'fusion' },
];

const COLORS = [
  ['#FF5722','#1a0800'],['#8B5CF6','#0a0012'],['#10B981','#001209'],
  ['#F59E0B','#100800'],['#EF4444','#0e0000'],['#06B6D4','#000d10'],
  ['#EC4899','#200010'],['#FF5722','#0d0500'],['#14B8A6','#001210'],
  ['#F97316','#130800'],['#A855F7','#0d0015'],['#22D3EE','#000d12'],
];
const EMOJIS = ['🍔','🍕','🍣','🍚','🍰','🥗','🥡','🌮','🍜','🧆','🫕','🥤'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ── Shimmer skeleton card ─────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="glass-card" style={{ borderRadius: 20, overflow: 'hidden' }}>
      <div style={{
        height: 150,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 100%)',
        backgroundSize: '200% 100%',
        animation: 'zbShimmer 1.6s ease-in-out infinite',
      }} />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ height: 14, width: '60%', borderRadius: 6, background: 'rgba(255,255,255,0.06)', animation: 'zbShimmer 1.6s ease-in-out infinite 0.1s' }} />
        <div style={{ height: 10, width: '40%', borderRadius: 6, background: 'rgba(255,255,255,0.04)', animation: 'zbShimmer 1.6s ease-in-out infinite 0.2s' }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <div style={{ height: 22, width: 64, borderRadius: 99, background: 'rgba(255,255,255,0.04)', animation: 'zbShimmer 1.6s ease-in-out infinite 0.3s' }} />
          <div style={{ height: 22, width: 80, borderRadius: 99, background: 'rgba(255,255,255,0.04)', animation: 'zbShimmer 1.6s ease-in-out infinite 0.35s' }} />
        </div>
      </div>
      <style>{`@keyframes zbShimmer { 0%,100%{background-position:200% 0} 50%{background-position:0% 0} }`}</style>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Build query from URL search — passed as a stable primitive to the hook
  const q = searchParams.get('q') || '';

  // Data hooks
  const {
    restaurants,
    filtered,
    loading,
    error,
    activeCuisine,
    filterByCuisine,
  } = useRestaurants(q);

  const { orders: pastOrders } = useOrderHistory();

  return (
    <div style={{ paddingTop: 68, minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Greeting ──────────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: 'clamp(32px,5vw,60px) clamp(16px,4vw,60px) 0', maxWidth: 1400, margin: '0 auto', overflow: 'visible' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: 500, height: 300, background: 'radial-gradient(ellipse,rgba(255,87,34,0.12),transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 8 }}>
            {getGreeting()}, <span className="grad-text">{user?.name?.split(' ')[0] || 'there'}</span> 👋
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-sub)', fontWeight: 300, marginBottom: 20 }}>What are you craving tonight?</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 18px', borderRadius: 99, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(12px)', fontSize: '0.82rem', color: 'var(--text-sub)', marginBottom: 32 }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth={2.5}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx={12} cy={10} r={3}/></svg>
            Jaipur
            <span style={{ color: 'var(--text-muted)' }}>·</span>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth={2.5}><circle cx={12} cy={12} r={10}/><polyline points="12 6 12 12 16 14"/></svg>
            25–35 min delivery
          </div>
        </div>

        {/* ── Cuisine pills ──────────────────────────────── */}
        <div style={{ overflowX: 'auto', paddingBottom: 4, marginBottom: 0 }} className="no-scrollbar">
          <div style={{ display: 'flex', gap: 10, width: 'max-content' }}>
            {CUISINES.map((c) => (
              <button
                key={c.value}
                className={`cuisine-pill${activeCuisine === c.value ? ' active' : ''}`}
                onClick={() => filterByCuisine(c.value)}
              >
                <span>{c.emoji}</span>{c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reels ─────────────────────────────────────────────── */}
      <ReelSection
        restaurants={restaurants}
        colors={COLORS}
        emojis={EMOJIS}
        onOrder={(id) => navigate(`/restaurant/${id}`)}
      />

      {/* ── Featured Restaurants ──────────────────────────────── */}
      <section style={{ maxWidth: 1400, margin: '0 auto', padding: 'clamp(40px,6vw,72px) clamp(16px,4vw,60px) 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem,2.5vw,1.7rem)', fontWeight: 700, letterSpacing: '-0.02em' }}>Featured Restaurants</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 3 }}>Handpicked for your area</p>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '2rem', marginBottom: 12 }}>⚠️</p>
            <p style={{ fontSize: '0.9rem' }}>{error}</p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && !error && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: 16 }}>
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Restaurant cards */}
        {!loading && !error && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: 16 }}>
            {filtered.length > 0 ? filtered.map((r, i) => (
              <motion.div
                key={r._id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className="glass-card"
                onClick={() => navigate(`/restaurant/${r._id}`)}
                style={{ borderRadius: 20, overflow: 'hidden', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,87,34,0.25)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(255,87,34,0.15), 0 20px 60px rgba(0,0,0,0.5)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Hero */}
                <div style={{ height: 150, position: 'relative', background: `radial-gradient(ellipse 80% 70% at 50% 40%, ${COLORS[i % COLORS.length][0]}, ${COLORS[i % COLORS.length][1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {r.heroImage
                    ? <img src={r.heroImage} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
                    : <span style={{ fontSize: '3.5rem', filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.4))' }}>{EMOJIS[i % EMOJIS.length]}</span>
                  }
                  {r.isSponsored && (
                    <span style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '3px 9px', fontSize: '0.62rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sponsored</span>
                  )}
                </div>
                {/* Body */}
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>{r.name}</h3>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 600, color: '#FFD600' }}>★ {r.rating}</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 10 }}>{r.cuisine.join(' · ')}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[`⏱ ${r.deliveryTime}`, `💰 Min ₹${r.minOrder}`].map((chip) => (
                      <span key={chip} style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 99, fontSize: '0.68rem', color: 'var(--text-sub)' }}>{chip}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '2rem', marginBottom: 12 }}>🍽️</p>
                <p>No restaurants found for this cuisine.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Order Again ───────────────────────────────────────── */}
      {pastOrders.length > 0 && (
        <section style={{ maxWidth: 1400, margin: '0 auto', padding: 'clamp(40px,6vw,72px) clamp(16px,4vw,60px)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem,2.5vw,1.7rem)', fontWeight: 700, marginBottom: 24 }}>🔄 Order Again</h2>
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }} className="no-scrollbar">
            {pastOrders.slice(0, 8).map((order) => (
              <div key={order._id} className="glass-card" style={{ minWidth: 280, padding: '16px 20px', flexShrink: 0 }}>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{order.restaurantName}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>{order.items.slice(0, 2).map((i) => i.name).join(', ')}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--orange)', fontWeight: 700 }}>₹{order.totalAmount}</span>
                  <button className="btn-ghost" onClick={() => navigate(`/restaurant/${order.restaurantId}`)} style={{ padding: '7px 16px', fontSize: '0.78rem' }}>Reorder</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
