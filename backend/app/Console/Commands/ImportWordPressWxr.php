<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Models\Category;
use App\Models\Media;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use XMLReader;

class ImportWordPressWxr extends Command
{
    protected $signature = 'app:import-wordpress-wxr 
                            {file=migration/wordpress-export.xml.xml : Path to WordPress XML file} 
                            {--dry-run : Dry run without modifying the database} 
                            {--limit= : Limit the number of posts to process} 
                            {--update-existing : Update existing posts if already imported} 
                            {--skip-media : Skip downloading media attachments}';

    protected $description = 'Import WordPress WXR content safely into existing Laravel model structure';

    private array $categoryCache = [];
    private array $tagCache = [];
    private array $authorCache = [];
    private array $attachmentMap = []; // wp_post_id -> attachment_url / local_url

    public function handle(): int
    {
        $inputPath = $this->argument('file');
        
        $possiblePaths = [
            $inputPath,
            base_path($inputPath),
            base_path('../' . $inputPath),
            base_path('../migration/wordpress-export.xml.xml'),
            base_path('../migration/wordpress-export.xml'),
            base_path('migration/wordpress-export.xml.xml'),
            base_path('migration/wordpress-export.xml'),
        ];

        $filePath = null;
        foreach ($possiblePaths as $p) {
            if (file_exists($p)) {
                $filePath = realpath($p);
                break;
            }
        }

        if (!$filePath) {
            $this->error("WordPress export file not found. Tried paths:\n - " . implode("\n - ", $possiblePaths));
            return self::FAILURE;
        }

        $isDryRun = $this->option('dry-run');
        $limit = $this->option('limit') ? (int) $this->option('limit') : null;
        $updateExisting = $this->option('update-existing');
        $skipMedia = $this->option('skip-media');

        $this->info("==================================================");
        $this->info("      WORDPRESS WXR STREAMING IMPORTER            ");
        $this->info("==================================================");
        $this->info("File: {$filePath}");
        $this->info("Mode: " . ($isDryRun ? "DRY RUN (No Database Writes)" : "LIVE MIGRATION"));
        if ($limit) $this->info("Limit: {$limit} posts");
        $this->info("==================================================");

        $stats = [
            'authors_found' => 0,
            'authors_created' => 0,
            'categories_found' => 0,
            'categories_created' => 0,
            'tags_found' => 0,
            'tags_created' => 0,
            'attachments_found' => 0,
            'attachments_migrated' => 0,
            'attachments_failed' => 0,
            'posts_found' => 0,
            'posts_imported' => 0,
            'posts_updated' => 0,
            'posts_skipped' => 0,
            'pages_found' => 0,
            'pages_imported' => 0,
        ];

        // Ensure storage directory exists
        if (!$isDryRun && !$skipMedia) {
            Storage::disk('public')->makeDirectory('news');
            Storage::disk('public')->makeDirectory('images');
        }

        // STEP 1: Pre-pass for Categories, Tags, Authors, and Attachment mappings
        $this->info("\n[1/3] Parsing taxonomies, authors, and attachment maps...");
        $this->parseTaxonomiesAndMedia($filePath, $isDryRun, $skipMedia, $stats);

        // STEP 2: Main streaming pass for Posts & Pages
        $this->info("\n[2/3] Processing Posts and Pages...");
        $this->parsePostsAndPages($filePath, $isDryRun, $skipMedia, $updateExisting, $limit, $stats);

        // STEP 3: Summary Report
        $this->info("\n==================================================");
        $this->info("             MIGRATION SUMMARY                    ");
        $this->info("==================================================");
        $this->table(
            ['Metric', 'Count'],
            [
                ['Dry Run Mode', $isDryRun ? 'YES (0 DB changes)' : 'NO (Live DB Updated)'],
                ['Authors Found / Created', "{$stats['authors_found']} / {$stats['authors_created']}"],
                ['Categories Found / Created', "{$stats['categories_found']} / {$stats['categories_created']}"],
                ['Tags Found / Created', "{$stats['tags_found']} / {$stats['tags_created']}"],
                ['Media Attachments Found', $stats['attachments_found']],
                ['Media Migrated / Failed', "{$stats['attachments_migrated']} / {$stats['attachments_failed']}"],
                ['Total Posts Found', $stats['posts_found']],
                ['Posts Imported', $stats['posts_imported']],
                ['Posts Updated', $stats['posts_updated']],
                ['Posts Skipped (Duplicates)', $stats['posts_skipped']],
                ['Pages Found', $stats['pages_found']],
            ]
        );

        $this->info("\nMigration process completed successfully.");
        return self::SUCCESS;
    }

