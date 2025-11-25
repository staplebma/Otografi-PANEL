# Hızlı Başlangıç - Rasim Otomotiv CRM

## 🚀 5 Dakikada Çalıştır

### 1️⃣ Supabase Kurulumu (5 dk)

```bash
# 1. Supabase.com'da hesap oluştur ve proje aç
# 2. SQL Editor'da şu dosyayı çalıştır:
backend/supabase-schema-fixed.sql

# 3. Settings > API'den anahtarları kopyala ve .env'e yapıştır
```

### 2️⃣ Backend Başlat (1 dk)

```bash
cd backend
npm install
npm run start:dev
```

Backend: http://localhost:3007/api ✅

### 3️⃣ Admin Oluştur (30 sn)

```bash
node create-admin.js
# 'e' tuşuna bas (test kullanıcıları için)
```

**Kullanıcılar:**
- admin@rasimotomotiv.com / Admin123!
- manager@rasimotomotiv.com / Manager123!
- user@rasimotomotiv.com / User123!

### 4️⃣ Test Verisi Ekle (30 sn - opsiyonel)

```bash
node seed-database.js
```

**Eklenecekler:**
- 5 müşteri
- 5 araç
- 3 satış

### 5️⃣ Frontend Başlat (1 dk)

```bash
cd ../frontend
npm install
npm run dev
```

Frontend: http://localhost:5173 ✅

## ✅ Tamamlandı!

Şimdi tarayıcıda http://localhost:5173 adresine git ve giriş yap.

---

## 📁 Faydalı Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `supabase-schema-fixed.sql` | Veritabanı schema (Supabase'de çalıştır) |
| `create-admin.js` | Admin kullanıcı oluştur |
| `seed-database.js` | Test verisi ekle |
| `SUPABASE_README.md` | Detaylı Supabase dökümanı |
| `.env` | Environment variables |

## 🔧 Komutlar

```bash
# Backend çalıştır
npm run start:dev

# Backend build
npm run build

# Backend production
npm run start:prod

# Admin oluştur
node create-admin.js

# Test verisi
node seed-database.js
```

## 🆘 Sorun Giderme

### Backend başlamıyor
```bash
# Port 3007 kullanımda mı?
lsof -ti:3007
# Varsa öldür:
kill -9 $(lsof -ti:3007)
```

### Supabase bağlanamıyor
```bash
# .env dosyasını kontrol et
cat .env | grep SUPABASE

# SERVICE_ROLE_KEY doğru mu?
# URL https:// ile başlıyor mu?
```

### Admin oluşturamıyorum
```bash
# Backend çalışıyor mu?
curl http://localhost:3007/api

# Supabase schema yüklendi mi?
# SQL Editor'da supabase-schema-fixed.sql çalıştır
```

## 📚 Daha Fazla Bilgi

- [SUPABASE_KURULUM.md](../SUPABASE_KURULUM.md) - Detaylı kurulum
- [SUPABASE_README.md](./SUPABASE_README.md) - Supabase detayları
- [README.md](../README.md) - Proje genel bilgi

## 🎯 Özellikler

- ✅ JWT Authentication
- ✅ Rol bazlı yetkilendirme (Admin, Manager, User)
- ✅ Müşteri yönetimi
- ✅ Araç yönetimi
- ✅ Satış takibi
- ✅ Bakım bildirimleri (Cron job)
- ✅ SMS entegrasyonu (opsiyonel)
- ✅ Dashboard istatistikleri

## 🔐 Güvenlik

- Şifreler bcrypt ile hash'lenir
- JWT token tabanlı auth
- Row Level Security (RLS)
- CORS koruması
- SQL injection koruması

## 📊 API Endpoints

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | /api/auth/register | Yeni kullanıcı |
| POST | /api/auth/login | Giriş yap |
| GET | /api/customers | Müşteriler |
| POST | /api/customers | Yeni müşteri |
| GET | /api/vehicles | Araçlar |
| POST | /api/vehicles | Yeni araç |
| GET | /api/sales | Satışlar |
| POST | /api/sales | Yeni satış |
| GET | /api/notifications | Bildirimler |
