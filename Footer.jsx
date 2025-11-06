import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div 
            className="footer-section"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <div className="logo">
              <span className="logo-icon">🌿</span>
              Halcyon
            </div>
            <p className="footer-description">
              Discover premium quality clothing that combines style, comfort, and sustainability. 
              Elevate your wardrobe with Halcyon.
            </p>
            <div className="social-links">
              <a href="#" className="social-link">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="social-link">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="social-link">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="social-link">
                <i className="fab fa-pinterest"></i>
              </a>
            </div>
          </div>

          <div 
            className="footer-section"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <h3 className="footer-title">Shop</h3>
            <ul className="footer-links">
              <li><Link to="/products/men">Men's Collection</Link></li>
              <li><Link to="/products/women">Women's Collection</Link></li>
              <li><Link to="/products/kids">Kids' Collection</Link></li>
              <li><Link to="/products?featured=true">Featured Products</Link></li>
            </ul>
          </div>

          <div 
            className="footer-section"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <h3 className="footer-title">Support</h3>
            <ul className="footer-links">
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/shipping">Shipping Info</Link></li>
              <li><Link to="/returns">Returns</Link></li>
              <li><Link to="/size-guide">Size Guide</Link></li>
            </ul>
          </div>

          <div 
            className="footer-section"
            data-aos="fade-up"
            data-aos-delay="500"
          >
            <h3 className="footer-title">Company</h3>
            <ul className="footer-links">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/sustainability">Sustainability</Link></li>
              <li><Link to="/press">Press</Link></li>
            </ul>
          </div>

          <div 
            className="footer-section"
            data-aos="fade-up"
            data-aos-delay="600"
          >
            <h3 className="footer-title">Newsletter</h3>
            <p className="footer-text">Subscribe to get updates on new arrivals and special offers.</p>
            <div className="newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="newsletter-input"
              />
              <button className="btn btn-primary newsletter-btn">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; {currentYear} Halcyon. All rights reserved.</p>
            <div className="footer-bottom-links">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/cookies">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;