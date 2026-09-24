import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

export default function Profile() {
  const { user } = useAuth();
  return (
    <>
      <div className="page-head">
        <div className="wrap">
          <h1>My Account</h1>
          <div className="crumbs"><Link to="/">Home</Link> / <span>My Account</span></div>
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
            <ProfileForm user={user} />
          </div>
        </div>
      </div>
    </>
  );
}

function ProfileForm({ user }) {
  const { updateUserLocal } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const res = await api.put('/auth/profile', form);
      updateUserLocal(res.data.user);
      setMsg('Profile updated successfully.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Could not update profile.');
    }
  };

  return (
    <div className="form-card">
      <h3>Edit Profile</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field"><label>Full name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="field"><label>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="field full"><label>Email</label><input value={user?.email} disabled /></div>
        </div>
        {msg && <p style={{ color: 'var(--green-deep)', fontSize: '.85rem', marginTop: -6, marginBottom: 14 }}>{msg}</p>}
        <button className="btn btn-primary" type="submit">Save Changes</button>
      </form>
    </div>
  );
}
