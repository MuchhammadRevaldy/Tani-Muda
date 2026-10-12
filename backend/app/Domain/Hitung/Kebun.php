<?php

namespace App\Domain\Hitung;

/**
 * Hitungan kebun (frontend/src/lib): jadwal tugas dari resep (jadwal-buat.ts), modal (modal.ts),
 * pengukuran (pengukuran.ts), ukuran tanam dan perkiraan panen (kebutuhan.ts, ukuran-metode.ts),
 * dan konversi luas (konversi-satuan.ts). Masukan resep memakai bentuk API (snake_case).
 */
final class Kebun
{
    private const GALAT_UKURAN = ['luas' => 'LUAS_KOSONG', 'lubang' => 'LUBANG_KOSONG', 'polybag' => 'POLYBAG_KOSONG'];

    /**
     * Pola tugas resep sah (validasiResepTugas).
     *
     * @param  array<string, mixed>  $t  baris resep_tugas
     * @return array{ok: true, nilai: true}|array{ok: false, galat: string}
     */
    public static function validasiResepTugas(array $t): array
    {
        if (! is_int($t['hst_mulai']) || $t['hst_mulai'] < 0) {
            return Hasil::gagal('HST_TIDAK_VALID');
        }
        if ($t['tipe'] === 'sekali') {
            return Hasil::ok(true);
        }
        if (! is_int($t['hst_selesai'] ?? null) || $t['hst_selesai'] < $t['hst_mulai']) {
            return Hasil::gagal('HST_TIDAK_VALID');
        }
        if (! is_int($t['interval'] ?? null) || $t['interval'] < 1) {
            return Hasil::gagal('INTERVAL_TIDAK_VALID');
        }
        if ($t['tipe'] === 'ukur' && empty($t['ukur'])) {
            return Hasil::gagal('HST_TIDAK_VALID');
        }

        return Hasil::ok(true);
    }

    /**
     * Jadwal nyata dari pola tugas resep (buatJadwal): sekali = tanggal tanam + HST; berulang dan
     * ukur = tanggal tanam + HST mulai + k × interval sampai HST selesai. Urut tanggal, lalu urutan
     * pola. ID tugas `<siklus>:<pola>@<hst>` (tugasDariDomain).
     *
     * @param  list<array<string, mixed>>  $resepTugas  berurutan
     * @return array{ok: true, nilai: list<array<string, mixed>>}|array{ok: false, galat: string}
     */
    public static function buatJadwal(array $resepTugas, string $tanggalTanam, string $siklusId): array
    {
        $hasil = [];
        foreach ($resepTugas as $urutan => $t) {
            $sah = self::validasiResepTugas($t);
            if (! $sah['ok']) {
                return $sah;
            }
            $hst = $t['tipe'] === 'sekali' ? [$t['hst_mulai']] : range($t['hst_mulai'], $t['hst_selesai'], $t['interval']);
            foreach ($hst as $h) {
                $hasil[] = ['urutan' => $urutan, 'tugas' => [
                    'id' => "{$siklusId}:{$t['id']}@{$h}",
                    'siklus_id' => $siklusId,
                    'resep_tugas_id' => $t['id'],
                    'tipe' => $t['tipe'],
                    'judul' => $t['judul'],
                    'tanggal' => Angka::tambahHari($tanggalTanam, $h),
                    'hst' => $h,
                    'status' => 'belum',
                    'selesai_pada' => null,
                    'boleh_digeser' => (bool) $t['boleh_digeser'],
                    'interval' => $t['tipe'] !== 'sekali' ? $t['interval'] : null,
                    'ukur' => $t['ukur'] ?? null,
                    'foto' => null,
                    'catatan' => null,
                ]];
            }
        }
        usort($hasil, fn ($a, $b) => strcmp($a['tugas']['tanggal'], $b['tugas']['tanggal']) ?: $a['urutan'] <=> $b['urutan']);

        return Hasil::ok(array_column($hasil, 'tugas'));
    }

