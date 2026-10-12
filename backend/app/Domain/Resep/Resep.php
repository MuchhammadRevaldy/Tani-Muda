<?php

namespace App\Domain\Resep;

use App\Enums\Peran;
use App\Enums\StatusResep;
use App\Models\Pengguna;
use App\Models\ResepTanam;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

/**
 * Resep tanam yang boleh dilihat dan bentuknya di API (kontrak 2.5, D-12; klien tiruan
 * `resepTerlihat`, `resepTerbaru`).
 */
final class Resep
{
    /**
     * Resep terlihat petani: divalidasi, atau resep contoh bila TAMPILKAN_RESEP_CONTOH menyala.
     *
     * @return Builder<ResepTanam>
     */
    public static function terlihat(): Builder
    {
        return ResepTanam::query()->where(function (Builder $q) {
            $q->where('status', StatusResep::Divalidasi->value);
            if (config('tani_muda.tampilkan_resep_contoh')) {
                $q->orWhere('contoh', true);
            }
        });
    }

    public static function bolehDilihat(ResepTanam $r): bool
    {
        return $r->status === StatusResep::Divalidasi || ($r->contoh && config('tani_muda.tampilkan_resep_contoh'));
    }

    /** Resep boleh dibuka pengguna ini: terlihat, mentor/admin, atau dipakai siklusnya sendiri. */
    public static function bolehDibuka(ResepTanam $r, Pengguna $p): bool
    {
        return self::bolehDilihat($r)
            || in_array($p->peran, [Peran::Mentor, Peran::Admin], true)
            || $p->siklus()->where('resep_id', $r->id)->exists();
    }

    /**
     * Versi terbaru per komoditas + metode.
     *
     * @param  Collection<int, ResepTanam>  $daftar
     * @return Collection<int, ResepTanam>
     */
    public static function terbaru(Collection $daftar): Collection
    {
        return $daftar->groupBy(fn (ResepTanam $r) => "{$r->komoditas_id}|{$r->metode_id}")
            ->map(fn (Collection $kelompok) => $kelompok->sortByDesc('versi')->first())
            ->values();
    }

    /** Resep terlihat terbaru untuk komoditas dan metode ini, atau null. */
    public static function terbaruUntuk(string $komoditasId, string $metodeId): ?ResepTanam
    {
        return self::terlihat()->where('komoditas_id', $komoditasId)->where('metode_id', $metodeId)
            ->orderByDesc('versi')->first();
    }

    /**
     * `ResepTanam` (kontrak 2.5): kolom resep beserta input dan tugas berurutan.
     *
     * @return array<string, mixed>
     */
    public static function bentuk(ResepTanam $r): array
    {
        $r->loadMissing(['input', 'tugas']);
        $data = $r->withoutRelations()->toArray();
        unset($data['dibuat_pada']);
        $anak = fn ($x) => array_diff_key($x->toArray(), array_flip(['nomor', 'resep_id', 'urutan']));
        $data['input'] = $r->input->sortBy('urutan')->map($anak)->values()->all();
        $data['tugas'] = $r->tugas->sortBy('urutan')->map($anak)->values()->all();

        return $data;
    }
}
