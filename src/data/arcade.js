import { KEYS } from "../enums/keys.js";
import {
  GAME_HEIGHT,
  BALL_SPEED,
  ARCADE_BRICK_HEIGHT,
  ARCADE_BRICK_GAP,
  ARCADE_WALL_TOP,
  ARCADE_WALL_BOTTOM_MARGIN,
  ARCADE_START_COLUMNS,
  ARCADE_MAX_COLUMNS,
  ARCADE_BALL_SPEED_STEP,
  ARCADE_MAX_BALL_SPEED,
  ARCADE_ADVANCE_FROM_LEVEL,
  ARCADE_ADVANCE_START_INTERVAL,
  ARCADE_ADVANCE_INTERVAL_STEP,
  ARCADE_ADVANCE_MIN_INTERVAL,
} from "../config.js";

// Filas de ladrillos que entran entre el marcador y el piso.
export const ARCADE_ROWS = Math.floor(
  (GAME_HEIGHT - ARCADE_WALL_TOP - ARCADE_WALL_BOTTOM_MARGIN + ARCADE_BRICK_GAP) /
    (ARCADE_BRICK_HEIGHT + ARCADE_BRICK_GAP)
);

// Ladrillo de metal: no se rompe y no hace falta romperlo para pasar de nivel.
export const METAL = "metal";

const MIDDLE_ROW = (ARCADE_ROWS - 1) / 2;

// Formas del muro, que se van alternando nivel a nivel. Cada una dice si hay
// ladrillo en una columna (0 = la más cercana al jugador) y una fila.
const PATTERNS = [
  // Completo.
  () => true,
  // Ajedrez.
  (column, row) => (column + row) % 2 === 0,
  // Pirámide con la punta hacia el jugador: la fila del medio llega hasta
  // adelante y las de las puntas solo tienen la columna del fondo.
  (column, row, columns) => column >= Math.round((Math.abs(row - MIDDLE_ROW) / MIDDLE_ROW) * (columns - 1)),
  // Franjas: cada tres filas, una vacía (túneles hacia el fondo del muro).
  (column, row) => row % 3 !== 2,
  // Diamante.
  (column, row, columns) => {
    const middleColumn = (columns - 1) / 2;
    return Math.abs(row - MIDDLE_ROW) / (MIDDLE_ROW + 1) + Math.abs(column - middleColumn) / (middleColumn + 1) < 1;
  },
];

// Cuántos golpes aguanta un ladrillo según el nivel y su columna contada
// desde el fondo (0 = la última): el fondo del muro es el más reforzado.
// - Desde el nivel 2, columnas de 2 golpes (una más cada 2 niveles, hasta 4).
// - Desde el nivel 4, columnas de 3 golpes en el fondo (una más cada 3 niveles, hasta 3).
// - Desde el nivel 6, metal en algunas filas de la última columna (cada 3
//   filas; desde el nivel 10, cada 2). Va solo en el fondo: si estuviera más
//   adelante, el muro que avanza lo traería hasta el jugador sin que pudiera romperlo.
function brickHits(level, fromBack, row) {
  if (level >= 6 && fromBack === 0 && row % (level >= 10 ? 2 : 3) === 1) return METAL;

  const threeHitColumns = level >= 4 ? Math.min(1 + Math.floor((level - 4) / 3), 3) : 0;
  const twoHitColumns = level >= 2 ? Math.min(1 + Math.floor((level - 2) / 2), 4) : 0;
  if (fromBack < threeHitColumns) return 3;
  if (fromBack < threeHitColumns + twoHitColumns) return 2;
  return 1;
}

// Power-ups que pueden salir en las cápsulas del Arcade: solo los que ayudan
// al jugador, con el mismo dibujo que en la Batalla (todos en verde). El punto
// doble acá es "Puntos ×2": los puntos valen el doble por un rato.
export const ARCADE_POWERUPS = [
  { kind: "grow" },
  { kind: "speedUp" },
  { kind: "shield" },
  { kind: "smallGoal" },
  { kind: "cannon" },
  { kind: "extraBall" },
  { kind: "giant" },
  { kind: "slowMotion" },
  { kind: "doublePoint", labelKey: KEYS.PUNTOS_X2 },
  { kind: "rain" },
].map((powerUp) => ({ ...powerUp, colorCategory: "green" }));

// Cómo es cada nivel del Arcade:
// - ballSpeed: la pelota sale un 4 % más rápido en cada nivel, con un tope.
// - bricks: una lista por columna (la 0 es la más cercana al jugador), con un
//   lugar por fila: los golpes que aguanta cada ladrillo, METAL, o 0 si no hay.
//   El muro crece una columna por nivel, hasta el máximo.
// - advanceInterval: cada cuánto avanza el muro (ms), o null si todavía no avanza.
export function getArcadeLevel(level) {
  const columns = Math.min(ARCADE_START_COLUMNS + level - 1, ARCADE_MAX_COLUMNS);
  const isBrick = PATTERNS[(level - 1) % PATTERNS.length];

  const bricks = Array.from({ length: columns }, (_, column) =>
    Array.from({ length: ARCADE_ROWS }, (_, row) =>
      isBrick(column, row, columns) ? brickHits(level, columns - 1 - column, row) : 0
    )
  );

  const advanceInterval =
    level >= ARCADE_ADVANCE_FROM_LEVEL
      ? Math.max(
          ARCADE_ADVANCE_MIN_INTERVAL,
          ARCADE_ADVANCE_START_INTERVAL - (level - ARCADE_ADVANCE_FROM_LEVEL) * ARCADE_ADVANCE_INTERVAL_STEP
        )
      : null;

  return {
    level,
    ballSpeed: Math.min(BALL_SPEED * ARCADE_BALL_SPEED_STEP ** (level - 1), ARCADE_MAX_BALL_SPEED),
    bricks,
    advanceInterval,
  };
}
