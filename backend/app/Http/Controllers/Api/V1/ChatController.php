<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\JenisPercakapan;
use App\Enums\Peran;
use App\Http\Controllers\Controller;
use App\Http\Galat\GalatApi;
use App\Http\Respons;
use App\Models\AlokasiPesanan;
use App\Models\Pengguna;
use App\Models\Percakapan;
use App\Models\Pesan;
use App\Models\Pesanan;
use App\Models\PesananStok;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Controller untuk F-09: Chat petani dan pembeli (D-64).
 */
class ChatController extends Controller
{
    /**
     * GET /percakapan
     * Menampilkan daftar percakapan pengguna yang sedang masuk.
     */
    public function daftar(Request $request): JsonResponse
    {
        $this->pastikanFiturAktif();
        $user = $this->pengguna($request);

        $percakapanList = Percakapan::query()
            ->where(function ($q) use ($user) {
                $q->where('petani_id', $user->id)
                    ->orWhere('pembeli_id', $user->id);
            })
            ->with(['petani', 'pembeli', 'pesanTerakhir'])
            ->get();

        $hasil = $percakapanList->map(function (Percakapan $p) use ($user) {
            $lawan = $p->petani_id === $user->id ? $p->pembeli : $p->petani;
            $belumDibaca = $p->pesan()
                ->where('pengirim_id', '!=', $user->id)
                ->whereNull('dibaca_pada')
                ->count();

            $terakhir = $p->pesanTerakhir;

            return [
                'id' => $p->id,
                'jenis' => $p->jenis->value,
                'rujukan_id' => $p->rujukan_id,
                'lawan_bicara' => [
                    'id' => $lawan->id,
                    'nama' => $lawan->nama ?? 'Pengguna Tani Muda',
                    'peran' => $lawan->peran?->value,
                    'foto_profil' => $lawan->foto_profil,
                ],
                'pesan_terakhir' => $terakhir ? [
                    'id' => $terakhir->id,
                    'isi' => $terakhir->isi,
                    'pengirim_id' => $terakhir->pengirim_id,
                    'dibaca_pada' => $terakhir->dibaca_pada?->toISOString(),
                    'dibuat_pada' => $terakhir->dibuat_pada->toISOString(),
                ] : null,
                'jumlah_belum_dibaca' => $belumDibaca,
                'dibuat_pada' => $p->dibuat_pada->toISOString(),
            ];
        })->sortByDesc(fn ($item) => $item['pesan_terakhir']['dibuat_pada'] ?? $item['dibuat_pada'])
            ->values()
            ->all();

        return Respons::data($hasil);
    }

