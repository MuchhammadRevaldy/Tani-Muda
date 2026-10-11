<?php

use App\Enums;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/*
 * Skema basis data harus sama dengan docs/kontrak-api.md bagian 2 (T5.04–T5.07): setiap kolom yang
 * disimpan ada di tabelnya, dan setiap pilihan tetap sama dengan enum PHP serta kolom `enum`
 * MariaDB. Tes membaca tabel Markdown kontrak, jadi perubahan kontrak tanpa migrasi membuatnya gagal.
 */

/**
 * @return array<string, array<string, list<string>|null>> tabel → kolom → pilihan enum (null bila bukan enum)
 */
function bacaKontrak(): array
{
    $baris = file(jalurRepo('docs/kontrak-api.md'), FILE_IGNORE_NEW_LINES);
    $mulai = array_search('## 2. Bentuk data', $baris, true);
    $akhir = array_search('## 3. Endpoint per fitur', $baris, true);
    expect($mulai)->toBeInt()->and($akhir)->toBeInt();

    $hasil = [];
    $judul = null;
    $tabel = null;
    for ($i = $mulai; $i < $akhir; $i++) {
        $b = $baris[$i];
        if (str_starts_with($b, '### ')) {
            $judul = preg_match('/`([a-z_]+)`/', $b, $m) ? $m[1] : null;
            $tabel = null;

            continue;
        }
        if (! str_starts_with($b, '|')) {
            $tabel = null;

            continue;
        }
        $sel = array_map('trim', explode(' | ', trim($b, '| ')));
        // Baris kepala: diikuti baris pemisah `| --- |`.
        if (isset($baris[$i + 1]) && str_starts_with($baris[$i + 1], '| ---')) {
            $tabel = preg_match('/^`([a-z_]+)`/', $sel[0], $m) ? $m[1] : $judul;
            $i++;

            continue;
        }
        if ($tabel === null) {
            continue;
        }
        preg_match_all('/`([a-z_]+)`/', $sel[0], $kolom);
        $tipe = str_replace('\|', '|', $sel[1] ?? '');
        $pilihan = null;
        // Pilihan tetap: `a` \| `b` (\| null), nilainya huruf kecil, angka, `_`, atau `-`.
        if (preg_match('/^`[a-z][a-z0-9_-]*`†?(\s*\|\s*(`[a-z][a-z0-9_-]*`†?|null))+$/u', $tipe)) {
            preg_match_all('/`([^`]+)`/', $tipe, $p);
            $pilihan = $p[1];
        }
        foreach ($kolom[1] as $k) {
            $hasil[$tabel][$k] = $pilihan;
        }
    }

    return $hasil;
}

/** Kolom kontrak yang dihitung server saat dikirim, tidak disimpan. */
const KOLOM_DIHITUNG = [
    'komoditas' => ['status_resep', 'jumlah_pesanan_sekitar'],
    'lahan' => ['kapasitas'],
    'siklus_tanam' => ['kelompok_pesanan', 'resep_contoh'],
    'resep_tanam' => ['input', 'tugas'],
    'modul' => ['selesai', 'selesai_pada'],
    'alokasi_pesanan' => ['siklus_ids'],
    'pengiriman' => ['rating_saya'],
];

const ENUM_KONTRAK = [
    'pengguna.peran' => Enums\Peran::class,
    'pengguna.status_akun' => Enums\StatusAkun::class,
    'profil_pembeli.jenis_usaha' => Enums\JenisUsaha::class,
    'profil_pembeli.status_verifikasi' => Enums\StatusVerifikasi::class,
    'catatan_petani.jenis' => Enums\JenisCatatan::class,
    'komoditas.kategori' => Enums\KategoriKomoditas::class,
    'metode_tanam.dasar_ukuran' => Enums\DasarUkuran::class,
    'metode_tanam.modal_awal' => Enums\ModalAwal::class,
    'konversi_satuan.satuan' => Enums\SatuanKonversi::class,
    'input_pertanian.kategori' => Enums\KategoriInput::class,
    'resep_tanam.status' => Enums\StatusResep::class,
    'resep_tanam.asal_angka_contoh' => Enums\AsalAngkaContoh::class,
    'resep_tanam.dasar_ukuran' => Enums\DasarUkuran::class,
    'resep_input.dasar_dosis' => Enums\DasarDosis::class,
    'resep_tugas.tipe' => Enums\TipeTugas::class,
    'lahan.jenis_lahan' => Enums\JenisLahan::class,
    'siklus_tanam.status' => Enums\StatusSiklus::class,
    'rencana_item.asal' => Enums\AsalRencana::class,
    'tugas.tipe' => Enums\TipeTugas::class,
    'tugas.status' => Enums\StatusTugas::class,
    'hasil_pengukuran.status' => Enums\StatusUkur::class,
    'hasil_pengukuran.sumber' => Enums\SumberUkur::class,
    'pesanan.jenis' => Enums\JenisPesanan::class,
    'pesanan.status' => Enums\StatusPesanan::class,
    'alokasi_pesanan.status' => Enums\StatusAlokasi::class,
    'pengiriman.status' => Enums\StatusPengiriman::class,
    'pengiriman.alasan_penolakan' => Enums\AlasanPenolakan::class,
    'pembayaran.jenis' => Enums\JenisPembayaran::class,
    'pembayaran.status' => Enums\StatusPembayaran::class,
    'sengketa.status' => Enums\StatusSengketa::class,
    'sengketa.keputusan' => Enums\KeputusanSengketa::class,
];

