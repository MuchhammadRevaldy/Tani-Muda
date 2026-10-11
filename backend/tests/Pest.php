<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

// Tes fitur memakai basis data MariaDB `tani_muda_uji` (phpunit.xml), dibuat ulang tiap rangkaian.
pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

pest()->extend(TestCase::class)->in('Unit');

/** Jalur dari akar repositori (backend/ ada satu tingkat di bawahnya). */
function jalurRepo(string $relatif): string
{
    return dirname(__DIR__, 2).'/'.$relatif;
}