    /**
     * POST /percakapan
     * Buka percakapan baru atau ambil percakapan yang sudah ada.
     */
    public function bukaAtauAmbil(Request $request): JsonResponse
    {
        $this->pastikanFiturAktif();
        $user = $this->pengguna($request);

        $lawanBicaraId = (string) $request->input('lawan_bicara_id');
        $jenisStr = (string) $request->input('jenis', 'peta');
        $rujukanId = $request->input('rujukan_id') ? (string) $request->input('rujukan_id') : null;

        if (! $lawanBicaraId && $jenisStr === 'alokasi' && $rujukanId) {
            $alokasi = AlokasiPesanan::find($rujukanId);
            if ($alokasi) {
                $pesanan = Pesanan::find($alokasi->pesanan_id);
                if ($pesanan) {
                    $lawanBicaraId = $user->peran === Peran::Petani ? $pesanan->pembeli_id : $alokasi->petani_id;
                }
            }
        } elseif (! $lawanBicaraId && $jenisStr === 'pesanan_stok' && $rujukanId) {
            $pesananStok = PesananStok::find($rujukanId);
            if ($pesananStok) {
                $lawanBicaraId = $user->peran === Peran::Petani ? $pesananStok->pembeli_id : $pesananStok->petani_id;
            }
        }

        $lawan = Pengguna::find($lawanBicaraId);
        if (! $lawan) {
            throw new GalatApi('TIDAK_DITEMUKAN');
        }

        if ($user->id === $lawan->id) {
            throw GalatApi::validasi(['lawan_bicara_id' => 'VALIDASI']);
        }

        // Tentukan siapa petani dan siapa pembeli
        $petaniId = null;
        $pembeliId = null;

        if ($user->peran === Peran::Petani && $lawan->peran === Peran::Pembeli) {
            $petaniId = $user->id;
            $pembeliId = $lawan->id;
        } elseif ($user->peran === Peran::Pembeli && $lawan->peran === Peran::Petani) {
            $pembeliId = $user->id;
            $petaniId = $lawan->id;
        } else {
            // Percakapan hanya antar petani dan pembeli
            throw new GalatApi('TIDAK_DIIZINKAN');
        }

        $jenis = JenisPercakapan::tryFrom($jenisStr) ?? JenisPercakapan::Peta;

        // Cari percakapan yang sudah ada
        $percakapan = Percakapan::query()
            ->where('petani_id', $petaniId)
            ->where('pembeli_id', $pembeliId)
            ->where('jenis', $jenis->value)
            ->where('rujukan_id', $rujukanId)
            ->first();

        if (! $percakapan) {
            $percakapan = new Percakapan;
            $percakapan->forceFill([
                'petani_id' => $petaniId,
                'pembeli_id' => $pembeliId,
                'jenis' => $jenis,
                'rujukan_id' => $rujukanId,
            ]);
            $percakapan->save();
        }

        return Respons::data([
            'id' => $percakapan->id,
            'jenis' => $percakapan->jenis->value,
            'rujukan_id' => $percakapan->rujukan_id,
            'lawan_bicara' => [
                'id' => $lawan->id,
                'nama' => $lawan->nama ?? 'Pengguna Tani Muda',
                'peran' => $lawan->peran->value,
                'foto_profil' => $lawan->foto_profil,
            ],
            'dibuat_pada' => $percakapan->dibuat_pada->toISOString(),
        ]);
    }

    /**
     * GET /percakapan/{id}/pesan?setelah=
     * Ambil riwayat pesan dalam percakapan.
     */
    public function pesan(Request $request, string $id): JsonResponse
    {
        $this->pastikanFiturAktif();
        $user = $this->pengguna($request);

        $percakapan = Percakapan::find($id);
        if (! $percakapan) {
            throw new GalatApi('TIDAK_DITEMUKAN');
        }

        // Akses silang: hanya peserta (atau admin) yang bisa membaca
        if ($user->id !== $percakapan->petani_id && $user->id !== $percakapan->pembeli_id && $user->peran !== Peran::Admin) {
            throw new GalatApi('TIDAK_DITEMUKAN');
        }

        $kueri = $percakapan->pesan()->orderBy('dibuat_pada', 'asc');

        if ($request->has('setelah') && $request->input('setelah')) {
            $setelah = (string) $request->input('setelah');
            // Jika dikirim ISO string waktu
            if (str_contains($setelah, 'T') || str_contains($setelah, '-')) {
                $kueri->where('dibuat_pada', '>', Carbon::parse($setelah));
            } else {
                // Jika ID pesan
                $pesanRef = Pesan::find($setelah);
                if ($pesanRef) {
                    $kueri->where(function ($q) use ($pesanRef) {
                        $q->where('dibuat_pada', '>', $pesanRef->dibuat_pada)
                            ->orWhere(function ($sq) use ($pesanRef) {
                                $sq->where('dibuat_pada', '=', $pesanRef->dibuat_pada)
                                    ->where('id', '>', $pesanRef->id);
                            });
                    });
                }
            }
        }

        $daftarPesan = $kueri->get()->map(fn (Pesan $p) => [
            'id' => $p->id,
            'percakapan_id' => $p->percakapan_id,
            'pengirim_id' => $p->pengirim_id,
            'isi' => $p->isi,
            'dibaca_pada' => $p->dibaca_pada?->toISOString(),
            'dibuat_pada' => $p->dibuat_pada->toISOString(),
        ])->all();

        return Respons::data($daftarPesan);
    }

