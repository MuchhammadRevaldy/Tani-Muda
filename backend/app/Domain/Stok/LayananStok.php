<?php

namespace App\Domain\Stok;

use App\Domain\Hitung\Jarak;
use App\Enums\JenisPembayaran;
use App\Enums\StatusPembayaran;
use App\Http\Galat\GalatApi;
use App\Models\Pembayaran;
use App\Models\Pengguna;
use App\Models\PesananStok;
use App\Models\Stok;
use App\Models\Wilayah;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Layanan bisnis untuk stok siap jual dan pesanan stok (PRD Tambahan F-07).
 */
class LayananStok
{
    /**
     * Mengambil daftar stok yang dimiliki oleh petani.
     *
     * @return array<int, array<string, mixed>>
     */
    public function daftarStokPetani(Pengguna $petani): array
    {
        $stokList = Stok::with(['komoditas', 'lahan'])
            ->where('petani_id', $petani->id)
            ->orderBy('dibuat_pada', 'desc')
            ->get();

        return $stokList->map(fn (Stok $s) => $this->bentukStok($s))->all();
    }

    /**
     * Petani menambah stok siap jual.
     *
     * @param  array{
     *     komoditas_id: string,
     *     lahan_id?: string|null,
     *     jumlah_kg: float|int,
     *     harga_per_kg: int,
     *     tanggal_panen: string,
     *     foto?: string|null
     * }  $data
     */
    public function tambahStok(Pengguna $petani, array $data): array
    {
        $jumlahKg = (float) $data['jumlah_kg'];
        $hargaPerKg = (int) $data['harga_per_kg'];

        if ($jumlahKg <= 0 || $hargaPerKg <= 0) {
            throw new GalatApi('VALIDASI');
        }

        $stok = Stok::create([
            'petani_id' => $petani->id,
            'komoditas_id' => $data['komoditas_id'],
            'lahan_id' => $data['lahan_id'] ?? null,
            'jumlah_kg' => $jumlahKg,
            'sisa_kg' => $jumlahKg,
            'harga_per_kg' => $hargaPerKg,
            'tanggal_panen' => $data['tanggal_panen'],
            'foto' => $data['foto'] ?? null,
            'status' => 'tersedia',
        ]);

        return $this->bentukStok($stok->fresh(['komoditas', 'lahan']));
    }

    /**
     * Petani mengubah stok miliknya (misal harga, sisa_kg, status).
     *
     * @param  array{
     *     harga_per_kg?: int,
     *     status?: string,
     *     foto?: string|null
     * }  $data
     */
    public function ubahStok(Pengguna $petani, string $id, array $data): array
    {
        $stok = Stok::where('id', $id)->first() ?? throw new GalatApi('TIDAK_DITEMUKAN');

        if ($stok->petani_id !== $petani->id) {
            throw new GalatApi('TIDAK_DIIZINKAN');
        }

        if (isset($data['harga_per_kg'])) {
            $harga = (int) $data['harga_per_kg'];
            if ($harga <= 0) {
                throw new GalatApi('VALIDASI');
            }
            $stok->harga_per_kg = $harga;
        }

        if (isset($data['status'])) {
            if (! in_array($data['status'], ['tersedia', 'habis', 'ditarik'], true)) {
                throw new GalatApi('VALIDASI');
            }
            $stok->status = $data['status'];
        }

        if (array_key_exists('foto', $data)) {
            $stok->foto = $data['foto'];
        }

        $stok->save();

        return $this->bentukStok($stok->fresh(['komoditas', 'lahan']));
    }

