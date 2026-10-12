<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Hitung\Angka;
use App\Domain\Hitung\Hasil;
use App\Domain\Hitung\Kebun;
use App\Domain\Kebun\LayananKebun;
use App\Domain\Resep\Resep;
use App\Enums\StatusSiklus;
use App\Enums\StatusTugas;
use App\Http\Controllers\Controller;
use App\Http\Galat\GalatApi;
use App\Http\JawabIdempoten;
use App\Http\Respons;
use App\Models\HasilPengukuran;
use App\Models\Jurnal;
use App\Models\Lahan;
use App\Models\PengaturanPengingat;
use App\Models\Pengeluaran;
use App\Models\Pengguna;
use App\Models\ResepTanam;
use App\Models\SiklusTanam;
use App\Models\Tugas;
use App\Support\HariIni;
use Collator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/** Kebun: siklus, tugas, pengukuran, pengeluaran, jurnal, pengingat (kontrak 3.5). */
class KebunController extends Controller
{
    /** GET /siklus?status= */
    public function daftarSiklus(Request $request): JsonResponse
    {
        $q = SiklusTanam::where('petani_id', $this->petani($request)->id);
        if (is_string($request->query('status')) && $request->query('status') !== '') {
            $q->where('status', $request->query('status'));
        }

        return Respons::data($q->orderBy('urutan')->orderBy('id')->get()->map(LayananKebun::bentukSiklus(...))->all());
    }

    /** POST /siklus: dengan tanggal tanam langsung aktif dan tugasnya dibuat (P0-12, D-15). */
    public function buatSiklus(Request $request): JsonResponse
    {
        $p = $this->petani($request);
        $m = $request->all();
        $resep = ResepTanam::find((string) ($m['resep_id'] ?? ''));
        if ($resep === null || ! Resep::bolehDilihat($resep)) {
            throw new GalatApi('TIDAK_DITEMUKAN');
        }
        $lahan = Lahan::where('id', (string) ($m['lahan_id'] ?? ''))->where('petani_id', $p->id)->first()
            ?? throw new GalatApi('TIDAK_DITEMUKAN');
        if (($lahan->jenis_lahan->value === 'hidroponik') !== ($resep->metode_id === 'hidroponik')) {
            throw GalatApi::validasi(['lahan_id' => 'VALIDASI']);
        }
        $dasar = $resep->dasar_ukuran->value;
        $kolomUkuran = ['luas' => 'luas_m2', 'lubang' => 'jumlah_lubang', 'polybag' => 'jumlah_polybag'][$dasar];
        $ukuran = $m[$kolomUkuran] ?? null;
        $sah = Kebun::validasiUkuran($dasar, $ukuran);
        if (! $sah['ok']) {
            throw GalatApi::validasi([$kolomUkuran => $sah['galat']], kode: $sah['galat']);
        }
        if (! (is_numeric($m['harga_jual'] ?? null) && $m['harga_jual'] > 0)) {
            throw GalatApi::validasi(['harga_jual' => 'HARGA_JUAL_KOSONG']);
        }
        $tanggal = $m['tanggal_tanam'] ?? null;
        if ($tanggal !== null && ! self::tanggalSah($tanggal)) {
            throw GalatApi::validasi(['tanggal_tanam' => 'VALIDASI']);
        }
        $rencana = is_array($m['rencana_item'] ?? null) ? array_values($m['rencana_item']) : [];
        foreach ($rencana as $r) {
            if (trim((string) ($r['nama'] ?? '')) === '') {
                throw GalatApi::validasi(['rencana_item' => 'VALIDASI']);
            }
        }
        $bagiAlat = ($m['bagi_alat'] ?? false) === true;
        $pembagian = $m['jumlah_siklus_pembagian'] ?? 1;
        Hasil::buka(Kebun::hitungModal(array_map(fn ($r, $i) => [
            'id' => (string) $i, 'grup' => (string) $r['grup'], 'jumlah' => $r['jumlah'] ?? 0,
            'hargaSatuan' => $r['harga_satuan'] ?? null, 'alatSekaliBeli' => ($r['alat_sekali_beli'] ?? false) === true,
        ], $rencana, array_keys($rencana)), $bagiAlat, $pembagian), 'rencana_item');

        $s = DB::transaction(function () use ($p, $m, $resep, $lahan, $ukuran, $dasar, $tanggal, $rencana, $bagiAlat, $pembagian) {
            $s = new SiklusTanam;
            $s->forceFill([
                'petani_id' => $p->id,
                'lahan_id' => $lahan->id,
                'resep_id' => $resep->id,
                'resep_versi' => $resep->versi,
                'komoditas_id' => $resep->komoditas_id,
                'metode_id' => $resep->metode_id,
                'status' => $tanggal ? StatusSiklus::Aktif : StatusSiklus::Rencana,
                'luas_m2' => $m['luas_m2'] ?? null,
                'jumlah_lubang' => $m['jumlah_lubang'] ?? null,
                'jumlah_polybag' => $m['jumlah_polybag'] ?? null,
                'volume_tandon_liter' => $m['volume_tandon_liter'] ?? null,
                'sistem_hidroponik' => $m['sistem_hidroponik'] ?? null,
                'vertikultur' => ($m['vertikultur'] ?? false) === true,
                'satuan_asli' => $m['satuan_asli'] ?? 'm2',
                'nilai_asli' => $m['nilai_asli'] ?? 0,
                'tanggal_tanam' => $tanggal,
                'dapat_subsidi' => ($m['dapat_subsidi'] ?? false) === true,
                'harga_jual' => $m['harga_jual'],
                'perkiraan_panen_kg' => Hasil::buka(Kebun::perkiraanPanen($dasar, $ukuran, $resep->hasil_per_satuan)),
                'urutan' => LayananKebun::urutanBerikutnya(),
            ]);
            // ID dibuat sekarang supaya pemeriksaan kapasitas bisa mengecualikan siklus ini.
            $s->id = Str::lower((string) Str::ulid());
            if ($tanggal) {
                LayananKebun::periksaKapasitas($s);
            }
            $s->save();
            foreach ($rencana as $i => $r) {
                DB::table('rencana_item')->insert([
                    'id' => $s->id.':'.($r['resep_input_id'] ?? 'tambahan-'.($i + 1)),
                    'siklus_id' => $s->id,
                    'resep_input_id' => $r['resep_input_id'] ?? null,
                    'input_id' => $r['input_id'] ?? null,
                    'merek_id' => $r['merek_id'] ?? null,
                    'nama' => trim((string) $r['nama']),
                    'grup' => $r['grup'],
                    'jumlah' => $r['jumlah'],
                    'satuan' => $r['satuan'],
                    'harga_satuan' => $r['harga_satuan'] ?? null,
                    'asal' => ! empty($r['resep_input_id']) ? 'resep' : 'tambahan',
                    'alat_sekali_beli' => ($r['alat_sekali_beli'] ?? false) === true,
                    'jumlah_siklus_pembagian' => ($r['alat_sekali_beli'] ?? false) === true && $bagiAlat ? $pembagian : 1,
                    'urutan' => $i + 1,
                    'dibuat_pada' => now(),
                ]);
            }
            if ($tanggal) {
                LayananKebun::buatTugas($s, $tanggal);
            }
            PengaturanPengingat::forceCreate([
                'siklus_id' => $s->id, 'jam_pagi' => '06:00', 'pengingat_sore' => true,
                'tipe_aktif' => ['sekali' => true, 'berulang' => true, 'ukur' => true],
            ]);

            return $s;
        });

        return Respons::data(LayananKebun::detail($s->refresh(), $p));
    }

