<?php

namespace App\Domain\Kebun;

use App\Domain\Hitung\Angka;
use App\Domain\Hitung\Hasil;
use App\Domain\Hitung\KapasitasLahan;
use App\Domain\Hitung\Kebun;
use App\Domain\Resep\Resep;
use App\Models\AlokasiPesanan;
use App\Models\KonversiSatuan;
use App\Models\Lahan;
use App\Models\Pengguna;
use App\Models\ProfilPembeli;
use App\Models\ResepTanam;
use App\Models\SiklusTanam;
use App\Models\Tugas;
use App\Support\HariIni;
use Illuminate\Support\Facades\DB;

/**
 * Lahan dan siklus seperti dikirim API, kapasitas, dan tugas (klien tiruan fitur/kebun.ts dan
 * fitur/bantu.ts; kontrak 2.6, 3.4, 3.5; D-15, D-34, D-40).
 */
final class LayananKebun
{
    /** @return array<string, mixed> lahan untuk rumus kapasitas */
    public static function lahanDomain(Lahan $l): array
    {
        return ['id' => $l->id, 'jenisLahan' => $l->jenis_lahan->value, 'luasM2' => $l->luas_m2, 'kapasitasLubang' => $l->kapasitas_lubang];
    }

    /**
     * Siklus untuk rumus kapasitas, dengan perkiraan tanggal panen dari umur panen resep.
     *
     * @return array<string, mixed>
     */
    public static function siklusDomain(SiklusTanam $s): array
    {
        $tanam = $s->tanggal_tanam?->toDateString();
        $umur = ResepTanam::whereKey($s->resep_id)->value('umur_panen_hari') ?? 0;

        return [
            'id' => $s->id,
            'lahanId' => $s->lahan_id,
            'status' => $s->status->value,
            'luasM2' => $s->luas_m2,
            'jumlahLubang' => $s->jumlah_lubang,
            'alokasiPesananId' => $s->alokasi_pesanan_id,
            'petakKe' => $s->petak_ke,
            'tanggalTanam' => $tanam,
            'tanggalPanen' => $tanam ? Angka::tambahHari($tanam, (int) $umur) : null,
        ];
    }

    /**
     * Siklus lain di lahan yang sama, untuk rumus kapasitas.
     *
     * @param  list<string>  $kecuali
     * @return list<array<string, mixed>>
     */
    public static function siklusLahan(string $lahanId, array $kecuali = []): array
    {
        return SiklusTanam::where('lahan_id', $lahanId)->whereNotIn('id', $kecuali)->get()
            ->map(self::siklusDomain(...))->values()->all();
    }

    /** @return array{satuan: string, total: int|float, dipakai: float, sisa: float} */
    public static function kapasitas(Lahan $l): array
    {
        return KapasitasLahan::kapasitasLahan(self::lahanDomain($l), self::siklusLahan($l->id));
    }

    /** @return array<string, mixed> `Lahan` dengan kapasitas tersisa */
    public static function bentukLahan(Lahan $l): array
    {
        $data = $l->toArray();
        unset($data['dibuat_pada']);

        return $data + ['kapasitas' => self::kapasitas($l)];
    }

    /** @return array<string, int|float> konversi ru/bata wilayah */
    public static function konversiWilayah(?string $wilayahId): array
    {
        return KonversiSatuan::where('wilayah_id', $wilayahId)->get()
            ->mapWithKeys(fn ($k) => [$k->satuan->value => $k->nilai_m2])->all();
    }

    /** Nama pengguna untuk ditampilkan: nama usaha pembeli, atau nama orangnya. */
    public static function namaPengguna(string $id): string
    {
        return ProfilPembeli::whereKey($id)->value('nama_usaha') ?? Pengguna::whereKey($id)->value('nama') ?? '';
    }

    /** @return array<string, mixed>|null kelompok pesanan siklus (D-40) */
    public static function kelompokPesanan(SiklusTanam $s): ?array
    {
        $a = $s->alokasi_pesanan_id ? AlokasiPesanan::with('pesanan')->find($s->alokasi_pesanan_id) : null;
        $p = $a?->pesanan;
        if ($a === null || $p === null) {
            return null;
        }

        return [
            'alokasi_id' => $a->id,
            'pesanan_id' => $p->id,
            'nama_pembeli' => self::namaPengguna($p->pembeli_id),
            'jumlah_petak' => SiklusTanam::where('alokasi_pesanan_id', $a->id)->count(),
            'status_alokasi' => $a->status->value,
            'tanggal_kirim' => $s->petak_ke !== null && $p->tanggal_mulai && $p->frekuensi_hari
                ? Angka::tambahHari($p->tanggal_mulai->toDateString(), ($s->petak_ke - 1) * $p->frekuensi_hari)
                : null,
        ];
    }

