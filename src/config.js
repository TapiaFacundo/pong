export const GAME_TITLE = "Ponger-up";

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

// Tamaños de cancha (Modo Historia y modificadores de la Batalla). Las más
// grandes que la pantalla se ven con la cámara alejada (ver systems/Field.js).
export const FIELD_SIZES = {
  normal: { width: GAME_WIDTH, height: GAME_HEIGHT },
  medium: { width: 1000, height: 750 },
  large: { width: 1200, height: 900 },
};

export const PADDLE_WIDTH = 16;
export const PADDLE_HEIGHT = 100;
export const PADDLE_OFFSET_X = 40;
export const PADDLE_SPEED = 400;
// Pala adelantada de Los Gemelos: en el centro del lado del rival (fracción del ancho de la cancha).
export const FORWARD_PADDLE_POSITION = 0.75;

export const AI_DEAD_ZONE = 10;

// Velocidad máxima, tiempo de reacción (ms), margen de error (px) al apuntar a
// la pelota, y probabilidad de reaccionar igual aunque la pelota no venga
// hacia su lado (anticipación, solo relevante en difícil).
export const AI_DIFFICULTIES = {
  easy: { speed: 200, reactionDelay: 300, errorMargin: 50, anticipationChance: 0 },
  normal: { speed: 280, reactionDelay: 100, errorMargin: 20, anticipationChance: 0 },
  hard: { speed: 340, reactionDelay: 40, errorMargin: 4, anticipationChance: 0.35 },
  impossible: { speed: PADDLE_SPEED + 50, reactionDelay: 10, errorMargin: 2, anticipationChance: 0.5 },
};

// Pelota invisible: hasta este error extra (px) al apuntar mientras dura el
// efecto. Se sortea una vez por jugada (no se compensa como el margen de error
// normal, que se vuelve a sortear en cada reacción).
export const AI_INVISIBLE_BALL_MISS = 90;
// Controles invertidos en contra de la IA: reacciona este tiempo (ms) más lento.
export const AI_INVERTED_EXTRA_REACTION = 150;

export const BALL_SIZE = 14;
export const BALL_SPEED = 380;
export const BALL_MAX_BOUNCE_ANGLE = Math.PI / 3;
export const BALL_SPEED_INCREMENT = 1.025;
export const BALL_MAX_SPEED = 700;
export const BALL_TURBO_MULTIPLIER = 1.5;

// Espera antes del saque: al empezar la partida, y después de cada ronda
// (más larga, para que ambos lados lleguen a reacomodarse con las palas
// centradas). Las palas vuelven al centro en PADDLE_RECENTER_DURATION.
export const SERVE_DELAY_START = 600;
export const SERVE_DELAY_AFTER_POINT = 1600;
export const PADDLE_RECENTER_DURATION = 400;
// Separación en altura entre las pelotas cuando una ronda arranca con varias (Tormenta).
export const ROUND_BALLS_SPACING = 80;

export const WIN_SCORE_SHORT = 5;
export const WIN_SCORE_MEDIUM = 7;
export const WIN_SCORE_LONG = 10;
export const STORY_WIN_SCORE = WIN_SCORE_MEDIUM;
// Pausa con el marcador final a la vista antes de pasar al resultado del nivel.
export const STORY_RESULT_DELAY = 1000;
// Color de los jefes (etiquetas y anuncios de fase) y duración de los anuncios
// grandes en el centro de la pantalla.
export const BOSS_COLOR = 0xb69cff;
export const BOSS_TEXT_COLOR = "#b69cff";
export const ANNOUNCEMENT_DURATION = 1800;
// Créditos de la pantalla final (nombres propios: no se traducen).
export const CREDITS = "Facundo Tapia · Valentino Batiston";

