const db = require('../config/database');

// Get or create cart for user
const getOrCreateCart = async (userId) => {
  let result = await db.query('SELECT * FROM cart WHERE user_id = $1', [userId]);
  
  if (result.rows.length === 0) {
    result = await db.query('INSERT INTO cart (user_id) VALUES ($1) RETURNING *', [userId]);
  }
  
  return result.rows[0];
};

// Get cart items
exports.getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    
    const result = await db.query(
      `SELECT ci.*, p.name, p.price, p.images, p.slug, p.in_stock, p.stock_quantity 
       FROM cart_items ci 
       JOIN products p ON ci.product_id = p.id 
       WHERE ci.cart_id = $1`,
      [cart.id]
    );

    const items = result.rows;
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({
      cartId: cart.id,
      items,
      total: parseFloat(total.toFixed(2)),
      itemCount: items.reduce((count, item) => count + item.quantity, 0)
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Server error while fetching cart' });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;
    
    // Validate product exists and is in stock
    const productResult = await db.query(
      'SELECT * FROM products WHERE id = $1 AND in_stock = true',
      [productId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found or out of stock' });
    }

    const cart = await getOrCreateCart(req.user.id);

    // Check if item already exists in cart
    const existingItem = await db.query(
      'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2 AND size = $3 AND color = $4',
      [cart.id, productId, size, color]
    );

    let cartItem;
    if (existingItem.rows.length > 0) {
      // Update quantity
      const result = await db.query(
        'UPDATE cart_items SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [quantity, existingItem.rows[0].id]
      );
      cartItem = result.rows[0];
    } else {
      // Add new item
      const result = await db.query(
        `INSERT INTO cart_items (cart_id, product_id, quantity, size, color) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [cart.id, productId, quantity, size, color]
      );
      cartItem = result.rows[0];
    }

    res.json({
      message: 'Item added to cart',
      cartItem
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Server error while adding to cart' });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const result = await db.query(
      'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [quantity, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({
      message: 'Cart item updated',
      cartItem: result.rows[0]
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ error: 'Server error while updating cart item' });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query('DELETE FROM cart_items WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Server error while removing from cart' });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    await db.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);

    res.json({
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Server error while clearing cart' });
  }
};