    /** @return array<string, mixed> `SiklusTanam` dengan kolom yang dihitung server */
    public static function bentukSiklus(SiklusTanam $s): array
    {
        $data = $s->withoutRelations()->toArray();
        unset($data['urutan']);

        return $data + [
            'resep_contoh' => (bool) ResepTanam::whereKey($s->resep_id)->value('contoh'),
            'kelompok_pesanan' => self::kelompokPesanan($s),
        ];
    }

    /** @return array<string, mixed> `SiklusDetail`: rencana item, modal, hari ke, perkiraan panen */
    public static function detail(SiklusTanam $s, Pengguna $p): array
    {
        $rencana = $s->rencanaItem()->orderBy('urutan')->orderBy('id')->get();
        $pembagian = max(1, ...$rencana->where('alat_sekali_beli', true)->pluck('jumlah_siklus_pembagian')->all() ?: [1]);
        $modal = Hasil::buka(Kebun::hitungModal(
            $rencana->map(fn ($r) => ['id' => $r->id, 'grup' => $r->grup, 'jumlah' => $r->jumlah, 'hargaSatuan' => $r->harga_satuan, 'alatSekaliBeli' => $r->alat_sekali_beli])->all(),
            $pembagian > 1,
            $pembagian,
        ));
        $hariIni = HariIni::untuk($p);
        $tanam = $s->tanggal_tanam?->toDateString();
        $umur = (int) ResepTanam::whereKey($s->resep_id)->value('umur_panen_hari');

        return self::bentukSiklus($s) + [
            'rencana_item' => $rencana->map(function ($r) {
                $data = $r->toArray();
                unset($data['dibuat_pada'], $data['urutan']);

                return $data;
            })->all(),
            'modal' => [
                'total_bahan' => $modal['totalBahan'],
                'total_alat' => $modal['totalAlat'],
                'biaya_alat_per_siklus' => $modal['biayaAlatPerSiklus'],
                'total_modal' => $modal['totalModal'],
                'lengkap' => $modal['lengkap'],
                'sudah_keluar' => (int) $s->pengeluaran()->sum('nominal'),
            ],
            'hari_ke' => $tanam ? Angka::selisihHari($tanam, $hariIni) : null,
            'perkiraan_tanggal_panen' => $tanam ? Angka::tambahHari($tanam, $umur) : null,
        ];
    }

    /** Nomor urut untuk siklus baru: setelah semua siklus yang ada. */
    public static function urutanBerikutnya(): int
    {
        return (int) SiklusTanam::max('urutan') + 1;
    }

    /** Ukuran siklus dalam satuan kapasitas lahannya (m² atau lubang). */
    private static function ukuranKapasitas(SiklusTanam $s, Lahan $l): float
    {
        return (float) (($l->jenis_lahan->value === 'hidroponik' ? $s->jumlah_lubang : $s->luas_m2) ?? 0);
    }

    /** Siklus mulai memakai lahan: kapasitas diperiksa tanpa menghitung siklus itu sendiri (D-15, D-34). */
    public static function periksaKapasitas(SiklusTanam $s): void
    {
        $lahan = Lahan::findOrFail($s->lahan_id);
        $ukuran = self::ukuranKapasitas($s, $lahan);
        if ($ukuran <= 0) {
            return;
        }
        Hasil::buka(KapasitasLahan::muatSiklusBaru(self::lahanDomain($lahan), self::siklusLahan($lahan->id, [$s->id]), $ukuran));
    }

    /**
     * Petak pesanan rutin: kapasitas diperiksa dengan semua petak baru sekaligus (D-40).
     *
     * @param  list<array<string, mixed>>  $baru  siklus domain
     */
    public static function periksaKapasitasPetak(Lahan $lahan, array $baru): void
    {
        if ($baru === []) {
            return;
        }
        Hasil::buka(KapasitasLahan::muatSiklusBanyak(self::lahanDomain($lahan), self::siklusLahan($lahan->id, array_column($baru, 'id')), $baru));
    }

    /** Tugas siklus dari pola tugas resepnya, mulai tanggal tanam (P0-12). */
    public static function buatTugas(SiklusTanam $s, string $tanggalTanam): void
    {
        $resep = Resep::bentuk(ResepTanam::findOrFail($s->resep_id));
        $tugas = Hasil::buka(Kebun::buatJadwal($resep['tugas'], $tanggalTanam, $s->id));
        $sekarang = now();
        foreach (array_chunk($tugas, 200) as $potongan) {
            DB::table('tugas')->insert(array_map(fn ($t) => [
                ...$t,
                'boleh_digeser' => $t['boleh_digeser'],
                'ukur' => $t['ukur'] === null ? null : json_encode($t['ukur'], JSON_UNESCAPED_UNICODE),
                'dibuat_pada' => $sekarang,
            ], $potongan));
        }
    }

    /** @return array<string, mixed> `Tugas` */
    public static function bentukTugas(Tugas $t): array
    {
        $data = $t->toArray();
        unset($data['dibuat_pada']);

        return $data;
    }
}