    /**
     * POST /percakapan/{id}/pesan
     * Kirim pesan dalam percakapan (idempoten).
     */
    public function kirimPesan(Request $request, string $id): JsonResponse
    {
        $this->pastikanFiturAktif();
        $user = $this->pengguna($request);

        $percakapan = Percakapan::find($id);
        if (! $percakapan) {
            throw new GalatApi('TIDAK_DITEMUKAN');
        }

        // Akses silang: hanya peserta yang bisa mengirim pesan
        if ($user->id !== $percakapan->petani_id && $user->id !== $percakapan->pembeli_id) {
            throw new GalatApi('TIDAK_DITEMUKAN');
        }

        $isi = trim((string) $request->input('isi', ''));
        $panjang = mb_strlen($isi);
        if ($panjang < 1 || $panjang > 1000) {
            throw GalatApi::validasi(['isi' => 'VALIDASI']);
        }

        $kunciIdempoten = $request->input('kunci_idempoten');
        if ($kunciIdempoten) {
            $pesanLama = Pesan::query()
                ->where('percakapan_id', $percakapan->id)
                ->where('kunci_idempoten', $kunciIdempoten)
                ->first();

            if ($pesanLama) {
                return Respons::data([
                    'id' => $pesanLama->id,
                    'percakapan_id' => $pesanLama->percakapan_id,
                    'pengirim_id' => $pesanLama->pengirim_id,
                    'isi' => $pesanLama->isi,
                    'dibaca_pada' => $pesanLama->dibaca_pada?->toISOString(),
                    'dibuat_pada' => $pesanLama->dibuat_pada->toISOString(),
                ]);
            }
        }

        $pesan = new Pesan;
        $pesan->forceFill([
            'percakapan_id' => $percakapan->id,
            'pengirim_id' => $user->id,
            'isi' => $isi,
            'kunci_idempoten' => $kunciIdempoten ? (string) $kunciIdempoten : null,
        ]);
        $pesan->save();

        return Respons::data([
            'id' => $pesan->id,
            'percakapan_id' => $pesan->percakapan_id,
            'pengirim_id' => $pesan->pengirim_id,
            'isi' => $pesan->isi,
            'dibaca_pada' => null,
            'dibuat_pada' => $pesan->dibuat_pada->toISOString(),
        ]);
    }

    /**
     * POST /percakapan/{id}/dibaca
     * Tandai pesan lawan bicara sudah dibaca.
     */
    public function tandaiDibaca(Request $request, string $id): JsonResponse
    {
        $this->pastikanFiturAktif();
        $user = $this->pengguna($request);

        $percakapan = Percakapan::find($id);
        if (! $percakapan) {
            throw new GalatApi('TIDAK_DITEMUKAN');
        }

        if ($user->id !== $percakapan->petani_id && $user->id !== $percakapan->pembeli_id) {
            throw new GalatApi('TIDAK_DITEMUKAN');
        }

        $jumlah = Pesan::query()
            ->where('percakapan_id', $percakapan->id)
            ->where('pengirim_id', '!=', $user->id)
            ->whereNull('dibaca_pada')
            ->update(['dibaca_pada' => now()]);

        return Respons::data([
            'status' => 'ok',
            'jumlah_dibaca' => $jumlah,
        ]);
    }

    /**
     * GET /percakapan/lencana
     * Menghitung total pesan belum dibaca untuk lencana menu.
     */
    public function lencana(Request $request): JsonResponse
    {
        $this->pastikanFiturAktif();
        $user = $this->pengguna($request);

        $totalBelumDibaca = Pesan::query()
            ->whereHas('percakapan', function ($q) use ($user) {
                $q->where('petani_id', $user->id)
                    ->orWhere('pembeli_id', $user->id);
            })
            ->where('pengirim_id', '!=', $user->id)
            ->whereNull('dibaca_pada')
            ->count();

        return Respons::data([
            'belum_dibaca' => $totalBelumDibaca,
        ]);
    }

    private function pengguna(Request $request): Pengguna
    {
        /** @var Pengguna */
        return $request->user();
    }

    private function pastikanFiturAktif(): void
    {
        if (! config('fitur.chat', true)) {
            throw new GalatApi('BELUM_TERSEDIA');
        }
    }
}
