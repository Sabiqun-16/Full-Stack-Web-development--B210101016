import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <>
      <div className="page-head">
        <div className="wrap">
          <h1>Admin Dashboard</h1>
          <div className="crumbs"><Link to="/">Home</Link> / <span>Admin</span></div>
        </div>
      </div>
      <div className="wrap">
        <div className="dash-layout">
          <nav className="dash-nav">
            <NavLink to="/admin" end>Dashboard</NavLink>
            <NavLink to="/admin/products">Products</NavLink>
            <NavLink to="/admin/categories">Categories</NavLink>
            <NavLink to="/admin/orders">Orders</NavLink>
            <NavLink to="/admin/users">Users</NavLink>
          </nav>
          <div><Outlet /></div>
        </div>
      </div>
    </>
  );
}
