# 🚀 Rasim Otomotiv Panel - Deployment Rehberi

> **panel.otografi.com** için production deployment guide

---

## 📌 Hızlı Başlangıç

### 3 Deployment Seçeneği:

1. **⭐ Vercel + Railway** (Önerilen - 5 dakika)
   - Frontend: Vercel
   - Backend: Railway
   - Otomatik SSL, Global CDN, Ölçekleme

2. **🖥️ Google Cloud Windows VM** (Tam Kontrol - 10 dakika)
   - Frontend + Backend: Aynı VM
   - IIS + PM2
   - Düşük maliyet

3. **☁️ Netlify + Railway** (Alternatif)
   - Frontend: Netlify
   - Backend: Railway

---

## 🎯 Hangi Seçeneği Seçmeliyim?

| Özellik | Vercel + Railway | Windows VM | Netlify + Railway |
|---------|------------------|------------|-------------------|
| Kurulum Süresi | ⭐⭐⭐ 5 dk | ⭐⭐ 10 dk | ⭐⭐⭐ 5 dk |
| Maliyet | 💰💰 Orta | 💰 Düşük | 💰💰 Orta |
| Ölçeklenebilirlik | ⭐⭐⭐ Yüksek | ⭐ Manuel | ⭐⭐⭐ Yüksek |
| Bakım | ⭐⭐⭐ Kolay | ⭐⭐ Orta | ⭐⭐⭐ Kolay |
| SSL | ✅ Otomatik | 🔧 Manuel | ✅ Otomatik |
| Global CDN | ✅ | ❌ | ✅ |

**Önerimiz:** Küçük-orta projeler için **Vercel + Railway**, tam kontrol istiyorsanız **Windows VM**.

---

## 🚀 Seçenek 1: Vercel + Railway (Önerilen)

### Adım 1: Environment Variables Hazırla

**Backend .env:**
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
JWT_SECRET=min-32-chars-random-string
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://panel.otografi.com
RESEND_API_KEY=re_xxxxxxxxxxxx
ADMIN_EMAIL=admin@otografi.com
NODE_ENV=production
PORT=3007
```

**Frontend .env:**
```env
VITE_API_URL=https://api.otografi.com/api
```

### Adım 2: Backend'i Railway'e Deploy Et

```bash
cd backend

# Railway CLI kur
npm install -g @railway/cli

# Login ol
railway login

# Deploy et
railway up

# Railway Dashboard'da:
# 1. Variables sekmesine git
# 2. Backend .env içeriğini tek tek ekle
# 3. Networking → Custom Domain → "api.otografi.com" ekle
```

### Adım 3: Frontend'i Vercel'e Deploy Et

```bash
cd frontend

# Vercel CLI kur
npm install -g vercel

# Login ol
vercel login

# Deploy et
vercel --prod

# Vercel Dashboard'da:
# 1. Settings → Environment Variables
# 2. VITE_API_URL = https://api.otografi.com/api ekle
# 3. Settings → Domains → "panel.otografi.com" ekle
# 4. Redeploy
```

### Adım 4: DNS Ayarları

Domain sağlayıcınızda (GoDaddy, Cloudflare vb.):

```dns
CNAME  panel  cname.vercel-dns.com
CNAME  api    [railway-value].up.railway.app
```

**✅ Tamamlandı! 5-10 dakikada DNS yayılacak.**

---

## 🖥️ Seçenek 2: Google Cloud Windows VM

### Adım 1: VM Oluştur

Google Cloud Console'da:
```
- İşletim Sistemi: Windows Server 2025
- Makine: e2-medium (2 vCPU, 4 GB RAM)
- Disk: 50 GB SSD
- Firewall: HTTP (80), HTTPS (443), TCP (3007)
```

### Adım 2: Gerekli Yazılımları Kur

VM'e RDP ile bağlanın, PowerShell'i admin olarak açın:

```powershell
# Node.js 22+ kur
# İndir: https://nodejs.org/

# Git kur (opsiyonel)
# İndir: https://git-scm.com/download/win

# Doğrula
node --version
npm --version
```

### Adım 3: Projeyi VM'e Aktar

**Git ile:**
```powershell
cd C:\
git clone https://github.com/yourusername/rasim-otomotiv-panel.git
cd rasim-otomotiv-panel
```

**Veya FTP/SFTP ile FileZilla veya WinSCP kullanarak upload edin.**

### Adım 4: Environment Variables Ayarla

```powershell
# Backend .env
cd backend
Copy-Item .env.example .env
notepad .env
# (Tüm production değerlerini girin)

# Frontend .env
cd ..\frontend
Copy-Item .env.example .env
notepad .env
# VITE_API_URL=https://panel.otografi.com/api
```

### Adım 5: Deploy Script'ini Çalıştır

```powershell
cd ..
powershell -ExecutionPolicy Bypass -File deploy-windows.ps1
```

Script şunları yapacak:
- ✅ Node.js ve PM2 kontrol
- ✅ Backend build ve başlat
- ✅ Frontend build ve başlat
- ✅ PM2 ile servisleri yönet

### Adım 6: IIS ve SSL Kur

**Detaylı guide:** [WINDOWS_DEPLOYMENT.md](WINDOWS_DEPLOYMENT.md)

**Özet:**
1. IIS kur: `Install-WindowsFeature -name Web-Server -IncludeManagementTools`
2. URL Rewrite Module ve ARR kur
3. `panel.otografi.com` için site oluştur
4. Reverse proxy yapılandır: `/api` → `http://localhost:3007/api`
5. SSL sertifikası kur (Win-ACME veya Cloudflare)

