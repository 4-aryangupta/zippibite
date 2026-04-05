import { useRef } from 'react';
import { motion } from 'framer-motion';

export default function ReelSection({ restaurants, colors, emojis, onOrder }) {
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = 'grabbing';
  };
  const onMouseUp = () => { isDragging.current = false; scrollRef.current.style.cursor = 'grab'; };
  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    scrollRef.current.scrollLeft = scrollLeft.current - (x - startX.current) * 1.4;
  };

  const GRADIENT_ANIMS = ['reelG1','reelG2','reelG3','reelG4','reelG5','reelG6','reelG7'];

  return (
    <section style={{ maxWidth: 1400, margin: '0 auto', padding: 'clamp(40px,6vw,72px) clamp(16px,4vw,60px) 0' }}>
      <style>{`
        @keyframes reelGrad {
          0%,100% { transform: scale(1) translateY(0); filter: brightness(0.9) saturate(1.2); }
          50% { transform: scale(1.08) translateY(-3%); filter: brightness(1.1) saturate(1.5); }
        }
        @keyframes foodFloat {
          0%,100% { transform: translate(-50%,-60%) scale(1) rotate(-3deg); }
          50% { transform: translate(-50%,-63%) scale(1.05) rotate(3deg); }
        }
        @keyframes likePopKf {
          0% { transform: scale(1); }
          40% { transform: scale(1.35); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        @keyframes btnGlowKf {
          0%,100% { box-shadow: 0 0 8px rgba(255,87,34,0.3); }
          50% { box-shadow: 0 0 18px rgba(255,87,34,0.6); }
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1.8rem' }}>🎬</span>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem,2.5vw,1.7rem)', fontWeight: 700 }}>Trending Reels</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 3 }}>Live food moments from your city</p>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="no-scrollbar"
        onMouseDown={onMouseDown} onMouseUp={onMouseUp} onMouseLeave={onMouseUp} onMouseMove={onMouseMove}
        style={{ display: 'flex', gap: 16, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: 24, cursor: 'grab', userSelect: 'none' }}
      >
        {restaurants.map((r, i) => (
          <ReelCard key={r._id} restaurant={r} color={colors[i % colors.length]} emoji={emojis[i % emojis.length]} onOrder={() => onOrder(r._id)} />
        ))}
      </div>
    </section>
  );
}

function ReelCard({ restaurant, color, emoji, onOrder }) {
  return (
    <div className="reel-card" style={{ flexShrink: 0 }}>
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {restaurant.reelVideoUrl ? (
          <video src={restaurant.reelVideoUrl} autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 80% 60% at 50% 30%, ${color[0]}, ${color[0]}aa 40%, ${color[1]} 100%)`, animation: 'reelGrad 4s ease-in-out infinite alternate' }}>
            <span style={{ position: 'absolute', top: '50%', left: '50%', fontSize: '4rem', animation: 'foodFloat 3s ease-in-out infinite', filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.4))', zIndex: 2 }}>{emoji}</span>
          </div>
        )}
      </div>

      {/* Like button */}
      <button
        onClick={(e) => { e.stopPropagation(); e.currentTarget.classList.toggle('liked'); }}
        style={{ position: 'absolute', top: 12, right: 12, zIndex: 20, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.12)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>

      {/* Bottom overlay */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '50px 14px 14px', background: 'linear-gradient(to top,rgba(0,0,0,0.92),rgba(0,0,0,0.6) 50%,transparent)', zIndex: 10 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,214,0,0.2)', borderRadius: 99, padding: '4px 9px', fontSize: '0.72rem', fontWeight: 600, color: '#FFD600', marginBottom: 6 }}>
          ★ {restaurant.rating}
        </span>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', fontWeight: 700, color: '#fff', marginBottom: 2 }}>{restaurant.name}</p>
        <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.55)', marginBottom: 8 }}>{restaurant.cuisine.slice(0,2).join(' · ')}</p>
        <button
          onClick={onOrder}
          className="btn-primary"
          style={{ width: '100%', padding: '9px 12px', fontSize: '0.75rem', borderRadius: 10, animation: 'btnGlowKf 2.5s ease-in-out infinite' }}
        >
          Order Now
        </button>
      </div>
    </div>
  );
}
