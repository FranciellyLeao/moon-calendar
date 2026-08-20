import sweph from '@swisseph/node';
const {
  julianDay,
  calculatePosition,
  calculateHouses,
  setSiderealMode,
  getAyanamsa,
  Planet,
  LunarPoint,
  Asteroid,
  HouseSystem,
  SiderealMode,
} = sweph;

// Benchmark: 20/07/2001 05:53 AM local time (UTC-3 -> UT = 08:53 = 8 + 53/60 = 8.883333333)
const jd = julianDay(2001, 7, 20, 8 + 53 / 60);

const sun      = calculatePosition(jd, Planet.Sun);
const moon     = calculatePosition(jd, Planet.Moon);
const mercury  = calculatePosition(jd, Planet.Mercury);
const venus    = calculatePosition(jd, Planet.Venus);
const mars     = calculatePosition(jd, Planet.Mars);
const jupiter  = calculatePosition(jd, Planet.Jupiter);
const saturn   = calculatePosition(jd, Planet.Saturn);
const uranus   = calculatePosition(jd, Planet.Uranus);
const neptune  = calculatePosition(jd, Planet.Neptune);
const pluto    = calculatePosition(jd, Planet.Pluto);
const trueNode = calculatePosition(jd, LunarPoint.TrueNode);
const chiron   = calculatePosition(jd, Asteroid.Chiron);

const lat = -26.9906;
const lng = -48.6347;
const houses = calculateHouses(jd, lat, lng, HouseSystem.Placidus);

setSiderealMode(SiderealMode.Lahiri, 0, 0);
const ayanamsha = getAyanamsa(jd);

function formatDeg(d) {
  const norm = (d + 360) % 360;
  const deg = Math.floor(norm % 30);
  const min = Math.floor((norm % 1) * 60);
  const sec = Math.round(((norm % 1) * 60 - min) * 60);
  const signs = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];
  const sIdx = Math.floor(norm / 30) % 12;
  return `${deg}°${min < 10 ? '0' : ''}${min}'${sec < 10 ? '0' : ''}${sec}" ${signs[sIdx]} (${norm.toFixed(5)}°)`;
}

console.log('--- TESTE DE CORRESPONDÊNCIA SWISS EPHEMERIS vs ASTRO.COM ---');
console.log('Sol:         ', formatDeg(sun.longitude), ' -> Target: 27°42\' Câncer (117.70°)');
console.log('Lua:         ', formatDeg(moon.longitude), ' -> Target: 21°22\' Câncer (111.37°)');
console.log('Mercúrio:    ', formatDeg(mercury.longitude), ' -> Target: 10°39\' Câncer (100.65°)');
console.log('Vênus:       ', formatDeg(venus.longitude), ' -> Target: 16°12\' Gêmeos (76.21°)');
console.log('Marte:       ', formatDeg(mars.longitude), ' -> Target: 15°06\' Sagitário (255.10°)');
console.log('Júpiter:     ', formatDeg(jupiter.longitude), ' -> Target: 1°37\' Câncer (91.62°)');
console.log('Saturno:     ', formatDeg(saturn.longitude), ' -> Target: 11°05\' Gêmeos (71.09°)');
console.log('Urano:       ', formatDeg(uranus.longitude), uranus.longitudeSpeed < 0 ? '℞' : '', ' -> Target: 23°51\' Aquário ℞ (323.85°)');
console.log('Netuno:      ', formatDeg(neptune.longitude), neptune.longitudeSpeed < 0 ? '℞' : '', ' -> Target: 7°39\' Aquário ℞ (307.65°)');
console.log('Plutão:      ', formatDeg(pluto.longitude), pluto.longitudeSpeed < 0 ? '℞' : '', ' -> Target: 12°50\' Sagitário ℞ (252.84°)');
console.log('Nodo Norte:  ', formatDeg(trueNode.longitude), ' -> Target: 6°18\' Câncer (96.31°)');
console.log('Quíron:      ', formatDeg(chiron.longitude), ' -> Target: 23°49\' Sagitário (263.82°)');
console.log('Ascendente:  ', formatDeg(houses.ascendant), ' -> Target: 9°26\' Câncer (99.44°)');
console.log('MC:          ', formatDeg(houses.mc), ' -> Target: 24°38\' Áries (24.63°)');
console.log('Ayanamsha Lahiri:', ayanamsha.toFixed(5));
console.log('Casas Placidus:', houses.cusps.map(formatDeg));