    /** GET /siklus/{id} */
    public function ambilSiklus(Request $request, string $id): JsonResponse
    {
        $p = $this->petani($request);

        return Respons::data(LayananKebun::detail($this->siklus($p, $id), $p));
    }

    /** PATCH /siklus/{id}/tanggal-tanam: rencana → aktif (tugas dibuat). */
    public function ubahTanggalTanam(Request $request, string $id): JsonResponse
    {
        $p = $this->petani($request);
        $s = $this->siklus($p, $id);
        $tanggal = $request->input('tanggal_tanam');
        if (! self::tanggalSah($tanggal)) {
            throw GalatApi::validasi(['tanggal_tanam' => 'VALIDASI']);
        }
        if ($s->status !== StatusSiklus::Rencana || $s->tanggal_tanam !== null) {
            // Menggeser tanggal siklus yang sudah aktif belum ada di backend (setelah lomba).
            throw new GalatApi('STATUS_TIDAK_SESUAI');
        }
        DB::transaction(function () use ($s, $tanggal) {
            LayananKebun::periksaKapasitas($s);
            $s->forceFill(['status' => StatusSiklus::Aktif, 'tanggal_tanam' => $tanggal])->save();
            LayananKebun::buatTugas($s, $tanggal);
        });

        return Respons::data(LayananKebun::detail($s->refresh(), $p));
    }

    /** GET /siklus/{id}/tugas */
    public function daftarTugas(Request $request, string $id): JsonResponse
    {
        $s = $this->siklus($this->petani($request), $id);

        return Respons::data(self::urut(Tugas::where('siklus_id', $s->id)->get()));
    }

