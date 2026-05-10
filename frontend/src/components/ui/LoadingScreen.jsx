/**
 * Loading Screen Component
 */
import React from 'react';

const LoadingScreen = () => (
  <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-400 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float shadow-pazara-lg">
        <span className="text-white font-bold text-3xl">P</span>
      </div>
      <div className="spinner mx-auto mb-3"></div>
      <p className="text-primary-600 font-medium text-sm">PazaRa yükleniyor...</p>
    </div>
  </div>
);

export default LoadingScreen;
