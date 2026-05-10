/**
 * Main Layout - Ana Sayfa Düzeni
 * Navbar + Content + Footer + AI Chatbot
 */
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import MobileNav from '../components/layout/MobileNav';
import AIChatbot from '../components/ai/AIChatbot';

const MainLayout = () => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-pazara-gray flex flex-col">
      {/* Sticky Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 pt-16 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* AI Chatbot */}
      <AIChatbot isOpen={chatOpen} onToggle={() => setChatOpen(!chatOpen)} />
    </div>
  );
};

export default MainLayout;
