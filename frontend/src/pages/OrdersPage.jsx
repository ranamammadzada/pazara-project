/**
 * Orders Page - Siparişler
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const statusConfig = {
  pending: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
  confirmed: { label: 'Onaylandı', color: 'bg-blue-100 text-blue-700', icon: '✅' },
  preparing: { label: 'Hazırlanıyor', color: 'bg-orange-100 text-orange-700', icon: '👨‍🍳' },
  shipping: { label: 'Kargoda', color: 'bg-purple-100 text-purple-700', icon: '🚚' },
  delivered: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-700', icon: '✓' },
  cancelled: { label: 'İptal Edildi', color: 'bg-red-100 text-red-700', icon: '✗' },
};

const OrdersPage = () => {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        if (res.data.success) setOrders(res.data.orders || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const demoOrders = [
    { id: 1, order_number: 'PZR-2026-001', status: 'delivered', total_amount: 1299, created_at: '2026-05-01', items_count: 2 },
    { id: 2, order_number: 'PZR-2026-002', status: 'shipping', total_amount: 89, created_at: '2026-05-08', items_count: 1 },
    { id: 3, order_number: 'PZR-2026-003', status: 'preparing', total_amount: 599, created_at: '2026-05-10', items_count: 3 },
  ];

  const displayOrders = orders.length > 0 ? filtered : demoOrders;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold font-display text-gray-900 mb-8">📦 {t('orders')}</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
        {[
          { key: 'all', label: 'Tümü' },
          { key: 'pending', label: 'Beklemede' },
          { key: 'shipping', label: 'Kargoda' },
          { key: 'delivered', label: 'Teslim Edildi' },
          { key: 'cancelled', label: 'İptal' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === tab.key ? 'bg-primary-600 text-white shadow-pazara' : 'bg-white text-gray-600 hover:bg-primary-50 border border-primary-100'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-2xl"></div>)}
        </div>
      ) : displayOrders.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Henüz sipariş yok</h2>
          <p className="text-gray-500 mb-6">İlk siparişinizi vermek için alışverişe başlayın</p>
          <Link to="/" className="btn-primary inline-flex">Alışverişe Başla</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {displayOrders.map(order => {
            const status = statusConfig[order.status] || statusConfig.pending;
            return (
              <div key={order.id} className="glass-card p-5 hover:shadow-pazara transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900">{order.order_number}</p>
                    <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('tr-TR')}</p>
                  </div>
                  <span className={`badge ${status.color} text-xs`}>{status.icon} {status.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">{order.items_count || 1} ürün</p>
                  <p className="font-bold text-primary-600">₺{parseFloat(order.total_amount).toFixed(2)}</p>
                </div>
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    {['Sipariş', 'Onay', 'Hazırlık', 'Kargo', 'Teslim'].map((step, i) => (
                      <span key={step} className={['pending','confirmed','preparing','shipping','delivered'].indexOf(order.status) >= i ? 'text-primary-600 font-medium' : ''}>{step}</span>
                    ))}
                  </div>
                  <div className="h-1.5 bg-primary-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-500"
                      style={{ width: `${(['pending','confirmed','preparing','shipping','delivered'].indexOf(order.status) + 1) * 20}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
