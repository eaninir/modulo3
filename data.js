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
  { id: 1, nombre: 'Brasil', grupoId: 1, continenteId: 1, fifaRanking: 5, copas: [1958, 1962, 1970, 1994, 2002] },
  { id: 2, nombre: 'Chile', grupoId: 1, continenteId: 1, fifaRanking: 45, copas: [] },
  { id: 3, nombre: 'Francia', grupoId: 2, continenteId: 2, fifaRanking: 2, copas: [1998, 2018] },
  { id: 4, nombre: 'España', grupoId: 2, continenteId: 2, fifaRanking: 8, copas: [2010] },
  { id: 5, nombre: 'México', grupoId: 3, continenteId: 3, fifaRanking: 15, copas: [] },
  { id: 6, nombre: 'Japón', grupoId: 3, continenteId: 5, fifaRanking: 18, copas: [] },
  { id: 7, nombre: 'Marruecos', grupoId: 4, continenteId: 4, fifaRanking: 12, copas: [] },
  { id: 8, nombre: 'Alemania', grupoId: 4, continenteId: 2, fifaRanking: 16, copas: [1954, 1974, 1990, 2014] }
];

export const partidos = {
  semifinales: [], // { numero: 1..2, local: {...}, visita: {...} }
  final: null
};