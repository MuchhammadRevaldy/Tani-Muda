<?php

namespace App\Domain\AI;

use Illuminate\Support\Facades\DB;

/**
 * Pemeriksa pagar keamanan untuk keluaran AI (PRD Tambahan F-04, F-05).
 * Menolak/menyaring pola dosis pestisida/obat dan nama merek dagang dari tabel merek_input.
 */
class PemeriksaPagarAI
{
    /**
     * Pola dosis yang dilarang muncul pada saran AI (angka + satuan + per ...).
     */
    private const POLA_DOSIS = [
        '/\b\d+(?:[.,]\d+)?\s*(?:ml|mili|liter|l|gram|gr|g|kg|sendok|tetes|cc)\s*(?:per|\/)\s*(?:liter|l|tangki|pohon|tanaman|m2|m²|ha|bedeng|air)\b/iu',
        '/\b\d+(?:[.,]\d+)?\s*(?:ml|mili|liter|l|gram|gr|g|kg|cc)\s*(?:dilarutkan|dicampur|disemprotkan)\b/iu',
        '/\bdosis\s*(?::|\s)\s*\d+/iu',
    ];

    /**
     * Cek apakah teks memuat pola dosis.
     */
    public static function memuatDosis(string $teks): bool
    {
        foreach (self::POLA_DOSIS as $pola) {
            if (preg_match($pola, $teks)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Cek apakah teks memuat nama merek dari tabel merek_input.
     * Mengembalikan nama merek bila ditemukan, atau null bila bersih.
     */
    public static function temukanMerek(string $teks): ?string
    {
        static $daftarMerek = null;
        if ($daftarMerek === null) {
            try {
                $daftarMerek = DB::table('merek_input')->pluck('nama')->all();
            } catch (\Throwable) {
                $daftarMerek = [];
            }
        }

        $teksKecil = mb_strtolower($teks);
        foreach ($daftarMerek as $merek) {
            $merekKecil = mb_strtolower(trim((string) $merek));
            if ($merekKecil === '') {
                continue;
            }
            // Cocokkan sebagai kata utuh
            if (preg_match('/\b'.preg_quote($merekKecil, '/').'\b/iu', $teksKecil)) {
                return $merek;
            }
        }

        return null;
    }

    /**
     * @return array{ada_pelanggaran: bool, ada_dosis: bool, merek: ?string}
     */
    public static function periksaTeks(string $teks): array
    {
        $dosis = self::memuatDosis($teks);
        $merek = self::temukanMerek($teks);

        return [
            'ada_pelanggaran' => $dosis || ($merek !== null),
            'ada_dosis' => $dosis,
            'merek' => $merek,
        ];
    }

    /**
     * Memeriksa dan menyaring hasil deteksi tanaman.
     * Bila memuat pola dosis atau nama merek dagang, langkah tindakan diganti teks umum yang aman
     * dan perlu_penyuluh disetel ke true.
     *
     * @param  array<string, mixed>  $hasil
     * @return array<string, mixed>
     */
    public static function saringHasilDeteksi(array $hasil): array
    {
        $seluruhTeks = json_encode($hasil, JSON_UNESCAPED_UNICODE) ?: '';

        $terdapatDosis = self::memuatDosis($seluruhTeks);
        $merekDitemukan = self::temukanMerek($seluruhTeks);

        if ($terdapatDosis || $merekDitemukan !== null) {
            $hasil['langkah_aman'] = [
                'Isolasi tanaman atau pangkas daun yang bergejala agar tidak menyebar ke tanaman sehat.',
                'Perbaiki sirkulasi udara dan kurangi kelembapan di sekitar tanaman.',
                'Siram langsung ke media tanah, hindari membasahi daun secara berlebihan.',
                'Konsultasikan dengan petugas penyuluh pertanian lapangan untuk penanganan obat atau tindakan khusus.',
            ];
            $hasil['perlu_penyuluh'] = true;
            $alasan = $terdapatDosis ? 'pola dosis' : "nama produk ({$merekDitemukan})";
            $hasil['catatan'] = trim(($hasil['catatan'] ?? '')." [Pemberitahuan sistem: Langkah tindakan disesuaikan karena memuat rujukan {$alasan}. Gunakan anjuran resmi penyuluh untuk obat kimia.]");
        }

        // Pastikan skema dasar terpenuhi
        if (! isset($hasil['dugaan']) || ! is_array($hasil['dugaan'])) {
            $hasil['dugaan'] = [
                ['nama' => 'Gejala belum teridentifikasi pasti', 'keyakinan' => 'rendah', 'alasan' => 'Foto memerlukan pemeriksaan lebih lanjut.'],
            ];
        }

        if (! isset($hasil['gejala_terlihat']) || ! is_array($hasil['gejala_terlihat'])) {
            $hasil['gejala_terlihat'] = ['Perubahan warna atau bentuk daun/batang'];
        }

        if (! isset($hasil['langkah_aman']) || ! is_array($hasil['langkah_aman'])) {
            $hasil['langkah_aman'] = ['Jaga kebersihan kebun dan amati perkembangan gejala.'];
        }

        $hasil['perlu_penyuluh'] = (bool) ($hasil['perlu_penyuluh'] ?? false);
        $hasil['catatan'] = (string) ($hasil['catatan'] ?? 'Konsultasikan dengan penyuluh bila gejala berlanjut.');

        return $hasil;
    }
}