// Arcade (romper ladrillos). El muro de ladrillos va del lado derecho, con
// ARCADE_WALL_BACK_GAP de espacio detrás para que la pelota pueda meterse, y
// entre ARCADE_WALL_TOP (debajo del marcador) y el piso.
export const ARCADE_LIVES = 3;
// Franja de arriba reservada para el marcador (no se juega): el techo de la cancha está debajo.
export const ARCADE_PLAY_TOP = 56;
export const ARCADE_BRICK_WIDTH = 22;
export const ARCADE_BRICK_HEIGHT = 44;
export const ARCADE_BRICK_GAP = 4;
export const ARCADE_WALL_TOP = 62;
export const ARCADE_WALL_BOTTOM_MARGIN = 14;
export const ARCADE_WALL_BACK_GAP = 60;
// Columnas de ladrillos del nivel 1; cada nivel suma una, hasta el máximo.
export const ARCADE_START_COLUMNS = 3;
export const ARCADE_MAX_COLUMNS = 9;
// La pelota sale un 4 % más rápido en cada nivel, con un tope.
export const ARCADE_BALL_SPEED_STEP = 1.04;
export const ARCADE_MAX_BALL_SPEED = 560;
export const ARCADE_BRICK_POINTS = 10;
export const ARCADE_LEVEL_BONUS = 100;
// La pelota espera pegada a la pala antes de salir (al empezar y después de perder una vida).
export const ARCADE_SERVE_DELAY = 1200;
export const ARCADE_SERVE_OFFSET_X = 24;
// Ángulo máximo de la pelota respecto de la horizontal después de pegarle a un
// ladrillo: evita que quede rebotando entre el techo y el piso sin avanzar.
export const ARCADE_MAX_BALL_ANGLE = (70 * Math.PI) / 180;
export const ARCADE_BRICK_COLORS = [0x4f8cff, 0x7a6cff, 0xb06cff, 0xff6cc8, 0x45d0d0, 0xff8a4f];

export const COLORS = {
  BACKGROUND: 0x000000,
  PADDLE: 0xffffff,
  BALL: 0xffffff,
  MID_LINE: 0x444444,
  TEXT: "#ffffff",
};

export const POWERUP_RADIUS = 18;
export const POWERUP_SPAWN_MIN_DELAY = 5000;
export const POWERUP_SPAWN_MAX_DELAY = 6500;
export const POWERUP_MIN_DISTANCE = POWERUP_RADIUS * 3;
export const POWERUP_SPAWN_AREA = { width: 160, height: 300 };

// Mientras dura el power-up "Lluvia", el spawn usa este rango en vez del normal
// (con mínimo = máximo el intervalo es fijo: 10 power-ups en los 15 s).
export const POWERUP_RAIN_MIN_DELAY = 1500;
export const POWERUP_RAIN_MAX_DELAY = 1500;

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
  shield: "Escudo",
  smallGoal: "Arco chico",
  cannon: "Cañón",
  extraBall: "¡Bola extra!",
  turbo: "¡Turbo!",
  zigzag: "Pelota zigzagueante",
  curve: "Pelota curva",
  giant: "Pelota gigante",
  slowMotion: "Cámara lenta",
  invisible: "Pelota invisible",
  rain: "Lluvia de power-ups",
  centerPaddle: "Paleta central",
};

