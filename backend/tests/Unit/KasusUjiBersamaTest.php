<?php

/*
 * Kasus uji perhitungan bersama shared/kasus-uji/*.json (T5.02, D-49): berkas yang sama dibaca
 * Vitest di frontend/src/lib/kasus-bersama.test.ts. Format ada di shared/kasus-uji/README.md.
 *
 * Rumus PHP ada di app/Domain/Hitung (D-57). Setiap fungsi kasus didaftarkan di adaptorHitung()
 * (nama fungsi kasus → callable yang menerima `masukan`); fungsi yang belum ada ditandai
 * "belum diport" dan dilewati.
 */

use App\Domain\Hitung\Jarak;
use App\Domain\Hitung\KapasitasLahan;
use App\Domain\Hitung\Kiriman;
use App\Domain\Hitung\PesananLahan;
use App\Domain\Hitung\Uang;

/** @return array<string, callable(array): mixed> */
function adaptorHitung(): array
{
    $lahan = fn (array $l) => ['id' => 'lahan'] + $l;
    $siklus = fn (array $daftar) => array_map(fn ($s) => ['lahanId' => 'lahan'] + $s, $daftar);

    return [
        'bulatkanRupiah' => fn ($m) => Uang::bulatkanRupiah($m['n']),
        'bulatkanKeRatusan' => fn ($m) => Uang::bulatkanKeRatusan($m['n']),
        'hitungNilaiPesanan' => fn ($m) => Uang::hitungNilaiPesanan($m['pesanan'], $m['konfigurasi']),
        'jumlahKirimanRutin' => fn ($m) => Uang::jumlahKirimanRutin($m['frekuensiHari'], $m['durasiHari'], $m['maksDurasiHari']),
        'hitungPembayaranKiriman' => fn ($m) => Uang::hitungPembayaranKiriman($m['m']),
        'konfirmasiKiriman' => fn ($m) => Kiriman::konfirmasiKiriman($m['kiriman'], $m['keputusan'], $m['persenUangMuka']),
        'kapasitasLahan' => fn ($m) => KapasitasLahan::kapasitasLahan($lahan($m['lahan']), $siklus($m['siklus'])),
        'muatSiklusBaru' => fn ($m) => KapasitasLahan::muatSiklusBaru($lahan($m['lahan']), $siklus($m['siklus']), $m['kebutuhan']),
        'luasPerPanen' => fn ($m) => PesananLahan::luasPerPanen($m['jumlahKg'], $m['hasilPerSatuan']),
        'jumlahPetakBersamaan' => fn ($m) => PesananLahan::jumlahPetakBersamaan($m['frekuensiHari'], $m['umurPanenHari']),
        'kebutuhanLahanPesanan' => fn ($m) => PesananLahan::kebutuhanLahanPesanan($m['m']),
        'cekAmbilSebagian' => fn ($m) => PesananLahan::cekAmbilSebagian($m['m']),
        'batasAlokasi' => fn ($m) => PesananLahan::batasAlokasi($m['jumlahPesananKg'], $m['sudahDiambilKg'], $m['ambilKg']),
        'jarakKm' => fn ($m) => Jarak::jarakKm($m['a'], $m['b']),
        'dalamRadius' => fn ($m) => Jarak::dalamRadius($m['titik'], $m['pusat'], $m['radiusKm']),
    ];
}

/** @return array<string, array{0: string, 1: array}> */
function kasusUjiBersama(): array
{
    $hasil = [];
    foreach (glob(jalurRepo('shared/kasus-uji/*.json')) as $berkas) {
        $isi = json_decode(file_get_contents($berkas), true, flags: JSON_THROW_ON_ERROR);
        foreach ($isi['kasus'] as $k) {
            $hasil[basename($berkas).' · '.$k['fungsi'].': '.$k['nama']] = [basename($berkas), $k];
        }
    }

    return $hasil;
}

it('berkas uang, kapasitas, dan jarak ada dan berisi keterangan', function () {
    $nama = array_map('basename', glob(jalurRepo('shared/kasus-uji/*.json')));
    expect($nama)->toContain('uang.json', 'kapasitas.json', 'jarak.json');

    foreach ($nama as $n) {
        $isi = json_decode(file_get_contents(jalurRepo("shared/kasus-uji/$n")), true, flags: JSON_THROW_ON_ERROR);
        expect($isi)->toHaveKeys(['keterangan', 'kasus'])
            ->and($isi['keterangan'])->toBeString()->not->toBeEmpty()
            ->and($isi['kasus'])->toBeArray()->not->toBeEmpty();
    }
});

it('nama kasus unik di setiap berkas', function () {
    foreach (glob(jalurRepo('shared/kasus-uji/*.json')) as $berkas) {
        $nama = array_column(json_decode(file_get_contents($berkas), true)['kasus'], 'nama');
        expect(array_unique($nama))->toHaveCount(count($nama), basename($berkas));
    }
});

it('kasus berbentuk sah', function (string $berkas, array $k) {
    expect($k)->toHaveKeys(['nama', 'fungsi', 'masukan'])
        ->and($k['nama'])->toBeString()->not->toBeEmpty()
        ->and($k['fungsi'])->toMatch('/^[a-z][A-Za-z]+$/')
        ->and($k['masukan'])->toBeArray()
        ->and(array_key_exists('keluaran', $k) xor array_key_exists('galat', $k))->toBeTrue('tepat satu dari keluaran atau galat');

    if (array_key_exists('galat', $k)) {
        expect($k['galat'])->toMatch('/^[A-Z_]+$/');
    }
    if (array_key_exists('toleransi', $k)) {
        expect($k['toleransi'])->toBeNumeric()->toBeGreaterThan(0);
    }
    if (array_key_exists('sebagian', $k)) {
        expect($k['sebagian'])->toBeTrue()->and($k['keluaran'])->toBeArray();
    }
})->with(kasusUjiBersama());

/** @return array<string, array{0: string, 1: list<array>}> kasus dikelompokkan per fungsi */
function kasusPerFungsi(): array
{
    $kelompok = [];
    foreach (kasusUjiBersama() as [, $k]) {
        $kelompok[$k['fungsi']][] = $k;
    }
    ksort($kelompok);

    $hasil = [];
    foreach ($kelompok as $fungsi => $daftar) {
        $hasil[$fungsi] = [$fungsi, $daftar];
    }

    return $hasil;
}

it('hasil rumus PHP sama dengan kasus', function (string $fungsi, array $daftar) {
    $adaptor = adaptorHitung()[$fungsi] ?? null;
    if ($adaptor === null) {
        $this->markTestSkipped('belum diport ('.count($daftar).' kasus): app/Domain/Hitung, gelombang 5.4–5.5');
    }

    foreach ($daftar as $k) {
        $hasil = $adaptor($k['masukan']);

        if (array_key_exists('galat', $k)) {
            expect($hasil)->toBe(['ok' => false, 'galat' => $k['galat']], $k['nama']);

            continue;
        }
        $nilai = is_array($hasil) && array_key_exists('ok', $hasil) ? $hasil['nilai'] : $hasil;
        match (true) {
            isset($k['toleransi']) => expect(abs($nilai - $k['keluaran']))->toBeLessThanOrEqual($k['toleransi'], $k['nama']),
            isset($k['sebagian']) => expect($nilai)->toMatchArray($k['keluaran'], $k['nama']),
            default => expect($nilai)->toEqual($k['keluaran'], $k['nama']),
        };
    }
})->with(kasusPerFungsi());
