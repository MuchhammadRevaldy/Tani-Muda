<?php

namespace App\Http\Bentuk;

use App\Models\Pengguna;

/** `Akun` (kontrak-api.md 2.1–2.2): pengguna yang sedang masuk beserta profil pembelinya. */
final class BentukAkun
{
    /** @return array{pengguna: array<string, mixed>, profil_pembeli: array<string, mixed>|null} */
    public static function dari(Pengguna $pengguna): array
    {
        $pengguna->refresh();

        return [
            'pengguna' => $pengguna->withoutRelations()->toArray(),
            'profil_pembeli' => $pengguna->profilPembeli?->toArray(),
        ];
    }
}
