/**
 * Cart Context - Sepet Yönetimi
 * LocalStorage + API entegrasyonu
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Sepeti yükle
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // LocalStorage'dan yükle
      const localCart = JSON.parse(localStorage.getItem('pazara_cart') || '[]');
      setCartItems(localCart);
      calculateTotal(localCart);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      if (response.data.success) {
        setCartItems(response.data.items);
        setCartTotal(parseFloat(response.data.total));
      }
    } catch (error) {
      console.error('Sepet yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    setCartTotal(total);
  };

  // Sepete ekle
  const addToCart = async (item) => {
    if (isAuthenticated) {
      try {
        const response = await api.post('/cart/add', {
          product_id: item.product_id || null,
          food_id: item.food_id || null,
          item_type: item.item_type,
          quantity: item.quantity || 1,
          notes: item.notes
        });
        if (response.data.success) {
          await fetchCart();
          toast.success('Sepete eklendi! 🛒');
        }
      } catch (error) {
        toast.error('Sepete eklenemedi.');
      }
    } else {
      // LocalStorage'a ekle
      const localCart = JSON.parse(localStorage.getItem('pazara_cart') || '[]');
      const existingIndex = localCart.findIndex(
        i => (i.product_id === item.product_id && i.item_type === 'product') ||
             (i.food_id === item.food_id && i.item_type === 'food')
      );

      if (existingIndex >= 0) {
        localCart[existingIndex].quantity += (item.quantity || 1);
      } else {
        localCart.push({ ...item, id: Date.now(), quantity: item.quantity || 1 });
      }

      localStorage.setItem('pazara_cart', JSON.stringify(localCart));
      setCartItems(localCart);
      calculateTotal(localCart);
      toast.success('Sepete eklendi! 🛒');
    }
  };

  // Adet güncelle
  const updateQuantity = async (itemId, quantity) => {
    if (isAuthenticated) {
      try {
        await api.put(`/cart/item/${itemId}`, { quantity });
        await fetchCart();
      } catch (error) {
        toast.error('Güncelleme başarısız.');
      }
    } else {
      const localCart = JSON.parse(localStorage.getItem('pazara_cart') || '[]');
      const index = localCart.findIndex(i => i.id === itemId);
      if (index >= 0) {
        if (quantity < 1) {
          localCart.splice(index, 1);
        } else {
          localCart[index].quantity = quantity;
        }
        localStorage.setItem('pazara_cart', JSON.stringify(localCart));
        setCartItems(localCart);
        calculateTotal(localCart);
      }
    }
  };

  // Sepetten çıkar
  const removeFromCart = async (itemId) => {
    if (isAuthenticated) {
      try {
        await api.delete(`/cart/item/${itemId}`);
        await fetchCart();
        toast.success('Ürün sepetten çıkarıldı.');
      } catch (error) {
        toast.error('Çıkarma başarısız.');
      }
    } else {
      const localCart = JSON.parse(localStorage.getItem('pazara_cart') || '[]');
      const filtered = localCart.filter(i => i.id !== itemId);
      localStorage.setItem('pazara_cart', JSON.stringify(filtered));
      setCartItems(filtered);
      calculateTotal(filtered);
      toast.success('Ürün sepetten çıkarıldı.');
    }
  };

  // Sepeti temizle
  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await api.delete('/cart/clear');
        setCartItems([]);
        setCartTotal(0);
      } catch (error) {
        console.error(error);
      }
    } else {
      localStorage.removeItem('pazara_cart');
      setCartItems([]);
      setCartTotal(0);
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      cartTotal,
      cartCount,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export default CartContext;
