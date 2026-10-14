<?php

namespace App\Console\Commands;

use App\Domain\AI\PencariPengetahuan;
use App\Domain\AI\PenyediaAI;
use App\Models\PengetahuanPotongan;
use App\Models\PengetahuanSumber;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Throwable;

class MuatPengetahuanCommand extends Command
{
    protected $signature = 'pengetahuan:muat {--segar : Hapus data pengetahuan lama sebelum memuat}';

    protected $description = 'Memuat basis pengetahuan dari resep tanam, modul belajar, dan dokumen storage';

    public function handle(PenyediaAI $ai): int
    {
        $this->info('Memulai pemuatan basis pengetahuan Tanya Tani Muda...');

        if ($this->option('segar')) {
            PengetahuanPotongan::query()->delete();
            PengetahuanSumber::query()->delete();
            $this->warn('Data pengetahuan lama dibersihkan.');
        }

        $modelEmbedding = config('ai.model_embedding');
        $bisaEmbedding = ! empty($modelEmbedding);
        $totalSumber = 0;
        $totalPotongan = 0;

        // 1. Muat Resep Tanam
        $reseps = DB::table('resep_tanam')
            ->join('komoditas', 'komoditas.id', '=', 'resep_tanam.komoditas_id')
            ->join('metode_tanam', 'metode_tanam.id', '=', 'resep_tanam.metode_id')
            ->select('resep_tanam.*', 'komoditas.nama as nama_komoditas', 'metode_tanam.nama as nama_metode')
            ->get();

        foreach ($reseps as $resep) {
            $tugas = DB::table('resep_tugas')
                ->where('resep_id', $resep->id)
                ->orderBy('urutan')
                ->get();

            $input = DB::table('resep_input')
                ->where('resep_id', $resep->id)
                ->get();

            $teksResep = "Panduan Budidaya: Komoditas {$resep->nama_komoditas}, Metode {$resep->nama_metode}. ";
            $teksResep .= "Umur panen: {$resep->umur_panen_hari} hari. ";
            $teksResep .= "Hasil rata-rata per satuan: {$resep->hasil_per_satuan} kg. ";
            if (! empty($resep->suhu_ideal_min) && ! empty($resep->suhu_ideal_maks)) {
                $teksResep .= "Suhu ideal: {$resep->suhu_ideal_min} - {$resep->suhu_ideal_maks} derajat Celsius. ";
            }
            if (! empty($resep->saran_suhu_tinggi)) {
                $teksResep .= "Bila suhu tinggi: {$resep->saran_suhu_tinggi}. ";
            }
            if (! empty($resep->saran_suhu_rendah)) {
                $teksResep .= "Bila suhu rendah: {$resep->saran_suhu_rendah}. ";
            }

            if ($tugas->isNotEmpty()) {
                $teksResep .= 'Tahapan tugas dan perawatan: ';
                foreach ($tugas as $t) {
                    $teksResep .= "Langkah {$t->urutan} ({$t->judul}): hst mulai {$t->hst_mulai}. ";
                    if (! empty($t->deskripsi)) {
                        $teksResep .= "{$t->deskripsi}. ";
                    }
                }
            }

            if ($input->isNotEmpty()) {
                $teksResep .= 'Kebutuhan sarana produksi / input: ';
                foreach ($input as $i) {
                    $teksResep .= "Input {$i->nama} kelompok {$i->grup}. ";
                }
            }

            $sumber = PengetahuanSumber::firstOrCreate(
                ['judul' => "Resep {$resep->nama_komoditas} ({$resep->nama_metode}) v{$resep->versi}"],
                [
                    'id' => (string) Str::ulid(),
                    'jenis' => 'resep',
                    'lisensi' => 'CC-BY-SA-4.0',
                    'url' => null,
                ]
            );
            $totalSumber++;

            $potonganList = PencariPengetahuan::potongTeks($teksResep);
            foreach ($potonganList as $idx => $isiPotongan) {
                $embedding = null;
                if ($bisaEmbedding) {
                    try {
                        $hasil = $ai->embedding([$isiPotongan]);
                        $embedding = $hasil[0] ?? null;
                    } catch (Throwable) {
                        $embedding = null;
                    }
                }

                PengetahuanPotongan::create([
                    'id' => (string) Str::ulid(),
                    'sumber_id' => $sumber->id,
                    'urutan' => $idx + 1,
                    'isi' => $isiPotongan,
                    'embedding' => $embedding,
                ]);
                $totalPotongan++;
            }
        }

        // 2. Muat Modul Belajar
        $moduls = DB::table('modul')->get();
        foreach ($moduls as $modul) {
            $teksModul = "Modul Belajar: {$modul->judul}. Tahap: {$modul->tahap}. ";
            if (! empty($modul->ringkasan)) {
                $teksModul .= "Ringkasan: {$modul->ringkasan}. ";
            }

            $sumber = PengetahuanSumber::firstOrCreate(
                ['judul' => "Modul: {$modul->judul}"],
                [
                    'id' => (string) Str::ulid(),
                    'jenis' => 'modul',
                    'lisensi' => 'CC-BY-SA-4.0',
                    'url' => null,
                ]
            );
            $totalSumber++;

            $potonganList = PencariPengetahuan::potongTeks($teksModul);
            foreach ($potonganList as $idx => $isiPotongan) {
                $embedding = null;
                if ($bisaEmbedding) {
                    try {
                        $hasil = $ai->embedding([$isiPotongan]);
                        $embedding = $hasil[0] ?? null;
                    } catch (Throwable) {
                        $embedding = null;
                    }
                }

                PengetahuanPotongan::create([
                    'id' => (string) Str::ulid(),
                    'sumber_id' => $sumber->id,
                    'urutan' => $idx + 1,
                    'isi' => $isiPotongan,
                    'embedding' => $embedding,
                ]);
                $totalPotongan++;
            }
        }

        // 3. Dokumen di storage/app/pengetahuan/ bila ada
        $jalurPengetahuan = storage_path('app/pengetahuan');
        if (File::isDirectory($jalurPengetahuan)) {
            $berkas = File::files($jalurPengetahuan);
            foreach ($berkas as $b) {
                $ekstensi = strtolower($b->getExtension());
                $isi = '';
                if (in_array($ekstensi, ['txt', 'md'], true)) {
                    $isi = File::get($b->getRealPath());
                } elseif ($ekstensi === 'pdf') {
                    // Ekstraksi teks PDF sederhana
                    $raw = File::get($b->getRealPath());
                    $isi = preg_replace('/[^\x20-\x7E\t\r\n]/', ' ', $raw) ?? '';
                }

                if (mb_strlen(trim($isi)) > 0) {
                    $namaFile = $b->getFilename();
                    $sumber = PengetahuanSumber::firstOrCreate(
                        ['judul' => "Dokumen: {$namaFile}"],
                        [
                            'id' => (string) Str::ulid(),
                            'jenis' => 'paper',
                            'lisensi' => 'Akses Terbuka',
                            'url' => null,
                        ]
                    );
                    $totalSumber++;

                    $potonganList = PencariPengetahuan::potongTeks($isi);
                    foreach ($potonganList as $idx => $isiPotongan) {
                        $embedding = null;
                        if ($bisaEmbedding) {
                            try {
                                $hasil = $ai->embedding([$isiPotongan]);
                                $embedding = $hasil[0] ?? null;
                            } catch (Throwable) {
                                $embedding = null;
                            }
                        }

                        PengetahuanPotongan::create([
                            'id' => (string) Str::ulid(),
                            'sumber_id' => $sumber->id,
                            'urutan' => $idx + 1,
                            'isi' => $isiPotongan,
                            'embedding' => $embedding,
                        ]);
                        $totalPotongan++;
                    }
                }
            }
        }

        $this->info("Pemuatan selesai! Berhasil memuat {$totalSumber} sumber dan {$totalPotongan} potongan pengetahuan.");

        return Command::SUCCESS;
    }
}
