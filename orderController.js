const axios = require('axios');
const db = require('../config/database');

// Generate unique order number
const generateOrderNumber = () => {
  return `HAL${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

// Create order
exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    // Get user's cart
    const cartResult = await db.query(
      `SELECT ci.*, p.name, p.price, p.in_stock, p.stock_quantity 
       FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id 
       JOIN cart c ON ci.cart_id = c.id 
       WHERE c.user_id = $1`,
      [userId]
    );

    if (cartResult.rows.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Validate stock and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cartResult.rows) {
      if (!item.in_stock || item.stock_quantity < item.quantity) {
        return res.status(400).json({ 
          error: `Product "${item.name}" is out of stock or insufficient quantity` 
        });
      }
      
      const itemTotal = item.price * item.quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color
      });
    }

    // Create order
    const orderNumber = generateOrderNumber();
    const orderResult = await db.query(
      `INSERT INTO orders (user_id, order_number, total_amount, shipping_address, payment_method) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, orderNumber, totalAmount, shippingAddress, paymentMethod]
    );

    const order = orderResult.rows[0];

    // Create order items
    for (const item of orderItems) {
      await db.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price, size, color) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.product_id, item.quantity, item.price, item.size, item.color]
      );

      // Update product stock
      await db.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // Clear cart
    await db.query(
      'DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM cart WHERE user_id = $1)',
      [userId]
    );

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        ...order,
        items: orderItems
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Server error while creating order' });
  }
};

// Initialize Paystack payment
exports.initializePayment = async (req, res) => {
  try {
    const { orderId, email, amount } = req.body;
    
    // Verify order exists and belongs to user
    const orderResult = await db.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, req.user.id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Initialize Paystack payment
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: Math.round(amount * 100), // Convert to kobo
        reference: order.order_number,
        callback_url: `${process.env.FRONTEND_URL}/checkout/success`,
        metadata: {
          order_id: order.id,
          custom_fields: [
            {
              display_name: "Order Number",
              variable_name: "order_number",
              value: order.order_number
            }
          ]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Update order with Paystack reference
    await db.query(
      'UPDATE orders SET paystack_reference = $1 WHERE id = $2',
      [response.data.data.reference, order.id]
    );

    res.json({
      authorization_url: response.data.data.authorization_url,
      access_code: response.data.data.access_code,
      reference: response.data.data.reference
    });
  } catch (error) {
    console.error('Initialize payment error:', error);
    res.status(500).json({ error: 'Server error while initializing payment' });
  }
};

// Verify Paystack payment
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    // Verify payment with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    if (response.data.data.status === 'success') {
      // Update order status
      await db.query(
        'UPDATE orders SET payment_status = $1, status = $2 WHERE paystack_reference = $3',
        ['paid', 'confirmed', reference]
      );

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: response.data.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        data: response.data.data
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Server error while verifying payment' });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT o.*, 
       JSON_AGG(
         JSON_BUILD_OBJECT(
           'id', oi.id,
           'product_id', oi.product_id,
           'quantity', oi.quantity,
           'price', oi.price,
           'size', oi.size,
           'color', oi.color,
           'product_name', p.name,
           'product_slug', p.slug,
           'product_images', p.images
         )
       ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error while fetching orders' });
  }
};