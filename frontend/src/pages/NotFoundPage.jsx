/**
 * 404 Not Found Page
 */
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center px-4">
    <div className="text-center max-w-md">
      <div className="text-8xl mb-6 animate-float">🛍️</div>
      <h1 className="text-6xl font-bold font-display text-gradient mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Sayfa Bulunamadı</h2>
      <p className="text-gray-500 mb-8 leading-relaxed">
        Aradığınız sayfa mevcut değil veya taşınmış olabilir. Ana sayfaya dönerek alışverişe devam edebilirsiniz.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/" className="btn-primary">🏠 Ana Sayfaya Dön</Link>
        <Link to="/kategori/giyim" className="btn-secondary">🛍️ Alışverişe Başla</Link>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {['Yemek', 'Giyim', 'Elektronik', 'Kozmetik'].map(cat => (
          <Link key={cat} to={`/kategori/${cat.toLowerCase()}`} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            {cat}
          </Link>
        ))}
      </div>
    </div>
  </div>
);

export default NotFoundPage;
