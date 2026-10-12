<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Galat\GalatApi;
use App\Http\Respons;
use App\Models\Modul;
use App\Models\Pengguna;
use App\Models\ProgresModul;
use Database\Seeders\DataContohSeeder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Belajar (kontrak 3.6, D-43, D-44): modul berurutan dengan tanda selesai pengguna. */
class BelajarController extends Controller
{
    /** GET /modul?komoditas_id=&metode_id= */
    public function daftar(Request $request): JsonResponse
    {
        $p = $this->pengguna($request);
        $modul = Modul::where('komoditas_id', (string) $request->query('komoditas_id'))
            ->where('metode_id', (string) $request->query('metode_id'))->orderBy('urutan')->get();

        return Respons::data($modul->map(fn (Modul $m) => self::bentuk($m, $p))->all());
    }

    /** GET /modul/{id} */
    public function ambil(Request $request, string $id): JsonResponse
    {
        return Respons::data(self::bentuk(Modul::find($id) ?? throw new GalatApi('TIDAK_DITEMUKAN'), $this->pengguna($request)));
    }

    /** POST /modul/{id}/selesai: tidak ganda. */
    public function selesai(Request $request, string $id): JsonResponse
    {
        $p = $this->pengguna($request);
        $m = Modul::find($id) ?? throw new GalatApi('TIDAK_DITEMUKAN');
        if (! ProgresModul::where('pengguna_id', $p->id)->where('modul_id', $id)->exists()) {
            ProgresModul::forceCreate(['pengguna_id' => $p->id, 'modul_id' => $id, 'selesai_pada' => now()]);
        }

        return Respons::data(self::bentuk($m, $p));
    }

    /**
     * `Modul` dengan `selesai`; video asli yang dipasang tim (`npm run pasang-video`,
     * shared/data-contoh/video-modul.json) menggantikan video contoh (D-44).
     *
     * @return array<string, mixed>
     */
    private static function bentuk(Modul $m, Pengguna $p): array
    {
        static $videoAsli = null;
        $videoAsli ??= DataContohSeeder::bacaBerkas('video-modul');
        $progres = ProgresModul::where('pengguna_id', $p->id)->where('modul_id', $m->id)->first();
        $data = $m->toArray();
        unset($data['dibuat_pada']);
        if (isset($videoAsli[$m->id])) {
            $data['video_url'] = '/video/modul/'.$videoAsli[$m->id]['berkas'];
            $data['ukuran_video_mb'] = $videoAsli[$m->id]['ukuran_mb'];
        }

        return $data + ['selesai' => $progres !== null, 'selesai_pada' => $progres?->selesai_pada];
    }

    private function pengguna(Request $request): Pengguna
    {
        /** @var Pengguna */
        return $request->user();
    }
}
