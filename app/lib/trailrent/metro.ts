export type MetroStation = {
  id: string;
  nameKa: string;
  nameEn: string;
  line: string;
  pickupWindow: string;
};

export const METRO_STATIONS: MetroStation[] = [
  {
    id: 'station-square',
    nameKa: 'სადგურის მოედანი',
    nameEn: 'Station Square',
    line: '1 · 2',
    pickupWindow: '10:00–20:00',
  },
  {
    id: 'rustaveli',
    nameKa: 'რუსთaveli',
    nameEn: 'Rustaveli',
    line: '1',
    pickupWindow: '10:00–20:00',
  },
  {
    id: 'varketili',
    nameKa: 'ვარკetili',
    nameEn: 'Varketili',
    line: '1',
    pickupWindow: '11:00–19:00',
  },
  {
    id: 'delisi',
    nameKa: 'დელისი',
    nameEn: 'Delisi',
    line: '1',
    pickupWindow: '11:00–19:00',
  },
  {
    id: 'saburtalo',
    nameKa: 'სaburtalo',
    nameEn: 'Saburtalo',
    line: '2',
    pickupWindow: '10:00–20:00',
  },
  {
    id: 'university',
    nameKa: 'uniვersiteti',
    nameEn: 'University',
    line: '2',
    pickupWindow: '10:00–20:00',
  },
];

export function getStationLabel(
  station: MetroStation,
  locale: 'ka' | 'en',
): string {
  return locale === 'ka' ? station.nameKa : station.nameEn;
}
