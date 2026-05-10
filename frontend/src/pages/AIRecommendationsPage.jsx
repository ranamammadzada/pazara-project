/**
 * AI Recommendations Page - AI Önerileri
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const AIRecommendationsPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await api.get('/ai/recommendations');
        if (res.data.success) setRecs(res.data.recommendations || []);
      } catch { } finally { setLoading(false); }
    };
    fetchRecs();
  }, []);

  const demoRecs = [
    { id: 1, name: 'Nike Air Max 270', price: 1299, rating: 4.8, item_type: 'product', category: 'giyim', reason: 'Spor kategorisinde en çok satılan', images: [], shop_name: 'Nike Store', discount_percent: 19 },
    { id: 2, name: 'Margherita Pizza', price: 89, rating: 4.7, item_type: 'food', category: 'yemek', reason: 'Bölgenizdeki en popüler yemek', images: [], restaurant_name: 'Pizza Palace', discount_percent: 18 },
    { id: 3, name: 'Samsung Galaxy S24', price: 29999, rating: 4.8, item_type: 'product', category: 'elektronik', reason: 'Elektronik kategorisinde trend', images: [], shop_name: 'Samsung', discount_percent: 14 },
    { id: 4, name: 'Zara Yazlık Elbise', price: 599, rating: 4.6, item_type: 'product', category: 'giyim', reason: 'Yaz koleksiyonundan özel seçim', images: [], shop_name: 'Zara', discount_percent: 25 },
    { id: 5, name: 'Sushi Set', price: 149, rating: 4.9, item_type: 'food', category: 'yemek', reason: 'Yüksek puanlı restoran', images: [], restaurant_name: 'Sushi World', discount_percent: 17 },
    { id: 6, name: 'Apple AirPods Pro', price: 3499, rating: 4.9, item_type: 'product', category: 'elektronik', reason: 'Kullanıcıların favorisi', images: [], shop_name: 'Apple', discount_percent: 13 },
    { id: 7, name: 'Adidas Ultraboost', price: 2499, rating: 4.9, item_type: 'product', category: 'giyim', reason: 'Koşu kategorisinde #1', images: [], shop_name: 'Adidas', discount_percent: 17 },
    { id: 8, name: 'Döner Kebap', price: 75, rating: 4.6, item_type: 'food', category: 'yemek', reason: 'Hızlı teslimat garantisi', images: [], restaurant_name: 'Kebapçı Mehmet', discount_percent: 16 },
  ];

  const displayRecs = recs.length > 0 ? recs : demoRecs;
  const filtered = category === 'all' ? displayRecs : displayRecs.filter(r => r.category === category || r.item_type === category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-400 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-pazara-lg animate-float">🤖</div>
        <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">{t('ai_recommendations')}</h1>
        <p className="text-gray-500">{user ? `${user.full_name || user.username} için özel AI seçimleri` : 'Yapay zeka destekli kişisel öneriler'}</p>
      </div>

      {/* AI Info Card */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-6 mb-8 text-white">
        <div className="flex items-center gap-4">
          <div className="text-4xl">🧠</div>
          <div>
            <h2 className="font-bold text-lg mb-1">Nasıl Çalışır?</h2>
            <p className="text-white/80 text-sm">AI asistanımız alışveriş geçmişinizi, favorilerinizi ve trend ürünleri analiz ederek size özel öneriler sunar.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {[
            { icon: '📊', label: 'Davranış Analizi' },
            { icon: '🔥', label: 'Trend Takibi' },
            { icon: '❤️', label: 'Kişisel Tercihler' },
          ].map(item => (
            <div key={item.label} className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-2xl mb-1">{item.icon}</p>
              <p className="text-xs font-medium">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
        {[
          { key: 'all', label: '🌟 Tümü' },
          { key: 'product', label: '🛍️ Ürünler' },
          { key: 'food', label: '🍔 Yemekler' },
          { key: 'giyim', label: '👗 Giyim' },
          { key: 'elektronik', label: '📱 Elektronik' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setCategory(tab.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${category === tab.key ? 'bg-primary-600 text-white shadow-pazara' : 'bg-white text-gray-600 hover:bg-primary-50 border border-primary-100'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-primary-50">
              <div className="skeleton aspect-square"></div>
              <div className="p-3 space-y-2">
                <div className="skeleton h-3 rounded w-1/2"></div>
                <div className="skeleton h-4 rounded w-3/4"></div>
                <div className="skeleton h-4 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map(item => {
            const images = typeof item.images === 'string' ? JSON.parse(item.images || '[]') : (item.images || []);
            const imageUrl = images[0] || (item.item_type === 'food'
              ? `https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80`
              : `https://picsum.photos/seed/${item.id}/400/400`);

            return (
              <article key={item.id} className="product-card group" onClick={() => navigate(`/${item.item_type === 'product' ? 'urun' : 'yemek'}/${item.id}`)}>
                <div className="relative overflow-hidden aspect-square">
                  <img src={imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={e => { e.target.src = `https://picsum.photos/seed/${item.id + 10}/400/400`; }} />
                  {item.discount_percent > 0 && <span className="absolute top-2 left-2 discount-badge">-%{item.discount_percent}</span>}
                  <div className="absolute top-2 right-2 bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">🤖 AI</div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-primary-500 font-medium mb-1">{item.shop_name || item.restaurant_name}</p>
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">{item.name}</h3>
                  {item.reason && <p className="text-xs text-gray-400 italic mb-2 line-clamp-1">💡 {item.reason}</p>}
                  <div className="flex items-center justify-between">
                    <span className="price-tag text-base">₺{parseFloat(item.price).toFixed(2)}</span>
                    <button
                      onClick={e => { e.stopPropagation(); addToCart({ [item.item_type === 'product' ? 'product_id' : 'food_id']: item.id, item_type: item.item_type, unit_price: item.price, item_name: item.name }); }}
                      className="w-8 h-8 bg-primary-600 text-white rounded-xl flex items-center justify-center hover:bg-primary-700 transition-all text-sm"
                    >+</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AIRecommendationsPage;
