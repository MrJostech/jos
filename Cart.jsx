import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../styles/Cart.css';

const Cart = () => {
  const { cart, updateCartItem, removeFromCart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="cart-empty">
        <div className="container">
          <div 
            className="empty-state"
            data-aos="fade-up"
            data-aos-duration="800"
          >
            <i className="fas fa-shopping-cart"></i>
            <h2>Please Sign In</h2>
            <p>You need to be signed in to view your cart</p>
            <Link to="/login" className="btn btn-primary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="container">
          <div 
            className="empty-state"
            data-aos="fade-up"
            data-aos-duration="800"
          >
            <i className="fas fa-shopping-cart"></i>
            <h2>Your Cart is Empty</h2>
            <p>Add some items to your cart to get started</p>
            <Link to="/products" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateCartItem(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId) => {
    await removeFromCart(itemId);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="cart-page">
      <div className="container">
        <div 
          className="cart-header"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <h1 className="page-title">Shopping Cart</h1>
          <p className="page-subtitle">{cart.itemCount} items in your cart</p>
        </div>

        <div className="cart-layout">
          <div className="cart-items">
            {cart.items.map((item, index) => (
              <div 
                key={item.id} 
                className="cart-item"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="item-image">
                  <img 
                    src={Array.isArray(item.images) ? item.images[0] : item.images} 
                    alt={item.name} 
                  />
                </div>

                <div className="item-details">
                  <h3 className="item-name">
                    <Link to={`/products/${item.slug}`}>{item.name}</Link>
                  </h3>
                  
                  <div className="item-variants">
                    {item.size && <span className="variant">Size: {item.size}</span>}
                    {item.color && <span className="variant">Color: {item.color}</span>}
                  </div>

                  <div className="item-price">${item.price}</div>
                </div>

                <div className="item-quantity">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity-display">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>

                <div className="item-total">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>

                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="remove-btn"
                  title="Remove item"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))}
          </div>

          <div 
            className="cart-summary"
            data-aos="fade-left"
            data-aos-delay="400"
          >
            <div className="summary-card">
              <h3 className="summary-title">Order Summary</h3>
              
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
              
              <div className="summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              
              <div className="summary-row">
                <span>Tax</span>
                <span>${(cart.total * 0.1).toFixed(2)}</span>
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="summary-row total">
                <span>Total</span>
                <span>${(cart.total * 1.1).toFixed(2)}</span>
              </div>

              <button 
                onClick={handleCheckout}
                className="btn btn-primary w-full checkout-btn"
              >
                Proceed to Checkout
              </button>

              <Link to="/products" className="continue-shopping">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;