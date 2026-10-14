<?php

namespace App\Domain\AI;

/**
 * Driver AI tiruan untuk demo offline dan pengujian otomatis (PRD Tambahan F-00).
 * Jawaban diambil dari shared/data-contoh/ai/contoh-jawaban.json berlabel "mode tanpa internet".
 */
class DriverTiruan implements PenyediaAI
{
    /** @var array<string, mixed> */
    private array $data;

    public function __construct(?string $jalurBerkas = null)
    {
        $jalur = $jalurBerkas ?? base_path('../shared/data-contoh/ai/contoh-jawaban.json');
        if (! file_exists($jalur)) {
            $this->data = [
                'teks' => 'Contoh jawaban, mode tanpa internet. Rawat tanamanmu sesuai jadwal.',
                'gambar' => [
                    'dugaan' => [
                        [
                            'nama' => 'Bercak Daun Alternaria (Dugaan awal)',
                            'keyakinan' => 'sedang',
                            'alasan' => 'Tampak bercak kecokelatan pada daun.',
                        ],
                    ],
                    'gejala_terlihat' => ['Bercak cokelat melingkar'],
                    'langkah_aman' => ['Petik dan buang daun yang sakit.'],
                    'perlu_penyuluh' => true,
                    'catatan' => 'Contoh jawaban, mode tanpa internet.',
                ],
                'embedding' => [0.0123, -0.0456, 0.0789],
                'jsonTerstruktur' => ['status' => 'sukses'],
            ];

            return;
        }

        $isi = file_get_contents($jalur) ?: '{}';
        $this->data = json_decode($isi, true) ?: [];
    }

    public function teks(array $pesan, array $opsi = []): JawabanAI
    {
        $konten = (string) ($this->data['teks'] ?? 'Contoh jawaban, mode tanpa internet.');

        return new JawabanAI(
            konten: $konten,
            tokenMasuk: 15,
            tokenKeluar: 35,
            model: 'tiruan',
            tiruan: true,
        );
    }

    public function gambar(string $jalurBerkas, array $pesan, array $opsi = []): JawabanAI
    {
        /** @var array<string, mixed> $dataGambar */
        $dataGambar = $this->data['gambar'] ?? [];
        $konten = (string) json_encode($dataGambar, JSON_UNESCAPED_UNICODE);

        return new JawabanAI(
            konten: $konten,
            dataTerstruktur: $dataGambar,
            tokenMasuk: 250,
            tokenKeluar: 120,
            model: 'tiruan',
            tiruan: true,
        );
    }

    public function embedding(array $teks): array
    {
        /** @var array<int, float> $vektorContoh */
        $vektorContoh = $this->data['embedding'] ?? [0.01, 0.02, 0.03];
        $hasil = [];
        foreach ($teks as $_) {
            $hasil[] = $vektorContoh;
        }

        return $hasil;
    }

    public function jsonTerstruktur(array $pesan, array $skema, array $opsi = []): array
    {
        /** @var array<string, mixed> */
        return $this->data['jsonTerstruktur'] ?? ['status' => 'sukses'];
    }
}
