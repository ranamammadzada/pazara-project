/**
 * Products Routes
 * Ürün CRUD işlemleri, filtreleme ve arama
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool = require('../database/db');
const { authenticate, optionalAuth, requireSeller } = require('../middleware/auth');

const router = express.Router();

// ─── Tüm Ürünleri Getir ───────────────────────────────────────────────────────
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1, limit = 20, category, search, min_price, max_price,
      sort = 'created_at', order = 'DESC', brand, trending, featured
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['p.is_active = TRUE'];
    let params = [];

    if (category) {
      whereConditions.push('p.category_id = ?');
      params.push(category);
    }
    if (search) {
      whereConditions.push('(p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (min_price) {
      whereConditions.push('p.price >= ?');
      params.push(min_price);
    }
    if (max_price) {
      whereConditions.push('p.price <= ?');
      params.push(max_price);
    }
    if (brand) {
      whereConditions.push('p.brand = ?');
      params.push(brand);
    }
    if (trending === 'true') {
      whereConditions.push('p.is_trending = TRUE');
    }
    if (featured === 'true') {
      whereConditions.push('p.is_featured = TRUE');
    }

    const whereClause = whereConditions.join(' AND ');
    const validSorts = ['created_at', 'price', 'rating', 'sold_count', 'view_count'];
    const sortField = validSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';

    const [products] = await pool.execute(
      `SELECT p.*, c.name as category_name, u.username as seller_name, 
              sp.shop_name, sp.is_verified as seller_verified
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN users u ON p.seller_id = u.id
       LEFT JOIN seller_profiles sp ON u.id = sp.user_id
       WHERE ${whereClause}
       ORDER BY p.${sortField} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM products p WHERE ${whereClause}`,
      params
    );

    res.json({
      success: true,
      products,
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

// ─── Tek Ürün Getir ───────────────────────────────────────────────────────────
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const [products] = await pool.execute(
      `SELECT p.*, c.name as category_name, u.username as seller_name,
              u.avatar_url as seller_avatar, sp.shop_name, sp.shop_logo,
              sp.is_verified as seller_verified, sp.rating as seller_rating
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN users u ON p.seller_id = u.id
       LEFT JOIN seller_profiles sp ON u.id = sp.user_id
       WHERE p.id = ? AND p.is_active = TRUE`,
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Ürün bulunamadı.' });
    }

    // Görüntülenme sayısını artır
    await pool.execute('UPDATE products SET view_count = view_count + 1 WHERE id = ?', [req.params.id]);

    // Yorumları getir
    const [reviews] = await pool.execute(
      `SELECT r.*, u.username, u.avatar_url FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? AND r.is_active = TRUE
       ORDER BY r.created_at DESC LIMIT 10`,
      [req.params.id]
    );

    res.json({ success: true, product: products[0], reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// ─── Ürün Oluştur ─────────────────────────────────────────────────────────────
router.post('/', authenticate, requireSeller, async (req, res) => {
  try {
    const {
      category_id, name, name_en, description, price, original_price,
      stock_quantity, sku, brand, images, videos, tags, hashtags,
      specifications, is_featured
    } = req.body;

    const uuid = uuidv4();
    const discount_percent = original_price && original_price > price
      ? Math.round(((original_price - price) / original_price) * 100)
      : 0;

    const [result] = await pool.execute(
      `INSERT INTO products (uuid, seller_id, category_id, name, name_en, description, 
       price, original_price, discount_percent, stock_quantity, sku, brand, images, 
       videos, tags, hashtags, specifications, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuid, req.user.id, category_id, name, name_en, description, price,
       original_price, discount_percent, stock_quantity || 0, sku, brand,
       JSON.stringify(images || []), JSON.stringify(videos || []),
       JSON.stringify(tags || []), JSON.stringify(hashtags || []),
       JSON.stringify(specifications || {}), is_featured || false]
    );

    res.status(201).json({
      success: true,
      message: 'Ürün başarıyla eklendi.',
      productId: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// ─── Ürün Güncelle ────────────────────────────────────────────────────────────
router.put('/:id', authenticate, requireSeller, async (req, res) => {
  try {
    const [products] = await pool.execute(
      'SELECT id FROM products WHERE id = ? AND seller_id = ?',
      [req.params.id, req.user.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Ürün bulunamadı veya yetkiniz yok.' });
    }

    const { name, description, price, original_price, stock_quantity, images, videos, is_active } = req.body;

    await pool.execute(
      `UPDATE products SET name = ?, description = ?, price = ?, original_price = ?,
       stock_quantity = ?, images = ?, videos = ?, is_active = ? WHERE id = ?`,
      [name, description, price, original_price, stock_quantity,
       JSON.stringify(images || []), JSON.stringify(videos || []), is_active, req.params.id]
    );

    res.json({ success: true, message: 'Ürün güncellendi.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// ─── Ürün Sil ─────────────────────────────────────────────────────────────────
router.delete('/:id', authenticate, requireSeller, async (req, res) => {
  try {
    await pool.execute(
      'UPDATE products SET is_active = FALSE WHERE id = ? AND seller_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ success: true, message: 'Ürün silindi.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// ─── Trend Ürünler ────────────────────────────────────────────────────────────
router.get('/trending/list', async (req, res) => {
  try {
    const [products] = await pool.execute(
      `SELECT p.*, c.name as category_name, sp.shop_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN seller_profiles sp ON p.seller_id = sp.user_id
       WHERE p.is_trending = TRUE AND p.is_active = TRUE
       ORDER BY p.sold_count DESC LIMIT 12`
    );
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// ─── Öne Çıkan Ürünler ────────────────────────────────────────────────────────
router.get('/featured/list', async (req, res) => {
  try {
    const [products] = await pool.execute(
      `SELECT p.*, c.name as category_name, sp.shop_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN seller_profiles sp ON p.seller_id = sp.user_id
       WHERE p.is_featured = TRUE AND p.is_active = TRUE
       ORDER BY p.rating DESC LIMIT 8`
    );
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

module.exports = router;
