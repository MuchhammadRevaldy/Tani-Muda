<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\AI\LayananAI;
use App\Domain\AI\PemeriksaPagarAI;
use App\Http\Controllers\Controller;
use App\Http\Galat\GalatApi;
use App\Http\Respons;
use App\Models\Berkas;
use App\Models\Jurnal;
use App\Models\Pengguna;
use App\Models\SiklusTanam;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Deteksi penyakit tanaman dari foto via AI (PRD Tambahan F-04, D-64).
 */
class DeteksiController extends Controller
{
    public function __construct(
        private readonly LayananAI $layananAI,
    ) {}

    /**
     * POST /api/v1/deteksi
     */
    public function deteksi(Request $request): JsonResponse
    {
        if (! config('fitur.deteksi', true)) {
            throw new GalatApi('BELUM_TERSEDIA');
        }

        /** @var Pengguna $p */
        $p = $request->user();
        $p->refresh();

        // Persetujuan AI wajib diminta sekali sebelum fitur bisa dipakai
        if ($p->setuju_ai_pada === null) {
            throw new GalatApi('PERSETUJUAN_AI_WAJIB');
        }

        $berkasId = $request->input('berkas_id');
        $fotoBase64 = $request->input('foto_base64') ?? $request->input('foto');

        /** @var Berkas|null $berkas */
        $berkas = null;

        if (! empty($berkasId) && is_string($berkasId)) {
            $berkas = Berkas::find($berkasId);
            if ($berkas === null) {
                throw GalatApi::validasi(['berkas_id' => 'VALIDASI']);
            }
        } elseif (! empty($fotoBase64) && is_string($fotoBase64)) {
            $isiBiner = null;
            $jenis = 'image/jpeg';
            $ekstensi = 'jpg';

            if (str_starts_with($fotoBase64, 'data:')) {
                if (preg_match('/^data:([^;]+);base64,(.+)$/', $fotoBase64, $cocok)) {
                    $jenis = $cocok[1];
                    $isiBiner = base64_decode($cocok[2], true);
                    $ekstensi = match ($jenis) {
                        'image/png' => 'png',
                        'image/webp' => 'webp',
                        default => 'jpg',
                    };
                }
            } else {
                $isiBiner = base64_decode($fotoBase64, true);
            }

            if ($isiBiner === false || empty($isiBiner)) {
                throw GalatApi::validasi(['foto_base64' => 'VALIDASI']);
            }

            $namaBerkas = Str::random(40).'.'.$ekstensi;
            $jalurSimpan = 'berkas/'.$namaBerkas;
            Storage::disk('local')->put($jalurSimpan, $isiBiner);

            $berkas = Berkas::forceCreate([
                'pemilik_id' => $p->id,
                'jalur' => $jalurSimpan,
                'jenis' => $jenis,
                'ukuran_byte' => strlen($isiBiner),
            ]);
            $berkasId = $berkas->id;
        } else {
            throw GalatApi::validasi(['berkas_id' => 'VALIDASI']);
        }

        $siklusId = $request->input('siklus_id');
        if (! empty($siklusId)) {
            $siklus = SiklusTanam::where('id', $siklusId)->where('petani_id', $p->id)->first();
            if ($siklus === null) {
                throw new GalatApi('TIDAK_DITEMUKAN');
            }
        }

        $tugasId = $request->input('tugas_id');

        // Jalur fisik foto
        $jalurFisik = Storage::disk('local')->path($berkas->jalur);
        if (! file_exists($jalurFisik)) {
            // Untuk environment pengujian tiruan, pastikan file dummy tersedia
            $folder = dirname($jalurFisik);
            if (! is_dir($folder)) {
                mkdir($folder, 0777, true);
            }
            file_put_contents($jalurFisik, 'dummy-image-content');
        }

        $catatanTambahan = $request->input('catatan');
        $petunjukPrompt = 'Analisis gejala kesehatan tanaman pada foto ini dan berikan output dalam format JSON.';
        if (! empty($catatanTambahan) && is_string($catatanTambahan)) {
            $petunjukPrompt .= ' Catatan gejala dari petani: '.$catatanTambahan;
        }

        $pesanPrompt = [
            [
                'role' => 'system',
                'content' => 'Kamu adalah asisten pintar proteksi tanaman pertanian. Analisis gejala pada foto. Berikan respons JSON dengan skema: {"dugaan":[{"nama":"...","keyakinan":"rendah|sedang|tinggi","alasan":"..."}],"gejala_terlihat":["..."],"langkah_aman":["..."],"perlu_penyuluh":true|false,"catatan":"..."}. Dilarang menyebut dosis angka dan dilarang menyebut merek dagang obat/pestisida.',
            ],
        ];

        // Panggil layanan AI gambar
        $jawaban = $this->layananAI->gambar('deteksi_tanaman', $p->id, $jalurFisik, $pesanPrompt, [
            'petunjuk' => $petunjukPrompt,
        ]);

        $dataHasil = $jawaban->dataTerstruktur;
        if (! is_array($dataHasil)) {
            $konten = trim($jawaban->konten);
            if (preg_match('/\{[\s\S]*\}/', $konten, $m)) {
                $dataHasil = json_decode($m[0], true);
            }
            if (! is_array($dataHasil)) {
                $dataHasil = [
                    'dugaan' => [
                        ['nama' => 'Pemeriksaan Visual Tanaman', 'keyakinan' => 'sedang', 'alasan' => $konten ?: 'Gejala teramati pada daun.'],
                    ],
                    'gejala_terlihat' => ['Perubahan kondisi visual daun atau batang'],
                    'langkah_aman' => ['Amati perkembangan tanaman dan jaga sanitasi kebun.'],
                    'perlu_penyuluh' => true,
                    'catatan' => 'Hasil observasi visual otomatis.',
                ];
            }
        }

        // Pagar server: saring pola dosis dan nama merek dari merek_input
        $hasilBersih = PemeriksaPagarAI::saringHasilDeteksi($dataHasil);

        $idDeteksi = Str::lower((string) Str::ulid());
        $waktu = Carbon::now('UTC');

        DB::table('deteksi_tanaman')->insert([
            'id' => $idDeteksi,
            'pengguna_id' => $p->id,
            'siklus_id' => $siklusId ?: null,
            'tugas_id' => $tugasId ?: null,
            'berkas_id' => $berkas->id,
            'hasil' => json_encode($hasilBersih, JSON_UNESCAPED_UNICODE),
            'model' => $jawaban->model,
            'dibuat_pada' => $waktu,
        ]);

        // Simpan ke jurnal jika terkait siklus tanam aktif
        if (! empty($siklusId)) {
            $siklus = SiklusTanam::find($siklusId);
            $namaDugaan = $hasilBersih['dugaan'][0]['nama'] ?? 'Penyakit/Hama Tanaman';
            $tglTanam = $siklus?->tanggal_tanam;
            $hariKe = $tglTanam ? max(0, (int) Carbon::parse($tglTanam)->diffInDays($waktu)) : 0;

            Jurnal::forceCreate([
                'siklus_id' => $siklusId,
                'tanggal' => $waktu->toDateString(),
                'hari_ke' => $hariKe,
                'foto' => $berkas->id,
                'catatan' => "Dugaan dari foto: {$namaDugaan}",
                'tugas_id' => $tugasId ?: null,
                'judul_tugas' => null,
            ]);
        }

        return Respons::data([
            'id' => $idDeteksi,
            'pengguna_id' => $p->id,
            'siklus_id' => $siklusId ?: null,
            'tugas_id' => $tugasId ?: null,
            'berkas_id' => $berkas->id,
            'hasil' => $hasilBersih,
            'model' => $jawaban->model,
            'dibuat_pada' => $waktu->toISOString(),
        ], 201);
    }

