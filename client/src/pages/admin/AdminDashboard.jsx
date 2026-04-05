import { useState, useEffect } from 'react';
import { adminGetStats } from '../../api/api';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => { adminGetStats().then(r => setStats(r.data.data)); }, []);

  if (!stats) return <p style={{ color: 'var(--text-muted)' }}>Loading stats…</p>;

  const statCards = [
    { label: 'Orders Today', value: stats.todayOrders, icon: '📦', color: '#FF5722' },
    { label: 'Revenue Today', value: `₹${stats.revenueToday.toLocaleString()}`, icon: '💰', color: '#FFD600' },
    { label: 'Active Orders', value: stats.activeOrders, icon: '🔥', color: '#EF4444' },
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#8B5CF6' },
    { label: 'Restaurants', value: stats.totalRestaurants, icon: '🏪', color: '#10B981' },
  ];

  const hourlyData = stats.ordersPerHour.map(d => ({ hour: `${d.hour}:00`, orders: d.count }));

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 700, marginBottom: 28 }}>Overview</h1>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16, marginBottom: 36 }}>
        {statCards.map(c => (
          <div key={c.label} className="glass-card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: '1.5rem' }}>{c.icon}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{c.label}</span>
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 700, color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="glass-card" style={{ padding: '24px 28px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Orders Per Hour Today</h2>
        {hourlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF5722" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF5722" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(10,10,16,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} />
              <Area type="monotone" dataKey="orders" stroke="#FF5722" fill="url(#gradOrders)" strokeWidth={2} dot={{ fill: '#FF5722', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No orders yet today.</p>}
      </div>
    </div>
  );
}
