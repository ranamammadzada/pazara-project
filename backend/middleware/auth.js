/**
 * JWT Authentication Middleware
 * Token doğrulama ve kullanıcı yetkilendirme
 */

const jwt = require('jsonwebtoken');
const pool = require('../database/db');

// ─── Token Doğrulama ──────────────────────────────────────────────────────────
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Erişim token\'ı bulunamadı. Lütfen giriş yapın.'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Kullanıcıyı veritabanından kontrol et
    const [users] = await pool.execute(
      'SELECT id, uuid, username, email, role, is_active, full_name, avatar_url FROM users WHERE id = ? AND is_active = TRUE',
      [decoded.userId]
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı bulunamadı veya hesap devre dışı.'
      });
    }
    
    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz token.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token süresi dolmuş. Lütfen tekrar giriş yapın.'
      });
    }
    next(error);
  }
};

// ─── Opsiyonel Authentication ─────────────────────────────────────────────────
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const [users] = await pool.execute(
      'SELECT id, uuid, username, email, role, is_active, full_name, avatar_url FROM users WHERE id = ? AND is_active = TRUE',
      [decoded.userId]
    );
    
    req.user = users.length > 0 ? users[0] : null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

// ─── Admin Yetkilendirme ───────────────────────────────────────────────────────
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Bu işlem için admin yetkisi gereklidir.'
    });
  }
  next();
};

// ─── Satıcı Yetkilendirme ─────────────────────────────────────────────────────
const requireSeller = (req, res, next) => {
  if (!req.user || (req.user.role !== 'seller' && req.user.role !== 'admin')) {
    return res.status(403).json({
      success: false,
      message: 'Bu işlem için satıcı yetkisi gereklidir.'
    });
  }
  next();
};

module.exports = { authenticate, optionalAuth, requireAdmin, requireSeller };
