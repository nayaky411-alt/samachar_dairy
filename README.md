# Samachar Dairy 247 (સમાચાર ડેરી ૨૪x૭)

> **ગુજરાતનું સૌથી અદ્યતન, વિશ્વસનીય અને તટસ્થ ડિજિટલ સમાચાર માધ્યમ**  
> *Production-Ready Full-Stack Gujarati Digital News & Information Portal*

[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql)](https://mysql.com)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)]()

---

## 📌 Features & Highlights

1. **Full Gujarati Unicode Typography**:
   - Built with Google Fonts `Noto Sans Gujarati` + `Inter` for exceptional clarity across mobile and desktop.
   - Clean, light newsroom aesthetic (`#991b1b` deep crimson branding) designed for long reading sessions.

2. **Interactive SVG Gujarat District Map**:
   - Vector map connecting all **33 districts of Gujarat** (Ahmedabad, Surat, Rajkot, Kutch, Bhavnagar, Junagadh, etc.).
   - Interactive district selection with instant local news filtering and taluka counts.

3. **Strict Editorial Approval Workflow**:
   - **Staff Journalists**: Draft, edit, and submit articles, Instagram reels, YouTube videos, and photo galleries.
   - **Channel Head (Chief Editor)**: Comprehensive review desk. Can preview across Mobile/Tablet/Desktop, 1-click approve, schedule, publish, or **reject with mandatory feedback reason**.
   - Backend policy enforcement: Staff trying to approve or publish receives **403 Forbidden**.

4. **Live Indian Stock Market Module**:
   - Real-time indices: NIFTY 50, SENSEX, BANK NIFTY, NIFTY IT, NIFTY AUTO, NIFTY MIDCAP.
   - Transparent disclosure badge: `DEMO DATA / DELAYED DATA` with educational disclaimer.

5. **Multi-Format Media Integration**:
   - Official **Instagram Reels** embed viewer (9:16 vertical cards with modal preview).
   - Official **YouTube Video** embeds for ground reports and bulletins.
   - High-resolution **Photo Galleries** with responsive lightbox.

6. **Channel Head CMS & Governance**:
   - **Breaking News Ticker Manager**: Priority ordering and auto-expiration timer.
   - **Homepage Layout Manager**: Visual block reordering (Hero, Map, Market, Categories, Media).
   - **Advertisements Manager**: Banner slots with impression & click tracking.
   - **Users & Staff Manager**: Reporter status toggles and account creation.
   - **Audit Trail**: Complete chronological logging of every approval, edit, and publication.

---

## 🔐 Administrator Access

The portal includes an enterprise editorial CMS and newsroom workflow:
- **Channel Head (મુખ્ય સંપાદક)**: Full editorial governance, 1-click approvals, homepage curation, breaking news management, and system control (`/admin/dashboard`).
- **Staff Journalists (પત્રકારો)**: Reporter workspace for drafting and submitting articles, photo galleries, and multimedia (`/admin/staff`).

Administrators log in securely at `/login` using their configured credentials.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+ & npm

### 1. Backend Setup
```bash
cd backend

# Install PHP dependencies
composer install

# Environment configuration
cp .env.example .env
php artisan key:generate

# Run database migrations and seeders (All 33 districts, 21 categories, demo stories)
php artisan migrate --seed

# Create storage symlink for uploaded media
php artisan storage:link

# Start Laravel backend server (Port 8000)
php artisan serve
```

### 2. Frontend Setup
```bash
cd frontend

# Install Node dependencies
npm install

# Run Vite development server
npm run dev
```

The portal is now running at `http://localhost:5173/`.

### 3. Running Automated Tests
```bash
cd backend
php artisan test
```
*All 10 Feature and Unit tests will run and pass with 57 assertions.*

---

## 📂 Repository Structure

```text
samachar_dairy_247/
├── backend/                         # Laravel 12 REST API
│   ├── app/
│   │   ├── Http/Controllers/Api/V1/ # Public, Staff, and Admin Controllers (69 endpoints)
│   │   ├── Models/                  # 28 Eloquent Models
│   │   ├── Policies/                # ArticlePolicy (Workflow & RBAC rules)
│   │   └── Services/                # EditorialWorkflow, MarketData, Geo, Media services
│   ├── database/
│   │   ├── migrations/              # 12 Migrations (Taxonomies, Geography, CMS, RBAC)
│   │   └── seeders/                 # 33 Districts, 21 Categories, Demo Articles
│   ├── routes/                      # api.php, console.php
│   └── tests/Feature/               # Automated test suite (Workflow, Auth, Geography)
│
├── frontend/                        # React 19 + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── api/                     # Axios client with auto Bearer tokens
│   │   ├── components/
│   │   │   ├── admin/               # ArticleEditor, PreviewModal, RejectModal, Sidebar
│   │   │   ├── layout/              # Header, Footer, BreakingNewsTicker
│   │   │   ├── map/                 # Interactive SVG Gujarat 33 Districts Map
│   │   │   ├── market/              # Stock market ticker and indices cards
│   │   │   ├── media/               # ReelsSection, VideoSection, GallerySection
│   │   │   └── news/                # HeroSection, NewsCard, CategoryBlock
│   │   ├── context/                 # AuthContext, LanguageContext
│   │   └── pages/
│   │       ├── admin/               # 11 Channel Head CMS Pages
│   │       ├── staff/               # 8 Staff Journalist Pages
│   │       └── *.jsx                # Public Portal Pages (Home, Detail, Map, Market, etc.)
│   └── dist/                        # Production compiled bundle
│
├── HOSTINGER_DEPLOYMENT.md          # Complete Hostinger production deployment guide
├── API_DOCUMENTATION.md             # Specification for all 69 REST endpoints
├── DATABASE_DOCUMENTATION.md        # Database schema, ER diagram, and indexes
└── README.md                        # Master project documentation
```

---

## 🌐 Production Deployment

See [HOSTINGER_DEPLOYMENT.md](file:///c:/xampp/htdocs/samachar_dairy_247/HOSTINGER_DEPLOYMENT.md) for detailed Hostinger Business/Cloud hosting deployment instructions including MySQL setup, Apache `.htaccess` rewrite rules, and scheduled cron jobs.
