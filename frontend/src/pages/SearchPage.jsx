/**
 * Search Page - Arama Sayfası
 */
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!query) return;
    const search = async () => {
      setLoading(true);
      try {
        const [prodRes, foodRes] = await Promise.allSettled([
          api.get(`/products?search=${encodeURIComponent(query)}&limit=12`),
          api.get(`/food?search=${encodeURIComponent(query)}&limit=12`),
        ]);
        const products = prodRes.status === 'fulfilled' ? (prodRes.value.data.products || []).map(p => ({ ...p, item_type: 'product' })) : [];
        const foods = foodRes.status === 'fulfilled' ? (foodRes.value.data.foods || []).map(f => ({ ...f, item_type: 'food' })) : [];
        setResults([...products, ...foods]);
      } catch { } finally { setLoading(false); }
    };
    search();
  }, [query]);

  const demoResults = [
    { id: 1, name: 'Nike Air Max 270', price: 1299, item_type: 'product', shop_name: 'Nike Store', rating: 4.8, discount_percent: 19, images: [] },
    { id: 2, name: 'Margherita Pizza', price: 89, item_type: 'food', restaurant_name: 'Pizza Palace', rating: 4.7, discount_percent: 18, images: [] },
    { id: 3, name: 'Adidas Ultraboost', price: 2499, item_type: 'product', shop_name: 'Adidas', rating: 4.9, discount_percent: 17, images: [] },
    { id: 4, name: 'Samsung Galaxy S24', price: 29999, item_type: 'product', shop_name: 'Samsung', rating: 4.8, discount_percent: 14, images: [] },
  ];

  const displayResults = results.length > 0 ? results : (query ? demoResults : []);
  const filtered = filter === 'all' ? displayResults : displayResults.filter(r => r.item_type === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display text-gray-900">
          🔍 "{query}" için sonuçlar
        </h1>
        <p className="text-gray-500 text-sm mt-1">{filtered.length} sonuç bulundu</p>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: '🌟 Tümü' },
          { key: 'product', label: '🛍️ Ürünler' },
          { key: 'food', label: '🍔 Yemekler' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === tab.key ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-primary-50 border border-primary-100'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {!query ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-500">Arama yapmak için yukarıdaki arama çubuğunu kullanın</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton aspect-square rounded-2xl"></div>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sonuç bulunamadı</h2>
          <p className="text-gray-500">"{query}" için herhangi bir sonuç bulunamadı</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map(item => {
            const images = typeof item.images === 'string' ? JSON.parse(item.images || '[]') : (item.images || []);
            const imageUrl = images[0] || (item.item_type === 'food'
              ? `https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80`
              : `https://picsum.photos/seed/${item.id}/400/400`);
            return (
              <article key={`${item.item_type}-${item.id}`} className="product-card group" onClick={() => navigate(`/${item.item_type === 'product' ? 'urun' : 'yemek'}/${item.id}`)}>
                <div className="relative overflow-hidden aspect-square">
                  <img src={imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={e => { e.target.src = `https://picsum.photos/seed/${item.id + 10}/400/400`; }} />
                  {item.discount_percent > 0 && <span className="absolute top-2 left-2 discount-badge">-%{item.discount_percent}</span>}
                  <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-white/90 text-gray-600">{item.item_type === 'food' ? '🍔' : '🛍️'}</span>
                </div>
                <div className="p-3">
                  <p className="text-xs text-primary-500 font-medium mb-1">{item.shop_name || item.restaurant_name}</p>
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">{item.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="price-tag text-base">₺{parseFloat(item.price).toFixed(2)}</span>
                    <button onClick={e => { e.stopPropagation(); addToCart({ [item.item_type === 'product' ? 'product_id' : 'food_id']: item.id, item_type: item.item_type, unit_price: item.price, item_name: item.name }); }} className="w-8 h-8 bg-primary-600 text-white rounded-xl flex items-center justify-center hover:bg-primary-700 transition-all text-sm">+</button>
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

export default SearchPage;
