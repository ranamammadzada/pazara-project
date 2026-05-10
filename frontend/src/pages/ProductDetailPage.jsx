/**
 * Product Detail Page - Ürün Detay Sayfası
 */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [prodRes, revRes] = await Promise.allSettled([
          api.get(`/products/${id}`),
          api.get(`/reviews/product/${id}`)
        ]);
        if (prodRes.status === 'fulfilled') setProduct(prodRes.value.data.product);
        if (revRes.status === 'fulfilled') setReviews(revRes.value.data.reviews || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="skeleton aspect-square rounded-2xl"></div>
        <div className="space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-8 rounded-xl"></div>)}
        </div>
      </div>
    </div>
  );

  // Demo product if not found
  const p = product || {
    id: parseInt(id),
    name: 'Nike Air Max 270',
    description: 'Nike Air Max 270, maksimum konfor ve stil için tasarlanmış modern bir spor ayakkabıdır. Büyük Air birimi ile olağanüstü yumuşaklık sunar.',
    price: 1299,
    original_price: 1599,
    discount_percent: 19,
    rating: 4.8,
    review_count: 234,
    sold_count: 1520,
    stock_quantity: 45,
    images: [],
    shop_name: 'Nike Store',
    hashtags: ['#Nike', '#AirMax', '#Spor', '#Ayakkabı'],
    is_trending: true,
  };

  const images = typeof p.images === 'string' ? JSON.parse(p.images || '[]') : (p.images || []);
  const displayImages = images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519',
'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
  ];

  const handleAddToCart = () => {
    addToCart({ product_id: p.id, item_type: 'product', unit_price: p.price, item_name: p.name, quantity });
  };

  const toggleFav = async () => {
    try {
      await api.post('/favorites/toggle', { product_id: p.id, item_type: 'product' });
      setIsFav(!isFav);
      toast.success(isFav ? 'Favorilerden çıkarıldı.' : 'Favorilere eklendi! ❤️');
    } catch { toast.error('Giriş yapmanız gerekiyor.'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600">Ana Sayfa</Link>
        <span>/</span>
        <Link to="/kategori/giyim" className="hover:text-primary-600">Giyim</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{p.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-3xl overflow-hidden bg-primary-50">
            <img src={displayImages[selectedImage]} alt={p.name} className="w-full h-full object-cover" onError={e => { e.target.src = `https://picsum.photos/seed/${p.id}/600/600`; }} />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {displayImages.map((img, i) => (
              <button key={i} onClick={() => setSelectedImage(i)} className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === selectedImage ? 'border-primary-500' : 'border-transparent'}`}>
                <img src={img} alt="" className="w-full h-full object-cover" onError={e => { e.target.src = `https://picsum.photos/seed/${p.id + i}/100/100`; }} />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <p className="text-primary-600 font-medium text-sm mb-1">{p.shop_name}</p>
            <h1 className="text-2xl md:text-3xl font-bold font-display text-gray-900">{p.name}</h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(s => <span key={s} className={s <= Math.round(p.rating || 0) ? 'star-filled' : 'star-empty'}>⭐</span>)}
            </div>
            <span className="font-semibold text-gray-900">{parseFloat(p.rating || 0).toFixed(1)}</span>
            <span className="text-gray-500 text-sm">({p.review_count || 0} {t('reviews')})</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500 text-sm">{p.sold_count || 0} {t('sold')}</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-primary-600">₺{parseFloat(p.price).toFixed(2)}</span>
            {p.original_price && parseFloat(p.original_price) > parseFloat(p.price) && (
              <>
                <span className="text-lg text-gray-400 line-through">₺{parseFloat(p.original_price).toFixed(2)}</span>
                <span className="discount-badge">-%{p.discount_percent}</span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${(p.stock_quantity || 0) > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className={`text-sm font-medium ${(p.stock_quantity || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(p.stock_quantity || 0) > 0 ? `${t('in_stock')} (${p.stock_quantity} adet)` : t('out_of_stock')}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed">{p.description}</p>

          {/* Hashtags */}
          {p.hashtags && (
            <div className="flex flex-wrap gap-2">
              {(typeof p.hashtags === 'string' ? JSON.parse(p.hashtags || '[]') : p.hashtags).map(tag => (
                <Link key={tag} to={`/hashtag/${tag.replace('#', '')}`} className="hashtag text-xs">{tag}</Link>
              ))}
            </div>
          )}

          {/* Quantity + Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-primary-50 rounded-xl p-1.5">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center text-primary-600 hover:bg-primary-100 rounded-lg font-bold">−</button>
              <span className="w-10 text-center font-semibold">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center text-primary-600 hover:bg-primary-100 rounded-lg font-bold">+</button>
            </div>
            <button onClick={handleAddToCart} className="btn-primary flex-1 justify-center flex items-center gap-2">
              🛒 {t('add_to_cart')}
            </button>
            <button onClick={toggleFav} className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${isFav ? 'bg-red-50 border-red-200 text-red-500' : 'border-primary-200 text-gray-400 hover:border-red-300 hover:text-red-400'}`}>
              {isFav ? '❤️' : '🤍'}
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '🚚', text: t('free_shipping') },
              { icon: '🔄', text: '30 gün iade' },
              { icon: '🔒', text: 'Güvenli ödeme' },
              { icon: '⭐', text: 'Orijinal ürün' },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-2 text-sm text-gray-600">
                <span>{f.icon}</span><span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-12">
        <h2 className="section-title mb-6">Müşteri Yorumları ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-gray-500">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="glass-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-sm font-bold text-primary-600">
                    {review.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{review.username}</p>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(s => <span key={s} className={`text-xs ${s <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`}>⭐</span>)}
                    </div>
                  </div>
                  {review.is_verified_purchase && <span className="ml-auto badge-success badge text-xs">✓ Doğrulanmış Alım</span>}
                </div>
                <p className="text-sm text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductDetailPage;
