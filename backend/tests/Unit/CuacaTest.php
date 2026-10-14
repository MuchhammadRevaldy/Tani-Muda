<?php

use App\Domain\Hitung\Cuaca;

it('kecocokan suhu memenuhi seluruh kasus uji bersama shared/kasus-uji/cuaca.json', function () {
    $jalur = dirname(__DIR__, 2).'/../shared/kasus-uji/cuaca.json';
    $isi = file_get_contents($jalur);
    expect($isi)->not->toBeFalse();

    /** @var array{keterangan: string, kasus: list<array<string, mixed>>} $data */
    $data = json_decode((string) $isi, true);

    foreach ($data['kasus'] as $kasus) {
        $masukan = $kasus['masukan'];
        $suhu = $masukan['suhu'] !== null ? (float) $masukan['suhu'] : null;
        $rentang = $masukan['rentang'];
        $harapan = $kasus['keluaran'];

        $hasil = Cuaca::kecocokanSuhu($suhu, $rentang);

        expect($hasil['status'])->toBe($harapan['status'], "Gagal pada: {$kasus['nama']}")
            ->and($hasil['label'])->toBe($harapan['label'], "Gagal label pada: {$kasus['nama']}")
            ->and($hasil['cocok'])->toBe($harapan['cocok'], "Gagal cocok pada: {$kasus['nama']}")
            ->and($hasil['saran'])->toBe($harapan['saran'], "Gagal saran pada: {$kasus['nama']}");
    }
});
