import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/Checkout.css';

const Checkout = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('paystack');

  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Pre-fill shipping data with user info
  React.useEffect(() => {
    if (user) {
      setShippingData(prev => ({
        ...prev,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zipCode: user.zip_code || '',
        country: user.country || ''
      }));
    }
  }, [user]);

  if (!user) {
    navigate('/login', { state: { from: '/checkout' } });
    return null;
  }

  if (!cart || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Create order first
      const orderResponse = await api.post('/orders', {
        shippingAddress: shippingData,
        paymentMethod
      });

      const order = orderResponse.data.order;

      // Initialize Paystack payment
      const paymentResponse = await api.post('/orders/initialize-payment', {
        orderId: order.id,
        email: shippingData.email,
        amount: order.total_amount * 1.1 // Include tax
      });

      // Redirect to Paystack
      window.location.href = paymentResponse.data.authorization_url;

    } catch (error) {
      console.error('Checkout error:', error);
      setError(error.response?.data?.error || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tax = cart.total * 0.1;
  const total = cart.total + tax;

  return (
    <div className="checkout-page">
      <div className="container">
        <div 
          className="checkout-header"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <h1 className="page-title">Checkout</h1>
          <div className="checkout-steps">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <span>Shipping</span>
            </div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <span>Payment</span>
            </div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <span>Confirmation</span>
            </div>
          </div>
        </div>

        <div className="checkout-layout">
          <div className="checkout-form">
            {step === 1 && (
              <form 
                onSubmit={handleShippingSubmit} 
                className="shipping-form"
                data-aos="fade-right"
                data-aos-delay="300"
              >
                <h2 className="form-title">Shipping Information</h2>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      value={shippingData.firstName}
                      onChange={(e) => setShippingData(prev => ({
                        ...prev,
                        firstName: e.target.value
                      }))}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      value={shippingData.lastName}
                      onChange={(e) => setShippingData(prev => ({
                        ...prev,
                        lastName: e.target.value
                      }))}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={shippingData.email}
                      onChange={(e) => setShippingData(prev => ({
                        ...prev,
                        email: e.target.value
                      }))}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      value={shippingData.phone}
                      onChange={(e) => setShippingData(prev => ({
                        ...prev,
                        phone: e.target.value
                      }))}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    value={shippingData.address}
                    onChange={(e) => setShippingData(prev => ({
                      ...prev,
                      address: e.target.value
                    }))}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      value={shippingData.city}
                      onChange={(e) => setShippingData(prev => ({
                        ...prev,
                        city: e.target.value
                      }))}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      value={shippingData.state}
                      onChange={(e) => setShippingData(prev => ({
                        ...prev,
                        state: e.target.value
                      }))}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">ZIP Code</label>
                    <input
                      type="text"
                      value={shippingData.zipCode}
                      onChange={(e) => setShippingData(prev => ({
                        ...prev,
                        zipCode: e.target.value
                      }))}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input
                      type="text"
                      value={shippingData.country}
                      onChange={(e) => setShippingData(prev => ({
                        ...prev,
                        country: e.target.value
                      }))}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full">
                  Continue to Payment
                </button>
              </form>
            )}

            {step === 2 && (
              <div 
                className="payment-form"
                data-aos="fade-right"
                data-aos-delay="300"
              >
                <h2 className="form-title">Payment Method</h2>
                
                {error && (
                  <div className="alert alert-error">
                    <i className="fas fa-exclamation-circle"></i>
                    {error}
                  </div>
                )}

                <div className="payment-methods">
                  <label className="payment-method">
                    <input
                      type="radio"
                      name="payment"
                      value="paystack"
                      checked={paymentMethod === 'paystack'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-method-content">
                      <div className="payment-method-icon">
                        <i className="fas fa-credit-card"></i>
                      </div>
                      <div className="payment-method-info">
                        <h4>Pay with Paystack</h4>
                        <p>Secure payment with card, bank transfer, or USSD</p>
                      </div>
                    </div>
                  </label>
                </div>

                <button 
                  onClick={handlePayment}
                  disabled={loading}
                  className="btn btn-primary w-full payment-btn"
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Processing...
                    </>
                  ) : (
                    `Pay $${total.toFixed(2)}`
                  )}
                </button>

                <button 
                  onClick={() => setStep(1)}
                  className="btn btn-outline w-full"
                >
                  Back to Shipping
                </button>
              </div>
            )}
          </div>

          <div 
            className="checkout-summary"
            data-aos="fade-left"
            data-aos-delay="400"
          >
            <div className="summary-card">
              <h3 className="summary-title">Order Summary</h3>
              
              <div className="order-items">
                {cart.items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="order-item"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <div className="item-image">
                      <img 
                        src={Array.isArray(item.images) ? item.images[0] : item.images} 
                        alt={item.name} 
                      />
                      <span className="item-quantity">{item.quantity}</span>
                    </div>
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <div className="item-variants">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </div>
                    </div>
                    <div className="item-price">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-totals">
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
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;