    /**
     * Pembeli melihat stok sekitar dalam radius tertentu.
     * Jarak dihitung dari titik tengah desa petani ke titik pembeli / desa pembeli.
     *
     * @return array<int, array<string, mixed>>
     */
    public function ambilStokSekitar(Pengguna $pembeli, ?string $komoditasId, int $radiusKm = 15): array
    {
        // Lokasi acuan pembeli: dari desa pembeli (atau profil pembeli)
        $wilayahPembeliId = $pembeli->wilayah_id ?? $pembeli->profilPembeli?->wilayah_id;
        $wilayahPembeli = $wilayahPembeliId ? Wilayah::find($wilayahPembeliId) : null;
        $titikPembeli = Jarak::titik($wilayahPembeli);

        $kueri = Stok::with(['komoditas', 'petani.wilayah'])
            ->where('status', 'tersedia')
            ->where('sisa_kg', '>', 0);

        if ($komoditasId) {
            $kueri->where('komoditas_id', $komoditasId);
        }

        $semuaStok = $kueri->get();
        $hasil = [];

        foreach ($semuaStok as $stok) {
            $petani = $stok->petani;
            $wilayahPetani = $petani?->wilayah;
            $titikPetani = Jarak::titik($wilayahPetani);

            $jarakKm = null;
            if ($titikPembeli && $titikPetani) {
                $jarakKm = round(Jarak::jarakKm($titikPembeli, $titikPetani), 1);
                if ($jarakKm > $radiusKm) {
                    continue;
                }
            }

            $hasil[] = array_merge($this->bentukStok($stok), [
                'nama_petani' => $petani->nama,
                'desa' => $wilayahPetani->desa,
                'kecamatan' => $wilayahPetani->kecamatan,
                'jarak_km' => $jarakKm,
            ]);
        }

        // Urutkan terdekat dulu
        usort($hasil, function ($a, $b) {
            if ($a['jarak_km'] === null && $b['jarak_km'] === null) {
                return 0;
            }
            if ($a['jarak_km'] === null) {
                return 1;
            }
            if ($b['jarak_km'] === null) {
                return -1;
            }

            return $a['jarak_km'] <=> $b['jarak_km'];
        });

        return $hasil;
    }

    /**
     * Pembeli membeli stok dengan transaksi dan row lock.
     *
     * @param  array{
     *     jumlah_kg: float|int,
     *     metode_bayar: 'cod'|'bayar_di_aplikasi',
     *     alamat_antar: string,
     *     kunci_idempoten?: string|null
     * }  $data
     */
    public function beliStok(Pengguna $pembeli, string $stokId, array $data): array
    {
        // Hanya pembeli terverifikasi yang boleh memasang pesanan/membeli
        if ($pembeli->peran?->value !== 'pembeli') {
            throw new GalatApi('TIDAK_DIIZINKAN');
        }

        $profil = $pembeli->profilPembeli;
        if (! $profil || $profil->status_verifikasi->value !== 'terverifikasi') {
            throw new GalatApi('BELUM_TERVERIFIKASI');
        }

        $jumlahBeli = (float) $data['jumlah_kg'];
        $metodeBayar = $data['metode_bayar'];
        $alamatAntar = trim($data['alamat_antar']);

        if ($jumlahBeli <= 0 || empty($alamatAntar)) {
            throw new GalatApi('VALIDASI');
        }

        return DB::transaction(function () use ($pembeli, $stokId, $jumlahBeli, $metodeBayar, $alamatAntar, $data) {
            /** @var Stok|null $stok */
            $stok = Stok::where('id', $stokId)->lockForUpdate()->first();

            if (! $stok || $stok->status !== 'tersedia') {
                throw new GalatApi('STOK_TIDAK_CUKUP');
            }

            if ($stok->sisa_kg < $jumlahBeli) {
                throw new GalatApi('STOK_TIDAK_CUKUP');
            }

            // Kurangi sisa_kg
            $stok->sisa_kg = round($stok->sisa_kg - $jumlahBeli, 2);
            if ($stok->sisa_kg <= 0) {
                $stok->status = 'habis';
            }
            $stok->save();

            $nilai = (int) round($jumlahBeli * $stok->harga_per_kg);

            $pesananStok = PesananStok::create([
                'pembeli_id' => $pembeli->id,
                'stok_id' => $stok->id,
                'petani_id' => $stok->petani_id,
                'jumlah_kg' => $jumlahBeli,
                'harga_per_kg' => $stok->harga_per_kg,
                'nilai' => $nilai,
                'metode_bayar' => $metodeBayar,
                'alamat_antar' => $alamatAntar,
                'status' => 'menunggu',
                'waktu_menunggu' => now(),
            ]);

            // Bila bayar di aplikasi: buat baris pembayaran ditahan
            // Bila COD: jangan pernah buat baris pembayaran (PRD F-07)
            if ($metodeBayar === 'bayar_di_aplikasi') {
                Pembayaran::create([
                    'pesanan_stok_id' => $pesananStok->id,
                    'pesanan_id' => null,
                    'jenis' => JenisPembayaran::Kiriman,
                    'nominal' => $nilai,
                    'status' => StatusPembayaran::Ditahan,
                    'referensi' => 'TIRUAN-STOK-'.strtoupper(Str::random(8)),
                    'mode_uji_coba' => true,
                    'kunci_idempoten' => $data['kunci_idempoten'] ?? null,
                ]);
            }

            return $this->bentukPesananStok($pesananStok->fresh(['stok.komoditas', 'petani', 'pembeli']));
        });
    }

