// index.js
import express from 'express';
import cors from 'cors';
import { continentes, grupos, selecciones, partidos } from './data.js';

const app = express();

// Middlewares para procesar JSON y habilitar CORS
app.use(express.json());
app.use(cors());

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

/**
 * Une una selección con la información completa de su Grupo y Continente
 */
const armarSeleccionCompleta = (sel) => {
  const continente = continentes.find(c => c.id === sel.continenteId);
  const grupo = grupos.find(g => g.id === sel.grupoId);
  return {
    ...sel,
    continente,
    grupo
  };
};

/**
 * Normaliza textos: pasa a minúsculas, remueve acentos/tildes y espacios extra.
 */
const normalizar = (texto) => 
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/**
 * Helper para formatear la respuesta del GET de un partido:
 * Resuelve los IDs a nombres y CALCULA el ganador comparando goles.
 */
const formatearRespuestaPartido = (partidoGuardado) => {
  const equipoLocal = selecciones.find(s => s.id === partidoGuardado.local.seleccionId);
  const equipoVisita = selecciones.find(s => s.id === partidoGuardado.visita.seleccionId);

  const nombreLocal = equipoLocal ? equipoLocal.nombre : 'Desconocido';
  const nombreVisita = equipoVisita ? equipoVisita.nombre : 'Desconocido';

  // El ganador se calcula, no se guarda previamente
  const ganador = partidoGuardado.local.goles > partidoGuardado.visita.goles 
    ? nombreLocal 
    : nombreVisita;

  return {
    partido: partidoGuardado.partido,
    local: {
      seleccion: nombreLocal,
      goles: partidoGuardado.local.goles
    },
    visita: {
      seleccion: nombreVisita,
      goles: partidoGuardado.visita.goles
    },
    ganador
  };
};

// ===================================================================
// 1. RUTA BASE OPCIONAL
// ===================================================================
app.get('/', (req, res) => {
  res.json({ mensaje: 'API Mundial 2026 activa y funcionando ⚽' });
});

// ===================================================================
// 2. RUTAS BASE Y SELECCIONES (GET)
// ===================================================================

/**
 * GET /api/selecciones
 * Soporta filtros: ?continente=Europa, ?campeon=true, ?continenteId=1, ?grupoId=1
 */
app.get('/api/selecciones', (req, res) => {
  let resultado = selecciones;
  const { continente, campeon, continenteId, grupoId } = req.query;

  if (continente) {
    const continenteEncontrado = continentes.find(
      c => normalizar(c.nombre) === normalizar(continente)
    );
    if (continenteEncontrado) {
      resultado = resultado.filter(s => s.continenteId === continenteEncontrado.id);
    } else {
      resultado = [];
    }
  }

  if (campeon !== undefined) {
    const esCampeon = campeon === 'true';
    resultado = resultado.filter(s => (s.copas.length > 0) === esCampeon);
  }

  if (continenteId) {
    resultado = resultado.filter(s => s.continenteId === Number(continenteId));
  }
  if (grupoId) {
    resultado = resultado.filter(s => s.grupoId === Number(grupoId));
  }

  res.json(resultado.map(armarSeleccionCompleta));
});

/**
 * GET /api/selecciones/:id
 */
app.get('/api/selecciones/:id', (req, res) => {
  const { id } = req.params;
  const seleccion = selecciones.find(s => s.id === Number(id));

  if (!seleccion) {
    return res.status(404).json({ error: `No existe la selección ${id}` });
  }

  res.json(armarSeleccionCompleta(seleccion));
});

// ===================================================================
// 3. COPAS Y ESTADÍSTICAS
// ===================================================================

/**
 * GET /api/copas
 */
app.get('/api/copas', (req, res) => {
  const todasLasCopas = selecciones.flatMap(s => s.copas);
  todasLasCopas.sort((a, b) => a - b);
  res.json(todasLasCopas);
});

/**
 * GET /api/copas/:seleccion
 */
app.get('/api/copas/:seleccion', (req, res) => {
  const terminoBuscado = normalizar(req.params.seleccion);

  const seleccion = selecciones.find(
    s => normalizar(s.nombre) === terminoBuscado
  );

  if (!seleccion) {
    return res.status(404).json({ error: `No existe la selección ${req.params.seleccion}` });
  }

  res.json(seleccion.copas);
});

