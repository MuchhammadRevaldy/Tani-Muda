<?php

use Carbon\CarbonImmutable;
use Database\Seeders\DataContohSeeder;
use Illuminate\Support\Facades\Route;

/*
 * Setiap endpoint di docs/kontrak-api.md punya rute ([AG-19]): dikerjakan, atau dijawab 501
 * BELUM_TERSEDIA "Fitur ini belum tersedia di versi demo" (bukan 404 yang tampil sebagai galat umum).
 */

/** @return list<string> "METODE /jalur" dengan parameter dinormalkan menjadi {} */
function endpointKontrak(): array
{
    $isi = (string) file_get_contents(jalurRepo('docs/kontrak-api.md'));
    preg_match_all('/^\| `(GET|POST|PUT|PATCH|DELETE) (\/[^` ]*)`/m', $isi, $m, PREG_SET_ORDER);

    return array_values(array_unique(array_map(
        fn (array $x) => $x[1].' '.preg_replace('/\{[^}]+\}/', '{}', explode('?', $x[2])[0]),
        $m,
    )));
}

it('setiap endpoint kontrak punya rute di /api/v1', function () {
    $rute = [];
    foreach (Route::getRoutes() as $r) {
        foreach ($r->methods() as $metode) {
            $rute[] = $metode.' '.preg_replace('/\{[^}]+\}/', '{}', '/'.ltrim(substr($r->uri(), strlen('api/v1')), '/'));
        }
    }
    $kontrak = endpointKontrak();
    expect(count($kontrak))->toBeGreaterThan(80)
        ->and(array_values(array_diff($kontrak, $rute)))->toBe([]);
});

it('endpoint yang belum dikerjakan menjawab 501 BELUM_TERSEDIA dengan pesan versi demo', function () {
    DataContohSeeder::isi(CarbonImmutable::now());
    $this->postJson('/api/v1/demo/masuk', ['pengguna_id' => 'petani-arif'])->assertOk();
    app('auth')->forgetGuards();
    foreach ([['postJson', '/api/v1/laporan-harga'], ['postJson', '/api/v1/admin/sengketa/x/putuskan'], ['postJson', '/api/v1/notifikasi/langganan']] as [$cara, $jalur]) {
        $this->{$cara}($jalur)
            ->assertStatus(501)
            ->assertJsonPath('galat.kode', 'BELUM_TERSEDIA')
            ->assertJsonPath('galat.pesan', 'Fitur ini belum tersedia di versi demo');
    }
});

it('tetap wajib masuk', function () {
    $this->postJson('/api/v1/laporan-harga')->assertStatus(401)->assertJsonPath('galat.kode', 'BELUM_MASUK');
});
