/**
 * Hashtags Routes - Hashtag ve Trend Sistemi
 */
const express = require('express');
const pool = require('../database/db');
const router = express.Router();

// Trend hashtagler
router.get('/trending', async (req, res) => {
  try {
    const [hashtags] = await pool.execute(
      'SELECT * FROM hashtags WHERE is_trending = TRUE ORDER BY usage_count DESC LIMIT 20'
    );
    res.json({ success: true, hashtags });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// Öne çıkan hashtagler
router.get('/featured', async (req, res) => {
  try {
    const [hashtags] = await pool.execute(
      'SELECT * FROM hashtags WHERE is_featured = TRUE ORDER BY usage_count DESC LIMIT 10'
    );
    res.json({ success: true, hashtags });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// Hashtag ile ürün ara
router.get('/:slug/products', async (req, res) => {
  try {
    const [hashtag] = await pool.execute('SELECT * FROM hashtags WHERE slug = ?', [req.params.slug]);
    if (!hashtag.length) return res.status(404).json({ success: false, message: 'Hashtag bulunamadı.' });

    const [products] = await pool.execute(
      `SELECT p.*, c.name as category_name FROM products p
       JOIN product_hashtags ph ON p.id = ph.product_id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE ph.hashtag_id = ? AND p.is_active = TRUE
       ORDER BY p.sold_count DESC LIMIT 20`,
      [hashtag[0].id]
    );

    const [foods] = await pool.execute(
      `SELECT f.*, c.name as category_name FROM food_products f
       JOIN product_hashtags ph ON f.id = ph.food_id
       LEFT JOIN categories c ON f.category_id = c.id
       WHERE ph.hashtag_id = ? AND f.is_available = TRUE
       ORDER BY f.sold_count DESC LIMIT 20`,
      [hashtag[0].id]
    );

    res.json({ success: true, hashtag: hashtag[0], products, foods });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// Tüm hashtagler
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let where = '1=1';
    const params = [];
    if (category) { where += ' AND category = ?'; params.push(category); }
    if (search) { where += ' AND name LIKE ?'; params.push(`%${search}%`); }

    const [hashtags] = await pool.execute(
      `SELECT * FROM hashtags WHERE ${where} ORDER BY usage_count DESC LIMIT 50`,
      params
    );
    res.json({ success: true, hashtags });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

module.exports = router;
