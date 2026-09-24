import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const effectivePrice =
    product.discountPrice > 0 ? product.discountPrice : product.price;

  const outOfStock = product.stock <= 0;

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast('Please log in to add items to your cart');
      navigate('/login');
      return;
    }

    try {
      await addToCart(product._id, 1);
      showToast(`${product.name} added to cart`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not add to cart');
    }
  };

  return (
    <div className="product-card">
      {outOfStock ? (
        <span className="tag tag-out">Out of Stock</span>
      ) : product.isBestSeller ? (
        <span className="tag">Best Seller</span>
      ) : product.isFeatured ? (
        <span className="tag tag-green">Featured</span>
      ) : product.isNewArrival ? (
        <span className="tag tag-green">New</span>
      ) : null}

      <Link to={`/product/${product._id}`} className="product-media">
        <img
  src={product.images?.[0]}
  alt={product.name}
  loading="lazy"
/>
      </Link>

      <div className="product-body">
        <span className="product-cat">
          {product.category?.name || ''}
        </span>

        <Link
          to={`/product/${product._id}`}
          className="product-name"
        >
          {product.name}
        </Link>

        <p className="product-desc">
          {product.brand} &middot; {product.weight}
          {product.unit}
        </p>

        <div className="product-foot">
          <span className="price">
            ৳{effectivePrice}
            {product.discountPrice > 0 && (
              <span className="strike">৳{product.price}</span>
            )}
          </span>

          <button
            className="add-btn"
            onClick={handleAdd}
            disabled={outOfStock}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}