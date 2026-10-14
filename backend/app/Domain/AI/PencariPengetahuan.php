<?php

namespace App\Domain\AI;

use App\Models\PengetahuanPotongan;
use Throwable;

class PencariPengetahuan
{
    public function __construct(
        protected PenyediaAI $ai
    ) {}

    /**
     * Memecah teks panjang menjadi potongan-potongan dengan panjang sekitar $ukuran karakter
     * dan tumpang tindih $tumpangTindih karakter.
     *
     * @return list<string>
     */
    public static function potongTeks(string $teks, int $ukuran = 800, int $tumpangTindih = 100): array
    {
        $teks = trim(preg_replace('/\s+/', ' ', $teks) ?? '');
        $panjang = mb_strlen($teks);

        if ($panjang <= $ukuran) {
            return $panjang > 0 ? [$teks] : [];
        }

        $potongan = [];
        $awal = 0;
        $langkah = $ukuran - $tumpangTindih;

        while ($awal < $panjang) {
            $bagian = mb_substr($teks, $awal, $ukuran);
            if (mb_strlen(trim($bagian)) > 0) {
                $potongan[] = trim($bagian);
            }
            $awal += $langkah;
        }

        return $potongan;
    }

    /**
     * Menghitung skor kecocokan kata kunci (skor frekuensi kata kueri di dalam teks).
     */
    public static function hitungSkorKataKunci(string $kueri, string $teks): float
    {
        $stopWords = [
            'dan', 'di', 'ke', 'dari', 'yang', 'untuk', 'pada', 'dengan', 'adalah',
            'ini', 'itu', 'atau', 'juga', 'akan', 'bisa', 'dapat', 'saya', 'kamu',
            'apa', 'bagaimana', 'kenapa', 'mengapa', 'kapan', 'siapa', 'dimana',
        ];

        $bersihkan = fn (string $s) => preg_replace('/[^\p{L}\p{N}\s]/u', ' ', mb_strtolower($s)) ?? '';

        $kataKueri = array_filter(
            explode(' ', $bersihkan($kueri)),
            fn (string $k) => mb_strlen($k) >= 2 && ! in_array($k, $stopWords, true)
        );

        if (empty($kataKueri)) {
            $kataKueri = array_filter(explode(' ', $bersihkan($kueri)), fn ($k) => mb_strlen($k) >= 2);
        }

        if (empty($kataKueri)) {
            return 0.0;
        }

        $teksBersih = ' '.$bersihkan($teks).' ';
        $skor = 0.0;

        foreach ($kataKueri as $kata) {
            $kemunculan = substr_count($teksBersih, ' '.$kata.' ');
            if ($kemunculan > 0) {
                $skor += 1.0 + ($kemunculan * 0.5);
            } elseif (str_contains($teksBersih, $kata)) {
                $skor += 0.5;
            }
        }

        return $skor;
    }

    /**
     * Menghitung Cosine Similarity antara dua vektor embedding.
     *
     * @param  list<float>  $vecA
     * @param  list<float>  $vecB
     */
    public static function cosineSimilarity(array $vecA, array $vecB): float
    {
        $count = count($vecA);
        if ($count === 0 || $count !== count($vecB)) {
            return 0.0;
        }

        $dotProduct = 0.0;
        $normA = 0.0;
        $normB = 0.0;

        for ($i = 0; $i < $count; $i++) {
            $a = (float) $vecA[$i];
            $b = (float) $vecB[$i];
            $dotProduct += $a * $b;
            $normA += $a * $a;
            $normB += $b * $b;
        }

        if ($normA <= 0.0 || $normB <= 0.0) {
            return 0.0;
        }

        return $dotProduct / (sqrt($normA) * sqrt($normB));
    }

    /**
     * Mencari potongan pengetahuan yang paling relevan.
     * Menggunakan embedding jika tersedia di penyedia, atau cadangan kata kunci PHP bila tidak.
     *
     * @return array{
     *     metode: 'embedding'|'kata_kunci',
     *     potongan: list<PengetahuanPotongan>
     * }
     */
    public function cari(string $pertanyaan, int $limit = 5): array
    {
        $semuaPotongan = PengetahuanPotongan::with('sumber')->get();
        if ($semuaPotongan->isEmpty()) {
            return [
                'metode' => 'kata_kunci',
                'potongan' => [],
            ];
        }

        $modelEmbedding = config('ai.model_embedding');
        $vektorPertanyaan = null;

        if (! empty($modelEmbedding)) {
            try {
                $hasil = $this->ai->embedding([$pertanyaan]);
                $vektorPertanyaan = $hasil[0] ?? null;
            } catch (Throwable) {
                $vektorPertanyaan = null;
            }
        }

        // Jika vektor embedding tersedia dan ada potongan yang memiliki embedding
        $adaPotonganEmbedding = $semuaPotongan->contains(fn ($p) => ! empty($p->embedding));

        if (! empty($vektorPertanyaan) && $adaPotonganEmbedding) {
            $berperingkat = $semuaPotongan
                ->filter(fn ($p) => ! empty($p->embedding))
                ->map(fn ($p) => [
                    'potongan' => $p,
                    'skor' => self::cosineSimilarity($vektorPertanyaan, (array) $p->embedding),
                ])
                ->sortByDesc('skor')
                ->take($limit)
                ->pluck('potongan')
                ->values()
                ->all();

            return [
                'metode' => 'embedding',
                'potongan' => $berperingkat,
            ];
        }

        // Cadangan wajib: Pencarian kata kunci di PHP
        $berperingkat = $semuaPotongan
            ->map(fn ($p) => [
                'potongan' => $p,
                'skor' => self::hitungSkorKataKunci($pertanyaan, $p->isi),
            ])
            ->filter(fn ($item) => $item['skor'] > 0)
            ->sortByDesc('skor')
            ->take($limit)
            ->pluck('potongan')
            ->values()
            ->all();

        return [
            'metode' => 'kata_kunci',
            'potongan' => $berperingkat,
        ];
    }
}
