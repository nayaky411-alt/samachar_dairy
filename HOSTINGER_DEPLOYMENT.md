# Hostinger Deployment Guide - Samachar Dairy 247 (સમાચાર ડેરી ૨૪x૭)

This guide provides step-by-step instructions for deploying the **Samachar Dairy 247** platform on **Hostinger Business/Cloud Web Hosting** (cPanel / hPanel) with a **Laravel 11+ REST API**, **MySQL 8+**, and **React 19 + Vite Frontend**.

---

## 1. Prerequisites on Hostinger

1. **PHP Version**: Ensure PHP **8.2** or **8.3** is enabled in Hostinger hPanel (**Advanced -> PHP Configuration**).
2. **PHP Extensions**: Enable the following extensions in hPanel:
   - `bcmath`
   - `ctype`
   - `curl`
   - `dom`
   - `fileinfo`
   - `json`
   - `mbstring`
   - `openssl`
   - `pdo_mysql`
   - `tokenizer`
   - `xml`
   - `gd` or `imagick`
3. **Database**: MySQL 8.0+ or MariaDB 10.5+ with `utf8mb4` character set and `utf8mb4_unicode_ci` collation (essential for Gujarati Unicode fonts).

---

## 2. Recommended Directory Architecture

To protect sensitive Laravel credentials and environment files, follow this secure layout:

```text
/home/u123456789/
├── samachar_backend/               <-- Laravel backend code (OUTSIDE public_html)
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── routes/
│   ├── storage/
│   ├── .env                       <-- Secured environment configuration
│   └── artisan
│
└── public_html/                   <-- Public web root accessible by browsers
    ├── api/                       <-- Symlink or proxy to samachar_backend/public
    │   ├── index.php
    │   ├── .htaccess
    │   └── storage -> ../../samachar_backend/storage/app/public
    ├── assets/                    <-- React Vite production bundle files
    ├── index.html                 <-- React Vite SPA entry point
    └── .htaccess                  <-- SPA routing fallback
```

---

## 3. Database Setup

1. Log in to Hostinger hPanel -> **Databases -> MySQL Databases**.
2. Create a new database:
   - **Database Name**: `u123456789_samachar`
   - **Username**: `u123456789_newsuser`
   - **Password**: Generate a strong 20-character password.
3. Note these credentials for the `.env` configuration.

---

## 4. Backend Deployment Steps

### Step 4.1: Upload Backend Files
1. Compress the `backend/` folder into a `.zip` archive (exclude `vendor/` and `node_modules/`).
2. In Hostinger **File Manager**, create `/home/u123456789/samachar_backend`.
3. Upload and extract the archive into this folder.

### Step 4.2: Configure `.env`
Create or edit `/home/u123456789/samachar_backend/.env`:

```ini
APP_NAME="સમાચાર ડેરી ૨૪x૭"
APP_ENV=production
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=false
APP_URL=https://samachardairy247.com

LOG_CHANNEL=daily
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=u123456789_samachar
DB_USERNAME=u123456789_newsuser
DB_PASSWORD=YOUR_STRONG_PASSWORD

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=public
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

SANCTUM_STATEFUL_DOMAINS=samachardairy247.com,www.samachardairy247.com
```

### Step 4.3: Install Dependencies & Run Migrations via SSH
Connect to your Hostinger server using SSH (Terminal):

```bash
cd /home/u123456789/samachar_backend

# 1. Install production dependencies
composer install --no-dev --optimize-autoloader

# 2. Generate Application Key (if not present)
php artisan key:generate

# 3. Run database migrations with Gujarati seeders
php artisan migrate --force --seed

# 4. Create public storage symlink
php artisan storage:link

# 5. Optimize configurations and routes for high throughput
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## 5. Frontend Deployment Steps

### Step 5.1: Build Production Bundle Locally
On your workstation in `frontend/`:

```bash
# 1. Set production API base URL
# Create or edit frontend/.env.production
VITE_API_BASE_URL=https://samachardairy247.com/api/v1

# 2. Build production assets
npm run build
```

This compiles optimized assets into `frontend/dist/`.

### Step 5.2: Upload to `public_html`
Upload all contents inside `frontend/dist/` directly into Hostinger's `public_html/`:
- `public_html/index.html`
- `public_html/assets/index-*.js`
- `public_html/assets/index-*.css`
- `public_html/favicon.ico`

### Step 5.3: Public Root `.htaccess` (SPA Routing)
Create `/home/u123456789/public_html/.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Enforce HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # Route API requests to Laravel backend
  RewriteRule ^api/(.*)$ /api/index.php [L]

  # Direct file requests (images, css, js) served directly
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # Fallback all other routes to React index.html
  RewriteRule ^ index.html [L]
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

---

## 6. Hostinger Cron Jobs Configuration

Set up scheduled tasks in Hostinger hPanel -> **Advanced -> Cron Jobs**:

### 1. Master Laravel Scheduler (Runs Every Minute)
Executes scheduled article publishing and breaking news expiry checks:
- **Interval**: `* * * * *` (Every Minute)
- **Command**:
  ```bash
  /usr/bin/php /home/u123456789/samachar_backend/artisan schedule:run >> /dev/null 2>&1
  ```

---

## 7. Post-Deployment Verification Checklist

1. [ ] **Homepage Load**: Access `https://samachardairy247.com/` and confirm header, ticker, Gujarati map, and market widget load.
2. [ ] **Unicode Fonts**: Verify Gujarati text renders crisply with `Noto Sans Gujarati` without question marks or mojibake.
3. [ ] **Admin Login**: Go to `https://samachardairy247.com/login` and log in with your configured administrator credentials.
4. [ ] **Approval Workflow Test**:
   - Staff logs in, drafts an article, and submits for review.
   - Channel Head receives the pending notification in `/admin/channel-head/approval-queue`.
   - Channel Head approves and publishes the article.
   - Verify the article appears instantly on the public homepage.
5. [ ] **Media Uploads**: Upload an image in `/admin/staff/upload-media` and verify image is served with correct `storage/` URL.
