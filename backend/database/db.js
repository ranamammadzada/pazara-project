/**
 * MySQL Veritabanı Bağlantısı
 * mysql2 ile connection pool kullanımı
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Connection Pool oluştur
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pazara_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4'
});

// Bağlantıyı test et
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL veritabanına başarıyla bağlandı');
    connection.release();
  } catch (error) {
    console.error('❌ MySQL bağlantı hatası:', error.message);
    process.exit(1);
  }
};

testConnection();

module.exports = pool;
