# Deployment VPS dengan Docker

Panduan ini menggunakan Docker Compose dan Nginx sebagai reverse proxy. Port
aplikasi hanya dibuka pada `127.0.0.1`, sehingga akses publik harus melewati
Nginx.

## 1. Persiapan VPS

Contoh untuk Ubuntu:

```bash
sudo apt update
sudo apt install -y ca-certificates curl nginx
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
```

Keluar dan masuk kembali ke SSH agar group `docker` aktif. Pastikan DNS domain
admin sudah mengarah ke IP VPS.

## 2. Siapkan aplikasi

```bash
git clone <repository-url> /opt/sewantara-admin
cd /opt/sewantara-admin
cp .env.production.example .env.production
nano .env.production
```

Isi URL API publik:

```dotenv
NUXT_PUBLIC_API_BASE=https://api.domain-anda.com/api
APP_PORT=3005
TZ=Asia/Jakarta
```

`NUXT_PUBLIC_API_BASE` digunakan langsung oleh browser. Jangan memakai nama
service Docker seperti `http://backend:8000` kecuali nama tersebut memang dapat
diakses dari perangkat pengguna.

## 3. Build dan jalankan container

```bash
docker compose --env-file .env.production up -d --build
docker compose --env-file .env.production ps
docker compose --env-file .env.production logs --tail=100 admin
```

Tes dari VPS:

```bash
curl -I http://127.0.0.1:3005
```

## 4. Konfigurasi Nginx

```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/sewantara-admin
sudo nano /etc/nginx/sites-available/sewantara-admin
sudo ln -s /etc/nginx/sites-available/sewantara-admin /etc/nginx/sites-enabled/sewantara-admin
sudo nginx -t
sudo systemctl reload nginx
```

Ganti `admin.example.com` dengan domain sebenarnya.

Aktifkan HTTPS:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d admin.domain-anda.com
```

Backend API harus mengizinkan origin domain admin pada konfigurasi CORS.

## 5. Update aplikasi

```bash
cd /opt/sewantara-admin
git pull --ff-only
docker compose --env-file .env.production up -d --build
docker image prune -f
```

## Operasional

```bash
# Melihat log
docker compose --env-file .env.production logs -f admin

# Restart
docker compose --env-file .env.production restart admin

# Menghentikan aplikasi
docker compose --env-file .env.production down
```

Data bisnis tidak disimpan di container frontend. Menghapus atau membangun
ulang container tidak menghapus data backend.
