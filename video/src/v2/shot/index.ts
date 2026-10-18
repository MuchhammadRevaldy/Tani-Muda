import type React from 'react';
import type { Shot } from '../linimasa';
import { S01_1, S01_2, S01_3 } from './A01';
import { S02_1, S02_2, S02_3 } from './A02';
import { S03_1, S03_2, S03_3, S03_4, S03_5 } from './A03';
import { S04_1, S04_2 } from './A04';
import { S05_1, S05_2, S05_3, S05_4, S06_1, S06_2, S06_3 } from './A05A06';
import { S07_1, S07_2, S07_3, S07_4, S07_5 } from './A07';
import { S08_1, S08_2, S08_3, S08_4, S08_5, S08_6 } from './A08';
import { S09_1, S09_2, S10_1, S10_2 } from './A09A10';

/** Komponen per kalimat; id = adegan.kalimat di naskah (35 shot). */
export const DAFTAR_SHOT: Record<string, React.FC<{ shot: Shot }>> = {
  '01.1': S01_1,
  '01.2': S01_2,
  '01.3': S01_3,
  '02.1': S02_1,
  '02.2': S02_2,
  '02.3': S02_3,
  '03.1': S03_1,
  '03.2': S03_2,
  '03.3': S03_3,
  '03.4': S03_4,
  '03.5': S03_5,
  '04.1': S04_1,
  '04.2': S04_2,
  '05.1': S05_1,
  '05.2': S05_2,
  '05.3': S05_3,
  '05.4': S05_4,
  '06.1': S06_1,
  '06.2': S06_2,
  '06.3': S06_3,
  '07.1': S07_1,
  '07.2': S07_2,
  '07.3': S07_3,
  '07.4': S07_4,
  '07.5': S07_5,
  '08.1': S08_1,
  '08.2': S08_2,
  '08.3': S08_3,
  '08.4': S08_4,
  '08.5': S08_5,
  '08.6': S08_6,
  '09.1': S09_1,
  '09.2': S09_2,
  '10.1': S10_1,
  '10.2': S10_2,
};
