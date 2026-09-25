<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $channelHeadRole = Role::firstOrCreate(['name' => 'channel_head'], [
            'display_name' => 'Channel Head / મુખ્ય સંપાદક',
            'description' => 'Full control over editorial approval, publishing, CMS and settings',
        ]);

        $staffRole = Role::firstOrCreate(['name' => 'staff'], [
            'display_name' => 'Staff Reporter / પત્રકાર',
            'description' => 'Can create drafts, upload media, and submit articles for review',
        ]);

        $permissions = [
            // Article permissions
            ['name' => 'articles.create', 'display_name' => 'Create Drafts', 'module' => 'articles'],
            ['name' => 'articles.edit_own', 'display_name' => 'Edit Own Drafts', 'module' => 'articles'],
            ['name' => 'articles.submit', 'display_name' => 'Submit For Approval', 'module' => 'articles'],
            ['name' => 'articles.approve', 'display_name' => 'Approve Articles', 'module' => 'articles'],
            ['name' => 'articles.reject', 'display_name' => 'Reject Articles', 'module' => 'articles'],
            ['name' => 'articles.publish', 'display_name' => 'Publish Articles', 'module' => 'articles'],
            ['name' => 'articles.schedule', 'display_name' => 'Schedule Articles', 'module' => 'articles'],
            ['name' => 'articles.delete', 'display_name' => 'Delete Articles', 'module' => 'articles'],
            
            // Other modules
            ['name' => 'breaking.manage', 'display_name' => 'Manage Breaking News', 'module' => 'breaking'],
            ['name' => 'categories.manage', 'display_name' => 'Manage Categories', 'module' => 'categories'],
            ['name' => 'cities.manage', 'display_name' => 'Manage Cities & Map', 'module' => 'geography'],
            ['name' => 'homepage.manage', 'display_name' => 'Manage Homepage CMS', 'module' => 'homepage'],
            ['name' => 'ads.manage', 'display_name' => 'Manage Advertisements', 'module' => 'ads'],
            ['name' => 'analytics.view', 'display_name' => 'View Full Analytics', 'module' => 'analytics'],
            ['name' => 'settings.manage', 'display_name' => 'Manage Settings', 'module' => 'settings'],
            ['name' => 'users.manage', 'display_name' => 'Manage Users & Staff', 'module' => 'users'],
        ];

        foreach ($permissions as $p) {
            Permission::firstOrCreate(['name' => $p['name']], $p);
        }

        // Channel head gets all permissions
        $allPermissions = Permission::all();
        $channelHeadRole->permissions()->sync($allPermissions->pluck('id'));

        // Staff gets creation and submission permissions
        $staffPermissions = Permission::whereIn('name', [
            'articles.create',
            'articles.edit_own',
            'articles.submit',
        ])->get();
        $staffRole->permissions()->sync($staffPermissions->pluck('id'));
    }
}
