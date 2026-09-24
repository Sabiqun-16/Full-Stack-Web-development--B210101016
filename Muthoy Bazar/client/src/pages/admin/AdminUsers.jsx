import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();

  const load = () => {
    setLoading(true);
    api.get('/admin/users').then((res) => setUsers(res.data.users)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const toggleActive = async (u) => {
    try {
      await api.put(`/admin/users/${u._id}`, { isActive: !u.isActive });
      showToast(`User ${u.isActive ? 'deactivated' : 'activated'}`);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update user');
    }
  };

  const changeRole = async (u, role) => {
    try {
      await api.put(`/admin/users/${u._id}`, { role });
      showToast('Role updated');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update role');
    }
  };

  const handleDelete = async (u) => {
    if (u._id === currentUser.id) { showToast("You can't delete your own account"); return; }
    if (!window.confirm(`Delete user ${u.name}?`)) return;
    try {
      await api.delete(`/admin/users/${u._id}`);
      showToast('User deleted');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete user');
    }
  };

  return (
    <div>
      <div className="admin-toolbar"><h3 style={{ fontSize: '1rem' }}>All Users</h3></div>
      {loading ? <div className="spinner" /> : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <select value={u.role} onChange={(e) => changeRole(u, e.target.value)} disabled={u._id === currentUser.id}>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td><span className={`badge ${u.isActive ? 'Delivered' : 'Cancelled'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="table-actions">
                    <button onClick={() => toggleActive(u)}>{u.isActive ? 'Deactivate' : 'Activate'}</button>
                    <button className="danger" onClick={() => handleDelete(u)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
