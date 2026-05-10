/**
 * Admin Dashboard - Yönetim Paneli
 */
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return; }
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data.success) setStats(res.data.stats);
      } catch { } finally { setLoading(false); }
    };
    fetchStats();
  }, [isAdmin]);

  const demoStats = {
    total_users: 12450, total_orders: 8920, total_revenue: 2456789, total_products: 45230,
    today_orders: 234, today_revenue: 45678, pending_orders: 89, active_sellers: 1240,
  };

  const s = stats || demoStats;

  const statCards = [
    { label: 'Toplam Kullanıcı', value: s.total_users?.toLocaleString(), icon: '👥', color: 'from-blue-500 to-blue-600', change: '+12%' },
    { label: 'Toplam Sipariş', value: s.total_orders?.toLocaleString(), icon: '📦', color: 'from-green-500 to-green-600', change: '+8%' },
    { label: 'Toplam Gelir', value: `₺${(s.total_revenue / 1000).toFixed(0)}K`, icon: '💰', color: 'from-primary-500 to-primary-600', change: '+23%' },
    { label: 'Toplam Ürün', value: s.total_products?.toLocaleString(), icon: '🛍️', color: 'from-orange-500 to-orange-600', change: '+5%' },
    { label: 'Bugün Sipariş', value: s.today_orders?.toLocaleString(), icon: '📊', color: 'from-purple-500 to-purple-600', change: '+15%' },
    { label: 'Bugün Gelir', value: `₺${(s.today_revenue / 1000).toFixed(1)}K`, icon: '💳', color: 'from-pink-500 to-pink-600', change: '+18%' },
    { label: 'Bekleyen Sipariş', value: s.pending_orders?.toLocaleString(), icon: '⏳', color: 'from-yellow-500 to-yellow-600', change: '-3%' },
    { label: 'Aktif Satıcı', value: s.active_sellers?.toLocaleString(), icon: '🏪', color: 'from-teal-500 to-teal-600', change: '+7%' },
  ];

  const tabs = [
    { key: 'overview', label: '📊 Genel Bakış' },
    { key: 'users', label: '👥 Kullanıcılar' },
    { key: 'orders', label: '📦 Siparişler' },
    { key: 'products', label: '🛍️ Ürünler' },
    { key: 'settings', label: '⚙️ Ayarlar' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">⚙️ Admin Paneli</h1>
          <p className="text-gray-500 text-sm">Hoş geldiniz, {user?.full_name || user?.username}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Sistem Aktif</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-primary-600 text-white shadow-pazara' : 'bg-white text-gray-600 hover:bg-primary-50 border border-primary-100'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statCards.map(card => (
              <div key={card.label} className="glass-card p-4 hover:shadow-pazara transition-all">
                <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center text-xl mb-3`}>{card.icon}</div>
                <p className="text-2xl font-bold text-gray-900">{loading ? '...' : card.value}</p>
                <p className="text-xs text-gray-500 mt-1">{card.label}</p>
                <p className={`text-xs font-medium mt-1 ${card.change.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>{card.change} bu ay</p>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h2 className="font-bold text-gray-900 mb-4">Son Siparişler</h2>
              <div className="space-y-3">
                {[
                  { id: 'PZR-001', user: 'Ahmet Y.', amount: 1299, status: 'shipping' },
                  { id: 'PZR-002', user: 'Fatma K.', amount: 89, status: 'preparing' },
                  { id: 'PZR-003', user: 'Mehmet A.', amount: 599, status: 'pending' },
                  { id: 'PZR-004', user: 'Ayşe B.', amount: 2499, status: 'delivered' },
                ].map(order => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-primary-50 last:border-0">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{order.id}</p>
                      <p className="text-xs text-gray-500">{order.user}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-600 text-sm">₺{order.amount}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'shipping' ? 'bg-purple-100 text-purple-700' : order.status === 'preparing' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {order.status === 'delivered' ? 'Teslim' : order.status === 'shipping' ? 'Kargoda' : order.status === 'preparing' ? 'Hazırlanıyor' : 'Beklemede'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <h2 className="font-bold text-gray-900 mb-4">Hızlı İşlemler</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: '➕', label: 'Ürün Ekle', action: () => {} },
                  { icon: '📢', label: 'Kampanya Oluştur', action: () => {} },
                  { icon: '📊', label: 'Rapor İndir', action: () => {} },
                  { icon: '📧', label: 'Bildirim Gönder', action: () => {} },
                  { icon: '🏷️', label: 'Hashtag Yönet', action: () => {} },
                  { icon: '🤖', label: 'AI Ayarları', action: () => {} },
                ].map(action => (
                  <button key={action.label} onClick={action.action} className="flex items-center gap-2 p-3 bg-primary-50 rounded-xl hover:bg-primary-100 transition-all text-left">
                    <span className="text-xl">{action.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab !== 'overview' && (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Yakında</h2>
          <p className="text-gray-500">Bu bölüm geliştirme aşamasındadır.</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
