<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Konfigurasi AI Fondasi F-00 (D-64, PRD Tambahan v1.1)
    |--------------------------------------------------------------------------
    |
    | Mendukung OpenAI-compatible provider (Dattio AI via bandelbanget.xyz)
    | serta driver tiruan offline untuk demo dan pengujian tanpa internet.
    |
    */
    'driver' => env('AI_DRIVER', 'tiruan'),
    'base_url' => env('AI_BASE_URL', 'https://bandelbanget.xyz/v1'),
    'api_key' => env('OPENAI_API_KEY'),
    'model_teks' => env('AI_MODEL_TEKS', 'glm-5.2'),
    'model_gambar' => env('AI_MODEL_GAMBAR', 'glm-5.2'),
    'model_embedding' => env('AI_MODEL_EMBEDDING', 'text-embedding-3-small'),
    'batas_harian' => (int) env('AI_BATAS_HARIAN', 30),
    'timeout' => 30,
];
