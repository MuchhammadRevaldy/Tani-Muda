<?php

namespace App\Domain\AI;

use App\Http\Galat\GalatApi;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Driver OpenAI & OpenAI-compatible provider (F-00, D-64).
 */
class DriverOpenAI implements PenyediaAI
{
    public function __construct(
        private readonly ?string $apiKey = null,
        private readonly ?string $baseUrl = null,
        private readonly ?string $modelTeks = null,
        private readonly ?string $modelGambar = null,
        private readonly ?string $modelEmbedding = null,
        private readonly int $timeout = 30,
    ) {}

    private function ambilApiKey(): string
    {
        $kunci = $this->apiKey ?? config('ai.api_key');
        if (empty($kunci)) {
            throw new GalatApi('AI_TIDAK_TERSEDIA', 'Kunci API AI belum dikonfigurasi.');
        }

        return (string) $kunci;
    }

    private function ambilBaseUrl(): string
    {
        $url = $this->baseUrl ?? config('ai.base_url', 'https://api.openai.com/v1');

        return rtrim((string) $url, '/');
    }

    private function ambilModelTeks(?string $opsi = null): string
    {
        $model = $opsi ?? $this->modelTeks ?? config('ai.model_teks');
        if (empty($model)) {
            throw new GalatApi('AI_TIDAK_TERSEDIA', 'Nama model AI teks belum dikonfigurasi di .env.');
        }

        return (string) $model;
    }

    private function ambilModelGambar(?string $opsi = null): string
    {
        $model = $opsi ?? $this->modelGambar ?? config('ai.model_gambar') ?? config('ai.model_teks');
        if (empty($model)) {
            throw new GalatApi('AI_TIDAK_TERSEDIA', 'Nama model AI gambar/teks belum dikonfigurasi di .env.');
        }

        return (string) $model;
    }

    private function ambilModelEmbedding(): string
    {
        $model = $this->modelEmbedding ?? config('ai.model_embedding');
        if (empty($model)) {
            throw new GalatApi('AI_TIDAK_TERSEDIA', 'Nama model AI embedding belum dikonfigurasi di .env.');
        }

        return (string) $model;
    }

    public function teks(array $pesan, array $opsi = []): JawabanAI
    {
        $apiKey = $this->ambilApiKey();
        $baseUrl = $this->ambilBaseUrl();
        $model = $this->ambilModelTeks($opsi['model'] ?? null);

        try {
            $response = Http::withoutVerifying()->withHeaders([
                'Authorization' => 'Bearer '.$apiKey,
                'Content-Type' => 'application/json',
            ])->timeout($this->timeout)->post($baseUrl.'/chat/completions', [
                'model' => $model,
                'messages' => $pesan,
                'temperature' => $opsi['temperature'] ?? 0.7,
            ]);

            if (! $response->successful()) {
                throw new GalatApi('AI_TIDAK_TERSEDIA');
            }

            /** @var array{choices?: array<int, array{message?: array{content?: string}}>, usage?: array{prompt_tokens?: int, completion_tokens?: int}} $data */
            $data = $response->json();
            $konten = $data['choices'][0]['message']['content'] ?? '';
            $tokenMasuk = (int) ($data['usage']['prompt_tokens'] ?? 0);
            $tokenKeluar = (int) ($data['usage']['completion_tokens'] ?? 0);

            return new JawabanAI(
                konten: $konten,
                tokenMasuk: $tokenMasuk,
                tokenKeluar: $tokenKeluar,
                model: (string) $model,
                tiruan: false,
            );
        } catch (GalatApi $e) {
            throw $e;
        } catch (Throwable) {
            throw new GalatApi('AI_TIDAK_TERSEDIA');
        }
    }

