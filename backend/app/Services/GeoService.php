<?php

namespace App\Services;

use App\Models\Article;
use App\Models\District;

class GeoService
{
    public function getDistrictsWithCounts(): array
    {
        return District::active()
            ->withCount(['articles' => function ($q) {
                $q->published();
            }])
            ->orderBy('name')
            ->get()
            ->map(function ($d) {
                return [
                    'id' => $d->id,
                    'name' => $d->name,
                    'name_gu' => $d->name_gu,
                    'slug' => $d->slug,
                    'code' => $d->code,
                    'headquarters' => $d->headquarters,
                    'svg_path_id' => $d->svg_path_id,
                    'articles_count' => $d->articles_count,
                ];
            })
            ->toArray();
    }

    public function getDistrictNews(string $slug, int $limit = 10)
    {
        $district = District::where('slug', $slug)->firstOrFail();

        $news = Article::published()
            ->where('district_id', $district->id)
            ->with(['category', 'city', 'author'])
            ->orderByDesc('published_at')
            ->paginate($limit);

        return [
            'district' => [
                'id' => $district->id,
                'name' => $district->name,
                'name_gu' => $district->name_gu,
                'slug' => $district->slug,
                'headquarters' => $district->headquarters,
                'code' => $district->code,
            ],
            'news' => $news,
        ];
    }
}
