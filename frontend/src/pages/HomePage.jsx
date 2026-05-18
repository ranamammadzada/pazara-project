/**
 * HomePage - Ana Sayfa
 * Hero, Kategoriler, Trend Ürünler, Yemekler, AI Önerileri, Hashtagler
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
const productImages = {
  'Nike Air Max 270': 'https://images.pexels.com/photos/8979071/pexels-photo-8979071.jpeg',
  'Samsung Galaxy S24': 'https://images.pexels.com/photos/30466740/pexels-photo-30466740.jpeg',
  "Levi's 501 Jean": 'https://images.unsplash.com/photo-1542272604-787c3835535d',
  'Puma RS-X': 'https://images.pexels.com/photos/18202569/pexels-photo-18202569.jpeg',

  'Margherita Pizza': 'https://images.pexels.com/photos/27793841/pexels-photo-27793841.jpeg',
  'Cheeseburger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
  'Sushi Set': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c',
  'Döner Kebap': 'https://images.pexels.com/photos/8213047/pexels-photo-8213047.jpeg',
  'Apple AirPods Pro': 'https://images.pexels.com/photos/13034999/pexels-photo-13034999.jpeg',

'Zara Yazlık Elbise': 'https://images.pexels.com/photos/8441593/pexels-photo-8441593.jpeg',

'H&M Denim Ceket': 'https://images.pexels.com/photos/13662420/pexels-photo-13662420.jpeg',
'Adidas Ultraboost': 'https://images.pexels.com/photos/18188496/pexels-photo-18188496.jpeg',
'Çikolatalı Pasta': 'https://images.pexels.com/photos/37026352/pexels-photo-37026352.jpeg',

'Türk Kahvesi': 'https://images.pexels.com/photos/36823338/pexels-photo-36823338.jpeg',

'Kahvaltı Tabağı': 'https://images.pexels.com/photos/20002826/pexels-photo-20002826.jpeg',

'Sezar Salata': 'https://images.pexels.com/photos/1277481/pexels-photo-1277481.jpeg',
};

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ product, type = 'product' }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const images = typeof product.images === 'string' ? JSON.parse(product.images || '[]') : (product.images || []);
  const imageUrl = images[0] || productImages[product.name];
  const discount = product.discount_percent || 0;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart({
      [type === 'product' ? 'product_id' : 'food_id']: product.id,
      item_type: type,
      unit_price: product.price,
      item_name: product.name,
    });
  };

  return (
    <article
      className="product-card group"
      onClick={() => navigate(`/${type === 'product' ? 'urun' : 'yemek'}/${product.id}`)}
    >
      <div className="relative overflow-hidden aspect-square">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
          onError={(e) => { e.target.src = `https://picsum.photos/seed/${product.id + 10}/400/300`; }}
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 discount-badge">-%{discount}</span>
        )}
        {product.is_trending && (
          <span className="absolute top-2 right-2 badge-primary badge text-xs">🔥 Trend</span>
        )}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-2 right-2 w-9 h-9 bg-white rounded-xl shadow-pazara flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary-600 hover:text-white text-primary-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      <div className="p-3">
        <p className="text-xs text-primary-500 font-medium mb-1">{product.shop_name || product.restaurant_name || product.category_name}</p>
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">{product.name}</h3>
        <div className="flex items-center justify-between">
          <div>
            <span className="price-tag text-base">₺{parseFloat(product.price).toFixed(2)}</span>
            {product.original_price && parseFloat(product.original_price) > parseFloat(product.price) && (
              <span className="price-original ml-1 text-xs">₺{parseFloat(product.original_price).toFixed(2)}</span>
            )}
          </div>
          {product.rating > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 text-xs">⭐</span>
              <span className="text-xs text-gray-500">{parseFloat(product.rating).toFixed(1)}</span>
            </div>
          )}
        </div>
        {type === 'food' && product.preparation_time && (
          <p className="text-xs text-gray-400 mt-1">⏱ {product.preparation_time} dk</p>
        )}
      </div>
    </article>
  );
};

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ title, subtitle, viewAllLink }) => (
  <div className="flex items-end justify-between mb-6">
    <div>
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
    {viewAllLink && (
      <Link to={viewAllLink} className="text-primary-600 text-sm font-semibold hover:text-primary-700 flex items-center gap-1">
        Tümü
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    )}
  </div>
);

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-primary-50">
    <div className="skeleton aspect-square"></div>
    <div className="p-3 space-y-2">
      <div className="skeleton h-3 rounded w-1/2"></div>
      <div className="skeleton h-4 rounded w-3/4"></div>
      <div className="skeleton h-4 rounded w-1/3"></div>
    </div>
  </div>
);

// ─── Main HomePage ────────────────────────────────────────────────────────────
const HomePage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trendingProducts, setTrendingProducts] = useState([]);
  const [featuredFoods, setFeaturedFoods] = useState([]);
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [aiRecs, setAiRecs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);

  const heroSlides = [
    {
      title: 'Yaz Koleksiyonu',
      subtitle: 'En yeni trendler %50 indirimle',
      cta: 'Alışverişe Başla',
      link: '/kategori/giyim',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
      gradient: 'from-purple-900/80 via-primary-800/60 to-transparent',
    },
    {
      title: 'Lezzetli Yemekler',
      subtitle: 'Favori restoranlarından hızlı teslimat',
      cta: 'Sipariş Ver',
      link: '/kategori/yemek',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80',
      gradient: 'from-orange-900/80 via-red-800/60 to-transparent',
    },
    {
      title: 'Teknoloji Fırsatları',
      subtitle: 'En son elektronik ürünler',
      cta: 'Keşfet',
      link: '/kategori/elektronik',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&q=80',
      gradient: 'from-blue-900/80 via-indigo-800/60 to-transparent',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => setHeroIndex(i => (i + 1) % heroSlides.length), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, foodsRes, hashtagsRes, aiRes, catsRes] = await Promise.allSettled([
          api.get('/products?trending=true&limit=8'),
          api.get('/food?featured=true&limit=8'),
          api.get('/hashtags/trending'),
          api.get('/ai/recommendations'),
          api.get('/categories'),
        ]);

        if (productsRes.status === 'fulfilled') setTrendingProducts(demoItems || []);
        if (foodsRes.status === 'fulfilled') setFeaturedFoods(demoItems || []);
        if (hashtagsRes.status === 'fulfilled') setTrendingHashtags(hashtagsRes.value.data.hashtags || []);
        if (aiRes.status === 'fulfilled') setAiRecs(aiRes.value.data.recommendations || []);
        if (catsRes.status === 'fulfilled') setCategories(catsRes.value.data.categories || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const allCategories = [
    { name: 'Yemek', slug: 'yemek', icon: '🍔', color: 'from-orange-400 to-red-400' },
    { name: 'Giyim', slug: 'giyim', icon: '👗', color: 'from-pink-400 to-rose-400' },
    { name: 'Elektronik', slug: 'elektronik', icon: '📱', color: 'from-blue-400 to-indigo-400' },
    { name: 'Kozmetik', slug: 'kozmetik', icon: '💄', color: 'from-purple-400 to-pink-400' },
    { name: 'Spor', slug: 'spor', icon: '⚽', color: 'from-green-400 to-emerald-400' },
    { name: 'Ev & Yaşam', slug: 'ev-yasam', icon: '🏠', color: 'from-yellow-400 to-orange-400' },
    { name: 'Kitap', slug: 'kitap-hobi', icon: '📚', color: 'from-teal-400 to-cyan-400' },
    { name: 'Oyuncak', slug: 'oyuncak', icon: '🧸', color: 'from-amber-400 to-yellow-400' },
    { name: 'Otomotiv', slug: 'otomotiv', icon: '🚗', color: 'from-slate-400 to-gray-400' },
    { name: 'Bahçe', slug: 'bahce', icon: '🌱', color: 'from-lime-400 to-green-400' },
  ];

  return (
    <div className="min-h-screen">

      {/* ─── Hero Section ─────────────────────────────────────────────────────── */}
      <section className="relative h-[60vh] md:h-[75vh] overflow-hidden">
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === heroIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
          </div>
        ))}

        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-xl animate-fade-up">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-white text-sm font-medium">PazaRa'ya Hoş Geldiniz</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold font-display text-white mb-4 leading-tight">
                {heroSlides[heroIndex].title}
              </h1>
              <p className="text-white/90 text-lg md:text-xl mb-8">{heroSlides[heroIndex].subtitle}</p>
              <div className="flex flex-wrap gap-3">
                <Link to={heroSlides[heroIndex].link} className="btn-primary text-base px-8 py-3">
                  {heroSlides[heroIndex].cta}
                </Link>
                <Link to="/ai-onerileri" className="bg-white/20 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/30 transition-all border border-white/30">
                  🤖 AI Önerileri
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIndex(i)}
              className={`transition-all duration-300 rounded-full ${i === heroIndex ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/50'}`}
            />
          ))}
        </div>
      </section>

      {/* ─── Stats Bar ────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🏪', label: 'Satıcı', value: '10,000+' },
              { icon: '📦', label: 'Ürün', value: '500,000+' },
              { icon: '🍔', label: 'Restoran', value: '5,000+' },
              { icon: '⭐', label: 'Müşteri', value: '2M+' },
            ].map(stat => (
              <div key={stat.label} className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary-50 transition-all">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <p className="font-bold text-gray-900 text-lg leading-none">{stat.value}</p>
                  <p className="text-gray-500 text-xs">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

        {/* ─── Categories ───────────────────────────────────────────────────────── */}
        <section>
          <SectionHeader title="Kategoriler" subtitle="İstediğin her şey burada" />
          <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
            {allCategories.map(cat => (
              <Link
                key={cat.slug}
                to={`/kategori/${cat.slug}`}
                className="category-chip group"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${cat.color} rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  {cat.icon}
                </div>
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── Trending Hashtags ────────────────────────────────────────────────── */}
        {trendingHashtags.length > 0 && (
          <section>
            <SectionHeader title="🔥 Trend Hashtagler" subtitle="En popüler etiketler" />
            <div className="flex flex-wrap gap-2">
              {trendingHashtags.map(tag => (
                <Link key={tag.id} to={`/hashtag/${tag.slug}`} className="hashtag-trending">
                  {tag.name}
                  <span className="text-xs text-primary-400 ml-1">{(tag.usage_count / 1000).toFixed(1)}K</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── AI Recommendations ───────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-3xl p-6 border border-primary-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-400 rounded-2xl flex items-center justify-center text-2xl shadow-pazara">🤖</div>
            <div>
              <h2 className="section-title">{t('ai_recommendations')}</h2>
              <p className="section-subtitle">{user ? `${user.full_name || user.username} için özel seçimler` : 'Sizin için en popüler ürünler'}</p>
            </div>
            <Link to="/ai-onerileri" className="ml-auto btn-secondary text-sm py-2 px-4">Tümünü Gör</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {loading ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />) :
              aiRecs.slice(0, 4).map(p => <ProductCard key={p.id} product={p} type={p.item_type || 'product'} />)
            }
          </div>
        </section>

        {/* ─── Trending Products ────────────────────────────────────────────────── */}
        <section>
          <SectionHeader title={`🔥 ${t('trending')}`} subtitle="En çok satılan ürünler" viewAllLink="/kategori/giyim" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {loading ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />) :
              trendingProducts.length > 0
                ? trendingProducts.map(p => <ProductCard key={p.id} product={p} type="product" />)
                : (
                  // Demo products when no data
                  Array(8).fill(0).map((_, i) => ({
                    id: i + 1,
                    name: ['Nike Air Max 270', 'Adidas Ultraboost', 'Zara Yazlık Elbise', 'H&M Denim Ceket', 'Apple AirPods Pro', 'Samsung Galaxy S24', 'Levi\'s 501 Jean', 'Puma RS-X'][i],
                    price: [1299, 2499, 599, 799, 3499, 29999, 1199, 899][i],
                    original_price: [1599, 2999, 799, 999, 3999, 34999, 1499, 1199][i],
                    discount_percent: [19, 17, 25, 20, 13, 14, 20, 25][i],
                    rating: [4.8, 4.9, 4.6, 4.5, 4.9, 4.8, 4.7, 4.6][i],
                    is_trending: true,
                    images: [],
                    shop_name: ['Nike Store', 'Adidas', 'Zara', 'H&M', 'Apple', 'Samsung', 'Levi\'s', 'Puma'][i],
                  })).map(p => <ProductCard key={p.id} product={p} type="product" />)
                )
            }
          </div>
        </section>

        {/* ─── Food Section ─────────────────────────────────────────────────────── */}
        <section>
          <SectionHeader title={`🍔 ${t('popular_restaurants')}`} subtitle="Hızlı ve lezzetli teslimat" viewAllLink="/kategori/yemek" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {loading ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />) :
              featuredFoods.length > 0
                ? featuredFoods.map(f => <ProductCard key={f.id} product={f} type="food" />)
                : (
                  Array(8).fill(0).map((_, i) => ({
                    id: i + 100,
                    name: ['Margherita Pizza', 'Cheeseburger', 'Sushi Set', 'Döner Kebap', 'Çikolatalı Pasta', 'Türk Kahvesi', 'Kahvaltı Tabağı', 'Sezar Salata'][i],
                    price: [89, 65, 149, 75, 45, 25, 120, 55][i],
                    original_price: [109, 79, 179, 89, 55, 30, 140, 65][i],
                    discount_percent: [18, 18, 17, 16, 18, 17, 14, 15][i],
                    rating: [4.7, 4.8, 4.9, 4.6, 4.5, 4.8, 4.7, 4.6][i],
                    preparation_time: [25, 15, 30, 20, 10, 5, 20, 10][i],
                    images: [],
                    restaurant_name: ['Pizza Palace', 'Burger King', 'Sushi World', 'Kebapçı Mehmet', 'Pasta Evi', 'Kahve Dünyası', 'Kahvaltı Evi', 'Salata Bar'][i],
                  })).map(f => <ProductCard key={f.id} product={f} type="food" />)
                )
            }
          </div>
        </section>

        {/* ─── Fashion Banner ───────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative rounded-3xl overflow-hidden h-48 md:h-64 group cursor-pointer" onClick={() => navigate('/kategori/kadin-giyim')}>
            <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80" alt="Kadın Giyim" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-pink-900/70 to-transparent flex items-center p-6">
              <div>
                <p className="text-pink-200 text-sm font-medium mb-1">Yeni Sezon</p>
                <h3 className="text-white text-2xl font-bold font-display mb-3">Kadın Giyim</h3>
                <span className="bg-white text-pink-600 text-sm font-semibold px-4 py-2 rounded-xl">Keşfet →</span>
              </div>
            </div>
          </div>
          <div className="relative rounded-3xl overflow-hidden h-48 md:h-64 group cursor-pointer" onClick={() => navigate('/kategori/erkek-giyim')}>
            <img src="https://images.pexels.com/photos/32770731/pexels-photo-32770731.jpeg" alt="Erkek Giyim" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-transparent flex items-center p-6">
              <div>
                <p className="text-blue-200 text-sm font-medium mb-1">Yeni Koleksiyon</p>
                <h3 className="text-white text-2xl font-bold font-display mb-3">Erkek Giyim</h3>
                <span className="bg-white text-blue-600 text-sm font-semibold px-4 py-2 rounded-xl">Keşfet →</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Features ─────────────────────────────────────────────────────────── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🚚', title: 'Ücretsiz Kargo', desc: '150₺ üzeri siparişlerde' },
            { icon: '🔄', title: 'Kolay İade', desc: '30 gün içinde ücretsiz' },
            { icon: '🔒', title: 'Güvenli Ödeme', desc: '256-bit SSL şifreleme' },
            { icon: '🤖', title: 'AI Destek', desc: '7/24 akıllı asistan' },
          ].map(f => (
            <div key={f.title} className="glass-card p-4 text-center hover:shadow-pazara transition-all duration-300">
              <span className="text-3xl mb-2 block">{f.icon}</span>
              <h3 className="font-semibold text-gray-900 text-sm">{f.title}</h3>
              <p className="text-gray-500 text-xs mt-1">{f.desc}</p>
            </div>
          ))}
        </section>

      </div>
    </div>
  );
};

export default HomePage;
