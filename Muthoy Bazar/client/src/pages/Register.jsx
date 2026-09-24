import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setSubmitting(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="wrap">
      <div className="auth-wrap">
        <h2>Create Account</h2>
        <p className="auth-sub">Join Muthoy Bazar for faster checkout</p>
        <form onSubmit={handleSubmit}>
          <div className="field"><label>Full name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="field"><label>Email address</label><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="field"><label>Phone number</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXX-XXXXXX" /></div>
          <div className="field"><label>Password</label><input required type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>{submitting ? 'Creating account...' : 'Register'}</button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Log In</Link></p>
      </div>
    </div>
  );
}
