<?php

use App\Http\Galat\KodeGalat;

/*
 * Backend mengirim teks galat yang sama dengan frontend (kontrak-api.md 1.4). Sumbernya
 * frontend/src/teks/galat-api.ts (teks) dan frontend/src/api/galat.ts (status HTTP); tes ini
 * gagal bila salah satu sisi berubah tanpa sisi lainnya.
 */

/** @return array<string, string> pasangan `KODE: 'nilai'` dari objek TypeScript bernama $nama */
function bacaObjekTs(string $berkas, string $nama): array
{
    $isi = file_get_contents(jalurRepo($berkas));
    expect(preg_match('/'.preg_quote($nama, '/').'[^=]*=\s*\{(.*?)\n\};/s', $isi, $m))->toBe(1);
    preg_match_all("/^\s*([A-Z_]+):\s*'((?:[^'\\\\]|\\\\.)*)'|^\s*([A-Z_]+):\s*(\d+)/m", $m[1], $baris, PREG_SET_ORDER);

    $hasil = [];
    foreach ($baris as $b) {
        if (($b[1] ?? '') !== '') {
            $hasil[$b[1]] = stripslashes($b[2]);
        } else {
            $hasil[$b[3]] = $b[4];
        }
    }

    return $hasil;
}

it('teks galat sama dengan frontend/src/teks/galat-api.ts', function () {
    expect(KodeGalat::TEKS)->toBe(bacaObjekTs('frontend/src/teks/galat-api.ts', 'teksGalatKhususApi'));
});

it('status HTTP sama dengan frontend/src/api/galat.ts', function () {
    $frontend = array_map('intval', bacaObjekTs('frontend/src/api/galat.ts', 'STATUS_KHUSUS'));

    expect(KodeGalat::STATUS)->toBe($frontend);
});

it('kode yang tidak tercantum berstatus 422', function () {
    expect(KodeGalat::status('LUAS_KOSONG'))->toBe(422)
        ->and(KodeGalat::status('TIDAK_DITEMUKAN'))->toBe(404);
});