export const POWERUP_EFFECT_DURATION = 15000;
// Pelota gigante: tamaño respecto del normal (14 px → 42 px de diámetro).
export const BALL_GIANT_SCALE = 3;
// Cámara lenta: la física va SLOW_MOTION_TIME_SCALE veces más lenta (2 = a la
// mitad) durante SLOW_MOTION_DURATION ms, con la cancha teñida de azul.
export const SLOW_MOTION_DURATION = 5000;
export const SLOW_MOTION_TIME_SCALE = 2;
export const SLOW_MOTION_TINT = 0x3366ff;
export const SLOW_MOTION_TINT_ALPHA = 0.15;
// Barreras sobre la línea del arco (escudo y arco chico): GOAL_BARRIER_WIDTH
// de ancho, centradas a GOAL_BARRIER_OFFSET_X px del borde (detrás de la pala,
// que está a 40).
export const GOAL_BARRIER_WIDTH = 8;
export const GOAL_BARRIER_OFFSET_X = 12;
// Escudo: barrera celeste a lo alto de todo el arco.
export const SHIELD_COLOR = 0x66ccff;
// Arco chico: paredes grises en las puntas del arco, que tapan este alto cada una.
export const SMALL_GOAL_COLOR = 0xaaaaaa;
export const SMALL_GOAL_COVERAGE = 0.25;
// Cañón: la pala agarra la pelota, se apunta con una flecha (hasta 60° arriba o
// abajo, a 90°/s) y a los 2 s sale disparada a 1,6 × su velocidad (mínimo 600).
export const CANNON_COLOR = 0xff9933;
export const CANNON_FUSE_DURATION = 2000;
export const CANNON_MAX_ANGLE = (60 * Math.PI) / 180;
export const CANNON_AIM_SPEED = (90 * Math.PI) / 180;
export const CANNON_ARROW_LENGTH = 90;
export const CANNON_SPEED_MULTIPLIER = 1.6;
export const CANNON_MIN_SPEED = 600;
export const PADDLE_GROW_SCALE = 1.6;
export const PADDLE_SHRINK_SCALE = 0.6;
export const PADDLE_SPEED_UP_SCALE = 1.6;
export const PADDLE_SPEED_DOWN_SCALE = 0.6;

export const PADDLE_POWERUP_KINDS = ["grow", "shrink", "speedUp", "slowDown", "invert"];

// Tope de ángulo (respecto del avance horizontal) para las pelotas con
// efectos de movimiento: garantiza que nunca vuelvan hacia su propio arco.
export const BALL_MAX_MOTION_ANGLE = (70 * Math.PI) / 180;

// Bola zigzagueante: onda de ±30 px, una ondulación completa cada 0,8 s.
export const BALL_ZIGZAG_AMPLITUDE = 30;
export const BALL_ZIGZAG_PERIOD = 800;

// Bola curva: los golpes fuera del 30 % central de la pala curvan la pelota.
// Arranca recta y, pasados BALL_CURVE_DELAY ms, gira hasta 100°/s (golpe en
// la punta) durante BALL_CURVE_DURATION ms.
export const BALL_CURVE_MIN_OFFSET = 0.3;
export const BALL_CURVE_MAX_TURN_RATE = (100 * Math.PI) / 180;
export const BALL_CURVE_DELAY = 150;
export const BALL_CURVE_DURATION = 900;

// Aviso del tiro con efecto de Trivela: su pala parpadea en amarillo con este intervalo.
export const TRIVELA_TELL_BLINK_INTERVAL = 120;
export const BALL_INVISIBLE_BLINK_INTERVAL = 220;

export const CENTER_PADDLE_HEIGHT = 60;
export const CENTER_PADDLE_SPEED = 180;

// 9 tipos de pala/puntaje/arco (verde/roja) + 9 amarillos = 27 power-ups, según el GDD.
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
  { id: "shield-green", kind: "shield", colorCategory: "green" },
  { id: "shield-red", kind: "shield", colorCategory: "red" },
  { id: "small-goal-green", kind: "smallGoal", colorCategory: "green" },
  { id: "small-goal-red", kind: "smallGoal", colorCategory: "red" },
  { id: "cannon-green", kind: "cannon", colorCategory: "green" },
  { id: "cannon-red", kind: "cannon", colorCategory: "red" },
  { id: "extra-ball", kind: "extraBall", colorCategory: "yellow" },
  { id: "turbo", kind: "turbo", colorCategory: "yellow" },
  { id: "zigzag-ball", kind: "zigzag", colorCategory: "yellow" },
  { id: "curve-ball", kind: "curve", colorCategory: "yellow" },
  { id: "giant-ball", kind: "giant", colorCategory: "yellow" },
  { id: "slow-motion", kind: "slowMotion", colorCategory: "yellow" },
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
