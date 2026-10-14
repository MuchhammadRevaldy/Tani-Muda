export interface HargaBeritaItem {
  id: string;
  komoditas_id: string;
  kabupaten: string;
  harga: number;
  satuan: string;
  jenis_harga: 'pasar' | 'eceran' | 'petani';
  lokasi: string;
  tanggal_berita: string;
  judul: string;
  media: string;
  url: string;
  diambil_pada: string;
}
