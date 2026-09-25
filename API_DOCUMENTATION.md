# API Documentation - Samachar Dairy 247 (સમાચાર ડેરી ૨૪x૭)

Base URL: `https://your-domain.com/api/v1` (Production) / `http://localhost:8000/api/v1` (Local Dev)

## 1. Authentication & Security Headers

### Common Request Headers
```http
Accept: application/json
Content-Type: application/json
Authorization: Bearer <sanctum_token>  # Required for protected routes
```

### Roles & Access Control
- `public`: Unauthenticated readers. Access to published articles, tickers, categories, geography, market snapshots.
- `staff`: Authenticated reporters and journalists. Allowed to create, edit, draft, and submit articles/media for review. Forbidden (403) from approving, publishing, or archiving.
- `channel_head`: Chief Editor. Full authority to approve, reject with reason, schedule, publish, unpublish, archive, manage users, categories, ads, and platform settings.

---

## 2. Authentication Endpoints (`/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/login` | Login with email and password | No |
| `POST` | `/auth/logout` | Revoke current user token | Yes |
| `GET` | `/auth/me` | Fetch authenticated user profile & permissions | Yes |
| `POST` | `/auth/change-password` | Change account password (requires current_password, password, password_confirmation) | Yes |

### `POST /auth/login` Request Body:
```json
{
  "email": "user@example.com",
  "password": "your_secure_password"
}
```

---

## 3. Public Read-Only Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/homepage` | Full homepage aggregated data (Hero, Featured, Category blocks, Tickers) |
| `GET` | `/news` | Paginated list of published articles with optional filters |
| `GET` | `/news/{slug}` | Single published article detail with related stories and author profile |
| `GET` | `/breaking-news` | Active breaking news ticker headlines |
| `GET` | `/categories` | List of all 21 categories with Gujarati Unicode names and colors |
| `GET` | `/categories/{slug}` | Category details and associated articles |
| `GET` | `/districts` | All 33 Gujarat districts with Gujarati names, coordinates, and article counts |
| `GET` | `/districts/{slug}/news` | District-specific local news coverage |
| `GET` | `/cities` | Major cities of Gujarat |
| `GET` | `/cities/{slug}/news` | City-specific local news coverage |
| `GET` | `/market` | Live market index snapshots (NIFTY 50, SENSEX, BANK NIFTY) with disclaimer |
| `GET` | `/reels` | Official Instagram reels |
| `GET` | `/youtube` | Official YouTube video embeds |
| `GET` | `/galleries` | Photo galleries list |
| `GET` | `/galleries/{slug}` | Single photo gallery with multi-image lightbox data |
| `GET` | `/author/{slug}` | Journalist profile and published articles |
| `GET` | `/search?q={query}` | Search news by keywords, categories, and districts |
| `GET` | `/settings` | Public website settings, contact emails, social links |
| `POST` | `/analytics/track` | Track page view or article read events |

---

## 4. Staff Reporter Endpoints (`/staff`)

Requires `auth:sanctum` and role `staff` or `channel_head`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/staff/articles` | List articles authored by current user (with status filter) |
| `POST` | `/staff/articles` | Create a new article draft |
| `GET` | `/staff/articles/{id}` | Get article by ID for editing |
| `PUT` | `/staff/articles/{id}` | Update article draft |
| `DELETE` | `/staff/articles/{id}` | Delete article (only drafts can be deleted) |
| `POST` | `/staff/articles/{id}/submit` | Submit draft to Channel Head for editorial review |
| `POST` | `/staff/media/upload` | Upload image/media with metadata (caption, credit, alt) |
| `POST` | `/staff/reels` | Submit Instagram Reel for Channel Head approval |
| `POST` | `/staff/youtube` | Submit YouTube Video for Channel Head approval |
| `POST` | `/staff/galleries` | Submit Photo Gallery with multiple images for review |

---

## 5. Channel Head Editorial Endpoints (`/admin`)

Requires `auth:sanctum` and role `channel_head` strictly. Attempts by staff return **403 Forbidden**.

### 5.1 Dashboard & Articles
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/dashboard` | Overall editorial metrics, pending queues, top read stories |
| `GET` | `/admin/articles` | Master list of all articles in system with status & author filters |

### 5.2 Approval Queue & Workflow Actions
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/approval-queue` | Full pending review items (articles, reels, videos, galleries) |
| `GET` | `/admin/approval-queue/{id}` | Show detailed pending article with revision history |
| `POST` | `/admin/articles/{id}/approve` | Mark article as approved (ready for scheduled or manual publish) |
| `POST` | `/admin/articles/{id}/reject` | Reject article with **mandatory rejection reason** |
| `POST` | `/admin/articles/{id}/publish` | Instantly publish article to live website |
| `POST` | `/admin/articles/{id}/schedule` | Schedule article for future automated publishing |
| `POST` | `/admin/articles/{id}/unpublish` | Unpublish live article back to draft |
| `POST` | `/admin/articles/{id}/archive` | Archive article |
| `POST` | `/admin/reels/{id}/approve` | Approve and publish Instagram Reel |
| `POST` | `/admin/reels/{id}/reject` | Reject Instagram Reel with feedback |
| `POST` | `/admin/videos/{id}/approve` | Approve and publish YouTube Video |
| `POST` | `/admin/videos/{id}/reject` | Reject YouTube Video with feedback |
| `POST` | `/admin/galleries/{id}/approve` | Approve and publish Photo Gallery |
| `POST` | `/admin/galleries/{id}/reject` | Reject Photo Gallery with feedback |

### 5.3 Breaking News, Taxonomies & Layout CMS
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/breaking-news` | List breaking news tickers |
| `POST` | `/admin/breaking-news` | Create breaking news ticker with priority & expiry |
| `PUT` | `/admin/breaking-news/{id}` | Update breaking news ticker |
| `DELETE` | `/admin/breaking-news/{id}` | Delete breaking news ticker |
| `GET` | `/admin/categories` | List all categories with admin controls |
| `POST` | `/admin/categories` | Add a new category |
| `PUT` | `/admin/categories/{id}` | Update category |
| `DELETE` | `/admin/categories/{id}` | Delete category |
| `GET` | `/admin/homepage/sections` | List homepage sections and current sort order |
| `PUT` | `/admin/homepage/sections/order` | Reorder homepage sections (Drag-and-Drop) |
| `GET` | `/admin/advertisements` | List all advertisements and placements |
| `POST` | `/admin/advertisements` | Create advertisement slot |
| `PUT` | `/admin/advertisements/{id}` | Update advertisement slot |
| `DELETE` | `/admin/advertisements/{id}` | Delete advertisement |

### 5.4 Users, Analytics & Audit Trail
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/users` | List all staff reporters and channel heads |
| `POST` | `/admin/users` | Register a new staff member |
| `PATCH` | `/admin/users/{id}/toggle-status` | Toggle user active/inactive status |
| `GET` | `/admin/analytics` | Reader analytics, top categories, top cities, top authors |
| `GET` | `/admin/activity-logs` | Chronological audit log of all editorial actions |
| `GET` | `/admin/settings` | Get all system configuration keys |
| `POST` | `/admin/settings` | Update system configuration keys |
