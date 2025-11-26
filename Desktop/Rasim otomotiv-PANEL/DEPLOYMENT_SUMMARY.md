# 🚀 Rasim Otomotiv Panel - Deployment Özeti

**Domain:** panel.otografi.com
**Hazırlık Tarihi:** 26 Kasım 2025
**Durum:** ✅ Production'a Hazır

---

## 📦 Proje Yapısı

```
rasim-otomotiv-panel/
├── backend/              # NestJS API
│   ├── src/
│   ├── .env.example     # Environment şablonu
│   ├── Dockerfile       # Production Docker image
│   └── package.json
├── frontend/            # React + Vite
│   ├── src/
│   ├── .env.example    # API URL yapılandırması
│   └── package.json
├── deploy-windows.ps1   # Windows VM deploy script
├── vercel.json         # Vercel yapılandırması
├── netlify.toml        # Netlify yapılandırması
├── railway.toml        # Railway yapılandırması
└── Deployment Guides/
    ├── WINDOWS_DEPLOYMENT.md
    ├── DOMAIN_SETUP.md
    └── PRODUCTION_CHECKLIST.md
```

---

## ✅ Yapılan İyileştirmeler

### 1. Gereksiz Dosya Temizliği
- ✅ `.DS_Store` dosyaları silindi
- ✅ Gereksiz log ve cache dosyaları temizlendi
- ✅ `.dockerignore` optimize edildi

### 2. CORS Güncellemesi
**backend/src/main.ts:**
```typescript
// ✅ Güvenli CORS yapılandırması
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'https://panel.otografi.com',
].filter(Boolean);

app.enableCors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// ✅ Tüm ortamlarda /api prefix
app.setGlobalPrefix('api');
```

### 3. Environment Variables
- ✅ `.env.example` dosyaları güncellendi
- ✅ Production değerleri dokümante edildi
- ✅ Güvenlik notları eklendi

### 4. Docker & Build
- ✅ Multi-stage Docker build (backend)
- ✅ Node 22-alpine base image
- ✅ Health check eklendi
- ✅ Non-root user güvenliği

---

## 🌐 Deployment Seçenekleri

### Seçenek 1: Vercel + Railway ⭐ (Önerilen)

**장점:**
- 🚀 Hızlı deployment
- 🌍 Global CDN (Vercel)
- 📈 Otomatik ölçekleme
- 🔒 Otomatik SSL
- 🔄 CI/CD entegrasyonu

**Yapılandırma:**
```
Frontend: Vercel (panel.otografi.com)
Backend:  Railway (api.otografi.com)
```

**DNS Kayıtları:**
```dns
CNAME  panel  cname.vercel-dns.com
CNAME  api    [railway-value].up.railway.app
```

**Frontend .env (Vercel):**
```env
VITE_API_URL=https://api.otografi.com/api
```

**Backend .env (Railway):**
```env
FRONTEND_URL=https://panel.otografi.com
NODE_ENV=production
# + Tüm Supabase, JWT, Email ayarları
```

**Deployment Komutları:**
```bash
# Frontend
cd frontend
npm install -g vercel
vercel --prod

# Backend
cd backend
npm install -g @railway/cli
railway login
railway up
```

---

### Seçenek 2: Google Cloud Windows VM

**장점:**
- 💰 Düşük maliyet
- 🎛️ Tam kontrol
- 📦 Tek sunucu
- 🔧 Özel konfigürasyon

**Yapılandırma:**
```
Frontend + Backend: Aynı VM (panel.otografi.com)
IIS Reverse Proxy: /api → Backend (Port 3007)
```

**DNS Kayıtları:**
```dns
A Record  panel  [VM_IP_ADDRESS]
```

**Frontend .env:**
```env
VITE_API_URL=https://panel.otografi.com/api
```

**Backend .env:**
```env
FRONTEND_URL=https://panel.otografi.com
NODE_ENV=production
```

**Deployment:**
```powershell
# VM'e bağlanın (RDP)
# PowerShell admin olarak açın

cd C:\rasim-otomotiv-panel

# Environment variables ayarlayın
notepad backend\.env
notepad frontend\.env

# Deploy script'ini çalıştırın
powershell -ExecutionPolicy Bypass -File deploy-windows.ps1
```

