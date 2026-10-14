<?php

namespace App\Domain\AI;

use App\Http\Galat\GalatApi;
use App\Models\Pengguna;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

/**
 * Layanan tunggal akses AI: penyedia, persetujuan privasi, batas harian, dan log (PRD Tambahan F-00).
 */
class LayananAI
{
    public function __construct(
        private readonly ?PenyediaAI $penyedia = null,
    ) {}

    public function ambilPenyedia(): PenyediaAI
    {
        if ($this->penyedia !== null) {
            return $this->penyedia;
        }

        $driver = config('ai.driver', 'tiruan');
        if ($driver === 'openai' && ! empty(config('ai.api_key'))) {
            return new DriverOpenAI;
        }

        return new DriverTiruan;
    }

    public function periksaPersetujuan(?string $penggunaId): void
    {
        if (empty($penggunaId)) {
            return;
        }

        $pengguna = Pengguna::find($penggunaId);
        if ($pengguna && $pengguna->setuju_ai_pada === null) {
            throw new GalatApi('PERSETUJUAN_AI_WAJIB');
        }
    }

    public function periksaBatasHarian(?string $penggunaId): void
    {
        if (empty($penggunaId)) {
            return;
        }

        $batas = (int) config('ai.batas_harian', 30);
        $awalHari = Carbon::now('UTC')->startOfDay();

        $jumlah = DB::table('log_ai')
            ->where('pengguna_id', $penggunaId)
            ->where('dibuat_pada', '>=', $awalHari)
            ->count();

        if ($jumlah >= $batas) {
            throw new GalatApi('BATAS_AI_TERCAPAI');
        }
    }

    public function catatLog(
        ?string $penggunaId,
        string $fitur,
        string $model,
        int $tokenMasuk,
        int $tokenKeluar,
        bool $berhasil,
        ?string $kodeGalat = null
    ): void {
        try {
            DB::table('log_ai')->insert([
                'id' => Str::lower((string) Str::ulid()),
                'pengguna_id' => $penggunaId,
                'fitur' => $fitur,
                'model' => $model,
                'token_masuk' => $tokenMasuk,
                'token_keluar' => $tokenKeluar,
                'perkiraan_biaya' => 0.0000,
                'berhasil' => $berhasil,
                'kode_galat' => $kodeGalat,
                'dibuat_pada' => Carbon::now('UTC'),
            ]);
        } catch (Throwable) {
            // Galat logging tidak boleh membatalkan layanan
        }
    }

