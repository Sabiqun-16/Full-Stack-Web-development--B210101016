import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import { useToast } from '../../context/ToastContext';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    api.get('/admin/orders', { params: { status: statusFilter || undefined, page, limit: 15 } })
      .then((res) => { setOrders(res.data.orders); setPages(res.data.pages); })
      .finally(() => setLoading(false));
  };
  useEffect(load, [statusFilter, page]); // eslint-disable-line

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      showToast(`Order marked as ${status}`);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update order status');
    }
  };

  return (
    <div>
      <div className="admin-toolbar">
        <h3 style={{ fontSize: '1rem' }}>All Orders</h3>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? <div className="spinner" /> : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Update</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>#{o._id.slice(-8).toUpperCase()}</td>
                  <td>{o.user?.name}<br /><span style={{ color: 'var(--gray-mid)', fontSize: '.76rem' }}>{o.user?.email}</span></td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>৳{o.totalPrice}</td>
                  <td><span className={`badge ${o.orderStatus}`}>{o.orderStatus}</span></td>
                  <td>
                    <select value={o.orderStatus} onChange={(e) => updateStatus(o._id, e.target.value)}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="pagination">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
