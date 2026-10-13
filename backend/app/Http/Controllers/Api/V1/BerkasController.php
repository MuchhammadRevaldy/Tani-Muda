<?php

namespace App\Http\Controllers\Api\V1;

use App\Casts\FotoBerkas;
use App\Http\Controllers\Controller;
use App\Http\Galat\GalatApi;
use App\Http\Respons;
use App\Models\Berkas;
use App\Models\Pengguna;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Berkas privat (kontrak 3.11, arsitektur-backend.md bagian 13, [AG-22]): unggah multipart ke disk
 * `local` (storage/app/private) dengan nama acak; unduh hanya lewat URL bertanda tangan 10 menit.
 */
class BerkasController extends Controller
{
    public const BATAS_BYTE = 2 * 1024 * 1024;

    /** Jenis yang diterima → akhiran nama berkas. Jenis diperiksa dari isi berkas, bukan label klien. */
    private const JENIS = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];

    /** POST /berkas: multipart `berkas` → Berkas { id, url, jenis, ukuran_byte } */
    public function unggah(Request $request): JsonResponse
    {
        /** @var Pengguna $p */
        $p = $request->user();
        $f = $request->file('berkas');
        if (! $f instanceof UploadedFile) {
            throw GalatApi::validasi(['isi' => 'VALIDASI']);
        }
        // Terlalu besar untuk batas unggah PHP juga dianggap terlalu besar.
        if (in_array($f->getError(), [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true) || ($f->isValid() && $f->getSize() > self::BATAS_BYTE)) {
            throw GalatApi::validasi(['isi' => 'VALIDASI']);
        }
        if (! $f->isValid()) {
            throw GalatApi::validasi(['isi' => 'VALIDASI']);
        }
        $jenis = (string) $f->getMimeType();
        if (! isset(self::JENIS[$jenis]) || ! isset(self::JENIS[(string) $f->getClientMimeType()])) {
            throw GalatApi::validasi(['jenis' => 'VALIDASI']);
        }
        $jalur = $f->storeAs('berkas', Str::random(40).'.'.self::JENIS[$jenis], 'local');
        if ($jalur === false) {
            throw new GalatApi('GALAT_SERVER');
        }
        $b = Berkas::forceCreate([
            'pemilik_id' => $p->id,
            'jalur' => $jalur,
            'jenis' => $jenis,
            'ukuran_byte' => (int) $f->getSize(),
        ]);

        return Respons::data([
            'id' => $b->id,
            'url' => FotoBerkas::url($b->id),
            'jenis' => $b->jenis,
            'ukuran_byte' => $b->ukuran_byte,
        ]);
    }

    /** GET /berkas/{id}/unduh?expires=&signature= (middleware signed:relative) */
    public function unduh(string $id): StreamedResponse
    {
        $b = Berkas::find($id);
        if ($b === null || ! Storage::disk('local')->exists($b->jalur)) {
            throw new GalatApi('TIDAK_DITEMUKAN');
        }

        return Storage::disk('local')->response($b->jalur, null, [
            'Content-Type' => $b->jenis,
            'Cache-Control' => 'private, max-age='.(FotoBerkas::MENIT_BERLAKU * 60),
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
