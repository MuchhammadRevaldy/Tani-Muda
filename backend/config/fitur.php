<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Sakelar Fitur Tambahan Tahap 7 (D-64, PRD Tambahan v1.1)
    |--------------------------------------------------------------------------
    |
    | Setiap fitur tambahan memiliki sakelar mandiri. Bila false, endpoint
    | menjawab 501 BELUM_TERSEDIA dan menu/tampilan terkait disembunyikan.
    |
    */
    'ai' => (bool) env('FITUR_AI', true),
    'saran_untung' => (bool) env('FITUR_SARAN_UNTUNG', true),
    'tanaman_baru' => (bool) env('FITUR_TANAMAN_BARU', true),
    'level' => (bool) env('FITUR_LEVEL', true),
    'deteksi' => (bool) env('FITUR_DETEKSI', true),
    'chatbot' => (bool) env('FITUR_CHATBOT', true),
    'cuaca' => (bool) env('FITUR_CUACA', true),
    'stok' => (bool) env('FITUR_STOK', true),
    'peta' => (bool) env('FITUR_PETA', true),
    'chat' => (bool) env('FITUR_CHAT', true),
    'harga_berita' => (bool) env('FITUR_HARGA_BERITA', true),
    'saran_harian' => (bool) env('FITUR_SARAN_HARIAN', true),
];
