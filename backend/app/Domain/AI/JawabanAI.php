<?php

namespace App\Domain\AI;

/**
 * Nilai kembalian pemanggilan model AI (PRD Tambahan F-00).
 */
final class JawabanAI
{
    /**
     * @param array<string, mixed>|null $dataTerstruktur
     */
    public function __construct(
        public readonly string $konten,
        public readonly ?array $dataTerstruktur = null,
        public readonly int $tokenMasuk = 0,
        public readonly int $tokenKeluar = 0,
        public readonly string $model = '',
        public readonly bool $tiruan = false,
    ) {}
}
