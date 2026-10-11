<?php

/*
 * Pesan validasi umum Bahasa Indonesia (T5.03). Form Request boleh menimpa pesan per kolom dengan
 * teks yang menyebut apa yang harus dilakukan (D-09). Aturan yang tidak tercantum memakai bahasa
 * Inggris bawaan Laravel (APP_FALLBACK_LOCALE=en).
 */

return [
    'accepted' => 'Isian :attribute harus disetujui.',
    'array' => 'Isian :attribute harus berupa daftar.',
    'between' => [
        'array' => 'Isian :attribute harus berisi :min sampai :max item.',
        'file' => 'Ukuran :attribute harus di antara :min dan :max kilobita.',
        'numeric' => 'Isian :attribute harus di antara :min dan :max.',
        'string' => 'Isian :attribute harus :min sampai :max karakter.',
    ],
    'boolean' => 'Isian :attribute harus ya atau tidak.',
    'date' => 'Isian :attribute bukan tanggal yang benar.',
    'date_format' => 'Isian :attribute harus berformat :format.',
    'decimal' => 'Isian :attribute harus memiliki :decimal angka desimal.',
    'digits' => 'Isian :attribute harus :digits angka.',
    'digits_between' => 'Isian :attribute harus :min sampai :max angka.',
    'distinct' => 'Isian :attribute tidak boleh kembar.',
    'email' => 'Isian :attribute harus alamat email yang benar.',
    'exists' => 'Pilihan :attribute tidak ditemukan.',
    'file' => 'Isian :attribute harus berupa berkas.',
    'gt' => [
        'numeric' => 'Isian :attribute harus lebih dari :value.',
    ],
    'gte' => [
        'numeric' => 'Isian :attribute tidak boleh kurang dari :value.',
    ],
    'image' => 'Isian :attribute harus berupa gambar.',
    'in' => 'Pilihan :attribute tidak tersedia.',
    'integer' => 'Isian :attribute harus bilangan bulat.',
    'lt' => [
        'numeric' => 'Isian :attribute harus kurang dari :value.',
    ],
    'lte' => [
        'numeric' => 'Isian :attribute tidak boleh lebih dari :value.',
    ],
    'max' => [
        'array' => 'Isian :attribute paling banyak :max item.',
        'file' => 'Ukuran :attribute paling besar :max kilobita.',
        'numeric' => 'Isian :attribute tidak boleh lebih dari :max.',
        'string' => 'Isian :attribute paling banyak :max karakter.',
    ],
    'mimes' => 'Isian :attribute harus berkas berjenis :values.',
    'min' => [
        'array' => 'Isian :attribute paling sedikit :min item.',
        'file' => 'Ukuran :attribute paling kecil :min kilobita.',
        'numeric' => 'Isian :attribute tidak boleh kurang dari :min.',
        'string' => 'Isian :attribute paling sedikit :min karakter.',
    ],
    'not_in' => 'Pilihan :attribute tidak tersedia.',
    'numeric' => 'Isian :attribute harus berupa angka.',
    'present' => 'Isian :attribute wajib dikirim.',
    'regex' => 'Format :attribute tidak benar.',
    'required' => 'Isian :attribute wajib diisi.',
    'required_if' => 'Isian :attribute wajib diisi bila :other bernilai :value.',
    'required_with' => 'Isian :attribute wajib diisi bila :values diisi.',
    'size' => [
        'array' => 'Isian :attribute harus berisi :size item.',
        'numeric' => 'Isian :attribute harus bernilai :size.',
        'string' => 'Isian :attribute harus :size karakter.',
    ],
    'string' => 'Isian :attribute harus berupa teks.',
    'unique' => 'Isian :attribute sudah dipakai.',
    'uuid' => 'Isian :attribute harus UUID yang benar.',

    'custom' => [],

    'attributes' => [],
];
