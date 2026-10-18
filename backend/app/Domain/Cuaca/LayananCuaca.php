<?php

namespace App\Domain\Cuaca;

use App\Domain\Hitung\Cuaca;
use App\Http\Galat\GalatApi;
use App\Models\Pengguna;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Throwable;

class LayananCuaca
{
    private const DURASI_CACHE_DETIK = 3600; // 1 jam

    /**
     * Mengambil perkiraan cuaca untuk desa petani dan status kecocokan dengan siklus aktifnya.
     *
     * @return array{
     *     desa: string,
     *     suhu_sekarang: float,
     *     suhu_maks: float,
     *     suhu_min: float,
     *     diperbarui_pada: string,
     *     sumber: string,
     *     siklus: list<array{
     *         siklus_id: string,
     *         nama_tanaman: string,
     *         status: string,
     *         label: string,
     *         cocok: bool,
     *         saran: ?string
     *     }>
     * }
     */
    public function ambilCuacaPetani(Pengguna $petani): array
    {
        $wilayahId = $petani->wilayah_id;
        $wilayah = ! empty($wilayahId) ? DB::table('wilayah')->where('id', $wilayahId)->first() : null;
        $lintang = $wilayah instanceof \stdClass && isset($wilayah->lintang) ? (float) $wilayah->lintang : -6.8186;
        $bujur = $wilayah instanceof \stdClass && isset($wilayah->bujur) ? (float) $wilayah->bujur : 107.6198;
        $namaDesa = $wilayah instanceof \stdClass && isset($wilayah->desa) ? (string) $wilayah->desa : 'Desa Petani';

        $kunciCache = 'cuaca:desa:'.($wilayahId ?? 'bawaan');

        try {
            $dataCuaca = Cache::remember($kunciCache, self::DURASI_CACHE_DETIK, function () use ($lintang, $bujur) {
                return $this->panggilOpenMeteo((float) $lintang, (float) $bujur);
            });
        } catch (Throwable) {
            // Bila panggilan gagal dan cache kosong
            throw new GalatApi('CUACA_TIDAK_TERSEDIA');
        }

        // Ambil siklus aktif milik petani
        $siklusAktif = DB::table('siklus_tanam')
            ->join('komoditas', 'komoditas.id', '=', 'siklus_tanam.komoditas_id')
            ->join('resep_tanam', 'resep_tanam.id', '=', 'siklus_tanam.resep_id')
            ->where('siklus_tanam.petani_id', $petani->id)
            ->where('siklus_tanam.status', 'aktif')
            ->select(
                'siklus_tanam.id as siklus_id',
                'komoditas.nama as nama_komoditas',
                'resep_tanam.suhu_ideal_min',
                'resep_tanam.suhu_ideal_maks',
                'resep_tanam.suhu_batas_min',
                'resep_tanam.suhu_batas_maks',
                'resep_tanam.saran_suhu_tinggi',
                'resep_tanam.saran_suhu_rendah'
            )
            ->get();

        $daftarKecocokan = [];
        $suhuSekarang = $dataCuaca['suhu_sekarang'];

        foreach ($siklusAktif as $s) {
            $rentang = [
                'suhu_ideal_min' => $s->suhu_ideal_min !== null ? (float) $s->suhu_ideal_min : null,
                'suhu_ideal_maks' => $s->suhu_ideal_maks !== null ? (float) $s->suhu_ideal_maks : null,
                'suhu_batas_min' => $s->suhu_batas_min !== null ? (float) $s->suhu_batas_min : null,
                'suhu_batas_maks' => $s->suhu_batas_maks !== null ? (float) $s->suhu_batas_maks : null,
                'saran_suhu_tinggi' => $s->saran_suhu_tinggi,
                'saran_suhu_rendah' => $s->saran_suhu_rendah,
            ];

            $hasil = Cuaca::kecocokanSuhu($suhuSekarang, $rentang);

            $daftarKecocokan[] = [
                'siklus_id' => $s->siklus_id,
                'nama_tanaman' => $s->nama_komoditas,
                'status' => $hasil['status'],
                'label' => $hasil['label'],
                'cocok' => $hasil['cocok'],
                'saran' => $hasil['saran'],
            ];
        }

        return [
            'desa' => $namaDesa,
            'suhu_sekarang' => $dataCuaca['suhu_sekarang'],
            'suhu_maks' => $dataCuaca['suhu_maks'],
            'suhu_min' => $dataCuaca['suhu_min'],
            'diperbarui_pada' => $dataCuaca['diperbarui_pada'],
            'sumber' => 'Open-Meteo',
            'siklus' => $daftarKecocokan,
        ];
    }

    /**
     * @return array{suhu_sekarang: float, suhu_maks: float, suhu_min: float, diperbarui_pada: string}
     */
    protected function panggilOpenMeteo(float $lintang, float $bujur): array
    {
        $baseUrl = config('services.openmeteo.base_url', 'https://api.open-meteo.com/v1/forecast');
        $apiKey = config('services.openmeteo.api_key');

        $query = [
            'latitude' => $lintang,
            'longitude' => $bujur,
            'current' => 'temperature_2m',
            'daily' => 'temperature_2m_max,temperature_2m_min',
            'timezone' => 'auto',
        ];

        if (! empty($apiKey) && ! in_array($apiKey, ['kunci_api_openmeteo_anda', 'kunci_api_anda', 'null'], true)) {
            $query['apikey'] = $apiKey;
        }

        $respons = Http::withoutVerifying()->timeout(10)->get($baseUrl, $query);

        if (! $respons->successful()) {
            throw new \RuntimeException('Gagal mengambil data Open-Meteo: status '.$respons->status());
        }

        $json = $respons->json();
        $suhuSekarang = (float) ($json['current']['temperature_2m'] ?? 25.0);
        $suhuMaks = (float) ($json['daily']['temperature_2m_max'][0] ?? $suhuSekarang + 4);
        $suhuMin = (float) ($json['daily']['temperature_2m_min'][0] ?? $suhuSekarang - 4);
        $waktu = $json['current']['time'] ?? Carbon::now('UTC')->toIso8601String();

        return [
            'suhu_sekarang' => $suhuSekarang,
            'suhu_maks' => $suhuMaks,
            'suhu_min' => $suhuMin,
            'diperbarui_pada' => $waktu,
        ];
    }
}
