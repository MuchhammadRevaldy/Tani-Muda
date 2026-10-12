<?php

return [
    // Resep contoh (status draf, `contoh = true`) boleh terlihat petani di demo dan uji coba (D-12).
    // Produksi: false, sehingga hanya resep yang divalidasi penyuluh yang terlihat.
    'tampilkan_resep_contoh' => (bool) env('TAMPILKAN_RESEP_CONTOH', false),
];
