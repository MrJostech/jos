-- Create database
CREATE DATABASE halcyon_store;

-- Connect to database
\c halcyon_store;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2),
    category_id INTEGER REFERENCES categories(id),
    featured BOOLEAN DEFAULT FALSE,
    in_stock BOOLEAN DEFAULT TRUE,
    stock_quantity INTEGER DEFAULT 0,
    sku VARCHAR(100) UNIQUE,
    images JSONB,
    sizes JSONB,
    colors JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cart table
CREATE TABLE cart (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cart_items table
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER REFERENCES cart(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    size VARCHAR(20),
    color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    shipping_address JSONB NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending',
    paystack_reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create order_items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    size VARCHAR(20),
    color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample categories
INSERT INTO categories (name, slug, description, image_url) VALUES
('Men', 'men', 'Stylish clothing for men', 'https://images.unsplash.com/photo-1617137968427-85924c800a22?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'),
('Women', 'women', 'Elegant fashion for women', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'),
('Kids', 'kids', 'Comfortable clothes for kids', 'https://images.unsplash.com/photo-1503454532315-3dd33c2bb810?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80');

-- Insert sample products
INSERT INTO products (name, slug, description, price, compare_price, category_id, featured, in_stock, stock_quantity, sku, images, sizes, colors) VALUES
('Classic White T-Shirt', 'classic-white-tshirt', 'Premium cotton white t-shirt for everyday wear', 29.99, 39.99, 1, true, true, 50, 'MTS-WHT-001', 
 '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"]',
 '["S", "M", "L", "XL"]',
 '["White", "Black", "Gray"]'),

('Designer Denim Jacket', 'designer-denim-jacket', 'Vintage style denim jacket with modern fit', 89.99, 119.99, 1, true, true, 25, 'MDJ-BLU-001',
 '["https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"]',
 '["S", "M", "L", "XL"]',
 '["Blue", "Black"]'),

('Elegant Summer Dress', 'elegant-summer-dress', 'Light and comfortable summer dress', 59.99, 79.99, 2, true, true, 30, 'WSD-FLO-001',
 '["https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"]',
 '["XS", "S", "M", "L"]',
 '["Floral", "White", "Navy"]'),

('Kids Sports T-Shirt', 'kids-sports-tshirt', 'Comfortable sports t-shirt for active kids', 19.99, 24.99, 3, true, true, 40, 'KTS-SPT-001',
 '["https://images.unsplash.com/photo-1503454532315-3dd33c2bb810?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"]',
 '["4-5Y", "6-7Y", "8-9Y", "10-11Y"]',
 '["Red", "Blue", "Green"]');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_cart_user_id ON cart(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_paystack_reference ON orders(paystack_reference);

-- Insert admin user (password: admin123)
INSERT INTO users (first_name, last_name, email, password, phone, address, city, state, zip_code, country) 
VALUES (
  'Admin', 
  'User', 
  'my@halcyon12.com', 
  '$2a$10$8K1p/a0dRL1//.2s.8S.5u.9L.8Lb.8K1p/a0dRL1//.2s.8S.5u', -- bcrypt hash for 'admin123'
  '+1234567890',
  '123 Admin Street',
  'Admin City',
  'Admin State',
  '12345',
  'Admin Country'
);