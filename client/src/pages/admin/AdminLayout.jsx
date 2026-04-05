import { NavLink, Outlet } from 'react-router-dom';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/orders', label: 'Order Tickets', icon: '🎫' },
  { to: '/admin/restaurants', label: 'Restaurants', icon: '🏪' },
  { to: '/admin/menu', label: 'Menu Items', icon: '📋' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
];

export default function AdminLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', paddingTop: 68, background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: 'rgba(10,10,16,0.97)', borderRight: '1px solid var(--glass-border)', padding: '28px 14px', flexShrink: 0, position: 'sticky', top: 68, height: 'calc(100vh - 68px)' }}>
        <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: 3, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 16, paddingLeft: 8 }}>Admin Console</p>
        {LINKS.map(l => (
          <NavLink key={l.to} to={l.to} end={l.end || false}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px', borderRadius: 12, marginBottom: 4, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, color: isActive ? 'var(--orange)' : 'var(--text-sub)', background: isActive ? 'rgba(255,87,34,0.1)' : 'transparent', borderLeft: isActive ? '2px solid var(--orange)' : '2px solid transparent', transition: 'all 0.2s',
            })}>
            <span>{l.icon}</span>{l.label}
          </NavLink>
        ))}
      </aside>

      {/* Content */}
      <main style={{ flex: 1, overflow: 'auto', padding: 'clamp(20px,3vw,40px)' }}>
        <Outlet />
      </main>
    </div>
  );
}