    private function parseTaxonomiesAndMedia(string $filePath, bool $isDryRun, bool $skipMedia, array &$stats): void
    {
        $reader = new XMLReader();
        if (!$reader->open($filePath)) {
            $this->error("Failed to open XML reader.");
            return;
        }

        while ($reader->read()) {
            if ($reader->nodeType === XMLReader::ELEMENT) {
                $name = $reader->name;

                if ($name === 'wp:author') {
                    $stats['authors_found']++;
                    $node = simplexml_load_string($reader->readOuterXml());
                    if ($node) {
                        $this->processAuthorNode($node, $isDryRun, $stats);
                    }
                } elseif ($name === 'wp:category') {
                    $stats['categories_found']++;
                    $node = simplexml_load_string($reader->readOuterXml());
                    if ($node) {
                        $this->processCategoryNode($node, $isDryRun, $stats);
                    }
                } elseif ($name === 'wp:tag') {
                    $stats['tags_found']++;
                    $node = simplexml_load_string($reader->readOuterXml());
                    if ($node) {
                        $this->processTagNode($node, $isDryRun, $stats);
                    }
                } elseif ($name === 'item') {
                    $node = simplexml_load_string($reader->readOuterXml());
                    if ($node) {
                        $wpNs = $node->children('http://wordpress.org/export/1.2/');
                        $postType = (string) $wpNs->post_type;
                        $postId = (int) $wpNs->post_id;

                        if ($postType === 'attachment') {
                            $stats['attachments_found']++;
                            $attachmentUrl = (string) $wpNs->attachment_url;
                            
                            if ($postId && $attachmentUrl) {
                                $this->attachmentMap[$postId] = [
                                    'url' => $attachmentUrl,
                                    'node' => $node,
                                ];
                            }
                        }
                    }
                }
            }
        }
        $reader->close();
    }

