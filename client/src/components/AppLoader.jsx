/**
 * AppLoader
 * Full-screen branded loading screen shown during:
 * - Initial auth check (getMe) at app boot
 * - PrivateRoute / AdminRoute loading state
 *
 * Preserves the ZippBite dark aesthetic with an orange pulse animation.
 * No layout changes — this replaces an invisible void, not any UI element.
 */
export default function AppLoader({ label = 'Loading…' }) {
  return (
    <div style={S.wrap} aria-label="Loading" role="status">
      {/* Ambient glow */}
      <div style={S.glow} />

      {/* Logo mark */}
      <svg style={S.logo} viewBox="0 0 200 48" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="alGrad" x1="0" y1="0" x2="200" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#FF5722" />
            <stop offset="100%" stopColor="#FFD600" />
          </linearGradient>
        </defs>
        <path
          d="M1,3 L25,3 L25,11 L19,22 L23,22 L23,26 L9,26 L3,37 L27,37 L27,45 L1,45 L1,37 L15,26 L11,26 L11,22 L17,22 Z"
          fill="url(#alGrad)"
        />
        <text x="31" y="40" fontFamily="'Clash Display',sans-serif" fontWeight="700" fontSize="34" fill="url(#alGrad)">ipp</text>
        <text x="99" y="41" fontFamily="'Clash Display',sans-serif" fontWeight="700" fontSize="38" fill="url(#alGrad)">Bite</text>
      </svg>

      {/* Pulse rings */}
      <div style={S.ringOuter} />
      <div style={S.ringInner} />

      {/* Label */}
      <p style={S.label}>{label}</p>

      {/* Keyframe styles injected once */}
      <style>{KEYFRAMES}</style>
    </div>
  );
}

const S = {
  wrap: {
    position: 'fixed',
    inset: 0,
    zIndex: 8000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    background: 'var(--bg)',
  },
  glow: {
    position: 'absolute',
    width: 400,
    height: 300,
    borderRadius: '50%',
    background: 'radial-gradient(ellipse, rgba(255,87,34,0.15), transparent 70%)',
    filter: 'blur(60px)',
    pointerEvents: 'none',
  },
  logo: {
    height: 36,
    width: 'auto',
    filter: 'drop-shadow(0 0 12px rgba(255,87,34,0.5))',
    position: 'relative',
    zIndex: 1,
  },
  ringOuter: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: '50%',
    border: '1.5px solid rgba(255,87,34,0.25)',
    animation: 'zbPulseOuter 1.8s ease-in-out infinite',
  },
  ringInner: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: '50%',
    border: '1.5px solid rgba(255,87,34,0.5)',
    animation: 'zbPulseInner 1.8s ease-in-out infinite 0.3s',
  },
  label: {
    position: 'relative',
    zIndex: 1,
    fontSize: '0.8rem',
    fontWeight: 500,
    color: 'var(--text-muted)',
    letterSpacing: '0.5px',
    fontFamily: 'var(--font-body)',
    marginTop: 52,  // sits below the rings which are position:absolute
  },
};

const KEYFRAMES = `
  @keyframes zbPulseOuter {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50%       { opacity: 1;   transform: scale(1.15); }
  }
  @keyframes zbPulseInner {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50%       { opacity: 1;   transform: scale(1.1); }
  }
`;
