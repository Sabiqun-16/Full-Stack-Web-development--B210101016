import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [summary, setSummary] = useState({ itemsPrice: 0, discountAmount: 0, deliveryPrice: 0, totalPrice: 0 });
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [] });
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/cart');
      setCart(res.data.cart);
      setSummary(res.data.summary);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, quantity = 1) => {
    const res = await api.post('/cart', { productId, quantity });
    setCart(res.data.cart);
    setSummary(res.data.summary);
  };

  const updateQuantity = async (productId, quantity) => {
    const res = await api.put(`/cart/${productId}`, { quantity });
    setCart(res.data.cart);
    setSummary(res.data.summary);
  };

  const removeItem = async (productId) => {
    const res = await api.delete(`/cart/${productId}`);
    setCart(res.data.cart);
    setSummary(res.data.summary);
  };

  const applyCoupon = async (code) => {
    const res = await api.post('/cart/coupon', { code });
    setCart(res.data.cart);
    setSummary(res.data.summary);
  };

  const clearCartLocal = () => {
    setCart({ items: [] });
    setSummary({ itemsPrice: 0, discountAmount: 0, deliveryPrice: 0, totalPrice: 0 });
  };

  const itemCount = (cart.items || []).reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, summary, loading, itemCount, addToCart, updateQuantity, removeItem, applyCoupon, refreshCart, clearCartLocal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
