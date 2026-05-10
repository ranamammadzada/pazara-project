/**
 * Food Products Routes
 * Yemek ürünleri CRUD işlemleri
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool = require('../database/db');
const { authenticate, optionalAuth, requireSeller } = require('../middleware/auth');

const router = express.Router();

// ─── Tüm Yemekleri Getir ──────────────────────────────────────────────────────
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1, limit = 20, category, search, restaurant_id,
      is_vegetarian, is_vegan, is_gluten_free, trending, featured,
      sort = 'created_at', order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['f.is_available = TRUE'];
    let params = [];

    if (category) { whereConditions.push('f.category_id = ?'); params.push(category); }
    if (search) {
      whereConditions.push('(f.name LIKE ? OR f.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (restaurant_id) { whereConditions.push('f.restaurant_id = ?'); params.push(restaurant_id); }
    if (is_vegetarian === 'true') { whereConditions.push('f.is_vegetarian = TRUE'); }
    if (is_vegan === 'true') { whereConditions.push('f.is_vegan = TRUE'); }
    if (is_gluten_free === 'true') { whereConditions.push('f.is_gluten_free = TRUE'); }
    if (trending === 'true') { whereConditions.push('f.is_trending = TRUE'); }
    if (featured === 'true') { whereConditions.push('f.is_featured = TRUE'); }

    const whereClause = whereConditions.join(' AND ');

    const [foods] = await pool.execute(
      `SELECT f.*, c.name as category_name, u.username as restaurant_username,
              sp.shop_name as restaurant_name, sp.shop_logo as restaurant_logo,
              sp.is_verified as restaurant_verified, sp.delivery_time, sp.delivery_fee
       FROM food_products f
       LEFT JOIN categories c ON f.category_id = c.id
       LEFT JOIN users u ON f.restaurant_id = u.id
       LEFT JOIN seller_profiles sp ON u.id = sp.user_id
       WHERE ${whereClause}
       ORDER BY f.${sort} ${order === 'ASC' ? 'ASC' : 'DESC'}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM food_products f WHERE ${whereClause}`,
      params
    );

    res.json({
      success: true,
      foods,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// ─── Tek Yemek Getir ──────────────────────────────────────────────────────────
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const [foods] = await pool.execute(
      `SELECT f.*, c.name as category_name, u.username as restaurant_username,
              sp.shop_name as restaurant_name, sp.shop_logo, sp.delivery_time,
              sp.delivery_fee, sp.min_order_amount, sp.is_verified as restaurant_verified
       FROM food_products f
       LEFT JOIN categories c ON f.category_id = c.id
       LEFT JOIN users u ON f.restaurant_id = u.id
       LEFT JOIN seller_profiles sp ON u.id = sp.user_id
       WHERE f.id = ? AND f.is_available = TRUE`,
      [req.params.id]
    );

    if (foods.length === 0) {
      return res.status(404).json({ success: false, message: 'Yemek bulunamadı.' });
    }

    const [reviews] = await pool.execute(
      `SELECT r.*, u.username, u.avatar_url FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.food_id = ? AND r.is_active = TRUE
       ORDER BY r.created_at DESC LIMIT 10`,
      [req.params.id]
    );

    res.json({ success: true, food: foods[0], reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// ─── Yemek Ekle ───────────────────────────────────────────────────────────────
router.post('/', authenticate, requireSeller, async (req, res) => {
  try {
    const {
      category_id, name, description, price, original_price, images, videos,
      ingredients, allergens, calories, preparation_time,
      is_vegetarian, is_vegan, is_gluten_free, is_spicy, spice_level, tags, hashtags
    } = req.body;

    const uuid = uuidv4();
    const discount_percent = original_price && original_price > price
      ? Math.round(((original_price - price) / original_price) * 100) : 0;

    const [result] = await pool.execute(
      `INSERT INTO food_products (uuid, restaurant_id, category_id, name, description, 
       price, original_price, discount_percent, images, videos, ingredients, allergens, 
       calories, preparation_time, is_vegetarian, is_vegan, is_gluten_free, is_spicy, 
       spice_level, tags, hashtags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuid, req.user.id, category_id, name, description, price, original_price,
       discount_percent, JSON.stringify(images || []), JSON.stringify(videos || []),
       ingredients, allergens, calories, preparation_time || 30,
       is_vegetarian || false, is_vegan || false, is_gluten_free || false,
       is_spicy || false, spice_level || 0, JSON.stringify(tags || []),
       JSON.stringify(hashtags || [])]
    );

    res.status(201).json({ success: true, message: 'Yemek eklendi.', foodId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// ─── Restoran Menüsü ──────────────────────────────────────────────────────────
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const [foods] = await pool.execute(
      `SELECT f.*, c.name as category_name FROM food_products f
       LEFT JOIN categories c ON f.category_id = c.id
       WHERE f.restaurant_id = ? AND f.is_available = TRUE
       ORDER BY c.name, f.name`,
      [req.params.restaurantId]
    );

    // Kategorilere göre grupla
    const grouped = foods.reduce((acc, food) => {
      const cat = food.category_name || 'Diğer';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(food);
      return acc;
    }, {});

    res.json({ success: true, menu: grouped, foods });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

module.exports = router;
