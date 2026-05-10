/**
 * Users Routes - Kullanıcı Profilleri ve Takip Sistemi
 */
const express = require('express');
const pool = require('../database/db');
const { authenticate, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// Kullanıcı profili
router.get('/:username', optionalAuth, async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT id, uuid, username, full_name, avatar_url, bio, role, is_verified,
              followers_count, following_count, created_at FROM users WHERE username = ? AND is_active = TRUE`,
      [req.params.username]
    );
    if (!users.length) return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });

    const user = users[0];

    // Satıcı profili
    if (user.role === 'seller') {
      const [seller] = await pool.execute('SELECT * FROM seller_profiles WHERE user_id = ?', [user.id]);
      user.seller_profile = seller[0] || null;
    }

    // Takip durumu
    if (req.user && req.user.id !== user.id) {
      const [follow] = await pool.execute(
        'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
        [req.user.id, user.id]
      );
      user.is_following = follow.length > 0;
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// Takip et / Takibi bırak
router.post('/:userId/follow', authenticate, async (req, res) => {
  try {
    const targetId = req.params.userId;
    if (targetId == req.user.id) return res.status(400).json({ success: false, message: 'Kendinizi takip edemezsiniz.' });

    const [existing] = await pool.execute(
      'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
      [req.user.id, targetId]
    );

    if (existing.length > 0) {
      await pool.execute('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [req.user.id, targetId]);
      await pool.execute('UPDATE users SET following_count = following_count - 1 WHERE id = ?', [req.user.id]);
      await pool.execute('UPDATE users SET followers_count = followers_count - 1 WHERE id = ?', [targetId]);
      return res.json({ success: true, following: false, message: 'Takip bırakıldı.' });
    }

    await pool.execute('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)', [req.user.id, targetId]);
    await pool.execute('UPDATE users SET following_count = following_count + 1 WHERE id = ?', [req.user.id]);
    await pool.execute('UPDATE users SET followers_count = followers_count + 1 WHERE id = ?', [targetId]);

    await pool.execute(
      `INSERT INTO notifications (user_id, type, title, message) VALUES (?, 'follow', ?, ?)`,
      [targetId, 'Yeni Takipçi!', `${req.user.username} sizi takip etmeye başladı.`]
    );

    res.json({ success: true, following: true, message: 'Takip edildi.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// Bildirimler
router.get('/notifications/list', authenticate, async (req, res) => {
  try {
    const [notifications] = await pool.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );
    await pool.execute('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// Okunmamış bildirim sayısı
router.get('/notifications/unread-count', authenticate, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [req.user.id]
    );
    res.json({ success: true, count: result[0].count });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

module.exports = router;