**Detaylı Guide:**
📄 [WINDOWS_DEPLOYMENT.md](WINDOWS_DEPLOYMENT.md)

---

## 🔧 Environment Variables Checklist

### Backend (ZORUNLU)
```env
✅ DATABASE_URL              # Supabase PostgreSQL connection
✅ SUPABASE_URL              # Supabase project URL
✅ SUPABASE_ANON_KEY         # Public anon key
✅ SUPABASE_SERVICE_ROLE_KEY # Service role key (GİZLİ!)
✅ JWT_SECRET                # Min 32 karakter random string
✅ JWT_EXPIRES_IN            # Örn: 7d
✅ FRONTEND_URL              # https://panel.otografi.com
✅ NODE_ENV                  # production
✅ PORT                      # 3007
```

### Backend (OPSİYONEL)
```env
✅ RESEND_API_KEY            # Email servisi için
✅ ADMIN_EMAIL               # Bildirimler için
```

### Frontend (ZORUNLU)
```env
✅ VITE_API_URL              # https://panel.otografi.com/api veya
                             # https://api.otografi.com/api
```

**Önemli Notlar:**
- ⚠️ `VITE_API_URL` sonunda `/api` olmalı
- ⚠️ Production'da HTTPS kullanılmalı
- ⚠️ `JWT_SECRET` minimum 32 karakter olmalı
- ⚠️ `.env` dosyası asla git'e eklenmemeli

---

## 📋 Deployment Öncesi Checklist

### Kod Hazırlığı
- [x] Backend build başarılı (`npm run build`)
- [x] Frontend build başarılı (`npm run build`)
- [x] TypeScript hataları yok
- [x] CORS ayarları doğru
- [x] `.env.example` güncel

### Database (Supabase)
- [ ] Production database oluşturuldu
- [ ] Tüm migration'lar çalıştırıldı
- [ ] RLS politikaları aktif
- [ ] İlk admin kullanıcısı oluşturuldu
- [ ] Backup yapılandırıldı

### Environment Variables
- [ ] Backend tüm değişkenler ayarlandı
- [ ] Frontend API URL doğru
- [ ] JWT_SECRET güçlü (32+ karakter)
- [ ] Production URL'leri kullanılıyor

### DNS & Domain
- [ ] DNS kayıtları eklendi
- [ ] DNS yayılması kontrol edildi (dnschecker.org)
- [ ] SSL sertifikası hazır

### Güvenlik
- [ ] `.env` git'e eklenmemiş
- [ ] `SERVICE_ROLE_KEY` gizli tutuluyor
- [ ] CORS sadece kendi domain'e izin veriyor
- [ ] Güçlü şifreler kullanılıyor

---

## 🧪 Deployment Sonrası Test

### 1. Backend API Test
```bash
# Health check
curl https://panel.otografi.com/api
# veya
curl https://api.otografi.com/api

# Beklenen: {"message": "API is running"}
```

### 2. Frontend Test
```
https://panel.otografi.com

✅ Site yükleniyor
✅ Console'da hata yok (F12)
✅ Login sayfası açılıyor
✅ Stil ve logo doğru
```

### 3. Authentication Test
```
1. Admin ile login ol
2. Dashboard'a yönlendirildiğini kontrol et
3. Token localStorage'da kaydedildi mi kontrol et
4. API istekleri Authorization header ile gidiyor mu
```

### 4. CRUD Operations Test
```
✅ Müşteri ekle/düzenle/sil
✅ Araç ekle/düzenle/sil
✅ İş emri oluştur
✅ Form validasyonları çalışıyor
✅ Toast bildirimleri gösteriliyor
```

---

## 📊 Monitoring Kurulumu

