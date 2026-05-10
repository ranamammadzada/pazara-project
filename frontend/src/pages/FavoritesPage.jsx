/**
 * Favorites Page - Favoriler
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const FavoritesPage = () => {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await api.get('/favorites');
        if (res.data.success) setFavorites(res.data.favorites || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchFavorites();
  }, []);

  const removeFavorite = async (id, itemType, itemId) => {
    try {
      await api.post('/favorites/toggle', { [itemType === 'product' ? 'product_id' : 'food_id']: itemId, item_type: itemType });
      setFavorites(prev => prev.filter(f => f.id !== id));
      toast.success('Favorilerden çıkarıldı.');
    } catch { toast.error('Hata oluştu.'); }
  };

  const demoFavorites = [
    { id: 1, item_type: 'product', product_id: 1, name: 'Nike Air Max 270', price: 1299, image_url: 'https://picsum.photos/seed/1/300/300', shop_name: 'Nike Store', rating: 4.8 },
    { id: 2, item_type: 'food', food_id: 101, name: 'Margherita Pizza', price: 89, image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80', restaurant_name: 'Pizza Palace', rating: 4.7 },
    { id: 3, item_type: 'product', product_id: 2, name: 'Adidas Ultraboost', price: 2499, image_url: 'https://picsum.photos/seed/2/300/300', shop_name: 'Adidas', rating: 4.9 },
  ];

  const displayFavorites = favorites.length > 0 ? favorites : demoFavorites;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold font-display text-gray-900 mb-8">❤️ {t('favorites')} ({displayFavorites.length})</h1>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton aspect-square rounded-2xl"></div>)}
        </div>
      ) : displayFavorites.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🤍</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Favori listeniz boş</h2>
          <p className="text-gray-500 mb-6">Beğendiğiniz ürünleri favorilere ekleyin</p>
          <Link to="/" className="btn-primary inline-flex">Keşfet</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {displayFavorites.map(fav => (
            <article key={fav.id} className="product-card group relative">
              <div
                className="aspect-square overflow-hidden cursor-pointer"
                onClick={() => navigate(`/${fav.item_type === 'product' ? 'urun' : 'yemek'}/${fav.product_id || fav.food_id}`)}
              >
                <img
                  src={fav.image_url || `https://picsum.photos/seed/${fav.id}/300/300`}
                  alt={fav.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={e => { e.target.src = `https://picsum.photos/seed/${fav.id + 5}/300/300`; }}
                />
                <button
                  onClick={e => { e.stopPropagation(); removeFavorite(fav.id, fav.item_type, fav.product_id || fav.food_id); }}
                  className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 transition-all"
                >
                  ❤️
                </button>
              </div>
              <div className="p-3">
                <p className="text-xs text-primary-500 font-medium mb-1">{fav.shop_name || fav.restaurant_name}</p>
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">{fav.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="price-tag text-base">₺{parseFloat(fav.price).toFixed(2)}</span>
                  <button
                    onClick={() => addToCart({ [fav.item_type === 'product' ? 'product_id' : 'food_id']: fav.product_id || fav.food_id, item_type: fav.item_type, unit_price: fav.price, item_name: fav.name })}
                    className="w-8 h-8 bg-primary-600 text-white rounded-xl flex items-center justify-center hover:bg-primary-700 transition-all text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
