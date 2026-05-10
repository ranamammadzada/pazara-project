/**
 * Hashtag Page - Hashtag Sayfası
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const HashtagPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [items, setItems] = useState([]);
  const [hashtag, setHashtag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedTags, setRelatedTags] = useState([]);

  useEffect(() => {
    const fetchHashtag = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/hashtags/${slug}`);
        if (res.data.success) {
          setHashtag(res.data.hashtag);
          setItems(res.data.items || []);
          setRelatedTags(res.data.related || []);
        }
      } catch { } finally { setLoading(false); }
    };
    fetchHashtag();
  }, [slug]);

  const demoItems = [
    { id: 1, name: 'Nike Air Max 270', price: 1299, item_type: 'product', shop_name: 'Nike Store', rating: 4.8, discount_percent: 19, images: [] },
    { id: 2, name: 'Adidas Ultraboost', price: 2499, item_type: 'product', shop_name: 'Adidas', rating: 4.9, discount_percent: 17, images: [] },
    { id: 3, name: 'Puma RS-X', price: 899, item_type: 'product', shop_name: 'Puma', rating: 4.6, discount_percent: 25, images: [] },
    { id: 4, name: 'New Balance 574', price: 1599, item_type: 'product', shop_name: 'New Balance', rating: 4.7, discount_percent: 15, images: [] },
  ];

  const demoRelated = ['#Spor', '#Ayakkabı', '#Trend2026', '#YazKoleksiyonu', '#İndirim'];

  const displayItems = items.length > 0 ? items : demoItems;
  const displayRelated = relatedTags.length > 0 ? relatedTags : demoRelated;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-8 mb-8 text-white text-center">
        <div className="text-5xl mb-3">🏷️</div>
        <h1 className="text-3xl font-bold font-display mb-2">#{slug}</h1>
        <p className="text-white/80">{hashtag?.usage_count?.toLocaleString() || '12.5K'} gönderi</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-white/80 text-sm">Trend</span>
        </div>
      </div>

      {/* Related Tags */}
      <div className="mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">İlgili Hashtagler</h2>
        <div className="flex flex-wrap gap-2">
          {displayRelated.map(tag => (
            <Link
              key={tag}
              to={`/hashtag/${(typeof tag === 'string' ? tag : tag.slug).replace('#', '')}`}
              className="hashtag text-sm"
            >
              {typeof tag === 'string' ? tag : tag.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Items */}
      <h2 className="font-semibold text-gray-900 mb-4">{displayItems.length} ürün</h2>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton aspect-square rounded-2xl"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {displayItems.map(item => {
            const images = typeof item.images === 'string' ? JSON.parse(item.images || '[]') : (item.images || []);
            const imageUrl = images[0] || `https://picsum.photos/seed/${item.id}/400/400`;
            return (
              <article key={item.id} className="product-card group" onClick={() => navigate(`/${item.item_type === 'product' ? 'urun' : 'yemek'}/${item.id}`)}>
                <div className="relative overflow-hidden aspect-square">
                  <img src={imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={e => { e.target.src = `https://picsum.photos/seed/${item.id + 10}/400/400`; }} />
                  {item.discount_percent > 0 && <span className="absolute top-2 left-2 discount-badge">-%{item.discount_percent}</span>}
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

export default HashtagPage;