/**
 * GET /api/estadisticas
 */
app.get('/api/estadisticas', (req, res) => {
  const totalSelecciones = selecciones.length;

  const totalCopasRepartidas = selecciones.reduce(
    (acc, s) => acc + s.copas.length, 0
  );

  const seleccionesPorContinente = selecciones.reduce((acc, s) => {
    const continente = continentes.find(c => c.id === s.continenteId);
    const nombreContinente = continente ? continente.nombre : 'Desconocido';
    
    acc[nombreContinente] = (acc[nombreContinente] || 0) + 1;
    return acc;
  }, {});

  const sumaRanking = selecciones.reduce((acc, s) => acc + s.fifaRanking, 0);
  const rankingPromedio = Number((sumaRanking / totalSelecciones).toFixed(2));

  res.json({
    totalSelecciones,
    totalCopasRepartidas,
    seleccionesPorContinente,
    rankingPromedio
  });
});

// ===================================================================
// GRUPOS Y CONTINENTES (+ DESAFÍO EXTRA 1)
// ===================================================================

app.get('/api/grupos', (req, res) => {
  const resultado = grupos.map(g => ({
    ...g,
    selecciones: selecciones.filter(s => s.grupoId === g.id).map(armarSeleccionCompleta)
  }));
  res.json(resultado);
});

/**
 * 🌟 EXTRA: Tabla de posiciones por Grupo ordenada por FIFA Ranking
 * GET /api/grupos/:nombre/tabla
 */
app.get('/api/grupos/:nombre/tabla', (req, res) => {
  const nombreGrupo = normalizar(req.params.nombre);
  const grupo = grupos.find(g => normalizar(g.nombre) === nombreGrupo);

  if (!grupo) {
    return res.status(404).json({ error: `El grupo ${req.params.nombre} no existe.` });
  }

  const seleccionesDelGrupo = selecciones
    .filter(s => s.grupoId === grupo.id)
    .map(armarSeleccionCompleta);

  // Ordenar por ranking FIFA (de menor a mayor ranking)
  seleccionesDelGrupo.sort((a, b) => a.fifaRanking - b.fifaRanking);

  res.json({
    grupo: grupo.nombre,
    tabla: seleccionesDelGrupo
  });
});

app.get('/api/continentes', (req, res) => {
  const resultado = continentes.map(c => ({
    ...c,
    selecciones: selecciones.filter(s => s.continenteId === c.id).map(armarSeleccionCompleta)
  }));
  res.json(resultado);
});

// ===================================================================
// 4. SEMIFINALES Y FINAL (/api/worldcup/2026)
// ===================================================================

/**
 * POST /api/worldcup/2026/semifinals/:n
 */
app.post('/api/worldcup/2026/semifinals/:n', (req, res) => {
  const n = Number(req.params.n);

  if (isNaN(n) || n < 1 || n > 4) {
    return res.status(400).json({ error: 'El número de semifinal debe estar entre 1 y 4.' });
  }

  const { local, visita } = req.body;

  if (!local || !visita || local.seleccionId === undefined || local.goles === undefined || visita.seleccionId === undefined || visita.goles === undefined) {
    return res.status(400).json({ error: 'Faltan datos requeridos (local/visita con seleccionId y goles).' });
  }

  if (Number(local.goles) === Number(visita.goles)) {
    return res.status(400).json({ error: 'En eliminatorias no puede haber empate.' });
  }

  const equipoLocal = selecciones.find(s => s.id === Number(local.seleccionId));
  const equipoVisita = selecciones.find(s => s.id === Number(visita.seleccionId));

  if (!equipoLocal) {
    return res.status(404).json({ error: `No existe la selección ${local.seleccionId}` });
  }
  if (!equipoVisita) {
    return res.status(404).json({ error: `No existe la selección ${visita.seleccionId}` });
  }

  // Guardar usando IDs y goles (sin calcular ni guardar ganador directamente)
  const datosAInsertar = {
    partido: `semifinal ${n}`,
    local: { seleccionId: Number(local.seleccionId), goles: Number(local.goles) },
    visita: { seleccionId: Number(visita.seleccionId), goles: Number(visita.goles) }
  };

  const index = partidos.semifinales.findIndex(s => s.partido === `semifinal ${n}`);
  if (index >= 0) {
    partidos.semifinales[index] = datosAInsertar;
  } else {
    partidos.semifinales.push(datosAInsertar);
  }

  res.status(201).json(formatearRespuestaPartido(datosAInsertar));
});

