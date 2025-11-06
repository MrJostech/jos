const db = require('../config/database');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalOrders,
      totalRevenue,
      totalProducts,
      totalUsers,
      recentOrders,
      popularProducts
    ] = await Promise.all([
      // Total orders
      db.query('SELECT COUNT(*) FROM orders'),
      // Total revenue
      db.query('SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = $1', ['paid']),
      // Total products
      db.query('SELECT COUNT(*) FROM products'),
      // Total users
      db.query('SELECT COUNT(*) FROM users'),
      // Recent orders (last 5)
      db.query(
        `SELECT o.*, u.first_name, u.last_name, u.email 
         FROM orders o 
         JOIN users u ON o.user_id = u.id 
         ORDER BY o.created_at DESC 
         LIMIT 5`
      ),
      // Popular products (top 5)
      db.query(
        `SELECT p.id, p.name, p.price, COUNT(oi.id) as sales_count
         FROM products p
         LEFT JOIN order_items oi ON p.id = oi.product_id
         GROUP BY p.id, p.name, p.price
         ORDER BY sales_count DESC
         LIMIT 5`
      )
    ]);

    const stats = {
      totalOrders: parseInt(totalOrders.rows[0].count),
      totalRevenue: parseFloat(totalRevenue.rows[0].coalesce),
      totalProducts: parseInt(totalProducts.rows[0].count),
      totalUsers: parseInt(totalUsers.rows[0].count),
      recentOrders: recentOrders.rows,
      popularProducts: popularProducts.rows
    };

    res.json(stats);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Server error while fetching dashboard stats' });
  }
};

