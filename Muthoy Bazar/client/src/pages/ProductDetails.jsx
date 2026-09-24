import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { resolveImageUrl } from '../utils/image';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get(`/products/${id}`),
      api.get(`/products/${id}/related`),
      api.get(`/products/${id}/reviews`),
    ])
      .then(([p, r, rv]) => {
        setProduct(p.data.product);
        setRelated(r.data.products);
        setReviews(rv.data.reviews);
        setActiveImg(0);
        setQty(1);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); window.scrollTo(0, 0); }, [id]); // eslint-disable-line

  if (loading) return <div className="spinner" />;
  if (!product) return <div className="center-pad">Product not found.</div>;

  const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const stockLabel = product.stock <= 0 ? 'out' : product.stock <= 10 ? 'low' : 'in';
  const stockText = product.stock <= 0 ? 'Out of stock' : product.stock <= 10 ? `Only ${product.stock} left` : 'In stock';

  const handleAddToCart = async () => {
    if (!user) { showToast('Please log in to add items to your cart'); navigate('/login'); return; }
    try {
      await addToCart(product._id, qty);
      showToast(`${product.name} added to cart`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not add to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!user) { showToast('Please log in to continue'); navigate('/login'); return; }
    try {
      await addToCart(product._id, qty);
      navigate('/checkout');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not proceed');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) { showToast('Please log in to leave a review'); navigate('/login'); return; }
    try {
      await api.post(`/products/${id}/reviews`, { rating, comment });
      setComment('');
      setRating(5);
      showToast('Review submitted, thank you!');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not submit review');
    }
  };

  return (
    <>
      <div className="page-head">
        <div className="wrap">
          <h1>{product.name}</h1>
          <div className="crumbs"><Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <span>{product.category?.name}</span></div>
        </div>
      </div>
      <div className="wrap">
        <div className="pd-layout">
          <div>
            <div className="pd-media-main"><img src={resolveImageUrl(product.images?.[activeImg])} alt={product.name} /></div>
            <div className="pd-thumbs">
              {product.images?.map((img, i) => (
                <img key={i} src={resolveImageUrl(img)} alt="" className={i === activeImg ? 'active' : ''} onClick={() => setActiveImg(i)} />
              ))}
            </div>
          </div>
          <div className="pd-info">
            <span className="product-cat">{product.category?.name} &middot; {product.brand}</span>
            <h1>{product.name}</h1>
            <div className="pd-price-row">
              <span className="price">৳{effectivePrice}{product.discountPrice > 0 && <span className="strike">৳{product.price}</span>}</span>
              <span style={{ color: 'var(--gray-mid)', fontSize: '.9rem' }}>/ {product.weight}{product.unit}</span>
            </div>
            <span className={`stock-badge ${stockLabel}`}>{stockText}</span>
            <p className="pd-desc">{product.description}</p>

            <div className="qty-row">
              <div className="qty-control">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}>+</button>
              </div>
              <div className="pd-actions">
                <button className="btn btn-primary" onClick={handleAddToCart} disabled={product.stock <= 0}>Add to Cart</button>
                <button className="btn btn-outline" onClick={handleBuyNow} disabled={product.stock <= 0}>Buy Now</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, fontSize: '.85rem', color: 'var(--gray-mid)' }}>
              <span>SKU: {product.sku}</span>
              <span>Rating: {product.rating} ★ ({product.numReviews} reviews)</span>
            </div>
          </div>
        </div>

        <div style={{ paddingBottom: 60 }}>
          <h3 style={{ marginBottom: 16 }}>Customer Reviews ({reviews.length})</h3>
          {reviews.length === 0 ? (
            <p style={{ color: 'var(--gray-mid)' }}>No reviews yet. Be the first to review this product.</p>
          ) : (
            reviews.map((r) => (
              <div key={r._id} className="review-item">
                <div className="stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                <b>{r.name}</b>
                <p style={{ margin: '4px 0 0', color: 'var(--gray-mid)', fontSize: '.88rem' }}>{r.comment}</p>
              </div>
            ))
          )}

          <form className="review-form" onSubmit={submitReview}>
            <h4 style={{ marginBottom: 10 }}>Write a review</h4>
            <div className="star-input">
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={n <= rating ? 'active' : ''} onClick={() => setRating(n)}>★</span>
              ))}
            </div>
            <div className="field full">
              <textarea required placeholder="Share your experience with this product" value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit">Submit Review</button>
          </form>
        </div>

        {related.length > 0 && (
          <div className="related-strip" style={{ paddingBottom: 70 }}>
            <h3 style={{ marginBottom: 20 }}>You might also need</h3>
            <div className="product-grid">{related.map((p) => <ProductCard key={p._id} product={p} />)}</div>
          </div>
        )}
      </div>
    </>
  );
}
