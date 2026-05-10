/**
 * Register Page - Kayıt Sayfası
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', username: '', email: '', password: '', confirm_password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) { alert('Şifreler eşleşmiyor!'); return; }
    setLoading(true);
    const result = await register(form);
    setLoading(false);
    if (result?.success) navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-pazara-lg animate-float">
            <span className="text-white font-bold text-3xl">P</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Hesap Oluştur</h1>
          <p className="text-gray-500 mt-1 text-sm">PazaRa ailesine katılın</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('full_name')}</label>
                <input type="text" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="Ad Soyad" className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('username')}</label>
                <input type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="kullanici_adi" className="input-field" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="ornek@email.com" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone')}</label>
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+90 555 000 0000" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('password')}</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="En az 8 karakter" className="input-field pr-10" required minLength={8} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPass ? '🙈' : '👁️'}</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('confirm_password')}</label>
              <input type="password" value={form.confirm_password} onChange={e => setForm({...form, confirm_password: e.target.value})} placeholder="Şifreyi tekrar girin" className="input-field" required />
            </div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-primary-600 mt-0.5" required />
              <span className="text-xs text-gray-600">Kullanım koşullarını ve gizlilik politikasını kabul ediyorum</span>
            </label>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center flex items-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Kayıt olunuyor...</> : t('sign_up')}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">{t('have_account')}{' '}<Link to="/giris" className="text-primary-600 font-semibold hover:text-primary-700">{t('sign_in')}</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
