import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import ProductCard from '../components/ProductCard';


export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.categories));
    api.get('/products', { params: { featured: true, limit: 4 } }).then((res) => setFeatured(res.data.products));
    api.get('/products', { params: { bestSeller: true, limit: 4 } }).then((res) => setBestSellers(res.data.products));
    api.get('/products', { params: { newArrival: true, limit: 4 } }).then((res) => setNewArrivals(res.data.products));
    api.get('/products', { params: { sort: 'price_asc', limit: 8 } }).then((res) =>
      setDeals(res.data.products.filter((p) => p.discountPrice > 0).slice(0, 4))
    );
  }, []);

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div className="hero-copy">
            <span className="hero-eyebrow">🌿 Affordable and Comfortable Shopping</span>
            <h1>Your everyday <em>bazar</em>,<br /> now a tap away.</h1>
            <p>From daily rice and atta to spices, snacks and home essentials — Muthoy Bazar keeps your kitchen and household stocked, without the queue.</p>
            <div className="hero-cta">
              <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
              <Link to="/contact" className="btn btn-outline">Contact Us</Link>
            </div>
            <div className="hero-stats">
              <div><b>100+</b><span>Grocery products</span></div>
              <div><b>{categories.length || 40}</b><span>Categories</span></div>
              <div><b>24h</b><span>Order support</span></div>
            </div>
          </div>
          <div className="hero-art">
            <img src="/images/category-banner.png"
            alt="Muthoy Bazar Banner"
            className="hero-banner"/>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="wrap">
          <div className="section-head">
            <div><span className="eyebrow">Hand-picked</span><h2>Featured Products</h2></div>
            <Link to="/shop?featured=true" className="btn btn-ghost btn-sm">See all</Link>
          </div>
          <div className="product-grid">{featured.map((p) => <ProductCard key={p._id} product={p} />)}</div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div><span className="eyebrow">Most loved</span><h2>Best Selling Products</h2></div>
            <Link to="/shop?bestSeller=true" className="btn btn-ghost btn-sm">See all</Link>
          </div>
          <div className="product-grid">{bestSellers.map((p) => <ProductCard key={p._id} product={p} />)}</div>
        </div>
      </section>

      <section className="section alt">
        <div className="wrap">
          <div className="section-head">
            <div><span className="eyebrow">Just landed</span><h2>New Arrivals</h2></div>
            <Link to="/shop?newArrival=true" className="btn btn-ghost btn-sm">See all</Link>
          </div>
          <div className="product-grid">{newArrivals.map((p) => <ProductCard key={p._id} product={p} />)}</div>
        </div>
      </section>

      {deals.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="section-head">
              <div><span className="eyebrow">Save more</span><h2>Today's Deals</h2></div>
            </div>
            <div className="product-grid">{deals.map((p) => <ProductCard key={p._id} product={p} />)}</div>
          </div>
        </section>
      )}

      <section className="section alt">
        <div className="wrap">
          <div className="section-head"><div><span className="eyebrow">Popular brands</span><h2>Brands you trust</h2></div></div>
          <div className="cat-strip" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
            {['Pran', 'ACI', 'Teer', 'Rupchanda', 'Ispahani', 'Radhuni', 'Fresh', 'Nescafe', 'Kazi Farms', 'Colgate'].map((b) => (
              <div key={b} className="cat-chip"><span>{b}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head"><div><span className="eyebrow">Why Muthoy Bazar</span><h2>Groceries, made simple</h2></div></div>
          <div className="why-grid">
            <div className="why-card">
              <div className="why-ic">✓</div>
              <h4>Quality you can trust</h4>
              <p>Every product is sourced from reliable, well-known suppliers and checked before it reaches your basket.</p>
            </div>
            <div className="why-card">
              <div className="why-ic">⚡</div>
              <h4>Fast, reliable delivery</h4>
              <p>Orders placed before 5 PM are prepared the same day, so your pantry never runs empty.</p>
            </div>
            <div className="why-card">
              <div className="why-ic">৳</div>
              <h4>Fair, transparent prices</h4>
              <p>Clear prices with no hidden charges — what you see on the shelf is what you pay at checkout.</p>
            </div>
            <div className="why-card">
              <div className="why-ic">🛒</div>
              <h4>Everyday essentials, together</h4>
              <p>Rice to detergent, one simple cart — no need to hop between shops for your weekly list.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="wrap">
          <div className="section-head"><div><span className="eyebrow">Customer voices</span><h2>What our shoppers say</h2></div></div>
          <div className="review-grid">
            <div className="review-card">
              <div className="stars">★★★★★</div>
              <p>I bought raisins, cashew nuts, dry nuts, and dates from Muthoy Bazaar through an order. Alhamdulillah, I received all the products well.</p>
              <div className="reviewer"><div className="avatar">SC</div><div><b>Shahadat Chowdhury</b></div></div>
            </div>
            <div className="review-card">
              <div className="stars">★★★★★</div>
              <p>Everything I ordered was of very high quality. Thank you Muthoy Bazar.</p>
              <div className="reviewer"><div className="avatar">MM</div><div><b>Mohsina Manal</b></div></div>
            </div>
            <div className="review-card">
              <div className="stars">★★★★☆</div>
              <p>Many thanks to Muthoy Bazaar for providing fresh products,,,, I received the delivery in a very short time,,,,.</p>
              <div className="reviewer"><div className="avatar">NF</div><div><b>Nowshin Farah</b></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="newsletter">
            <div className="newsletter-copy">
              <h3>Get weekly grocery deals</h3>
              <p>Join our list for restock alerts and seasonal offers on your pantry favourites.</p>
            </div>
            <form
              className="newsletter-form"
              onSubmit={(e) => { e.preventDefault(); e.target.reset(); alert('Subscribed! Watch your inbox for deals.'); }}
            >
              <input type="email" required placeholder="you@example.com" />
              <button className="btn btn-primary" type="submit" style={{ background: 'var(--gold)' }}>Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
