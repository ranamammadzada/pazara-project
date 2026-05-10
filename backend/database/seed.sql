-- ═══════════════════════════════════════════════════════════════
-- PazaRa Örnek Veri (Seed Data)
-- ═══════════════════════════════════════════════════════════════

USE pazara_db;

-- ─── Kategoriler ──────────────────────────────────────────────────────────────
INSERT INTO categories (name, name_en, name_ru, name_az, slug, icon, type, sort_order) VALUES
-- Ana Kategoriler
('Yemek', 'Food', 'Еда', 'Yemək', 'yemek', '🍔', 'food', 1),
('Giyim', 'Clothing', 'Одежда', 'Geyim', 'giyim', '👗', 'product', 2),
('Elektronik', 'Electronics', 'Электроника', 'Elektronika', 'elektronik', '📱', 'product', 3),
('Kozmetik', 'Cosmetics', 'Косметика', 'Kosmetika', 'kozmetik', '💄', 'product', 4),
('Spor', 'Sports', 'Спорт', 'İdman', 'spor', '⚽', 'product', 5),
('Ev & Yaşam', 'Home & Living', 'Дом и жизнь', 'Ev və Həyat', 'ev-yasam', '🏠', 'product', 6),
('Kitap & Hobi', 'Books & Hobbies', 'Книги и хобби', 'Kitab və Hobbi', 'kitap-hobi', '📚', 'product', 7),
('Oyuncak', 'Toys', 'Игрушки', 'Oyuncaq', 'oyuncak', '🧸', 'product', 8),
('Otomotiv', 'Automotive', 'Автомобили', 'Avtomobil', 'otomotiv', '🚗', 'product', 9),
('Bahçe', 'Garden', 'Сад', 'Bağ', 'bahce', '🌱', 'product', 10),
-- Yemek Alt Kategorileri
('Pizza', 'Pizza', 'Пицца', 'Pizza', 'pizza', '🍕', 'food', 11),
('Burger', 'Burger', 'Бургер', 'Burger', 'burger', '🍔', 'food', 12),
('Sushi', 'Sushi', 'Суши', 'Suşi', 'sushi', '🍱', 'food', 13),
('Türk Mutfağı', 'Turkish Cuisine', 'Турецкая кухня', 'Türk Mətbəxi', 'turk-mutfagi', '🥙', 'food', 14),
('Tatlı & Pasta', 'Desserts', 'Десерты', 'Şirniyyat', 'tatli-pasta', '🎂', 'food', 15),
('İçecek', 'Beverages', 'Напитки', 'İçkilər', 'icecek', '☕', 'food', 16),
('Kahvaltı', 'Breakfast', 'Завтрак', 'Səhər yeməyi', 'kahvalti', '🥞', 'food', 17),
('Salata', 'Salad', 'Салат', 'Salat', 'salata', '🥗', 'food', 18),
-- Giyim Alt Kategorileri
('Kadın Giyim', 'Women Clothing', 'Женская одежда', 'Qadın Geyimi', 'kadin-giyim', '👚', 'product', 19),
('Erkek Giyim', 'Men Clothing', 'Мужская одежда', 'Kişi Geyimi', 'erkek-giyim', '👔', 'product', 20),
('Çocuk Giyim', 'Kids Clothing', 'Детская одежда', 'Uşaq Geyimi', 'cocuk-giyim', '👶', 'product', 21),
('Ayakkabı', 'Shoes', 'Обувь', 'Ayaqqabı', 'ayakkabi', '👟', 'product', 22),
('Çanta & Aksesuar', 'Bags & Accessories', 'Сумки и аксессуары', 'Çanta və Aksesuar', 'canta-aksesuar', '👜', 'product', 23);

-- ─── Hashtag'ler ──────────────────────────────────────────────────────────────
INSERT INTO hashtags (name, slug, usage_count, is_trending, is_featured, category) VALUES
('#Nike', 'nike', 15420, TRUE, TRUE, 'brand'),
('#Adidas', 'adidas', 12300, TRUE, TRUE, 'brand'),
('#Zara', 'zara', 9800, TRUE, TRUE, 'brand'),
('#HM', 'hm', 7600, TRUE, FALSE, 'brand'),
('#Apple', 'apple', 18900, TRUE, TRUE, 'brand'),
('#Samsung', 'samsung', 14200, TRUE, TRUE, 'brand'),
('#TrendYemek', 'trendyemek', 8900, TRUE, FALSE, 'food'),
('#PizzaSeverleri', 'pizzaseverleri', 6700, TRUE, FALSE, 'food'),
('#BurgerLovers', 'burgerlovers', 5400, TRUE, FALSE, 'food'),
('#SushiTime', 'sushitime', 4300, FALSE, FALSE, 'food'),
('#ModaTrend', 'modatrend', 11200, TRUE, TRUE, 'fashion'),
('#YazModası', 'yazmodasi', 8900, TRUE, FALSE, 'fashion'),
('#StreetStyle', 'streetstyle', 7800, TRUE, FALSE, 'fashion'),
('#Sneakers', 'sneakers', 9200, TRUE, TRUE, 'fashion'),
('#TechLife', 'techlife', 6700, FALSE, FALSE, 'product'),
('#Gaming', 'gaming', 8900, TRUE, FALSE, 'product'),
('#HomeDecor', 'homedecor', 5600, FALSE, FALSE, 'product'),
('#Fitness', 'fitness', 7800, TRUE, FALSE, 'product'),
('#Organic', 'organic', 4500, FALSE, FALSE, 'food'),
('#Vegan', 'vegan', 5600, FALSE, FALSE, 'food');

-- ─── Banner Verileri ──────────────────────────────────────────────────────────
INSERT INTO banners (title, subtitle, image_url, link_url, button_text, position, sort_order) VALUES
('Yaz Koleksiyonu Geldi!', 'En yeni trendler %50 indirimle', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200', '/kategori/giyim', 'Alışverişe Başla', 'hero', 1),
('Lezzetli Yemekler Kapında', 'Favori restoranlarından hızlı teslimat', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200', '/kategori/yemek', 'Sipariş Ver', 'hero', 2),
('Teknoloji Fırsatları', 'En son elektronik ürünler', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200', '/kategori/elektronik', 'Keşfet', 'hero', 3),
('Ücretsiz Kargo', 'Tüm siparişlerde ücretsiz kargo', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800', '/kampanyalar', 'Detaylar', 'middle', 1);
