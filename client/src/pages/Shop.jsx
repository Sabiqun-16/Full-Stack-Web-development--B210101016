import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/api';
import ProductCard from '../components/ProductCard';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const activeCategory = searchParams.get('category') || 'all';
  const activeBrand = searchParams.get('brand') || '';
  const q = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || '';
  const page = Number(searchParams.get('page') || 1);
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.categories));
    api.get('/products/brands').then((res) => setBrands(res.data.brands));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 150 };
    if (activeCategory !== 'all') params.category = activeCategory;
    if (activeBrand) params.brand = activeBrand;
    if (q) params.q = q;
    if (sort) params.sort = sort;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    //if (searchParams.get('featured')) params.featured = true;
    //if (searchParams.get('bestSeller')) params.bestSeller = true;
    //if (searchParams.get('newArrival')) params.newArrival = true;

    console.log("Params:", params);
    api
  .get('/products', { params })
  .then((res) => {
    console.log("API Response:", res.data);

    setProducts(res.data.products);
    setPages(res.data.pages);
    setTotal(res.data.total);
  })
  .finally(() => setLoading(false));
  }, [activeCategory, activeBrand, q, sort, page, minPrice, maxPrice, searchParams]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const categoryName = useMemo(
    () => (activeCategory === 'all' ? 'all products' : categories.find((c) => c._id === activeCategory)?.name || ''),
    [activeCategory, categories]
  );

  return (
    <>
      <div className="page-head">
        <div className="wrap">
          <h1>Shop All Products</h1>
          <div className="crumbs"><a href="/">Home</a> / <span>Shop</span></div>
        </div>
      </div>
      <div className="wrap">
        <div className="shop-layout">
          <aside className="filter-card">
            <h4>Categories</h4>
            <ul className="filter-list" style={{ marginBottom: 20 }}>
              <li><button className={activeCategory === 'all' ? 'active' : ''} onClick={() => updateParam('category', '')}>All Products</button></li>
              {categories.map((c) => (
                <li key={c._id}>
                  <button className={activeCategory === c._id ? 'active' : ''} onClick={() => updateParam('category', c._id)}>{c.name}</button>
                </li>
              ))}
            </ul>

            <h4>Brand</h4>
            <select value={activeBrand} onChange={(e) => updateParam('brand', e.target.value)} style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid var(--gray-line)', marginBottom: 20 }}>
              <option value="">All Brands</option>
              {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>

            <h4>Price Range (৳)</h4>
            <div className="range-row">
              <input type="number" placeholder="Min" defaultValue={minPrice} onBlur={(e) => updateParam('minPrice', e.target.value)} />
              <input type="number" placeholder="Max" defaultValue={maxPrice} onBlur={(e) => updateParam('maxPrice', e.target.value)} />
            </div>
          </aside>

          <div>
            <div className="shop-toolbar">
              <span className="count">{loading ? 'Loading...' : `Showing ${products.length} of ${total} products in ${categoryName}`}</span>
              <select value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
                <option value="">Sort: Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="name_asc">Name: A-Z</option>
              </select>
            </div>

            {loading ? (
              <div className="spinner" />
            ) : products.length === 0 ? (
              <div className="empty-state">No products match your filters. Try adjusting your search or category.</div>
            ) : (
              <div className="product-grid">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            )}

            {pages > 1 && (
              <div className="pagination">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button key={p} className={p === page ? 'active' : ''} onClick={() => updateParam('page', p)}>{p}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
