/**
 * Footer Component
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-white border-t border-primary-100 mt-16 hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-400 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-2xl font-bold font-display text-gradient">PazaRa</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Yemek, giyim ve daha fazlası — hepsi tek platformda. Modern alışveriş deneyimi.
            </p>
            <div className="flex gap-3 mt-4">
              {['📘', '📸', '🐦', '▶️'].map((icon, i) => (
                <button key={i} className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center hover:bg-primary-100 transition-all text-lg">
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: 'Kategoriler', links: [
              { label: '🍔 Yemek', to: '/kategori/yemek' },
              { label: '👗 Giyim', to: '/kategori/giyim' },
              { label: '📱 Elektronik', to: '/kategori/elektronik' },
              { label: '💄 Kozmetik', to: '/kategori/kozmetik' },
              { label: '⚽ Spor', to: '/kategori/spor' },
            ]},
            { title: 'Hesabım', links: [
              { label: 'Profilim', to: '/profil' },
              { label: 'Siparişlerim', to: '/siparisler' },
              { label: 'Favorilerim', to: '/favoriler' },
              { label: 'Mesajlarım', to: '/mesajlar' },
              { label: 'AI Önerileri', to: '/ai-onerileri' },
            ]},
            { title: 'Yardım', links: [
              { label: 'Hakkımızda', to: '/' },
              { label: 'İletişim', to: '/' },
              { label: 'Gizlilik Politikası', to: '/' },
              { label: 'Kullanım Koşulları', to: '/' },
              { label: 'SSS', to: '/' },
            ]},
          ].map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-gray-900 mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map(link => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-gray-500 hover:text-primary-600 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-primary-100 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">© 2026 PazaRa. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Güvenli Ödeme:</span>
            {['💳', '🏦', '📱'].map((icon, i) => (
              <span key={i} className="text-2xl">{icon}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
