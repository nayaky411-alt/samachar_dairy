<?php

namespace App\Policies;

use App\Models\Article;
use App\Models\User;

class ArticlePolicy
{
    public function view(User $user, Article $article): bool
    {
        if ($user->isChannelHead()) {
            return true;
        }

        if ($article->author_id === $user->id) {
            return true;
        }

        return $article->status === 'published';
    }

    public function create(User $user): bool
    {
        return $user->isStaff() || $user->isChannelHead();
    }

    public function update(User $user, Article $article): bool
    {
        if ($user->isChannelHead()) {
            return true;
        }

        return $article->author_id === $user->id && in_array($article->status, ['draft', 'rejected']);
    }

    public function submit(User $user, Article $article): bool
    {
        if ($user->isChannelHead()) {
            return true;
        }

        return $article->author_id === $user->id && in_array($article->status, ['draft', 'rejected']);
    }

    public function approve(User $user, Article $article): bool
    {
        return $user->isChannelHead();
    }

    public function reject(User $user, Article $article): bool
    {
        return $user->isChannelHead();
    }

    public function publish(User $user, Article $article): bool
    {
        return $user->isChannelHead();
    }

    public function schedule(User $user, Article $article): bool
    {
        return $user->isChannelHead();
    }

    public function delete(User $user, Article $article): bool
    {
        if ($user->isChannelHead()) {
            return true;
        }

        return $article->author_id === $user->id && $article->status === 'draft';
    }
}
