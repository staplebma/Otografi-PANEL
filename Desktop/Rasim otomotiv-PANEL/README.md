# 🚗 Rasim Otomotiv Panel - CRM & Yönetim Sistemi

Modern, tam özellikli otomotiv işletme yönetim sistemi. NestJS ve React ile geliştirilmiştir.

[![Production Ready](https://img.shields.io/badge/Production-Ready-brightgreen)]()
[![License](https://img.shields.io/badge/License-Proprietary-red)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)]()

---

## ✨ Özellikler

### 🔐 Kimlik Doğrulama & Yetkilendirme
- **JWT Tabanlı Auth**: Güvenli token sistemi
- **Rol Bazlı Erişim**: Admin, Manager, User rolleri
- **Onay Sistemi**: Yeni kullanıcılar admin onayı bekler
- **Otomatik Yönlendirme**: Onay bekleyen kullanıcılar için özel sayfa

### 👥 Kullanıcı Yönetimi
- Kullanıcı CRUD işlemleri
- Rol atama (Admin, Manager, User)
- Kullanıcı onaylama/reddetme
- Aktif/pasif kullanıcı yönetimi

### 👤 Müşteri Yönetimi
- Tam müşteri veritabanı
- İletişim bilgileri yönetimi
- Müşteri arama ve filtreleme
- Müşteri geçmişi takibi

### 🚙 Araç Takibi
- Araç bilgileri ve plaka kayıtları
- Müşteri-araç ilişkilendirme
- Araç geçmişi
- VIN numarası takibi

### 💰 Satış Yönetimi
- Satış kayıtları
- Gelir takibi
- Satış raporları
- Rol bazlı satış görüntüleme

### 🔧 Servis Yönetimi
- Servis kayıtları
- İşlem detayları
- Maliyetlendirme
- Servis geçmişi

### 📊 Dashboard & Analitik
- Gerçek zamanlı istatistikler
- Müşteri/araç sayıları
- Satış grafikleri
- Son işlemler

### 📱 Responsive Tasarım
- Tüm cihazlarda çalışır
- Modern ve kullanıcı dostu arayüz
- Mobil uyumlu

---

## 🏗️ Teknoloji Stack

### Backend
```
NestJS          → Progressive Node.js framework
PostgreSQL      → Database (via Supabase)
JWT             → Authentication
TypeScript      → Type safety
bcrypt          → Password hashing
Passport        → Auth strategies
```

### Frontend
```
React 18        → UI library
TypeScript      → Type safety
Tailwind CSS    → Styling framework
Vite            → Build tool & dev server
React Router    → Navigation
Axios           → HTTP client
```

### Infrastructure
```
Supabase        → PostgreSQL database + RLS
Railway         → Backend hosting ($5/month free)
Vercel          → Frontend hosting (100% free)
```

---

## 🚀 Hızlı Başlangıç

### Seçenek 1: Production Deployment (Önerilen)

**10 dakikada canlıya alın!**

```bash
# Deployment rehberini okuyun
cat DEPLOYMENT_TURKCE.md

# Veya hızlı başlangıç için
cat QUICK_START.md
```

📚 **Detaylı Türkçe Rehber**: [DEPLOYMENT_TURKCE.md](./DEPLOYMENT_TURKCE.md)

### Seçenek 2: Lokal Development

#### Gereksinimler
- Node.js 18+
- npm veya yarn
- Supabase hesabı (ücretsiz)

#### Adım 1: Supabase Kurulumu

1. **Supabase projesi oluşturun**: https://supabase.com
2. **SQL Editor'da schema'yı çalıştırın**:
   ```bash
   # Dosya: backend/supabase-schema-fixed.sql
   ```
3. **Credentials alın**: Settings → API

Detaylar: [SUPABASE_KURULUM.md](./SUPABASE_KURULUM.md)

#### Adım 2: Backend Setup

```bash
cd backend

# Environment variables
cp .env.example .env
# .env dosyasını Supabase credentials ile doldurun

# Dependencies
npm install

# Development server
npm run start:dev
```

Backend: http://localhost:3007

#### Adım 3: Frontend Setup

```bash
cd frontend

# Environment variables
cp .env.example .env
# VITE_API_URL=http://localhost:3007/api

# Dependencies
npm install

# Development server
npm run dev
```

Frontend: http://localhost:5173

#### Adım 4: Admin Kullanıcı Oluştur

```bash
cd backend
node create-admin.js
```

#### Adım 5: Giriş Yapın

1. Browser'da http://localhost:5173 açın
2. Admin bilgilerinizle login olun
3. Dashboard'u görüntüleyin!

---

## 📁 Proje Yapısı

```
Rasim otomotiv-PANEL/
├── backend/                      # NestJS Backend
│   ├── src/
│   │   ├── auth/                # JWT Authentication
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── dto/             # Register/Login DTOs
│   │   │   └── strategies/      # JWT Strategy
│   │   ├── users/               # User Management
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── dto/
│   │   ├── customers/           # Customer CRUD
│   │   ├── vehicles/            # Vehicle Management
│   │   ├── sales/               # Sales Tracking
│   │   ├── services/            # Service Records
│   │   └── supabase/            # Supabase Client
│   ├── supabase-schema-fixed.sql  # Database Schema
│   ├── create-admin.js          # Admin Creation Script
│   ├── setup-production-db.js   # Production Setup
│   └── .env.example             # Environment Template
│
├── frontend/                     # React Frontend
│   ├── src/
│   │   ├── pages/               # Page Components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── PendingApproval.tsx
│   │   │   ├── Customers.tsx
│   │   │   └── ...
│   │   ├── components/          # Reusable Components
│   │   │   └── layout/
│   │   ├── services/            # API Services
│   │   │   ├── api.ts           # Axios Instance
│   │   │   ├── auth.ts          # Auth Service
│   │   │   └── ...
│   │   ├── types/               # TypeScript Types
│   │   └── App.tsx
│   └── .env.example
│
├── DEPLOYMENT_TURKCE.md         # 🇹🇷 Detaylı Deployment Rehberi
├── DEPLOYMENT_GUIDE.md          # 🇬🇧 Deployment Guide
├── QUICK_START.md               # ⚡ Quick Deploy (10 min)
├── SUPABASE_KURULUM.md          # Supabase Setup
├── railway.json                 # Railway Config
├── railway.toml                 # Railway Build Config
├── vercel.json                  # Vercel Config
├── deploy.sh                    # Automated Deploy Script
└── README.md                    # Bu dosya
```

---

## 🔐 Roller ve Yetkiler

### Admin (Yönetici)
- ✅ Tam sistem erişimi
- ✅ Kullanıcı yönetimi ve onaylama
- ✅ Tüm CRUD işlemleri
- ✅ Sistem ayarları
- ✅ Tüm raporları görüntüleme

### Manager (Müdür)
- ✅ Müşteri ve araç yönetimi
- ✅ Satış ve servis işlemleri
- ✅ Raporlar ve analizler
- ✅ Kullanıcıları görüntüleme (düzenleyemez)
- ❌ Sistem ayarları

### User (Kullanıcı)
- ✅ Sadece görüntüleme yetkisi
- ✅ Kişisel dashboard
- ❌ Ekleme/silme/düzenleme
- ❌ Diğer kullanıcıları göremez
- **Not**: Kayıt sonrası admin onayı gerekir

---

## 🔑 Environment Variables

### Backend (.env)

```bash
# Database (Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:6543/postgres
SUPABASE_URL=https://[REF].supabase.co
SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...

# JWT
JWT_SECRET=your-super-secret-minimum-32-characters-long
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=https://your-frontend.vercel.app

# Application
NODE_ENV=production
PORT=3007
```

### Frontend (.env)

```bash
# API URL
VITE_API_URL=https://your-backend.up.railway.app
```

Detaylar: `backend/.env.example` ve `frontend/.env.example`

---

## 📊 Database Schema

### Ana Tablolar

**users** - Kullanıcı hesapları
```sql
- id (uuid, primary key)
- email (unique)
- password (hashed)
- first_name, last_name
- role (admin/manager/user)
- is_active (boolean)
- created_at, updated_at
```

**customers** - Müşteri bilgileri
```sql
- id (uuid, primary key)
- first_name, last_name
- email, phone
- address
- created_at, updated_at
```

**vehicles** - Araç kayıtları
```sql
- id (uuid, primary key)
- customer_id (foreign key)
- plate, brand, model, year
- vin (chassis number)
- created_at, updated_at
```

**sales** - Satış kayıtları
```sql
- id (uuid, primary key)
- customer_id, vehicle_id
- sale_date, amount
- notes
- created_at, updated_at
```

**services** - Servis kayıtları
```sql
- id (uuid, primary key)
- vehicle_id
- service_date, description
- cost
- created_at, updated_at
```

### Row Level Security (RLS)

Supabase RLS policies ile güvenlik:
- Service role full access
- User role read-only
- Admin role için özel policies

Tam schema: [backend/supabase-schema-fixed.sql](./backend/supabase-schema-fixed.sql)

---

## 🌐 API Endpoints

### Authentication

```bash
POST   /auth/register         # Yeni kullanıcı kaydı
POST   /auth/login            # Giriş yap (JWT token al)
GET    /auth/profile          # Profil bilgisi (token gerekli)
```

### Users

```bash
GET    /users                 # Tüm kullanıcılar (admin)
GET    /users/:id/status      # Kullanıcı aktif mi? (onay kontrolü)
PATCH  /users/:id             # Kullanıcı güncelle (admin)
DELETE /users/:id             # Kullanıcı sil (admin)
```

### Customers

```bash
GET    /customers             # Tüm müşteriler
GET    /customers/:id         # Müşteri detay
POST   /customers             # Yeni müşteri
PATCH  /customers/:id         # Müşteri güncelle
DELETE /customers/:id         # Müşteri sil
GET    /customers/search?q=   # Müşteri ara
```

### Vehicles

```bash
GET    /vehicles              # Tüm araçlar
GET    /vehicles/:id          # Araç detay
POST   /vehicles              # Yeni araç
PATCH  /vehicles/:id          # Araç güncelle
DELETE /vehicles/:id          # Araç sil
```

### Sales & Services

```bash
GET    /sales                 # Satışlar (rol bazlı)
POST   /sales                 # Yeni satış
GET    /services              # Servis kayıtları
POST   /services              # Yeni servis
```

**Not**: Production'da `/api` prefix yok. Lokal development'da var.

---

## 🧪 Test

### Backend Test

```bash
cd backend
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:cov          # Coverage report
```

### Frontend Test

```bash
cd frontend
npm run test              # Run tests
npm run test:coverage     # Coverage report
```

---

## 🚀 Production Deployment

### Otomatik Deployment

```bash
./deploy.sh
```

Script size rehberlik eder:
1. Git kontrolü
2. Supabase schema check
3. Platform seçimi (Railway/Vercel)
4. Push to GitHub
5. Deployment adımları

### Manuel Deployment

#### 1. Supabase (Database)
- Proje oluştur
- Schema uygula
- Credentials al

#### 2. Railway (Backend)
- GitHub'dan import
- Environment variables ekle
- Deploy
- URL kopyala

#### 3. Vercel (Frontend)
- GitHub'dan import
- `VITE_API_URL` ekle (Railway URL)
- Deploy
- URL kopyala

#### 4. CORS Güncelle
- Railway'de `FRONTEND_URL` güncelle (Vercel URL)
- Redeploy

#### 5. Admin Oluştur
```bash
node backend/setup-production-db.js
```

#### 6. Test Et!
- Frontend URL'de login yap
- Tüm özellikleri test et

**📚 Detaylı Rehber**: [DEPLOYMENT_TURKCE.md](./DEPLOYMENT_TURKCE.md)

---

## 💰 Maliyet

### Ücretsiz Hosting (Hobby/Küçük İşletme)

| Servis | Plan | Maliyet |
|--------|------|---------|
| **Supabase** | Free (500MB DB) | $0/ay |
| **Railway** | Free ($5 credit) | $0/ay |
| **Vercel** | Free (Unlimited) | $0/ay |
| **Domain** | Freenom (.tk) | $0/yıl |
| **TOPLAM** | | **$0/yıl** 🎉 |

### Profesyonel Hosting

| Servis | Plan | Maliyet |
|--------|------|---------|
| **Supabase** | Free | $0/ay |
| **Railway** | Hobby | $5-20/ay |
| **Vercel** | Free | $0/ay |
| **Domain** | .com.tr | ~150 TL/yıl |
| **TOPLAM** | | **~$60-240/yıl** |

**Detaylı analiz**: [DEPLOYMENT_TURKCE.md - Maliyet Bölümü](./DEPLOYMENT_TURKCE.md#-maliyet-analizi)

---

## 🐛 Sorun Giderme

### Backend başlamıyor

**Kontrol listesi:**
- [ ] Supabase credentials doğru mu?
- [ ] `.env` dosyası var mı?
- [ ] Port 3007 kullanımda mı? (`lsof -ti:3007 | xargs kill -9`)
- [ ] `npm install` çalıştırıldı mı?

### Frontend'de API hatası

**Kontrol listesi:**
- [ ] Backend çalışıyor mu?
- [ ] `VITE_API_URL` doğru mu?
- [ ] CORS hatası var mı? (Backend `FRONTEND_URL` kontrol et)
- [ ] Browser console'da hata mesajı var mı?

### Login yapamıyorum

**Kontrol listesi:**
- [ ] Admin kullanıcısı oluşturuldu mu?
- [ ] Supabase'de `is_active = true` mi?
- [ ] Şifre doğru mu?
- [ ] Backend'de JWT_SECRET var mı?

### Deployment hataları

**Railway:**
- Logs kontrol et: Dashboard → Service → Deployments → View Logs
- Environment variables eksik mi?
- Build command doğru mu?

**Vercel:**
- Build logs kontrol et
- `VITE_API_URL` var mı?
- Redeploy dene (cache temizle)

**Supabase:**
- Schema uygulandı mı?
- RLS policies aktif mi?
- Service role key doğru mu?

**📚 Detaylı Troubleshooting**: [DEPLOYMENT_TURKCE.md - Sorun Giderme](./DEPLOYMENT_TURKCE.md#-sorun-giderme)

---

## 📚 Dokümantasyon

| Dosya | Açıklama | Dil |
|-------|----------|-----|
| **DEPLOYMENT_TURKCE.md** | Tam deployment rehberi (50+ sayfa) | 🇹🇷 |
| **DEPLOYMENT_GUIDE.md** | Full deployment guide | 🇬🇧 |
| **QUICK_START.md** | 10 dakikada deploy | 🇬🇧 |
| **SUPABASE_KURULUM.md** | Supabase setup | 🇹🇷 |
| **README.md** | Proje genel bilgi | 🇹🇷 |

---

## 🛠️ Development Scripts

### Backend

```bash
npm run start          # Production mode
npm run start:dev      # Development (watch mode)
npm run start:debug    # Debug mode
npm run build          # Build for production
npm run test           # Run tests
npm run lint           # ESLint check
```

### Frontend

```bash
npm run dev            # Development server
npm run build          # Build for production
npm run preview        # Preview production build
npm run lint           # ESLint check
```

---

## 🎯 Roadmap

### Yakın Gelecek (v1.1)
- [ ] Email bildirimleri (Nodemailer)
- [ ] Excel/PDF export
- [ ] Gelişmiş arama filtreleri
- [ ] Bulk operations (toplu işlem)

### Orta Vade (v1.2)
- [ ] WhatsApp entegrasyonu
- [ ] Randevu sistemi
- [ ] Stok yönetimi
- [ ] Faturalandırma modülü

### Uzun Vade (v2.0)
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced analytics & BI
- [ ] API for third-party integrations

---

## 🤝 Katkıda Bulunma

Bu proje özel/proprietary lisanslıdır. Katkı için lütfen iletişime geçin.

---

## 📄 Lisans

© 2024 Rasim Otomotiv. Tüm hakları saklıdır.

Bu yazılım özel/proprietary lisanslıdır. İzinsiz kullanım, kopyalama, dağıtım yasaktır.

---

## 🙏 Teşekkürler

Bu proje şu harika teknolojiler ile geliştirilmiştir:
- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [React](https://react.dev/) - UI library
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [Railway](https://railway.app/) - Deploy in minutes
- [Vercel](https://vercel.com/) - Frontend cloud

---

## 📞 Destek

Sorularınız için:
1. **Deployment**: [DEPLOYMENT_TURKCE.md](./DEPLOYMENT_TURKCE.md)
2. **Hızlı Başlangıç**: [QUICK_START.md](./QUICK_START.md)
3. **Supabase**: [SUPABASE_KURULUM.md](./SUPABASE_KURULUM.md)
4. **GitHub Issues**: Repository'de issue açın

---

<div align="center">

**🚗 Rasim Otomotiv Panel**

Made with ❤️ for automotive businesses

[Deploy Etmeye Başla →](./DEPLOYMENT_TURKCE.md)

</div>
