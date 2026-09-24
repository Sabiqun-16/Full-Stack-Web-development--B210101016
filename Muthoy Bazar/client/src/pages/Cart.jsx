import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { resolveImageUrl } from '../utils/image';

export default function Cart() {
  const { cart, summary, updateQuantity, removeItem, applyCoupon, loading } = useCart();
  const [coupon, setCoupon] = useState('');
  const { showToast } = useToast();
  const items = cart.items || [];

  const handleCoupon = async (e) => {
    e.preventDefault();
    try {
      await applyCoupon(coupon);
      showToast('Coupon applied!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid coupon code');
    }
  };

  return (
    <>
      <div className="page-head">
        <div className="wrap">
          <h1>Your Cart</h1>
          <div className="crumbs"><Link to="/">Home</Link> / <span>Cart</span></div>
        </div>
      </div>
      <div className="wrap">
        {loading ? (
          <div className="spinner" />
        ) : items.length === 0 ? (
          <div className="empty-state" style={{ padding: '90px 20px' }}>
            <p style={{ marginBottom: 20 }}>Your cart is empty. Start adding your daily essentials!</p>
            <Link to="/shop" className="btn btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div>
              {items.map((item) => {
                const p = item.product;
                if (!p) return null;
                return (
                  <div key={p._id} className="cart-item">
                    <div className="ci-img"><img src={resolveImageUrl(p.images?.[0])} alt={p.name} /></div>
                    <div className="ci-name">
                      <b>{p.name}</b>
                      <button onClick={() => removeItem(p._id)}>Remove</button>
                    </div>
                    <div className="ci-qty">
                      <div className="qty-control">
                        <button onClick={() => updateQuantity(p._id, item.quantity - 1)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(p._id, item.quantity + 1)}>+</button>
                      </div>
                    </div>
                    <div className="ci-price">৳{item.priceAtAdd * item.quantity}</div>
                  </div>
                );
              })}
            </div>
            <div className="summary-card">
              <h3>Order Summary</h3>
              <div className="summary-row"><span>Subtotal</span><span>৳{summary.itemsPrice}</span></div>
              {summary.discountAmount > 0 && (
                <div className="summary-row"><span>Coupon discount</span><span>-৳{summary.discountAmount}</span></div>
              )}
              <div className="summary-row"><span>Delivery</span><span>{summary.deliveryPrice === 0 ? 'Free' : `৳${summary.deliveryPrice}`}</span></div>
              <div className="summary-row total"><span>Total</span><span>৳{summary.totalPrice}</span></div>

              <form className="coupon-row" onSubmit={handleCoupon}>
                <input type="text" placeholder="Coupon code (try WELCOME10)" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
                <button className="btn btn-ghost btn-sm" type="submit">Apply</button>
              </form>

              <Link to="/checkout" className="btn btn-primary btn-block">Proceed to Checkout</Link>
              {summary.itemsPrice < 1000 ? (
                <div className="promo-note">🛍️ Add ৳{1000 - summary.itemsPrice} more for free delivery</div>
              ) : (
                <div className="promo-note">✅ You've unlocked free delivery!</div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
