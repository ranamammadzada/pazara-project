-- ═══════════════════════════════════════════════════════════════
-- PazaRa Veritabanı Şeması
-- Modern E-Ticaret + Yemek Sipariş Platformu
-- ═══════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS pazara_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pazara_db;

-- ─── Kullanıcılar Tablosu ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  bio TEXT,
  role ENUM('user', 'seller', 'admin') DEFAULT 'user',
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  preferred_language ENUM('tr', 'en', 'ru', 'az') DEFAULT 'tr',
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Türkiye',
  followers_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_role (role)
);

-- ─── Kategoriler Tablosu ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  name_ru VARCHAR(100),
  name_az VARCHAR(100),
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  image_url VARCHAR(500),
  parent_id INT NULL,
  type ENUM('product', 'food', 'both') DEFAULT 'both',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_slug (slug),
  INDEX idx_type (type),
  INDEX idx_parent (parent_id)
);

-- ─── Ürünler Tablosu ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  seller_id INT NOT NULL,
  category_id INT,
  name VARCHAR(200) NOT NULL,
  name_en VARCHAR(200),
  name_ru VARCHAR(200),
  name_az VARCHAR(200),
  description TEXT,
  description_en TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  discount_percent INT DEFAULT 0,
  stock_quantity INT DEFAULT 0,
  sku VARCHAR(100) UNIQUE,
  brand VARCHAR(100),
  images JSON,
  videos JSON,
  tags JSON,
  hashtags JSON,
  specifications JSON,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  sold_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_trending BOOLEAN DEFAULT FALSE,
  product_type ENUM('physical', 'digital') DEFAULT 'physical',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_seller (seller_id),
  INDEX idx_category (category_id),
  INDEX idx_price (price),
  INDEX idx_rating (rating),
  INDEX idx_trending (is_trending),
  FULLTEXT INDEX ft_search (name, description, brand)
);

-- ─── Yemek Ürünleri Tablosu ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS food_products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  restaurant_id INT NOT NULL,
  category_id INT,
  name VARCHAR(200) NOT NULL,
  name_en VARCHAR(200),
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  discount_percent INT DEFAULT 0,
  images JSON,
  videos JSON,
  hashtags JSON,
  ingredients TEXT,
  allergens TEXT,
  calories INT,
  preparation_time INT COMMENT 'Dakika cinsinden hazırlama süresi',
  is_vegetarian BOOLEAN DEFAULT FALSE,
  is_vegan BOOLEAN DEFAULT FALSE,
  is_gluten_free BOOLEAN DEFAULT FALSE,
  is_spicy BOOLEAN DEFAULT FALSE,
  spice_level TINYINT DEFAULT 0 COMMENT '0-5 arası',
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INT DEFAULT 0,
  sold_count INT DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_trending BOOLEAN DEFAULT FALSE,
  tags JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_restaurant (restaurant_id),
  INDEX idx_available (is_available),
  FULLTEXT INDEX ft_food_search (name, description)
);

-- ─── Restoranlar / Satıcı Profilleri ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seller_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  shop_name VARCHAR(200) NOT NULL,
  shop_description TEXT,
  shop_logo VARCHAR(500),
  shop_banner VARCHAR(500),
  shop_images JSON,
  shop_videos JSON,
  shop_type ENUM('restaurant', 'clothing', 'electronics', 'general', 'mixed') DEFAULT 'general',
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INT DEFAULT 0,
  total_sales INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_open BOOLEAN DEFAULT TRUE,
  opening_hours JSON,
  delivery_time VARCHAR(50),
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  address TEXT,
  city VARCHAR(100),
  phone VARCHAR(20),
  website VARCHAR(200),
  social_links JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── Sepet Tablosu ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_cart (user_id)
);

-- ─── Sepet Öğeleri Tablosu ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT NOT NULL,
  product_id INT NULL,
  food_id INT NULL,
  item_type ENUM('product', 'food') NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (food_id) REFERENCES food_products(id) ON DELETE CASCADE,
  INDEX idx_cart (cart_id)
);

