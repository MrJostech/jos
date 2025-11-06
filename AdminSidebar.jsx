import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/admin',
      icon: 'fas fa-tachometer-alt',
      label: 'Dashboard'
    },
    {
      path: '/admin/products',
      icon: 'fas fa-tshirt',
      label: 'Products'
    },
    {
      path: '/admin/orders',
      icon: 'fas fa-shopping-bag',
      label: 'Orders'
    },
    {
      path: '/admin/users',
      icon: 'fas fa-users',
      label: 'Users'
    }
  ];

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <Link to="/admin" className="sidebar-logo">
          <span className="logo-icon">🌿</span>
          Halcyon Admin
        </Link>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <i className={item.icon}></i>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;