<?php

namespace App\Models\Concerns;

use Illuminate\Support\Str;

/**
 * Baris baru berkunci string `id` yang belum punya ID diberi ULID huruf kecil. Kelas pemakai
 * menyatakan `$incrementing = false` dan `$keyType = 'string'` (model berkunci angka `nomor`
 * menimpanya).
 */
trait IdString
{
    public static function bootIdString(): void
    {
        static::creating(function ($model) {
            if (! $model->getIncrementing() && $model->getKeyName() === 'id' && blank($model->getKey())) {
                $model->setAttribute('id', Str::lower((string) Str::ulid()));
            }
        });
    }
}
