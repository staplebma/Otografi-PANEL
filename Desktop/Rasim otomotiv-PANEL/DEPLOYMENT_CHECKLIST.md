# ✅ Deployment Kontrol Listesi

Bu checklist'i deployment sırasında adım adım takip edin. Her adımı tamamladıkça işaretleyin.

---

## 📋 Deployment Öncesi Hazırlık

### Git ve Repository
- [ ] Tüm değişiklikler commit edildi
- [ ] `git push origin main` yapıldı
- [ ] GitHub'da tüm dosyalar görünüyor
- [ ] `.gitignore` dosyası `.env` dosyalarını exclude ediyor

### Dokümanları Oku
- [ ] [DEPLOYMENT_TURKCE.md](./DEPLOYMENT_TURKCE.md) dosyasını okudum
- [ ] Gerekli hesapları (Supabase, Railway, Vercel) oluşturdum

---

## 🗄️ Adım 1: Supabase Database

### Proje Oluşturma
- [ ] https://supabase.com adresinde hesap oluşturdum
- [ ] "New Project" ile yeni proje oluşturdum
- [ ] Proje adı: `rasim-otomotiv-panel`
- [ ] Database password'ü güçlü şekilde belirledim
- [ ] Password'ü kaydetdim (NOT DEFTERİNE!)
- [ ] Region: Europe West (Frankfurt) seçtim
- [ ] Proje hazır oldu (2-3 dakika bekleme)

### Schema Uygulama
- [ ] Sol menüden "SQL Editor" sekmesine gittim
- [ ] "New Query" butonuna tıkladım
- [ ] `backend/supabase-schema-fixed.sql` dosyasını açtım
- [ ] Dosyanın TÜM içeriğini kopyaladım
- [ ] SQL Editor'e yapıştırdım
- [ ] "Run" butonuna tıkladım
- [ ] "Success" mesajı gördüm
- [ ] "Table Editor" sekmesinde tabloları gördüm:
  - [ ] users
  - [ ] customers
  - [ ] vehicles
  - [ ] sales
  - [ ] services

### Credentials Alma
- [ ] "Project Settings" → "Database" sekmesine gittim
- [ ] "Connection string" → "URI" seçtim
- [ ] "Use connection pooling" kutusunu işaretledim
- [ ] Connection string'i kopyaladım (6543 port ile)
- [ ] Password'ü connection string içine yazdım
- [ ] **DATABASE_URL kaydetdim** ✍️

- [ ] "Project Settings" → "API" sekmesine gittim
- [ ] **Project URL kaydetdim** ✍️
- [ ] **anon/public key kaydetdim** ✍️
- [ ] **service_role key kaydetdim** ⚠️ (GİZLİ!)

---

## 🚂 Adım 2: Railway Backend

### Proje Oluşturma
- [ ] https://railway.app adresine gittim
- [ ] GitHub ile giriş yaptım
- [ ] "New Project" butonuna tıkladım
- [ ] "Deploy from GitHub repo" seçtim
- [ ] Repository'mi seçtim: "Rasim otomotiv-PANEL"
- [ ] Railway projeyi algıladı

### Environment Variables Ekleme
- [ ] "Variables" sekmesine gittim
- [ ] Şu değişkenleri TEK TEK ekledim:

**Database:**
- [ ] `DATABASE_URL` = [Supabase connection string]
- [ ] `SUPABASE_URL` = [Supabase project URL]
- [ ] `SUPABASE_ANON_KEY` = [Supabase anon key]
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = [Supabase service role key]

**JWT:**
- [ ] `JWT_SECRET` = [32+ karakter güçlü şifre]
- [ ] `JWT_EXPIRES_IN` = `7d`

**CORS:**
- [ ] `FRONTEND_URL` = `http://localhost:5173` (şimdilik, sonra güncelleyeceğiz)

**Application:**
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `3007`

### Deployment
- [ ] Environment variables eklendi
- [ ] Railway otomatik deploy başlattı
- [ ] "Deployments" sekmesinde ilerlemeyi izledim
- [ ] 🟢 "Success" durumunu gördüm (3-5 dakika sürdü)

