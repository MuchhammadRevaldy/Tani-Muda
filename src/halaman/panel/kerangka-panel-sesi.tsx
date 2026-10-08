/**
 * Kerangka panel dengan sesi (T4.29, T4.38): kepala berisi logo, menu sesuai peran (admin:
 * verifikasi pembeli, sengketa, petani; mentor: resep, permintaan resep; admin juga melihat menu
 * mentor), nama pengguna, dan Keluar.
 */
import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useKeluarSesi, useSesi } from '../../api/sesi';
import { cx } from '../../komponen/gabung-kelas';
import { KerangkaPanel } from '../../komponen/kerangka';
import { Logo } from '../../komponen/navigasi';
import { teksPanel as t } from '../../teks/panel';

const MENU_ADMIN = [
  { ke: '/admin', label: t.admin.menuPembeli, akhir: true },
  { ke: '/admin/sengketa', label: t.admin.menuSengketa },
  { ke: '/admin/petani', label: t.admin.menuPetani },
];
const MENU_MENTOR = [
  { ke: '/mentor', label: t.mentor.menuResep, akhir: true },
  { ke: '/mentor/permintaan', label: t.mentor.menuPermintaan },
];

export function KerangkaPanelSesi({
  judul,
  keterangan,
  children,
}: {
  judul: string;
  keterangan?: ReactNode;
  children: ReactNode;
}) {
  const { akun } = useSesi();
  const { keluar, sedang } = useKeluarSesi();
  const navigate = useNavigate();
  const peran = akun?.pengguna.peran;
  const menu = peran === 'admin' ? [...MENU_ADMIN, ...MENU_MENTOR] : MENU_MENTOR;
  const kepala = (
    <header className="border-b border-garis bg-putih">
      <div className="mx-auto flex max-w-konten flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 lg:px-10">
        <Logo />
        <nav aria-label={t.navigasi} className="min-w-0 flex-1 overflow-x-auto">
          <ul className="m-0 flex list-none gap-1 p-0">
            {menu.map((m) => (
              <li key={m.ke}>
                <NavLink
                  to={m.ke}
                  end={m.akhir}
                  className={({ isActive }) =>
                    cx(
                      'fokus-cincin inline-flex min-h-sentuh items-center whitespace-nowrap rounded-md px-3 font-medium no-underline',
                      isActive ? 'bg-daun-lembut text-daun-tua' : 'text-teks hover:bg-embun-pagi',
                    )
                  }
                >
                  {m.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-teks-pendukung">{akun?.pengguna.nama}</span>
          <button
            type="button"
            disabled={sedang}
            onClick={() => void keluar().then(() => navigate('/masuk', { replace: true }))}
            className="fokus-cincin inline-flex min-h-sentuh cursor-pointer items-center rounded-md border-0 bg-transparent px-3 font-semibold text-tomat-teks"
          >
            {t.keluar}
          </button>
        </div>
      </div>
    </header>
  );
  return (
    <KerangkaPanel judul={judul} keterangan={keterangan} kepala={kepala}>
      <p className="m-0 rounded-md bg-matahari-lembut p-3 text-keterangan lg:hidden">
        {t.hanyaDesktop}
      </p>
      {children}
    </KerangkaPanel>
  );
}
