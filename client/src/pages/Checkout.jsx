import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const { cart, summary, clearCartLocal, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const items = cart.items || [];

  const [form, setForm] = useState({ fullName: user?.name || '', phone: user?.phone || '', addressLine: '', city: '', postalCode: '' });
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [billing, setBilling] = useState({ fullName: '', phone: '', addressLine: '', city: '', postalCode: '' });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [error, setError] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        shippingAddress: form,
        billingAddress: sameAsShipping ? { ...form, sameAsShipping: true } : { ...billing, sameAsShipping: false },
        paymentMethod,
      };
      const res = await api.post('/orders', payload);
      setPlacedOrder(res.data.order);
      clearCartLocal();
      refreshCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="wrap">
        <div className="success-box">
          <div className="success-ic">✓</div>
          <h2>Order placed successfully!</h2>
          <p>Thank you for shopping with Muthoy Bazar. We'll contact you shortly to confirm delivery.</p>
          <div className="order-id">Order #{placedOrder._id.slice(-8).toUpperCase()}</div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
            <Link to="/orders" className="btn btn-outline">View My Orders</Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="wrap">
        <div className="empty-state" style={{ padding: '90px 20px' }}>
          <p style={{ marginBottom: 20 }}>Your cart is empty. Add products before checking out.</p>
          <Link to="/shop" className="btn btn-primary">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-head">
        <div className="wrap">
          <h1>Checkout</h1>
          <div className="crumbs"><Link to="/">Home</Link> / <Link to="/cart">Cart</Link> / <span>Checkout</span></div>
        </div>
      </div>
      <div className="wrap">
        <div className="form-layout">
          <div className="form-card">
            <h3>Delivery Details</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="field"><label>Full name</label><input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
                <div className="field"><label>Phone number</label><input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXX-XXXXXX" /></div>
                <div className="field full"><label>Delivery address</label><input required value={form.addressLine} onChange={(e) => setForm({ ...form, addressLine: e.target.value })} placeholder="House, road, area" /></div>
                <div className="field"><label>City</label><input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
                <div className="field"><label>Postal code</label><input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} /></div>
              </div>

              <div className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={sameAsShipping} onChange={(e) => setSameAsShipping(e.target.checked)} id="sameBilling" style={{ width: 'auto' }} />
                <label htmlFor="sameBilling" style={{ margin: 0 }}>Billing address same as shipping</label>
              </div>

              {!sameAsShipping && (
                <div className="form-grid">
                  <div className="field"><label>Billing full name</label><input required value={billing.fullName} onChange={(e) => setBilling({ ...billing, fullName: e.target.value })} /></div>
                  <div className="field"><label>Billing phone</label><input required value={billing.phone} onChange={(e) => setBilling({ ...billing, phone: e.target.value })} /></div>
                  <div className="field full"><label>Billing address</label><input required value={billing.addressLine} onChange={(e) => setBilling({ ...billing, addressLine: e.target.value })} /></div>
                  <div className="field"><label>Billing city</label><input required value={billing.city} onChange={(e) => setBilling({ ...billing, city: e.target.value })} /></div>
                  <div className="field"><label>Billing postal code</label><input value={billing.postalCode} onChange={(e) => setBilling({ ...billing, postalCode: e.target.value })} /></div>
                </div>
              )}

              <h3 style={{ margin: '6px 0 14px' }}>Payment Method</h3>
              <label className="pay-opt"><input type="radio" name="pay" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} /> Cash on Delivery</label>
              <label className="pay-opt"><input type="radio" name="pay" checked={paymentMethod === 'MOBILE_BANKING'} onChange={() => setPaymentMethod('MOBILE_BANKING')} /> Mobile Banking (bKash / Nagad) — pay on confirmation call</label>

              {error && <p className="error-text">{error}</p>}
              <button className="btn btn-primary btn-block" type="submit" disabled={submitting} style={{ marginTop: 10 }}>
                {submitting ? 'Placing order...' : `Place Order · ৳${summary.totalPrice}`}
              </button>
            </form>
          </div>

          <div className="summary-card" style={{ position: 'static' }}>
            <h3>Order Summary</h3>
            {items.map((item) => item.product && (
              <div key={item.product._id} className="summary-row"><span>{item.product.name} × {item.quantity}</span><span>৳{item.priceAtAdd * item.quantity}</span></div>
            ))}
            <div className="summary-row" style={{ borderTop: '1px dashed var(--gray-line)', paddingTop: 12, marginTop: 6 }}><span>Subtotal</span><span>৳{summary.itemsPrice}</span></div>
            <div className="summary-row"><span>Delivery</span><span>{summary.deliveryPrice === 0 ? 'Free' : `৳${summary.deliveryPrice}`}</span></div>
            <div className="summary-row total"><span>Total</span><span>৳{summary.totalPrice}</span></div>
          </div>
        </div>
      </div>
    </>
  );
}
