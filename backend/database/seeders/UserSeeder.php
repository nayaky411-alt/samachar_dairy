<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $channelHeadRole = Role::where('name', 'channel_head')->first();
        $staffRole = Role::where('name', 'staff')->first();

        $adminEmail = env('ADMIN_EMAIL', 'samachardiaryx7@gmail.com');
        $adminPassword = env('ADMIN_PASSWORD');

        // 1. Channel Head / Editor-in-Chief (Admin Account)
        $channelHead = User::where('email', $adminEmail)
            ->orWhere('role', 'channel_head')
            ->first();

        if ($channelHead) {
            $channelHead->email = $adminEmail;
            $channelHead->role = 'channel_head';
            $channelHead->status = 'active';
            if ($adminPassword) {
                $channelHead->password = Hash::make($adminPassword);
            }
            $channelHead->save();
        } else {
            $channelHead = User::create([
                'name' => 'મુખ્ય સંપાદક - Channel Head',
                'email' => $adminEmail,
                'password' => $adminPassword ? Hash::make($adminPassword) : Hash::make(\Illuminate\Support\Str::random(32)),
                'role' => 'channel_head',
                'slug' => 'channel-head-editor',
                'designation' => 'મુખ્ય સંપાદક (Editor-in-Chief)',
                'bio' => 'સમાચાર ડેરી ૨૪x૭ ના મુખ્ય સંપાદક',
                'status' => 'active',
            ]);
        }

        if ($channelHeadRole) {
            $channelHead->roles()->syncWithoutDetaching([$channelHeadRole->id]);
        }
    }
}
