/**
 * Messages Page - Mesajlar (Kullanıcılar arası sohbet)
 */
import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const MessagesPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const demoConversations = [
    { id: 1, username: 'Nike Store', avatar: '🏪', last_message: 'Siparişiniz hazırlanıyor!', unread: 2, time: '14:30' },
    { id: 2, username: 'Ahmet Yılmaz', avatar: '👤', last_message: 'Ürün hakkında sorum vardı', unread: 0, time: '12:15' },
    { id: 3, username: 'Pizza Palace', avatar: '🍕', last_message: 'Siparişiniz yolda!', unread: 1, time: 'Dün' },
  ];

  const demoMessages = [
    { id: 1, sender_id: 99, text: 'Merhaba! Size nasıl yardımcı olabilirim?', time: '14:00' },
    { id: 2, sender_id: user?.id, text: 'Nike Air Max 270 hakkında bilgi almak istiyorum', time: '14:05' },
    { id: 3, sender_id: 99, text: 'Tabii ki! Ürünümüz stokta mevcut. Hangi beden ilginizi çekiyor?', time: '14:10' },
    { id: 4, sender_id: user?.id, text: '42 numara var mı?', time: '14:15' },
    { id: 5, sender_id: 99, text: 'Evet, 42 numara stokta var! Hemen sipariş verebilirsiniz 🎉', time: '14:30' },
  ];

  useEffect(() => {
    setConversations(demoConversations);
  }, []);

  useEffect(() => {
    if (selected) {
      setMessages(demoMessages);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [selected]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), sender_id: user?.id, text: input.trim(), time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold font-display text-gray-900 mb-6">💬 Mesajlar</h1>
      <div className="glass-card overflow-hidden" style={{ height: '70vh' }}>
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-72 border-r border-primary-100 flex flex-col">
            <div className="p-3 border-b border-primary-100">
              <input type="text" placeholder="Sohbet ara..." className="input-field text-sm py-2" />
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setSelected(conv)}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-primary-50 transition-all text-left ${selected?.id === conv.id ? 'bg-primary-50' : ''}`}
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">{conv.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-gray-900 truncate">{conv.username}</p>
                      <span className="text-xs text-gray-400 flex-shrink-0">{conv.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{conv.last_message}</p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">{conv.unread}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selected ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-primary-100 flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-lg">{selected.avatar}</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{selected.username}</p>
                    <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div><span className="text-xs text-gray-500">Çevrimiçi</span></div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-primary-50/20">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={msg.sender_id === user?.id ? 'chat-bubble-user' : 'chat-bubble-bot'}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-white/70' : 'text-gray-400'}`}>{msg.time}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="p-3 border-t border-primary-100 flex gap-2">
                  <input value={input} onChange={e => setInput(e.target.value)} placeholder="Mesaj yazın..." className="flex-1 px-3 py-2 bg-primary-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 border border-transparent" />
                  <button type="submit" disabled={!input.trim()} className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center hover:bg-primary-700 transition-all disabled:opacity-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-gray-500">Bir sohbet seçin</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
