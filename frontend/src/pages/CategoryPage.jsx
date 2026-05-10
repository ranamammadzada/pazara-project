/**
 * Category Page - Kategori Sayfası
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('popular');
  const [priceRange, setPriceRange] = useState([0, 50000]);

  const isFood = slug === 'yemek';

  const categoryNames = {
    'yemek': '🍔 Yemek', 'giyim': '👗 Giyim', 'elektronik': '📱 Elektronik',
    'kozmetik': '💄 Kozmetik', 'spor': '⚽ Spor', 'ev-yasam': '🏠 Ev & Yaşam',
    'kitap-hobi': '📚 Kitap & Hobi', 'oyuncak': '🧸 Oyuncak',
    'kadin-giyim': '👗 Kadın Giyim', 'erkek-giyim': '👔 Erkek Giyim',
  };

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const endpoint = isFood ? `/food?limit=20` : `/products?category=${slug}&limit=20`;
        const res = await api.get(endpoint);
        if (res.data.success) setItems(isFood ? (res.data.foods || []) : (res.data.products || []));
      } catch { } finally { setLoading(false); }
    };
    fetchItems();
  }, [slug]);

  // Demo items
  const demoItems = Array(12).fill(0).map((_, i) => ({
    id: i + 1,
    name: isFood
      ? ['Margherita Pizza', 'Cheeseburger', 'Sushi Set', 'Döner Kebap', 'Çikolatalı Pasta', 'Türk Kahvesi', 'Kahvaltı Tabağı', 'Sezar Salata', 'Tavuk Wrap', 'Lahmacun', 'Pide', 'Baklava'][i]
      : ['Nike Air Max', 'Adidas Ultraboost', 'Zara Elbise', 'H&M Ceket', 'Levi\'s Jean', 'Puma Sneaker', 'Mango Bluz', 'Bershka Etek', 'Pull&Bear Hoodie', 'Stradivarius Elbise', 'Koton Gömlek', 'LC Waikiki Pantolon'][i],
    price: isFood ? [89, 65, 149, 75, 45, 25, 120, 55, 70, 35, 40, 60][i] : [1299, 2499, 599, 799, 1199, 899, 349, 449, 599, 399, 299, 249][i],
    original_price: isFood ? [109, 79, 179, 89, 55, 30, 140, 65, 85, 42, 48, 72][i] : [1599, 2999, 799, 999, 1499, 1199, 449, 549, 749, 499, 399, 349][i],
    discount_percent: [18, 18, 17, 16, 18, 17, 14, 15, 18, 17, 17, 17][i],
    rating: [4.7, 4.8, 4.9, 4.6, 4.5, 4.8, 4.7, 4.6, 4.5, 4.7, 4.6, 4.8][i],
    images: [],
    shop_name: isFood ? null : ['Nike', 'Adidas', 'Zara', 'H&M', 'Levi\'s', 'Puma', 'Mango', 'Bershka', 'Pull&Bear', 'Stradivarius', 'Koton', 'LC Waikiki'][i],
    restaurant_name: isFood ? ['Pizza Palace', 'Burger King', 'Sushi World', 'Kebapçı', 'Pasta Evi', 'Kahve Dünyası', 'Kahvaltı Evi', 'Salata Bar', 'Wrap House', 'Lahmacuncu', 'Pide Evi', 'Tatlıcı'][i] : null,
    preparation_time: isFood ? [25, 15, 30, 20, 10, 5, 20, 10, 15, 12, 18, 8][i] : null,
    is_trending: i < 4,
  }));

  const displayItems = items.length > 0 ? items : demoItems;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-display text-gray-900">{categoryNames[slug] || slug}</h1>
        <span className="text-gray-500 text-sm">{displayItems.length} ürün</span>
      </div>

      {/* Sort */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
        {[
          { key: 'popular', label: '🔥 Popüler' },
          { key: 'newest', label: '✨ Yeni' },
          { key: 'price_asc', label: '💰 Ucuzdan Pahalıya' },
          { key: 'price_desc', label: '💎 Pahalıdan Ucuza' },
          { key: 'rating', label: '⭐ En Yüksek Puan' },
        ].map(s => (
          <button key={s.key} onClick={() => setSort(s.key)} className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${sort === s.key ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-primary-50 border border-primary-100'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-primary-50">
              <div className="skeleton aspect-square"></div>
              <div className="p-3 space-y-2">
                <div className="skeleton h-3 rounded w-1/2"></div>
                <div className="skeleton h-4 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {displayItems.map(item => {
            const images = typeof item.images === 'string' ? JSON.parse(item.images || '[]') : (item.images || []);
            const imageUrl = images[0] || (isFood
              ? `https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80`
              : `https://picsum.photos/seed/${item.id}/400/400`);

            return (
              <article key={item.id} className="product-card group" onClick={() => navigate(`/${isFood ? 'yemek' : 'urun'}/${item.id}`)}>
                <div className="relative overflow-hidden aspect-square">
                  <img src={imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={e => { e.target.src = `https://picsum.photos/seed/${item.id + 10}/400/400`; }} />
                  {item.discount_percent > 0 && <span className="absolute top-2 left-2 discount-badge">-%{item.discount_percent}</span>}
                  {item.is_trending && <span className="absolute top-2 right-2 badge-primary badge text-xs">🔥</span>}
                  <button onClick={e => { e.stopPropagation(); addToCart({ [isFood ? 'food_id' : 'product_id']: item.id, item_type: isFood ? 'food' : 'product', unit_price: item.price, item_name: item.name }); }} className="absolute bottom-2 right-2 w-9 h-9 bg-white rounded-xl shadow-pazara flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-primary-600 hover:text-white text-primary-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-xs text-primary-500 font-medium mb-1">{item.shop_name || item.restaurant_name}</p>
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">{item.name}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="price-tag text-base">₺{parseFloat(item.price).toFixed(2)}</span>
                      {item.original_price && <span className="price-original ml-1 text-xs">₺{parseFloat(item.original_price).toFixed(2)}</span>}
                    </div>
                    {item.rating > 0 && <div className="flex items-center gap-1"><span className="text-yellow-400 text-xs">⭐</span><span className="text-xs text-gray-500">{parseFloat(item.rating).toFixed(1)}</span></div>}
                  </div>
                  {isFood && item.preparation_time && <p className="text-xs text-gray-400 mt-1">⏱ {item.preparation_time} dk</p>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
