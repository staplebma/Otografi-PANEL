# ===================================
# RASIM OTOMOTIV PANEL - Windows Deployment Script
# Google Cloud Windows 2025 VM için
# ===================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RASIM OTOMOTIV PANEL - Windows Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Node.js kontrolü
Write-Host "[1/8] Node.js kontrol ediliyor..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion bulundu" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js bulunamadı! Lütfen Node.js 22+ kurun." -ForegroundColor Red
    Write-Host "İndirme: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# 2. PM2 kontrolü ve kurulumu
Write-Host "[2/8] PM2 kontrol ediliyor..." -ForegroundColor Yellow
try {
    pm2 --version | Out-Null
    Write-Host "✓ PM2 zaten kurulu" -ForegroundColor Green
} catch {
    Write-Host "PM2 kuruluyor..." -ForegroundColor Yellow
    npm install -g pm2
    Write-Host "✓ PM2 kuruldu" -ForegroundColor Green
}

# 3. Git pull (eğer git repo ise)
Write-Host "[3/8] Kod güncelleniyor..." -ForegroundColor Yellow
if (Test-Path .git) {
    git pull origin main
    Write-Host "✓ Kod güncellendi" -ForegroundColor Green
} else {
    Write-Host "⚠ Git repository değil, atlaniyor..." -ForegroundColor Yellow
}

# 4. Backend Dependencies
Write-Host "[4/8] Backend bağımlılıkları kuruluyor..." -ForegroundColor Yellow
Set-Location backend
npm install --legacy-peer-deps
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Backend bağımlılıkları kurulumunda hata!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Backend bağımlılıkları kuruldu" -ForegroundColor Green

# 5. Backend Build
Write-Host "[5/8] Backend build ediliyor..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Backend build hatası!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Backend build tamamlandı" -ForegroundColor Green
Set-Location ..

# 6. Frontend Dependencies
Write-Host "[6/8] Frontend bağımlılıkları kuruluyor..." -ForegroundColor Yellow
Set-Location frontend
npm install --legacy-peer-deps
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Frontend bağımlılıkları kurulumunda hata!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend bağımlılıkları kuruldu" -ForegroundColor Green

# 7. Frontend Build
Write-Host "[7/8] Frontend build ediliyor..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Frontend build hatası!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend build tamamlandı" -ForegroundColor Green
Set-Location ..

# 8. PM2 ile servisleri başlat
Write-Host "[8/8] Servisler başlatılıyor..." -ForegroundColor Yellow

# Backend'i PM2 ile başlat
Set-Location backend
pm2 delete rasim-backend -s
pm2 start dist/src/main.js --name rasim-backend --instances 1 --env production
Set-Location ..

# Frontend için basit bir HTTP server (serve paketi gerekli)
try {
    serve --version | Out-Null
} catch {
    Write-Host "serve paketi kuruluyor..." -ForegroundColor Yellow
    npm install -g serve
}

pm2 delete rasim-frontend -s
pm2 start serve --name rasim-frontend -- frontend/dist -s -l 80

# PM2'yi kaydet
pm2 save
pm2 startup

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ DEPLOYMENT TAMAMLANDI!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend: http://localhost:3007/api" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:80" -ForegroundColor Cyan
Write-Host ""
Write-Host "PM2 Komutları:" -ForegroundColor Yellow
Write-Host "  pm2 status          - Servisleri görüntüle" -ForegroundColor White
Write-Host "  pm2 logs            - Logları görüntüle" -ForegroundColor White
Write-Host "  pm2 restart all     - Tüm servisleri yeniden başlat" -ForegroundColor White
Write-Host "  pm2 stop all        - Tüm servisleri durdur" -ForegroundColor White
Write-Host ""