/**
 * GET /api/worldcup/2026/semifinals/:n
 */
app.get('/api/worldcup/2026/semifinals/:n', (req, res) => {
  const n = Number(req.params.n);

  if (isNaN(n) || n < 1 || n > 4) {
    return res.status(400).json({ error: 'El número de semifinal debe estar entre 1 y 4.' });
  }

  const semifinal = partidos.semifinales.find(s => s.partido === `semifinal ${n}`);

  if (!semifinal) {
    return res.status(404).json({ error: `La semifinal ${n} aún no se ha jugado.` });
  }

  res.json(formatearRespuestaPartido(semifinal));
});

/**
 * GET /api/worldcup/2026/semifinals
 */
app.get('/api/worldcup/2026/semifinals', (req, res) => {
  res.json(partidos.semifinales.map(formatearRespuestaPartido));
});

/**
 * POST /api/worldcup/2026/final
 */
app.post('/api/worldcup/2026/final', (req, res) => {
  const { local, visita } = req.body;

  if (!local || !visita || local.seleccionId === undefined || local.goles === undefined || visita.seleccionId === undefined || visita.goles === undefined) {
    return res.status(400).json({ error: 'Faltan datos requeridos (local/visita con seleccionId y goles).' });
  }

  if (Number(local.goles) === Number(visita.goles)) {
    return res.status(400).json({ error: 'La gran final no puede terminar en empate.' });
  }

  const equipoLocal = selecciones.find(s => s.id === Number(local.seleccionId));
  const equipoVisita = selecciones.find(s => s.id === Number(visita.seleccionId));

  if (!equipoLocal) {
    return res.status(404).json({ error: `No existe la selección ${local.seleccionId}` });
  }
  if (!equipoVisita) {
    return res.status(404).json({ error: `No existe la selección ${visita.seleccionId}` });
  }

  const datosAInsertar = {
    partido: "final",
    local: { seleccionId: Number(local.seleccionId), goles: Number(local.goles) },
    visita: { seleccionId: Number(visita.seleccionId), goles: Number(visita.goles) }
  };

  partidos.final = datosAInsertar;

  // 🌟 EXTRA: Al campeón, su copa (Asignación automática de copa 2026)
  const campeon = Number(local.goles) > Number(visita.goles) ? equipoLocal : equipoVisita;
  if (!campeon.copas.includes(2026)) {
    campeon.copas.push(2026);
  }

  res.status(201).json(formatearRespuestaPartido(datosAInsertar));
});

/**
 * GET /api/worldcup/2026/final
 */
app.get('/api/worldcup/2026/final', (req, res) => {
  if (!partidos.final) {
    return res.status(404).json({ error: 'La gran final aún no se ha jugado.' });
  }

  res.json(formatearRespuestaPartido(partidos.final));
});

/**
 * 🌟 EXTRA: Camino al título
 * GET /api/worldcup/2026/camino/:seleccionId
 */
app.get('/api/worldcup/2026/camino/:seleccionId', (req, res) => {
  const id = Number(req.params.seleccionId);
  const seleccion = selecciones.find(s => s.id === id);

  if (!seleccion) {
    return res.status(404).json({ error: `No existe la selección ${id}` });
  }

  const todosLosPartidos = [...partidos.semifinales];
  if (partidos.final) {
    todosLosPartidos.push(partidos.final);
  }

  const partidosJugados = todosLosPartidos
    .filter(p => p.local.seleccionId === id || p.visita.seleccionId === id)
    .map(formatearRespuestaPartido);

  res.json({
    seleccion: seleccion.nombre,
    partidos: partidosJugados
  });
});

// ===================================================================
// 5. MANEJO GLOBAL DE RUTAS INEXISTENTES (404)
// ===================================================================
app.use((req, res) => {
  res.status(404).json({ error: `La ruta '${req.originalUrl}' no existe en este servidor.` });
});

// ===================================================================
// INICIALIZACIÓN DEL SERVIDOR
// ===================================================================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});