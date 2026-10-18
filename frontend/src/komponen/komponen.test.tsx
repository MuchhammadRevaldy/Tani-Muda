import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { Banner } from './banner';
import { BarisTugas } from './baris-tugas';
import { ChipStatus } from './chip-status';
import { Dialog } from './dialog';
import { Ikon } from './ikon';
import {
  IlustrasiKomoditas,
  alamatIlustrasiKomoditas,
  daftarIlustrasiKomoditas,
} from './ilustrasi';
import { InputRupiah } from './input-rupiah';
import { Kartu } from './kartu';
import { KolomIsian } from './kolom-isian';
import { NavigasiBawah, Sidebar } from './navigasi';
import { KotakOtp } from './pelengkap';
import { PenggarisUmurTanam } from './penggaris-umur-tanam';
import { GrupRadio, KartuPilihan, PilPilihan, Saklar } from './pilihan';
import { Tombol } from './tombol';
import { Uang } from './uang';

const denganRouter = (ui: React.ReactNode, rute = '/beranda') => (
  <MemoryRouter initialEntries={[rute]}>{ui}</MemoryRouter>
);

describe('Ikon', () => {
  it('dekoratif tanpa label', () => {
    const { container } = render(<Ikon nama="kebun" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
  it('role img dengan label', () => {
    render(<Ikon nama="centang" label="Sudah diunggah" />);
    expect(screen.getByRole('img', { name: 'Sudah diunggah' })).toBeInTheDocument();
  });
});

describe('Tombol dan Kartu', () => {
  it('tombol bawaan type button dan memakai kelas token', () => {
    render(<Tombol>Simpan rencana</Tombol>);
    const b = screen.getByRole('button', { name: 'Simpan rencana' });
    expect(b).toHaveAttribute('type', 'button');
    expect(b.className).toContain('bg-tombol-limau');
    expect(b.className).toContain('rounded-full');
    expect(b.className).toContain('min-h-kontrol');
  });
  it('kartu dengan judul h2 dan kaki uang', () => {
    render(
      <Kartu judul="Modal" tingkatJudul={2} kaki={<span>kaki</span>} nadaKaki="uang">
        isi
      </Kartu>,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Modal' })).toBeInTheDocument();
    expect(screen.getByText('kaki').parentElement?.className).toContain('bg-tanah-lembut');
  });
});

describe('KolomIsian', () => {
  it('galat terhubung ke input', () => {
    render(<KolomIsian label="Luas lahan" galat="Isi luas lahan dulu" />);
    const input = screen.getByLabelText('Luas lahan');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Isi luas lahan dulu');
  });
});

describe('InputRupiah', () => {
  it('mengetik 5000 menjadi 5.000 dan mengeja', async () => {
    const onUbah = vi.fn();
    render(<InputRupiah label="Harga per kg" onUbah={onUbah} />);
    const input = screen.getByLabelText('Harga per kg');
    await userEvent.type(input, '5000');
    expect(input).toHaveValue('5.000');
    expect(onUbah).toHaveBeenLastCalledWith(5000);
    expect(screen.getByText('Lima ribu rupiah')).toBeInTheDocument();
  });
  it('menempel angka berformat dan membatasi 13 digit', async () => {
    render(<InputRupiah label="Harga" />);
    const input = screen.getByLabelText('Harga');
    fireEvent.change(input, { target: { value: '1.250.000' } });
    expect(input).toHaveValue('1.250.000');
    fireEvent.change(input, { target: { value: '99999999999999999' } });
    expect(input).toHaveValue('9.999.999.999.999');
  });
  it('nol di depan dibuang dan tanpaTerbilang', () => {
    render(<InputRupiah label="Harga" tanpaTerbilang />);
    const input = screen.getByLabelText('Harga');
    fireEvent.change(input, { target: { value: '0050' } });
    expect(input).toHaveValue('50');
    expect(screen.queryByText(/rupiah/)).toBeNull();
  });
  it('mode terkendali', () => {
    function Uji() {
      const [n, setN] = useState<number | null>(12500);
      return <InputRupiah label="Harga" nilai={n} onUbah={setN} />;
    }
    render(<Uji />);
    const input = screen.getByLabelText('Harga');
    expect(input).toHaveValue('12.500');
    fireEvent.change(input, { target: { value: '' } });
    expect(input).toHaveValue('');
  });
});

describe('Uang', () => {
  it('negatif merah dengan minus', () => {
    render(<Uang nilai={-80000} label="Kalau panen jelek" />);
    const angka = screen.getByText('−Rp80.000');
    expect(angka.className).toContain('text-tomat-teks');
  });
});

describe('ChipStatus dan Banner', () => {
  it('teks bebas pada chip terlambat', () => {
    render(<ChipStatus status="terlambat">Terlambat 2 hari</ChipStatus>);
    expect(screen.getByText('Terlambat 2 hari')).toBeInTheDocument();
  });
  it('banner bahaya role alert', () => {
    render(<Banner jenis="bahaya" judul="Kiriman ditolak sebagian" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Kiriman ditolak sebagian');
  });
  it('banner offline bawaan', () => {
    render(<Banner jenis="offline" tertunda={2} />);
    const b = screen.getByRole('status');
    expect(b).toHaveTextContent('Kamu sedang offline');
    expect(b).toHaveTextContent('2 catatan tersimpan di HP');
  });
  it('aksi banner', async () => {
    const onAksi = vi.fn();
    render(<Banner judul="Besok" aksi="Lihat cara memupuk" onAksi={onAksi} />);
    await userEvent.click(screen.getByRole('button', { name: 'Lihat cara memupuk' }));
    expect(onAksi).toHaveBeenCalled();
  });
});

describe('BarisTugas', () => {
  it('centang memanggil onCentang dan mengubah aria-checked', async () => {
    const onCentang = vi.fn();
    render(
      denganRouter(
        <BarisTugas
          judul="Siram pagi dan sore"
          tipe="berulang"
          keterangan="setiap hari"
          onCentang={onCentang}
        />,
      ),
    );
    const c = screen.getByRole('checkbox', { name: 'Tandai selesai: Siram pagi dan sore' });
    expect(c).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(c);
    expect(onCentang).toHaveBeenCalledWith(true);
    expect(
      screen.getByRole('checkbox', { name: 'Batalkan selesai: Siram pagi dan sore' }),
    ).toHaveAttribute('aria-checked', 'true');
  });
  it('tipe dibacakan, lencana foto, tautan isi angka', () => {
    render(
      denganRouter(
        <BarisTugas
          judul="Cek pH dan PPM"
          tipe="ukur"
          keterangan="setiap 2 hari"
          hrefUkur="/tugas/1/ukur"
          jumlahFoto={2}
        />,
      ),
    );
    expect(screen.getByText(', tugas pengukuran')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Isi angka' })).toHaveAttribute(
      'href',
      '/tugas/1/ukur',
    );
    expect(
      screen.getByRole('button', { name: 'Foto bukti, 2 foto. Tambah foto' }),
    ).toBeInTheDocument();
  });
});

describe('Pilihan', () => {
  it('PilPilihan memakai aria-pressed', async () => {
    const onPilih = vi.fn();
    render(
      <PilPilihan
        label="Jenis lahan"
        nilai="semua"
        onPilih={onPilih}
        opsi={[
          { nilai: 'semua', label: 'Semua' },
          { nilai: 'sawah', label: 'Sawah' },
        ]}
      />,
    );
    expect(screen.getByRole('button', { name: 'Semua' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Sawah' }));
    expect(onPilih).toHaveBeenCalledWith('sawah');
  });
  it('panah memindah pilihan kartu', async () => {
    function Uji() {
      const [m, setM] = useState('a');
      return (
        <GrupRadio label="Cara tanam">
          <KartuPilihan dipilih={m === 'a'} onPilih={() => setM('a')} labelAksesibel="Bedengan">
            a
          </KartuPilihan>
          <KartuPilihan dipilih={m === 'b'} onPilih={() => setM('b')} labelAksesibel="Hidroponik">
            b
          </KartuPilihan>
        </GrupRadio>
      );
    }
    render(<Uji />);
    const a = screen.getByRole('radio', { name: 'Bedengan' });
    a.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'Hidroponik' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('radio', { name: 'Hidroponik' })).toHaveFocus();
  });
  it('saklar', async () => {
    const onUbah = vi.fn();
    render(<Saklar aktif={false} onUbah={onUbah} label="Pengingat sore" />);
    const s = screen.getByRole('switch', { name: 'Pengingat sore' });
    expect(s).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(s);
    expect(onUbah).toHaveBeenCalledWith(true);
  });
});

describe('Dialog', () => {
  it('Esc menutup dan fokus kembali ke pemicu', async () => {
    function Uji() {
      const [buka, setBuka] = useState(false);
      return (
        <>
          <button onClick={() => setBuka(true)}>Buka</button>
          <Dialog terbuka={buka} onTutup={() => setBuka(false)} judul="Cabai rawit">
            <button>Minta resep ini</button>
          </Dialog>
        </>
      );
    }
    render(<Uji />);
    const pemicu = screen.getByRole('button', { name: 'Buka' });
    await userEvent.click(pemicu);
    const d = screen.getByRole('dialog', { name: 'Cabai rawit' });
    expect(d).toHaveAttribute('aria-modal', 'true');
    expect(within(d).getByRole('button', { name: 'Tutup' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(pemicu).toHaveFocus();
  });
  it('fokus terkurung saat Tab', async () => {
    render(
      <Dialog terbuka onTutup={() => undefined} judul="Uji">
        <button>Terakhir</button>
      </Dialog>,
    );
    const tutup = screen.getByRole('button', { name: 'Tutup' });
    screen.getByRole('button', { name: 'Terakhir' }).focus();
    await userEvent.tab();
    expect(tutup).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Terakhir' })).toHaveFocus();
  });
});

describe('Navigasi', () => {
  it('aria-current pada menu aktif dan lencana 99+', () => {
    render(denganRouter(<NavigasiBawah lencana={{ pesanan: 120 }} />, '/pesanan'));
    expect(screen.getByRole('link', { name: /Pesanan/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('99+')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Beranda' })).not.toHaveAttribute('aria-current');
  });
  it('lencana sidebar ikut dibacakan pada nama tautan', () => {
    render(
      denganRouter(
        <Sidebar akun={{ nama: 'Arif', keterangan: 'Petani' }} lencana={{ pesanan: 3 }} />,
      ),
    );
    expect(screen.getByRole('link', { name: 'Pesanan, 3 baru' })).toBeInTheDocument();
  });
  it('menu akun sidebar', async () => {
    render(
      denganRouter(<Sidebar akun={{ nama: 'Arif Setiawan', keterangan: 'Petani · Delanggu' }} />),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Buka menu akun' }));
    const menu = screen.getByRole('menu', { name: 'Menu akun' });
    expect(
      within(menu)
        .getAllByRole('menuitem')
        .map((m) => m.textContent),
    ).toEqual(['Profil', 'Pengaturan notifikasi', 'Keluar']);
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
  it('teks akun yang terpotong tampil lengkap di tooltip dan di menu', async () => {
    const lebarIsi = vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(300);
    const lebarKotak = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(120);
    try {
      const akun = { nama: 'Arif Setiawan Wicaksono', keterangan: 'Petani · Bowan, Delanggu' };
      render(denganRouter(<Sidebar akun={akun} />));
      const tombol = screen.getByRole('button', { name: 'Buka menu akun' });
      expect(tombol).toHaveAccessibleDescription(`${akun.nama}${akun.keterangan}`);
      expect(screen.getByRole('tooltip')).toHaveTextContent(akun.keterangan);
      await userEvent.click(tombol);
      expect(screen.queryByRole('tooltip')).toBeNull();
      expect(within(screen.getByRole('menu')).getByText(akun.keterangan)).toBeInTheDocument();
    } finally {
      lebarIsi.mockRestore();
      lebarKotak.mockRestore();
    }
  });
});

describe('KotakOtp', () => {
  it('menempel 6 digit memanggil onLengkap', () => {
    const onLengkap = vi.fn();
    render(<KotakOtp onLengkap={onLengkap} />);
    const kotak = screen.getByLabelText('Angka ke-1');
    fireEvent.paste(kotak, { clipboardData: { getData: () => '123456' } });
    expect(onLengkap).toHaveBeenCalledWith('123456');
    expect(screen.getByLabelText('Angka ke-6')).toHaveValue('6');
  });
  it('hitung mundur lalu tombol kirim ulang', () => {
    vi.useFakeTimers();
    const onKirimUlang = vi.fn();
    render(<KotakOtp sisaDetikAwal={2} onKirimUlang={onKirimUlang} />);
    expect(screen.getByText('Kirim ulang kode dalam 0:02')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1000));
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.click(screen.getByRole('button', { name: 'Kirim ulang kode' }));
    expect(onKirimUlang).toHaveBeenCalled();
    vi.useRealTimers();
  });
});

describe('PenggarisUmurTanam', () => {
  it('ringkasan untuk pembaca layar dan daftar di varian hp', () => {
    render(
      <PenggarisUmurTanam
        hariIni={13}
        hariPanen={28}
        jadwal={[
          { hari: 7, label: 'Pupuk 1', status: 'selesai' },
          { hari: 14, label: 'Pupuk 2', status: 'besok' },
        ]}
      />,
    );
    expect(screen.getByRole('img')).toHaveAccessibleName(
      'Umur tanam hari ke-13 dari 28. Pupuk 1, hari ke-7 · selesai. Pupuk 2, hari ke-14 · besok.',
    );
    expect(screen.getByRole('list')).toHaveTextContent('hari ke-14 · besok');
  });
});

describe('IlustrasiKomoditas (D-59)', () => {
  it('memuat foto asli lewat <img> dengan alt', () => {
    render(<IlustrasiKomoditas nama="cabai" />);
    const g = screen.getByRole('img', { name: 'Ilustrasi cabai rawit' });
    expect(g.tagName).toBe('IMG');
    expect(g).toHaveAttribute('src', '/foto/komoditas/cabai-rawit.webp');
  });
  it('alt kosong menjadikannya hiasan; segera hadir tampil redup', () => {
    const { container } = render(<IlustrasiKomoditas nama="padi" alt="" segera />);
    const g = container.querySelector('img');
    expect(g).toHaveAttribute('alt', '');
    expect(g?.className).toContain('grayscale');
  });
  it('komoditas tanpa ilustrasi memakai ikon kebun, bukan gambar rusak', () => {
    const { container } = render(<IlustrasiKomoditas nama="durian" alt="" />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('svg')).not.toBeNull();
  });
  it('12 ilustrasi, semuanya ada berkasnya di public/', async () => {
    const { existsSync } = await import('node:fs');
    expect(daftarIlustrasiKomoditas).toHaveLength(12);
    for (const n of daftarIlustrasiKomoditas)
      expect(existsSync(`public${alamatIlustrasiKomoditas(n)}`), n).toBe(true);
  });
  it('12 foto komoditas (.webp), semuanya ada berkasnya di public/', async () => {
    const { existsSync } = await import('node:fs');
    for (const n of daftarIlustrasiKomoditas)
      expect(existsSync(`public/foto/komoditas/${n === 'cabai' ? 'cabai-rawit' : n === 'jagung' ? 'jagung-manis' : n === 'kedelai' ? 'kedelai' : n}.webp`), n).toBe(true);
  });
});
