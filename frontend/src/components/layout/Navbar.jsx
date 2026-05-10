/**
 * Navbar - Sticky Responsive Navigation Bar
 */
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { t, language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const userMenuRef = useRef(null);
  const langMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) setLangMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { setMobileMenuOpen(false); }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/ara?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const languages = [
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'az', label: 'Azərbaycan', flag: '🇦🇿' },
  ];

  const categories = [
    { label: t('food'), slug: 'yemek', icon: '🍔' },
    { label: t('clothing'), slug: 'giyim', icon: '👗' },
    { label: t('electronics'), slug: 'elektronik', icon: '📱' },
    { label: 'Kozmetik', slug: 'kozmetik', icon: '💄' },
    { label: 'Spor', slug: 'spor', icon: '⚽' },
    { label: 'Ev & Yaşam', slug: 'ev-yasam', icon: '🏠' },
  ];

  return (
    <header className={`navbar transition-all duration-300 ${scrolled ? 'shadow-pazara' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-400 rounded-xl flex items-center justify-center shadow-pazara">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold font-display text-gradient hidden sm:block">PazaRa</span>
          </Link>

          {/* Categories Dropdown - Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {categories.slice(0, 4).map(cat => (
              <Link
                key={cat.slug}
                to={`/kategori/${cat.slug}`}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 font-medium"
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className={`relative flex items-center transition-all duration-300 ${searchFocused ? 'scale-[1.02]' : ''}`}>
              <div className="absolute left-3 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder={t('search')}
                className="w-full pl-10 pr-4 py-2.5 bg-primary-50 border-2 border-transparent rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-primary-300 focus:bg-white transition-all duration-200"
              />
              {searchQuery && (
                <button type="submit" className="absolute right-3 text-primary-600 hover:text-primary-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              )}
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2">

            {/* Language Selector */}
            <div className="relative hidden md:block" ref={langMenuRef}>
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1 px-2 py-1.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
              >
                <span>{languages.find(l => l.code === language)?.flag}</span>
                <span className="font-medium uppercase text-xs">{language}</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-pazara-lg border border-primary-100 py-1 z-50 animate-scale-in">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { changeLanguage(lang.code); setLangMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-primary-50 transition-colors ${language === lang.code ? 'text-primary-600 font-semibold bg-primary-50' : 'text-gray-700'}`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span>{lang.label}</span>
                      {language === lang.code && <span className="ml-auto text-primary-500">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link to="/sepet" className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce-slow">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-primary-50 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      (user?.full_name || user?.username || 'U')[0].toUpperCase()
                    )}
                  </div>
                  <svg className="w-4 h-4 text-gray-500 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-pazara-xl border border-primary-100 py-2 z-50 animate-scale-in">
                    <div className="px-4 py-3 border-b border-primary-50">
                      <p className="font-semibold text-gray-900 text-sm">{user?.full_name || user?.username}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    {[
                      { to: '/profil', icon: '👤', label: t('profile') },
                      { to: '/siparisler', icon: '📦', label: t('orders') },
                      { to: '/favoriler', icon: '❤️', label: t('favorites') },
                      { to: '/mesajlar', icon: '💬', label: t('messages') },
                      ...(isAdmin ? [{ to: '/admin', icon: '⚙️', label: t('admin') }] : []),
                    ].map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    ))}
                    <div className="border-t border-primary-50 mt-1 pt-1">
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <span>🚪</span>
                        <span>{t('logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/giris" className="hidden sm:block text-sm font-medium text-primary-600 hover:text-primary-700 px-3 py-2 rounded-lg hover:bg-primary-50 transition-all">
                  {t('login')}
                </Link>
                <Link to="/kayit" className="btn-primary text-sm py-2 px-4">
                  {t('register')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-primary-100 py-4 animate-slide-up">
            <div className="grid grid-cols-3 gap-2 mb-4">
              {categories.map(cat => (
                <Link
                  key={cat.slug}
                  to={`/kategori/${cat.slug}`}
                  className="flex flex-col items-center gap-1 p-3 bg-primary-50 rounded-xl hover:bg-primary-100 transition-all text-center"
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs font-medium text-gray-700">{cat.label}</span>
                </Link>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all ${language === lang.code ? 'bg-primary-600 text-white' : 'bg-primary-50 text-gray-700'}`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
