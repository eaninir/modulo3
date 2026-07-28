// data.js

export const continentes = [
  { id: 1, nombre: 'Sudamérica', confederacion: 'CONMEBOL' },
  { id: 2, nombre: 'Europa', confederacion: 'UEFA' },
  { id: 3, nombre: 'Norte, Centroamérica y Caribe', confederacion: 'CONCACAF' },
  { id: 4, nombre: 'África', confederacion: 'CAF' },
  { id: 5, nombre: 'Asia', confederacion: 'AFC' }
];

export const grupos = [
  { id: 1, nombre: 'A' },
  { id: 2, nombre: 'B' },
  { id: 3, nombre: 'C' },
  { id: 4, nombre: 'D' }
];

export const selecciones = [
  // Grupo A
  { id: 1, nombre: 'Brasil', grupoId: 1, continenteId: 1, fifaRanking: 5, copas: [1958, 1962, 1970, 1994, 2002] },
  { id: 2, nombre: 'Chile', grupoId: 1, continenteId: 1, fifaRanking: 45, copas: [] },
  { id: 9, nombre: 'Argentina', grupoId: 1, continenteId: 1, fifaRanking: 1, copas: [1978, 1986, 2022] },
  { id: 10, nombre: 'Nigeria', grupoId: 1, continenteId: 4, fifaRanking: 40, copas: [] },
  // Grupo B
  { id: 3, nombre: 'Francia', grupoId: 2, continenteId: 2, fifaRanking: 2, copas: [1998, 2018] },
  { id: 4, nombre: 'España', grupoId: 2, continenteId: 2, fifaRanking: 8, copas: [2010] },
  { id: 11, nombre: 'Inglaterra', grupoId: 2, continenteId: 2, fifaRanking: 4, copas: [1966] },
  { id: 12, nombre: 'Corea del Sur', grupoId: 2, continenteId: 5, fifaRanking: 23, copas: [] },
  // Grupo C
  { id: 5, nombre: 'México', grupoId: 3, continenteId: 3, fifaRanking: 15, copas: [] },
  { id: 6, nombre: 'Japón', grupoId: 3, continenteId: 5, fifaRanking: 18, copas: [] },
  { id: 13, nombre: 'Uruguay', grupoId: 3, continenteId: 1, fifaRanking: 14, copas: [1930, 1950] },
  { id: 14, nombre: 'Estados Unidos', grupoId: 3, continenteId: 3, fifaRanking: 11, copas: [] },
  // Grupo D
  { id: 7, nombre: 'Marruecos', grupoId: 4, continenteId: 4, fifaRanking: 12, copas: [] },
  { id: 8, nombre: 'Alemania', grupoId: 4, continenteId: 2, fifaRanking: 16, copas: [1954, 1974, 1990, 2014] },
  { id: 15, nombre: 'Italia', grupoId: 4, continenteId: 2, fifaRanking: 9, copas: [1934, 1938, 1982, 2006] },
  { id: 16, nombre: 'Senegal', grupoId: 4, continenteId: 4, fifaRanking: 19, copas: [] }
];

export const partidos = {
  semifinales: [], // { numero: 1..2, local: {...}, visita: {...} }
  final: null
};