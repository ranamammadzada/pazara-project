
# 🛍️ PazaRa - Modern E-Ticaret Platformu

> Yemek, giyim ve genel alışverişi tek platformda birleştiren modern marketplace sistemi.
> Trendyol + Yemeksepeti + Getir birleşimi mantığında çalışır.

![PazaRa Banner](https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80)

## ✨ Özellikler

- 🛒 **Tek Sepet Sistemi** — Yemek, giyim ve diğer ürünleri aynı sepette birleştir
- 🤖 **AI Ürün Önerileri** — Yapay zeka destekli kişisel öneriler
- 💬 **Canlı AI Destek** — 7/24 akıllı chatbot asistanı
- 💬 **Kullanıcılar Arası Mesajlaşma** — Instagram benzeri sohbet sistemi
- 🏷️ **Hashtag Sistemi** — Twitter mantığında trend hashtagler
- 🌍 **Çoklu Dil** — Türkçe, İngilizce, Rusça, Azerbaycanca
- 📱 **Tam Responsive** — Mobil, tablet ve masaüstü uyumlu
- 🎨 **Modern UI** — Glassmorphism, animasyonlar, mor & beyaz tema
- ⭐ **Ürün Yorumları** — Kullanıcı değerlendirme sistemi
- 🔥 **Trend Ürünler** — Hashtaglerden erişilebilir trend içerikler
- 🌙 **Dark/Light Mode** — Tema değiştirme desteği
- 🔒 **Güvenli Auth** — JWT + bcrypt ile kimlik doğrulama

## 🛠️ Teknolojiler

### Frontend
- **React 18** + **Vite**
- **TailwindCSS** — Utility-first CSS
- **React Router v6** — Client-side routing
- **Axios** — HTTP client
- **React Hot Toast** — Bildirimler

### Backend
- **Node.js** + **Express.js**
- **MySQL** — Veritabanı
- **JWT** — Authentication
- **bcrypt** — Şifre hashleme
- **Helmet.js** — Güvenlik
- **Express Rate Limit** — Rate limiting

## 📁 Proje Yapısı

```
PazaRa/
├── frontend/                    # React + Vite uygulaması
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # Navbar, Footer, MobileNav
│   │   │   ├── ui/              # LoadingScreen, Toast
│   │   │   └── ai/              # AIChatbot
│   │   ├── pages/               # Tüm sayfalar
│   │   ├── context/             # AuthContext, CartContext, LanguageContext
│   │   ├── services/            # API servisleri
│   │   ├── layouts/             # MainLayout
│   │   └── assets/              # Görseller, fontlar
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                     # Node.js + Express API
│   ├── routes/                  # API rotaları
│   │   ├── auth.js              # Kimlik doğrulama
│   │   ├── products.js          # Ürünler
│   │   ├── food.js              # Yemekler
│   │   ├── cart.js              # Sepet
│   │   ├── orders.js            # Siparişler
│   │   ├── favorites.js         # Favoriler
│   │   ├── ai.js                # AI önerileri
│   │   ├── chat.js              # Chatbot & mesajlar
│   │   ├── hashtags.js          # Hashtagler
│   │   ├── reviews.js           # Yorumlar
│   │   ├── categories.js        # Kategoriler
│   │   ├── users.js             # Kullanıcılar
│   │   └── admin.js             # Admin paneli
│   ├── middleware/
│   │   └── auth.js              # JWT middleware
│   ├── database/
│   │   ├── db.js                # MySQL bağlantısı
│   │   ├── schema.sql           # Veritabanı şeması
│   │   └── seed.sql             # Örnek veriler
│   ├── server.js                # Ana sunucu
│   └── .env.example             # Ortam değişkenleri örneği
│
└── README.md
```

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- MySQL 8.0+
- npm veya yarn

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/yourusername/pazara.git
cd pazara
```

### 2. Backend Kurulumu
```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenleyin
```

### 3. Veritabanı Kurulumu
```bash
# MySQL'e bağlanın
mysql -u root -p

