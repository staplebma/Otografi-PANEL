# Rasim Otomotiv CRM Backend

NestJS ve Supabase ile geliştirilmiş otomotiv CRM sistemi backend uygulaması.

## Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Supabase Projesini Oluşturun

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni bir proje oluşturun
3. Proje ayarlarından API anahtarlarınızı alın

### 3. Veritabanı Şemasını Oluşturun

Supabase SQL Editor'de `supabase-schema.sql` dosyasındaki SQL komutlarını çalıştırın.

### 4. Ortam Değişkenlerini Yapılandırın

`.env` dosyasını düzenleyin:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_strong_secret_key_here
JWT_EXPIRES_IN=7d

# Application Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Çalıştırma

### Geliştirme Modu

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm run start:prod
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/profile` - Kullanıcı profili (JWT gerekli)

### Modüller

- **Users** - Kullanıcı yönetimi
- **Customers** - Müşteri yönetimi
- **Vehicles** - Araç yönetimi
- **Sales** - Satış işlemleri
- **Notifications** - Bildirim sistemi

## Proje Yapısı

```
src/
├── auth/           # Authentication modülü (JWT)
├── users/          # Kullanıcı yönetimi
├── customers/      # Müşteri yönetimi
├── vehicles/       # Araç yönetimi
├── sales/          # Satış yönetimi
├── notifications/  # Bildirim sistemi
├── supabase/       # Supabase client yapılandırması
├── app.module.ts   # Ana uygulama modülü
└── main.ts         # Uygulama giriş noktası
```

## Teknolojiler

- **NestJS** - Progressive Node.js framework
- **Supabase** - PostgreSQL veritabanı ve backend hizmetleri
- **JWT** - Token tabanlı kimlik doğrulama
- **Passport** - Authentication middleware
- **TypeScript** - Type-safe geliştirme
- **Class Validator** - DTO validasyonu

## Güvenlik

- Şifreler bcrypt ile hashlenir
- JWT token tabanlı kimlik doğrulama
- Global validation pipes
- CORS koruması
- Role-based access control (RBAC) hazır

## Özellikler

### Bakım Takip Sistemi
- Her gün saat 09:00'da otomatik bakım kontrolü
- Bakım tarihi yaklaşan araçlar için renkli statü sistemi:
  - **Yeşil (ok)**: 60+ gün
  - **Sarı (warning)**: 6-60 gün arası
  - **Kırmızı (critical)**: 5 gün veya daha az / süresi geçmiş
- Otomatik bildirim gönderimi (admin ve manager'lara)
- Kritik durumlar için SMS bildirimi (müşteriye)

### SMS Bildirimleri
- Bakım hatırlatıcıları
- Satış onayları
- Özel mesajlar
- Türkçe SMS provider desteği (Netgsm, İleti Merkezi, vb.)
- Twilio entegrasyonu hazır

### Role-Based Access Control
- **Admin**: Tüm yetkilere sahip
- **Manager**: Tüm verileri görüntüleyebilir, sınırlı silme yetkisi
- **User**: Standart çalışan yetkisi, kendi kayıtlarını görebilir

### API Endpoints
Detaylı API dokümantasyonu için [API.md](API.md) dosyasına bakın.

## Test

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Cron Jobs

### Bakım Kontrolü
- **Çalışma Zamanı**: Her gün 09:00
- **İşlev**: Tüm araçların bakım tarihlerini kontrol eder
- **Eylemler**:
  - Bakım statülerini günceller
  - Admin ve manager'lara bildirim gönderir
  - Kritik durumlarda müşterilere SMS gönderir

### Manuel Tetikleme
```bash
# Backend çalışır durumda iken, maintenance task'i manuel çalıştırmak için:
# MaintenanceTasksService.runMaintenanceCheckNow() metodunu kullanın
```

## SMS Entegrasyonu

### Desteklenen Provider'lar
1. **Twilio** (Global)
2. **Netgsm** (Türkiye)
3. **İleti Merkezi** (Türkiye)
4. **Mutlucell** (Türkiye)

### Kurulum
1. `.env` dosyasında SMS provider bilgilerinizi ekleyin
2. `src/sms/sms.service.ts` dosyasında ilgili provider kodunu aktif edin
3. Gerekli paketleri yükleyin (örn: `npm install twilio`)

## Deployment

### Production Build
```bash
npm run build
npm run start:prod
```

### Environment Variables (Production)
Production ortamı için `.env` dosyasını oluşturun ve aşağıdaki değişkenleri ayarlayın:
- Güçlü JWT_SECRET
- Production Supabase credentials
- SMS provider credentials
- FRONTEND_URL'i production URL'e değiştirin
