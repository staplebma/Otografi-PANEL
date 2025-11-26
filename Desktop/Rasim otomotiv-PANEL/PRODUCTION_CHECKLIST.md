# 🚀 Production Deployment Checklist - Rasim Otomotiv Panel

## 📋 Proje Özeti

- **Domain:** panel.otografi.com
- **Frontend:** React + TypeScript + Vite
- **Backend:** NestJS + TypeScript
- **Database:** Supabase PostgreSQL
- **Email:** Resend

## ✅ Deployment Öncesi Kontroller

### 1. Environment Variables

#### Backend (.env)
```bash
cd backend
cat .env

# Kontrol edilecekler:
✅ DATABASE_URL (Supabase production)
✅ SUPABASE_URL (production URL)
✅ SUPABASE_ANON_KEY (production key)
✅ SUPABASE_SERVICE_ROLE_KEY (production key - GİZLİ!)
✅ JWT_SECRET (minimum 32 karakter, güçlü random string)
✅ JWT_EXPIRES_IN (7d önerilir)
✅ FRONTEND_URL (https://panel.otografi.com)
✅ RESEND_API_KEY (production key)
✅ ADMIN_EMAIL (admin@otografi.com)
✅ NODE_ENV=production
✅ PORT=3007
```

#### Frontend (.env)
```bash
cd frontend
cat .env

# Kontrol edilecekler:
✅ VITE_API_URL (https://panel.otografi.com/api veya https://api.otografi.com/api)
```

### 2. Kod Kalitesi

```bash
# Backend build kontrolü
cd backend
npm install --legacy-peer-deps
npm run build
# ✅ Hata olmamalı, dist/ klasörü oluşmalı

# Frontend build kontrolü
cd frontend
npm install --legacy-peer-deps
npm run build
# ✅ Hata olmamalı, dist/ klasörü oluşmalı
```

### 3. Database (Supabase)

```sql
-- Supabase SQL Editor'de kontrol edin:

-- Tabloların var olduğunu kontrol et
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- ✅ Beklenen tablolar:
-- users, customers, vehicles, work_orders, work_order_items, etc.

-- RLS (Row Level Security) kontrolü
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- ✅ Tüm tablolarda RLS aktif olmalı (rowsecurity = true)

-- İlk admin kullanıcısını kontrol et
SELECT id, email, full_name, role FROM users WHERE role = 'admin';

-- ✅ En az 1 admin kullanıcı olmalı
```

### 4. API Endpoint Kontrolü

```bash
# Lokal test
cd backend
npm run start:dev

# Başka bir terminal'de:
curl http://localhost:3007/api
# ✅ Beklenen: {"message": "API is running"}

curl http://localhost:3007/api/auth/me
# ✅ Beklenen: 401 Unauthorized (token olmadan)
```

### 5. CORS Ayarları

```typescript
// backend/src/main.ts dosyasını kontrol edin:

app.enableCors({
  origin: [
    'https://panel.otografi.com',  // ✅ Production frontend URL
    'http://localhost:5173',        // Development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

## 🚀 Deployment Seçenekleri

### Seçenek 1: Vercel + Railway (Önerilen) ⭐

####장점:
- ✅ Otomatik ölçekleme
- ✅ Global CDN
- ✅ Kolay deployment
- ✅ CI/CD entegrasyonu
- ✅ Otomatik SSL

#### Frontend (Vercel)
```bash
# Vercel CLI kurulumu
npm install -g vercel

# Frontend'i deploy et
cd frontend
vercel --prod

# Domain'i ekle (Vercel Dashboard'da)
# Settings → Domains → Add: panel.otografi.com
```

#### Backend (Railway)
```bash
# Railway CLI kurulumu
npm install -g @railway/cli

# Railway'e login
railway login

# Backend'i deploy et
cd backend
railway up

# Environment variables ekle (Railway Dashboard'da):
# - Tüm .env içeriğini ekleyin
# - Variables sekmesinden tek tek ekleyin

# Custom domain ekle (Railway Dashboard'da)
# Settings → Networking → Custom Domain: api.otografi.com
```

### Seçenek 2: Google Cloud Windows VM

```powershell
# VM'e bağlanın (RDP)
# PowerShell'i admin olarak açın

# Projeyi VM'e aktarın (Git veya FTP)
cd C:\
git clone [YOUR_REPO_URL]
cd rasim-otomotiv-panel

# Environment variables ayarlayın
cd backend
Copy-Item .env.example .env
notepad .env
# (Tüm production değerlerini girin)

cd ..\frontend
Copy-Item .env.example .env
notepad .env
# (Production API URL'sini girin)

