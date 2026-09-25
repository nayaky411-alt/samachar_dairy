<?php

namespace App\Console\Commands;

use App\Models\Role;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CreateAdminCommand extends Command
{
    protected $signature = 'app:create-admin {--name= : Admin name} {--email= : Admin email} {--password= : Admin password}';
    protected $description = 'Securely create a Channel Head / Admin user for first login without hardcoded secrets';

    public function handle(): int
    {
        $name = $this->option('name') ?: $this->ask('Enter Admin/Channel Head full name:');
        $email = $this->option('email') ?: $this->ask('Enter Admin email address:');
        $password = $this->option('password') ?: $this->secret('Enter secure password (min 8 characters):');

        if (empty($name) || empty($email) || empty($password)) {
            $this->error('Name, email, and password are required.');
            return Command::FAILURE;
        }

        if (strlen($password) < 8) {
            $this->error('Password must be at least 8 characters long.');
            return Command::FAILURE;
        }

        if (User::where('email', $email)->exists()) {
            $this->error("User with email '{$email}' already exists.");
            return Command::FAILURE;
        }

        $channelHeadRole = Role::firstOrCreate(['name' => 'channel_head'], [
            'display_name' => 'Channel Head / મુખ્ય સંપાદક',
        ]);

        $admin = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'role' => 'channel_head',
            'slug' => Str::slug($name) . '-' . time(),
            'designation' => 'મુખ્ય સંપાદક (Channel Head)',
            'status' => 'active',
        ]);

        $admin->roles()->syncWithoutDetaching([$channelHeadRole->id]);

        $this->info("Channel Head Admin '{$name}' ({$email}) created successfully!");
        return Command::SUCCESS;
    }
}