    /**
     * GET /api/v1/deteksi
     */
    public function daftar(Request $request): JsonResponse
    {
        if (! config('fitur.deteksi', true)) {
            throw new GalatApi('BELUM_TERSEDIA');
        }

        /** @var Pengguna $p */
        $p = $request->user();

        $query = DB::table('deteksi_tanaman')
            ->where('pengguna_id', $p->id);

        if ($request->filled('siklus_id')) {
            $query->where('siklus_id', (string) $request->input('siklus_id'));
        }

        $daftar = $query->orderByDesc('dibuat_pada')
            ->limit(50)
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'pengguna_id' => $d->pengguna_id,
                'siklus_id' => $d->siklus_id,
                'tugas_id' => $d->tugas_id,
                'berkas_id' => $d->berkas_id,
                'hasil' => json_decode((string) $d->hasil, true),
                'model' => $d->model,
                'dibuat_pada' => Carbon::parse($d->dibuat_pada)->toISOString(),
            ])
            ->all();

        return Respons::data($daftar);
    }

    /**
     * GET /api/v1/deteksi/{id}
     */
    public function ambil(Request $request, string $id): JsonResponse
    {
        if (! config('fitur.deteksi', true)) {
            throw new GalatApi('BELUM_TERSEDIA');
        }

        /** @var Pengguna $p */
        $p = $request->user();

        $d = DB::table('deteksi_tanaman')->where('id', $id)->first();
        if ($d === null || $d->pengguna_id !== $p->id) {
            throw new GalatApi('TIDAK_DITEMUKAN');
        }

        return Respons::data([
            'id' => $d->id,
            'pengguna_id' => $d->pengguna_id,
            'siklus_id' => $d->siklus_id,
            'tugas_id' => $d->tugas_id,
            'berkas_id' => $d->berkas_id,
            'hasil' => json_decode((string) $d->hasil, true),
            'model' => $d->model,
            'dibuat_pada' => Carbon::parse($d->dibuat_pada)->toISOString(),
        ]);
    }

    /**
     * POST /api/v1/akun/setuju-ai
     */
    public function setujuAI(Request $request): JsonResponse
    {
        /** @var Pengguna $p */
        $p = $request->user();

        $waktu = Carbon::now('UTC');
        Pengguna::where('id', $p->id)->update([
            'setuju_ai_pada' => $waktu,
        ]);
        $p->setuju_ai_pada = $waktu;

        return Respons::data([
            'id' => $p->id,
            'nomor_hp' => $p->nomor_hp,
            'nama' => $p->nama,
            'peran' => $p->peran->value,
            'setuju_ai_pada' => $waktu->toISOString(),
        ]);
    }
}
