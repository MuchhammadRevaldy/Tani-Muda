<?php

use App\Domain\Hitung\Level;

it('menghitung poin dan level sesuai kasus bersama level.json', function () {
    $jalur = base_path('../shared/kasus-uji/level.json');
    $data = json_decode(file_get_contents($jalur), true, flags: JSON_THROW_ON_ERROR);

    foreach ($data['kasus'] as $k) {
        if ($k['fungsi'] === 'hitungPoin') {
            $poin = Level::hitungPoin($k['masukan']['peristiwa']);
            expect($poin)->toBe($k['keluaran']);
        } elseif ($k['fungsi'] === 'levelDariPoin') {
            $hasil = Level::levelDariPoin($k['masukan']['poin']);
            expect($hasil['level'])->toBe($k['keluaran']['level'])
                ->and($hasil['level_berikutnya'])->toBe($k['keluaran']['levelBerikutnya'])
                ->and($hasil['poin_ke_berikutnya'])->toBe($k['keluaran']['poinKeBerikutnya']);
        }
    }
});

it('memverifikasi kelayakan lencana berdasarkan statistik peran', function () {
    $hasilPetani = Level::cekLencana('petani', [
        'siklus_aktif' => 1,
        'siklus_selesai' => 0,
        'hari_berturut_tepat_waktu' => 7,
        'jumlah_foto' => 20,
        'jumlah_pengukuran' => 10,
        'modul_per_metode_selesai' => true,
        'kiriman_diterima_penuh' => 5,
        'rata_rata_rating' => 4.9,
        'jumlah_ulasan' => 6,
    ]);

    expect($hasilPetani['diraih'])->toContain('tanam-pertama')
        ->toContain('tepat-waktu-7-hari')
        ->toContain('kebun-terdokumentasi')
        ->toContain('pengukur-teliti')
        ->toContain('pelajar-rajin')
        ->toContain('dipercaya-pembeli')
        ->toContain('bintang-lima');

    $hasilPembeli = Level::cekLencana('pembeli', [
        'pesanan_dibayar' => 2,
        'pesanan_selesai' => 3,
        'rata_rata_rating' => 5.0,
        'jumlah_ulasan' => 5,
    ]);

    expect($hasilPembeli['diraih'])->toContain('pesanan-pertama')
        ->toContain('pembeli-setia')
        ->toContain('bintang-lima');
});
