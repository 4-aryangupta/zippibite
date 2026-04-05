import { useState, useEffect } from 'react';
import { adminGetRestaurants, adminUpdateRestaurant, adminCreateRestaurant } from '../../api/api';
import { AnimatePresence, motion } from 'framer-motion';

export default function RestaurantManager() {
  const [restaurants, setRestaurants] = useState([]);
  const [editing, setEditing] = useState(null); // { restaurantId, field, value }
  const [saving, setSaving] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', description: '', cuisine: '', deliveryTime: '30-40 min', minOrder: 199, packagingCharge: 20 });

  const fetchAll = () => adminGetRestaurants().then(r => setRestaurants(r.data.data.restaurants));
  useEffect(() => { fetchAll(); }, []);

  const handleSave = async (id, field, value) => {
    setSaving(id);
    await adminUpdateRestaurant(id, { [field]: value });
    await fetchAll();
    setSaving(null);
    setEditing(null);
  };

  const handleToggle = async (r) => {
    await adminUpdateRestaurant(r._id, { isActive: !r.isActive });
    await fetchAll();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const payload = { ...newForm, cuisine: newForm.cuisine.split(',').map(c => c.trim()) };
    await adminCreateRestaurant(payload);
    await fetchAll();
    setShowCreate(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 700 }}>Restaurants</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary" style={{ padding: '10px 22px', fontSize: '0.85rem', borderRadius: 10 }}>+ New Restaurant</button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.form onSubmit={handleCreate} initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="glass-card" style={{ padding: 24, marginBottom: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[['name','Name'],['description','Description'],['cuisine','Cuisine (comma-separated)'],['deliveryTime','Delivery Time']].map(([k,label]) => (
              <div key={k} className="form-group" style={{ gridColumn: k === 'description' ? '1/-1' : 'auto' }}>
                <input className="form-input" placeholder=" " value={newForm[k]} onChange={e => setNewForm(f => ({ ...f, [k]: e.target.value }))} required={k !== 'description'} />
                <label className="floating-label">{label}</label>
              </div>
            ))}
            <button type="submit" className="btn-primary" style={{ padding: '12px', borderRadius: 10, gridColumn: '1/-1' }}>Create Restaurant</button>
          </motion.form>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {restaurants.map(r => (
          <div key={r._id} className="glass-card" style={{ padding: '18px 22px', opacity: r.isActive ? 1 : 0.5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>{r.name}</h3>
                  {r.isSponsored && <span style={{ fontSize: '0.62rem', background: 'rgba(255,87,34,0.1)', color: 'var(--orange)', border: '1px solid rgba(255,87,34,0.2)', borderRadius: 4, padding: '2px 8px', fontWeight: 600 }}>Sponsored</span>}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.cuisine.join(' · ')}</p>
              </div>
              {/* Toggle active */}
              <button onClick={() => handleToggle(r)} className="btn-ghost" style={{ padding: '6px 14px', fontSize: '0.75rem', color: r.isActive ? '#1ec41e' : 'var(--text-muted)' }}>
                {r.isActive ? '● Active' : '○ Hidden'}
              </button>
            </div>

            {/* Reel URL editor */}
            <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>🎬 Reel URL</span>
              {editing?.id === r._id ? (
                <>
                  <input value={editing.value} onChange={e => setEditing(ed => ({ ...ed, value: e.target.value }))}
                    style={{ flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,87,34,0.3)', borderRadius: 8, color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.8rem', outline: 'none' }} />
                  <button onClick={() => handleSave(r._id, 'reelVideoUrl', editing.value)} disabled={saving === r._id}
                    className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.78rem', borderRadius: 8, opacity: saving === r._id ? 0.6 : 1 }}>
                    {saving === r._id ? '…' : 'Save'}
                  </button>
                  <button onClick={() => setEditing(null)} className="btn-ghost" style={{ padding: '8px 12px', fontSize: '0.78rem' }}>✕</button>
                </>
              ) : (
                <button onClick={() => setEditing({ id: r._id, value: r.reelVideoUrl || '' })} className="btn-ghost" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>
                  {r.reelVideoUrl ? '✏️ Edit URL' : '+ Add URL'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
