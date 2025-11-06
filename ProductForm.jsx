import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import '../../styles/Admin.css';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compare_price: '',
    category_id: '',
    featured: false,
    in_stock: true,
    stock_quantity: '',
    sku: '',
    images: [],
    sizes: [],
    colors: []
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      const product = response.data;
      
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        compare_price: product.compare_price || '',
        category_id: product.category_id || '',
        featured: product.featured || false,
        in_stock: product.in_stock !== undefined ? product.in_stock : true,
        stock_quantity: product.stock_quantity || '',
        sku: product.sku || '',
        images: Array.isArray(product.images) ? product.images : [],
        sizes: Array.isArray(product.sizes) ? product.sizes : [],
        colors: Array.isArray(product.colors) ? product.colors : []
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayChange = (field, value) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [field]: array
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await api.put(`/admin/products/${id}`, formData);
      } else {
        await api.post('/admin/products', formData);
      }
      
      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error.response?.data?.error || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form">
      <div className="admin-header">
        <h1 className="admin-title">
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h1>
        <p className="admin-subtitle">
          {isEdit ? 'Update product information' : 'Create a new product'}
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      <form 
        onSubmit={handleSubmit}
        className="form-card"
        data-aos="fade-up"
        data-aos-delay="200"
      >
        <div className="form-grid">
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-input"
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="form-input"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Compare Price</label>
                <input
                  type="number"
                  name="compare_price"
                  value={formData.compare_price}
                  onChange={handleChange}
                  className="form-input"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="clothe">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.clothe}>
                      {category.clothe}
                    </option>
                  ))}
                  <option value="Bag">Bags</option>
                  {categories.map(category => (
                    <option key={category.Bag} value={category.Bag}>
                      {category.bag}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Inventory & Status */}
          <div className="form-section">
            <h3>Inventory & Status</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Stock Quantity</label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                />
              </div>
            </div>

            <div className="form-checkboxes">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                Featured Product
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="in_stock"
                  checked={formData.in_stock}
                  onChange={handleChange}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                In Stock
              </label>
            </div>
          </div>

          {/* Variants */}
          <div className="form-section">
            <h3>Product Variants</h3>
            
            <div className="form-group">
              <label className="form-label">Sizes (comma separated)</label>
              <input
                type="text"
                value={formData.sizes.join(', ')}
                onChange={(e) => handleArrayChange('sizes', e.target.value)}
                className="form-input"
                placeholder="S, M, L, XL"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Colors (comma separated)</label>
              <input
                type="text"
                value={formData.colors.join(', ')}
                onChange={(e) => handleArrayChange('colors', e.target.value)}
                className="form-input"
                placeholder="Red, Blue, Green"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Image URLs (comma separated)</label>
              <textarea
                value={formData.images.join(', ')}
                onChange={(e) => handleArrayChange('images', e.target.value)}
                className="form-input"
                rows="3"
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                {isEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEdit ? 'Update Product' : 'Create Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;