<?php

use Illuminate\Support\Facades\DB;

/*
 * Dua permintaan serentak dengan kunci idempoten yang sama (D-54), sebagai dua proses PHP terpisah
 * dengan koneksi basis data masing-masing. Tidak memakai RefreshDatabase: data harus sudah commit
 * supaya terlihat oleh proses pekerja, jadi semua tabel dikosongkan sebelum dan sesudah setiap tes
 * (DELETE, bukan TRUNCATE atau migrate:fresh yang di Windows butuh belasan detik).
 */

beforeEach(function () {
    $this->artisan('migrate');
    kosongkanSemuaTabel();
    isiDataDasar();
});

afterEach(function () {
    kosongkanSemuaTabel();
});

/** @return array{0: resource, 1: array<int, resource>} */
function mulaiPekerja(string $kunci, int $lamaMs, string $mode = 'berhasil'): array
{
    return jalankanPekerja('pekerja-idempoten.php', [$kunci, (string) $lamaMs, $mode]);
}

it('(a) dua permintaan serentak dengan kunci sama hanya membayar sekali dan menerima respons yang sama', function () {
    $a = mulaiPekerja('kunci-serentak', 1500);
    $b = mulaiPekerja('kunci-serentak', 1500);
    [$hasilA, $hasilB] = [tungguPekerja($a), tungguPekerja($b)];

    // Keduanya benar-benar bersamaan: yang kedua mulai sebelum yang pertama selesai.
    expect(max($hasilA['mulai'], $hasilB['mulai']))->toBeLessThan(min($hasilA['selesai'], $hasilB['selesai']));
    expect($hasilA['status'])->toBe(201)
        ->and($hasilB['status'])->toBe(201)
        ->and($hasilA['respons'])->toBe($hasilB['respons'])
        ->and([$hasilA['diulang'], $hasilB['diulang']])->toEqualCanonicalizing([false, true]);
    expect(DB::table('pembayaran')->where('jenis', 'pencairan')->pluck('id')->all())
        ->toBe([$hasilA['respons']['data']['id']])
        ->and(DB::table('kunci_idempoten')->count())->toBe(1);
});

it('bila permintaan pertama gagal, permintaan serentak dengan kunci sama yang menunggu menjalankan operasinya sendiri', function () {
    $gagal = mulaiPekerja('kunci-gagal', 1500, 'gagal');
    usleep(700_000);
    $ulang = mulaiPekerja('kunci-gagal', 0);
    [$hasilGagal, $hasilUlang] = [tungguPekerja($gagal), tungguPekerja($ulang)];

    expect($hasilGagal['mulai'])->toBeLessThan($hasilUlang['mulai'])
        ->and($hasilUlang['mulai'])->toBeLessThan($hasilGagal['selesai'])
        ->and($hasilGagal['galat'])->toBe('gagal di tengah transaksi')
        ->and($hasilUlang['diulang'])->toBeFalse();
    expect(DB::table('pembayaran')->where('jenis', 'pencairan')->pluck('id')->all())
        ->toBe([$hasilUlang['respons']['data']['id']])
        ->and(DB::table('kunci_idempoten')->count())->toBe(1);
});
