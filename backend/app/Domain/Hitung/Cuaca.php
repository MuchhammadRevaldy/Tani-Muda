<?php

namespace App\Domain\Hitung;

/**
 * Logika murni kecocokan suhu tanaman (PRD Tambahan F-06).
 */
class Cuaca
{
    /**
     * @param  array{
     *     suhu_ideal_min?: float|int|null,
     *     suhu_ideal_maks?: float|int|null,
     *     suhu_batas_min?: float|int|null,
     *     suhu_batas_maks?: float|int|null,
     *     saran_suhu_tinggi?: ?string,
     *     saran_suhu_rendah?: ?string,
     * }|null  $rentang
     * @return array{
     *     status: 'cocok'|'agak_panas'|'terlalu_panas'|'agak_dingin'|'terlalu_dingin'|'belum_ada_data',
     *     label: string,
     *     cocok: bool,
     *     saran: ?string
     * }
     */
    public static function kecocokanSuhu(?float $suhu, ?array $rentang): array
    {
        if ($suhu === null || $rentang === null || ! isset($rentang['suhu_ideal_min'], $rentang['suhu_ideal_maks'])) {
            return [
                'status' => 'belum_ada_data',
                'label' => 'Belum ada data suhu',
                'cocok' => true,
                'saran' => null,
            ];
        }

        $idealMin = (float) $rentang['suhu_ideal_min'];
        $idealMaks = (float) $rentang['suhu_ideal_maks'];
        $batasMin = isset($rentang['suhu_batas_min']) ? (float) $rentang['suhu_batas_min'] : null;
        $batasMaks = isset($rentang['suhu_batas_maks']) ? (float) $rentang['suhu_batas_maks'] : null;

        $saranTinggi = $rentang['saran_suhu_tinggi'] ?? null;
        $saranRendah = $rentang['saran_suhu_rendah'] ?? null;

        if ($batasMin !== null && $suhu < $batasMin) {
            return [
                'status' => 'terlalu_dingin',
                'label' => 'Terlalu dingin',
                'cocok' => false,
                'saran' => $saranRendah,
            ];
        }

        if ($suhu < $idealMin) {
            return [
                'status' => 'agak_dingin',
                'label' => 'Agak dingin',
                'cocok' => false,
                'saran' => $saranRendah,
            ];
        }

        if ($batasMaks !== null && $suhu > $batasMaks) {
            return [
                'status' => 'terlalu_panas',
                'label' => 'Terlalu panas',
                'cocok' => false,
                'saran' => $saranTinggi,
            ];
        }

        if ($suhu > $idealMaks) {
            return [
                'status' => 'agak_panas',
                'label' => 'Agak panas',
                'cocok' => false,
                'saran' => $saranTinggi,
            ];
        }

        return [
            'status' => 'cocok',
            'label' => 'Cocok',
            'cocok' => true,
            'saran' => null,
        ];
    }
}
