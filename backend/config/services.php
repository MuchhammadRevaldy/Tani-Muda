<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    // Pengirim kode OTP: `log` (lokal saja; arsitektur-backend.md bagian 5). Penyedia SMS menyusul.
    'otp' => [
        'driver' => env('OTP_DRIVER', 'log'),
    ],

    // Penyedia pembayaran: `tiruan` (mode uji coba, D-10). Payment gateway sungguhan menyusul.
    'pembayaran' => [
        'driver' => env('PEMBAYARAN_DRIVER', 'tiruan'),
    ],

    // Penyedia berita harga panen: `tiruan`, `gnews`, atau `google` (F-10).
    'berita' => [
        'driver' => env('BERITA_DRIVER', 'tiruan'),
        'key' => env('BERITA_API_KEY', ''),
        'cx' => env('GOOGLE_SEARCH_CX', ''),
    ],

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
