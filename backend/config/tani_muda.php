<?php

return [
    // Resep contoh (status draf, `contoh = true`) boleh terlihat petani di demo dan uji coba (D-12).
    // Produksi: false, sehingga hanya resep yang divalidasi penyuluh yang terlihat.
    'tampilkan_resep_contoh' => (bool) env('TAMPILKAN_RESEP_CONTOH', false),

    // Wilayah provinsi aktif untuk pemilihan wilayah (D-67, AG-41).
    // Default '33' (Jawa Tengah) untuk Jambore Pemuda Provinsi Jawa Tengah.
    'wilayah_provinsi_aktif' => env('WILAYAH_PROVINSI_AKTIF', '33'),
];
