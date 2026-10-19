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
} from "../config.js";

// Filas de ladrillos que entran entre el marcador y el piso.
export const ARCADE_ROWS = Math.floor(
  (GAME_HEIGHT - ARCADE_WALL_TOP - ARCADE_WALL_BOTTOM_MARGIN + ARCADE_BRICK_GAP) /
    (ARCADE_BRICK_HEIGHT + ARCADE_BRICK_GAP)
);

// Cómo es cada nivel del Arcade: cuántas columnas tiene el muro de ladrillos
// y a qué velocidad sale la pelota. El muro crece una columna por nivel y la
// pelota se acelera un 4 % por nivel, los dos con un tope.
//
// bricks: una lista por columna (la 0 es la más cercana al jugador), con un
// lugar por fila: los golpes que aguanta cada ladrillo, o 0 si no hay.
export function getArcadeLevel(level) {
  const columns = Math.min(ARCADE_START_COLUMNS + level - 1, ARCADE_MAX_COLUMNS);

  return {
    level,
    ballSpeed: Math.min(BALL_SPEED * ARCADE_BALL_SPEED_STEP ** (level - 1), ARCADE_MAX_BALL_SPEED),
    bricks: Array.from({ length: columns }, () => Array(ARCADE_ROWS).fill(1)),
  };
}
