import type { Wilayah } from '../../api/tipe';

/** "Bowan, Delanggu" untuk kartu profil dan pratinjau pembeli. */
export const namaDesa = (w: Wilayah | null | undefined) => (w ? `${w.desa}, ${w.kecamatan}` : null);
