import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  // Check if user is admin (in real app, you'd check user role)
  const isAdmin = user && user.email === 'my@halcyon12.com';

  if (!isAdmin) {
    return (
      <div className="admin-error">
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          Access denied. Admin privileges required.
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <button 
        className="mobile-sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <i className="fas fa-bars"></i>
      </button>

      <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <AdminSidebar />
      </div>

      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;