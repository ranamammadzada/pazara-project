/**
 * Authentication Routes
 * Kayıt, giriş, çıkış ve profil işlemleri
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const pool = require('../database/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ─── Kayıt Ol ─────────────────────────────────────────────────────────────────
router.post('/register', [
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Kullanıcı adı 3-50 karakter olmalıdır'),
  body('email').isEmail().normalizeEmail().withMessage('Geçerli bir e-posta adresi girin'),
  body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır'),
  body('full_name').trim().isLength({ min: 2 }).withMessage('Ad soyad en az 2 karakter olmalıdır')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, email, password, full_name, phone, role = 'user' } = req.body;

    // Kullanıcı var mı kontrol et
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Bu e-posta veya kullanıcı adı zaten kullanılıyor.'
      });
    }

    // Şifreyi hashle
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);
    const uuid = uuidv4();

    // Kullanıcıyı kaydet
    const [result] = await pool.execute(
      `INSERT INTO users (uuid, username, email, password_hash, full_name, phone, role) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuid, username, email, password_hash, full_name, phone || null, role]
    );

    // Satıcı ise profil oluştur
    if (role === 'seller') {
      await pool.execute(
        'INSERT INTO seller_profiles (user_id, shop_name) VALUES (?, ?)',
        [result.insertId, full_name + "'s Shop"]
      );
    }

    // Sepet oluştur
    await pool.execute('INSERT INTO carts (user_id) VALUES (?)', [result.insertId]);

    // JWT token oluştur
    const token = jwt.sign(
      { userId: result.insertId, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Hesabınız başarıyla oluşturuldu!',
      token,
      user: {
        id: result.insertId,
        uuid,
        username,
        email,
        full_name,
        role
      }
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası oluştu.' });
  }
});

// ─── Giriş Yap ────────────────────────────────────────────────────────────────
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Geçerli bir e-posta adresi girin'),
  body('password').notEmpty().withMessage('Şifre gereklidir')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Kullanıcıyı bul
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'E-posta veya şifre hatalı.'
      });
    }

    const user = users[0];

    // Şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'E-posta veya şifre hatalı.'
      });
    }

    // JWT token oluştur
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Giriş başarılı!',
      token,
      user: {
        id: user.id,
        uuid: user.uuid,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        role: user.role,
        preferred_language: user.preferred_language
      }
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası oluştu.' });
  }
});

// ─── Profil Bilgisi ───────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT id, uuid, username, email, full_name, phone, avatar_url, bio, role, 
              is_verified, preferred_language, address, city, country, 
              followers_count, following_count, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
    }

    res.json({ success: true, user: users[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// ─── Profil Güncelle ──────────────────────────────────────────────────────────
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { full_name, phone, bio, address, city, preferred_language, avatar_url } = req.body;

    await pool.execute(
      `UPDATE users SET full_name = ?, phone = ?, bio = ?, address = ?, 
       city = ?, preferred_language = ?, avatar_url = ? WHERE id = ?`,
      [full_name, phone, bio, address, city, preferred_language, avatar_url, req.user.id]
    );

    res.json({ success: true, message: 'Profil güncellendi.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

// ─── Şifre Değiştir ───────────────────────────────────────────────────────────
router.put('/change-password', authenticate, [
  body('current_password').notEmpty(),
  body('new_password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    const [users] = await pool.execute('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    const isValid = await bcrypt.compare(current_password, users[0].password_hash);

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Mevcut şifre hatalı.' });
    }

    const salt = await bcrypt.genSalt(12);
    const newHash = await bcrypt.hash(new_password, salt);

    await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

    res.json({ success: true, message: 'Şifre başarıyla değiştirildi.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
});

module.exports = router;
