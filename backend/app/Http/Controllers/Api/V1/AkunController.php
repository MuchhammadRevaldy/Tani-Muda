<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Otp\LayananOtp;
use App\Enums\JenisUsaha;
use App\Enums\Peran;
use App\Enums\StatusVerifikasi;
use App\Http\Bentuk\BentukAkun;
use App\Http\Controllers\Controller;
use App\Http\Galat\GalatApi;
use App\Http\Respons;
use App\Models\Pengguna;
use App\Models\ProfilPembeli;
use App\Models\Wilayah;
use App\Support\NomorHp;
use DateTimeZone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/** Akun pengguna yang sedang masuk (kontrak-api.md 3.1). */
class AkunController extends Controller
{
    /** GET /akun */
    public function ambil(Request $request): JsonResponse
    {
        return Respons::data(BentukAkun::dari($this->pengguna($request)));
    }

    /** PUT /akun/peran: hanya sekali, saat peran masih kosong. Admin tidak bisa dipilih sendiri. */
    public function pilihPeran(Request $request): JsonResponse
    {
        $p = $this->pengguna($request);
        if ($p->peran !== null) {
            throw new GalatApi('STATUS_TIDAK_SESUAI');
        }
        $peran = $request->input('peran');
        if (! in_array($peran, [Peran::Petani->value, Peran::Pembeli->value, Peran::Mentor->value], true)) {
            throw GalatApi::validasi(['peran' => 'VALIDASI']);
        }
        $nama = trim((string) $request->input('nama'));
        if ($nama === '') {
            throw GalatApi::validasi(['nama' => 'VALIDASI']);
        }
        $wilayahId = $request->input('wilayah_id');
        if ($peran === Peran::Petani->value && ! self::wilayahAda($wilayahId)) {
            throw GalatApi::validasi(['wilayah_id' => 'WILAYAH_WAJIB']);
        }
        if ($wilayahId !== null && ! self::wilayahAda($wilayahId)) {
            throw GalatApi::validasi(['wilayah_id' => 'TIDAK_DITEMUKAN']);
        }
        if ($peran === Peran::Petani->value && ! self::wilayahTersedia($wilayahId)) {
            throw GalatApi::validasi(['wilayah_id' => 'WILAYAH_BELUM_TERSEDIA']);
        }
        $p->forceFill(['peran' => $peran, 'nama' => $nama, 'wilayah_id' => $wilayahId])->save();

        return Respons::data(BentukAkun::dari($p));
    }

    /** PATCH /akun */
    public function ubah(Request $request): JsonResponse
    {
        $p = $this->pengguna($request);
        $ubah = [];
        if ($request->has('nama')) {
            $nama = trim((string) $request->input('nama'));
            if ($nama === '') {
                throw GalatApi::validasi(['nama' => 'VALIDASI']);
            }
            $ubah['nama'] = $nama;
        }
        if ($request->has('wilayah_id')) {
            $wilayahId = $request->input('wilayah_id');
            if (! self::wilayahAda($wilayahId)) {
                throw GalatApi::validasi(['wilayah_id' => 'TIDAK_DITEMUKAN']);
            }
            if ($p->peran === Peran::Petani && ! self::wilayahTersedia($wilayahId)) {
                throw GalatApi::validasi(['wilayah_id' => 'WILAYAH_BELUM_TERSEDIA']);
            }
            $ubah['wilayah_id'] = $wilayahId;
        }
        if ($request->has('zona_waktu')) {
            $zona = $request->input('zona_waktu');
            if (! is_string($zona) || ! in_array($zona, DateTimeZone::listIdentifiers(), true)) {
                throw GalatApi::validasi(['zona_waktu' => 'VALIDASI']);
            }
            $ubah['zona_waktu'] = $zona;
        }
        if ($request->has('terdaftar_kelompok_tani')) {
            $ubah['terdaftar_kelompok_tani'] = $request->input('terdaftar_kelompok_tani') === true;
        }
        if ($request->has('foto_profil')) {
            $foto = $request->input('foto_profil');
            $ubah['foto_profil'] = is_string($foto) ? $foto : null;
        }
        $p->forceFill($ubah)->save();

        return Respons::data(BentukAkun::dari($p));
    }

