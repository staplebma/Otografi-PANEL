# Windows Server 2025 Deployment Guide

Bu guide, Google Cloud Windows 2025 VM'de Rasim Otomotiv Panel'i nasıl deploy edeceğinizi gösterir.

## 📋 Ön Gereksinimler

### 1. Google Cloud VM Oluşturma

```powershell
# VM Özellikleri:
- İşletim Sistemi: Windows Server 2025
- Makine Tipi: e2-medium (2 vCPU, 4 GB RAM) veya daha iyi
- Disk: 50 GB SSD
- Firewall: HTTP (80), HTTPS (443), Custom TCP (3007)
```

### 2. Gerekli Yazılımlar

VM'e bağlandıktan sonra aşağıdaki yazılımları kurun:

#### Node.js 22+ Kurulumu
```powershell
# Node.js LTS'yi indirin ve kurun
# https://nodejs.org/
# PowerShell'de kontrol edin:
node --version
npm --version
```

#### Git Kurulumu (Opsiyonel)
```powershell
# Git for Windows: https://git-scm.com/download/win
git --version
```

## 🚀 Deployment Adımları

### 1. Projeyi VM'e Aktarma

**Seçenek A: Git ile**
```powershell
cd C:\
git clone https://github.com/yourusername/rasim-otomotiv-panel.git
cd rasim-otomotiv-panel
```

**Seçenek B: FTP/SFTP ile**
- FileZilla veya WinSCP kullanarak projeyi upload edin
- Proje klasörüne girin

### 2. Environment Variables Ayarlama

```powershell
# Backend .env dosyasını oluşturun
cd backend
Copy-Item .env.example .env
notepad .env
```

**.env dosyasını düzenleyin:**
```env
# Database (Supabase)
DATABASE_URL=your_supabase_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# JWT
JWT_SECRET=your_very_strong_jwt_secret_min_32_chars
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=https://panel.otografi.com

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=admin@otografi.com

# Application
NODE_ENV=production
PORT=3007
```

```powershell
# Frontend .env dosyasını oluşturun
cd ../frontend
Copy-Item .env.example .env
notepad .env
```

**Frontend .env:**
```env
VITE_API_URL=https://panel.otografi.com/api
```

### 3. Otomatik Deployment

```powershell
# Ana dizine dönün
cd ..

# PowerShell script'ini çalıştırın
powershell -ExecutionPolicy Bypass -File deploy-windows.ps1
```

Script şunları yapacak:
- ✅ Node.js ve PM2 kontrolü
- ✅ Backend dependencies kurulumu
- ✅ Backend build
- ✅ Frontend dependencies kurulumu
- ✅ Frontend build
- ✅ PM2 ile servisleri başlatma

### 4. Firewall Kuralları

Windows Firewall'da portları açın:

```powershell
# Port 3007 (Backend API)
New-NetFirewallRule -DisplayName "Rasim Backend API" -Direction Inbound -LocalPort 3007 -Protocol TCP -Action Allow

# Port 80 (HTTP)
New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow

# Port 443 (HTTPS)
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow
```

## 🌐 Domain ve SSL Kurulumu

### 1. Domain DNS Ayarları

**otografi.com** için DNS kayıtları:

```
A Record:
@ -> VM_IP_ADDRESS (otografi.com için)
panel -> VM_IP_ADDRESS (panel.otografi.com için)
```

### 2. IIS ile Reverse Proxy (Önerilen)

#### IIS Kurulumu
```powershell
# IIS'i yükleyin
Install-WindowsFeature -name Web-Server -IncludeManagementTools
```

#### URL Rewrite ve ARR Kurulumu
1. Web Platform Installer'ı indirin
2. URL Rewrite Module'ü kurun
3. Application Request Routing'i kurun

#### IIS Konfigürasyonu

**panel.otografi.com için site oluşturun:**

```xml
<!-- web.config -->
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <!-- API isteklerini backend'e yönlendir -->
                <rule name="API Proxy" stopProcessing="true">
                    <match url="^api/(.*)" />
                    <action type="Rewrite" url="http://localhost:3007/api/{R:1}" />
                </rule>

                <!-- Frontend için SPA routing -->
                <rule name="Frontend SPA">
                    <match url=".*" />
                    <conditions logicalGrouping="MatchAll">
                        <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
                        <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
                    </conditions>
                    <action type="Rewrite" url="/index.html" />
                </rule>
            </rules>
        </rewrite>

        <!-- CORS Headers -->
        <httpProtocol>
            <customHeaders>
                <add name="Access-Control-Allow-Origin" value="https://panel.otografi.com" />
                <add name="Access-Control-Allow-Methods" value="GET, POST, PUT, DELETE, OPTIONS" />
                <add name="Access-Control-Allow-Headers" value="Content-Type, Authorization" />
            </customHeaders>
        </httpProtocol>
    </system.webServer>
</configuration>
```