    /**
     * Petani menerima pesanan stok.
     */
    public function terimaPesanan(Pengguna $petani, string $pesananStokId): array
    {
        $pesanan = PesananStok::where('id', $pesananStokId)->first() ?? throw new GalatApi('TIDAK_DITEMUKAN');

        if ($pesanan->petani_id !== $petani->id) {
            throw new GalatApi('TIDAK_DIIZINKAN');
        }

        if ($pesanan->status !== 'menunggu') {
            throw new GalatApi('STATUS_TIDAK_SESUAI');
        }

        $pesanan->status = 'diterima';
        $pesanan->waktu_diterima = now();
        $pesanan->save();

        return $this->bentukPesananStok($pesanan->fresh(['stok.komoditas', 'petani', 'pembeli']));
    }

    /**
     * Petani menolak pesanan stok (sisa_kg dikembalikan ke stok).
     */
    public function tolakPesanan(Pengguna $petani, string $pesananStokId, ?string $alasan = null): array
    {
        $pesanan = PesananStok::where('id', $pesananStokId)->first() ?? throw new GalatApi('TIDAK_DITEMUKAN');

        if ($pesanan->petani_id !== $petani->id) {
            throw new GalatApi('TIDAK_DIIZINKAN');
        }

        if ($pesanan->status !== 'menunggu') {
            throw new GalatApi('STATUS_TIDAK_SESUAI');
        }

        return DB::transaction(function () use ($pesanan, $alasan) {
            // Kembalikan sisa_kg ke stok
            $stok = Stok::where('id', $pesanan->stok_id)->lockForUpdate()->first();
            if ($stok) {
                $stok->sisa_kg = round($stok->sisa_kg + $pesanan->jumlah_kg, 2);
                if ($stok->status === 'habis' && $stok->sisa_kg > 0) {
                    $stok->status = 'tersedia';
                }
                $stok->save();
            }

            $pesanan->status = 'ditolak';
            $pesanan->alasan_batal = $alasan;
            $pesanan->waktu_ditolak = now();
            $pesanan->save();

            // Kembalikan dana bila bayar_di_aplikasi
            if ($pesanan->metode_bayar === 'bayar_di_aplikasi') {
                $pembayaran = Pembayaran::where('pesanan_stok_id', $pesanan->id)->first();
                if ($pembayaran) {
                    $pembayaran->status = StatusPembayaran::Dikembalikan;
                    $pembayaran->save();
                }
            }

            return $this->bentukPesananStok($pesanan->fresh(['stok.komoditas', 'petani', 'pembeli']));
        });
    }

    /**
     * Petani menandai pesanan stok telah dikirim.
     */
    public function kirimPesanan(Pengguna $petani, string $pesananStokId): array
    {
        $pesanan = PesananStok::where('id', $pesananStokId)->first() ?? throw new GalatApi('TIDAK_DITEMUKAN');

        if ($pesanan->petani_id !== $petani->id) {
            throw new GalatApi('TIDAK_DIIZINKAN');
        }

        if ($pesanan->status !== 'diterima') {
            throw new GalatApi('STATUS_TIDAK_SESUAI');
        }

        $pesanan->status = 'dikirim';
        $pesanan->waktu_dikirim = now();
        $pesanan->save();

        return $this->bentukPesananStok($pesanan->fresh(['stok.komoditas', 'petani', 'pembeli']));
    }

    /**
     * Pembeli mengonfirmasi pesanan stok selesai / diterima.
     */
    public function selesaiPesanan(Pengguna $pembeli, string $pesananStokId): array
    {
        $pesanan = PesananStok::where('id', $pesananStokId)->first() ?? throw new GalatApi('TIDAK_DITEMUKAN');

        if ($pesanan->pembeli_id !== $pembeli->id) {
            throw new GalatApi('TIDAK_DIIZINKAN');
        }

        if ($pesanan->status !== 'dikirim') {
            throw new GalatApi('STATUS_TIDAK_SESUAI');
        }

        return DB::transaction(function () use ($pesanan) {
            $pesanan->status = 'selesai';
            $pesanan->waktu_selesai = now();
            $pesanan->save();

            // Bila bayar di aplikasi, cairkan pembayaran
            if ($pesanan->metode_bayar === 'bayar_di_aplikasi') {
                $pembayaran = Pembayaran::where('pesanan_stok_id', $pesanan->id)->first();
                if ($pembayaran && $pembayaran->status === StatusPembayaran::Ditahan) {
                    $pembayaran->status = StatusPembayaran::Cair;
                    $pembayaran->save();
                }
            }

            return $this->bentukPesananStok($pesanan->fresh(['stok.komoditas', 'petani', 'pembeli']));
        });
    }