    private function parsePostsAndPages(string $filePath, bool $isDryRun, bool $skipMedia, bool $updateExisting, ?int $limit, array &$stats): void
    {
        $reader = new XMLReader();
        if (!$reader->open($filePath)) {
            $this->error("Failed to open XML reader for posts pass.");
            return;
        }

        // Default category fallback if post has no category
        $defaultCategory = Category::first();
        $defaultCategory_id = $defaultCategory ? $defaultCategory->id : 1;

        // Default author fallback
        $defaultUser = User::where('role', 'channel_head')->first() ?? User::first();
        $defaultAuthorId = $defaultUser ? $defaultUser->id : 1;

        $processedCount = 0;

        while ($reader->read()) {
            if ($reader->nodeType === XMLReader::ELEMENT && $reader->name === 'item') {
                $nodeStr = $reader->readOuterXml();
                $node = simplexml_load_string($nodeStr);
                if (!$node) continue;

                $wpNs = $node->children('http://wordpress.org/export/1.2/');
                $contentNs = $node->children('http://purl.org/rss/1.0/modules/content/');
                $dcNs = $node->children('http://purl.org/dc/elements/1.1/');
                $excerptNs = $node->children('http://wordpress.org/export/1.2/excerpt/');

                $postType = (string) $wpNs->post_type;
                $status = (string) $wpNs->status;

                if ($postType === 'page') {
                    $stats['pages_found']++;
                    continue;
                }

                if ($postType !== 'post') {
                    continue;
                }

                $stats['posts_found']++;

                if ($limit && $processedCount >= $limit) {
                    $this->info("Reached limit of {$limit} posts.");
                    break;
                }

                $processedCount++;

                $wpPostId = (int) $wpNs->post_id;
                $title = trim((string) $node->title);
                if (empty($title)) {
                    $title = "WordPress Post #{$wpPostId}";
                }

                $rawSlug = (string) $wpNs->post_name;
                $slug = !empty($rawSlug) ? Str::slug($rawSlug) : Str::slug($title);
                if (empty($slug)) {
                    $slug = "post-{$wpPostId}";
                }

                // Check for duplicate
                $existingArticle = Article::where('wordpress_post_id', $wpPostId)
                    ->orWhere('slug', $slug)
                    ->first();

                if ($existingArticle && !$updateExisting) {
                    $stats['posts_skipped']++;
                    continue;
                }

                $rawContent = (string) $contentNs->encoded;
                $cleanedContent = $this->cleanHtmlContent($rawContent);
                $excerpt = trim((string) $excerptNs->encoded);
                if (empty($excerpt)) {
                    $excerpt = Str::limit(strip_tags($cleanedContent), 200);
                }

                $pubDateRaw = (string) $wpNs->post_date_gmt;
                if (empty($pubDateRaw) || $pubDateRaw === '0000-00-00 00:00:00') {
                    $pubDateRaw = (string) $wpNs->post_date;
                }
                $pubDate = (!empty($pubDateRaw) && $pubDateRaw !== '0000-00-00 00:00:00') ? $pubDateRaw : now();

                // Determine Author
                $creator = trim((string) $dcNs->creator);
                $authorId = $defaultAuthorId;
                if ($creator && isset($this->authorCache[$creator])) {
                    $authorId = $this->authorCache[$creator];
                }

                // Determine Category & Tags
                $categoryId = $defaultCategory_id;
                $tagIds = [];

                foreach ($node->category as $catElem) {
                    $domain = (string) $catElem['domain'];
                    $nicename = (string) $catElem['nicename'];
                    $nameVal = (string) $catElem;

                    if ($domain === 'category') {
                        if (isset($this->categoryCache[$nicename])) {
                            $categoryId = $this->categoryCache[$nicename];
                        }
                    } elseif ($domain === 'post_tag') {
                        if (isset($this->tagCache[$nicename])) {
                            $tagIds[] = $this->tagCache[$nicename];
                        }
                    }
                }

                // Determine Featured Image
                $featuredImage = null;
                foreach ($wpNs->postmeta as $meta) {
                    if ((string) $meta->meta_key === '_thumbnail_id') {
                        $thumbId = (int) $meta->meta_value;
                        if (isset($this->attachmentMap[$thumbId])) {
                            $attData = $this->attachmentMap[$thumbId];
                            $rawAttUrl = is_array($attData) ? $attData['url'] : $attData;
                            
                            if (!$isDryRun && !$skipMedia && is_array($attData)) {
                                $featuredImage = $this->downloadAndSaveMedia($thumbId, $rawAttUrl, $attData['node'], $stats);
                                // Cache downloaded result back to attachmentMap so subsequent posts reuse local URL
                                $this->attachmentMap[$thumbId] = $featuredImage;
                            } else {
                                $featuredImage = $rawAttUrl;
                            }
                        }
                        break;
                    }
                }

                // If no featured image from postmeta, grab first img src from content
                if (!$featuredImage && preg_match('/<img[^>]+src=["\']([^"\']+)["\']/', $cleanedContent, $m)) {
                    $featuredImage = $m[1];
                }

                $originalUrl = (string) $node->link;

                if ($isDryRun) {
                    if ($existingArticle) {
                        $stats['posts_updated']++;
                    } else {
                        $stats['posts_imported']++;
                    }
                    continue;
                }

                // Perform Database Save
                DB::beginTransaction();
                try {
                    $articleData = [
                        'title' => $title,
                        'slug' => $slug,
                        'short_description' => $excerpt,
                        'content' => $cleanedContent,
                        'category_id' => $categoryId,
                        'author_id' => $authorId,
                        'status' => ($status === 'publish') ? 'published' : 'draft',
                        'approval_status' => 'approved',
                        'published_at' => $pubDate,
                        'created_at' => $pubDate,
                        'updated_at' => now(),
                        'featured_image' => $featuredImage,
                        'wordpress_post_id' => $wpPostId,
                        'import_source' => 'wordpress',
                        'is_imported' => true,
                        'original_url' => $originalUrl,
                    ];

                    if ($existingArticle) {
                        $existingArticle->update($articleData);
                        $article = $existingArticle;
                        $stats['posts_updated']++;
                    } else {
                        $article = Article::create($articleData);
                        $stats['posts_imported']++;
                    }

                    if (!empty($tagIds)) {
                        $article->tags()->syncWithoutDetaching($tagIds);
                    }

                    DB::commit();
                } catch (\Exception $e) {
                    DB::rollBack();
                    $this->error("Failed to import post #{$wpPostId}: " . $e->getMessage());
                }
            }
        }

        $reader->close();
    }

