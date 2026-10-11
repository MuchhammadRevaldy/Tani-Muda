<?php

namespace App\Http\Galat;

use RuntimeException;

/**
 * Galat yang dilempar kode aplikasi dengan kode kontrak, mis. `throw new GalatApi('TIDAK_DITEMUKAN')`.
 * Status HTTP diambil dari KodeGalat kecuali diberikan; pesan bawaan dari teks kode itu.
 */
class GalatApi extends RuntimeException
{
    public readonly int $status;

    /**
     * @param  array<string, list<string>>  $rincian  galat per kolom
     */
    public function __construct(
        public readonly string $kode,
        ?string $pesan = null,
        public readonly array $rincian = [],
        public readonly ?int $cobaLagiDalam = null,
        ?int $status = null,
    ) {
        parent::__construct($pesan ?? KodeGalat::teks($kode));
        $this->status = $status ?? KodeGalat::status($kode);
    }

    /**
     * Galat per kolom dengan teks kode galatnya, sama dengan `validasi()` klien tiruan, mis.
     * `throw GalatApi::validasi(['wilayah_id' => 'WILAYAH_WAJIB'])`. Kode utamanya `VALIDASI`, kecuali
     * diberikan (mis. kode logika inti yang berasal dari satu kolom).
     *
     * @param  array<string, string>  $kodePerKolom
     */
    public static function validasi(array $kodePerKolom, string $kode = 'VALIDASI'): self
    {
        return new self($kode, rincian: array_map(fn (string $k) => [KodeGalat::teks($k)], $kodePerKolom));
    }
}
