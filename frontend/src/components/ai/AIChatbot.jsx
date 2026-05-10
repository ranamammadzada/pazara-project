/**
 * AI Chatbot Component - Canlı AI Destek
 */
import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

// Generate a simple session ID
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

const AIChatbot = ({ isOpen, onToggle }) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Merhaba! 👋 PazaRa AI Asistanınım. Size nasıl yardımcı olabilirim?\n\n• 📦 Sipariş takibi\n• 🔍 Ürün arama\n• 🍔 Yemek siparişi\n• 💰 Kampanyalar', time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => generateId());
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { id: Date.now(), type: 'user', text: input.trim(), time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/chat/bot', { message: input.trim(), session_id: sessionId });
      const botMsg = { id: Date.now() + 1, type: 'bot', text: response.data.response, time: new Date() };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: 'Üzgünüm, şu an yanıt veremiyorum. Lütfen tekrar deneyin.', time: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const quickReplies = ['Siparişim nerede?', 'İndirimler neler?', 'Yemek öner', 'Kargo ücreti'];

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={onToggle}
        className={`fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 w-14 h-14 rounded-2xl shadow-pazara-xl flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'bg-gray-600 rotate-45'
            : 'bg-gradient-to-br from-primary-600 to-primary-500 hover:shadow-glow-lg hover:scale-110 animate-glow-pulse'
        }`}
        title="AI Asistan"
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="text-2xl">🤖</span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-44 md:bottom-28 right-4 md:right-8 z-50 w-80 md:w-96 bg-white rounded-3xl shadow-pazara-xl border border-primary-100 flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-2xl">🤖</div>
            <div>
              <h3 className="text-white font-semibold text-sm">{t('ai_title')}</h3>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white/80 text-xs">Çevrimiçi</span>
              </div>
            </div>
            <button onClick={onToggle} className="ml-auto text-white/80 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-72 bg-primary-50/30">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.type === 'bot' && (
                  <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">🤖</div>
                )}
                <div className={msg.type === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}>
                  <p className="text-sm whitespace-pre-line">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                    {msg.time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-sm mr-2">🤖</div>
                <div className="chat-bubble-bot">
                  <div className="flex gap-1 items-center py-1">
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="px-3 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-primary-50">
            {quickReplies.map((reply) => (
              <button
                key={reply}
                onClick={() => { setInput(reply); }}
                className="flex-shrink-0 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-full text-xs font-medium hover:bg-primary-100 transition-all border border-primary-100"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-3 border-t border-primary-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('ai_placeholder')}
              className="flex-1 px-3 py-2 bg-primary-50 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 border border-transparent focus:border-primary-200"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-500 text-white rounded-xl flex items-center justify-center hover:shadow-pazara transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
