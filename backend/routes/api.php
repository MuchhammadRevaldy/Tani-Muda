<?php

use App\Http\Controllers\Api\V1\KesehatanController;
use Illuminate\Support\Facades\Route;

// Semua rute di berkas ini berawalan /api/v1 (bootstrap/app.php, kontrak-api.md bagian 1.1).

Route::get('/kesehatan', KesehatanController::class);
