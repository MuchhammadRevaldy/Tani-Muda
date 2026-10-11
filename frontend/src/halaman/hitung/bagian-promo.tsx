/**
 * Promo dari toko tani (papan 16–19, T4.06, PRD P0-35): terpisah dari rekomendasi, selalu berlabel
 * "Promo", dan tidak pernah menjadi masukan perhitungan harga atau urutan merek.
 */
import { usePromo } from '../../api/kueri';
import { LabelKecil } from '../../komponen/label-kecil';
import { angkaJarak } from '../../lib/jarak';
import { teksHitung as t } from '../../teks/hitung';

export function BagianPromo() {
  const promoQ = usePromo();
  const daftar = promoQ.data ?? [];
  if (!daftar.length) return null;
  return (
    <section aria-labelledby="judul-promo" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 id="judul-promo" className="m-0 text-judul-bagian font-semibold">
          {t.promoJudul}
        </h2>
        <p className="m-0 text-keterangan text-teks-pendukung">{t.promoKet}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {daftar.map((p) => (
          <article
            key={p.id}
            className="flex flex-col gap-1.5 rounded-lg border-1.5 border-dashed border-garis-kuat bg-putih p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <LabelKecil nada="promo">{t.promo}</LabelKecil>
              <span className="font-semibold">{p.pemasang}</span>
            </div>
            {p.jarak_km !== null ? (
              <span className="text-keterangan text-teks-pendukung">
                {t.promoJarak(angkaJarak(p.jarak_km))}
              </span>
            ) : null}
            <p className="m-0">{p.isi}</p>
            <span className="text-keterangan text-teks-pendukung">
              {t.berlakuSampai(p.berlaku_sampai)}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
