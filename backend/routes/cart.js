/**
 * Cart Routes - Sepet İşlemleri
 */
const express = require('express');
const pool = require('../database/db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// ─── Sepeti Getir ─────────────────────────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const [carts] = await pool.execute('SELECT id FROM carts WHERE user_id = ?', [req.user.id]);
    if (carts.length === 0) {
      await pool.execute('INSERT INTO carts (user_id) VALUES (?)', [req.user.id]);
    }
    const cartId = carts.length > 0 ? carts[0].id : (await pool.execute('SELECT LAST_INSERT_ID() as id'))[0][0].id;

    const [items] = await pool.execute(
      `SELECT ci.*, 
        CASE WHEN ci.item_type = 'product' THEN p.name ELSE f.name END as item_name,
        CASE WHEN ci.item_type = 'product' THEN p.images ELSE f.images END as item_images,
        CASE WHEN ci.item_type = 'product' THEN p.stock_quantity ELSE NULL END as stock_quantity,
        CASE WHEN ci.item_type = 'product' THEN sp1.shop_name ELSE sp2.shop_name END as shop_name
       FROM cart_items ci
       LEFT JOIN products p ON ci.product_id = p.id
       LEFT JOIN food_products f ON ci.food_id = f.id
       LEFT JOIN seller_profiles sp1 ON p.seller_id = sp1.user_id
       LEFT JOIN seller_profiles sp2 ON f.restaurant_id = sp2.user_id
       WHERE ci.cart_id = ?`,
      [cartId]
    );

    const total = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

    res.json({ success: true, items, total: total.toFixed(2), cartId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// ─── Sepete Ekle ──────────────────────────────────────────────────────────────
router.post('/add', authenticate, async (req, res) => {
  try {
    const { product_id, food_id, item_type, quantity = 1, notes } = req.body;

    let [carts] = await pool.execute('SELECT id FROM carts WHERE user_id = ?', [req.user.id]);
    if (carts.length === 0) {
      const [r] = await pool.execute('INSERT INTO carts (user_id) VALUES (?)', [req.user.id]);
      carts = [{ id: r.insertId }];
    }
    const cartId = carts[0].id;

    // Fiyatı al
    let price;
    if (item_type === 'product') {
      const [p] = await pool.execute('SELECT price FROM products WHERE id = ?', [product_id]);
      if (!p.length) return res.status(404).json({ success: false, message: 'Ürün bulunamadı.' });
      price = p[0].price;
    } else {
      const [f] = await pool.execute('SELECT price FROM food_products WHERE id = ?', [food_id]);
      if (!f.length) return res.status(404).json({ success: false, message: 'Yemek bulunamadı.' });
      price = f[0].price;
    }

    // Zaten sepette var mı?
    const checkCol = item_type === 'product' ? 'product_id' : 'food_id';
    const checkId = item_type === 'product' ? product_id : food_id;
    const [existing] = await pool.execute(
      `SELECT id, quantity FROM cart_items WHERE cart_id = ? AND ${checkCol} = ? AND item_type = ?`,
      [cartId, checkId, item_type]
    );

    if (existing.length > 0) {
      await pool.execute(
        'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
        [quantity, existing[0].id]
      );
    } else {
      await pool.execute(
        `INSERT INTO cart_items (cart_id, product_id, food_id, item_type, quantity, unit_price, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [cartId, product_id || null, food_id || null, item_type, quantity, price, notes || null]
      );
    }

    res.json({ success: true, message: 'Sepete eklendi.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// ─── Adet Güncelle ────────────────────────────────────────────────────────────
router.put('/item/:itemId', authenticate, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) {
      await pool.execute('DELETE FROM cart_items WHERE id = ?', [req.params.itemId]);
      return res.json({ success: true, message: 'Ürün sepetten çıkarıldı.' });
    }
    await pool.execute('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, req.params.itemId]);
    res.json({ success: true, message: 'Adet güncellendi.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// ─── Sepetten Çıkar ───────────────────────────────────────────────────────────
router.delete('/item/:itemId', authenticate, async (req, res) => {
  try {
    await pool.execute('DELETE FROM cart_items WHERE id = ?', [req.params.itemId]);
    res.json({ success: true, message: 'Ürün sepetten çıkarıldı.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// ─── Sepeti Temizle ───────────────────────────────────────────────────────────
router.delete('/clear', authenticate, async (req, res) => {
  try {
    const [carts] = await pool.execute('SELECT id FROM carts WHERE user_id = ?', [req.user.id]);
    if (carts.length > 0) {
      await pool.execute('DELETE FROM cart_items WHERE cart_id = ?', [carts[0].id]);
    }
    res.json({ success: true, message: 'Sepet temizlendi.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

module.exports = router;
