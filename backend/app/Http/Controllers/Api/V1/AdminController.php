<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\JenisCatatan;
use App\Enums\StatusAkun;
use App\Http\Controllers\Controller;
use App\Http\Galat\GalatApi;
use App\Http\Respons;
use App\Models\CatatanPetani;
use App\Models\Pengguna;
use App\Models\Pengiriman;
use App\Models\ProfilPembeli;
use App\Models\SiklusTanam;
use App\Models\Wilayah;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Panel admin (kontrak 3.10, D-03, D-13, D-46, D-47): verifikasi pembeli (P0-02), daftar dan
 * detail petani, catatan dan status petani [AG-51]. Semua rute di grup `peran:admin`; peran lain 403.
 */
class AdminController extends Controller
{
    private const ISI_CATATAN_MAKS = 1000;

    /** GET /admin/pembeli?status=menunggu */
    public function pembeliMenunggu(): JsonResponse
    {
        return Respons::data(ProfilPembeli::where('status_verifikasi', 'menunggu')->orderBy('dibuat_pada')->get()
            ->map(fn (ProfilPembeli $x) => self::bentuk($x))->all());
    }

    /** POST /admin/pembeli/{id}/verifikasi: `{ keputusan, alasan? }`; alasan wajib bila ditolak. */
    public function verifikasi(Request $request, string $id): JsonResponse
    {
        $profil = ProfilPembeli::find($id) ?? throw new GalatApi('TIDAK_DITEMUKAN');
        $keputusan = $request->input('keputusan');
        if (! in_array($keputusan, ['terverifikasi', 'ditolak'], true)) {
            throw GalatApi::validasi(['keputusan' => 'VALIDASI']);
        }
        $alasan = trim((string) $request->input('alasan'));
        if ($keputusan === 'ditolak' && $alasan === '') {
            throw GalatApi::validasi(['alasan' => 'VALIDASI']);
        }
        $profil->forceFill(['status_verifikasi' => $keputusan, 'alasan_ditolak' => $keputusan === 'ditolak' ? $alasan : null])->save();

        return Respons::data(self::bentuk($profil->refresh()));
    }

    // ------------------------------------------------------------ petani [AG-51]

    /**
     * GET /admin/petani?cari=&halaman=&per_halaman= → `Halaman<PetaniRingkasAdmin>`.
     * Tanpa nomor HP dan titik lahan (D-06, D-46); `cari` pada nama atau desa, tidak peka huruf
     * besar; terurut jumlah catatan (terbanyak dulu) lalu nama (D-47).
     */
    public function daftarPetani(Request $request): JsonResponse
    {
        $cari = mb_strtolower(trim((string) $request->query('cari')));
        $petani = Pengguna::where('peran', 'petani')->get();
        $desa = Wilayah::whereIn('id', $petani->pluck('wilayah_id')->filter()->unique()->values())->pluck('desa', 'id');
        $catatan = CatatanPetani::selectRaw('petani_id, count(*) as n')->groupBy('petani_id')->pluck('n', 'petani_id');
        $siklus = SiklusTanam::where('status', 'aktif')->selectRaw('petani_id, count(*) as n')->groupBy('petani_id')->pluck('n', 'petani_id');
        $daftar = $petani
            ->map(fn (Pengguna $u) => [
                'id' => $u->id,
                'nama' => $u->nama,
                'desa' => $u->wilayah_id ? ($desa[$u->wilayah_id] ?? null) : null,
                'status_akun' => $u->status_akun->value,
                'jumlah_catatan' => (int) ($catatan[$u->id] ?? 0),
                'siklus_aktif' => (int) ($siklus[$u->id] ?? 0),
            ])
            ->filter(fn (array $x) => $cari === ''
                || str_contains(mb_strtolower((string) $x['nama']), $cari)
                || str_contains(mb_strtolower((string) $x['desa']), $cari))
            ->sort(fn (array $a, array $b) => [$b['jumlah_catatan'], (string) $a['nama']] <=> [$a['jumlah_catatan'], (string) $b['nama']])
            ->values();
        ['halaman' => $halaman, 'per_halaman' => $per] = Respons::paginasi($request);

        return Respons::halaman(new LengthAwarePaginator($daftar->forPage($halaman, $per)->values(), $daftar->count(), $per, $halaman));
    }

