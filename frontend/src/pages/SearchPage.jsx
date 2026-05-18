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
        const allProducts = [

  ...products,
  ...foods

];

const filtered = demoResults.filter(item =>
  item.name?.toLowerCase().includes(query.toLowerCase()) ||
  item.shop_name?.toLowerCase().includes(query.toLowerCase()) ||
  item.restaurant_name?.toLowerCase().includes(query.toLowerCase())
);



setResults(filtered);
      } catch { } finally { setLoading(false); }
    };
    search();
  }, [query]);

  const demoResults = [
  {
    id: 1,
    name: 'iPhone 15',
    shop_name: 'Apple',
    image: 'https://images.pexels.com/photos/16718604/pexels-photo-16718604.jpeg',
    item_type: 'product',
    price: 1299
  },
  {
    id: 2,
    name: 'Samsung S24',
    shop_name: 'Samsung',
    image: 'https://images.pexels.com/photos/30466740/pexels-photo-30466740.jpeg',
    item_type: 'product',
    price: 2499
  },
  {
    id: 3,
    name: 'MacBook Air',
    shop_name: 'Apple',
    image: 'https://images.pexels.com/photos/2148217/pexels-photo-2148217.jpeg',
    item_type: 'product',
    price: 3999
  },
  {
    id: 4,
    name: 'Nike Air Max',
    shop_name: 'Nike',
    image: 'https://images.pexels.com/photos/13034999/pexels-photo-13034999.jpeg',
    item_type: 'product',
    price: 1199
  },
  {
    id: 5,
    name: 'Adidas Ultraboost',
    shop_name: 'Adidas',
    image: 'https://images.pexels.com/photos/18188496/pexels-photo-18188496.jpeg',
    item_type: 'product',
    price: 899
  },
  {
    id: 6,
    name: 'Margherita Pizza',
    restaurant_name: 'Pizza Palace',
    image: 'https://images.pexels.com/photos/27793841/pexels-photo-27793841.jpeg',
    item_type: 'food',
    price: 89
  },
  {
    id: 7,
    name: 'Cheeseburger',
    restaurant_name: 'Burger King',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
    item_type: 'food',
    price: 65
  },
  {
    id: 8,
    name: 'Parfüm',
    shop_name: 'Chanel',
    image: 'https://images.pexels.com/photos/22589359/pexels-photo-22589359.jpeg',
    item_type: 'product',
    price: 349
  },
  {
    id: 9,
    name: 'Ruj Seti',
    shop_name: 'Maybelline',
    image: 'https://images.pexels.com/photos/25533534/pexels-photo-25533534.jpeg',
    item_type: 'product',
    price: 199
  
  }
];

  const displayResults = results;
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
            const imageUrl = item.image;
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
