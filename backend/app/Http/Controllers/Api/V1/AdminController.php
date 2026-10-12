<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Galat\GalatApi;
use App\Http\Respons;
use App\Models\Pengguna;
use App\Models\ProfilPembeli;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Panel admin (kontrak 3.10): verifikasi pembeli (P0-02). Endpoint admin lain menyusul setelah lomba. */
class AdminController extends Controller
{
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

    /** @return array<string, mixed> `PembeliUntukAdmin`: profil pembeli dengan nama dan nomor HP */
    private static function bentuk(ProfilPembeli $x): array
    {
        $u = Pengguna::findOrFail($x->pengguna_id);
        $data = $x->toArray();
        unset($data['dibuat_pada']);

        return $data + ['nama' => $u->nama, 'nomor_hp' => $u->nomor_hp];
    }
}