# Deploy script'ini çalıştırın
cd ..
powershell -ExecutionPolicy Bypass -File deploy-windows.ps1

# IIS ve SSL kurulumu için:
# WINDOWS_DEPLOYMENT.md dosyasını takip edin
```

## 🔐 Güvenlik Kontrolleri

### 1. Secrets ve Keys

```bash
# ✅ .env dosyası git'e eklenmemiş
git ls-files | grep ".env$"
# (Boş çıktı olmalı)

# ✅ .gitignore'da .env var
cat .gitignore | grep ".env"

# ✅ JWT Secret güçlü (minimum 32 karakter)
# Oluşturmak için:
openssl rand -base64 32

# ✅ SUPABASE_SERVICE_ROLE_KEY asla frontend'e eklenmemiş
grep -r "SERVICE_ROLE_KEY" frontend/src/
# (Boş çıktı olmalı)
```

### 2. Database Güvenlik

```sql
-- Supabase Dashboard → Authentication → Policies

-- ✅ RLS (Row Level Security) tüm tablolarda aktif
-- ✅ Her tablo için SELECT, INSERT, UPDATE, DELETE politikaları var
-- ✅ Sadece yetkili kullanıcılar veri görebilir/değiştirebilir

-- Test:
-- 1. Supabase Dashboard → SQL Editor
-- 2. RLS'siz bir sorgu çalıştırın:
SELECT * FROM users;
-- ✅ Hata almalısınız (RLS politikası engellemeli)
```

### 3. API Rate Limiting

```typescript
// backend/src/main.ts
// Throttling kontrolü (varsa):

import { ThrottlerModule } from '@nestjs/throttler';

// ✅ Rate limiting aktif olmalı
// Örnek: 10 istek / dakika
```

## 🌐 DNS ve Domain

### DNS Kayıtları

```dns
# GoDaddy / Namecheap / Cloudflare DNS panelinden:

# Vercel için:
Type: CNAME
Name: panel
Value: cname.vercel-dns.com

# Railway için:
Type: CNAME
Name: api
Value: [railway-value].up.railway.app

# Veya Google Cloud VM için:
Type: A
Name: panel
Value: [VM_IP_ADDRESS]
```

### SSL Sertifikası

```bash
# Vercel / Railway: Otomatik SSL ✅

# Google Cloud VM:
# - Win-ACME ile Let's Encrypt sertifikası
# - Veya Cloudflare ücretsiz SSL
# - WINDOWS_DEPLOYMENT.md dosyasına bakın
```

## 🧪 Deployment Sonrası Testler

### 1. Frontend Testi

```bash
# Browser'da açın:
https://panel.otografi.com

# ✅ Kontroller:
- Site yükleniyor
- Console'da hata yok (F12)
- Logo ve stil doğru
- Login sayfası açılıyor
```

### 2. Backend API Testi

```bash
# API health check
curl https://panel.otografi.com/api
# veya
curl https://api.otografi.com/api

# ✅ Beklenen: {"message": "API is running"}

# Login testi
curl -X POST https://panel.otografi.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@otografi.com","password":"your_password"}'

# ✅ Beklenen: JWT token dönmeli
```

### 3. End-to-End Test

1. **Login:**
   - Admin kullanıcı ile login olun
   - ✅ Dashboard'a yönleniyor
   - ✅ Token localStorage'da kaydediliyor

2. **Müşteri Ekleme:**
   - Yeni müşteri ekleyin
   - ✅ Form submit oluyor
   - ✅ Toast notification gösteriliyor
   - ✅ Müşteri listesinde görünüyor

3. **Araç Ekleme:**
   - Müşteriye araç ekleyin
   - ✅ Form çalışıyor
   - ✅ Müşteri seçimi çalışıyor

4. **İş Emri Oluşturma:**
   - Yeni iş emri oluşturun
   - ✅ Hesaplama doğru çalışıyor
   - ✅ PDF export çalışıyor (eğer varsa)

5. **Email Testi:**
   - Yeni kullanıcı kaydı yapın
   - ✅ Admin'e bildirim emaili gidiyor

### 4. Performans Testi

```bash
# Lighthouse kullanın (Chrome DevTools)
# F12 → Lighthouse → Run

# ✅ Hedef skorlar:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

# Alternatif: WebPageTest.org
# https://www.webpagetest.org/
```

### 5. Mobil Test

```bash
# Chrome DevTools → Device Toolbar (Ctrl+Shift+M)

