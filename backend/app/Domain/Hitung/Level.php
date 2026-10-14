<?php

namespace App\Domain\Hitung;

/**
 * Level dan lencana pengguna (PRD Tambahan F-03, D-64).
 * Port PHP dari shared/kasus-uji/level.json dan frontend/src/lib/level.ts.
 */
final class Level
{
    public const POIN_PERISTIWA = [
        'tugas_tepat_waktu' => 10,
        'tugas_terlambat' => 3,
        'foto_bukti' => 2,
        'pengukuran_ph_ppm' => 5,
        'modul_selesai' => 5,
        'siklus_selesai' => 100,
        'kiriman_diterima' => 50,
        'rating_bintang_lima' => 20,
    ];

    public const AMBANG_LEVEL_BAWAAN = [
        ['level' => 'Benih', 'poin_minimal' => 0, 'ikon' => 'level-benih'],
        ['level' => 'Tunas', 'poin_minimal' => 100, 'ikon' => 'level-tunas'],
        ['level' => 'Daun', 'poin_minimal' => 300, 'ikon' => 'level-daun'],
        ['level' => 'Berbunga', 'poin_minimal' => 700, 'ikon' => 'level-berbunga'],
        ['level' => 'Panen Raya', 'poin_minimal' => 1500, 'ikon' => 'level-panen-raya'],
    ];

    /**
     * @param array<string, int> $peristiwa
     */
    public static function hitungPoin(array $peristiwa): int
    {
        $total = 0;
        foreach (self::POIN_PERISTIWA as $kunci => $bobot) {
            $total += ($peristiwa[$kunci] ?? 0) * $bobot;
        }

        return $total;
    }

    /**
     * @param list<array{level: string, poin_minimal: int, ikon: string}> $ambang
     * @return array{
     *   poin: int,
     *   level: string,
     *   ikon: string,
     *   level_berikutnya: string|null,
     *   ikon_berikutnya: string|null,
     *   poin_ke_berikutnya: int,
     *   persen_kemajuan: int
     * }
     */
    public static function levelDariPoin(int $poin, array $ambang = self::AMBANG_LEVEL_BAWAAN): array
    {
        usort($ambang, fn ($a, $b) => $a['poin_minimal'] <=> $b['poin_minimal']);

        $indeksSekarang = 0;
        foreach ($ambang as $i => $item) {
            if ($poin >= $item['poin_minimal']) {
                $indeksSekarang = $i;
            }
        }

        $sekarang = $ambang[$indeksSekarang] ?? ['level' => 'Benih', 'poin_minimal' => 0, 'ikon' => 'level-benih'];
        $berikutnya = $ambang[$indeksSekarang + 1] ?? null;

        $poinKeBerikutnya = 0;
        $persenKemajuan = 100;

        if ($berikutnya !== null) {
            $poinKeBerikutnya = max(0, $berikutnya['poin_minimal'] - $poin);
            $rentang = $berikutnya['poin_minimal'] - $sekarang['poin_minimal'];
            $kemajuan = $poin - $sekarang['poin_minimal'];
            $persenKemajuan = $rentang > 0 ? min(100, (int) round(($kemajuan / $rentang) * 100)) : 100;
        }

        return [
            'poin' => $poin,
            'level' => $sekarang['level'],
            'ikon' => $sekarang['ikon'],
            'level_berikutnya' => $berikutnya['level'] ?? null,
            'ikon_berikutnya' => $berikutnya['ikon'] ?? null,
            'poin_ke_berikutnya' => $poinKeBerikutnya,
            'persen_kemajuan' => $persenKemajuan,
        ];
    }

