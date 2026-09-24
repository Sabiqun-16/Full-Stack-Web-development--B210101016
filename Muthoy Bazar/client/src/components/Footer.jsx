import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import logo from '../assets/logo.png';

export default function Footer() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.categories.slice(0, 6))).catch(() => {});
  }, []);

  return (
    <footer>
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-about">
            <Link to="/" className="logo">
              <span className="logo-mark"><img src={logo} alt="Muthoy Bazar logo" /></span>
              <span className="logo-text">Muthoy Bazar</span>
            </Link>
            <p>Your neighbourhood grocery store, online. Everyday staples, spices, snacks and household essentials delivered to your door.</p>
            <div className="social-row">
              <a href="#" aria-label="Facebook"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v6h3v-6h2.5l.5-3H14V9Z" fill="currentColor"/></svg></a>
              <a href="https://wa.me/8801739205559" aria-label="WhatsApp"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17.5 14.4c-.7 0-1.4-.1-2-.4-.3-.1-.6 0-.8.2l-1 1.3c-2-1-3.6-2.6-4.7-4.6l1.3-1c.2-.2.3-.5.2-.8-.2-.7-.4-1.3-.4-2 0-.4-.3-.7-.7-.7H7c-.4 0-.7.3-.7.7 0 6 4.9 10.9 10.9 10.9.4 0 .7-.3.7-.7v-2.2c0-.4-.3-.7-.4-.7Z" fill="currentColor"/></svg></a>
              <a href="mailto:faysalimam42@gmail.com" aria-label="Email"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h17A1.5 1.5 0 0 1 22 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 18.5v-13Z" stroke="currentColor" strokeWidth="1.6"/><path d="m3 6 9 6 9-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
            </div>
          </div>
          <div>
            <h5>Quick Links</h5>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/shop">Shop</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h5>Categories</h5>
            <ul className="footer-links">
              {categories.map((c) => (
                <li key={c._id}><Link to={`/shop?category=${c._id}`}>{c.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h5>Contact Info</h5>
            <ul className="footer-contact">
              <li>WhatsApp: 01739-205559</li>
              <li>Mobile: +880 1612-633433</li>
              <li>Email: faysalimam42@gmail.com</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} Muthoy Bazar. All rights reserved.</span>
          <span>Built with the MERN stack.</span>
        </div>
      </div>
    </footer>
  );
}
