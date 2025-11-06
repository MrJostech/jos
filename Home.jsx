import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import '../styles/Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products?featured=true&limit=8'),
          api.get('/products/categories')
        ]);

        setFeaturedProducts(productsRes.data.products);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div 
              className="hero-text"
              data-aos="fade-right"
              data-aos-delay="200"
            >
              <h1 className="hero-title">
                Elevate Your Style with <span className="highlight">Halcyon</span>
              </h1>
              <p className="hero-description">
                Discover premium quality clothing that combines timeless elegance 
                with modern comfort. Experience the perfect blend of style and sustainability.
              </p>
              <div className="hero-actions">
                <Link to="/products" className="btn btn-primary btn-lg">
                  Shop Now
                </Link>
                <Link to="/about" className="btn btn-outline btn-lg">
                  Learn More
                </Link>
              </div>
            </div>
            <div 
              className="hero-image"
              data-aos="fade-left"
              data-aos-delay="400"
            >
              <img 
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="Halcyon Fashion" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <h2 
            className="section-title"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            Shop By Category
          </h2>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <Link 
                key={category.id} 
                to={`/products?category=${category.slug}`}
                className="category-card"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="category-image">
                  <img src={category.image_url} alt={category.name} />
                  <div className="category-overlay">
                    <h3 className="category-name">{category.name}</h3>
                    <p className="category-description">{category.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products">
        <div className="container">
          <div 
            className="section-header"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <h2 className="section-title">Featured Products</h2>
            <Link to="/products" className="view-all">
              View All <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
          <div className="products-grid">
            {featuredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="product-card"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <Link to={`/products/${product.slug}`} className="product-image">
                  <img 
                    src={Array.isArray(product.images) ? product.images[0] : product.images} 
                    alt={product.name} 
                  />
                  {product.compare_price && (
                    <span className="discount-badge">
                      -{Math.round((1 - product.price / product.compare_price) * 100)}%
                    </span>
                  )}
                </Link>
                <div className="product-info">
                  <h3 className="product-name">
                    <Link to={`/products/${product.slug}`}>{product.name}</Link>
                  </h3>
                  <p className="product-category">{product.category_name}</p>
                  <div className="product-price">
                    {product.compare_price ? (
                      <>
                        <span className="current-price">${product.price}</span>
                        <span className="original-price">${product.compare_price}</span>
                      </>
                    ) : (
                      <span className="current-price">${product.price}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div 
              className="feature"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="feature-icon">
                <i className="fas fa-shipping-fast"></i>
              </div>
              <h3>Free Shipping</h3>
              <p>Free shipping on all orders over $100</p>
            </div>
            <div 
              className="feature"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="feature-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>Secure Payment</h3>
              <p>Your payment information is safe with us</p>
            </div>
            <div 
              className="feature"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <div className="feature-icon">
                <i className="fas fa-undo-alt"></i>
              </div>
              <h3>Easy Returns</h3>
              <p>30-day return policy for all items</p>
            </div>
            <div 
              className="feature"
              data-aos="fade-up"
              data-aos-delay="500"
            >
              <div className="feature-icon">
                <i className="fas fa-headset"></i>
              </div>
              <h3>24/7 Support</h3>
              <p>We're here to help you anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2 
            className="section-title"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            What Our Customers Say
          </h2>
          <div className="testimonials-grid">
            <div 
              className="testimonial-card"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="testimonial-content">
                <div className="stars">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
                <p>"The quality of Halcyon clothing is exceptional. I've never felt more comfortable and stylish!"</p>
                <div className="customer">
                  <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Sarah Johnson" />
                  <div>
                    <h4>Sarah Johnson</h4>
                    <span>Fashion Blogger</span>
                  </div>
                </div>
              </div>
            </div>
            <div 
              className="testimonial-card"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="testimonial-content">
                <div className="stars">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star-half-alt"></i>
                </div>
                <p>"Fast shipping and amazing customer service. The clothes fit perfectly and the fabric feels premium."</p>
                <div className="customer">
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Michael Brown" />
                  <div>
                    <h4>Michael Brown</h4>
                    <span>Business Professional</span>
                  </div>
                </div>
              </div>
            </div>
            <div 
              className="testimonial-card"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <div className="testimonial-content">
                <div className="stars">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
                <p>"I love the sustainable approach Halcyon takes. Fashion that feels good and does good!"</p>
                <div className="customer">
                  <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Emily Chen" />
                  <div>
                    <h4>Emily Chen</h4>
                    <span>Environmental Activist</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;