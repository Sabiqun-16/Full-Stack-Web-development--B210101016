import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import logo from '../assets/logo.png';
import { resolveImageUrl } from '../utils/image';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const boxRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); return; }
    const timeout = setTimeout(async () => {
      try {
        const res = await api.get('/products/suggestions', { params: { q: query } });
        setSuggestions(res.data.suggestions);
        setShowSuggestions(true);
      } catch { /* ignore */ }
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  const submitSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    navigate(`/shop?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="site-header">
      <div className="wrap navbar">
        <Link to="/" className="logo">
          <img src={logo} alt="Muthoy Bazar Logo" className="logo-img" />
          <span className="logo-text">Muthoy Bazar</span>
        </Link>

        <nav className={`main-nav${menuOpen ? ' open' : ''}`}>
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/shop" onClick={() => setMenuOpen(false)}>Shop</NavLink>
          <NavLink to="/contact" onClick={() => setMenuOpen(false)}>Contact</NavLink>
          {user ? (
            <>
              <NavLink to="/profile" onClick={() => setMenuOpen(false)}>My Account</NavLink>
              {isAdmin && <NavLink to="/admin" onClick={() => setMenuOpen(false)}>Admin</NavLink>}
              <button onClick={() => { logout(); setMenuOpen(false); navigate('/'); }} style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600 }}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setMenuOpen(false)}>Login</NavLink>
              <NavLink to="/register" onClick={() => setMenuOpen(false)}>Register</NavLink>
            </>
          )}
        </nav>

        <div className="nav-actions">
          <div className="search-box desktop-only" ref={boxRef} style={{ position: 'relative' }}>
            <form onSubmit={submitSearch} style={{ display: 'flex', flex: 1 }}>
              <input
                type="text"
                placeholder="Search rice, oil, spices..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query && setShowSuggestions(true)}
              />
            </form>
            {showSuggestions && suggestions.length > 0 && (
              <div className="suggest-dropdown">
                {suggestions.map((p) => (
                  <div key={p._id} className="suggest-item" onClick={() => { setShowSuggestions(false); navigate(`/product/${p._id}`); }} style={{ cursor: 'pointer' }}>
                    <img src={resolveImageUrl(p.images?.[0])} alt={p.name} />
                    <div>
                      <div style={{ fontSize: '.86rem', fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '.76rem', color: 'var(--gray-mid)' }}>{p.brand}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="icon-btn" onClick={() => navigate('/cart')} aria-label="Cart">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9.5" cy="20.5" r="1.4" fill="currentColor"/><circle cx="17.5" cy="20.5" r="1.4" fill="currentColor"/></svg>
            <span className="cart-count">{itemCount}</span>
          </button>
          <button className="icon-btn menu-toggle" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>
    </header>
  );
}