### Adım 7: DNS Ayarları

```dns
A Record  panel  [VM_IP_ADDRESS]
```

**✅ Tamamlandı!**

---

## ☁️ Seçenek 3: Netlify + Railway

Vercel + Railway ile neredeyse aynı, sadece:

```bash
# Frontend için Netlify kullan
cd frontend
npm install -g netlify-cli
netlify login
netlify deploy --prod

# Backend yine Railway
# (Vercel + Railway adımlarındaki gibi)
```

**netlify.toml zaten hazır.**

---

## 📋 Deployment Sonrası Checklist

### Test Et

```bash
# 1. Backend API
curl https://panel.otografi.com/api
# veya
curl https://api.otografi.com/api
# Beklenen: {"message": "API is running"}

# 2. Frontend
# Browser'da aç: https://panel.otografi.com
# ✅ Site yükleniyor
# ✅ Console'da hata yok (F12)
# ✅ Login sayfası açılıyor

# 3. Authentication
# Admin ile login ol
# ✅ Dashboard'a yönleniyor
# ✅ Token kaydediliyor

# 4. CRUD Operations
# Müşteri, araç, iş emri oluştur
# ✅ Formlar çalışıyor
# ✅ Veriler kaydediliyor
```

### Monitoring Kur

**Uptime Monitoring:**
- [UptimeRobot](https://uptimerobot.com/) - Ücretsiz

**Error Tracking:**
- [Sentry](https://sentry.io/) - Ücretsiz tier

### Backup Kur

1. **Database:** Supabase otomatik günlük backup
2. **Code:** Git repository güncel tut
3. **Env Variables:** Güvenli bir yerde sakla (1Password)

---

## 🔧 Sorun Giderme

### CORS Hatası
```
❌ Access to fetch at 'https://api.otografi.com/api' from origin 'https://panel.otografi.com' has been blocked by CORS policy

✅ Çözüm:
Backend .env'de FRONTEND_URL=https://panel.otografi.com olduğundan emin olun
Backend'i restart edin
```

### API 404
```
❌ GET https://panel.otografi.com/api 404 Not Found

✅ Çözüm:
VITE_API_URL sonunda /api var mı kontrol edin
Backend'de app.setGlobalPrefix('api') aktif mi kontrol edin
```

### Build Hatası
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

## 📚 Detaylı Dökümanlar

- 📄 [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) - Kapsamlı özet
- 📄 [WINDOWS_DEPLOYMENT.md](WINDOWS_DEPLOYMENT.md) - Windows VM detaylı guide
- 📄 [DOMAIN_SETUP.md](DOMAIN_SETUP.md) - DNS ve domain yapılandırması
- 📄 [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) - Deployment checklist

---

## 💡 Sık Sorulan Sorular

**S: Vercel ücretsiz mi?**
A: Evet, Hobby plan ücretsiz. Aylık 100 GB bandwidth.

**S: Railway ücretsiz mi?**
A: $5 ücretsiz kredi her ay. Hobby projeler için yeterli.

**S: Windows VM maliyeti ne kadar?**
A: Google Cloud e2-medium ~$25/ay. Always Free tier'da f1-micro ücretsiz ama yavaş.

**S: Hangi email servisi önerilir?**
A: Resend (3000 email/ay ücretsiz) veya Gmail SMTP.

**S: SSL sertifikası ücretsiz mi?**
A: Evet, Vercel/Railway/Netlify otomatik ücretsiz SSL. Windows VM için Let's Encrypt ücretsiz.

**S: Domain nereden alınır?**
A: GoDaddy, Namecheap, Cloudflare. Cloudflare önerilir (ücretsiz SSL proxy).

---

## 🎯 Hızlı Komutlar

```bash
# Backend build
cd backend && npm run build

# Frontend build
cd frontend && npm run build

# Backend local test
cd backend && npm run start:dev

# Frontend local test
cd frontend && npm run dev

# Docker build (backend)
docker build -t rasim-backend -f backend/Dockerfile .

# PM2 status (Windows VM)
pm2 status
pm2 logs
pm2 restart all
```

---

## ✅ Production Hazır

Tüm adımlar tamamlandığında:

- ✅ Frontend: `https://panel.otografi.com`
- ✅ Backend API: `https://api.otografi.com/api` veya `https://panel.otografi.com/api`
- ✅ SSL aktif
- ✅ Database bağlı
- ✅ Monitoring kurulu
- ✅ Backup aktif

**Projeniz canlıda!** 🎉

---

**Sorularınız için:** GitHub Issues veya support email

**Son Güncelleme:** 26 Kasım 2025