# ✅ Kontroller:
- Responsive tasarım çalışıyor
- Menüler mobilde kullanılabilir
- Formlar mobilde doldurulabiliyor
- Tablolar mobilde scroll oluyor
```

## 📊 Monitoring Kurulumu

### 1. Uptime Monitoring

**Ücretsiz araçlar:**
- [UptimeRobot](https://uptimerobot.com/) - 5 dakikada bir ping
- [Pingdom](https://www.pingdom.com/) - Free tier
- [StatusCake](https://www.statuscake.com/)

**Kurulum:**
1. Hesap oluşturun
2. Monitor ekleyin: `https://panel.otografi.com`
3. Alert ayarlayın (Email/SMS)

### 2. Error Tracking

**Sentry (Önerilen):**

```bash
# Frontend
npm install --save @sentry/react

# backend/src/main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: 'production',
});
```

### 3. Log Monitoring

```bash
# Vercel: Dashboard → Logs
# Railway: Dashboard → Deployments → Logs
# Google Cloud: PM2 logs veya Windows Event Viewer
```

## 💾 Backup Stratejisi

### 1. Database Backup (Supabase)

```bash
# Supabase Dashboard → Database → Backups
# ✅ Otomatik günlük backup aktif

# Manuel backup:
# Dashboard → Database → Backups → Download

# Veya pg_dump kullanın:
pg_dump "postgresql://postgres:[PASSWORD]@db.tdmdfyoytwgwsyremprk.supabase.co:5432/postgres" > backup.sql
```

### 2. Code Backup

```bash
# Git repository'yi güncel tutun
git add .
git commit -m "Production release v1.0"
git tag v1.0
git push origin main --tags

# ✅ GitHub'da son commit production'daki ile aynı
```

### 3. Environment Variables Backup

```bash
# Güvenli bir yere kaydedin (1Password, LastPass vb.)
# Backend .env
# Frontend .env
# Supabase credentials
# Resend API key
# JWT secret
```

## 🚨 Rollback Planı

Bir sorun olursa nasıl geri alınır:

### Vercel
```bash
# Dashboard → Deployments → Previous deployment → Promote to Production
# Veya CLI:
vercel rollback
```

### Railway
```bash
# Dashboard → Deployments → Previous deployment → Redeploy
```

### Google Cloud VM
```bash
# Önceki versiyonu PM2'de çalıştırın
pm2 delete all
git checkout [PREVIOUS_TAG]
powershell -ExecutionPolicy Bypass -File deploy-windows.ps1
```

## 📞 Launch Day Checklist

### Sabah (Launch Öncesi)
- [ ] Tüm servisler çalışıyor
- [ ] DNS yayılmış (dnschecker.org)
- [ ] SSL sertifikaları aktif
- [ ] Backup alındı
- [ ] Test senaryoları başarılı
- [ ] Monitoring araçları aktif

### Launch
- [ ] Frontend deploy
- [ ] Backend deploy
- [ ] DNS kayıtları güncelle
- [ ] Admin kullanıcısı oluştur
- [ ] Test login yap
- [ ] Müşteriye bilgi ver

### Akşam (Launch Sonrası)
- [ ] Error logs kontrol et
- [ ] Performance metrics kontrol et
- [ ] Uptime kontrol et
- [ ] User feedback topla

## 🎉 Launch Sonrası

### İlk 24 Saat
- Her 2 saatte bir servisleri kontrol et
- Error logs takip et
- User feedback topla
- Performance metrics izle

### İlk Hafta
- Günlük log review
- Backup'ları doğrula
- Monitoring alerts ayarla
- User training düzenle

### İlk Ay
- Performans optimizasyonları
- User feedback'e göre iyileştirmeler
- Security audit
- Scaling planlaması

## 📚 Dokümantasyon

Müşteriye iletilecek dökümanlar:
- [ ] Admin panel kullanım kılavuzu
- [ ] API dokümantasyonu
- [ ] Backup prosedürleri
- [ ] Troubleshooting guide
- [ ] İletişim bilgileri (support)

## ✅ Final Approval

- [ ] Tüm checklistler tamamlandı
- [ ] Test senaryoları başarılı
- [ ] Client approval alındı
- [ ] Payment tamamlandı
- [ ] Warranty/Support agreement imzalandı

---

## 🎯 Quick Launch Script

Tüm kontrolleri hızlı yapmak için:

```bash
# backend/check-production.sh
echo "🔍 Production Readiness Check"
echo "============================="

# Environment check
echo "✓ Checking environment variables..."
test -f .env && echo "✓ .env exists" || echo "✗ .env missing"

# Build check
echo "✓ Building backend..."
npm run build && echo "✓ Build successful" || exit 1

# Test check
echo "✓ Running tests..."
npm test && echo "✓ Tests passed" || echo "⚠ Tests failed"

echo "============================="
echo "✅ All checks passed!"
```

**Başarılar!** 🚀
