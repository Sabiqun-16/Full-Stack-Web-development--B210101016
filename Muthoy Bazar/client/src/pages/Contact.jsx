import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <div className="page-head">
        <div className="wrap">
          <h1>Contact Us</h1>
          <div className="crumbs"><Link to="/">Home</Link> / <span>Contact</span></div>
        </div>
      </div>
      <div className="wrap">
        <div className="form-layout">
          <div className="form-card">
            <h3>Send us a message</h3>
            {sent ? (
              <div className="success-box" style={{ padding: 20 }}>
                <div className="success-ic">✓</div>
                <h2 style={{ fontSize: '1.25rem' }}>Message received!</h2>
                <p>Thanks for reaching out — our team will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                <div className="form-grid">
                  <div className="field"><label>Full name</label><input required type="text" placeholder="Your name" /></div>
                  <div className="field"><label>Phone number</label><input required type="tel" placeholder="01XXX-XXXXXX" /></div>
                  <div className="field full"><label>Email address</label><input required type="email" placeholder="you@example.com" /></div>
                  <div className="field full"><label>Message</label><textarea required placeholder="How can we help?" /></div>
                </div>
                <button className="btn btn-primary btn-block" type="submit">Send Message</button>
              </form>
            )}
          </div>
          <div className="contact-info-card">
            <h3>Get in touch</h3>
            <ul>
              <li>WhatsApp: 01739-205559</li>
              <li>Mobile: +880 1612-633433</li>
              <li>Email: faysalimam42@gmail.com</li>
              <li>Location: 14/1, Abdul Latif Store, Shyambazar,Across Buriganga River, Dhaka, Bangladesh</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
