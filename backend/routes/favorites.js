/**
 * Favorites Routes - Favoriler
 */
const express = require('express');
const pool = require('../database/db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const [favorites] = await pool.execute(
      `SELECT f.*, 
        CASE WHEN f.item_type = 'product' THEN p.name ELSE fp.name END as item_name,
        CASE WHEN f.item_type = 'product' THEN p.price ELSE fp.price END as item_price,
        CASE WHEN f.item_type = 'product' THEN p.images ELSE fp.images END as item_images,
        CASE WHEN f.item_type = 'product' THEN p.rating ELSE fp.rating END as item_rating
       FROM favorites f
       LEFT JOIN products p ON f.product_id = p.id
       LEFT JOIN food_products fp ON f.food_id = fp.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

router.post('/toggle', authenticate, async (req, res) => {
  try {
    const { product_id, food_id, item_type } = req.body;
    const checkCol = item_type === 'product' ? 'product_id' : 'food_id';
    const checkId = item_type === 'product' ? product_id : food_id;

    const [existing] = await pool.execute(
      `SELECT id FROM favorites WHERE user_id = ? AND ${checkCol} = ? AND item_type = ?`,
      [req.user.id, checkId, item_type]
    );

    if (existing.length > 0) {
      await pool.execute('DELETE FROM favorites WHERE id = ?', [existing[0].id]);
      return res.json({ success: true, favorited: false, message: 'Favorilerden çıkarıldı.' });
    }

    await pool.execute(
      'INSERT INTO favorites (user_id, product_id, food_id, item_type) VALUES (?, ?, ?, ?)',
      [req.user.id, product_id || null, food_id || null, item_type]
    );
    res.json({ success: true, favorited: true, message: 'Favorilere eklendi.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

router.get('/check', authenticate, async (req, res) => {
  try {
    const { product_id, food_id, item_type } = req.query;
    const checkCol = item_type === 'product' ? 'product_id' : 'food_id';
    const checkId = item_type === 'product' ? product_id : food_id;

    const [existing] = await pool.execute(
      `SELECT id FROM favorites WHERE user_id = ? AND ${checkCol} = ? AND item_type = ?`,
      [req.user.id, checkId, item_type]
    );
    res.json({ success: true, favorited: existing.length > 0 });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

module.exports = router;
