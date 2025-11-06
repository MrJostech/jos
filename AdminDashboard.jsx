import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import '../../styles/Admin.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1 className="admin-title">Dashboard</h1>
        <p className="admin-subtitle">Welcome to Halcyon Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div 
          className="stat-card"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <div className="stat-icon revenue">
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="stat-info">
            <h3>Total Revenue</h3>
            <p className="stat-number">${stats?.totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div 
          className="stat-card"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          <div className="stat-icon orders">
            <i className="fas fa-shopping-bag"></i>
          </div>
          <div className="stat-info">
            <h3>Total Orders</h3>
            <p className="stat-number">{stats?.totalOrders}</p>
          </div>
        </div>

        <div 
          className="stat-card"
          data-aos="fade-up"
          data-aos-delay="400"
        >
          <div className="stat-icon products">
            <i className="fas fa-tshirt"></i>
          </div>
          <div className="stat-info">
            <h3>Total Products</h3>
            <p className="stat-number">{stats?.totalProducts}</p>
          </div>
        </div>

        <div 
          className="stat-card"
          data-aos="fade-up"
          data-aos-delay="500"
        >
          <div className="stat-icon users">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <p className="stat-number">{stats?.totalUsers}</p>
          </div>
        </div>
      </div>

      {/* Recent Orders and Popular Products */}
      <div className="dashboard-content">
        <div 
          className="recent-orders"
          data-aos="fade-right"
          data-aos-delay="600"
        >
          <div className="section-header">
            <h2>Recent Orders</h2>
            <Link to="/admin/orders" className="view-all">
              View All <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
          <div className="orders-list">
            {stats?.recentOrders.map(order => (
              <div key={order.id} className="order-item">
                <div className="order-info">
                  <h4>Order #{order.order_number}</h4>
                  <p>{order.first_name} {order.last_name}</p>
                  <span className={`status-badge status-${order.status}`}>
                    {order.status}
                  </span>
                </div>
                <div className="order-amount">
                  ${order.total_amount}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div 
          className="popular-products"
          data-aos="fade-left"
          data-aos-delay="600"
        >
          <div className="section-header">
            <h2>Popular Products</h2>
            <Link to="/admin/products" className="view-all">
              View All <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
          <div className="products-list">
            {stats?.popularProducts.map(product => (
              <div key={product.id} className="product-item">
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p>${product.price}</p>
                </div>
                <div className="product-sales">
                  <span className="sales-count">{product.sales_count} sales</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;