import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(location.state?.from?.pathname || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="wrap">
      <div className="auth-wrap">
        <h2>Welcome Back</h2>
        <p className="auth-sub">Log in to your Muthoy Bazar account</p>
        <form onSubmit={handleSubmit}>
          <div className="field"><label>Email address</label><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="field"><label>Password</label><input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>{submitting ? 'Logging in...' : 'Log In'}</button>
        </form>
        <p className="auth-switch">Don't have an account? <Link to="/register">Register</Link></p>
        <p className="auth-switch" style={{ fontSize: '.78rem' }}>Demo: demo@muthoybazar.com / Demo@12345<br />Admin: admin@muthoybazar.com / Admin@12345</p>
      </div>
    </div>
  );
}