# Veritabanı oluşturun
CREATE DATABASE pazara_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Şemayı yükleyin
mysql -u root -p pazara_db < database/schema.sql

# Örnek verileri yükleyin
mysql -u root -p pazara_db < database/seed.sql
```

### 4. Backend'i Başlatın
```bash
npm run dev
# Backend: http://localhost:5000
```

### 5. Frontend Kurulumu
```bash
cd ../frontend
npm install
```

### 6. Frontend'i Başlatın
```bash
npm run dev
# Frontend: http://localhost:5173
```

## 🔑 Ortam Değişkenleri

`.env` dosyasını oluşturun:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pazara_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:5173
```

## 📡 API Endpoints

### Auth
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/auth/register` | Kayıt ol |
| POST | `/api/auth/login` | Giriş yap |
| GET | `/api/auth/me` | Profil bilgisi |
| PUT | `/api/auth/profile` | Profil güncelle |

### Products
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/products` | Ürün listesi |
| GET | `/api/products/:id` | Ürün detayı |
| POST | `/api/products` | Ürün ekle (Satıcı) |

### Food
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/food` | Yemek listesi |
| GET | `/api/food/:id` | Yemek detayı |

### Cart
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/cart` | Sepet içeriği |
| POST | `/api/cart/add` | Sepete ekle |
| PUT | `/api/cart/update/:id` | Adet güncelle |
| DELETE | `/api/cart/remove/:id` | Sepetten çıkar |

### Orders
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/orders` | Siparişler |
| POST | `/api/orders` | Sipariş oluştur |

### AI
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/ai/recommendations` | AI önerileri |
| POST | `/api/chat/bot` | AI chatbot |

## 🎨 Tasarım Sistemi

### Renkler
- **Primary**: `#7C3AED` (Mor)
- **Secondary**: `#A78BFA` (Açık Lila)
- **Background**: `#FAFAFA` (Beyaz)
- **Text**: `#1F2937` (Koyu Gri)

### Tipografi
- **Display**: Poppins (Başlıklar)
- **Body**: Inter (İçerik)

### Bileşenler
- Glassmorphism kartlar
- Gradient butonlar
- Animated borders
- Skeleton loading
- Toast notifications

## 👤 Demo Hesaplar

| Rol | E-posta | Şifre |
|-----|---------|-------|
| Admin | admin@pazara.com | Admin123! |
| Kullanıcı | user@pazara.com | User123! |
| Satıcı | seller@pazara.com | Seller123! |

## 📱 Sayfalar

| Sayfa | URL | Açıklama |
|-------|-----|----------|
| Ana Sayfa | `/` | Hero, kategoriler, trend ürünler |
| Giriş | `/giris` | Kullanıcı girişi |
| Kayıt | `/kayit` | Yeni hesap oluştur |
| Kategori | `/kategori/:slug` | Kategori ürünleri |
| Ürün Detay | `/urun/:id` | Ürün sayfası |
| Yemek Detay | `/yemek/:id` | Yemek sayfası |
| Sepet | `/sepet` | Alışveriş sepeti |
| Favoriler | `/favoriler` | Favori ürünler |
| Siparişler | `/siparisler` | Sipariş geçmişi |
| Profil | `/profil` | Kullanıcı profili |
| Mesajlar | `/mesajlar` | Sohbet sistemi |
| AI Önerileri | `/ai-onerileri` | Yapay zeka önerileri |
| Admin | `/admin` | Yönetim paneli |

## 🌍 Dil Desteği

- 🇹🇷 Türkçe (varsayılan)
- 🇬🇧 English
- 🇷🇺 Русский
- 🇦🇿 Azərbaycan

## 🔒 Güvenlik

- JWT token authentication
- bcrypt password hashing
- Helmet.js security headers
- Rate limiting (100 req/15min)
- SQL injection protection
- XSS protection
- CORS configuration

## 📄 Lisans

MIT License — © 2026 PazaRa

---

**PazaRa** ile modern alışveriş deneyimini yaşayın! 🛍️
=======
# pazara-project
>>>>>>> b88e71dbbf695198d4bc7364a57de21ef85eba47
