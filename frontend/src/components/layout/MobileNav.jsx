/**
 * Mobile Bottom Navigation
 */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

const MobileNav = () => {
  const { cartCount } = useCart();
  const { t } = useLanguage();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const navItems = [
    { to: '/', icon: '🏠', label: t('home') },
    { to: '/kategori/yemek', icon: '🍔', label: t('food') },
    { to: '/sepet', icon: '🛒', label: t('cart'), badge: cartCount },
    { to: '/favoriler', icon: '❤️', label: t('favorites') },
    { to: '/profil', icon: '👤', label: t('profile') },
  ];

  return (
    <nav className="mobile-nav">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 relative ${
              isActive(item.to)
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-500 hover:text-primary-500'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
            {item.badge > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