### 3. SSL Sertifikası (Let's Encrypt)

```powershell
# Win-ACME kullanarak SSL sertifikası alın
# https://www.win-acme.com/

# İndirip çalıştırın:
.\wacs.exe

# Sihirbazı takip edin:
# 1. Create new certificate
# 2. Single binding of an IIS site
# 3. panel.otografi.com sitesini seçin
# 4. Otomatik yenileme için görev zamanlayıcıyı ayarlayın
```

## 📊 Servis Yönetimi

### PM2 Komutları

```powershell
# Servislerin durumunu kontrol et
pm2 status

# Logları görüntüle
pm2 logs

# Belirli bir servisin logları
pm2 logs rasim-backend
pm2 logs rasim-frontend

# Servisleri yeniden başlat
pm2 restart all
pm2 restart rasim-backend

# Servisleri durdur
pm2 stop all

# Servisleri sil
pm2 delete all

# PM2'yi sistem başlangıcına ekle
pm2 startup
pm2 save
```

### Servis Durumunu Kontrol

```powershell
# Backend kontrolü
curl http://localhost:3007/api

# Frontend kontrolü
curl http://localhost:80
```

## 🔄 Güncelleme

Yeni versiyonu deploy etmek için:

```powershell
# Git ile güncelleyin (eğer git kullanıyorsanız)
git pull origin main

# Veya dosyaları manuel olarak upload edin

# Deploy script'ini çalıştırın
powershell -ExecutionPolicy Bypass -File deploy-windows.ps1
```

## 📝 Backup

### Otomatik Backup Script

```powershell
# backup.ps1
$backupPath = "C:\Backups\rasim-panel"
$timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"
$backupFolder = "$backupPath\$timestamp"

New-Item -ItemType Directory -Path $backupFolder -Force

# Backend'i yedekle
Copy-Item -Path "C:\rasim-otomotiv-panel\backend\.env" -Destination "$backupFolder\backend.env"

# Database backup (Supabase'den export yapın)

Write-Host "Backup tamamlandı: $backupFolder"
```

### Zamanlanmış Görev ile Otomatik Backup

```powershell
# Görev Zamanlayıcı'da yeni görev oluşturun
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\scripts\backup.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At 3am
Register-ScheduledTask -TaskName "RasimPanelBackup" -Action $action -Trigger $trigger
```

## 🔍 Monitoring

### Windows Performans İzleme

```powershell
# CPU ve RAM kullanımını izle
Get-Process node | Select-Object Name, CPU, WorkingSet

# PM2 monitoring
pm2 monit
```

### Logları İzleme

```powershell
# Gerçek zamanlı log izleme
pm2 logs --lines 100

# Log dosyalarının konumu
ls ~\.pm2\logs\
```

## ⚠️ Troubleshooting

### Backend çalışmıyor

```powershell
# Portu kontrol et
netstat -ano | findstr :3007

# .env dosyasını kontrol et
cd backend
cat .env

# Backend'i manuel başlat
npm run start:prod
```

### Frontend çalışmıyor

```powershell
# Build klasörünü kontrol et
ls frontend\dist

# Manuel serve
cd frontend\dist
npx serve -s . -l 80
```

### PM2 ile ilgili sorunlar

```powershell
# PM2'yi temizle ve yeniden başlat
pm2 kill
pm2 resurrect

# Veya tüm servisleri sil ve yeniden oluştur
pm2 delete all
powershell -ExecutionPolicy Bypass -File deploy-windows.ps1
```

## 📞 Destek

Sorun yaşarsanız:
1. PM2 loglarını kontrol edin: `pm2 logs`
2. Windows Event Viewer'ı kontrol edin
3. IIS loglarını kontrol edin (C:\inetpub\logs\LogFiles)

## 🔐 Güvenlik Notları

1. ✅ Windows Update'i düzenli çalıştırın
2. ✅ Güçlü parolalar kullanın
3. ✅ Sadece gerekli portları açın
4. ✅ SSL sertifikası kullanın
5. ✅ Düzenli backup alın
6. ✅ .env dosyalarını güvende tutun
7. ✅ Windows Defender'ı aktif tutun