    /** GET /admin/petani/{id} → `PetaniUntukAdmin` `{ pengguna, catatan }`; bukan petani → 404. */
    public function petani(string $id): JsonResponse
    {
        return Respons::data(self::bentukPetani(self::cariPetani($id)));
    }

    /**
     * POST /admin/petani/{id}/catatan `{ jenis, isi, pengiriman_id? }` → `CatatanPetani` (D-03).
     * Jenis hanya `tidak_memberi_kabar` atau `lainnya`; catatan terlihat petani di profilnya.
     */
    public function tulisCatatan(Request $request, string $id): JsonResponse
    {
        $petani = self::cariPetani($id);
        $salah = [];
        $jenis = $request->input('jenis');
        if (! is_string($jenis) || JenisCatatan::tryFrom($jenis) === null) {
            $salah['jenis'] = 'VALIDASI';
        }
        $isi = trim((string) $request->input('isi'));
        if ($isi === '' || mb_strlen($isi) > self::ISI_CATATAN_MAKS) {
            $salah['isi'] = 'VALIDASI';
        }
        $kirimanId = $request->input('pengiriman_id');
        if ($kirimanId !== null && (! is_string($kirimanId) || ! Pengiriman::whereKey($kirimanId)->exists())) {
            $salah['pengiriman_id'] = 'VALIDASI';
        }
        if ($salah) {
            throw GalatApi::validasi($salah);
        }
        $catatan = CatatanPetani::forceCreate([
            'petani_id' => $petani->id,
            'jenis' => $jenis,
            'pengiriman_id' => $kirimanId,
            'isi' => $isi,
        ]);

        return Respons::data($catatan->refresh()->toArray());
    }

    /**
     * POST /admin/petani/{id}/status `{ status_akun }` → `PetaniUntukAdmin` (D-13). Hanya untuk
     * petani; mengirim status yang sama lagi tidak mengubah apa pun (idempoten).
     */
    public function ubahStatusPetani(Request $request, string $id): JsonResponse
    {
        $status = $request->input('status_akun');
        $baru = is_string($status) ? StatusAkun::tryFrom($status) : null;
        $petani = DB::transaction(function () use ($id, $baru) {
            $petani = Pengguna::whereKey($id)->where('peran', 'petani')->lockForUpdate()->first()
                ?? throw new GalatApi('TIDAK_DITEMUKAN');
            if ($baru === null) {
                throw GalatApi::validasi(['status_akun' => 'VALIDASI']);
            }
            if ($petani->status_akun !== $baru) {
                $petani->forceFill(['status_akun' => $baru])->save();
            }

            return $petani;
        });

        return Respons::data(self::bentukPetani($petani));
    }

    private static function cariPetani(string $id): Pengguna
    {
        return Pengguna::whereKey($id)->where('peran', 'petani')->first() ?? throw new GalatApi('TIDAK_DITEMUKAN');
    }

    /** @return array{pengguna: array<string, mixed>, catatan: list<array<string, mixed>>} `PetaniUntukAdmin` */
    private static function bentukPetani(Pengguna $u): array
    {
        $u->refresh();

        return [
            'pengguna' => $u->withoutRelations()->toArray(),
            'catatan' => CatatanPetani::where('petani_id', $u->id)->orderBy('dibuat_pada')->get()
                ->map(fn (CatatanPetani $c) => $c->toArray())->values()->all(),
        ];
    }

    /** @return array<string, mixed> `PembeliUntukAdmin`: profil pembeli dengan nama dan nomor HP */
    private static function bentuk(ProfilPembeli $x): array
    {
        $u = Pengguna::findOrFail($x->pengguna_id);
        $data = $x->toArray();
        unset($data['dibuat_pada']);

        return $data + ['nama' => $u->nama, 'nomor_hp' => $u->nomor_hp];
    }
}