    /** POST /akun/nomor-hp/otp: kode dikirim ke nomor baru. */
    public function otpNomorBaru(Request $request, LayananOtp $otp): JsonResponse
    {
        $p = $this->pengguna($request);
        $nomorHp = NomorHp::wajib($request->input('nomor_hp'));
        $this->periksaNomorBaru($p, $nomorHp);

        return Respons::data($otp->kirim($nomorHp));
    }

    /** PUT /akun/nomor-hp: semua sesi lain pengguna ini diakhiri (D-45). */
    public function gantiNomor(Request $request, LayananOtp $otp): JsonResponse
    {
        $p = $this->pengguna($request);
        $nomorHp = NomorHp::wajib($request->input('nomor_hp'));
        $kode = $request->input('kode');
        if (! is_string($kode) || ! preg_match('/^\d{6}$/', $kode)) {
            throw GalatApi::validasi(['kode' => 'OTP_SALAH']);
        }
        // Dicek lagi saat verifikasi: nomor bisa saja dipakai orang lain setelah kode dikirim.
        $this->periksaNomorBaru($p, $nomorHp);
        $otp->verifikasi($nomorHp, $kode);
        DB::transaction(function () use ($p, $nomorHp, $request) {
            $p->forceFill(['nomor_hp' => $nomorHp])->save();
            DB::table('sessions')->where('user_id', $p->id)->where('id', '!=', $request->session()->getId())->delete();
            $p->tokens()->delete();
        });
        $request->session()->regenerate();

        return Respons::data(BentukAkun::dari($p));
    }

    /** GET /akun/catatan (petani): catatan admin untuk dirinya (D-03). */
    public function catatan(Request $request): JsonResponse
    {
        return Respons::data($this->pengguna($request)->catatan()->orderBy('dibuat_pada')->get()->toArray());
    }

    /** PUT /akun/profil-pembeli (pembeli): data usaha berubah → diverifikasi ulang, kecuali sudah terverifikasi. */
    public function simpanProfilPembeli(Request $request): JsonResponse
    {
        $p = $this->pengguna($request);
        $salah = [];
        if (trim((string) $request->input('nama_usaha')) === '') {
            $salah['nama_usaha'] = 'VALIDASI';
        }
        if (JenisUsaha::tryFrom((string) $request->input('jenis_usaha')) === null) {
            $salah['jenis_usaha'] = 'VALIDASI';
        }
        if (trim((string) $request->input('alamat')) === '') {
            $salah['alamat'] = 'VALIDASI';
        }
        if (! self::wilayahAda($request->input('wilayah_id'))) {
            $salah['wilayah_id'] = 'TIDAK_DITEMUKAN';
        }
        if ($salah !== []) {
            throw GalatApi::validasi($salah);
        }
        $lama = ProfilPembeli::find($p->id);
        $profil = $lama ?? new ProfilPembeli(['pengguna_id' => $p->id]);
        $profil->forceFill([
            'pengguna_id' => $p->id,
            'nama_usaha' => trim((string) $request->input('nama_usaha')),
            'jenis_usaha' => $request->input('jenis_usaha'),
            'alamat' => trim((string) $request->input('alamat')),
            'wilayah_id' => $request->input('wilayah_id'),
            'foto_tempat_usaha' => $request->input('foto_tempat_usaha'),
            'status_verifikasi' => $lama?->status_verifikasi === StatusVerifikasi::Terverifikasi
                ? StatusVerifikasi::Terverifikasi : StatusVerifikasi::Menunggu,
            'alasan_ditolak' => null,
        ])->save();

        return Respons::data($profil->refresh()->toArray());
    }

    private function pengguna(Request $request): Pengguna
    {
        /** @var Pengguna */
        return $request->user();
    }

    private function periksaNomorBaru(Pengguna $p, string $nomorHp): void
    {
        if ($nomorHp === $p->nomor_hp) {
            throw GalatApi::validasi(['nomor_hp' => 'NOMOR_SAMA']);
        }
        if (Pengguna::where('nomor_hp', $nomorHp)->exists()) {
            throw new GalatApi('NOMOR_SUDAH_DIPAKAI');
        }
    }

    public static function wilayahAda(mixed $id): bool
    {
        return is_string($id) && Wilayah::whereKey($id)->exists();
    }

    /** Desa punya titik tengah, jadi bisa dipilih sebagai desa petani, lahan, atau titik antar (D-56). */
    public static function wilayahTersedia(mixed $id): bool
    {
        return is_string($id) && Wilayah::whereKey($id)->whereNotNull('lintang')->whereNotNull('bujur')->exists();
    }
}
