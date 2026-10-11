<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/*
 * Dua permintaan serentak dengan kunci idempoten yang sama (D-54), sebagai dua proses PHP terpisah
 * dengan koneksi basis data masing-masing. Tidak memakai RefreshDatabase: data harus sudah commit
 * supaya terlihat oleh proses pekerja, jadi semua tabel dikosongkan sebelum dan sesudah setiap tes
 * (DELETE, bukan TRUNCATE atau migrate:fresh yang di Windows butuh belasan detik).
 */

function kosongkanSemuaTabel(): void
{
    DB::statement('SET FOREIGN_KEY_CHECKS=0');
    foreach (Schema::getTableListing(DB::getDatabaseName(), schemaQualified: false) as $tabel) {
        if ($tabel !== 'migrations') {
            DB::table($tabel)->delete();
        }
    }
    DB::statement('SET FOREIGN_KEY_CHECKS=1');
}

beforeEach(function () {
    $this->artisan('migrate');
    kosongkanSemuaTabel();
    isiDataDasar();
});

afterEach(function () {
    kosongkanSemuaTabel();
});

/**
 * @return array{0: resource, 1: array<int, resource>}
 */
function mulaiPekerja(string $kunci, int $lamaMs, string $mode = 'berhasil'): array
{
    $db = config('database.connections.'.config('database.default'));
    $env = array_merge(getenv(), [
        'APP_ENV' => 'testing',
        'DB_CONNECTION' => config('database.default'),
        'DB_DATABASE' => $db['database'],
    ]);
    $proses = proc_open(
        [PHP_BINARY, __DIR__.'/pekerja-idempoten.php', $kunci, (string) $lamaMs, $mode],
        [1 => ['pipe', 'w'], 2 => ['pipe', 'w']],
        $pipa,
        base_path(),
        $env,
    );
    expect($proses)->toBeResource();

    return [$proses, $pipa];
}

/**
 * @param  array{0: resource, 1: array<int, resource>}  $pekerja
 * @return array<string, mixed>
 */
function tungguPekerja(array $pekerja): array
{
    [$proses, $pipa] = $pekerja;
    $keluaran = stream_get_contents($pipa[1]);
    $galat = stream_get_contents($pipa[2]);
    fclose($pipa[1]);
    fclose($pipa[2]);
    expect(proc_close($proses))->toBe(0, $galat ?: (string) $keluaran);

    return json_decode((string) $keluaran, true, flags: JSON_THROW_ON_ERROR);
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
