<?php

namespace App\Http\Galat;

/**
 * Kode galat API, status HTTP, dan teksnya (kontrak-api.md bagian 1.4).
 *
 * Teks sama persis dengan frontend/src/teks/galat-api.ts; tes KodeGalatTest memeriksa keduanya
 * tetap sama. Kode logika inti (src/lib/hasil.ts, mis. LUAS_KOSONG) ditambahkan saat rumusnya
 * diport ke app/Domain/Hitung; kode yang tidak tercantum di STATUS berstatus 422.
 */
final class KodeGalat
{
    public const STATUS = [
        'BELUM_MASUK' => 401,
        'TIDAK_DIIZINKAN' => 403,
        'AKUN_NONAKTIF' => 403,
        'BELUM_TERVERIFIKASI' => 403,
        'PERAN_BELUM_DIPILIH' => 403,
        'TIDAK_DITEMUKAN' => 404,
        'BENTROK' => 409,
        'SESI_KEDALUWARSA' => 419,
        'MELEBIHI_PESANAN' => 409,
        'LAHAN_TIDAK_CUKUP' => 409,
        'JADWAL_TERLALU_DEKAT' => 409,
        'STATUS_TIDAK_SESUAI' => 409,
        'SUDAH_DINILAI' => 409,
        'MELEBIHI_SALDO' => 409,
        'PEMBAYARAN_GAGAL' => 402,
        'OTP_TERKUNCI' => 423,
        'NOMOR_SUDAH_DIPAKAI' => 409,
        'TERLALU_SERING' => 429,
        'GALAT_SERVER' => 500,
        'SUMBER_BELUM_TERSEDIA' => 503,
    ];

    public const TEKS = [
        'VALIDASI' => 'Ada isian yang belum benar',
        'BELUM_MASUK' => 'Masuk dulu dengan nomor HP',
        'TIDAK_DIIZINKAN' => 'Akunmu tidak bisa membuka bagian ini',
        'TIDAK_DITEMUKAN' => 'Data ini tidak ditemukan',
        'BENTROK' => 'Data ini sudah berubah. Muat ulang lalu coba lagi',
        'SESI_KEDALUWARSA' => 'Sesimu sudah berakhir. Muat ulang halaman lalu coba lagi',
        'TERLALU_SERING' => 'Terlalu sering. Tunggu sebentar lalu coba lagi',
        'AKUN_NONAKTIF' => 'Akunmu sedang dinonaktifkan sementara, jadi belum bisa mengambil pesanan baru',
        'BELUM_TERVERIFIKASI' => 'Usaha Anda belum terverifikasi, jadi belum bisa memasang pesanan',
        'PERAN_BELUM_DIPILIH' => 'Pilih peranmu dulu',
        'WILAYAH_WAJIB' => 'Isi desa lahanmu dulu',
        'WILAYAH_BELUM_TERSEDIA' => 'Desa ini belum tersedia di pilot Tani Muda. Pilih desa lain',
        'PRIVASI_WAJIB' => 'Centang persetujuan kebijakan privasi dulu',
        'OTP_SALAH' => 'Kode salah. Periksa SMS lalu coba lagi',
        'OTP_KEDALUWARSA' => 'Kode sudah kedaluwarsa. Minta kode baru',
        'OTP_TERKUNCI' => 'Terlalu banyak percobaan. Minta kode baru',
        'NOMOR_SUDAH_DIPAKAI' => 'Nomor ini sudah dipakai akun lain',
        'NOMOR_SAMA' => 'Ini nomormu sekarang. Isi nomor yang baru',
        'FOTO_WAJIB' => 'Ambil foto hasil panen dulu',
        'STATUS_TIDAK_SESUAI' => 'Langkah ini tidak bisa dilakukan sekarang',
        'SUDAH_DINILAI' => 'Kamu sudah memberi nilai untuk kiriman ini',
        'MELEBIHI_SALDO' => 'Nominal melebihi dana yang ditahan',
        'PEMBAYARAN_GAGAL' => 'Pembayaran belum berhasil. Uang Anda tidak terpotong; coba bayar lagi',
        'SUMBER_BELUM_TERSEDIA' => 'Sambungan ke server belum tersedia',
        'GALAT_SERVER' => 'Ada yang tidak beres di server. Coba lagi sebentar lagi',
    ];

    public static function status(string $kode): int
    {
        return self::STATUS[$kode] ?? 422;
    }

    public static function teks(string $kode): string
    {
        return self::TEKS[$kode] ?? self::TEKS['GALAT_SERVER'];
    }
}
