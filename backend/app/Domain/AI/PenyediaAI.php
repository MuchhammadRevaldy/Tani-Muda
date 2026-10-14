<?php

namespace App\Domain\AI;

/**
 * Antarmuka tunggal penyedia model AI (PRD Tambahan F-00, D-64).
 */
interface PenyediaAI
{
    /**
     * @param  array<int, array{role: string, content: string|array<mixed>}>  $pesan
     * @param  array<string, mixed>  $opsi
     */
    public function teks(array $pesan, array $opsi = []): JawabanAI;

    /**
     * @param  array<int, array{role: string, content: string}>  $pesan
     * @param  array<string, mixed>  $opsi
     */
    public function gambar(string $jalurBerkas, array $pesan, array $opsi = []): JawabanAI;

    /**
     * @param  array<int, string>  $teks
     * @return array<int, array<int, float>>
     */
    public function embedding(array $teks): array;

    /**
     * @param  array<int, array{role: string, content: string}>  $pesan
     * @param  array<string, mixed>  $skema
     * @param  array<string, mixed>  $opsi
     * @return array<string, mixed>
     */
    public function jsonTerstruktur(array $pesan, array $skema, array $opsi = []): array;
}