    /** GET /tugas/hari-ini: terlambat dan hari ini dari siklus aktif, ditambah yang selesai hari ini. */
    public function tugasHariIni(Request $request): JsonResponse
    {
        $p = $this->petani($request);
        $hariIni = HariIni::untuk($p);
        $aktif = SiklusTanam::where('petani_id', $p->id)->where('status', StatusSiklus::Aktif->value)->pluck('id');
        $tugas = Tugas::whereIn('siklus_id', $aktif)->where(fn ($q) => $q
            ->where(fn ($b) => $b->where('status', StatusTugas::Belum->value)->where('tanggal', '<=', $hariIni))
            ->orWhere(fn ($s) => $s->where('status', StatusTugas::Selesai->value)->where('tanggal', $hariIni)))->get();

        return Respons::data(self::urut($tugas));
    }

    /** POST /tugas/{id}/selesai (idempoten): foto masuk jurnal (P0-14). */
    public function selesaikanTugas(Request $request, string $id): JsonResponse
    {
        $p = $this->petani($request);
        [$tugas, $siklus] = $this->tugas($p, $id);

        return JawabIdempoten::jalankan($request, $p, "tugas-selesai:{$id}", function () use ($request, $p, $tugas, $siklus) {
            if ($tugas->tipe->value === 'ukur') {
                throw new GalatApi('STATUS_TIDAK_SESUAI');
            }
            if ($tugas->status !== StatusTugas::Selesai) {
                $foto = $request->input('foto');
                $catatan = $request->input('catatan');
                $tugas->forceFill(['status' => StatusTugas::Selesai, 'selesai_pada' => now(), 'foto' => $foto, 'catatan' => $catatan])->save();
                if ($foto) {
                    $hariIni = HariIni::untuk($p);
                    Jurnal::forceCreate([
                        'siklus_id' => $siklus->id, 'tanggal' => $hariIni,
                        'hari_ke' => $siklus->tanggal_tanam ? Angka::selisihHari($siklus->tanggal_tanam->toDateString(), $hariIni) : 0,
                        'foto' => $foto, 'catatan' => $catatan, 'tugas_id' => $tugas->id, 'judul_tugas' => $tugas->judul,
                    ]);
                }
            }

            return LayananKebun::bentukTugas($tugas->refresh());
        });
    }

    /** POST /tugas/{id}/pengukuran (idempoten): nilai di luar batas → tugas ukur ulang besok (P0-37). */
    public function catatPengukuran(Request $request, string $id): JsonResponse
    {
        $p = $this->petani($request);
        [$tugas, $siklus] = $this->tugas($p, $id);

        return JawabIdempoten::jalankan($request, $p, "pengukuran:{$id}", function () use ($request, $p, $tugas, $siklus) {
            if ($tugas->tipe->value !== 'ukur' || empty($tugas->ukur) || $tugas->status === StatusTugas::Selesai) {
                throw new GalatApi('STATUS_TIDAK_SESUAI');
            }
            $nilai = [];
            foreach ((array) $request->input('nilai', []) as $x) {
                if (is_array($x) && isset($x['besaran'])) {
                    $nilai[$x['besaran']] = $x['nilai'] ?? null;
                }
            }
            $salah = [];
            foreach ($tugas->ukur as $b) {
                $v = $nilai[$b['nama']] ?? null;
                if (! is_int($v) && ! is_float($v)) {
                    $salah["nilai.{$b['nama']}"] = 'VALIDASI';
                } elseif (! Kebun::validasiNilaiUkur($v, $b['skala_min'], $b['skala_maks'] ?? null)['ok']) {
                    $salah["nilai.{$b['nama']}"] = 'NILAI_DI_LUAR_SKALA';
                }
            }
            if ($salah !== []) {
                throw GalatApi::validasi($salah);
            }
            $hariIni = HariIni::untuk($p);
            $hasil = [];
            foreach ($tugas->ukur as $b) {
                $hasil[] = HasilPengukuran::forceCreate([
                    'tugas_id' => $tugas->id, 'siklus_id' => $siklus->id, 'besaran' => $b['nama'],
                    'nilai' => $nilai[$b['nama']],
                    'status' => Kebun::nilaiPengukuran($nilai[$b['nama']], $b['batas_bawah'], $b['batas_atas']),
                    'sumber' => $request->input('sumber', 'manual'), 'tanggal' => $hariIni, 'dicatat_pada' => now(),
                ])->refresh();
            }
            $tugas->forceFill(['status' => StatusTugas::Selesai, 'selesai_pada' => now()])->save();
            $ulang = Kebun::perluUkurUlang(array_map(fn ($h) => $h->status->value, $hasil), $hariIni);
            $tugasUlang = null;
            if ($ulang) {
                $tugasUlang = $tugas->replicate(['dibuat_pada', 'diperbarui_pada']);
                $tugasUlang->forceFill([
                    'id' => "{$tugas->id}-ulang-{$ulang}",
                    'judul' => "Ukur ulang: {$tugas->judul}",
                    'tanggal' => $ulang,
                    'hst' => $siklus->tanggal_tanam ? Angka::selisihHari($siklus->tanggal_tanam->toDateString(), $ulang) : $tugas->hst + 1,
                    'status' => StatusTugas::Belum, 'selesai_pada' => null, 'interval' => null, 'foto' => null, 'catatan' => null,
                ])->save();
            }

            return [
                'hasil' => array_map(fn ($h) => self::tanpaWaktu($h->toArray()), $hasil),
                'tugas_ukur_ulang' => $tugasUlang ? LayananKebun::bentukTugas($tugasUlang->refresh()) : null,
                'tugas' => LayananKebun::bentukTugas($tugas->refresh()),
            ];
        });
    }

