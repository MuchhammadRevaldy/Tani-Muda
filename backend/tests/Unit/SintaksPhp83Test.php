<?php

/*
 * Kode backend harus jalan di PHP 8.3 (VPS, D-53), padahal laptop memakai PHP 8.5. Larastan dengan
 * `phpVersion: 80300` menolak property hooks, asymmetric visibility, dan operator pipa, tetapi
 * meloloskan dua hal yang diperiksa di sini (D-54):
 * - `new Kelas()->metode()` tanpa kurung pembungkus (PHP 8.4);
 * - fungsi baru PHP 8.4/8.5, karena PHPStan membaca daftar fungsi dari PHP yang sedang berjalan.
 */

const FUNGSI_PHP_84_KE_ATAS = [
    'array_find', 'array_find_key', 'array_any', 'array_all', 'mb_trim', 'mb_ltrim', 'mb_rtrim',
    'mb_ucfirst', 'mb_lcfirst', 'bcdivmod', 'request_parse_body', 'http_get_last_response_headers',
    'http_clear_last_response_headers', 'fpow', 'array_first', 'array_last', 'get_error_handler',
    'get_exception_handler', 'clone_with', 'locale_is_right_to_left', 'grapheme_levenshtein',
];

/** @return list<string> */
function berkasPhpBackend(): array
{
    $berkas = [];
    foreach (['app', 'bootstrap', 'config', 'database', 'routes', 'tests'] as $folder) {
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(base_path($folder), FilesystemIterator::SKIP_DOTS));
        foreach ($iterator as $f) {
            if ($f->getExtension() === 'php' && ! str_contains($f->getPathname(), DIRECTORY_SEPARATOR.'cache'.DIRECTORY_SEPARATOR)) {
                $berkas[] = $f->getPathname();
            }
        }
    }

    return $berkas;
}

/**
 * Pelanggaran di satu sumber PHP, sebagai "baris: keterangan".
 *
 * @return list<string>
 */
function pelanggaranPhp84(string $sumber): array
{
    $token = array_values(array_filter(
        PhpToken::tokenize($sumber),
        fn (PhpToken $t) => ! $t->isIgnorable(),
    ));
    $salah = [];
    foreach ($token as $i => $t) {
        // Panggilan fungsi global: nama tanpa `->`, `::`, `function`, atau `new` di depannya.
        if ($t->is([T_STRING, T_NAME_FULLY_QUALIFIED]) && ($token[$i + 1] ?? null)?->text === '(') {
            $nama = strtolower(ltrim($t->text, '\\'));
            $sebelum = $token[$i - 1] ?? null;
            if (in_array($nama, FUNGSI_PHP_84_KE_ATAS, true)
                && ! $sebelum?->is([T_OBJECT_OPERATOR, T_NULLSAFE_OBJECT_OPERATOR, T_DOUBLE_COLON, T_FUNCTION, T_NEW])) {
                $salah[] = "{$t->line}: fungsi {$nama}() baru ada di PHP 8.4+";
            }
        }
        // `new Kelas(...)` yang langsung diikuti `->`, `?->`, `::`, atau `[`.
        if ($t->is(T_NEW)) {
            $j = $i + 1;
            while (isset($token[$j]) && $token[$j]->is([T_STRING, T_NAME_QUALIFIED, T_NAME_FULLY_QUALIFIED, T_NAME_RELATIVE, T_STATIC])) {
                $j++;
            }
            if (($token[$j] ?? null)?->text !== '(') {
                continue;
            }
            for ($kedalaman = 0; isset($token[$j]); $j++) {
                $kedalaman += match ($token[$j]->text) {
                    '(' => 1,
                    ')' => -1,
                    default => 0,
                };
                if ($kedalaman === 0) {
                    break;
                }
            }
            $berikut = $token[$j + 1] ?? null;
            if ($berikut?->is([T_OBJECT_OPERATOR, T_NULLSAFE_OBJECT_OPERATOR, T_DOUBLE_COLON]) || $berikut?->text === '[') {
                $salah[] = "{$t->line}: new tanpa kurung pembungkus baru ada di PHP 8.4+";
            }
        }
    }

    return $salah;
}

it('pemeriksa mengenali sintaks dan fungsi PHP 8.4+', function () {
    expect(pelanggaranPhp84('<?php $a = new Foo()->bar(); $b = new \A\B(1, f(2))?->c; $c = new Foo()["x"];'))->toHaveCount(3)
        ->and(pelanggaranPhp84('<?php $x = array_find([1], fn ($v) => $v); $y = \mb_trim(" a ");'))->toHaveCount(2)
        ->and(pelanggaranPhp84('<?php $a = (new Foo())->bar(); $b = new Foo(); f(new Foo(), 1); $o->array_find(1); Foo::array_any(); new class {};'))->toBe([]);
});

it('kode backend tidak memakai sintaks atau fungsi PHP 8.4+ (target VPS PHP 8.3)', function () {
    $salah = [];
    foreach (berkasPhpBackend() as $berkas) {
        foreach (pelanggaranPhp84((string) file_get_contents($berkas)) as $p) {
            $salah[] = str_replace(base_path().DIRECTORY_SEPARATOR, '', $berkas).':'.$p;
        }
    }
    expect($salah)->toBe([]);
});
