# ☁️ Google Cloud VM Deployment Rehberi

Bu rehber, projenizi Google Cloud Compute Engine (VM) üzerinde Docker ve Caddy kullanarak `panel.otografi.com` adresinde nasıl yayınlayacağınızı anlatır.

## 📋 Ön Hazırlık

1.  **Google Cloud Hesabı**: [console.cloud.google.com](https://console.cloud.google.com) adresinden bir proje oluşturun.
2.  **Domain**: `panel.otografi.com` domainine sahip olmalısınız.

## 🚀 Adım 1: VM Oluşturma (Compute Engine)

1.  Google Cloud Console'da **Compute Engine** -> **VM instances** sayfasına gidin.
2.  **"Create Instance"** butonuna tıklayın.
3.  **Name**: `rasim-panel` (veya istediğiniz bir isim).
4.  **Region**: `europe-west3` (Frankfurt) veya size yakın bir yer.
5.  **Machine configuration**:
    *   **Series**: E2
    *   **Machine type**: `e2-small` (2 vCPU, 2 GB memory) veya `e2-medium` (4 GB memory). `e2-micro` yetersiz kalabilir.
6.  **Boot disk**:
    *   **Operating System**: Ubuntu
    *   **Version**: Ubuntu 22.04 LTS (x86/64)
    *   **Size**: 20 GB (Standart Persistent Disk yeterli).
7.  **Firewall**:
    *   ✅ **Allow HTTP traffic**
    *   ✅ **Allow HTTPS traffic**
8.  **Create** butonuna tıklayın.

## 🛠️ Adım 2: VM Hazırlığı

VM oluşturulduktan sonra **SSH** butonuna tıklayarak terminale bağlanın ve sırasıyla şu komutları çalıştırın:

```bash
# Sistemi güncelle
sudo apt update && sudo apt upgrade -y

# Docker kurulumu
sudo apt install -y docker.io docker-compose

# Docker servisini başlat
sudo systemctl start docker
sudo systemctl enable docker

# Kullanıcıyı docker grubuna ekle (sudo'suz docker komutları için)
sudo usermod -aG docker $USER
```

*Not: Bu aşamada SSH penceresini kapatıp tekrar açmanız gerekebilir (grup değişikliğinin aktif olması için).*

## 📦 Adım 3: Proje Dosyalarını Yükleme

En kolay yöntem projeyi Git üzerinden çekmektir. Eğer GitHub kullanıyorsanız:

```bash
# SSH anahtarı oluştur (GitHub'a eklemek için)
ssh-keygen -t ed25519 -C "vm-deploy"
cat ~/.ssh/id_ed25519.pub
# Çıkan anahtarı GitHub -> Settings -> SSH Keys bölümüne ekleyin.

# Projeyi klonla
git clone <GITHUB_REPO_URL> rasim-panel
cd rasim-panel
```

Eğer Git kullanmıyorsanız, dosyaları bilgisayarınızdan SCP ile gönderebilirsiniz (bunu geçiyorum, Git önerilir).

## ⚙️ Adım 4: Yapılandırma

Backend için `.env` dosyasını oluşturmanız gerekiyor.

```bash
cd backend
cp .env.example .env
nano .env
```

Açılan editörde `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` gibi değerleri doldurun.
**ÖNEMLİ**: `FRONTEND_URL` değerini `https://panel.otografi.com` olarak ayarlayın.

Kaydetmek için: `Ctrl+O`, `Enter`, `Ctrl+X`.

Ana dizine geri dönün:
```bash
cd ..
```

## 🌐 Adım 5: Domain Ayarları

1.  Google Cloud Console'da VM'inizin **External IP** adresini kopyalayın.
2.  Domain sağlayıcınızın (GoDaddy, Namecheap, vb.) DNS paneline gidin.
3.  Bir **A Kaydı** oluşturun:
    *   **Host/Name**: `panel`
    *   **Value/Target**: VM IP Adresi (örn: `34.123.45.67`)
    *   **TTL**: Automatic veya 1 saat.

## ▶️ Adım 6: Uygulamayı Başlatma

Ana dizinde (`docker-compose.yml` ve `Caddyfile` olduğu yerde):

```bash
docker-compose up -d --build
```

Bu komut:
1.  Backend ve Frontend imajlarını oluşturur.
2.  Caddy sunucusunu başlatır.
3.  Otomatik olarak SSL sertifikası alır (Let's Encrypt).

## ✅ Kontrol

Tarayıcınızda `https://panel.otografi.com` adresine gidin.
- Güvenli bağlantı (kilit ikonu) görmelisiniz.
- Uygulama açılmalı.
- Giriş yapıp API'nin çalıştığını test edin.

## 🔄 Güncelleme Yaparken

Kodda değişiklik yaptığınızda VM'de:

```bash
git pull
docker-compose up -d --build
```

## 🐛 Sorun Giderme

Eğer site açılmazsa:
1.  Container durumlarını kontrol edin: `docker-compose ps`
2.  Logları inceleyin: `docker-compose logs -f`
3.  Caddy logları SSL hatası verebilir (DNS henüz yayılmadıysa). Biraz bekleyip tekrar deneyin: `docker-compose restart caddy`
