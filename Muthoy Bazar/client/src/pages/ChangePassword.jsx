import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import api from '../api/api';

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      await api.put('/auth/change-password', form);
      setMsg('Password updated successfully.');
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update password.');
    }
  };

  return (
    <>
      <div className="page-head">
        <div className="wrap">
          <h1>My Account</h1>
          <div className="crumbs"><Link to="/">Home</Link> / <span>Change Password</span></div>
        </div>
      </div>
      <div className="wrap">
        <div className="dash-layout">
          <nav className="dash-nav">
            <NavLink to="/profile" end>Profile</NavLink>
            <NavLink to="/profile/password">Change Password</NavLink>
            <NavLink to="/orders">My Orders</NavLink>
          </nav>
          <div className="form-card">
            <h3>Change Password</h3>
            <form onSubmit={handleSubmit}>
              <div className="field"><label>Current password</label><input required type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} /></div>
              <div className="field"><label>New password</label><input required type="password" minLength={6} value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} /></div>
              {msg && <p style={{ color: 'var(--green-deep)', fontSize: '.85rem', marginTop: -6, marginBottom: 14 }}>{msg}</p>}
              {error && <p className="error-text">{error}</p>}
              <button className="btn btn-primary" type="submit">Update Password</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
