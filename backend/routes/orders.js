/**
 * Orders Routes - Sipariş İşlemleri
 */
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool = require('../database/db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// ─── Sipariş Oluştur ──────────────────────────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { delivery_address, delivery_city, delivery_notes, payment_method = 'credit_card', coupon_code } = req.body;

    // Sepeti getir
    const [carts] = await connection.execute('SELECT id FROM carts WHERE user_id = ?', [req.user.id]);
    if (!carts.length) return res.status(400).json({ success: false, message: 'Sepet bulunamadı.' });

    const [items] = await connection.execute(
      `SELECT ci.*, 
        CASE WHEN ci.item_type = 'product' THEN p.name ELSE f.name END as item_name,
        CASE WHEN ci.item_type = 'product' THEN p.stock_quantity ELSE 999 END as stock
       FROM cart_items ci
       LEFT JOIN products p ON ci.product_id = p.id
       LEFT JOIN food_products f ON ci.food_id = f.id
       WHERE ci.cart_id = ?`,
      [carts[0].id]
    );

    if (!items.length) return res.status(400).json({ success: false, message: 'Sepet boş.' });

    // Stok kontrolü
    for (const item of items) {
      if (item.item_type === 'product' && item.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `${item.item_name} için yeterli stok yok.` });
      }
    }

    const subtotal = items.reduce((sum, i) => sum + (i.unit_price * i.quantity), 0);
    let discount_amount = 0;

    // Kupon kontrolü
    if (coupon_code) {
      const [coupons] = await connection.execute(
        'SELECT * FROM coupons WHERE code = ? AND is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW())',
        [coupon_code]
      );
      if (coupons.length > 0) {
        const coupon = coupons[0];
        if (subtotal >= coupon.min_order_amount) {
          discount_amount = coupon.discount_type === 'percentage'
            ? Math.min(subtotal * (coupon.discount_value / 100), coupon.max_discount || Infinity)
            : coupon.discount_value;
          await connection.execute('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [coupon.id]);
        }
      }
    }

    const delivery_fee = 0; // Ücretsiz kargo
    const total_amount = subtotal - discount_amount + delivery_fee;
    const order_number = 'PZR' + Date.now();
    const uuid = uuidv4();

    // Sipariş oluştur
    const [orderResult] = await connection.execute(
      `INSERT INTO orders (uuid, user_id, order_number, total_amount, subtotal, delivery_fee, 
       discount_amount, payment_method, delivery_address, delivery_city, delivery_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuid, req.user.id, order_number, total_amount, subtotal, delivery_fee,
       discount_amount, payment_method, delivery_address, delivery_city, delivery_notes]
    );

    // Sipariş öğelerini ekle
    for (const item of items) {
      await connection.execute(
        `INSERT INTO order_items (order_id, product_id, food_id, item_type, item_name, quantity, unit_price, total_price)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderResult.insertId, item.product_id, item.food_id, item.item_type,
         item.item_name, item.quantity, item.unit_price, item.unit_price * item.quantity]
      );

      // Stok güncelle
      if (item.item_type === 'product') {
        await connection.execute(
          'UPDATE products SET stock_quantity = stock_quantity - ?, sold_count = sold_count + ? WHERE id = ?',
          [item.quantity, item.quantity, item.product_id]
        );
      } else {
        await connection.execute(
          'UPDATE food_products SET sold_count = sold_count + ? WHERE id = ?',
          [item.quantity, item.food_id]
        );
      }
    }

    // Sepeti temizle
    await connection.execute('DELETE FROM cart_items WHERE cart_id = ?', [carts[0].id]);

    // Bildirim ekle
    await connection.execute(
      `INSERT INTO notifications (user_id, type, title, message) VALUES (?, 'order', ?, ?)`,
      [req.user.id, 'Siparişiniz Alındı!', `${order_number} numaralı siparişiniz başarıyla oluşturuldu.`]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Siparişiniz başarıyla oluşturuldu!',
      order: { id: orderResult.insertId, order_number, total_amount, uuid }
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  } finally {
    connection.release();
  }
});

// ─── Siparişleri Listele ──────────────────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    let where = 'o.user_id = ?';
    const params = [req.user.id];

    if (status) { where += ' AND o.status = ?'; params.push(status); }

    const [orders] = await pool.execute(
      `SELECT o.*, COUNT(oi.id) as item_count FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE ${where} GROUP BY o.id ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// ─── Sipariş Detayı ───────────────────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!orders.length) return res.status(404).json({ success: false, message: 'Sipariş bulunamadı.' });

    const [items] = await pool.execute(
      'SELECT * FROM order_items WHERE order_id = ?',
      [req.params.id]
    );

    res.json({ success: true, order: orders[0], items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// ─── Sipariş İptal ────────────────────────────────────────────────────────────
router.put('/:id/cancel', authenticate, async (req, res) => {
  try {
    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE id = ? AND user_id = ? AND status = "pending"',
      [req.params.id, req.user.id]
    );
    if (!orders.length) return res.status(400).json({ success: false, message: 'Sipariş iptal edilemiyor.' });

    await pool.execute('UPDATE orders SET status = "cancelled" WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Sipariş iptal edildi.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

module.exports = router;
