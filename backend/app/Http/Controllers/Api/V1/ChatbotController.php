<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\AI\PemeriksaPagarAI;
use App\Domain\AI\PencariPengetahuan;
use App\Domain\AI\PenyediaAI;
use App\Http\Controllers\Controller;
use App\Http\Galat\GalatApi;
use App\Models\ObrolanBot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Throwable;

class ChatbotController extends Controller
{
    public function __construct(
        protected PenyediaAI $ai,
        protected PencariPengetahuan $pencari,
        protected PemeriksaPagarAI $pagar
    ) {}

    /**
     * POST /api/v1/chatbot
     */
    public function tanya(Request $request): JsonResponse
    {
        $pengguna = $request->user();
        if (! $pengguna) {
            throw new GalatApi('BELUM_MASUK');
        }

        // F-00: Persetujuan AI diminta sekali sebelum dipakai
        if (empty($pengguna->setuju_ai_pada)) {
            throw new GalatApi('PERSETUJUAN_AI_WAJIB');
        }

        $validated = $request->validate([
            'pesan' => ['required', 'string', 'max:1000'],
            'percakapan_id' => ['nullable', 'string', 'max:64'],
        ]);

        $pesan = trim($validated['pesan']);
        $percakapanId = $validated['percakapan_id'] ?? (string) Str::ulid();

        // Cari di basis pengetahuan
        $hasilPencarian = $this->pencari->cari($pesan, 5);
        $potonganList = $hasilPencarian['potongan'];
        $metode = $hasilPencarian['metode'];

        $sumberDikutip = [];
        foreach ($potonganList as $p) {
            $sumberDikutip[] = [
                'judul' => $p->sumber->judul ?? 'Panduan Tani Muda',
                'potongan' => mb_substr($p->isi, 0, 200).'...',
            ];
        }

        if (empty($potonganList)) {
            $jawabanTeks = 'Belum ada di panduan Tani Muda. Tanyakan ke penyuluh lewat tombol di bawah.';
        } else {
            $konteksTeks = '';
            foreach ($potonganList as $idx => $p) {
                $judul = $p->sumber->judul ?? 'Panduan';
                $konteksTeks .= '['.($idx + 1)."] {$judul}: {$p->isi}\n\n";
            }

            $promptSistem = 'Kamu adalah asisten Tanya Tani Muda. Jawablah pertanyaan petani secara ringkas dan ramah dengan sapaan "kamu". '.
                'Jawablah HANYA berdasarkan konteks panduan Tani Muda yang diberikan di bawah ini. '.
                "Jika informasi tidak ada di konteks, jawab: 'Belum ada di panduan Tani Muda. Tanyakan ke penyuluh lewat tombol di bawah.'\n".
                'PAGAR KETAT: Dilarang menyebutkan takaran dosis pestisida/kimia (misal ml/liter, g/tangki) dan dilarang menyebut nama merek dagang pestisida. Berikan tindakan budidaya yang aman.';

            $promptPengguna = "Pertanyaan: {$pesan}\n\nKonteks:\n{$konteksTeks}";

            try {
                $resp = $this->ai->teks([
                    ['role' => 'system', 'content' => $promptSistem],
                    ['role' => 'user', 'content' => $promptPengguna],
                ]);
                $rawJawaban = $resp->konten;
            } catch (Throwable) {
                // Driver tiruan atau fallback bila AI tidak tersedia
                $rawJawaban = 'Halo petani muda! Pastikan kebutuhan air dan nutrisi tanamanmu tercukupi dengan baik sesuai jadwal perawatan di Tani Muda.';
            }

            // Periksa pagar AI (dosis & merek)
            $pelanggaran = $this->pagar->periksaTeks($rawJawaban);
            if ($pelanggaran['ada_pelanggaran']) {
                $jawabanTeks = 'Tindakan yang disarankan: isolasi tanaman atau pangkas daun yang bergejala, perbaiki sirkulasi udara dan sanitasi lahan. Untuk penanganan obat/pestisida yang tepat, silakan konsultasikan dengan petugas penyuluh pertanian setempat.';
            } else {
                $jawabanTeks = $rawJawaban;
            }
        }

        // Simpan pesan pengguna
        ObrolanBot::create([
            'id' => (string) Str::ulid(),
            'pengguna_id' => $pengguna->id,
            'percakapan_bot_id' => $percakapanId,
            'peran' => 'user',
            'isi' => $pesan,
            'sumber' => null,
            'dibuat_pada' => now(),
        ]);

        // Simpan pesan bot
        ObrolanBot::create([
            'id' => (string) Str::ulid(),
            'pengguna_id' => $pengguna->id,
            'percakapan_bot_id' => $percakapanId,
            'peran' => 'assistant',
            'isi' => $jawabanTeks,
            'sumber' => $sumberDikutip,
            'dibuat_pada' => now(),
        ]);

        return response()->json([
            'data' => [
                'jawaban' => $jawabanTeks,
                'sumber' => $sumberDikutip,
                'percakapan_id' => $percakapanId,
                'metode_pencarian' => $metode,
            ],
        ]);
    }

    /**
     * GET /api/v1/chatbot/riwayat
     */
    public function riwayat(Request $request): JsonResponse
    {
        $pengguna = $request->user();
        if (! $pengguna) {
            throw new GalatApi('BELUM_MASUK');
        }

        $percakapanId = $request->query('percakapan_id');

        $query = ObrolanBot::where('pengguna_id', $pengguna->id);
        if (! empty($percakapanId)) {
            $query->where('percakapan_bot_id', $percakapanId);
        }

        $riwayat = $query->orderBy('dibuat_pada', 'asc')->get();

        return response()->json([
            'data' => $riwayat,
        ]);
    }
}