### Uptime Monitoring (Önerilen)
- [UptimeRobot](https://uptimerobot.com/) - Ücretsiz
- [Pingdom](https://www.pingdom.com/)
- [StatusCake](https://www.statuscake.com/)

### Error Tracking
- [Sentry](https://sentry.io/) - Ücretsiz tier
- Frontend + Backend entegrasyonu

### Log Monitoring
- **Vercel:** Dashboard → Logs
- **Railway:** Dashboard → Deployments → Logs
- **Windows VM:** PM2 logs veya Windows Event Viewer

---

## 💾 Backup Stratejisi

### 1. Database (Supabase)
```
✅ Otomatik günlük backup aktif
✅ Manuel backup: Supabase Dashboard → Database → Backups
✅ pg_dump ile local backup
```

### 2. Code
```bash
# Git repository güncel tutulmalı
git add .
git commit -m "Production release v1.0"
git tag v1.0
git push origin main --tags
```

### 3. Environment Variables
```
✅ Güvenli bir yerde saklanmalı (1Password, LastPass)
✅ Backend .env
✅ Frontend .env
✅ Tüm API keys
```

---

## 🚨 Sorun Giderme

### CORS Hatası
```typescript
// Backend CORS ayarlarını kontrol edin
// Frontend URL'sinin allowedOrigins'de olduğundan emin olun
FRONTEND_URL=https://panel.otografi.com
```

### API 404 Hatası
```
✅ VITE_API_URL sonunda /api var mı kontrol et
✅ Backend'de app.setGlobalPrefix('api') aktif mi
✅ Reverse proxy ayarları doğru mu (Windows VM için)
```

### SSL Sertifika Hatası
```bash
# Vercel/Railway: Otomatik SSL aktif
# Windows VM: Win-ACME ile Let's Encrypt kurun
# Veya Cloudflare ücretsiz SSL kullanın
```

### Build Hataları
```bash
# Backend
cd backend
rm -rf node_modules dist
npm install --legacy-peer-deps
npm run build

# Frontend
cd frontend
rm -rf node_modules dist
npm install --legacy-peer-deps
npm run build
```

---

## 📞 Destek ve İletişim

### Dokümantasyon
- 📄 [WINDOWS_DEPLOYMENT.md](WINDOWS_DEPLOYMENT.md) - Windows VM detaylı guide
- 📄 [DOMAIN_SETUP.md](DOMAIN_SETUP.md) - DNS ve domain yapılandırması
- 📄 [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) - Kapsamlı checklist

### Yararlı Linkler
- [Supabase Documentation](https://supabase.com/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Vite Documentation](https://vite.dev/)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)

---

## 🎯 Hızlı Başlangıç

### Vercel + Railway Deploy (5 dakika)

```bash
# 1. Frontend (Vercel)
cd frontend
npm install -g vercel
vercel login
vercel --prod

# Vercel Dashboard'da:
# - Settings → Environment Variables → VITE_API_URL ekle
# - Settings → Domains → panel.otografi.com ekle

# 2. Backend (Railway)
cd ../backend
npm install -g @railway/cli
railway login
railway up

# Railway Dashboard'da:
# - Variables → Tüm .env değişkenlerini ekle
# - Networking → Custom Domain → api.otografi.com ekle
```

### Windows VM Deploy (10 dakika)

```powershell
# 1. VM'e bağlan (RDP)
# 2. Node.js 22+ kur
# 3. Projeyi VM'e aktar (Git veya FTP)

cd C:\rasim-otomotiv-panel

# 4. Environment variables ayarla
notepad backend\.env    # Production değerlerini gir
notepad frontend\.env   # API URL'sini gir

# 5. Deploy script'ini çalıştır
powershell -ExecutionPolicy Bypass -File deploy-windows.ps1

# 6. IIS ve SSL kur (WINDOWS_DEPLOYMENT.md'ye bakın)
```

---

## ✅ Final Onay

Tüm bu adımlar tamamlandığında:

- ✅ Frontend erişilebilir: `https://panel.otografi.com`
- ✅ Backend çalışıyor: `https://panel.otografi.com/api` veya `https://api.otografi.com/api`
- ✅ SSL sertifikaları aktif
- ✅ Database bağlantısı çalışıyor
- ✅ Login/Register akışı test edildi
- ✅ Monitoring araçları kuruldu
- ✅ Backup stratejisi hazır

**Projeniz production'a hazır!** 🎉

---

**Son Güncelleme:** 26 Kasım 2025
**Versiyon:** 1.0
**Durum:** Production Ready ✅
