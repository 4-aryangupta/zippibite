import { useState, useEffect } from 'react';
import { adminGetUsers, adminUpdateUser } from '../../api/api';

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [updating, setUpdating] = useState(null);

  const fetchUsers = () => adminGetUsers().then(r => setUsers(r.data.data.users));
  useEffect(() => { fetchUsers(); }, []);

  const handleUpdate = async (id, changes) => {
    setUpdating(id);
    await adminUpdateUser(id, changes);
    await fetchUsers();
    setUpdating(null);
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 700, marginBottom: 28 }}>Users ({users.length})</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {users.map(u => (
          <div key={u._id} className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', opacity: u.isActive ? 1 : 0.4 }}>
            {/* Avatar */}
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: u.role === 'admin' ? 'linear-gradient(135deg,var(--orange),var(--gold))' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
              {u.name[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.name}</p>
                {u.role === 'admin' && <span style={{ fontSize: '0.62rem', background: 'rgba(255,87,34,0.1)', color: 'var(--orange)', border: '1px solid rgba(255,87,34,0.25)', borderRadius: 4, padding: '2px 7px', fontWeight: 700 }}>ADMIN</span>}
                {!u.isActive && <span style={{ fontSize: '0.62rem', background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 4, padding: '2px 7px', fontWeight: 700 }}>DEACTIVATED</span>}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email} {u.phone ? `· ${u.phone}` : ''}</p>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {u.role !== 'admin' && (
                <button onClick={() => handleUpdate(u._id, { role: 'admin' })} disabled={updating === u._id}
                  className="btn-ghost" style={{ padding: '6px 12px', fontSize: '0.72rem' }}>
                  Make Admin
                </button>
              )}
              <button onClick={() => handleUpdate(u._id, { isActive: !u.isActive })} disabled={updating === u._id}
                style={{ padding: '6px 12px', fontSize: '0.72rem', background: u.isActive ? 'rgba(239,68,68,0.08)' : 'rgba(30,196,30,0.08)', border: `1px solid ${u.isActive ? 'rgba(239,68,68,0.25)' : 'rgba(30,196,30,0.25)'}`, borderRadius: 8, color: u.isActive ? '#EF4444' : '#1ec41e', cursor: 'pointer' }}>
                {updating === u._id ? '…' : u.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
