import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="wrap">
      <div className="empty-state" style={{ padding: '100px 20px' }}>
        <h2 style={{ marginBottom: 10 }}>404 — Page Not Found</h2>
        <p style={{ marginBottom: 20 }}>The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    </div>
  );
}
