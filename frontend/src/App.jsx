/**
 * PazaRa - Ana Uygulama Bileşeni
 * React Router ile sayfa yönetimi
 */
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import { useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import LoadingScreen from './components/ui/LoadingScreen';

// Lazy loaded pages
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const FoodDetailPage = lazy(() => import('./pages/FoodDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AIRecommendationsPage = lazy(() => import('./pages/AIRecommendationsPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const HashtagPage = lazy(() => import('./pages/HashtagPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Protected Route
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/giris" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
};

// App Routes
const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="giris" element={<LoginPage />} />
          <Route path="kayit" element={<RegisterPage />} />
          <Route path="urun/:id" element={<ProductDetailPage />} />
          <Route path="yemek/:id" element={<FoodDetailPage />} />
          <Route path="kategori/:slug" element={<CategoryPage />} />
          <Route path="ara" element={<SearchPage />} />
          <Route path="hashtag/:slug" element={<HashtagPage />} />
          <Route path="sepet" element={<CartPage />} />
          <Route path="ai-onerileri" element={<AIRecommendationsPage />} />
          
          {/* Protected Routes */}
          <Route path="favoriler" element={
            <ProtectedRoute><FavoritesPage /></ProtectedRoute>
          } />
          <Route path="profil" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
          <Route path="siparisler" element={
            <ProtectedRoute><OrdersPage /></ProtectedRoute>
          } />
          <Route path="mesajlar" element={
            <ProtectedRoute><MessagesPage /></ProtectedRoute>
          } />
          <Route path="mesajlar/:userId" element={
            <ProtectedRoute><MessagesPage /></ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="admin" element={
            <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

// Main App
const App = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
