/**
 * Profile Page - Kullanıcı Profili
 */
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateProfile(form);
    setSaving(false);
    if (result?.success) setEditing(false);
  };

  const stats = [
    { label: 'Sipariş', value: user?.order_count || 0, icon: '📦' },
    { label: 'Favori', value: user?.favorites_count || 0, icon: '❤️' },
    { label: 'Takipçi', value: user?.followers_count || 0, icon: '👥' },
    { label: 'Takip', value: user?.following_count || 0, icon: '➕' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold font-display text-gray-900 mb-8">👤 {t('profile')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="glass-card p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-4xl font-bold mx-auto overflow-hidden">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  (user?.full_name || user?.username || 'U')[0].toUpperCase()
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm shadow-pazara hover:bg-primary-700 transition-all">
                📷
              </button>
            </div>
            <h2 className="font-bold text-gray-900 text-lg">{user?.full_name || user?.username}</h2>
            <p className="text-gray-500 text-sm">@{user?.username}</p>
            {user?.is_verified && <span className="badge-primary badge mt-2">✓ Doğrulanmış</span>}
            {user?.bio && <p className="text-gray-600 text-sm mt-3 leading-relaxed">{user.bio}</p>}

            <div className="grid grid-cols-2 gap-3 mt-4">
              {stats.map(s => (
                <div key={s.label} className="bg-primary-50 rounded-xl p-3 text-center">
                  <p className="text-lg">{s.icon}</p>
                  <p className="font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>

            <button onClick={logout} className="w-full mt-4 text-sm text-red-500 hover:text-red-600 font-medium py-2 hover:bg-red-50 rounded-xl transition-all">
              🚪 {t('logout')}
            </button>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-gray-900 text-lg">Profil Bilgileri</h2>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="btn-secondary text-sm py-2 px-4">✏️ Düzenle</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="btn-ghost text-sm">İptal</button>
                  <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-2 px-4">
                    {saving ? 'Kaydediliyor...' : '💾 Kaydet'}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {[
                { label: t('full_name'), key: 'full_name', type: 'text', placeholder: 'Ad Soyad' },
                { label: t('username'), key: 'username', type: 'text', placeholder: 'kullanici_adi' },
                { label: t('phone'), key: 'phone', type: 'tel', placeholder: '+90 555 000 0000' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  {editing ? (
                    <input
                      type={field.type}
                      value={form[field.key]}
                      onChange={e => setForm({...form, [field.key]: e.target.value})}
                      placeholder={field.placeholder}
                      className="input-field"
                    />
                  ) : (
                    <p className="px-4 py-3 bg-primary-50 rounded-xl text-sm text-gray-800">{form[field.key] || '—'}</p>
                  )}
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Biyografi</label>
                {editing ? (
                  <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Kendinizi tanıtın..." className="input-field resize-none h-24 text-sm" />
                ) : (
                  <p className="px-4 py-3 bg-primary-50 rounded-xl text-sm text-gray-800">{form.bio || '—'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                <p className="px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-500">{user?.email} (değiştirilemez)</p>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="glass-card p-6 mt-4">
            <h2 className="font-bold text-gray-900 mb-4">Hesap Bilgileri</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Üyelik Tarihi</span><span className="font-medium">{user?.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR') : '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Hesap Türü</span><span className="badge-primary badge">{user?.role === 'admin' ? 'Admin' : user?.role === 'seller' ? 'Satıcı' : 'Kullanıcı'}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
