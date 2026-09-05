export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const PADDLE_WIDTH = 16;
export const PADDLE_HEIGHT = 100;
export const PADDLE_OFFSET_X = 40;
export const PADDLE_SPEED = 400;

export const AI_DEAD_ZONE = 10;

// Velocidad máxima, tiempo de reacción (ms), margen de error (px) al apuntar a
// la pelota, y probabilidad de reaccionar igual aunque la pelota no venga
// hacia su lado (anticipación, solo relevante en difícil).
export const AI_DIFFICULTIES = {
  easy: { speed: 180, reactionDelay: 350, errorMargin: 50, anticipationChance: 0 },
  normal: { speed: 260, reactionDelay: 150, errorMargin: 20, anticipationChance: 0 },
  hard: { speed: 340, reactionDelay: 40, errorMargin: 4, anticipationChance: 0.35 },
};

export const BALL_SIZE = 14;
export const BALL_SPEED = 380;
export const BALL_MAX_BOUNCE_ANGLE = Math.PI / 3;
export const BALL_SPEED_INCREMENT = 1.025;
export const BALL_MAX_SPEED = 700;
export const BALL_TURBO_MULTIPLIER = 1.5;

export const WIN_SCORE_SHORT = 5;
export const WIN_SCORE_LONG = 10;

export const COLORS = {
  BACKGROUND: 0x000000,
  PADDLE: 0xffffff,
  BALL: 0xffffff,
  MID_LINE: 0x444444,
  TEXT: "#ffffff",
};

export const POWERUP_RADIUS = 18;
export const POWERUP_SPAWN_MIN_DELAY = 5000;
export const POWERUP_SPAWN_MAX_DELAY = 7500;
export const POWERUP_MIN_DISTANCE = POWERUP_RADIUS * 3;
export const POWERUP_SPAWN_AREA = { width: 160, height: 300 };

// Mientras dura el power-up "Lluvia", el spawn usa este rango en vez del normal.
export const POWERUP_RAIN_MIN_DELAY = 1500;
export const POWERUP_RAIN_MAX_DELAY = 3000;

export const POWERUP_COLORS = {
  yellow: 0xffdd33,
  green: 0x33dd55,
  red: 0xdd3333,
};

export const POWERUP_TEXT_COLORS = {
  yellow: "#ffdd33",
  green: "#33dd55",
  red: "#dd3333",
};

export const POWERUP_LABELS = {
  grow: "Pala grande",
  shrink: "Pala chica",
  speedUp: "Pala rápida",
  slowDown: "Pala lenta",
  invert: "Controles invertidos",
  doublePoint: "Punto doble",
  extraBall: "¡Bola extra!",
  turbo: "¡Turbo!",
  erratic: "Pelota errática",
  invisible: "Pelota invisible",
  rain: "Lluvia de power-ups",
  centerPaddle: "Paleta central",
};

export const POWERUP_EFFECT_DURATION = 15000;
export const PADDLE_GROW_SCALE = 1.6;
export const PADDLE_SHRINK_SCALE = 0.6;
export const PADDLE_SPEED_UP_SCALE = 1.6;
export const PADDLE_SPEED_DOWN_SCALE = 0.6;

export const PADDLE_POWERUP_KINDS = ["grow", "shrink", "speedUp", "slowDown", "invert"];

export const BALL_ERRATIC_JITTER_INTERVAL = 220;
export const BALL_ERRATIC_JITTER_ANGLE = Math.PI / 4;
export const BALL_INVISIBLE_BLINK_INTERVAL = 220;

export const CENTER_PADDLE_HEIGHT = 60;
export const CENTER_PADDLE_SPEED = 180;

// 6 tipos de pala/puntaje (verde/roja) + 6 amarillos = 18 power-ups, según el GDD.
export const POWERUP_DEFINITIONS = [
  { id: "grow-green", kind: "grow", colorCategory: "green" },
  { id: "grow-red", kind: "grow", colorCategory: "red" },
  { id: "shrink-green", kind: "shrink", colorCategory: "green" },
  { id: "shrink-red", kind: "shrink", colorCategory: "red" },
  { id: "speed-up-green", kind: "speedUp", colorCategory: "green" },
  { id: "speed-up-red", kind: "speedUp", colorCategory: "red" },
  { id: "slow-down-green", kind: "slowDown", colorCategory: "green" },
  { id: "slow-down-red", kind: "slowDown", colorCategory: "red" },
  { id: "invert-green", kind: "invert", colorCategory: "green" },
  { id: "invert-red", kind: "invert", colorCategory: "red" },
  { id: "double-point-green", kind: "doublePoint", colorCategory: "green" },
  { id: "double-point-red", kind: "doublePoint", colorCategory: "red" },
  { id: "extra-ball", kind: "extraBall", colorCategory: "yellow" },
  { id: "turbo", kind: "turbo", colorCategory: "yellow" },
  { id: "erratic-ball", kind: "erratic", colorCategory: "yellow" },
  { id: "invisible-ball", kind: "invisible", colorCategory: "yellow" },
  { id: "powerup-rain", kind: "rain", colorCategory: "yellow" },
  { id: "center-paddle", kind: "centerPaddle", colorCategory: "yellow" },
];

export const KEYS = {
  P1_UP: "W",
  P1_DOWN: "S",
  P2_UP: "UP",
  P2_DOWN: "DOWN",
};
