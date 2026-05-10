/**
 * Cart Page - Sepet Sayfası
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const CartPage = () => {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [placing, setPlacing] = useState(false);

  const deliveryFee = cartTotal > 150 ? 0 : 29.99;
  const finalTotal = cartTotal + deliveryFee - discount;

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'PAZARA10') { setDiscount(cartTotal * 0.1); toast.success('%10 indirim uygulandı! 🎉'); }
    else toast.error('Geçersiz kupon kodu.');
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) { navigate('/giris'); return; }
    setPlacing(true);
    try {
      const response = await api.post('/orders', {
        delivery_address: 'Varsayılan Adres',
        payment_method: 'credit_card',
        notes: ''
      });
      if (response.data.success) {
        await clearCart();
        toast.success('Siparişiniz alındı! 🎉');
        navigate('/siparisler');
      }
    } catch { toast.error('Sipariş oluşturulamadı.'); }
    finally { setPlacing(false); }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-8xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('cart_empty')}</h2>
        <p className="text-gray-500 mb-8">{t('cart_empty_desc')}</p>
        <Link to="/" className="btn-primary inline-flex">{t('continue_shopping')}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold font-display text-gray-900 mb-8">🛒 {t('cart')} ({cartItems.length} ürün)</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(item => (
            <div key={item.id} className="glass-card p-4 flex gap-4">
              <img
                src={item.image_url || `https://picsum.photos/seed/${item.id}/100/100`}
                alt={item.item_name || item.name}
                className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                onError={e => { e.target.src = `https://picsum.photos/seed/${item.id + 5}/100/100`; }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{item.item_name || item.name}</h3>
                <p className="text-primary-600 font-bold mt-1">₺{parseFloat(item.unit_price).toFixed(2)}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-2 bg-primary-50 rounded-xl p-1">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-primary-600 hover:bg-primary-100 rounded-lg transition-all font-bold">−</button>
                    <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-primary-600 hover:bg-primary-100 rounded-lg transition-all font-bold">+</button>
                  </div>
                  <span className="text-sm font-bold text-gray-900">₺{(parseFloat(item.unit_price) * item.quantity).toFixed(2)}</span>
                </div>
              </div>
              <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 transition-colors p-1 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
          <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
            🗑️ Sepeti Temizle
          </button>
        </div>

        {/* Order Summary */}
        <aside className="lg:col-span-1">
          <div className="glass-card p-6 sticky top-20">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Sipariş Özeti</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">{t('subtotal')}</span><span className="font-medium">₺{cartTotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">{t('delivery_fee')}</span><span className={deliveryFee === 0 ? 'text-green-600 font-medium' : 'font-medium'}>{deliveryFee === 0 ? 'Ücretsiz 🎉' : `₺${deliveryFee.toFixed(2)}`}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>İndirim</span><span>-₺{discount.toFixed(2)}</span></div>}
              <div className="border-t border-primary-100 pt-3 flex justify-between font-bold text-base">
                <span>{t('total')}</span><span className="text-primary-600">₺{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon */}
            <div className="mt-4 flex gap-2">
              <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder={t('coupon')} className="input-field text-xs py-2 flex-1" />
              <button onClick={applyCoupon} className="btn-secondary text-xs py-2 px-3 flex-shrink-0">{t('apply')}</button>
            </div>

            <button onClick={handleCheckout} disabled={placing} className="btn-primary w-full mt-4 justify-center flex items-center gap-2">
              {placing ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> İşleniyor...</> : `${t('checkout')} →`}
            </button>

            {!isAuthenticated && (
              <p className="text-xs text-center text-gray-500 mt-3">Sipariş vermek için <Link to="/giris" className="text-primary-600 font-medium">giriş yapın</Link></p>
            )}

            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
              <span>🔒 Güvenli Ödeme</span>
              <span>🚚 Hızlı Teslimat</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CartPage;
