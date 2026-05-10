/**
 * Food Detail Page - Yemek Detay Sayfası
 */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const FoodDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const res = await api.get(`/food/${id}`);
        if (res.data.success) setFood(res.data.food);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchFood();
  }, [id]);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="skeleton h-64 rounded-3xl mb-6"></div>
      <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-8 rounded-xl"></div>)}</div>
    </div>
  );

  const f = food || {
    id: parseInt(id),
    name: 'Margherita Pizza',
    description: 'Taze domates sosu, mozzarella peyniri ve fesleğen ile hazırlanan klasik İtalyan pizzası.',
    price: 89,
    original_price: 109,
    discount_percent: 18,
    rating: 4.7,
    review_count: 156,
    preparation_time: 25,
    calories: 850,
    images: [],
    restaurant_name: 'Pizza Palace',
    is_available: true,
    ingredients: ['Domates sosu', 'Mozzarella', 'Fesleğen', 'Zeytinyağı'],
    allergens: ['Gluten', 'Süt ürünleri'],
  };

  const images = typeof f.images === 'string' ? JSON.parse(f.images || '[]') : (f.images || []);
  const imageUrl = images[0] || `https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80`;

  const handleAddToCart = () => {
    addToCart({ food_id: f.id, item_type: 'food', unit_price: f.price, item_name: f.name, quantity, notes });
    toast.success('Sepete eklendi! 🍔');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600">Ana Sayfa</Link>
        <span>/</span>
        <Link to="/kategori/yemek" className="hover:text-primary-600">Yemek</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{f.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="aspect-square rounded-3xl overflow-hidden">
          <img src={imageUrl} alt={f.name} className="w-full h-full object-cover" onError={e => { e.target.src = `https://picsum.photos/seed/${f.id + 100}/600/600`; }} />
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div>
            <p className="text-orange-500 font-medium text-sm mb-1">🍽️ {f.restaurant_name}</p>
            <h1 className="text-2xl font-bold font-display text-gray-900">{f.name}</h1>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">⭐</span>
              <span className="font-semibold">{parseFloat(f.rating || 0).toFixed(1)}</span>
              <span className="text-gray-500">({f.review_count || 0})</span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">⏱ {f.preparation_time} dk</span>
            {f.calories && <><span className="text-gray-400">•</span><span className="text-gray-600">🔥 {f.calories} kcal</span></>}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-primary-600">₺{parseFloat(f.price).toFixed(2)}</span>
            {f.original_price && parseFloat(f.original_price) > parseFloat(f.price) && (
              <>
                <span className="text-lg text-gray-400 line-through">₺{parseFloat(f.original_price).toFixed(2)}</span>
                <span className="discount-badge">-%{f.discount_percent}</span>
              </>
            )}
          </div>

          <p className="text-gray-600 text-sm leading-relaxed">{f.description}</p>

          {/* Ingredients */}
          {f.ingredients && (
            <div>
              <p className="font-semibold text-sm text-gray-900 mb-2">İçindekiler:</p>
              <div className="flex flex-wrap gap-2">
                {(typeof f.ingredients === 'string' ? JSON.parse(f.ingredients || '[]') : f.ingredients).map(ing => (
                  <span key={ing} className="px-2 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs border border-orange-100">{ing}</span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Özel Not (isteğe bağlı)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Örn: Az baharatlı, soğansız..." className="input-field resize-none h-20 text-sm" />
          </div>

          {/* Quantity + Add */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-primary-50 rounded-xl p-1.5">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center text-primary-600 hover:bg-primary-100 rounded-lg font-bold">−</button>
              <span className="w-10 text-center font-semibold">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center text-primary-600 hover:bg-primary-100 rounded-lg font-bold">+</button>
            </div>
            <button onClick={handleAddToCart} disabled={!f.is_available} className="btn-primary flex-1 justify-center flex items-center gap-2">
              🛒 Sepete Ekle — ₺{(parseFloat(f.price) * quantity).toFixed(2)}
            </button>
          </div>

          {!f.is_available && <p className="text-red-500 text-sm text-center">Bu ürün şu an mevcut değil.</p>}
        </div>
      </div>
    </div>
  );
};

export default FoodDetailPage;
