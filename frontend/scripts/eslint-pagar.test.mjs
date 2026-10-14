import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const cwd = fileURLToPath(new URL('..', import.meta.url));
const eslint = new ESLint({ cwd });

async function aturan(kode, filePath) {
  const [hasil] = await eslint.lintText(kode, { filePath });
  return hasil.messages.map((m) => m.ruleId);
}

describe('pagar impor D-20 (T3.12)', { timeout: 60_000 }, () => {
  it('halaman yang mengimpor data tiruan atau penyedia gagal lint', async () => {
    expect(
      await aturan(
        "import { buatKlienTiruan } from '../api/tiruan/klien-tiruan';\nexport const x = buatKlienTiruan;\n",
        'src/halaman/contoh.tsx',
      ),
    ).toContain('no-restricted-imports');
    // Data contoh bersama (shared/data-contoh, T5.01) lewat alias maupun jalur relatif.
    expect(
      await aturan(
        "import data from '@data-contoh/resep.json';\nexport const x = data;\n",
        'src/halaman/hitung/contoh.tsx',
      ),
    ).toContain('no-restricted-imports');
    expect(
      await aturan(
        "import data from '../../../../shared/data-contoh/resep.json';\nexport const x = data;\n",
        'src/halaman/hitung/contoh.tsx',
      ),
    ).toContain('no-restricted-imports');
    expect(
      await aturan(
        "import { OtpTiruan } from '../penyedia/otp/otp-tiruan';\nexport const x = OtpTiruan;\n",
        'src/komponen/contoh.tsx',
      ),
    ).toContain('no-restricted-imports');
  });
  it('fetch langsung di halaman gagal lint', async () => {
    expect(
      await aturan("export const x = () => fetch('/api/v1/akun');\n", 'src/halaman/contoh.tsx'),
    ).toContain('no-restricted-globals');
  });
  it('hook kueri boleh dipakai halaman', async () => {
    expect(
      await aturan(
        "import { useKomoditas } from '../api/kueri';\nexport const x = useKomoditas;\n",
        'src/halaman/contoh.tsx',
      ),
    ).toEqual([]);
  });
  it('src/lib tetap tidak boleh mengimpor lapisan API', async () => {
    expect(
      await aturan(
        "import { GalatApi } from '../api/galat';\nexport const x = GalatApi;\n",
        'src/lib/contoh.ts',
      ),
    ).toContain('no-restricted-imports');
  });
});