    public function gambar(string $jalurBerkas, array $pesan, array $opsi = []): JawabanAI
    {
        $apiKey = $this->ambilApiKey();
        $baseUrl = $this->ambilBaseUrl();
        $model = $this->ambilModelGambar($opsi['model'] ?? null);

        if (! file_exists($jalurBerkas)) {
            throw new GalatApi('AI_TIDAK_TERSEDIA', 'Berkas gambar tidak ditemukan.');
        }

        $isiGambar = file_get_contents($jalurBerkas);
        if ($isiGambar === false) {
            throw new GalatApi('AI_TIDAK_TERSEDIA');
        }

        $tipeMime = mime_content_type($jalurBerkas) ?: 'image/jpeg';
        $base64 = base64_encode($isiGambar);
        $dataUri = 'data:'.$tipeMime.';base64,'.$base64;

        // Siapkan pesan multimodal
        $pesanBaru = $pesan;
        $pesanBaru[] = [
            'role' => 'user',
            'content' => [
                ['type' => 'text', 'text' => $opsi['petunjuk'] ?? 'Analisis kesehatan tanaman pada foto ini.'],
                ['type' => 'image_url', 'image_url' => ['url' => $dataUri]],
            ],
        ];

        try {
            $response = Http::withoutVerifying()->withHeaders([
                'Authorization' => 'Bearer '.$apiKey,
                'Content-Type' => 'application/json',
            ])->timeout($this->timeout)->post($baseUrl.'/chat/completions', [
                'model' => $model,
                'messages' => $pesanBaru,
            ]);

            if (! $response->successful()) {
                throw new GalatApi('AI_TIDAK_TERSEDIA');
            }

            /** @var array{choices?: array<int, array{message?: array{content?: string}}>, usage?: array{prompt_tokens?: int, completion_tokens?: int}} $data */
            $data = $response->json();
            $konten = $data['choices'][0]['message']['content'] ?? '';
            $tokenMasuk = (int) ($data['usage']['prompt_tokens'] ?? 0);
            $tokenKeluar = (int) ($data['usage']['completion_tokens'] ?? 0);

            // Coba ekstrak JSON bila ada
            $terstruktur = null;
            if (preg_match('/\{[\s\S]*\}/', $konten, $m)) {
                $terstruktur = json_decode($m[0], true);
            }

            return new JawabanAI(
                konten: $konten,
                dataTerstruktur: is_array($terstruktur) ? $terstruktur : null,
                tokenMasuk: $tokenMasuk,
                tokenKeluar: $tokenKeluar,
                model: (string) $model,
                tiruan: false,
            );
        } catch (GalatApi $e) {
            throw $e;
        } catch (Throwable) {
            throw new GalatApi('AI_TIDAK_TERSEDIA');
        }
    }

    public function embedding(array $teks): array
    {
        $apiKey = $this->ambilApiKey();
        $baseUrl = $this->ambilBaseUrl();
        $model = $this->ambilModelEmbedding();

        try {
            $response = Http::withoutVerifying()->withHeaders([
                'Authorization' => 'Bearer '.$apiKey,
                'Content-Type' => 'application/json',
            ])->timeout($this->timeout)->post($baseUrl.'/embeddings', [
                'model' => $model,
                'input' => $teks,
            ]);

            if (! $response->successful()) {
                throw new GalatApi('AI_TIDAK_TERSEDIA');
            }

            /** @var array{data?: array<int, array{embedding?: array<int, float>}>} $data */
            $data = $response->json();
            $hasil = [];
            foreach ($data['data'] ?? [] as $item) {
                if (isset($item['embedding'])) {
                    $hasil[] = $item['embedding'];
                }
            }

            return $hasil;
        } catch (GalatApi $e) {
            throw $e;
        } catch (Throwable) {
            throw new GalatApi('AI_TIDAK_TERSEDIA');
        }
    }

    public function jsonTerstruktur(array $pesan, array $skema, array $opsi = []): array
    {
        $skemaJson = json_encode($skema, JSON_UNESCAPED_UNICODE);
        $pesanTambahan = $pesan;
        $pesanTambahan[] = [
            'role' => 'system',
            'content' => "Kamu adalah asisten terstruktur. Wajib kembalikan HANYA format JSON valid tanpa tanda markdown (tanpa ```json) yang mematuhi skema berikut:\n".$skemaJson,
        ];

        $jawaban = $this->teks($pesanTambahan, array_merge($opsi, ['temperature' => 0.2]));
        $konten = trim($jawaban->konten);

        if (preg_match('/\{[\s\S]*\}/', $konten, $m)) {
            $decoded = json_decode($m[0], true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }

        throw new GalatApi('AI_TIDAK_TERSEDIA', 'Format JSON dari AI tidak sesuai skema.');
    }
}