    /**
     * Total modal (hitungModal): Σ jumlah × harga bahan + biaya alat per siklus.
     *
     * @param  list<array{id: string, grup: string, jumlah: int|float, hargaSatuan: int|float|null, alatSekaliBeli: bool}>  $items
     * @return array{ok: true, nilai: array<string, mixed>}|array{ok: false, galat: string}
     */
    public static function hitungModal(array $items, bool $bagiAlat, mixed $jumlahSiklusPembagian): array
    {
        if ($bagiAlat && ! (is_int($jumlahSiklusPembagian) && $jumlahSiklusPembagian >= 1)) {
            return Hasil::gagal('PEMBAGIAN_TIDAK_VALID');
        }
        $item = [];
        $grup = [];
        $totalBahan = 0;
        $totalAlat = 0;
        $tanpaHarga = [];
        foreach ($items as $it) {
            if ($it['jumlah'] < 0) {
                return Hasil::gagal('JUMLAH_NEGATIF');
            }
            if ($it['hargaSatuan'] !== null && $it['hargaSatuan'] < 0) {
                return Hasil::gagal('HARGA_NEGATIF');
            }
            $subtotal = $it['hargaSatuan'] === null ? null : Angka::rupiah($it['jumlah'] * $it['hargaSatuan']);
            $item[] = ['id' => $it['id'], 'subtotal' => $subtotal];
            if ($subtotal === null) {
                $tanpaHarga[] = $it['id'];
            }
            if ($it['alatSekaliBeli']) {
                $totalAlat += $subtotal ?? 0;

                continue;
            }
            $totalBahan += $subtotal ?? 0;
            $grup[$it['grup']] ??= ['nama' => $it['grup'], 'subtotal' => 0, 'adaTanpaHarga' => false];
            $grup[$it['grup']]['subtotal'] += $subtotal ?? 0;
            $grup[$it['grup']]['adaTanpaHarga'] = $grup[$it['grup']]['adaTanpaHarga'] || $subtotal === null;
        }
        $biayaAlat = $bagiAlat ? Angka::rupiah($totalAlat / $jumlahSiklusPembagian) : $totalAlat;

        return Hasil::ok([
            'item' => $item,
            'grup' => array_values($grup),
            'totalBahan' => $totalBahan,
            'totalAlat' => $totalAlat,
            'biayaAlatPerSiklus' => $biayaAlat,
            'totalModal' => $totalBahan + $biayaAlat,
            'itemTanpaHarga' => $tanpaHarga,
            'lengkap' => $tanpaHarga === [],
        ]);
    }

    /** @return array{ok: true, nilai: int|float}|array{ok: false, galat: string} */
    public static function validasiUkuran(string $dasarUkuran, mixed $nilai): array
    {
        if (! is_int($nilai) && ! is_float($nilai) || $nilai == 0) {
            return Hasil::gagal(self::GALAT_UKURAN[$dasarUkuran]);
        }

        return $nilai < 0 ? Hasil::gagal('UKURAN_NEGATIF') : Hasil::ok($nilai);
    }

    /** @return array{ok: true, nilai: float}|array{ok: false, galat: string} */
    public static function perkiraanPanen(string $dasarUkuran, mixed $ukuran, int|float $hasilPerSatuan): array
    {
        $sah = self::validasiUkuran($dasarUkuran, $ukuran);
        if (! $sah['ok']) {
            return $sah;
        }
        if (! ($hasilPerSatuan > 0)) {
            return Hasil::gagal('HASIL_KOSONG');
        }

        return Hasil::ok(Angka::bulat2($sah['nilai'] * $hasilPerSatuan));
    }

    /**
     * Nilai ke m² (keM2): hektare = 10.000 m², ru/bata dari konversi wilayah.
     *
     * @param  array<string, int|float>  $konversi  mis. ['ru' => 14, 'bata' => 14]
     * @return array{ok: true, nilai: float}|array{ok: false, galat: string}
     */
    public static function keM2(mixed $nilai, string $satuan, array $konversi): array
    {
        if (! is_int($nilai) && ! is_float($nilai) || $nilai == 0) {
            return Hasil::gagal('UKURAN_KOSONG');
        }
        if ($nilai < 0) {
            return Hasil::gagal('UKURAN_NEGATIF');
        }
        $faktor = match ($satuan) {
            'm2' => 1,
            'hektare' => 10_000,
            default => isset($konversi[$satuan]) && $konversi[$satuan] > 0 ? $konversi[$satuan] : null,
        };

        return $faktor === null ? Hasil::gagal('SATUAN_TIDAK_DIKENAL') : Hasil::ok(Angka::bulat($nilai * $faktor, 6));
    }

    private const SATUAN_FISIK = [
        'g' => ['g', 1], 'kg' => ['g', 1000], 'ton' => ['g', 1_000_000], 'ml' => ['ml', 1], 'liter' => ['ml', 1000],
    ];

    /** @return array{ok: true, nilai: float}|array{ok: false, galat: string} satuan beli per satu satuan dosis */
    public static function faktorSatuan(string $satuanDosis, string $satuanBeli, int|float|null $isiSatuanBeli): array
    {
        if ($isiSatuanBeli !== null) {
            return $isiSatuanBeli > 0 ? Hasil::ok(1 / $isiSatuanBeli) : Hasil::gagal('ISI_KEMASAN_KOSONG');
        }
        if ($satuanDosis === $satuanBeli) {
            return Hasil::ok(1.0);
        }
        $a = self::SATUAN_FISIK[$satuanDosis] ?? null;
        $b = self::SATUAN_FISIK[$satuanBeli] ?? null;

        return $a && $b && $a[0] === $b[0] ? Hasil::ok($a[1] / $b[1]) : Hasil::gagal('SATUAN_TIDAK_COCOK');
    }

