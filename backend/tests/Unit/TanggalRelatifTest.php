<?php

use App\Support\TanggalRelatif;
use Carbon\CarbonImmutable;

/* Sama dengan frontend/src/api/tiruan/tanggal-relatif.test.ts (D-47). */

it('menyelesaikan nilai relatif seperti klien tiruan', function (string $nilai, string $hasil) {
    expect(TanggalRelatif::nilai($nilai, '2026-10-05', 'Asia/Jakarta'))->toBe($hasil);
})->with([
    ['H-13', '2026-09-22'],
    ['H+0', '2026-10-05'],
    ['H+72', '2026-12-16'],
    ['H+0T07:00', '2026-10-05T00:00:00.000Z'],
    ['H-1T06:30', '2026-10-03T23:30:00.000Z'],
    ['B+2', '2026-12'],
    ['B+3', '2027-01'],
    ['B-10', '2025-12'],
    ['J-1', '2026-10-05T00:00:00.000Z'],
    ['J+5', '2026-10-05T06:00:00.000Z'],
    ['Halo', 'Halo'],
    ['H-x', 'H-x'],
]);

it('"J±n" relatif terhadap saat atur ulang', function () {
    $pukul23 = CarbonImmutable::parse('2026-10-05T16:00:00Z');
    expect(TanggalRelatif::nilai('J-1', '2026-10-05', 'Asia/Jakarta', $pukul23))->toBe('2026-10-05T15:00:00.000Z')
        ->and(TanggalRelatif::nilai('J+5', '2026-10-05', 'Asia/Jakarta', $pukul23))->toBe('2026-10-05T21:00:00.000Z');
});

it('objek bersarang diselesaikan, angka dan null tetap', function () {
    expect(TanggalRelatif::selesaikan(['a' => ['H+1', 5, null, ['b' => 'H-1T08:00']], 'c' => true], '2026-10-05', 'Asia/Jakarta'))
        ->toBe(['a' => ['2026-10-06', 5, null, ['b' => '2026-10-04T01:00:00.000Z']], 'c' => true]);
});
