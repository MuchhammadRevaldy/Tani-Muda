<?php

use App\Models\Berkas;
use Carbon\CarbonImmutable;
use Database\Seeders\DataContohSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Testing\TestResponse;

/* POST /berkas dan unduh bertanda tangan (kontrak 3.11, arsitektur-backend.md bagian 13, [AG-22]). */

beforeEach(function () {
    Storage::fake('local');
    DataContohSeeder::isi(CarbonImmutable::now());
    $this->postJson('/api/v1/demo/masuk', ['pengguna_id' => 'petani-arif'])->assertOk();
    app('auth')->forgetGuards();
});

function unggahBerkas(UploadedFile $f): TestResponse
{
    return test()->post('/api/v1/berkas', ['berkas' => $f], ['Accept' => 'application/json']);
}

it('menyimpan foto dengan nama acak di disk privat dan memberi URL bertanda tangan 10 menit', function () {
    $r = unggahBerkas(UploadedFile::fake()->image('foto panen.jpg', 40, 30))->assertOk()->json('data');
    expect($r)->toHaveKeys(['id', 'url', 'jenis', 'ukuran_byte'])
        ->and($r['jenis'])->toBe('image/jpeg')
        ->and($r['url'])->toStartWith("/api/v1/berkas/{$r['id']}/unduh?expires=")
        ->and($r['url'])->toContain('signature=')
        ->and($r)->not->toHaveKey('jalur');
    $b = Berkas::findOrFail($r['id']);
    expect($b->pemilik_id)->toBe('petani-arif')
        ->and($b->jalur)->toStartWith('berkas/')->and($b->jalur)->not->toContain('foto panen');
    Storage::disk('local')->assertExists($b->jalur);

    $this->get($r['url'])->assertOk()->assertHeader('Content-Type', 'image/jpeg');
});

it('menolak jenis yang salah, termasuk berkas yang mengaku gambar', function () {
    unggahBerkas(UploadedFile::fake()->create('nota.pdf', 10, 'application/pdf'))
        ->assertStatus(422)->assertJsonStructure(['galat' => ['rincian' => ['jenis']]]);
    // Berkas sungguhan (bukan fake) supaya jenis diperiksa dari isinya lewat finfo.
    $tmp = tempnam(sys_get_temp_dir(), 'palsu');
    file_put_contents($tmp, '<?php echo 1;');
    unggahBerkas(new UploadedFile($tmp, 'palsu.jpg', 'image/jpeg', null, true))
        ->assertStatus(422)->assertJsonStructure(['galat' => ['rincian' => ['jenis']]]);
    expect(Berkas::count())->toBe(0);
});

it('menolak berkas lebih dari 2 MB', function () {
    unggahBerkas(UploadedFile::fake()->image('besar.png')->size(2049))
        ->assertStatus(422)->assertJsonStructure(['galat' => ['rincian' => ['isi']]]);
    expect(Berkas::count())->toBe(0);
});

it('URL kedaluwarsa dan URL yang diubah ditolak', function () {
    $r = unggahBerkas(UploadedFile::fake()->image('a.png'))->assertOk()->json('data');
    $lain = unggahBerkas(UploadedFile::fake()->image('b.png'))->assertOk()->json('data');
    // Tanda tangan URL satu berkas tidak berlaku untuk berkas lain.
    $this->get(str_replace($r['id'], $lain['id'], $r['url']))->assertForbidden();
    $this->get(preg_replace('/expires=\d+/', 'expires=9999999999', $r['url']))->assertForbidden();
    $this->get("/api/v1/berkas/{$r['id']}/unduh")->assertForbidden();
    $this->travel(11)->minutes();
    $this->get($r['url'])->assertForbidden();
});

it('foto bukti tugas tersimpan sebagai rujukan tetap, tetap bisa dibuka setelah 10 menit, dan hanya berkas milik sendiri', function () {
    $r = unggahBerkas(UploadedFile::fake()->image('bukti.jpg'))->assertOk()->json('data');
    $tugas = DB::table('tugas')->where('siklus_id', 'siklus-arif-sawi')->where('status', 'belum')->where('tipe', 'sekali')->value('id');
    $this->postJson("/api/v1/tugas/{$tugas}/selesai", ['kunci_idempoten' => 'f-1', 'foto' => $r['url']])->assertOk();
    expect(DB::table('tugas')->where('id', $tugas)->value('foto'))->toBe("berkas:{$r['id']}")
        ->and(DB::table('jurnal')->where('tugas_id', $tugas)->value('foto'))->toBe("berkas:{$r['id']}");

    $this->travel(30)->minutes();
    $url = collect($this->getJson('/api/v1/siklus/siklus-arif-sawi/tugas')->json('data'))->firstWhere('id', $tugas)['foto'];
    expect($url)->not->toBe($r['url']);
    $this->get($url)->assertOk();

    // Berkas milik pengguna lain tidak bisa ditempelkan.
    $milikLain = Berkas::forceCreate(['pemilik_id' => 'petani-budi', 'jalur' => 'berkas/x.jpg', 'jenis' => 'image/jpeg', 'ukuran_byte' => 1]);
    $tugas2 = DB::table('tugas')->where('siklus_id', 'siklus-arif-sawi')->where('status', 'belum')->where('tipe', 'sekali')->value('id');
    $this->postJson("/api/v1/tugas/{$tugas2}/selesai", ['kunci_idempoten' => 'f-2', 'foto' => "berkas:{$milikLain->id}"])
        ->assertStatus(422);
});

it('tidak ada berkas pengguna di folder publik', function () {
    unggahBerkas(UploadedFile::fake()->image('c.jpg'))->assertOk();
    $publik = collect(File::allFiles(public_path()))->map(fn ($f) => $f->getRelativePathname())
        ->filter(fn ($n) => str_contains($n, 'berkas'));
    expect($publik->all())->toBe([]);
    expect(config('filesystems.disks.local.root'))->toBe(storage_path('app/private'));
});

it('foto profil dan foto hasil panen kiriman memakai berkas yang sama caranya', function () {
    $r = unggahBerkas(UploadedFile::fake()->image('profil.webp'))->assertOk()->json('data');
    $akun = $this->patchJson('/api/v1/akun', ['foto_profil' => $r['url']])->assertOk()->json('data');
    expect(DB::table('pengguna')->where('id', 'petani-arif')->value('foto_profil'))->toBe("berkas:{$r['id']}")
        ->and($akun['pengguna']['foto_profil'])->toStartWith("/api/v1/berkas/{$r['id']}/unduh?");

    $foto = unggahBerkas(UploadedFile::fake()->image('panen.jpg'))->assertOk()->json('data');
    $k = $this->postJson('/api/v1/kiriman/kiriman-ratna-arif-1/foto-kualitas', ['foto' => $foto['url']])->assertOk()->json('data');
    expect(DB::table('pengiriman')->where('id', 'kiriman-ratna-arif-1')->value('foto_kualitas'))->toBe("berkas:{$foto['id']}");
    $this->get($k['foto_kualitas'])->assertOk();
});