    /** @return array{ok: true, nilai: float}|array{ok: false, galat: string} dibulatkan ke atas ke kelipatan kemasan */
    public static function bulatkanKeKemasan(int|float $jumlah, int|float $ukuranKemasan): array
    {
        if (! ($ukuranKemasan > 0)) {
            return Hasil::gagal('KEMASAN_TIDAK_VALID');
        }
        if ($jumlah < 0) {
            return Hasil::gagal('JUMLAH_NEGATIF');
        }
        $q = $jumlah / $ukuranKemasan;
        $n = abs($q - Angka::bulat($q)) < 1e-9 ? Angka::bulat($q) : ceil($q);

        return Hasil::ok(Angka::bulat($n * $ukuranKemasan, 6));
    }

    /**
     * Kebutuhan semua input resep (hitungKebutuhanResep, P0-07).
     *
     * @param  array<string, mixed>  $resep  bentuk API (Resep::bentuk)
     * @param  array{luasM2?: int|float|null, jumlahTanaman?: int|float|null, volumeLarutanLiter?: int|float|null}  $ukuran
     * @return array{ok: true, nilai: list<array<string, mixed>>}|array{ok: false, galat: string}
     */
    public static function hitungKebutuhanResep(array $resep, string $dasarUkuran, array $ukuran): array
    {
        $sah = self::validasiUkuran($dasarUkuran, $dasarUkuran === 'luas' ? ($ukuran['luasM2'] ?? null) : ($ukuran['jumlahTanaman'] ?? null));
        if (! $sah['ok']) {
            return $sah;
        }
        $positif = fn ($v, string $galat) => ! is_numeric($v) || $v <= 0 ? Hasil::gagal($galat) : Hasil::ok($v);
        $hasil = [];
        foreach ($resep['input'] as $i) {
            if ($i['dosis'] < 0) {
                return Hasil::gagal('DOSIS_NEGATIF');
            }
            $kali = match ($i['dasar_dosis']) {
                'per_m2' => $positif($ukuran['luasM2'] ?? null, 'LUAS_KOSONG'),
                'per_tanaman' => $positif($ukuran['jumlahTanaman'] ?? null, 'UKURAN_KOSONG'),
                'per_liter' => ($v = $positif($ukuran['volumeLarutanLiter'] ?? null, 'VOLUME_KOSONG'))['ok']
                    ? Hasil::ok($v['nilai'] * ($resep['jumlah_pengisian_larutan'] ?? 1)) : $v,
                default => Hasil::ok(1),
            };
            if (! $kali['ok']) {
                return $kali;
            }
            $faktor = self::faktorSatuan($i['satuan_dosis'], $i['satuan_beli'], $i['isi_satuan_beli'] ?? null);
            if (! $faktor['ok']) {
                return $faktor;
            }
            $dosis = Angka::bulat($i['dosis'] * $kali['nilai'], 6);
            $beli = Angka::bulat($dosis * $faktor['nilai'], 6);
            $jumlah = self::bulatkanKeKemasan($beli, $i['ukuran_kemasan']);
            if (! $jumlah['ok']) {
                return $jumlah;
            }
            $hasil[] = [
                'kebutuhanDosis' => $dosis, 'satuanDosis' => $i['satuan_dosis'], 'kebutuhanBeli' => $beli,
                'jumlahBeli' => $jumlah['nilai'], 'satuanBeli' => $i['satuan_beli'], 'inputId' => $i['id'],
                'nama' => $i['nama'], 'grup' => $i['grup'], 'alatSekaliBeli' => (bool) $i['alat_sekali_beli'],
                'hargaContoh' => $i['harga_contoh'] ?? null,
            ];
        }

        return Hasil::ok($hasil);
    }

    /** Saran volume tandon: lubang × liter per lubang, kelipatan 10, paling sedikit 10 liter. */
    public static function saranVolumeTandon(int|float $jumlahLubang, int|float $literPerLubang): int
    {
        if (! ($jumlahLubang > 0) || ! ($literPerLubang > 0)) {
            return 10;
        }

        return (int) max(10, Angka::bulat($jumlahLubang * $literPerLubang / 10) * 10);
    }

    public static function nilaiPengukuran(int|float|null $nilai, int|float $batasBawah, int|float $batasAtas): string
    {
        return match (true) {
            $nilai === null => 'kosong',
            $nilai < $batasBawah => 'terlalu-rendah',
            $nilai > $batasAtas => 'terlalu-tinggi',
            default => 'normal',
        };
    }

    /** @return array{ok: true, nilai: int|float}|array{ok: false, galat: string} */
    public static function validasiNilaiUkur(int|float $nilai, int|float $skalaMin, int|float|null $skalaMaks): array
    {
        if (is_nan((float) $nilai) || $nilai < $skalaMin || ($skalaMaks !== null && $nilai > $skalaMaks)) {
            return Hasil::gagal('NILAI_DI_LUAR_SKALA');
        }

        return Hasil::ok($nilai);
    }

    /**
     * Tanggal ukur ulang (besok) bila ada nilai di luar batas normal.
     *
     * @param  list<string>  $status
     */
    public static function perluUkurUlang(array $status, string $tanggalUkur): ?string
    {
        return array_intersect($status, ['terlalu-rendah', 'terlalu-tinggi']) !== [] ? Angka::tambahHari($tanggalUkur, 1) : null;
    }
}
