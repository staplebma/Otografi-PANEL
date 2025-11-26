# Supabase Kurulum Rehberi - Rasim Otomotiv CRM

## ÖNEMLİ: Backend NestJS ile Supabase'i Servis Olarak Kullanıyor

Bu projede Supabase Authentication **kullanılmıyor**. Backend'deki NestJS JWT authentication sistemi kullanılıyor. Supabase sadece PostgreSQL veritabanı olarak kullanılır.

## Adım 1: Supabase Hesabı Oluşturun

1. [https://supabase.com](https://supabase.com) adresine gidin
2. "Start your project" butonuna tıklayın
3. GitHub hesabınızla giriş yapın veya e-posta ile kayıt olun

## Adım 2: Yeni Proje Oluşturun

1. Dashboard'da "New Project" butonuna tıklayın
2. Proje bilgilerini girin:
   - **Name**: Rasim Otomotiv CRM
   - **Database Password**: Güçlü bir şifre oluşturun (kaydedin!)
   - **Region**: Europe (West) - (en yakın bölge)
   - **Pricing Plan**: Free (başlangıç için yeterli)
3. "Create new project" butonuna tıklayın (2-3 dakika sürebilir)

## Adım 3: Veritabanı Şemasını Yükleyin

**ÖNEMLİ**: Güncellenmiş schema dosyasını kullanın!

1. Sol menüden "SQL Editor" sekmesine gidin
2. "New query" butonuna tıklayın
3. `backend/supabase-schema-fixed.sql` dosyasının tüm içeriğini kopyalayın
4. SQL editörüne yapıştırın
5. "Run" butonuna tıklayın (sağ alt köşe)
6. Başarılı olursa "Success" mesajı görünecektir

### Schema'da Neler Var?
- ✅ Users, Customers, Vehicles, Sales, Notifications tabloları
- ✅ Otomatik updated_at trigger'ları
- ✅ Performance için index'ler
- ✅ Dashboard için view (dashboard_stats)
- ✅ RLS politikaları (Backend service_role ile full access)

## Adım 4: API Anahtarlarını Alın

1. Sol menüden "Settings" (dişli ikonu) sekmesine gidin
2. "API" altında aşağıdaki bilgileri bulacaksınız:

### Project URL
```
https://your-project-ref.supabase.co
```

### Project API keys
- **anon / public**: `eyJhbGc...` (başlayan uzun metin)
- **service_role**: `eyJhbGc...` (başka bir uzun metin)

## Adım 5: Backend .env Dosyasını Güncelleyin

`backend/.env` dosyasını açın ve aşağıdaki değerleri güncelleyin:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=eyJhbGc... (anon key buraya)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (service_role key buraya)

# JWT Configuration
JWT_SECRET=441b6b8dcedbfd552f0cd63f124b4be0dfd1f66bb1524bc9e027bdc0ff00ee84
JWT_EXPIRES_IN=7d
```

## Adım 6: İlk Admin Kullanıcısını Oluşturun

Backend çalıştıktan sonra, admin kullanıcıyı otomatik oluşturabilirsiniz:

### Otomatik Yöntem (ÖNERİLİR):

```bash
cd backend
node create-admin.js
```

Bu script:
- ✅ Admin kullanıcı oluşturur (admin@rasimotomotiv.com)
- ✅ İsteğe bağlı test kullanıcıları oluşturur (manager, user)
- ✅ Şifreleri bcrypt ile hash'ler
- ✅ Veritabanına kaydeder

### Manuel Yöntem - cURL ile:

```bash
curl -X POST http://localhost:3007/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rasimotomotiv.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }'
```

### Oluşturulan Kullanıcılar:

| Email | Şifre | Rol |
|-------|-------|-----|
| admin@rasimotomotiv.com | Admin123! | admin |
| manager@rasimotomotiv.com | Manager123! | manager |
| user@rasimotomotiv.com | User123! | user |

## Adım 7: Sistemı Başlatın

```bash
# Backend'i başlatın (backend klasöründe)
npm run start:dev

# Frontend'i başlatın (frontend klasöründe)
npm run dev
```

## Adım 8: Giriş Yapın

1. Tarayıcıda [http://localhost:5173](http://localhost:5173) adresine gidin
2. Oluşturduğunuz admin kullanıcısı ile giriş yapın:
   - **E-posta**: admin@rasimotomotiv.com
   - **Şifre**: Admin123!

## Opsiyonel: SMS Yapılandırması

SMS bildirimleri için Türk SMS sağlayıcılarından birini kullanabilirsiniz:

### Netgsm
1. [https://www.netgsm.com.tr](https://www.netgsm.com.tr) - Hesap oluşturun
2. API kullanıcı adı ve şifrenizi alın
3. `.env` dosyasına ekleyin:

```env
NETGSM_USERNAME=your_username
NETGSM_PASSWORD=your_password
NETGSM_HEADER=RASIM OTO
```

### İleti Merkezi
1. [https://www.iletimerkezi.com](https://www.iletimerkezi.com) - Hesap oluşturun
2. API anahtarlarınızı alın
3. `.env` dosyasına ekleyin

## Sorun Giderme

### Backend başlamıyor
- `.env` dosyasındaki Supabase URL'sinin `https://` ile başladığından emin olun
- API anahtarlarının tam olarak kopyalandığından emin olun (boşluk olmamalı)

### Giriş yapamıyorum
- users tablosunda kullanıcının `is_active` değerinin `true` olduğundan emin olun
- Şifrenin doğru girildiğinden emin olun (büyük/küçük harf duyarlı)

### Tablolar oluşmadı
- SQL Editor'da hataları kontrol edin
- Schema dosyasının tamamının kopyalandığından emin olun
- SQL'i parça parça çalıştırmayı deneyin

## Yardım

Herhangi bir sorun yaşarsanız:
- Supabase Dashboard > Logs sekmesinden hataları kontrol edin
- Backend terminal çıktısını kontrol edin
- Browser console'da (F12) hataları kontrol edin