it('pembaca kontrak menemukan semua tabel data bagian 2', function () {
    expect(array_keys(bacaKontrak()))->toEqualCanonicalizing([
        'pengguna', 'profil_pembeli', 'catatan_petani', 'wilayah', 'komoditas', 'metode_tanam',
        'sistem_hidroponik', 'konversi_satuan', 'input_pertanian', 'merek_input', 'laporan_harga',
        'kelayakan_subsidi', 'promo', 'resep_tanam', 'resep_input', 'resep_tugas', 'permintaan_resep',
        'lahan', 'siklus_tanam', 'rencana_item', 'tugas', 'hasil_pengukuran', 'pengeluaran', 'jurnal',
        'pengaturan_pengingat', 'modul', 'pesanan', 'alokasi_pesanan', 'pengiriman', 'pembayaran',
        'rating', 'sengketa',
    ]);
});

it('setiap kolom kontrak yang disimpan ada di tabelnya', function (string $tabel, array $kolom) {
    $disimpan = array_diff(array_keys($kolom), KOLOM_DIHITUNG[$tabel] ?? []);

    expect(Schema::hasTable($tabel))->toBeTrue("tabel {$tabel} belum ada")
        ->and(array_values(array_diff($disimpan, Schema::getColumnListing($tabel))))->toBe([], "kolom {$tabel} yang belum ada");
})->with(fn () => array_map(fn ($t, $k) => [$t, $k], array_keys(bacaKontrak()), bacaKontrak()));

it('pilihan enum sama di kontrak, enum PHP, dan kolom MariaDB', function (string $kunci, string $enum) {
    [$tabel, $kolom] = explode('.', $kunci);
    $kontrak = bacaKontrak()[$tabel][$kolom] ?? null;
    $tipe = DB::selectOne(
        'SELECT COLUMN_TYPE AS t FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
        [$tabel, $kolom],
    )->t;
    preg_match_all("/'([^']+)'/", $tipe, $m);

    expect($kontrak)->toBe($enum::nilai(), "kontrak {$kunci}")
        ->and($m[1])->toBe($enum::nilai(), "kolom MariaDB {$kunci}");
})->with(fn () => array_map(fn ($k, $e) => [$k, $e], array_keys(ENUM_KONTRAK), ENUM_KONTRAK));

it('setiap kolom kontrak yang berpilihan tetap punya enum PHP', function () {
    $tanpaEnum = [];
    foreach (bacaKontrak() as $tabel => $kolom) {
        foreach ($kolom as $k => $pilihan) {
            if ($pilihan !== null && ! isset(ENUM_KONTRAK["{$tabel}.{$k}"]) && ! in_array($k, KOLOM_DIHITUNG[$tabel] ?? [], true)) {
                $tanpaEnum[] = "{$tabel}.{$k}";
            }
        }
    }

    expect($tanpaEnum)->toBe([]);
});

it('tidak ada kata sandi, nama pengguna, atau kolom status terlambat', function () {
    expect(Schema::hasTable('users'))->toBeFalse()
        ->and(Schema::hasColumns('pengguna', ['password']))->toBeFalse()
        ->and(Schema::hasColumns('pengguna', ['username']))->toBeFalse()
        ->and(Schema::hasColumn('tugas', 'terlambat'))->toBeFalse()
        ->and(DB::selectOne("SELECT COLUMN_TYPE AS t FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tugas' AND COLUMN_NAME = 'status'")->t)
        ->not->toContain('terlambat');
});
