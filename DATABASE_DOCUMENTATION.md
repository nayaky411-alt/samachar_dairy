# Database Documentation - Samachar Dairy 247 (સમાચાર ડેરી ૨૪x૭)

## 1. Schema Overview

The database is built on **MySQL 8.0+** with `utf8mb4` character set and `utf8mb4_unicode_ci` collation, ensuring full support for Gujarati Unicode characters across headlines, articles, categories, and tags.

---

## 2. Core Tables and Relationships

### 2.1 Users & Authentication (`users`, `roles`, `permissions`)
- `users`: Stores user identity, hashed passwords, editorial roles (`channel_head` or `staff`), designation (e.g., 'સુરત બ્યુરો ચીફ'), Gujarati bio, phone number, and soft deletes.
- `roles` & `permissions`: RBAC mapping table for fine-grained permissions.

### 2.2 Geography (`states`, `districts`, `talukas`, `cities`, `local_areas`)
- Represents all **33 districts of Gujarat** with English and Gujarati names (`name`, `name_gu`), vector SVG coordinates, and district headquarters.
- `cities`: Major commercial centers (Ahmedabad, Surat, Vadodara, Rajkot, Bhavnagar, Jamnagar, Junagadh, Gandhinagar, etc.).
- Relational foreign keys connect articles directly to `district_id` and `city_id` for instant map filtering and localized journalism.

### 2.3 Taxonomies (`categories`, `subcategories`, `topics`, `tags`)
- 21 categories seeded with Gujarati names and color schemes:
  1. ગુજરાત (Gujarat)
  2. ભારત (National / India)
  3. વિશ્વ (World / International)
  4. રાજકારણ (Politics)
  5. બિઝનેસ (Business & Industry)
  6. શેરબજાર (Stock Market)
  7. કૃષિ અને ગ્રામીણ (Agriculture & Farmers)
  8. રમતગમત (Sports / Cricket)
  9. મનોરંજન (Entertainment)
  10. ટેકનોલોજી અને વિજ્ઞાન (Tech & Science)
  11. શિક્ષણ અને કારકિર્દી (Education & Jobs)
  12. આરોગ્ય અને સુખાકારી (Health & Wellness)
  13. ધર્મ અને સંસ્કૃતિ (Religion & Heritage)
  14. જીવનશૈલી (Lifestyle)
  15. ગુનો અને ન્યાય (Crime & Legal)
  16. પર્યાવરણ અને હવામાન (Weather & Environment)
  17. ઓટોમોબાઇલ (Automobile)
  18. રસપ્રદ / વાયરલ (Viral / Trending)
  19. સંપાદકીય / વિચાર (Editorials & Opinion)
  20. વિશેષ અહેવાલ (Special Investigative Reports)
  21. ફેક્ટ ચેક (Fact Check)

### 2.4 Editorial Core (`articles`, `article_revisions`, `breaking_news`)
- `articles`:
  - `title`: Gujarati headline.
  - `slug`: Unique SEO URL.
  - `content`: Rich-text HTML formatted body.
  - `status`: Enum (`draft`, `pending_review`, `approved`, `published`, `scheduled`, `rejected`, `archived`).
  - `rejection_reason`: Mandatory feedback when Channel Head rejects.
  - `author_id`: Foreign key to `users`.
  - `reviewer_id`: Channel Head who approved or rejected.
  - `views_count`, `shares_count`: Metric counters.
  - `published_at`, `scheduled_at`: Publishing timestamps.
- `article_revisions`: Version tracking capturing author changes across submissions.
- `breaking_news`: Tickers with priority levels and automatic expiration timestamps.

### 2.5 Media & Social (`media`, `instagram_reels`, `youtube_videos`, `photo_galleries`, `gallery_images`)
- `media`: Safe file storage library tracking MIME type, file size, dimensions, and photographer credit.
- `instagram_reels`: 9:16 aspect ratio reels with status and review workflow.
- `youtube_videos`: Official channel YouTube embed references.
- `photo_galleries` & `gallery_images`: Multi-photo albums for festivals and breaking coverage with lightbox ordering.

### 2.6 Indian Stock Market (`market_indices`, `market_symbols`, `market_snapshots`)
- Stores indices: NIFTY 50, SENSEX, BANK NIFTY, NIFTY IT, NIFTY AUTO, NIFTY MIDCAP.
- Market symbols with LTP, Change, Percent Change, High, Low, 52W High, 52W Low.
- Historical snapshots for intraday charts.

### 2.7 CMS Layout, Ads & System Logs (`homepage_sections`, `advertisements`, `activity_logs`, `settings`)
- `homepage_sections`: Reorderable section weights for live homepage layout customizer.
- `advertisements`: Banner slots with impression and click tracking.
- `activity_logs`: Strict audit trail recording IP address, actor, and editorial action.
- `settings`: Key-value configuration for sitewide parameters.

---

## 3. Database Indexes for Performance

The following composite and single indexes are applied for rapid queries under high concurrent loads:

- `articles(status, published_at)`: Instant filtering for live public articles.
- `articles(district_id, status)`: Fast query response for the interactive SVG Gujarat map.
- `articles(category_id, status)`: Category listing page optimization.
- `articles(author_id, status)`: Staff journalist dashboard listing.
- `breaking_news(is_active, priority)`: Fast ticker retrieval.
- `activity_logs(created_at)`: Reverse chronological audit logging.
