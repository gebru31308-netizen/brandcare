
import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';

const BRAND = '#9B7AF2';
const DARK = '#7651D5';
const LIGHT = '#F4F0FF';
const GRADIENT = `linear-gradient(135deg, ${BRAND}, ${DARK})`;

const money = value => Number(value || 0).toLocaleString('en-US', {
  minimumFractionDigits: 2, maximumFractionDigits: 2
});

const emptyForm = {
  name: '', description: '', price: '', image_url: '',
  rating: '0', clicks: '0', likes: '0', purchases: '0'
};

function Products({ onBack }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [imageEditingId, setImageEditingId] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState('');
  const [imageSaving, setImageSaving] = useState(false);
  const [formImageFile, setFormImageFile] = useState(null);
  const [formImagePreview, setFormImagePreview] = useState('');
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    if (!showForm) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [showForm]);

  useEffect(() => () => {
    if (newImagePreview) URL.revokeObjectURL(newImagePreview);
  }, [newImagePreview]);

  useEffect(() => () => {
    if (formImagePreview) URL.revokeObjectURL(formImagePreview);
  }, [formImagePreview]);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase.from('products')
      .select('*').order('created_at', { ascending: false });
    if (error) alert(error.message);
    else setProducts(data || []);
    setLoading(false);
  }

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  function validateImage(file) {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image.');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must not exceed 5 MB.');
      return false;
    }
    return true;
  }

  function selectImage(e, type) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validateImage(file)) {
      e.target.value = '';
      return;
    }

    const preview = URL.createObjectURL(file);
    if (type === 'form') {
      setFormImageFile(file);
      setFormImagePreview(preview);
    } else {
      setNewImageFile(file);
      setNewImagePreview(preview);
    }
  }

  async function uploadProductImage(file) {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `products/${Date.now()}-${Math.random().toString(36).substring(2)}.${extension}`;

    const { error } = await supabase.storage.from('product-images')
      .upload(path, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false
      });

    if (error) throw error;
    return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
  }

  function openAddForm() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormImageFile(null);
    setFormImagePreview('');
    setShowForm(true);
  }

  function editProduct(product) {
    setEditingId(product.id);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: String(product.price ?? ''),
      image_url: product.image_url || '',
      rating: String(product.rating ?? 0),
      clicks: String(product.clicks ?? 0),
      likes: String(product.likes ?? 0),
      purchases: String(product.purchases ?? 0)
    });
    setFormImageFile(null);
    setFormImagePreview('');
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormImageFile(null);
    setFormImagePreview('');
  }

  async function saveProduct(e) {
    e.preventDefault();

    if (!form.name.trim() || form.price === '' ||
      !Number.isFinite(Number(form.price)) || Number(form.price) < 0) {
      alert('Enter a product name and valid price.');
      return;
    }

    const rating = Number(form.rating);
    const clicks = Number(form.clicks);
    const likes = Number(form.likes);
    const purchases = Number(form.purchases);

    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      alert('Rating must be between 0 and 5.');
      return;
    }

    for (const [name, value] of [
      ['Views', clicks], ['Likes', likes], ['Purchases', purchases]
    ]) {
      if (!Number.isInteger(value) || value < 0) {
        alert(`${name} must be a whole number of 0 or more.`);
        return;
      }
    }

    setSaving(true);
    try {
      const imageUrl = formImageFile
        ? await uploadProductImage(formImageFile)
        : form.image_url;

      const product = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        image_url: imageUrl || null,
        rating, clicks, likes, purchases
      };

      const result = editingId
        ? await supabase.from('products').update(product).eq('id', editingId)
        : await supabase.from('products').insert([product]);

      if (result.error) throw result.error;

      const wasEditing = Boolean(editingId);
      closeForm();
      await fetchProducts();
      alert(wasEditing ? 'Product updated successfully!' : 'Product added successfully!');
    } catch (error) {
      console.error('Product save error:', error);
      alert(error.message || 'Unable to save product.');
    } finally {
      setSaving(false);
    }
  }

  function openImageEditor(product) {
    setImageEditingId(product.id);
    setNewImageFile(null);
    setNewImagePreview('');
  }

  function closeImageEditor() {
    if (imageSaving) return;
    setImageEditingId(null);
    setNewImageFile(null);
    setNewImagePreview('');
  }

  async function updateProductImage(e) {
    e.preventDefault();
    if (!newImageFile) return alert('Please select an image from your computer.');

    setImageSaving(true);
    try {
      const imageUrl = await uploadProductImage(newImageFile);
      const { error } = await supabase.from('products')
        .update({ image_url: imageUrl }).eq('id', imageEditingId);

      if (error) throw error;

      setProducts(prev => prev.map(product =>
        product.id === imageEditingId ? { ...product, image_url: imageUrl } : product
      ));

      closeImageEditor();
      alert('Product image updated successfully!');
    } catch (error) {
      console.error('Image upload error:', error);
      alert(error.message || 'Image upload failed.');
    } finally {
      setImageSaving(false);
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return alert(error.message);
    setProducts(prev => prev.filter(product => product.id !== id));
  }

  const filtered = products.filter(product =>
    (product.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    ['bi-box-seam', 'Total Products', products.length],
    ['bi-wallet2', 'Combined Prices', `ETB ${money(products.reduce((s, p) => s + Number(p.price || 0), 0))}`],
    ['bi-eye', 'Product Views', products.reduce((s, p) => s + Number(p.clicks || 0), 0).toLocaleString()],
    ['bi-heart', 'Customer Likes', products.reduce((s, p) => s + Number(p.likes || 0), 0).toLocaleString()]
  ];

  return (
    <div className="container-fluid py-3 px-3 px-md-4">
      <style>{`
        .product-stat{background:white;border-radius:16px;padding:14px;
          box-shadow:0 3px 15px #24124d0a;height:100%}
        .product-stat-icon{width:40px;height:40px;border-radius:12px;
          display:flex;align-items:center;justify-content:center;
          background:${LIGHT};color:${BRAND};font-size:19px}
        .product-card{background:white;border-radius:17px;overflow:hidden;
          box-shadow:0 3px 16px #24124d0b;height:100%;transition:.2s}
        .product-card:hover{transform:translateY(-3px);box-shadow:0 8px 22px #24124d15}
        .product-image{height:clamp(125px,20vw,180px);background:${LIGHT};
          position:relative;overflow:hidden}
        .product-image img{width:100%;height:100%;object-fit:cover}
        .product-action{border:0;border-radius:10px;padding:7px 10px;
          font-size:12px;font-weight:500;flex:1;white-space:nowrap}
        .brand-btn{background:${GRADIENT};color:white;border:0}
        .brand-btn:hover{color:white;opacity:.92}
        .brand-soft{background:${LIGHT};color:${BRAND};border:0}
        .brand-modal{width:100%;max-width:520px;background:white;border-radius:20px;
          overflow:hidden;display:flex;flex-direction:column;max-height:calc(100dvh - 30px)}
        .brand-modal-body{overflow-y:auto;min-height:0;overscroll-behavior:contain;
          -webkit-overflow-scrolling:touch}
        .brand-input{border-radius:11px;padding:10px 12px}
        .brand-modal-overlay{position:fixed;inset:0;background:#14102da8;
          z-index:2000;display:flex;align-items:center;justify-content:center;padding:12px}
        @media(max-width:400px){.product-action{font-size:11px;padding:7px 5px}}
      `}</style>

      {/* Compact Single-Row Header */}
      <div className="rounded-4 px-3 py-2 text-white mb-3 shadow-sm"
        style={{ background: GRADIENT }}>
        <div className="d-flex align-items-center gap-2">
          <button onClick={onBack} className="btn btn-light btn-sm rounded-circle">
            <i className="bi bi-arrow-left" style={{ color: BRAND }} />
          </button>
          <i className="bi bi-box-seam fs-4" />
          <div>
            <h6 className="fw-bold mb-0">Product Manager</h6>
            <small className="opacity-75">Manage your BrandCare store</small>
          </div>
          <span className="badge bg-white rounded-pill ms-auto"
            style={{ color: DARK }}>
            {products.length} Items
          </span>
        </div>
      </div>

      {/* Statistics */}
      <div className="row g-2 mb-4">
        {stats.map(([icon, title, value]) => (
          <div className="col-6 col-lg-3" key={title}>
            <div className="product-stat">
              <div className="product-stat-icon mb-2">
                <i className={`bi ${icon}`} />
              </div>
              <div className="fw-bold text-dark text-break"
                style={{ fontSize: 'clamp(15px,2vw,21px)' }}>{value}</div>
              <small className="text-muted">{title}</small>
            </div>
          </div>
        ))}
      </div>

      {/* Products Heading */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h5 className="fw-bold mb-1">My Products</h5>
          <small className="text-muted">Manage your store collection</small>
        </div>
        <button className="btn brand-btn rounded-pill px-3 shadow-sm" onClick={openAddForm}>
          <i className="bi bi-plus-lg me-1" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-4 p-2 shadow-sm mb-3">
        <div className="input-group">
          <span className="input-group-text bg-white border-0">
            <i className="bi bi-search" style={{ color: BRAND }} />
          </span>
          <input className="form-control border-0 shadow-none"
            placeholder="Search products..." value={search}
            onChange={e => setSearch(e.target.value)} />
          {search && (
            <button className="btn btn-light" onClick={() => setSearch('')}>
              <i className="bi bi-x-lg" />
            </button>
          )}
          <button className="btn brand-soft rounded-3"
            onClick={fetchProducts} disabled={loading}>
            <i className="bi bi-arrow-clockwise" />
          </button>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <small className="text-muted">Showing {filtered.length} products</small>
        <small style={{ color: BRAND }}>
          <i className="bi bi-grid me-1" /> Inventory
        </small>
      </div>

      {/* Product Cards */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: BRAND }} />
          <p className="text-muted small mt-2">Loading products...</p>
        </div>
      ) : !filtered.length ? (
        <div className="bg-white rounded-4 text-center p-5 shadow-sm">
          <i className="bi bi-bag-x display-3" style={{ color: BRAND }} />
          <h5 className="fw-bold mt-3">No products found</h5>
          <p className="text-muted small">Add a product or try another search.</p>
          <button className="btn brand-btn rounded-pill px-4" onClick={openAddForm}>
            <i className="bi bi-plus-lg me-1" /> Add Product
          </button>
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map(product => (
            <div className="col-6 col-md-4 col-lg-3" key={product.id}>
              <div className="product-card d-flex flex-column">
                <div className="product-image">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name}
                      onError={e => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <div className="h-100 d-flex align-items-center justify-content-center"
                      style={{ color: BRAND }}>
                      <i className="bi bi-image display-4" />
                    </div>
                  )}
                  <span className="position-absolute top-0 end-0 m-2 badge rounded-pill bg-white"
                    style={{ color: '#198754' }}>
                    <i className="bi bi-check-circle-fill me-1" /> Active
                  </span>
                  <button className="btn btn-light btn-sm rounded-pill position-absolute bottom-0 end-0 m-2 shadow-sm"
                    onClick={() => openImageEditor(product)} style={{ fontSize: 11 }}>
                    <i className="bi bi-camera me-1" /> Change Image
                  </button>
                </div>

                <div className="p-2 p-md-3 d-flex flex-column flex-grow-1">
                  <h6 className="mb-2 text-dark"
                    style={{ fontSize: 14, minHeight: 34, display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.name}
                  </h6>
                  <div className="mb-2" style={{ color: BRAND }}>
                    ETB {money(product.price)}
                  </div>
                  <small className="text-muted mb-2">
                    <i className="bi bi-star-fill text-warning me-1" />
                    {Number(product.rating || 0).toFixed(1)} / 5
                  </small>
                  <div className="d-flex justify-content-between border-top border-bottom py-2 mb-2">
                    <small className="text-muted">
                      <i className="bi bi-eye me-1" style={{ color: BRAND }} />
                      {product.clicks || 0}
                    </small>
                    <small className="text-muted">
                      <i className="bi bi-heart me-1" style={{ color: BRAND }} />
                      {product.likes || 0}
                    </small>
                  </div>
                  <small className="text-muted mb-2">
                    <i className="bi bi-cart-check me-1" style={{ color: BRAND }} />
                    {product.purchases || 0} purchases
                  </small>
                  {product.description && (
                    <p className="small text-muted mb-3"
                      style={{ display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {product.description}
                    </p>
                  )}
                  <div className="d-flex gap-2 mt-auto">
                    <button className="product-action" style={{ background: LIGHT, color: BRAND }}
                      onClick={() => editProduct(product)}>
                      <i className="bi bi-pencil me-1" /> Edit
                    </button>
                    <button className="product-action"
                      style={{ background: '#FFF0F2', color: '#dc3545' }}
                      onClick={() => deleteProduct(product.id)}>
                      <i className="bi bi-trash me-1" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Change Image Modal */}
      {imageEditingId !== null && (
        <div className="brand-modal-overlay" onClick={e => {
          if (e.target === e.currentTarget) closeImageEditor();
        }}>
          <div className="bg-white rounded-4 shadow-lg w-100 p-3 p-md-4"
            style={{ maxWidth: 450 }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">
                <i className="bi bi-image me-2" style={{ color: BRAND }} />
                Update Product Image
              </h5>
              <button className="btn-close" onClick={closeImageEditor} disabled={imageSaving} />
            </div>
            <form onSubmit={updateProductImage}>
              <label className="form-label small">Select Product Image</label>
              <input type="file" className="form-control brand-input mb-3"
                accept="image/*" onChange={e => selectImage(e, 'change')} required />
              {newImagePreview && (
                <img src={newImagePreview} alt="New product preview"
                  className="w-100 rounded-3 mb-3"
                  style={{ maxHeight: 200, objectFit: 'contain', background: LIGHT }} />
              )}
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-light flex-fill"
                  onClick={closeImageEditor} disabled={imageSaving}>Cancel</button>
                <button type="submit" className="btn brand-btn flex-fill"
                  disabled={imageSaving || !newImageFile}>
                  {imageSaving ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showForm && (
        <div className="brand-modal-overlay" onClick={e => {
          if (e.target === e.currentTarget) closeForm();
        }}>
          <div className="brand-modal">
            <div className="p-3 text-white d-flex justify-content-between align-items-center"
              style={{ background: GRADIENT }}>
              <div>
                <h5 className="fw-bold mb-1">
                  <i className={`bi ${editingId ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`} />
                  {editingId ? 'Edit Product' : 'Add New Product'}
                </h5>
                <small className="opacity-75">Product information</small>
              </div>
              <button className="btn-close btn-close-white"
                onClick={closeForm} disabled={saving} />
            </div>

            <form onSubmit={saveProduct}
              className="d-flex flex-column flex-grow-1" style={{ minHeight: 0 }}>
              <div className="brand-modal-body p-3 p-md-4">
                <div className="mb-3">
                  <label className="form-label small">Product Name *</label>
                  <input name="name" value={form.name} onChange={handleChange}
                    className="form-control brand-input"
                    placeholder="Enter product name" required />
                </div>

                <div className="mb-3">
                  <label className="form-label small">Description</label>
                  <textarea name="description" value={form.description}
                    onChange={handleChange} className="form-control brand-input"
                    placeholder="Describe your product..." rows="3" />
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small">Price (ETB) *</label>
                    <input type="number" min="0" step="0.01" name="price"
                      value={form.price} onChange={handleChange}
                      className="form-control brand-input" placeholder="0.00" required />
                  </div>
                  <div className="col-6">
                    <label className="form-label small">Rating (0–5)</label>
                    <input type="number" min="0" max="5" step="0.1"
                      name="rating" value={form.rating} onChange={handleChange}
                      className="form-control brand-input" />
                  </div>
                </div>

                <div className="border rounded-4 p-3 mb-3">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <i className="bi bi-bar-chart-fill" style={{ color: BRAND }} />
                    <div>
                      <h6 className="mb-0">Product Statistics</h6>
                      <small className="text-muted">Adjust product counters</small>
                    </div>
                  </div>
                  <div className="row g-3">
                    {[
                      ['clicks', 'Views', 'bi-eye'],
                      ['likes', 'Likes', 'bi-heart'],
                      ['purchases', 'Purchases', 'bi-cart-check']
                    ].map(([name, label, icon]) => (
                      <div className="col-6" key={name}>
                        <label className="form-label small">
                          <i className={`bi ${icon} me-1`} style={{ color: BRAND }} />
                          {label}
                        </label>
                        <input type="number" min="0" step="1" name={name}
                          value={form[name]} onChange={handleChange}
                          className="form-control brand-input" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small">Product Image</label>
                  <input type="file" className="form-control brand-input"
                    accept="image/*" onChange={e => selectImage(e, 'form')} />
                  <small className="text-muted d-block mt-2">
                    Maximum image size: 5 MB.
                  </small>
                </div>

                {(formImagePreview || form.image_url) && (
                  <div className="mb-3">
                    <label className="form-label small">Image Preview</label>
                    <img src={formImagePreview || form.image_url}
                      alt="Product preview" className="w-100 rounded-3"
                      style={{ maxHeight: 160, objectFit: 'contain', background: LIGHT }} />
                    {formImagePreview && (
                      <button type="button" className="btn btn-sm btn-outline-danger mt-2"
                        onClick={() => {
                          setFormImageFile(null);
                          setFormImagePreview('');
                        }}>
                        <i className="bi bi-x-circle me-1" /> Remove selected image
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="p-3 border-top bg-white"
                style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-light border flex-fill"
                    onClick={closeForm} disabled={saving}>Cancel</button>
                  <button type="submit" className="btn brand-btn flex-fill" disabled={saving}>
                    {saving ? 'Saving...' : editingId ? 'Update Product' : 'Save Product'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
