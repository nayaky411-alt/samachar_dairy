<?php

use App\Http\Controllers\Api\V1\Admin\AdminCmsController;
use App\Http\Controllers\Api\V1\Admin\AdminContactMessageController;
use App\Http\Controllers\Api\V1\Admin\AdminMarketController;
use App\Http\Controllers\Api\V1\Admin\AdminVideoController;
use App\Http\Controllers\Api\V1\Admin\ApprovalQueueController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\PublicController;
use App\Http\Controllers\Api\V1\Staff\ArticleController as StaffArticleController;
use App\Http\Controllers\Api\V1\Staff\StaffMediaController;
use App\Http\Controllers\Api\V1\Staff\StaffVideoController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // -------------------------------------------------------------
    // Authentication Routes
    // -------------------------------------------------------------
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
    });

    // -------------------------------------------------------------
    // Public Endpoints (Strictly published content only)
    // -------------------------------------------------------------
    Route::get('/homepage', [PublicController::class, 'homepage']);
    Route::get('/news', [PublicController::class, 'news']);
    Route::get('/news/{slug}', [PublicController::class, 'article']);
    Route::get('/breaking-news', [PublicController::class, 'breakingNews']);
    Route::get('/categories', [PublicController::class, 'categories']);
    Route::get('/categories/{slug}', [PublicController::class, 'category']);
    Route::get('/districts', [PublicController::class, 'districts']);
    Route::get('/districts/{slug}/news', [PublicController::class, 'districtNews']);
    Route::get('/cities', [PublicController::class, 'cities']);
    Route::get('/cities/{slug}/news', [PublicController::class, 'cityNews']);
    Route::get('/market', [PublicController::class, 'market']);
    Route::get('/market/indices', [PublicController::class, 'marketIndices']);
    Route::get('/market/gainers', [PublicController::class, 'marketGainers']);
    Route::get('/market/losers', [PublicController::class, 'marketLosers']);
    Route::get('/market/status', [PublicController::class, 'marketStatus']);
    Route::get('/reels', [PublicController::class, 'reels']);
    Route::get('/youtube', [PublicController::class, 'youtube']);

    // Public Local/Uploaded Videos
    Route::get('/videos', [PublicController::class, 'videos']);
    Route::get('/videos/config', [PublicController::class, 'videoConfig']);
    Route::get('/videos/{slug}', [PublicController::class, 'videoDetail']);
    Route::post('/videos/{slug}/view', [PublicController::class, 'trackVideoView']);

    Route::get('/galleries', [PublicController::class, 'galleries']);
    Route::get('/galleries/{slug}', [PublicController::class, 'gallery']);
    Route::get('/author/{slug}', [PublicController::class, 'author']);
    Route::get('/search', [PublicController::class, 'search']);
    Route::get('/settings', [PublicController::class, 'settings']);
    Route::post('/contact', [PublicController::class, 'submitContact']);
    Route::post('/analytics/track', [PublicController::class, 'track']);

    // -------------------------------------------------------------
    // Staff Portal Endpoints (Staff and Channel Head)
    // -------------------------------------------------------------
    Route::middleware(['auth:sanctum', 'role:staff,channel_head'])->prefix('staff')->group(function () {
        Route::get('/articles', [StaffArticleController::class, 'index']);
        Route::post('/articles', [StaffArticleController::class, 'store']);
        Route::get('/articles/{id}', [StaffArticleController::class, 'show']);
        Route::put('/articles/{id}', [StaffArticleController::class, 'update']);
        Route::delete('/articles/{id}', [StaffArticleController::class, 'destroy']);
        Route::post('/articles/{id}/submit', [StaffArticleController::class, 'submit']);

        // Uploaded Video Management
        Route::get('/videos', [StaffVideoController::class, 'index']);
        Route::post('/videos', [StaffVideoController::class, 'store']);
        Route::get('/videos/{id}', [StaffVideoController::class, 'show']);
        Route::post('/videos/{id}', [StaffVideoController::class, 'update']);
        Route::put('/videos/{id}', [StaffVideoController::class, 'update']);
        Route::delete('/videos/{id}', [StaffVideoController::class, 'destroy']);
        Route::post('/videos/{id}/submit', [StaffVideoController::class, 'submit']);

        Route::post('/media/upload', [StaffMediaController::class, 'upload']);
        Route::post('/reels', [StaffMediaController::class, 'submitReel']);
        Route::post('/youtube', [StaffMediaController::class, 'submitVideo']);
        Route::post('/galleries', [StaffMediaController::class, 'submitGallery']);
    });

    // -------------------------------------------------------------
    // Channel Head Admin Endpoints (Channel Head ONLY)
    // -------------------------------------------------------------
    Route::middleware(['auth:sanctum', 'role:channel_head'])->prefix('admin')->group(function () {
        // Dashboard
        Route::get('/dashboard', [AdminCmsController::class, 'dashboard']);
        Route::get('/articles', [AdminCmsController::class, 'articles']);

        // Approval Queue & Editorial Workflow
        Route::get('/approval-queue', [ApprovalQueueController::class, 'index']);
        Route::get('/approval-queue/{id}', [ApprovalQueueController::class, 'show']);
        Route::post('/articles/{id}/approve', [ApprovalQueueController::class, 'approve']);
        Route::post('/articles/{id}/reject', [ApprovalQueueController::class, 'reject']);
        Route::post('/articles/{id}/publish', [ApprovalQueueController::class, 'publish']);
        Route::post('/articles/{id}/schedule', [ApprovalQueueController::class, 'schedule']);
        Route::post('/articles/{id}/unpublish', [ApprovalQueueController::class, 'unpublish']);
        Route::post('/articles/{id}/archive', [ApprovalQueueController::class, 'archive']);

        // Uploaded Video Approvals & Management
        Route::get('/uploaded-videos/pending', [AdminVideoController::class, 'pending']);
        Route::get('/uploaded-videos/all', [AdminVideoController::class, 'index']);
        Route::get('/uploaded-videos/{id}', [AdminVideoController::class, 'show']);
        Route::post('/uploaded-videos/{id}/approve', [AdminVideoController::class, 'approve']);
        Route::post('/uploaded-videos/{id}/reject', [AdminVideoController::class, 'reject']);
        Route::post('/uploaded-videos/{id}/publish', [AdminVideoController::class, 'publish']);
        Route::post('/uploaded-videos/{id}/archive', [AdminVideoController::class, 'archive']);
        Route::delete('/uploaded-videos/{id}', [AdminVideoController::class, 'destroy']);

        // Other Content Approvals
        Route::post('/reels/{id}/approve', [ApprovalQueueController::class, 'approveReel']);
        Route::post('/reels/{id}/reject', [ApprovalQueueController::class, 'rejectReel']);
        Route::post('/videos/{id}/approve', [ApprovalQueueController::class, 'approveVideo']);
        Route::post('/videos/{id}/reject', [ApprovalQueueController::class, 'rejectVideo']);
        Route::post('/galleries/{id}/approve', [ApprovalQueueController::class, 'approveGallery']);
        Route::post('/galleries/{id}/reject', [ApprovalQueueController::class, 'rejectGallery']);

        // Breaking News
        Route::get('/breaking-news', [AdminCmsController::class, 'breakingNews']);
        Route::post('/breaking-news', [AdminCmsController::class, 'storeBreakingNews']);
        Route::put('/breaking-news/{id}', [AdminCmsController::class, 'updateBreakingNews']);
        Route::delete('/breaking-news/{id}', [AdminCmsController::class, 'deleteBreakingNews']);

        // Categories
        Route::get('/categories', [AdminCmsController::class, 'categories']);
        Route::post('/categories', [AdminCmsController::class, 'storeCategory']);
        Route::put('/categories/{id}', [AdminCmsController::class, 'updateCategory']);
        Route::delete('/categories/{id}', [AdminCmsController::class, 'deleteCategory']);

        // Homepage Layout Manager
        Route::get('/homepage/sections', [AdminCmsController::class, 'homepageSections']);
        Route::put('/homepage/sections/order', [AdminCmsController::class, 'updateHomepageOrder']);

        // Advertisements
        Route::get('/advertisements', [AdminCmsController::class, 'advertisements']);
        Route::post('/advertisements', [AdminCmsController::class, 'storeAdvertisement']);
        Route::put('/advertisements/{id}', [AdminCmsController::class, 'updateAdvertisement']);
        Route::delete('/advertisements/{id}', [AdminCmsController::class, 'deleteAdvertisement']);

        // Users & Staff
        Route::get('/users', [AdminCmsController::class, 'users']);
        Route::post('/users', [AdminCmsController::class, 'storeUser']);
        Route::patch('/users/{id}/toggle-status', [AdminCmsController::class, 'toggleUserStatus']);

        // Analytics & Audit
        Route::get('/analytics', [AdminCmsController::class, 'analytics']);
        Route::get('/activity-logs', [AdminCmsController::class, 'activityLogs']);

        // Market Settings & Symbols Management
        Route::get('/market/settings', [AdminMarketController::class, 'settings']);
        Route::post('/market/settings', [AdminMarketController::class, 'updateSettings']);
        Route::get('/market/symbols', [AdminMarketController::class, 'symbols']);
        Route::post('/market/symbols', [AdminMarketController::class, 'storeSymbol']);
        Route::put('/market/symbols/{id}', [AdminMarketController::class, 'updateSymbol']);
        Route::patch('/market/symbols/{id}/toggle', [AdminMarketController::class, 'toggleSymbol']);
        Route::delete('/market/symbols/{id}', [AdminMarketController::class, 'destroySymbol']);
        Route::post('/market/refresh', [AdminMarketController::class, 'refreshFeed']);

        // Contact Messages Inbox & Management
        Route::get('/contact-messages', [AdminContactMessageController::class, 'index']);
        Route::get('/contact-messages/stats', [AdminContactMessageController::class, 'stats']);
        Route::get('/contact-messages/{id}', [AdminContactMessageController::class, 'show']);
        Route::patch('/contact-messages/{id}/status', [AdminContactMessageController::class, 'updateStatus']);
        Route::delete('/contact-messages/{id}', [AdminContactMessageController::class, 'destroy']);

        // Settings
        Route::get('/settings', [AdminCmsController::class, 'settings']);
        Route::post('/settings', [AdminCmsController::class, 'updateSettings']);
    });
});
