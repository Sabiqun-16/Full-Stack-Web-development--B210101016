import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import { useToast } from '../../context/ToastContext';
import { resolveImageUrl } from '../../utils/image';

const emptyForm = { name: '', brand: '', category: '', description: '', price: '', discountPrice: '', stock: '', sku: '', weight: '', unit: 'g', isFeatured: false, isBestSeller: false, isNewArrival: false, images: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [existingImages, setExistingImages] = useState([]); // image paths already saved on the product
  const [newFiles, setNewFiles] = useState([]); // File objects picked in this session, not yet uploaded
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  const loadProducts = () => {
    setLoading(true);
    api.get('/products', { params: { page, limit: 15 } }).then((res) => {
      setProducts(res.data.products);
      setPages(res.data.pages);
    }).finally(() => setLoading(false));
  };

  useEffect(loadProducts, [page]); // eslint-disable-line
  useEffect(() => { api.get('/categories').then((res) => setCategories(res.data.categories)); }, []);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setExistingImages([]); setNewFiles([]); setModalOpen(true); };
  const openEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name, brand: p.brand, category: p.category?._id || p.category, description: p.description,
      price: p.price, discountPrice: p.discountPrice, stock: p.stock, sku: p.sku, weight: p.weight, unit: p.unit,
      isFeatured: p.isFeatured, isBestSeller: p.isBestSeller, isNewArrival: p.isNewArrival, images: '',
    });
    setExistingImages(p.images || []);
    setNewFiles([]);
    setModalOpen(true);
  };

  const handleFilePick = (e) => {
    const picked = Array.from(e.target.files || []);
    setNewFiles((prev) => [...prev, ...picked].slice(0, 5)); // Multer is configured for max 5 images
    e.target.value = ''; // allow re-picking the same file if removed
  };
  const removeNewFile = (idx) => setNewFiles((prev) => prev.filter((_, i) => i !== idx));
  const removeExistingImage = (idx) => setExistingImages((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const urlImages = form.images.split(',').map((s) => s.trim()).filter(Boolean);

      if (newFiles.length > 0) {
        // Real file upload: send multipart/form-data straight to the Multer-backed endpoint.
        // Uploaded files REPLACE the image set on this save (kept images + typed URLs are dropped
        // in favour of the freshly uploaded files, since the server always overwrites `images`
        // when files are present). Upload your existing/URL images again as needed, or run
        // separate saves if you want to accumulate images from different sources over time.
        const fd = new FormData();
        Object.entries(form).forEach(([key, val]) => {
          if (key === 'images') return;
          fd.append(key, val);
        });
        newFiles.forEach((file) => fd.append('images', file));
        if (editingId) {
          await api.put(`/admin/products/${editingId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        } else {
          await api.post('/admin/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        }
      } else {
        // No new files picked: send JSON, keeping existing images plus any pasted URLs.
        const payload = { ...form, images: [...existingImages, ...urlImages] };
        if (editingId) {
          await api.put(`/admin/products/${editingId}`, payload);
        } else {
          await api.post('/admin/products', payload);
        }
      }
      showToast(editingId ? 'Product updated' : 'Product created');
      setModalOpen(false);
      loadProducts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not save product');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      showToast('Product deleted');
      loadProducts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete product');
    }
  };

  return (
    <div>
      <div className="admin-toolbar">
        <h3 style={{ fontSize: '1rem' }}>All Products</h3>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Add Product</button>
      </div>

      {loading ? <div className="spinner" /> : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Image</th><th>Product</th><th>Brand</th><th>Price</th><th>Stock</th><th>SKU</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    {p.images?.[0] ? (
                      <img src={resolveImageUrl(p.images[0])} alt={p.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, background: 'var(--green-pale-2)' }} />
                    ) : (
                      <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--gray-light)' }} />
                    )}
                  </td>
                  <td>{p.name}</td>
                  <td>{p.brand}</td>
                  <td>৳{p.discountPrice > 0 ? p.discountPrice : p.price}</td>
                  <td>{p.stock}</td>
                  <td>{p.sku}</td>
                  <td className="table-actions">
                    <button onClick={() => openEdit(p)}>Edit</button>
                    <button className="danger" onClick={() => handleDelete(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="pagination">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16 }}>{editingId ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="field full"><label>Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="field"><label>Brand</label><input required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></div>
                <div className="field">
                  <label>Category</label>
                  <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="field full"><label>Description</label><textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="field"><label>Price (৳)</label><input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
                <div className="field"><label>Discount price (৳, optional)</label><input type="number" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} /></div>
                <div className="field"><label>Stock quantity</label><input required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
                <div className="field"><label>SKU</label><input required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
                <div className="field"><label>Weight</label><input required type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} /></div>
                <div className="field">
                  <label>Unit</label>
                  <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                    {['g', 'kg', 'ml', 'l', 'pcs', 'pack', 'dozen'].map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div className="field full">
                <label>Product Images</label>

                {(existingImages.length > 0 || newFiles.length > 0) && (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                    {existingImages.map((src, i) => (
                      <div key={`existing-${i}`} style={{ position: 'relative' }}>
                        <img src={resolveImageUrl(src)} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--gray-line)' }} />
                        <button type="button" onClick={() => removeExistingImage(i)} title="Remove"
                          style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#B84B3C', color: '#fff', fontSize: '.7rem', lineHeight: 1 }}>✕</button>
                      </div>
                    ))}
                    {newFiles.map((file, i) => (
                      <div key={`new-${i}`} style={{ position: 'relative' }}>
                        <img src={URL.createObjectURL(file)} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '2px solid var(--green)' }} />
                        <button type="button" onClick={() => removeNewFile(i)} title="Remove"
                          style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#B84B3C', color: '#fff', fontSize: '.7rem', lineHeight: 1 }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}

                <input type="file" accept="image/png, image/jpeg, image/webp" multiple onChange={handleFilePick} style={{ marginBottom: 10 }} />
                <p style={{ fontSize: '.76rem', color: 'var(--gray-mid)', margin: '0 0 10px' }}>
                  Upload up to 5 photos from your computer (jpg, png, or webp). Or, if you'd rather link to
                  images already hosted online, paste URLs below instead — leave the file picker empty in that case.
                </p>
                <input value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg" />
              </div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.85rem' }}><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Featured</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.85rem' }}><input type="checkbox" checked={form.isBestSeller} onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })} /> Best Seller</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.85rem' }}><input type="checkbox" checked={form.isNewArrival} onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })} /> New Arrival</label>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? 'Saving...' : editingId ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
