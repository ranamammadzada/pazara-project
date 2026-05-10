/**
 * Reviews Routes - Ürün Yorumları
 */
const express = require('express');
const pool = require('../database/db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Yorum ekle
router.post('/', authenticate, async (req, res) => {
  try {
    const { product_id, food_id, item_type, rating, title, comment, images } = req.body;

    // Satın alma kontrolü
    let is_verified = false;
    if (product_id || food_id) {
      const col = item_type === 'product' ? 'oi.product_id' : 'oi.food_id';
      const id = item_type === 'product' ? product_id : food_id;
      const [orders] = await pool.execute(
        `SELECT oi.id FROM order_items oi JOIN orders o ON oi.order_id = o.id
         WHERE o.user_id = ? AND ${col} = ? AND o.status = 'delivered' LIMIT 1`,
        [req.user.id, id]
      );
      is_verified = orders.length > 0;
    }

    const [result] = await pool.execute(
      `INSERT INTO reviews (user_id, product_id, food_id, item_type, rating, title, comment, images, is_verified_purchase)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, product_id || null, food_id || null, item_type, rating, title, comment,
       JSON.stringify(images || []), is_verified]
    );

    // Ürün rating güncelle
    if (item_type === 'product' && product_id) {
      await pool.execute(
        `UPDATE products SET rating = (SELECT AVG(rating) FROM reviews WHERE product_id = ? AND is_active = TRUE),
         review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = ? AND is_active = TRUE) WHERE id = ?`,
        [product_id, product_id, product_id]
      );
    } else if (item_type === 'food' && food_id) {
      await pool.execute(
        `UPDATE food_products SET rating = (SELECT AVG(rating) FROM reviews WHERE food_id = ? AND is_active = TRUE),
         review_count = (SELECT COUNT(*) FROM reviews WHERE food_id = ? AND is_active = TRUE) WHERE id = ?`,
        [food_id, food_id, food_id]
      );
    }

    res.status(201).json({ success: true, message: 'Yorumunuz eklendi.', reviewId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// Ürün yorumları
router.get('/product/:productId', async (req, res) => {
  try {
    const [reviews] = await pool.execute(
      `SELECT r.*, u.username, u.avatar_url FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? AND r.is_active = TRUE
       ORDER BY r.created_at DESC`,
      [req.params.productId]
    );
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// Yorum sil
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await pool.execute(
      'UPDATE reviews SET is_active = FALSE WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ success: true, message: 'Yorum silindi.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

module.exports = router;
