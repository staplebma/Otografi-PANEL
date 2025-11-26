# Domain Yapılandırması - panel.otografi.com

Bu guide, **otografi.com** domain'i için **panel.otografi.com** subdomain'ini nasıl yapılandıracağınızı gösterir.

## 📋 DNS Kayıtları

Domain sağlayıcınızın (GoDaddy, Namecheap, Cloudflare vb.) DNS yönetim panelinden aşağıdaki kayıtları ekleyin:

### Vercel için (Frontend Only)

```dns
Type: CNAME
Name: panel
Value: cname.vercel-dns.com
TTL: Auto
```

**Vercel Dashboard'da:**
1. Projenize gidin
2. Settings → Domains
3. "Add Domain" → `panel.otografi.com` ekleyin
4. Vercel size DNS doğrulaması için talimatlar verecek

### Railway için (Backend API)

```dns
Type: CNAME
Name: api
Value: [railway-size-verecek-değer].up.railway.app
TTL: Auto
```

**Railway Dashboard'da:**
1. Backend servisinize gidin
2. Settings → Networking → Custom Domain
3. `api.otografi.com` ekleyin
4. Railway size DNS kayıtlarını gösterecek

### Google Cloud VM için (Tam Stack)

```dns
Type: A Record
Name: panel
Value: [VM_IP_ADDRESS]
TTL: Auto

# Opsiyonel: API için ayrı subdomain
Type: A Record
Name: api
Value: [VM_IP_ADDRESS]
TTL: Auto
```

## 🚀 Deployment Senaryoları

### Senaryo 1: Vercel (Frontend) + Railway (Backend) ✅ Önerilen

**장점:**
- ✅ Otomatik ölçekleme
- ✅ Global CDN (Vercel)
- ✅ Kolay deployment
- ✅ Otomatik SSL
- ✅ CI/CD entegrasyonu

**DNS Yapılandırması:**
```
panel.otografi.com → Vercel (Frontend)
api.otografi.com → Railway (Backend)
```

**Environment Variables:**

Frontend (.env):
```env
VITE_API_URL=https://api.otografi.com/api
```

Backend (.env):
```env
FRONTEND_URL=https://panel.otografi.com
```

**Deployment Komutları:**
```bash
# Frontend - Vercel
cd frontend
vercel --prod

# Backend - Railway
cd backend
railway up
```

### Senaryo 2: Google Cloud Windows VM (Tam Stack)

**장점:**
- ✅ Tam kontrol
- ✅ Özel konfigürasyon
- ✅ Tek sunucu
- ✅ Düşük maliyet (küçük projeler için)

**DNS Yapılandırması:**
```
panel.otografi.com → VM_IP_ADDRESS
```

**IIS Reverse Proxy Yapılandırması:**
```
https://panel.otografi.com → Frontend (Port 80)
https://panel.otografi.com/api → Backend (Port 3007)
```

**Environment Variables:**

Frontend (.env):
```env
VITE_API_URL=https://panel.otografi.com/api
```

Backend (.env):
```env
FRONTEND_URL=https://panel.otografi.com
```

### Senaryo 3: Hybrid (Vercel Frontend + Google Cloud Backend)

**DNS Yapılandırması:**
```
panel.otografi.com → Vercel (CNAME)
api.otografi.com → VM_IP_ADDRESS (A Record)
```

## 🔐 SSL Sertifikası

### Vercel / Railway (Otomatik)
- SSL otomatik olarak sağlanır
- Kurulum gerekmez
- Let's Encrypt kullanılır

### Google Cloud VM (Manuel)

#### Seçenek 1: Win-ACME (Önerilen)
```powershell
# Win-ACME'yi indirin
# https://www.win-acme.com/

# Çalıştırın
.\wacs.exe

# 1. Create new certificate
# 2. Single binding of an IIS site
# 3. panel.otografi.com
# 4. Otomatik yenileme aktif
```

#### Seçenek 2: Certbot
```powershell
# Certbot Windows versiyonunu kurun
# https://certbot.eff.org/

certbot certonly --webroot -w C:\inetpub\wwwroot -d panel.otografi.com
```

#### Seçenek 3: Cloudflare (Ücretsiz)
1. Domain'i Cloudflare'e ekleyin
2. DNS kayıtlarını Cloudflare'e yönlendirin
3. SSL/TLS → Full (Strict) seçin
4. Otomatik HTTPS yeniden yönlendirme aktif

## ☁️ Cloudflare Yapılandırması (Önerilen)

###장점:
- ✅ Ücretsiz SSL
- ✅ DDoS koruması
- ✅ Global CDN
- ✅ Otomatik önbellek
- ✅ Web Application Firewall (WAF)

