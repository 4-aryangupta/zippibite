import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAddresses, saveAddress, createOrder } from '../api/api';
import { useCart, showToast } from '../context/AppContext';

const GST_RATE = 0.05;
const DELIVERY_FEE = 30;
const FREE_DELIVERY_ABOVE = 499;

export default function CheckoutPage() {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({ label: 'Home', fullAddress: '', city: '', pincode: '' });

  useEffect(() => {
    getAddresses().then(r => {
      const addrs = r.data.data.addresses;
      setAddresses(addrs);
      const def = addrs.find(a => a.isDefault) || addrs[0];
      if (def) setSelected(def);
    });
    refreshCart();
  }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    const r = await saveAddress({ ...form, isDefault: addresses.length === 0 });
    const addrs = r.data.data.addresses;
    setAddresses(addrs);
    setSelected(addrs[addrs.length - 1]);
    setShowAddForm(false);
    setForm({ label: 'Home', fullAddress: '', city: '', pincode: '' });
  };

  const handlePlaceOrder = async () => {
    if (!selected) return showToast('Please select a delivery address');
    setPlacing(true);
    try {
      const r = await createOrder({ deliveryAddress: selected });
      await refreshCart();
      navigate(`/order-success/${r.data.data.order._id}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Order failed');
    } finally { setPlacing(false); }
  };

  const subtotal = cart?.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;
  const gst = Math.round(subtotal * GST_RATE);
  const delivery = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  const total = subtotal + gst + delivery;

  return (
    <div style={{ paddingTop: 68, minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,4vw,32px)', display: 'grid', gridTemplateColumns: '1fr min(360px,100%)', gap: 32 }}>
        {/* Address */}
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, marginBottom: 24 }}>Delivery Address</h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {addresses.map(addr => (
              <div key={addr._id} onClick={() => setSelected(addr)}
                className="glass-card" style={{ padding: '16px 20px', cursor: 'pointer', border: selected?._id === addr._id ? '1px solid rgba(255,87,34,0.5)' : '1px solid var(--glass-border)', background: selected?._id === addr._id ? 'rgba(255,87,34,0.06)' : 'var(--glass-bg)', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--orange)', border: '1px solid rgba(255,87,34,0.3)', borderRadius: 4, padding: '2px 7px', textTransform: 'uppercase' }}>{addr.label}</span>
                    {addr.isDefault && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Default</span>}
                  </div>
                  <p style={{ fontSize: '0.88rem', fontWeight: 500, marginBottom: 2 }}>{addr.fullAddress}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{addr.city} — {addr.pincode}</p>
                </div>
                <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${selected?._id === addr._id ? 'var(--orange)' : 'rgba(255,255,255,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {selected?._id === addr._id && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--orange)' }} />}
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => setShowAddForm(!showAddForm)} className="btn-ghost" style={{ padding: '10px 20px', fontSize: '0.85rem', width: '100%', marginBottom: 20 }}>
            + Add New Address
          </button>

          <AnimatePresence>
            {showAddForm && (
              <motion.form onSubmit={handleSaveAddress} initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Label select */}
                <div style={{ display: 'flex', gap: 10 }}>
                  {['Home', 'Work', 'Other'].map(l => (
                    <button type="button" key={l} onClick={() => setForm(f => ({ ...f, label: l }))}
                      style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: `1px solid ${form.label === l ? 'rgba(255,87,34,0.5)' : 'var(--glass-border)'}`, background: form.label === l ? 'rgba(255,87,34,0.1)' : 'transparent', color: form.label === l ? 'var(--orange)' : 'var(--text-sub)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.83rem' }}>
                      {l}
                    </button>
                  ))}
                </div>
                <div className="form-group"><input className="form-input" placeholder=" " value={form.fullAddress} onChange={set('fullAddress')} required /><label className="floating-label">Full Address</label></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group"><input className="form-input" placeholder=" " value={form.city} onChange={set('city')} required /><label className="floating-label">City</label></div>
                  <div className="form-group"><input className="form-input" placeholder=" " value={form.pincode} onChange={set('pincode')} required /><label className="floating-label">Pincode</label></div>
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '12px', borderRadius: 12, fontSize: '0.9rem' }}>Save Address</button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div style={{ position: 'sticky', top: 84, height: 'fit-content' }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Order Summary</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>{cart?.restaurantName} — {cart?.items?.length} items</p>
            {[
              { label: 'Subtotal', val: `₹${subtotal}` },
              { label: 'GST (5%)', val: `₹${gst}` },
              { label: 'Delivery', val: delivery === 0 ? 'FREE' : `₹${delivery}` },
            ].map(({ label, val }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                <span>{label}</span><span style={{ color: val === 'FREE' ? '#1ec41e' : 'var(--text)', fontWeight: val === 'FREE' ? 600 : 400 }}>{val}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--glass-border)', margin: '14px 0', paddingTop: 14, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem' }}>
              <span>Total</span><span className="grad-text">₹{total}</span>
            </div>
            <button className="btn-primary" onClick={handlePlaceOrder} disabled={!selected || placing}
              style={{ width: '100%', padding: '14px', fontSize: '0.95rem', borderRadius: 12, opacity: !selected || placing ? 0.6 : 1 }}>
              {placing ? 'Placing Order…' : '🛍️ Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