### Backend URL Alma
- [ ] "Settings" sekmesine gittim
- [ ] "Networking" bölümünü buldum
- [ ] "Generate Domain" butonuna tıkladım
- [ ] **Backend URL'i kaydetdim** ✍️
  - Örnek: `https://rasim-otomotiv-production.up.railway.app`

### Backend Test
- [ ] Browser'da backend URL'i açtım
- [ ] Boş sayfa veya "Cannot GET /" gördüm (NORMAL!)
- [ ] Backend çalışıyor ✅

---

## ⚡ Adım 3: Vercel Frontend

### Proje Import
- [ ] https://vercel.com adresine gittim
- [ ] GitHub ile giriş yaptım
- [ ] "Add New..." → "Project" seçtim
- [ ] Repository'mi buldum
- [ ] "Import" butonuna tıkladım

### Proje Yapılandırma
- [ ] Framework Preset: `Vite` (otomatik algılandı)
- [ ] "Root Directory" → `frontend` seçtim (MUTLAKA!)
- [ ] Build Command: `npm run build` (otomatik)
- [ ] Output Directory: `dist` (otomatik)

### Environment Variables
- [ ] "Environment Variables" bölümünü açtım
- [ ] Şu değişkeni ekledim:
  - [ ] `VITE_API_URL` = [Railway backend URL'im]
  - ⚠️ Sonuna `/api` EKLEMEDİM!

### Deploy
- [ ] "Deploy" butonuna tıkladım
- [ ] Deploy işlemini izledim (2-3 dakika)
- [ ] 🎉 "Congratulations" mesajı gördüm
- [ ] **Frontend URL'i kaydetdim** ✍️
  - Örnek: `https://rasim-otomotiv-panel.vercel.app`

### Frontend Test
- [ ] Browser'da frontend URL'i açtım
- [ ] Login sayfasını gördüm ✅
- [ ] (CORS hatası alıyorum - Normal, bir sonraki adımda düzelecek)

---

## 🔗 Adım 4: CORS Güncelleme

### Railway'de FRONTEND_URL Güncelleme
- [ ] Railway Dashboard'a geri döndüm
- [ ] Projemi ve backend service'imi seçtim
- [ ] "Variables" sekmesine gittim
- [ ] `FRONTEND_URL` değişkenini buldum
- [ ] ✏️ Edit butonuna tıkladım
- [ ] Vercel URL'im ile değiştirdim (https:// ile başlayan)
- [ ] "Update" butonuna tıkladım
- [ ] Railway otomatik redeploy etti (30-60 saniye bekledim)

### CORS Test
- [ ] Frontend URL'i tekrar açtım
- [ ] Sayfayı yeniledim (Hard refresh: Cmd+Shift+R)
- [ ] CORS hatası kayboldu ✅
- [ ] Register sayfası çalışıyor

---

## 👤 Adım 5: Admin Kullanıcı Oluşturma

### Yöntem: Supabase Dashboard (Hızlı)

#### Şifre Hash Oluşturma
- [ ] Terminal'de şu komutu çalıştırdım:
```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Admin123!', 10).then(console.log);"
```
- [ ] Çıkan hash'i kopyaladım
- [ ] Hash'i kaydetdim ✍️

#### Admin User Ekleme
- [ ] Supabase Dashboard → "Table Editor" gittim
- [ ] "users" tablosunu seçtim
- [ ] "Insert" → "Insert row" butonuna tıkladım
- [ ] Formu doldurdum:
  - [ ] email: `admin@rasimotomotiv.com`
  - [ ] password: [Yukarıda oluşturduğum hash]
  - [ ] first_name: `Admin`
  - [ ] last_name: `User`
  - [ ] role: `admin`
  - [ ] is_active: `true`
- [ ] "Save" butonuna tıkladım
- [ ] Admin user oluşturuldu ✅

### Alternatif: Otomatik Script
- [ ] Terminal'de çalıştırdım:
```bash
cd backend
node setup-production-db.js
```
- [ ] Script sorularını cevapladım
- [ ] Admin user oluşturuldu ✅

---

## 🧪 Adım 6: Sistem Testi

### Login Test
- [ ] Frontend URL'i açtım
- [ ] "Giriş Yap" sayfasına gittim
- [ ] Admin email ve password girdim
- [ ] "Giriş" butonuna tıkladım
- [ ] Dashboard'a yönlendirildim ✅
- [ ] Hoşgeldin mesajı gördüm

### Registration Test
- [ ] "Kayıt Ol" sayfasına gittim
- [ ] Test kullanıcı bilgileri girdim
  - [ ] Email, password, ad, soyad
  - [ ] Role: user (default)
- [ ] "Kayıt Ol" butonuna tıkladım
- [ ] "Üyeliğiniz Onay Bekliyor" sayfasına yönlendirildim ✅
- [ ] Sayfa her 5 saniyede kontrol ediyor

### User Approval Test
- [ ] Supabase → Table Editor → users
- [ ] Yeni kullanıcıyı buldum
- [ ] `is_active` değerini `false`'dan `true` yaptım
- [ ] "Save" tıkladım
- [ ] 5 saniye içinde kullanıcı otomatik login sayfasına yönlendirildi ✅

### Feature Test
- [ ] **Dashboard**: İstatistikler görünüyor
- [ ] **Müşteriler**: Liste görünüyor
- [ ] **Müşteri Ekle**: Form çalışıyor, kayıt ediliyor
- [ ] **Müşteri Düzenle**: Düzenleme çalışıyor
- [ ] **Araçlar**: Liste görünüyor
- [ ] **Satışlar**: Liste görünüyor
- [ ] **Servisler**: Liste görünüyor

### Browser Console Test
- [ ] F12 ile Developer Tools açtım
- [ ] "Console" sekmesinde ERROR yok ✅
- [ ] "Network" sekmesinde API istekleri başarılı (200 status)

---

## 🌐 Adım 7: Custom Domain (Opsiyonel)

⚠️ Bu adım opsiyoneldir. Domain eklemek istemiyorsanız atlayabilirsiniz.

### Domain Satın Alma
- [ ] Domain sağlayıcıdan domain aldım
  - Ücretsiz: Freenom.com (.tk/.ml/.ga)
  - Ücretli: Hostinger, Namecheap, GoDaddy
- [ ] Domain'imi kaydetdim ✍️

### Frontend Domain (Vercel)
- [ ] Vercel Dashboard → Projem → "Settings" → "Domains"
- [ ] Domain'imi yazdım (örn: `rasimotomotiv.com`)
- [ ] "Add" butonuna tıkladım
- [ ] Vercel bana DNS kayıtlarını gösterdi

**DNS Kayıtları:**
- [ ] Domain sağlayıcıma gittim (DNS Management)
- [ ] Şu kayıtları ekledim:
  - [ ] `A` record: `@` → `76.76.21.21`
  - [ ] `CNAME` record: `www` → `cname.vercel-dns.com`
- [ ] DNS kayıtlarını kaydettim
- [ ] 30-60 dakika bekledim (DNS yayılması için)
- [ ] https://www.whatsmydns.net adresinde kontrol ettim
- [ ] DNS yayıldı ✅
- [ ] Domain çalışıyor ✅

### Backend Subdomain (Railway)
- [ ] Railway → Service → "Settings" → "Networking"
- [ ] "Custom Domain" alanına subdomain yazdım: `api.rasimotomotiv.com`
- [ ] "Add" tıkladım
- [ ] Railway bana CNAME gösterdi

**DNS Kaydı:**
- [ ] Domain DNS panel'inde:
  - [ ] `CNAME` record: `api` → `[railway-url].up.railway.app`
- [ ] Kaydettim
- [ ] 30-60 dakika bekledim
- [ ] Subdomain çalışıyor ✅

### Environment Variables Güncelleme

**Railway:**
- [ ] Variables sekmesine gittim
- [ ] `FRONTEND_URL` → Custom domain'im ile güncelledim
  - Örnek: `https://rasimotomotiv.com`
- [ ] Kaydettim (otomatik redeploy)

**Vercel:**
- [ ] Settings → Environment Variables
- [ ] `VITE_API_URL` → Backend subdomain ile güncelledim
  - Örnek: `https://api.rasimotomotiv.com`
- [ ] Kaydettim
- [ ] Deployments → Latest → Redeploy (cache temizle)

### Domain Test
- [ ] Custom domain'i browser'da açtım
- [ ] HTTPS çalışıyor (kilit ikonu) ✅
- [ ] Login sayfası geliyor ✅
- [ ] Login oldum
- [ ] F12 → Network → API istekleri subdomain'e gidiyor ✅

---

## 🎊 Tamamlandı! Final Checklist

### Genel Kontroller
- [ ] ✅ Supabase database çalışıyor
- [ ] ✅ Railway backend çalışıyor
- [ ] ✅ Vercel frontend çalışıyor
- [ ] ✅ CORS ayarları doğru
- [ ] ✅ Admin kullanıcı var ve giriş yapabiliyor
- [ ] ✅ User registration + approval flow çalışıyor
- [ ] ✅ Tüm CRUD işlemleri çalışıyor
- [ ] ✅ (Opsiyonel) Custom domain çalışıyor

### Güvenlik Kontrolleri
- [ ] ✅ `.env` dosyaları git'e commit edilmedi
- [ ] ✅ JWT_SECRET güçlü ve benzersiz
- [ ] ✅ Supabase service_role key gizli
- [ ] ✅ Database passwords güvenli

### Performans Kontrolleri
- [ ] ✅ Frontend hızlı yükleniyor (<3 saniye)
- [ ] ✅ API response süreleri makul (<500ms)
- [ ] ✅ HTTPS aktif (SSL sertifikası var)

### Monitoring Setup
- [ ] Railway Dashboard'u bookmark'ladım
- [ ] Vercel Dashboard'u bookmark'ladım
- [ ] Supabase Dashboard'u bookmark'ladım
- [ ] Log'ları nasıl kontrol edeceğimi biliyorum

---

## 📱 Sonraki Adımlar

### Hemen Yapılacaklar
- [ ] Personeli sistemi kullanmaları için eğit
- [ ] Mevcut müşteri verilerini sisteme aktar
- [ ] Test verileri ekle ve dene
- [ ] Backup stratejisi belirle

### İyileştirmeler
- [ ] Email bildirimleri ekle (Nodemailer)
- [ ] Excel export özelliği ekle
- [ ] Gelişmiş arama filtreleri
- [ ] Dashboard grafiklerini geliştir

### Monitoring
- [ ] Haftalık Railway/Vercel logs kontrol et
- [ ] Aylık kullanım istatistiklerini gözden geçir
- [ ] Performance metriklerini takip et
- [ ] Kullanıcı feedback'i topla

---

## 🆘 Sorun Olursa

Deployment sırasında sorun yaşarsanız:

1. **İlk olarak**: [DEPLOYMENT_TURKCE.md - Sorun Giderme](./DEPLOYMENT_TURKCE.md#-sorun-giderme) bölümüne bakın
2. **Logs kontrol**: Railway/Vercel/Supabase dashboard'larında error logs
3. **Browser console**: F12 açıp hata mesajlarına bakın
4. **Environment variables**: Tüm değişkenlerin doğru olduğunu kontrol edin
5. **DNS yayılması**: Domain sorunları için 1 saat bekleyin

---

## 🎉 Tebrikler!

✅ Rasim Otomotiv Panel başarıyla production'a alındı!

Artık sistem tamamen operasyonel ve kullanıma hazır.

**Deployment tarihi**: _______________
**Deployment eden**: _______________
**Production URL**: _______________
**Backend URL**: _______________

---

*Deployment checklist v1.0 - 24 Kasım 2024*
