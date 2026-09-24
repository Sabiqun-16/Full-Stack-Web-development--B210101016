import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import api from '../api/api';
import { useToast } from '../context/ToastContext';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    api.get('/orders/my').then((res) => setOrders(res.data.orders)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCancel = async (id) => {
    try {
      await api.put(`/orders/${id}/cancel`);
      showToast('Order cancelled');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not cancel order');
    }
  };

  return (
    <>
      <div className="page-head">
        <div className="wrap">
          <h1>My Account</h1>
          <div className="crumbs"><Link to="/">Home</Link> / <span>My Orders</span></div>
        </div>
      </div>
      <div className="wrap">
        <div className="dash-layout">
          <nav className="dash-nav">
            <NavLink to="/profile" end>Profile</NavLink>
            <NavLink to="/profile/password">Change Password</NavLink>
            <NavLink to="/orders">My Orders</NavLink>
          </nav>
          <div>
            {loading ? (
              <div className="spinner" />
            ) : orders.length === 0 ? (
              <div className="empty-state">You haven't placed any orders yet. <Link to="/shop">Start shopping</Link>.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Order</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o._id}>
                        <td>#{o._id.slice(-8).toUpperCase()}</td>
                        <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td>{o.orderItems.length} item(s)</td>
                        <td>৳{o.totalPrice}</td>
                        <td><span className={`badge ${o.orderStatus}`}>{o.orderStatus}</span></td>
                        <td>
                          {['Pending', 'Processing'].includes(o.orderStatus) && (
                            <button className="table-actions" style={{ background: 'none' }} onClick={() => handleCancel(o._id)}>
                              <span style={{ color: '#B84B3C', fontSize: '.8rem', fontWeight: 600 }}>Cancel</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
