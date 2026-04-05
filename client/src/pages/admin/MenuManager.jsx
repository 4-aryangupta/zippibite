import { useState, useEffect } from 'react';
import { adminGetRestaurants, adminGetMenuItems, adminCreateMenuItem, adminUpdateMenuItem, adminDeleteMenuItem } from '../../api/api';

export default function MenuManager() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedR, setSelectedR] = useState('');
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', isVeg: true, isBestseller: false, image: '' });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { adminGetRestaurants().then(r => { setRestaurants(r.data.data.restaurants); }); }, []);
  useEffect(() => { if (selectedR) adminGetMenuItems(selectedR).then(r => setItems(r.data.data.items)); }, [selectedR]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), restaurantId: selectedR };
      if (editId) await adminUpdateMenuItem(editId, payload);
      else await adminCreateMenuItem(payload);
      const r = await adminGetMenuItems(selectedR);
      setItems(r.data.data.items);
      setShowForm(false); setEditId(null);
      setForm({ name: '', description: '', price: '', category: '', isVeg: true, isBestseller: false, image: '' });
    } finally { setSaving(false); }
  };

  const startEdit = (item) => {
    setEditId(item._id); setShowForm(true);
    setForm({ name: item.name, description: item.description, price: item.price, category: item.category, isVeg: item.isVeg, isBestseller: item.isBestseller, image: item.image || '' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    await adminDeleteMenuItem(id);
    setItems(items.filter(i => i._id !== id));
  };

  const handleToggleAvail = async (item) => {
    await adminUpdateMenuItem(item._id, { isAvailable: !item.isAvailable });
    const r = await adminGetMenuItems(selectedR);
    setItems(r.data.data.items);
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 700, marginBottom: 24 }}>Menu Manager</h1>

      {/* Restaurant picker */}
      <select value={selectedR} onChange={e => setSelectedR(e.target.value)}
        style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 10, color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', marginBottom: 24, minWidth: 240 }}>
        <option value="">— Select Restaurant —</option>
        {restaurants.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
      </select>

      {selectedR && (
        <>
          <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', description: '', price: '', category: '', isVeg: true, isBestseller: false, image: '' }); }}
            className="btn-primary" style={{ padding: '10px 22px', fontSize: '0.85rem', borderRadius: 10, marginBottom: 20 }}>
            + Add Item
          </button>

          {showForm && (
            <form onSubmit={handleSubmit} className="glass-card" style={{ padding: 24, marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[['name','Name'],['category','Category'],['price','Price (₹)'],['image','Image URL']].map(([k,label]) => (
                <div key={k} className="form-group"><input className="form-input" placeholder=" " value={form[k]} onChange={set(k)} type={k==='price'?'number':'text'} required={k!=='image'} /><label className="floating-label">{label}</label></div>
              ))}
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <input className="form-input" placeholder=" " value={form.description} onChange={set('description')} />
                <label className="floating-label">Description</label>
              </div>
              <div style={{ display: 'flex', gap: 20, gridColumn: '1/-1', alignItems: 'center' }}>
                {[['isVeg','🥦 Veg'],['isBestseller','⭐ Bestseller']].map(([k,label]) => (
                  <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                    <input type="checkbox" checked={form[k]} onChange={set(k)} style={{ accentColor: 'var(--orange)' }} /> {label}
                  </label>
                ))}
              </div>
              <button type="submit" className="btn-primary" disabled={saving} style={{ padding: '12px', borderRadius: 10, gridColumn: '1/-1', opacity: saving ? 0.7 : 1 }}>
                {saving ? '…' : editId ? 'Update Item' : 'Add Item'}
              </button>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map(item => (
              <div key={item._id} className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16, opacity: item.isAvailable ? 1 : 0.4 }}>
                <div className={`veg-badge ${item.isVeg ? 'veg' : 'nonveg'}`} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}{item.isBestseller && ' ⭐'}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.category} · ₹{item.price}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleToggleAvail(item)} className="btn-ghost" style={{ padding: '6px 12px', fontSize: '0.72rem' }}>{item.isAvailable ? 'Hide' : 'Show'}</button>
                  <button onClick={() => startEdit(item)} className="btn-ghost" style={{ padding: '6px 12px', fontSize: '0.72rem' }}>Edit</button>
                  <button onClick={() => handleDelete(item._id)} style={{ padding: '6px 12px', fontSize: '0.72rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#EF4444', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
