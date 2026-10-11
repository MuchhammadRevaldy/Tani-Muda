<?php

use App\Http\Respons;
use App\Support\Waktu;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;

it('paginasi: bawaan 20, maksimal 100, nilai di luar batas dipotong', function (array $query, int $halaman, int $perHalaman) {
    expect(Respons::paginasi(Request::create('/', 'GET', $query)))
        ->toBe(['halaman' => $halaman, 'per_halaman' => $perHalaman]);
})->with([
    'tanpa parameter' => [[], 1, 20],
    'biasa' => [['halaman' => '3', 'per_halaman' => '50'], 3, 50],
    'per halaman di atas batas' => [['per_halaman' => '500'], 1, 100],
    'per halaman nol' => [['per_halaman' => '0'], 1, 1],
    'halaman negatif' => [['halaman' => '-2'], 1, 20],
    'bukan angka' => [['halaman' => 'dua', 'per_halaman' => '2.5'], 1, 20],
]);

it('respons berhalaman memakai data dan meta kontrak', function () {
    $p = new LengthAwarePaginator([['id' => 'a'], ['id' => 'b']], total: 23, perPage: 20, currentPage: 2);

    expect(Respons::halaman($p)->getData(true))->toBe([
        'data' => [['id' => 'a'], ['id' => 'b']],
        'meta' => ['halaman' => 2, 'per_halaman' => 20, 'total' => 23, 'halaman_terakhir' => 2],
    ]);
});

it('respons sukses dibungkus data', function () {
    expect(Respons::data(['id' => 'lahan-1'], 201))
        ->getStatusCode()->toBe(201)
        ->getData(true)->toBe(['data' => ['id' => 'lahan-1']]);
});

it('waktu dikirim sebagai ISO 8601 UTC dengan milidetik dan Z', function () {
    $jakarta = Carbon::parse('2026-10-05 08:00:00.123456', 'Asia/Jakarta');

    expect(Waktu::iso($jakarta))->toBe('2026-10-05T01:00:00.123Z')
        ->and(json_encode(['w' => $jakarta]))->toBe('{"w":"2026-10-05T01:00:00.123Z"}');
});

it('aplikasi berjalan dalam UTC', function () {
    expect(config('app.timezone'))->toBe('UTC')
        ->and(date_default_timezone_get())->toBe('UTC')
        ->and(config('app.zona_waktu_tampilan'))->toBe('Asia/Jakarta');
});