    /**
     * @param  array<int, array{role: string, content: string|array<mixed>}>  $pesan
     * @param  array<string, mixed>  $opsi
     */
    public function teks(string $fitur, ?string $penggunaId, array $pesan, array $opsi = []): JawabanAI
    {
        $this->periksaPersetujuan($penggunaId);
        $this->periksaBatasHarian($penggunaId);

        $penyedia = $this->ambilPenyedia();

        try {
            $jawaban = $penyedia->teks($pesan, $opsi);
            $this->catatLog($penggunaId, $fitur, $jawaban->model, $jawaban->tokenMasuk, $jawaban->tokenKeluar, true);

            return $jawaban;
        } catch (GalatApi $e) {
            $this->catatLog($penggunaId, $fitur, 'unknown', 0, 0, false, $e->kode);
            if (! ($penyedia instanceof DriverTiruan)) {
                $tiruan = new DriverTiruan;
                $jawaban = $tiruan->teks($pesan, $opsi);
                $this->catatLog($penggunaId, $fitur, 'tiruan-fallback', $jawaban->tokenMasuk, $jawaban->tokenKeluar, true);

                return $jawaban;
            }
            throw $e;
        } catch (Throwable) {
            $this->catatLog($penggunaId, $fitur, 'unknown', 0, 0, false, 'AI_TIDAK_TERSEDIA');
            if (! ($penyedia instanceof DriverTiruan)) {
                $tiruan = new DriverTiruan;
                $jawaban = $tiruan->teks($pesan, $opsi);
                $this->catatLog($penggunaId, $fitur, 'tiruan-fallback', $jawaban->tokenMasuk, $jawaban->tokenKeluar, true);

                return $jawaban;
            }
            throw new GalatApi('AI_TIDAK_TERSEDIA');
        }
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $pesan
     * @param  array<string, mixed>  $opsi
     */
    public function gambar(string $fitur, ?string $penggunaId, string $jalurBerkas, array $pesan, array $opsi = []): JawabanAI
    {
        $this->periksaPersetujuan($penggunaId);
        $this->periksaBatasHarian($penggunaId);

        $penyedia = $this->ambilPenyedia();

        try {
            $jawaban = $penyedia->gambar($jalurBerkas, $pesan, $opsi);
            $this->catatLog($penggunaId, $fitur, $jawaban->model, $jawaban->tokenMasuk, $jawaban->tokenKeluar, true);

            return $jawaban;
        } catch (GalatApi $e) {
            $this->catatLog($penggunaId, $fitur, 'unknown', 0, 0, false, $e->kode);
            if (! ($penyedia instanceof DriverTiruan)) {
                $tiruan = new DriverTiruan;
                $jawaban = $tiruan->gambar($jalurBerkas, $pesan, $opsi);
                $this->catatLog($penggunaId, $fitur, 'tiruan-fallback', $jawaban->tokenMasuk, $jawaban->tokenKeluar, true);

                return $jawaban;
            }
            throw $e;
        } catch (Throwable) {
            $this->catatLog($penggunaId, $fitur, 'unknown', 0, 0, false, 'AI_TIDAK_TERSEDIA');
            if (! ($penyedia instanceof DriverTiruan)) {
                $tiruan = new DriverTiruan;
                $jawaban = $tiruan->gambar($jalurBerkas, $pesan, $opsi);
                $this->catatLog($penggunaId, $fitur, 'tiruan-fallback', $jawaban->tokenMasuk, $jawaban->tokenKeluar, true);

                return $jawaban;
            }
            throw new GalatApi('AI_TIDAK_TERSEDIA');
        }
    }

    /**
     * @param  array<int, string>  $teks
     * @return array<int, array<int, float>>
     */
    public function embedding(string $fitur, ?string $penggunaId, array $teks): array
    {
        $this->periksaPersetujuan($penggunaId);
        $this->periksaBatasHarian($penggunaId);

        $penyedia = $this->ambilPenyedia();

        try {
            $hasil = $penyedia->embedding($teks);
            $this->catatLog($penggunaId, $fitur, 'embedding', count($teks), 0, true);

            return $hasil;
        } catch (Throwable) {
            $this->catatLog($penggunaId, $fitur, 'embedding', 0, 0, false, 'AI_TIDAK_TERSEDIA');
            if (! ($penyedia instanceof DriverTiruan)) {
                $tiruan = new DriverTiruan;

                return $tiruan->embedding($teks);
            }
            throw new GalatApi('AI_TIDAK_TERSEDIA');
        }
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $pesan
     * @param  array<string, mixed>  $skema
     * @param  array<string, mixed>  $opsi
     * @return array<string, mixed>
     */
    public function jsonTerstruktur(string $fitur, ?string $penggunaId, array $pesan, array $skema, array $opsi = []): array
    {
        $this->periksaPersetujuan($penggunaId);
        $this->periksaBatasHarian($penggunaId);

        $penyedia = $this->ambilPenyedia();

        try {
            $hasil = $penyedia->jsonTerstruktur($pesan, $skema, $opsi);
            $this->catatLog($penggunaId, $fitur, 'json-terstruktur', 50, 50, true);

            return $hasil;
        } catch (Throwable) {
            $this->catatLog($penggunaId, $fitur, 'json-terstruktur', 0, 0, false, 'AI_TIDAK_TERSEDIA');
            if (! ($penyedia instanceof DriverTiruan)) {
                $tiruan = new DriverTiruan;

                return $tiruan->jsonTerstruktur($pesan, $skema, $opsi);
            }
            throw new GalatApi('AI_TIDAK_TERSEDIA');
        }
    }

    public function catatPersetujuan(string $penggunaId): void
    {
        Pengguna::where('id', $penggunaId)->update([
            'setuju_ai_pada' => Carbon::now('UTC'),
        ]);
    }
}