// Get all products with advanced filtering
exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, sort = 'created_at', order = 'desc' } = req.query;
    
    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (category) {
      paramCount++;
      query += ` AND c.slug = $${paramCount}`;
      params.push(category);
    }

    // Validate sort column to prevent SQL injection
    const validSortColumns = ['name', 'price', 'created_at', 'stock_quantity'];
    const sortColumn = validSortColumns.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Add sorting
    query += ` ORDER BY p.${sortColumn} ${sortOrder}`;

    // Add pagination
    const offset = (page - 1) * limit;
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await db.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
    const countParams = [];
    let countParamCount = 0;

    if (search) {
      countParamCount++;
      countQuery += ` AND (p.name ILIKE $${countParamCount} OR p.description ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    if (category) {
      countParamCount++;
      countQuery += ` AND c.slug = $${countParamCount}`;
      countParams.push(category);
    }

    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    res.json({
      products: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({ error: 'Server error while fetching products' });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      compare_price,
      category_id,
      featured,
      in_stock,
      stock_quantity,
      sku,
      images,
      sizes,
      colors
    } = req.body;

    // Validate required fields
    if (!name || !price || !category_id) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Check if slug already exists
    const existingProduct = await db.query('SELECT id FROM products WHERE slug = $1', [slug]);
    if (existingProduct.rows.length > 0) {
      return res.status(400).json({ error: 'Product with similar name already exists' });
    }

    // Create product
    const result = await db.query(
      `INSERT INTO products (
        name, slug, description, price, compare_price, category_id, 
        featured, in_stock, stock_quantity, sku, images, sizes, colors
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
      RETURNING *`,
      [
        name,
        slug,
        description || '',
        parseFloat(price),
        compare_price ? parseFloat(compare_price) : null,
        parseInt(category_id),
        featured || false,
        in_stock !== undefined ? in_stock : true,
        stock_quantity ? parseInt(stock_quantity) : 0,
        sku || '',
        images ? JSON.stringify(images) : '[]',
        sizes ? JSON.stringify(sizes) : '[]',
        colors ? JSON.stringify(colors) : '[]'
      ]
    );

    res.status(201).json({
      message: 'Product created successfully',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Server error while creating product' });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      compare_price,
      category_id,
      featured,
      in_stock,
      stock_quantity,
      sku,
      images,
      sizes,
      colors
    } = req.body;

    // Check if product exists
    const existingProduct = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existingProduct.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let slug = existingProduct.rows[0].slug;
    
    // Generate new slug if name changed
    if (name && name !== existingProduct.rows[0].name) {
      slug = name.toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      // Check if new slug already exists
      const slugCheck = await db.query('SELECT id FROM products WHERE slug = $1 AND id != $2', [slug, id]);
      if (slugCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Product with similar name already exists' });
      }
    }

    // Update product
    const result = await db.query(
      `UPDATE products SET 
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        description = COALESCE($3, description),
        price = COALESCE($4, price),
        compare_price = COALESCE($5, compare_price),
        category_id = COALESCE($6, category_id),
        featured = COALESCE($7, featured),
        in_stock = COALESCE($8, in_stock),
        stock_quantity = COALESCE($9, stock_quantity),
        sku = COALESCE($10, sku),
        images = COALESCE($11, images),
        sizes = COALESCE($12, sizes),
        colors = COALESCE($13, colors),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *`,
      [
        name,
        slug,
        description,
        price ? parseFloat(price) : null,
        compare_price ? parseFloat(compare_price) : null,
        category_id ? parseInt(category_id) : null,
        featured,
        in_stock,
        stock_quantity ? parseInt(stock_quantity) : null,
        sku,
        images ? JSON.stringify(images) : null,
        sizes ? JSON.stringify(sizes) : null,
        colors ? JSON.stringify(colors) : null,
        id
      ]
    );

    res.json({
      message: 'Product updated successfully',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Server error while updating product' });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existingProduct.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if product is in any orders
    const orderItems = await db.query('SELECT id FROM order_items WHERE product_id = $1 LIMIT 1', [id]);
    if (orderItems.rows.length > 0) {
      return res.status(400).json({ error: 'Cannot delete product that has been ordered' });
    }

    await db.query('DELETE FROM products WHERE id = $1', [id]);

    res.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Server error while deleting product' });
  }
};

// Get all orders with filtering
exports.getOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      payment_status, 
      sort = 'created_at', 
      order = 'desc' 
    } = req.query;
    
    let query = `
      SELECT o.*, u.first_name, u.last_name, u.email,
      COUNT(oi.id) as item_count,
      SUM(oi.quantity) as total_quantity
      FROM orders o 
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND o.status = $${paramCount}`;
      params.push(status);
    }

    if (payment_status) {
      paramCount++;
      query += ` AND o.payment_status = $${paramCount}`;
      params.push(payment_status);
    }

    // Group by order details
    query += ` GROUP BY o.id, u.id`;

    // Validate sort column
    const validSortColumns = ['created_at', 'total_amount', 'status'];
    const sortColumn = validSortColumns.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    query += ` ORDER BY o.${sortColumn} ${sortOrder}`;

    // Add pagination
    const offset = (page - 1) * limit;
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await db.query(query, params);
    
    // Get order items for each order
    const ordersWithItems = await Promise.all(
      result.rows.map(async (order) => {
        const itemsResult = await db.query(
          `SELECT oi.*, p.name as product_name, p.images as product_images
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = $1`,
          [order.id]
        );
        
        return {
          ...order,
          items: itemsResult.rows
        };
      })
    );

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM orders o WHERE 1=1';
    const countParams = [];
    let countParamCount = 0;

    if (status) {
      countParamCount++;
      countQuery += ` AND o.status = $${countParamCount}`;
      countParams.push(status);
    }

    if (payment_status) {
      countParamCount++;
      countQuery += ` AND o.payment_status = $${countParamCount}`;
      countParams.push(payment_status);
    }

    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    res.json({
      orders: ordersWithItems,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalOrders: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({ error: 'Server error while fetching orders' });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    // Check if order exists
    const existingOrder = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (existingOrder.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updates = [];
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      updates.push(`status = $${paramCount}`);
      params.push(status);
    }

    if (payment_status) {
      paramCount++;
      updates.push(`payment_status = $${paramCount}`);
      params.push(payment_status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    paramCount++;
    params.push(id);

    const query = `UPDATE orders SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`;
    
    const result = await db.query(query, params);

    res.json({
      message: 'Order updated successfully',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Server error while updating order' });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sort = 'created_at', order = 'desc' } = req.query;
    
    let query = `
      SELECT id, first_name, last_name, email, phone, address, city, state, zip_code, country, created_at
      FROM users 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Validate sort column
    const validSortColumns = ['created_at', 'first_name', 'last_name', 'email'];
    const sortColumn = validSortColumns.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sortColumn} ${sortOrder}`;

    // Add pagination
    const offset = (page - 1) * limit;
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await db.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1';
    const countParams = [];
    let countParamCount = 0;

    if (search) {
      countParamCount++;
      countQuery += ` AND (first_name ILIKE $${countParamCount} OR last_name ILIKE $${countParamCount} OR email ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    res.json({
      users: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, phone, address, city, state, zip_code, country } = req.body;

    // Check if user exists
    const existingUser = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await db.query(
      `UPDATE users SET 
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        phone = COALESCE($3, phone),
        address = COALESCE($4, address),
        city = COALESCE($5, city),
        state = COALESCE($6, state),
        zip_code = COALESCE($7, zip_code),
        country = COALESCE($8, country),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING id, first_name, last_name, email, phone, address, city, state, zip_code, country, created_at`,
      [first_name, last_name, phone, address, city, state, zip_code, country, id]
    );

    res.json({
      message: 'User updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error while updating user' });
  }
};