-- ─── Siparişler Tablosu ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uuid VARCHAR(36) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status ENUM('pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  payment_method ENUM('credit_card', 'debit_card', 'cash', 'wallet') DEFAULT 'credit_card',
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  delivery_address TEXT NOT NULL,
  delivery_city VARCHAR(100),
  delivery_notes TEXT,
  estimated_delivery TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_orders (user_id),
  INDEX idx_status (status),
  INDEX idx_order_number (order_number)
);

-- ─── Sipariş Öğeleri Tablosu ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NULL,
  food_id INT NULL,
  item_type ENUM('product', 'food') NOT NULL,
  item_name VARCHAR(200) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  FOREIGN KEY (food_id) REFERENCES food_products(id) ON DELETE SET NULL,
  INDEX idx_order (order_id)
);

-- ─── Favoriler Tablosu ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NULL,
  food_id INT NULL,
  item_type ENUM('product', 'food') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (food_id) REFERENCES food_products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_favorite (user_id, product_id, food_id, item_type),
  INDEX idx_user_favorites (user_id)
);

-- ─── Yorumlar Tablosu ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NULL,
  food_id INT NULL,
  item_type ENUM('product', 'food') NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(200),
  comment TEXT,
  images JSON,
  likes_count INT DEFAULT 0,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (food_id) REFERENCES food_products(id) ON DELETE CASCADE,
  INDEX idx_product_reviews (product_id),
  INDEX idx_food_reviews (food_id),
  INDEX idx_user_reviews (user_id)
);

-- ─── Hashtag Tablosu ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hashtags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  usage_count INT DEFAULT 0,
  is_trending BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  category ENUM('brand', 'product', 'food', 'fashion', 'general') DEFAULT 'general',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_trending (is_trending),
  INDEX idx_usage (usage_count)
);

-- ─── Ürün-Hashtag İlişki Tablosu ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_hashtags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NULL,
  food_id INT NULL,
  hashtag_id INT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (food_id) REFERENCES food_products(id) ON DELETE CASCADE,
  FOREIGN KEY (hashtag_id) REFERENCES hashtags(id) ON DELETE CASCADE,
  INDEX idx_hashtag (hashtag_id)
);

-- ─── Chatbot Mesajları Tablosu ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chatbot_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  session_id VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  response TEXT,
  message_type ENUM('user', 'bot') NOT NULL,
  intent VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_session (session_id),
  INDEX idx_user_chat (user_id)
);

-- ─── AI Önerileri Tablosu ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NULL,
  food_id INT NULL,
  item_type ENUM('product', 'food') NOT NULL,
  score DECIMAL(5, 4) DEFAULT 0,
  reason VARCHAR(200),
  is_shown BOOLEAN DEFAULT FALSE,
  is_clicked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (food_id) REFERENCES food_products(id) ON DELETE CASCADE,
  INDEX idx_user_recs (user_id)
);

-- ─── Kullanıcı Mesajlaşma Tablosu ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  content TEXT NOT NULL,
  message_type ENUM('text', 'image', 'product') DEFAULT 'text',
  product_id INT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_sender (sender_id),
  INDEX idx_receiver (receiver_id),
  INDEX idx_conversation (sender_id, receiver_id)
);

-- ─── Takip Sistemi Tablosu ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS follows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  follower_id INT NOT NULL,
  following_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_follow (follower_id, following_id),
  INDEX idx_follower (follower_id),
  INDEX idx_following (following_id)
);

-- ─── Bildirimler Tablosu ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('order', 'message', 'follow', 'review', 'promotion', 'system') NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSON,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_notifications (user_id),
  INDEX idx_unread (user_id, is_read)
);

-- ─── Kampanyalar / Bannerlar Tablosu ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(300),
  image_url VARCHAR(500),
  link_url VARCHAR(500),
  button_text VARCHAR(100),
  position ENUM('hero', 'middle', 'sidebar', 'popup') DEFAULT 'hero',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  starts_at TIMESTAMP NULL,
  ends_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Arama Geçmişi Tablosu ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS search_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  query VARCHAR(200) NOT NULL,
  results_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_search (user_id),
  INDEX idx_query (query)
);

-- ─── Kupon / İndirim Tablosu ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type ENUM('percentage', 'fixed') NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount DECIMAL(10, 2) NULL,
  usage_limit INT NULL,
  used_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_code (code)
);
