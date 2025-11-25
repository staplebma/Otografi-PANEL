# Rasim Otomotiv CRM - Kurulum Kılavuzu

Bu kılavuz, backend sistemini sıfırdan kurmak için adım adım talimatlar içerir.

## Ön Gereksinimler

- Node.js 18+ (https://nodejs.org/)
- npm veya yarn
- Supabase hesabı (https://supabase.com)
- (Opsiyonel) SMS provider hesabı

## Adım 1: Supabase Projesi Oluşturma

1. [Supabase](https://supabase.com) adresine gidin ve giriş yapın
2. "New Project" butonuna tıklayın
3. Proje bilgilerini girin:
   - **Name**: rasim-otomotiv-crm
   - **Database Password**: Güçlü bir şifre seçin (kaydedin!)
   - **Region**: Türkiye'ye yakın bir bölge seçin (örn: Frankfurt)
4. "Create new project" butonuna tıklayın
5. Proje oluşturulurken bekleyin (2-3 dakika)

## Adım 2: Veritabanı Şemasını Oluşturma

1. Supabase Dashboard'da sol menüden "SQL Editor" seçin
2. "New query" butonuna tıklayın
3. `supabase-schema.sql` dosyasının içeriğini kopyalayıp yapıştırın
4. "Run" butonuna tıklayın
5. Başarılı mesajını bekleyin

### Doğrulama
Sol menüden "Table Editor" seçin. Aşağıdaki tabloları görmelisiniz:
- users
- customers
- vehicles
- sales
- service_records
- notifications

## Adım 3: API Anahtarlarını Alma

1. Supabase Dashboard'da sol menüden "Settings" > "API" seçin
2. Aşağıdaki bilgileri kopyalayın:
   - **Project URL** (URL altında)
   - **anon public** key (Project API keys altında)
   - **service_role** key (Project API keys altında, "Reveal" tıklayın)

## Adım 4: Backend Kurulumu

### 4.1 Bağımlılıkları Yükleme

```bash
cd backend
npm install
```

### 4.2 Environment Variables Ayarlama

`.env` dosyasını düzenleyin:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_anon_public_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT Configuration
JWT_SECRET=your_strong_random_secret_here_minimum_32_characters
JWT_EXPIRES_IN=7d

# Application Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# SMS Configuration (Opsiyonel - sonra eklenebilir)
# NETGSM_USERNAME=your_username
# NETGSM_PASSWORD=your_password
# NETGSM_HEADER=RASIMOTO
```

**NOT**: JWT_SECRET için güçlü bir key oluşturun:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Adım 5: İlk Admin Kullanıcısı Oluşturma

Backend'i başlatın:
```bash
npm run start:dev
```

Postman veya curl ile kayıt olun:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rasimotomotiv.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

### Admin Rolü Atama

1. Supabase Dashboard > Table Editor > users tablosuna gidin
2. Oluşturduğunuz kullanıcıyı bulun
3. `role` kolonunu `admin` olarak değiştirin
4. Kaydedin

## Adım 6: Sistem Testi

### 6.1 Login Testi
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rasimotomotiv.com",
    "password": "Admin123!"
  }'
```

Başarılıysa, bir `accessToken` almalısınız.

### 6.2 Profile Testi
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 6.3 Müşteri Oluşturma Testi
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Müşteri",
    "email": "test@example.com",
    "phone": "+905551234567",
    "city": "İstanbul"
  }'
```

## Adım 7: SMS Entegrasyonu (Opsiyonel)

### Netgsm ile Kurulum

1. [Netgsm](https://www.netgsm.com.tr/) hesabı oluşturun
2. API bilgilerinizi alın
3. `.env` dosyasına ekleyin:
```env
NETGSM_USERNAME=your_username
NETGSM_PASSWORD=your_password
NETGSM_HEADER=RASIMOTO
```

4. `src/sms/sms.service.ts` dosyasını açın
5. Netgsm entegrasyon kodunu uncomment edin
6. Test için backend'i yeniden başlatın

### Twilio ile Kurulum

1. [Twilio](https://www.twilio.com/) hesabı oluşturun
2. Phone number satın alın
3. API credentials'ları alın
4. `.env` dosyasına ekleyin:
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

5. `src/sms/sms.service.ts` dosyasını açın
6. Twilio kodunu uncomment edin
7. `npm install twilio` komutunu çalıştırın

## Adım 8: Cron Job Testi

Bakım kontrolü her gün saat 09:00'da otomatik çalışır. Manuel test için:

1. `src/tasks/maintenance-tasks.service.ts` dosyasını açın
2. Geliştirme için cron expression'ı değiştirin:
```typescript
// Her 1 dakikada bir çalışsın (test için)
@Cron('*/1 * * * *')
```

3. Backend'i yeniden başlatın
4. Logları izleyin:
```bash
npm run start:dev
```

## Adım 9: Production Deployment

### Vercel/Railway/Heroku için

1. Production environment variables'ları ayarlayın
2. Build komutunu çalıştırın:
```bash
npm run build
```

3. Start komutunu çalıştırın:
```bash
npm run start:prod
```

### PM2 ile (Linux Server)

```bash
# PM2 yükle
npm install -g pm2

# Uygulamayı başlat
pm2 start npm --name "rasim-crm-backend" -- run start:prod

# Auto-restart ayarla
pm2 startup
pm2 save
```

## Sorun Giderme

### Port zaten kullanımda
```bash
# PORT değişkenini .env dosyasında değiştirin
PORT=3001
```

### Supabase bağlantı hatası
- SUPABASE_URL doğru mu kontrol edin
- API keys'lerin doğru kopyalandığını kontrol edin
- Supabase projesinin aktif olduğunu kontrol edin

### JWT hatası
- JWT_SECRET'ın en az 32 karakter olduğundan emin olun
- .env dosyasının doğru yerde olduğunu kontrol edin

### Cron job çalışmıyor
- Timezone ayarlarını kontrol edin
- Server saatinin doğru olduğunu kontrol edin
- Logları kontrol edin

## Yardım

Sorun yaşıyorsanız:
1. Logları kontrol edin: `npm run start:dev`
2. Supabase Dashboard'da Table Editor'den verileri kontrol edin
3. API.md dosyasından endpoint'leri kontrol edin

## Sonraki Adımlar

Backend kurulumu tamamlandı! Şimdi:
1. Frontend kurulumuna geçebilirsiniz
2. Daha fazla test kullanıcısı ekleyebilirsiniz
3. Örnek veri oluşturabilirsiniz
4. SMS entegrasyonunu tamamlayabilirsiniz