    private function processAuthorNode(\SimpleXMLElement $node, bool $isDryRun, array &$stats): void
    {
        $wpNs = $node->children('http://wordpress.org/export/1.2/');
        $login = trim((string) $wpNs->author_login);
        $email = trim((string) $wpNs->author_email);
        $displayName = trim((string) $wpNs->author_display_name);

        if (empty($login)) return;

        if (empty($email)) {
            $email = Str::slug($login) . '@samachardairy247.com';
        }

        if (empty($displayName)) {
            $displayName = $login;
        }

        $user = User::where('email', $email)->orWhere('slug', Str::slug($login))->first();

        if ($user) {
            $this->authorCache[$login] = $user->id;
            return;
        }

        if ($isDryRun) {
            $stats['authors_created']++;
            $this->authorCache[$login] = 999;
            return;
        }

        $newUser = User::create([
            'name' => $displayName,
            'email' => $email,
            'password' => bcrypt(Str::random(16)),
            'role' => 'staff',
            'slug' => Str::slug($login),
            'designation' => 'વરિષ્ઠ પત્રકાર',
            'status' => 'active',
            'import_source' => 'wordpress',
            'is_imported' => true,
        ]);

        $stats['authors_created']++;
        $this->authorCache[$login] = $newUser->id;
    }

    private function processCategoryNode(\SimpleXMLElement $node, bool $isDryRun, array &$stats): void
    {
        $wpNs = $node->children('http://wordpress.org/export/1.2/');
        $termId = (int) $wpNs->term_id;
        $slug = (string) $wpNs->category_nicename;
        $name = (string) $wpNs->cat_name;

        if (empty($slug)) return;

        $category = Category::where('slug', $slug)->orWhere('wordpress_term_id', $termId)->first();

        if ($category) {
            $this->categoryCache[$slug] = $category->id;
            return;
        }

        if ($isDryRun) {
            $stats['categories_created']++;
            $this->categoryCache[$slug] = 999;
            return;
        }

        $newCat = Category::create([
            'name' => $name,
            'name_gu' => $name,
            'slug' => $slug,
            'is_active' => true,
            'show_in_menu' => true,
            'wordpress_term_id' => $termId,
            'import_source' => 'wordpress',
            'is_imported' => true,
        ]);

        $stats['categories_created']++;
        $this->categoryCache[$slug] = $newCat->id;
    }