    /** GET /siklus/{id}/pengukuran?besaran= */
    public function riwayatPengukuran(Request $request, string $id): JsonResponse
    {
        $s = $this->siklus($this->petani($request), $id);
        $q = HasilPengukuran::where('siklus_id', $s->id);
        if (is_string($request->query('besaran')) && $request->query('besaran') !== '') {
            $q->where('besaran', $request->query('besaran'));
        }

        return Respons::data($q->orderBy('tanggal')->orderBy('dicatat_pada')->get()->map(fn ($h) => self::tanpaWaktu($h->toArray()))->all());
    }

    /** GET /siklus/{id}/pengeluaran */
    public function daftarPengeluaran(Request $request, string $id): JsonResponse
    {
        $s = $this->siklus($this->petani($request), $id);

        return Respons::data(Pengeluaran::where('siklus_id', $s->id)->orderBy('tanggal')->orderBy('dibuat_pada')->get()
            ->map(fn ($x) => self::tanpaWaktu($x->toArray()))->all());
    }

    /** GET /siklus/{id}/jurnal: terbaru dulu. */
    public function jurnal(Request $request, string $id): JsonResponse
    {
        $s = $this->siklus($this->petani($request), $id);

        return Respons::data(Jurnal::where('siklus_id', $s->id)->orderByDesc('tanggal')->orderByDesc('dibuat_pada')->get()
            ->map(fn ($x) => self::tanpaWaktu($x->toArray()))->all());
    }

    /** GET /siklus/{id}/pengingat */
    public function ambilPengingat(Request $request, string $id): JsonResponse
    {
        $s = $this->siklus($this->petani($request), $id);

        return Respons::data(self::tanpaWaktu((PengaturanPengingat::find($s->id) ?? throw new GalatApi('TIDAK_DITEMUKAN'))->toArray()));
    }

    /** @param  Collection<int, Tugas>  $tugas */
    private static function urut($tugas): array
    {
        // Sama dengan urutTugas klien tiruan: tanggal, lalu judul (localeCompare 'id').
        $kolator = new Collator('id');

        return $tugas->sort(fn (Tugas $a, Tugas $b) => strcmp($a->tanggal->toDateString(), $b->tanggal->toDateString())
            ?: (int) $kolator->compare($a->judul, $b->judul))
            ->map(LayananKebun::bentukTugas(...))->values()->all();
    }

    /** @param  array<string, mixed>  $data */
    private static function tanpaWaktu(array $data): array
    {
        unset($data['dibuat_pada']);

        return $data;
    }

    public static function tanggalSah(mixed $t): bool
    {
        return is_string($t) && preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $t, $m) === 1 && checkdate((int) $m[2], (int) $m[3], (int) $m[1]);
    }

    private function petani(Request $request): Pengguna
    {
        /** @var Pengguna */
        return $request->user();
    }

    private function siklus(Pengguna $p, string $id): SiklusTanam
    {
        return SiklusTanam::where('id', $id)->where('petani_id', $p->id)->first() ?? throw new GalatApi('TIDAK_DITEMUKAN');
    }

    /** @return array{0: Tugas, 1: SiklusTanam} */
    private function tugas(Pengguna $p, string $id): array
    {
        $tugas = Tugas::find($id);
        $siklus = $tugas ? SiklusTanam::where('id', $tugas->siklus_id)->where('petani_id', $p->id)->first() : null;
        if ($tugas === null || $siklus === null) {
            throw new GalatApi('TIDAK_DITEMUKAN');
        }

        return [$tugas, $siklus];
    }
}
