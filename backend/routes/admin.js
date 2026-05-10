/**
 * Admin Routes - Yönetim Paneli
 */
const express = require('express');
const pool = require('../database/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Tüm admin route'ları için auth gerekli
router.use(authenticate, requireAdmin);

// ─── Dashboard İstatistikleri ─────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [[users]] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE is_active = TRUE');
    const [[products]] = await pool.execute('SELECT COUNT(*) as count FROM products WHERE is_active = TRUE');
    const [[orders]] = await pool.execute('SELECT COUNT(*) as count FROM orders');
    const [[revenue]] = await pool.execute('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = "paid"');
    const [[pendingOrders]] = await pool.execute('SELECT COUNT(*) as count FROM orders WHERE status = "pending"');
    const [[sellers]] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role = "seller"');

    const [recentOrders] = await pool.execute(
      `SELECT o.*, u.username, u.email FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC LIMIT 10`
    );

    const [topProducts] = await pool.execute(
      'SELECT id, name, sold_count, price, rating FROM products ORDER BY sold_count DESC LIMIT 5'
    );

    res.json({
      success: true,
      stats: {
        total_users: users.count,
        total_products: products.count,
        total_orders: orders.count,
        total_revenue: revenue.total,
        pending_orders: pendingOrders.count,
        total_sellers: sellers.count
      },
      recent_orders: recentOrders,
      top_products: topProducts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// ─── Kullanıcı Yönetimi ───────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const offset = (page - 1) * limit;
    let where = '1=1';
    const params = [];
    if (role) { where += ' AND role = ?'; params.push(role); }
    if (search) { where += ' AND (username LIKE ? OR email LIKE ? OR full_name LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    const [users] = await pool.execute(
      `SELECT id, uuid, username, email, full_name, role, is_active, is_verified, created_at FROM users WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// Kullanıcı durumu değiştir
router.put('/users/:id/status', async (req, res) => {
  try {
    const { is_active } = req.body;
    await pool.execute('UPDATE users SET is_active = ? WHERE id = ?', [is_active, req.params.id]);
    res.json({ success: true, message: 'Kullanıcı durumu güncellendi.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// ─── Sipariş Yönetimi ─────────────────────────────────────────────────────────
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;
    let where = '1=1';
    const params = [];
    if (status) { where += ' AND o.status = ?'; params.push(status); }

    const [orders] = await pool.execute(
      `SELECT o.*, u.username, u.email FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE ${where} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// Sipariş durumu güncelle
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);

    // Kullanıcıya bildirim gönder
    const [orders] = await pool.execute('SELECT user_id, order_number FROM orders WHERE id = ?', [req.params.id]);
    if (orders.length > 0) {
      const statusMessages = {
        confirmed: 'Siparişiniz onaylandı',
        preparing: 'Siparişiniz hazırlanıyor',
        shipping: 'Siparişiniz kargoya verildi',
        delivered: 'Siparişiniz teslim edildi'
      };
      if (statusMessages[status]) {
        await pool.execute(
          `INSERT INTO notifications (user_id, type, title, message) VALUES (?, 'order', ?, ?)`,
          [orders[0].user_id, statusMessages[status], `${orders[0].order_number} numaralı siparişiniz güncellendi.`]
        );
      }
    }

    res.json({ success: true, message: 'Sipariş durumu güncellendi.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// ─── Ürün Yönetimi ────────────────────────────────────────────────────────────
router.put('/products/:id/featured', async (req, res) => {
  try {
    const { is_featured, is_trending } = req.body;
    await pool.execute(
      'UPDATE products SET is_featured = ?, is_trending = ? WHERE id = ?',
      [is_featured, is_trending, req.params.id]
    );
    res.json({ success: true, message: 'Ürün güncellendi.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// ─── Banner Yönetimi ──────────────────────────────────────────────────────────
router.get('/banners', async (req, res) => {
  try {
    const [banners] = await pool.execute('SELECT * FROM banners ORDER BY sort_order');
    res.json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

router.post('/banners', async (req, res) => {
  try {
    const { title, subtitle, image_url, link_url, button_text, position, sort_order } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO banners (title, subtitle, image_url, link_url, button_text, position, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, subtitle, image_url, link_url, button_text, position, sort_order || 0]
    );
    res.status(201).json({ success: true, bannerId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

module.exports = router;
