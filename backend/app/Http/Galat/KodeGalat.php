<?php

namespace App\Http\Galat;

/**
 * Kode galat API, status HTTP, dan teksnya (kontrak-api.md bagian 1.4).
 *
 * Teks sama persis dengan frontend/src/teks/galat-api.ts; tes KodeGalatTest memeriksa keduanya
 * tetap sama. Teks kode logika inti (src/lib/hasil.ts, mis. LUAS_KOSONG) ada di TEKS_INTI, sama
 * dengan frontend/src/teks/galat.ts; kode yang tidak tercantum di STATUS berstatus 422.
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
        'BELUM_TERSEDIA' => 501,
        'AI_TIDAK_TERSEDIA' => 503,
        'BATAS_AI_TERCAPAI' => 429,
        'PERSETUJUAN_AI_WAJIB' => 403,
        'CUACA_TIDAK_TERSEDIA' => 503,
        'STOK_TIDAK_CUKUP' => 409,
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
        'BELUM_TERSEDIA' => 'Fitur ini belum tersedia di versi demo',
        'AI_TIDAK_TERSEDIA' => 'Fitur pintar sedang tidak bisa dipakai. Coba lagi nanti',
        'BATAS_AI_TERCAPAI' => 'Batas pemakaian fitur pintar harianmu sudah tercapai. Coba lagi besok',
        'PERSETUJUAN_AI_WAJIB' => 'Centang persetujuan pemakaian fitur pintar dulu',
        'CUACA_TIDAK_TERSEDIA' => 'Data perkiraan cuaca belum bisa dimuat. Coba lagi nanti',
        'STOK_TIDAK_CUKUP' => 'Sisa stok tidak mencukupi',
        'GALAT_SERVER' => 'Ada yang tidak beres di server. Coba lagi sebentar lagi',
    ];

    /** Teks kode galat logika inti, sama persis dengan frontend/src/teks/galat.ts. */
    public const TEKS_INTI = [
        'UKURAN_KOSONG' => 'Isi ukurannya dulu',
        'UKURAN_NEGATIF' => 'Ukuran tidak boleh kurang dari nol',
        'SATUAN_TIDAK_DIKENAL' => 'Satuan ini belum dikenal di wilayahmu. Pakai m² atau hektare',
        'SATUAN_TIDAK_COCOK' => 'Satuan dosis dan satuan beli tidak cocok',
        'LUAS_KOSONG' => 'Isi luas lahan dulu',
        'LUBANG_KOSONG' => 'Isi jumlah lubang tanam dulu',
        'POLYBAG_KOSONG' => 'Isi jumlah polybag dulu',
        'VOLUME_KOSONG' => 'Isi volume tandon dulu',
        'DOSIS_NEGATIF' => 'Dosis tidak boleh kurang dari nol',
        'KEMASAN_TIDAK_VALID' => 'Ukuran kemasan harus lebih dari nol',
        'ISI_KEMASAN_KOSONG' => 'Isi kemasan harus lebih dari nol',
        'HARGA_NEGATIF' => 'Harga tidak boleh kurang dari nol',
        'JUMLAH_NEGATIF' => 'Jumlah tidak boleh kurang dari nol',
        'HARGA_JUAL_KOSONG' => 'Isi harga jual dulu',
        'PANEN_NEGATIF' => 'Perkiraan panen tidak boleh kurang dari nol',
        'HASIL_KOSONG' => 'Perkiraan hasil panen belum ada di resep',
        'NAMA_KOSONG' => 'Isi nama mereknya dulu',
        'NAMA_ITEM_KOSONG' => 'Isi nama item dulu',
        'PEMBAGIAN_TIDAK_VALID' => 'Jumlah siklus pembagian minimal 1',
        'HST_TIDAK_VALID' => 'Hari di resep tidak masuk akal',
        'INTERVAL_TIDAK_VALID' => 'Jarak hari tugas berulang minimal 1',
        'UMUR_PANEN_TIDAK_VALID' => 'Umur panen minimal 1 hari',
        'PERSEN_PANEN_JELEK_TIDAK_VALID' => 'Persen panen jelek harus lebih dari 0 dan paling besar 100',
        'BATAS_UKUR_TIDAK_VALID' => 'Batas bawah harus di bawah batas atas dan di dalam skala ukur',
        'TUGAS_TIDAK_ADA' => 'Tugas ini tidak ditemukan',
        'TUGAS_SUDAH_SELESAI' => 'Tugas ini sudah selesai',
        'TIDAK_BOLEH_DIGESER' => 'Tugas ini tidak bisa ditunda',
        'TUNDA_DI_LUAR_BATAS' => 'Tugas bisa ditunda 1 sampai 3 hari',
        'TIDAK_ADA_TIPE' => 'Tidak ada tugas jenis ini di siklus ini',
        'NILAI_DI_LUAR_SKALA' => 'Angka ini di luar skala alat ukur. Periksa lagi',
        'JUMLAH_KOSONG' => 'Isi jumlahnya dulu',
        'HARGA_KOSONG' => 'Isi harga per kg dulu',
        'MELEBIHI_PESANAN' => 'Jumlah melebihi sisa pesanan',
        'MELEBIHI_KIRIMAN' => 'Jumlah yang ditolak melebihi jumlah kiriman',
        'TOLAK_KOSONG' => 'Isi berat yang ditolak dulu',
        'ALASAN_TIDAK_DIKENAL' => 'Pilih salah satu alasan',
        'KETERANGAN_WAJIB' => 'Tulis alasannya dulu',
        'FREKUENSI_TIDAK_VALID' => 'Jadwal kiriman belum benar',
        'LAHAN_TIDAK_CUKUP' => 'Lahanmu tidak cukup untuk jumlah ini',
        'RATING_TIDAK_VALID' => 'Pilih nilai 1 sampai 5 bintang dulu',
        'JADWAL_TERLALU_DEKAT' => 'Panenmu belum sempat untuk jadwal kirim pesanan ini. Cari pesanan lain yang mulai kirimnya lebih lama',
        'NOMOR_HP_TIDAK_VALID' => 'Nomor HP belum benar. Contoh: 0812 3456 7890',
    ];

    public static function status(string $kode): int
    {
        return self::STATUS[$kode] ?? 422;
    }

    public static function teks(string $kode): string
    {
        return self::TEKS[$kode] ?? self::TEKS_INTI[$kode] ?? self::TEKS['GALAT_SERVER'];
    }
}
