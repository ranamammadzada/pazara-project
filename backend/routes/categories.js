/**
 * Categories Routes - Kategoriler
 */
const express = require('express');
const pool = require('../database/db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { type, lang = 'tr' } = req.query;
    let where = 'is_active = TRUE AND parent_id IS NULL';
    const params = [];
    if (type) { where += ' AND type IN (?, "both")'; params.push(type); }

    const nameField = ['en', 'ru', 'az'].includes(lang) ? `name_${lang}` : 'name';

    const [categories] = await pool.execute(
      `SELECT id, ${nameField} as name, name, slug, icon, image_url, type, sort_order FROM categories WHERE ${where} ORDER BY sort_order`,
      params
    );

    // Alt kategorileri getir
    for (const cat of categories) {
      const [subs] = await pool.execute(
        `SELECT id, ${nameField} as name, name, slug, icon, type FROM categories WHERE parent_id = ? AND is_active = TRUE ORDER BY sort_order`,
        [cat.id]
      );
      cat.subcategories = subs;
    }

    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const [categories] = await pool.execute(
      'SELECT * FROM categories WHERE slug = ? AND is_active = TRUE',
      [req.params.slug]
    );
    if (!categories.length) return res.status(404).json({ success: false, message: 'Kategori bulunamadı.' });
    res.json({ success: true, category: categories[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

module.exports = router;
