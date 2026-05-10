/**
 * Chat Routes - Kullanıcı Mesajlaşma ve AI Chatbot
 */
const express = require('express');
const pool = require('../database/db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// ─── AI Chatbot Yanıtı ────────────────────────────────────────────────────────
const generateBotResponse = async (message, userId) => {
  const msg = message.toLowerCase();

  // Sipariş sorgulama
  if (msg.includes('sipariş') || msg.includes('order')) {
    if (userId) {
      const [orders] = await pool.execute(
        'SELECT order_number, status, total_amount FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 3',
        [userId]
      );
      if (orders.length > 0) {
        const orderList = orders.map(o => `📦 ${o.order_number} - ${o.status} - ₺${o.total_amount}`).join('\n');
        return `Son siparişleriniz:\n${orderList}\n\nDetay için Siparişlerim sayfasını ziyaret edebilirsiniz.`;
      }
    }
    return 'Siparişlerinizi takip etmek için giriş yapmanız gerekmektedir. Siparişlerim sayfasından tüm siparişlerinizi görebilirsiniz.';
  }

  // Ürün arama
  if (msg.includes('ürün') || msg.includes('ara') || msg.includes('bul')) {
    return 'Ürün aramak için üst kısımdaki arama çubuğunu kullanabilirsiniz. Kategori filtreleri ile de arama yapabilirsiniz! 🔍';
  }

  // Yemek siparişi
  if (msg.includes('yemek') || msg.includes('pizza') || msg.includes('burger') || msg.includes('restoran')) {
    return 'Yemek siparişi vermek için ana sayfadaki "Yemek" kategorisine tıklayın. Yüzlerce restoran ve binlerce yemek seçeneği sizi bekliyor! 🍔🍕';
  }

  // Kargo/teslimat
  if (msg.includes('kargo') || msg.includes('teslimat') || msg.includes('ne zaman gelir')) {
    return 'Siparişleriniz genellikle 1-3 iş günü içinde teslim edilir. Yemek siparişleri ise 30-60 dakika içinde kapınıza gelir. 🚚';
  }

  // İade
  if (msg.includes('iade') || msg.includes('geri') || msg.includes('iptal')) {
    return 'İade ve iptal işlemleri için Siparişlerim sayfasından ilgili siparişi seçip "İptal Et" veya "İade Talebi" butonuna tıklayabilirsiniz. 📦';
  }

  // İndirim/kampanya
  if (msg.includes('indirim') || msg.includes('kampanya') || msg.includes('kupon')) {
    return 'Güncel kampanyalar ve indirimler için ana sayfamızı ziyaret edin! Ayrıca #TrendFırsatlar hashtag\'ini takip edebilirsiniz. 🎉';
  }

  // Merhaba
  if (msg.includes('merhaba') || msg.includes('selam') || msg.includes('hello') || msg.includes('hi')) {
    return 'Merhaba! 👋 PazaRa\'ya hoş geldiniz! Size nasıl yardımcı olabilirim?\n\n• Sipariş takibi\n• Ürün arama\n• Yemek siparişi\n• İade işlemleri\n\nHerhangi bir konuda yardım almak için yazabilirsiniz!';
  }

  // Teşekkür
  if (msg.includes('teşekkür') || msg.includes('sağol') || msg.includes('thanks')) {
    return 'Rica ederim! 😊 Başka bir konuda yardımcı olabilir miyim?';
  }

  // Varsayılan yanıt
  return 'Anlıyorum! Bu konuda size daha iyi yardımcı olabilmem için lütfen daha fazla detay paylaşın. Ya da şu konularda yardım isteyebilirsiniz:\n\n• 📦 Sipariş takibi\n• 🔍 Ürün arama\n• 🍔 Yemek siparişi\n• 💰 İndirim ve kampanyalar\n• 🔄 İade işlemleri';
};

// ─── Chatbot Mesaj Gönder ─────────────────────────────────────────────────────
router.post('/bot', async (req, res) => {
  try {
    const { message, session_id } = req.body;
    const userId = req.user?.id || null;

    if (!message || !session_id) {
      return res.status(400).json({ success: false, message: 'Mesaj ve session_id gereklidir.' });
    }

    // Kullanıcı mesajını kaydet
    await pool.execute(
      'INSERT INTO chatbot_messages (user_id, session_id, message, message_type) VALUES (?, ?, ?, "user")',
      [userId, session_id, message]
    );

    // Bot yanıtı oluştur
    const response = await generateBotResponse(message, userId);

    // Bot yanıtını kaydet
    await pool.execute(
      'INSERT INTO chatbot_messages (user_id, session_id, message, response, message_type) VALUES (?, ?, ?, ?, "bot")',
      [userId, session_id, message, response]
    );

    res.json({ success: true, response, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// ─── Kullanıcılar Arası Mesajlaşma ────────────────────────────────────────────
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const [conversations] = await pool.execute(
      `SELECT DISTINCT 
        CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END as other_user_id,
        u.username, u.avatar_url, u.full_name,
        (SELECT content FROM messages WHERE (sender_id = ? AND receiver_id = other_user_id) OR (sender_id = other_user_id AND receiver_id = ?) ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE (sender_id = ? AND receiver_id = other_user_id) OR (sender_id = other_user_id AND receiver_id = ?) ORDER BY created_at DESC LIMIT 1) as last_message_time,
        (SELECT COUNT(*) FROM messages WHERE sender_id = other_user_id AND receiver_id = ? AND is_read = FALSE) as unread_count
       FROM messages m
       JOIN users u ON u.id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
       WHERE m.sender_id = ? OR m.receiver_id = ?
       ORDER BY last_message_time DESC`,
      Array(9).fill(req.user.id)
    );
    res.json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// ─── Mesaj Geçmişi ────────────────────────────────────────────────────────────
router.get('/messages/:userId', authenticate, async (req, res) => {
  try {
    const [messages] = await pool.execute(
      `SELECT m.*, u.username as sender_username, u.avatar_url as sender_avatar
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at ASC LIMIT 50`,
      [req.user.id, req.params.userId, req.params.userId, req.user.id]
    );

    // Okundu olarak işaretle
    await pool.execute(
      'UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ?',
      [req.params.userId, req.user.id]
    );

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// ─── Mesaj Gönder ─────────────────────────────────────────────────────────────
router.post('/messages', authenticate, async (req, res) => {
  try {
    const { receiver_id, content, message_type = 'text', product_id } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO messages (sender_id, receiver_id, content, message_type, product_id) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, receiver_id, content, message_type, product_id || null]
    );

    // Bildirim gönder
    await pool.execute(
      `INSERT INTO notifications (user_id, type, title, message) VALUES (?, 'message', ?, ?)`,
      [receiver_id, `${req.user.username} size mesaj gönderdi`, content.substring(0, 100)]
    );

    res.status(201).json({ success: true, messageId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

module.exports = router;