    /**
     * @param array<string, mixed> $statistik
     * @return array{
     *   diraih: list<string>,
     *   terkunci: list<array{kode: string, nama: string, syarat: string, kemajuan: string}>
     * }
     */
    public static function cekLencana(string $peran, array $statistik): array
    {
        $definisi = [
            [
                'kode' => 'tanam-pertama',
                'nama' => 'Tanam pertama',
                'syarat' => 'Siklus pertama aktif',
                'peran' => ['petani'],
                'cek' => fn ($s) => ($s['siklus_aktif'] ?? 0) >= 1 || ($s['siklus_selesai'] ?? 0) >= 1,
                'kemajuan' => fn ($s) => min(1, ($s['siklus_aktif'] ?? 0) + ($s['siklus_selesai'] ?? 0)) . '/1 siklus',
            ],
            [
                'kode' => 'tepat-waktu-7-hari',
                'nama' => 'Tepat waktu 7 hari',
                'syarat' => '7 hari berturut-turut semua tugas selesai tepat waktu',
                'peran' => ['petani'],
                'cek' => fn ($s) => ($s['hari_berturut_tepat_waktu'] ?? 0) >= 7,
                'kemajuan' => fn ($s) => min(7, (int) ($s['hari_berturut_tepat_waktu'] ?? 0)) . '/7 hari',
            ],
            [
                'kode' => 'kebun-terdokumentasi',
                'nama' => 'Kebun terdokumentasi',
                'syarat' => '20 foto bukti tugas',
                'peran' => ['petani'],
                'cek' => fn ($s) => ($s['jumlah_foto'] ?? 0) >= 20,
                'kemajuan' => fn ($s) => min(20, (int) ($s['jumlah_foto'] ?? 0)) . '/20 foto',
            ],
            [
                'kode' => 'pengukur-teliti',
                'nama' => 'Pengukur teliti',
                'syarat' => '10 pengukuran pH/PPM diisi',
                'peran' => ['petani'],
                'cek' => fn ($s) => ($s['jumlah_pengukuran'] ?? 0) >= 10,
                'kemajuan' => fn ($s) => min(10, (int) ($s['jumlah_pengukuran'] ?? 0)) . '/10 pengukuran',
            ],
            [
                'kode' => 'pelajar-rajin',
                'nama' => 'Pelajar rajin',
                'syarat' => 'Semua modul satu cara tanam selesai',
                'peran' => ['petani'],
                'cek' => fn ($s) => ! empty($s['modul_per_metode_selesai']),
                'kemajuan' => fn ($s) => ! empty($s['modul_per_metode_selesai']) ? 'Selesai' : 'Belum selesai',
            ],
            [
                'kode' => 'panen-pertama',
                'nama' => 'Panen pertama',
                'syarat' => 'Siklus pertama selesai dipanen',
                'peran' => ['petani'],
                'cek' => fn ($s) => ($s['siklus_selesai'] ?? 0) >= 1,
                'kemajuan' => fn ($s) => min(1, (int) ($s['siklus_selesai'] ?? 0)) . '/1 panen',
            ],
            [
                'kode' => 'dipercaya-pembeli',
                'nama' => 'Dipercaya pembeli',
                'syarat' => '5 kiriman diterima tanpa penolakan',
                'peran' => ['petani'],
                'cek' => fn ($s) => ($s['kiriman_diterima_penuh'] ?? 0) >= 5,
                'kemajuan' => fn ($s) => min(5, (int) ($s['kiriman_diterima_penuh'] ?? 0)) . '/5 kiriman',
            ],
            [
                'kode' => 'bintang-lima',
                'nama' => 'Bintang lima',
                'syarat' => 'Rata-rata rating ≥ 4,8 dari ≥ 5 ulasan',
                'peran' => ['petani', 'pembeli'],
                'cek' => fn ($s) => ($s['jumlah_ulasan'] ?? 0) >= 5 && ($s['rata_rata_rating'] ?? 0) >= 4.8,
                'kemajuan' => fn ($s) => number_format((float) ($s['rata_rata_rating'] ?? 0), 1) . '/5.0 (' . ($s['jumlah_ulasan'] ?? 0) . ' ulasan)',
            ],
            [
                'kode' => 'pesanan-pertama',
                'nama' => 'Pesanan pertama',
                'syarat' => 'Pesanan pertama berhasil dibayar',
                'peran' => ['pembeli'],
                'cek' => fn ($s) => ($s['pesanan_dibayar'] ?? 0) >= 1,
                'kemajuan' => fn ($s) => min(1, (int) ($s['pesanan_dibayar'] ?? 0)) . '/1 pesanan',
            ],
            [
                'kode' => 'pembeli-setia',
                'nama' => 'Pembeli setia',
                'syarat' => '3 pesanan selesai diterima',
                'peran' => ['pembeli'],
                'cek' => fn ($s) => ($s['pesanan_selesai'] ?? 0) >= 3,
                'kemajuan' => fn ($s) => min(3, (int) ($s['pesanan_selesai'] ?? 0)) . '/3 pesanan',
            ],
        ];

        $diraih = [];
        $terkunci = [];

        foreach ($definisi as $item) {
            if (! in_array($peran, $item['peran'], true)) {
                continue;
            }

            if (($item['cek'])($statistik)) {
                $diraih[] = $item['kode'];
            } else {
                $terkunci[] = [
                    'kode' => $item['kode'],
                    'nama' => $item['nama'],
                    'syarat' => $item['syarat'],
                    'kemajuan' => ($item['kemajuan'])($statistik),
                ];
            }
        }

        return ['diraih' => $diraih, 'terkunci' => $terkunci];
    }
}