    /**
     * Pembeli membatalkan pesanan stok (hanya saat status menunggu).
     */
    public function batalkanPesanan(Pengguna $pembeli, string $pesananStokId, ?string $alasan = null): array
    {
        $pesanan = PesananStok::where('id', $pesananStokId)->first() ?? throw new GalatApi('TIDAK_DITEMUKAN');

        if ($pesanan->pembeli_id !== $pembeli->id) {
            throw new GalatApi('TIDAK_DIIZINKAN');
        }

        if ($pesanan->status !== 'menunggu') {
            throw new GalatApi('STATUS_TIDAK_SESUAI');
        }

        return DB::transaction(function () use ($pesanan, $alasan) {
            $stok = Stok::where('id', $pesanan->stok_id)->lockForUpdate()->first();
            if ($stok) {
                $stok->sisa_kg = round($stok->sisa_kg + $pesanan->jumlah_kg, 2);
                if ($stok->status === 'habis' && $stok->sisa_kg > 0) {
                    $stok->status = 'tersedia';
                }
                $stok->save();
            }

            $pesanan->status = 'dibatalkan';
            $pesanan->alasan_batal = $alasan;
            $pesanan->waktu_dibatalkan = now();
            $pesanan->save();

            if ($pesanan->metode_bayar === 'bayar_di_aplikasi') {
                $pembayaran = Pembayaran::where('pesanan_stok_id', $pesanan->id)->first();
                if ($pembayaran) {
                    $pembayaran->status = StatusPembayaran::Dikembalikan;
                    $pembayaran->save();
                }
            }

            return $this->bentukPesananStok($pesanan->fresh(['stok.komoditas', 'petani', 'pembeli']));
        });
    }

    /**
     * Daftar pesanan stok milik pengguna (petani atau pembeli).
     *
     * @return array<int, array<string, mixed>>
     */
    public function pesananSaya(Pengguna $pengguna): array
    {
        $kueri = PesananStok::with(['stok.komoditas', 'petani', 'pembeli']);

        if ($pengguna->peran?->value === 'petani') {
            $kueri->where('petani_id', $pengguna->id);
        } elseif ($pengguna->peran?->value === 'pembeli') {
            $kueri->where('pembeli_id', $pengguna->id);
        } else {
            return [];
        }

        $list = $kueri->orderBy('dibuat_pada', 'desc')->get();

        return $list->map(fn (PesananStok $p) => $this->bentukPesananStok($p))->all();
    }

    /**
     * @return array<string, mixed>
     */
    public function bentukStok(Stok $stok): array
    {
        return [
            'id' => $stok->id,
            'petani_id' => $stok->petani_id,
            'komoditas_id' => $stok->komoditas_id,
            'komoditas' => $stok->komoditas ? [
                'id' => $stok->komoditas->id,
                'nama' => $stok->komoditas->nama,
            ] : null,
            'lahan_id' => $stok->lahan_id,
            'jumlah_kg' => (float) $stok->jumlah_kg,
            'sisa_kg' => (float) $stok->sisa_kg,
            'harga_per_kg' => (int) $stok->harga_per_kg,
            'tanggal_panen' => $stok->tanggal_panen->toDateString(),
            'foto' => $stok->foto,
            'status' => $stok->status,
            'dibuat_pada' => $stok->dibuat_pada->toISOString(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function bentukPesananStok(PesananStok $p): array
    {
        return [
            'id' => $p->id,
            'pembeli_id' => $p->pembeli_id,
            'stok_id' => $p->stok_id,
            'petani_id' => $p->petani_id,
            'nama_petani' => $p->petani?->nama,
            'nama_pembeli' => $p->pembeli?->nama,
            'komoditas_nama' => $p->stok?->komoditas->nama ?? 'Komoditas',
            'jumlah_kg' => (float) $p->jumlah_kg,
            'harga_per_kg' => (int) $p->harga_per_kg,
            'nilai' => (int) $p->nilai,
            'metode_bayar' => $p->metode_bayar,
            'alamat_antar' => $p->alamat_antar,
            'status' => $p->status,
            'alasan_batal' => $p->alasan_batal,
            'waktu_menunggu' => $p->waktu_menunggu?->toISOString(),
            'waktu_diterima' => $p->waktu_diterima?->toISOString(),
            'waktu_dikirim' => $p->waktu_dikirim?->toISOString(),
            'waktu_selesai' => $p->waktu_selesai?->toISOString(),
            'waktu_dibatalkan' => $p->waktu_dibatalkan?->toISOString(),
            'waktu_ditolak' => $p->waktu_ditolak?->toISOString(),
            'dibuat_pada' => $p->dibuat_pada->toISOString(),
        ];
    }
}
