/**
 * Login Page - Giriş Sayfası
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const LoginPage = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result?.success) navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-pazara-lg animate-float">
            <span className="text-white font-bold text-3xl">P</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-gray-900">PazaRa'ya Hoş Geldiniz</h1>
          <p className="text-gray-500 mt-1 text-sm">Hesabınıza giriş yapın</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('email')}</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                placeholder="ornek@email.com"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('password')}</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  placeholder="••••••••"
                  className="input-field pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-primary-600" />
                <span className="text-sm text-gray-600">{t('remember_me')}</span>
              </label>
              <button type="button" className="text-sm text-primary-600 hover:text-primary-700 font-medium">{t('forgot_password')}</button>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center flex items-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Giriş yapılıyor...</> : t('sign_in')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {t('no_account')}{' '}
              <Link to="/kayit" className="text-primary-600 font-semibold hover:text-primary-700">{t('sign_up')}</Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 p-3 bg-primary-50 rounded-xl border border-primary-100">
            <p className="text-xs text-primary-600 font-medium mb-1">Demo Hesap:</p>
            <p className="text-xs text-gray-600">E-posta: admin@pazara.com</p>
            <p className="text-xs text-gray-600">Şifre: Admin123!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
