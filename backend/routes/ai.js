/**
 * AI Routes - Yapay Zeka Öneri ve Chatbot Sistemi
 */
const express = require('express');
const pool = require('../database/db');
const { authenticate, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// ─── AI Ürün Önerileri ────────────────────────────────────────────────────────
router.get('/recommendations', optionalAuth, async (req, res) => {
  try {
    let recommendations = [];

    if (req.user) {
      // Kullanıcının sipariş geçmişine göre öneri
      const [orderHistory] = await pool.execute(
        `SELECT oi.product_id, oi.food_id, oi.item_type, p.category_id as prod_cat, f.category_id as food_cat
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         LEFT JOIN food_products f ON oi.food_id = f.id
         JOIN orders o ON oi.order_id = o.id
         WHERE o.user_id = ? ORDER BY o.created_at DESC LIMIT 20`,
        [req.user.id]
      );

      const categoryIds = [...new Set(orderHistory.map(i => i.prod_cat || i.food_cat).filter(Boolean))];

      if (categoryIds.length > 0) {
        const placeholders = categoryIds.map(() => '?').join(',');
        const [products] = await pool.execute(
          `SELECT p.*, 'product' as item_type, c.name as category_name, sp.shop_name
           FROM products p
           LEFT JOIN categories c ON p.category_id = c.id
           LEFT JOIN seller_profiles sp ON p.seller_id = sp.user_id
           WHERE p.category_id IN (${placeholders}) AND p.is_active = TRUE
           ORDER BY p.rating DESC, p.sold_count DESC LIMIT 6`,
          categoryIds
        );
        recommendations = [...recommendations, ...products];
      }
    }

    // Genel trend ürünler ekle
    if (recommendations.length < 8) {
      const [trending] = await pool.execute(
        `SELECT p.*, 'product' as item_type, c.name as category_name, sp.shop_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         LEFT JOIN seller_profiles sp ON p.seller_id = sp.user_id
         WHERE p.is_trending = TRUE AND p.is_active = TRUE
         ORDER BY p.sold_count DESC LIMIT 8`
      );
      recommendations = [...recommendations, ...trending].slice(0, 12);
    }

    // Yemek önerileri
    const [foodRecs] = await pool.execute(
      `SELECT f.*, 'food' as item_type, c.name as category_name, sp.shop_name as restaurant_name
       FROM food_products f
       LEFT JOIN categories c ON f.category_id = c.id
       LEFT JOIN seller_profiles sp ON f.restaurant_id = sp.user_id
       WHERE f.is_featured = TRUE AND f.is_available = TRUE
       ORDER BY f.rating DESC LIMIT 6`
    );

    res.json({
      success: true,
      recommendations,
      food_recommendations: foodRecs,
      ai_message: req.user
        ? `Merhaba ${req.user.full_name || req.user.username}! Geçmiş alışverişlerinize göre öneriler hazırladım.`
        : 'Sizin için en popüler ürünleri seçtim!'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// ─── Benzer Ürünler ───────────────────────────────────────────────────────────
router.get('/similar/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    let similar = [];

    if (type === 'product') {
      const [product] = await pool.execute('SELECT category_id, price FROM products WHERE id = ?', [id]);
      if (product.length > 0) {
        const [products] = await pool.execute(
          `SELECT p.*, c.name as category_name FROM products p
           LEFT JOIN categories c ON p.category_id = c.id
           WHERE p.category_id = ? AND p.id != ? AND p.is_active = TRUE
           AND p.price BETWEEN ? AND ?
           ORDER BY p.rating DESC LIMIT 8`,
          [product[0].category_id, id, product[0].price * 0.5, product[0].price * 2]
        );
        similar = products;
      }
    } else {
      const [food] = await pool.execute('SELECT category_id FROM food_products WHERE id = ?', [id]);
      if (food.length > 0) {
        const [foods] = await pool.execute(
          `SELECT f.*, c.name as category_name FROM food_products f
           LEFT JOIN categories c ON f.category_id = c.id
           WHERE f.category_id = ? AND f.id != ? AND f.is_available = TRUE
           ORDER BY f.rating DESC LIMIT 8`,
          [food[0].category_id, id]
        );
        similar = foods;
      }
    }

    res.json({ success: true, similar });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// ─── Arama Önerileri ──────────────────────────────────────────────────────────
router.get('/search-suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ success: true, suggestions: [] });

    const [products] = await pool.execute(
      `SELECT name, 'product' as type FROM products WHERE name LIKE ? AND is_active = TRUE LIMIT 5`,
      [`%${q}%`]
    );
    const [foods] = await pool.execute(
      `SELECT name, 'food' as type FROM food_products WHERE name LIKE ? AND is_available = TRUE LIMIT 5`,
      [`%${q}%`]
    );
    const [hashtags] = await pool.execute(
      `SELECT name, 'hashtag' as type FROM hashtags WHERE name LIKE ? LIMIT 3`,
      [`%${q}%`]
    );

    res.json({ success: true, suggestions: [...products, ...foods, ...hashtags] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

module.exports = router;
