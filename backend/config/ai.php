<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Konfigurasi AI Fondasi F-00 (D-64, PRD Tambahan v1.1)
    |--------------------------------------------------------------------------
    |
    | Mendukung OpenAI dan penyedia lain yang kompatibel OpenAI lewat AI_BASE_URL,
    | serta driver tiruan offline untuk demo dan pengujian tanpa internet.
    |
    */
    'driver' => env('AI_DRIVER', 'tiruan'),
    'base_url' => env('AI_BASE_URL', 'https://api.openai.com/v1'),
    'api_key' => env('OPENAI_API_KEY'),
    'model_teks' => env('AI_MODEL_TEKS'),
    'model_gambar' => env('AI_MODEL_GAMBAR'),
    'model_embedding' => env('AI_MODEL_EMBEDDING'),
    'batas_harian' => (int) env('AI_BATAS_HARIAN', 30),
    'timeout' => 30,
];
