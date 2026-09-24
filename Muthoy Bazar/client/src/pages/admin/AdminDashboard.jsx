import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then((res) => setStats(res.data.stats));
  }, []);

  if (!stats) return <div className="spinner" />;

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card"><b>{stats.userCount}</b><span>Registered Customers</span></div>
        <div className="stat-card"><b>{stats.productCount}</b><span>Products</span></div>
        <div className="stat-card"><b>{stats.orderCount}</b><span>Total Orders</span></div>
        <div className="stat-card"><b>৳{stats.totalRevenue}</b><span>Revenue (excl. cancelled)</span></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <h3 style={{ marginBottom: 14, fontSize: '1rem' }}>Recent Orders</h3>
          <table className="data-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {stats.recentOrders.map((o) => (
                <tr key={o._id}>
                  <td>#{o._id.slice(-8).toUpperCase()}</td>
                  <td>{o.user?.name}</td>
                  <td>৳{o.totalPrice}</td>
                  <td><span className={`badge ${o.orderStatus}`}>{o.orderStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link to="/admin/orders" className="btn btn-ghost btn-sm" style={{ marginTop: 14 }}>View all orders</Link>
        </div>
        <div>
          <h3 style={{ marginBottom: 14, fontSize: '1rem' }}>Low Stock Alerts</h3>
          <table className="data-table">
            <thead><tr><th>Product</th><th>SKU</th><th>Stock</th></tr></thead>
            <tbody>
              {stats.lowStock.length === 0 ? (
                <tr><td colSpan={3} style={{ color: 'var(--gray-mid)' }}>All products are well stocked.</td></tr>
              ) : stats.lowStock.map((p) => (
                <tr key={p._id}><td>{p.name}</td><td>{p.sku}</td><td>{p.stock}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
