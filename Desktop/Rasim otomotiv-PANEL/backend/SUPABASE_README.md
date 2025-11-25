# Supabase Entegrasyonu

## Dosyalar

### 1. `supabase-schema-fixed.sql` (GÜNCEL)
Backend'in NestJS JWT authentication ile uyumlu hale getirilmiş schema dosyası.

**Özellikler:**
- ✅ RLS politikaları service_role için optimize edildi
- ✅ Dashboard için `dashboard_stats` view eklendi
- ✅ Tüm tablolar için performance index'leri
- ✅ Otomatik `updated_at` trigger'ları
- ✅ Foreign key ilişkileri ve CASCADE delete'ler

**Kullanım:**
```sql
-- Supabase SQL Editor'da çalıştırın
-- backend/supabase-schema-fixed.sql
```

### 2. `supabase-schema.sql` (ESKİ - KULLANMAYIN)
Eski schema dosyası. Supabase Auth ile çalışacak şekilde tasarlanmış ama bu projede kullanılmıyor.

### 3. `create-admin.js`
Admin ve test kullanıcılarını otomatik oluşturan script.

**Kullanım:**
```bash
node create-admin.js
```

**Oluşturduğu kullanıcılar:**
- admin@rasimotomotiv.com (Admin123!) - Admin
- manager@rasimotomotiv.com (Manager123!) - Manager
- user@rasimotomotiv.com (User123!) - User

### 4. `test-supabase.js`
Supabase bağlantısını test eden basit script.

## Backend Supabase Kullanımı

Backend'de Supabase şu şekilde kullanılıyor:

```typescript
// src/supabase/supabase.service.ts
import { createClient } from '@supabase/supabase-js';

// Service role key ile full access
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

**Önemli Notlar:**
- ✅ Backend **service_role** key kullanır (RLS bypass)
- ✅ Frontend'den direkt Supabase erişimi YOK
- ✅ Tüm veritabanı işlemleri Backend API üzerinden
- ✅ Authentication NestJS JWT ile yapılır
- ❌ Supabase Auth kullanılmaz

## Environment Variables

`.env` dosyasında olması gerekenler:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=eyJhbGc... (anon key - opsiyonel)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (service_role key - ZORUNLU)

# JWT Configuration (Backend'in kendi JWT'si)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Port
PORT=3007
```

## Veritabanı Tabloları

### users
Kullanıcı hesapları (admin, manager, user)

### customers
Müşteri bilgileri

### vehicles
Araç kayıtları (müşteriye bağlı)

### sales
Satış kayıtları

### service_records
Servis ve bakım kayıtları

### notifications
Kullanıcı bildirimleri

### dashboard_stats (VIEW)
Dashboard için özet istatistikler

## Row Level Security (RLS)

Backend service_role key kullandığı için RLS bypass edilir. RLS politikaları gelecekte direkt client access için hazır tutulmaktadır.

## Supabase Dashboard

### SQL Editor
Schema değişiklikleri için

### Table Editor
Manuel data girişi için

### Database -> Roles
Permissions kontrolü

### Logs
Hata ayıklama için

## Troubleshooting

### Backend Supabase'e bağlanamıyor
```bash
# .env dosyasını kontrol edin
cat backend/.env | grep SUPABASE

# URL https:// ile başlamalı
# SERVICE_ROLE_KEY doğru kopyalanmalı
```

### Users tablosu bulunamıyor
```bash
# Schema'yı Supabase'e yüklediniz mi?
# SQL Editor'da supabase-schema-fixed.sql çalıştırın
```

### RLS hatası alıyorum
```bash
# Service role key kullandığınızdan emin olun
# SUPABASE_SERVICE_ROLE_KEY değişkenini kontrol edin
```

## Migrasyonlar

Şu an migration sistemi yok. Schema değişiklikleri için:

1. `supabase-schema-fixed.sql` dosyasını güncelleyin
2. Supabase SQL Editor'da yeni değişiklikleri çalıştırın
3. Test edin

Gelecekte Supabase CLI ile migration sistemi eklenebilir.

## Performans

### Index'ler
Tüm foreign key'ler ve sık sorgulanan kolonlar için index mevcut.

### Views
`dashboard_stats` view performans için cache'lenebilir.

### Connection Pooling
Supabase otomatik connection pooling sağlar. Backend'de pool ayarı gerekmez.

## Güvenlik

- ✅ Service role key sadece backend'de
- ✅ Frontend direkt Supabase erişimi yok
- ✅ Tüm authentication backend'de
- ✅ RLS aktif (future-proof)
- ✅ SQL injection koruması (parameterized queries)
