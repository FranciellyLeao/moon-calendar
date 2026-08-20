/**
 * Geocoding & City Coordinates Utility
 * Static local dictionary + OpenStreetMap Nominatim live fallback
 */

export interface CityCoordinates {
  name: string;
  country: string;
  lat: number;
  lng: number;
  defaultUtcOffset: number;
}

export const CITIES_DATABASE: CityCoordinates[] = [
  // Santa Catarina & South
  { name: 'Balneário Camboriú', country: 'Brasil', lat: -26.9906, lng: -48.6347, defaultUtcOffset: -3 },
  { name: 'Itajaí', country: 'Brasil', lat: -26.9080, lng: -48.6619, defaultUtcOffset: -3 },
  { name: 'Florianópolis', country: 'Brasil', lat: -27.5954, lng: -48.5480, defaultUtcOffset: -3 },
  { name: 'Joinville', country: 'Brasil', lat: -26.3045, lng: -48.8487, defaultUtcOffset: -3 },
  { name: 'Blumenau', country: 'Brasil', lat: -26.9194, lng: -49.0661, defaultUtcOffset: -3 },
  { name: 'Chapecó', country: 'Brasil', lat: -27.1004, lng: -52.6152, defaultUtcOffset: -3 },
  { name: 'Criciúma', country: 'Brasil', lat: -28.6773, lng: -49.3704, defaultUtcOffset: -3 },
  { name: 'Lages', country: 'Brasil', lat: -27.8160, lng: -50.3260, defaultUtcOffset: -3 },
  { name: 'Jaraguá do Sul', country: 'Brasil', lat: -26.4851, lng: -49.0805, defaultUtcOffset: -3 },
  { name: 'Tubarão', country: 'Brasil', lat: -28.4728, lng: -49.0142, defaultUtcOffset: -3 },
  { name: 'Brusque', country: 'Brasil', lat: -27.0979, lng: -48.9130, defaultUtcOffset: -3 },
  { name: 'São José', country: 'Brasil', lat: -27.6136, lng: -48.6366, defaultUtcOffset: -3 },
  { name: 'Palhoça', country: 'Brasil', lat: -27.6447, lng: -48.6694, defaultUtcOffset: -3 },
  { name: 'Camboriú', country: 'Brasil', lat: -27.0244, lng: -48.6553, defaultUtcOffset: -3 },
  { name: 'Navegantes', country: 'Brasil', lat: -26.8986, lng: -48.6536, defaultUtcOffset: -3 },
  // Major Capitals & Metropolises
  { name: 'São Paulo', country: 'Brasil', lat: -23.5505, lng: -46.6333, defaultUtcOffset: -3 },
  { name: 'Rio de Janeiro', country: 'Brasil', lat: -22.9068, lng: -43.1729, defaultUtcOffset: -3 },
  { name: 'Brasília', country: 'Brasil', lat: -15.7975, lng: -47.8919, defaultUtcOffset: -3 },
  { name: 'Salvador', country: 'Brasil', lat: -12.9777, lng: -38.5016, defaultUtcOffset: -3 },
  { name: 'Fortaleza', country: 'Brasil', lat: -3.7319, lng: -38.5267, defaultUtcOffset: -3 },
  { name: 'Belo Horizonte', country: 'Brasil', lat: -19.9167, lng: -43.9345, defaultUtcOffset: -3 },
  { name: 'Manaus', country: 'Brasil', lat: -3.1190, lng: -60.0217, defaultUtcOffset: -4 },
  { name: 'Curitiba', country: 'Brasil', lat: -25.4284, lng: -49.2733, defaultUtcOffset: -3 },
  { name: 'Recife', country: 'Brasil', lat: -8.0476, lng: -34.8770, defaultUtcOffset: -3 },
  { name: 'Porto Alegre', country: 'Brasil', lat: -30.0346, lng: -51.2177, defaultUtcOffset: -3 },
  { name: 'Belém', country: 'Brasil', lat: -1.4558, lng: -48.4902, defaultUtcOffset: -3 },
  { name: 'Goiânia', country: 'Brasil', lat: -16.6869, lng: -49.2648, defaultUtcOffset: -3 },
  { name: 'Campinas', country: 'Brasil', lat: -22.9099, lng: -47.0626, defaultUtcOffset: -3 },
  { name: 'Vitória', country: 'Brasil', lat: -20.3155, lng: -40.3128, defaultUtcOffset: -3 },
  { name: 'Lisboa', country: 'Portugal', lat: 38.7223, lng: -9.1393, defaultUtcOffset: 0 },
  { name: 'Porto', country: 'Portugal', lat: 41.1579, lng: -8.6291, defaultUtcOffset: 0 },
  { name: 'Madrid', country: 'Espanha', lat: 40.4168, lng: -3.7038, defaultUtcOffset: 1 },
  { name: 'Nova York', country: 'EUA', lat: 40.7128, lng: -74.0060, defaultUtcOffset: -5 },
  { name: 'Londres', country: 'Reino Unido', lat: 51.5074, lng: -0.1278, defaultUtcOffset: 0 },
  { name: 'Paris', country: 'França', lat: 48.8566, lng: 2.3522, defaultUtcOffset: 1 },
  { name: 'Tóquio', country: 'Japão', lat: 35.6762, lng: 139.6503, defaultUtcOffset: 9 },
];

export function findCity(cityName: string): CityCoordinates | undefined {
  const norm = cityName.trim().toLowerCase();
  return CITIES_DATABASE.find(
    (c) => c.name.toLowerCase() === norm || c.name.toLowerCase().includes(norm)
  );
}

export async function geocodeCityOnline(cityName: string): Promise<CityCoordinates | null> {
  const localMatch = findCity(cityName);
  if (localMatch) return localMatch;

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`);
    const data = await res.json();
    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      return {
        name: data[0].display_name.split(',')[0],
        country: 'Global',
        lat,
        lng,
        defaultUtcOffset: -3,
      };
    }
  } catch (e) {
    console.error('Geocoding error:', e);
  }
  return null;
}