### Kurulum:
1. [Cloudflare.com](https://cloudflare.com)'a kaydolun
2. "Add a Site" → `otografi.com` ekleyin
3. Nameserver'ları değiştirin (GoDaddy/Namecheap'de)
4. DNS kayıtlarını ekleyin:

```
Type: A
Name: panel
Value: [VM_IP_veya_Vercel_IP]
Proxy: ✅ Enabled (Turuncu bulut)

Type: A
Name: api
Value: [Railway_IP_veya_VM_IP]
Proxy: ✅ Enabled
```

### SSL Ayarları:
```
SSL/TLS → Overview → Full (Strict)
SSL/TLS → Edge Certificates → Always Use HTTPS: ✅ On
```

### Page Rules (Opsiyonel):
```
panel.otografi.com/*
Cache Level: Standard
Browser Cache TTL: 4 hours

api.otografi.com/*
Cache Level: Bypass
```

## 🔄 CORS Yapılandırması

Backend'de CORS ayarlarını güncelleyin:

```typescript
// backend/src/main.ts
app.enableCors({
  origin: [
    'https://panel.otografi.com',
    'https://www.otografi.com',
    'http://localhost:5173', // Development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

## ✅ DNS Doğrulama

DNS değişikliklerinin yayılmasını kontrol edin:

```bash
# macOS/Linux
dig panel.otografi.com
nslookup panel.otografi.com

# Windows
nslookup panel.otografi.com
```

Online araçlar:
- https://dnschecker.org/
- https://mxtoolbox.com/SuperTool.aspx

## 📊 Deployment Checklist

### Frontend
- [ ] `VITE_API_URL` doğru şekilde ayarlandı
- [ ] Build başarılı (`npm run build`)
- [ ] Domain Vercel/VM'e bağlandı
- [ ] SSL sertifikası aktif
- [ ] Site açılıyor: `https://panel.otografi.com`

### Backend
- [ ] `FRONTEND_URL` doğru şekilde ayarlandı
- [ ] Database connection string doğru
- [ ] JWT secret production-ready
- [ ] CORS ayarları doğru
- [ ] API çalışıyor: `https://api.otografi.com/api` veya `https://panel.otografi.com/api`
- [ ] SSL sertifikası aktif

### Database (Supabase)
- [ ] Production database oluşturuldu
- [ ] Tüm migration'lar çalıştırıldı
- [ ] RLS politikaları aktif
- [ ] Backup yapılandırıldı

### Email (Resend)
- [ ] Resend API key alındı
- [ ] Domain doğrulandı (SPF/DKIM)
- [ ] Test email gönderildi

### Monitoring
- [ ] Error tracking kuruldu
- [ ] Uptime monitoring aktif
- [ ] Log toplama yapılandırıldı

## 🎯 Go Live Checklist

### Son Kontroller
1. [ ] Tüm environment variables production değerleri ile güncellenmiş
2. [ ] `NODE_ENV=production` her yerde ayarlanmış
3. [ ] SSL sertifikaları aktif ve geçerli
4. [ ] DNS kayıtları yayılmış (24-48 saat)
5. [ ] Tüm servisler çalışıyor
6. [ ] Login/Register akışı test edildi
7. [ ] API endpoint'leri test edildi
8. [ ] CORS hatası yok
9. [ ] Mobil görünüm test edildi
10. [ ] Performans test edildi

### İletişim
1. [ ] Admin kullanıcısı oluşturuldu
2. [ ] Müşteriye login bilgileri iletildi
3. [ ] Dokümantasyon paylaşıldı
4. [ ] Support kanalı aktif

## 🚨 Troubleshooting

### SSL Hatası (NET::ERR_CERT_AUTHORITY_INVALID)
```bash
# SSL sertifikasını kontrol et
openssl s_client -connect panel.otografi.com:443

# Cloudflare kullanıyorsanız, Full (Strict) moduna geçin
# Aksi halde Win-ACME ile sertifika oluşturun
```

### CORS Hatası
```typescript
// Backend CORS ayarlarını kontrol edin
// Frontend URL'sinin backend'de izin verildiğinden emin olun
FRONTEND_URL=https://panel.otografi.com
```

### API Erişilemiyor (404)
```bash
# Reverse proxy ayarlarını kontrol edin
# IIS web.config veya Nginx config
# API path'inin doğru olduğundan emin olun
```

### DNS Yayılmadı
```bash
# DNS propagation süresi: 0-48 saat
# Cloudflare kullanıyorsanız: ~5 dakika
# Kontrol: https://dnschecker.org/
```

## 📞 Destek

Sorun yaşarsanız:
1. Browser console'u kontrol edin (F12)
2. Network tab'ını kontrol edin
3. Backend logs'ları kontrol edin
4. DNS kayıtlarını doğrulayın
5. SSL sertifikasını kontrol edin