    private function processTagNode(\SimpleXMLElement $node, bool $isDryRun, array &$stats): void
    {
        $wpNs = $node->children('http://wordpress.org/export/1.2/');
        $termId = (int) $wpNs->term_id;
        $slug = (string) $wpNs->tag_slug;
        $name = (string) $wpNs->tag_name;

        if (empty($slug)) return;

        $tag = Tag::where('slug', $slug)->orWhere('wordpress_term_id', $termId)->first();

        if ($tag) {
            $this->tagCache[$slug] = $tag->id;
            return;
        }

        if ($isDryRun) {
            $stats['tags_created']++;
            $this->tagCache[$slug] = 999;
            return;
        }

        $newTag = Tag::create([
            'name' => $name,
            'name_gu' => $name,
            'slug' => $slug,
            'wordpress_term_id' => $termId,
            'import_source' => 'wordpress',
            'is_imported' => true,
        ]);

        $stats['tags_created']++;
        $this->tagCache[$slug] = $newTag->id;
    }

    private function downloadAndSaveMedia(int $attachmentId, string $url, \SimpleXMLElement $node, array &$stats): string
    {
        try {
            $pathInfo = pathinfo(parse_url($url, PHP_URL_PATH));
            $extension = isset($pathInfo['extension']) ? strtolower($pathInfo['extension']) : 'jpg';
            if (!in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'])) {
                $extension = 'jpg';
            }

            $filename = "wp_{$attachmentId}_" . Str::slug($pathInfo['filename'] ?? "media_{$attachmentId}") . ".{$extension}";
            $relativePath = "news/{$filename}";
            $storagePath = storage_path("app/public/{$relativePath}");

            // Check if already downloaded locally
            if (file_exists($storagePath)) {
                $stats['attachments_migrated']++;
                return "/storage/{$relativePath}";
            }

            // Download file with 3s timeout
            $response = Http::timeout(3)->get($url);

            if ($response->successful()) {
                Storage::disk('public')->put($relativePath, $response->body());

                Media::create([
                    'filename' => $filename,
                    'original_name' => $pathInfo['basename'] ?? $filename,
                    'disk' => 'public',
                    'path' => $relativePath,
                    'url' => "/storage/{$relativePath}",
                    'mime_type' => $response->header('Content-Type') ?? "image/{$extension}",
                    'type' => 'image',
                    'size' => strlen($response->body()),
                    'wordpress_attachment_id' => $attachmentId,
                    'original_url' => $url,
                    'import_source' => 'wordpress',
                    'is_imported' => true,
                ]);

                $stats['attachments_migrated']++;
                return "/storage/{$relativePath}";
            }
        } catch (\Exception $e) {
            // Log warning but return original URL to ensure article content doesn't break
        }

        $stats['attachments_failed']++;
        return $url;
    }

    private function cleanHtmlContent(string $content): string
    {
        if (empty($content)) return '';

        // 1. Remove WordPress shortcodes like [caption]...[/caption]
        $content = preg_replace_callback('/\[caption[^\]]*\](.*?)\[\/caption\]/is', function ($matches) {
            return $matches[1];
        }, $content);
        $content = preg_replace('/\[[^\]]+\]/', '', $content); // Strip other remaining shortcodes

        // 2. Remove script and style tags
        $content = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $content);
        $content = preg_replace('/<style\b[^>]*>(.*?)<\/style>/is', '', $content);

        // 3. Remove Elementor classes or convert Elementor wrappers
        // Replace Elementor wrapper divs with clean divs or paragraphs
        $content = preg_replace('/<div[^>]*class=["\'][^"\']*elementor[^"\']*["\'][^>]*>/i', '<div>', $content);

        // 4. Strip unsafe attributes (onload, onerror, style attributes with background-image, etc.)
        $content = preg_replace('/\s+style=["\'][^"\']*["\']/i', '', $content);
        $content = preg_replace('/\s+on[a-z]+=["\'][^"\']*["\']/i', '', $content);

        // 5. Trim leading/trailing space & multiple empty lines
        $content = preg_replace('/(<br\s*\/?>\s*){3,}/i', '<br/><br/>', $content);
        $content = preg_replace('/(<p>\s*<\/p>\s*)+/i', '', $content);

        return trim($content);
    }
}
