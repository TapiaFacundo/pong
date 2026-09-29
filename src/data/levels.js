import { AI_DIFFICULTIES, GAME_WIDTH, GAME_HEIGHT } from "../config.js";
import { KEYS } from "../enums/keys.js";

// Los 10 niveles del Modo Historia (sección 12 del GDD), descritos como datos:
// la partida se arma a partir de esto. Cada campo opcional que falta usa el
// valor normal del juego.
//
// Campos de cada nivel:
// - id: número de nivel (1 a 10), también su orden de desbloqueo.
// - nameKey / abilityKey / quoteKey: claves de texto del rival para la
//   tarjeta de presentación (nombre, habilidad en una línea y su frase).
// - boss: null, "boss" o "final".
// - ai: configuración de la IA del rival, con la misma forma que
//   AI_DIFFICULTIES, más `prediction` (predicción de trayectoria: false/0 =
//   sigue la altura de la pelota, true/1 = apunta a donde va a llegar,
//   intermedio = a mitad de camino) y
//   `trackFirstArrival` (con varias pelotas, sigue a la que llega antes;
//   si no, sigue siempre a la primera).
// - field: tamaño de la cancha; si es más grande que la normal, la cámara se
//   aleja y las palas se aceleran en proporción al alto.
// - rules (opcional): reglas especiales del nivel.
//     rivalPaddleHeightScale: alto de la pala del rival (× normal).
//     ballSpeed / ballSpeedIncrement: velocidad inicial y aceleración por golpe.
//     forwardPaddle: el rival tiene una segunda pala a mitad de su lado, con
//       su propio alto (`heightScale`, × normal) y su propia IA (`ai`).
//     ballsPerRound: pelotas con las que arranca cada ronda.
//     powerUpSpawnDelay: { min, max } del spawn para todo el partido (ms).
//     powerUpColorWeights: probabilidad relativa de cada color de power-up.
//     trivela: { chance } de que un tiro del rival salga con efecto curvo.
//     sabotage: cada `interval` ms te aplica uno de `effects` por `duration` ms.
//     extraBallAfterTotalScore: con más de estos puntos sumados entre los dos,
//       cada ronda arranca con 2 pelotas.
// - phases (opcional, jefe final): cambios según los puntos del jugador.
//   Desde que el jugador llega a `fromPlayerScore`, la fase reemplaza la `ai`
//   (si trae una) y suma sus `rules` a las del nivel.

const NORMAL_FIELD = { width: GAME_WIDTH, height: GAME_HEIGHT };
const MEDIUM_FIELD = { width: 1000, height: 750 };
const LARGE_FIELD = { width: 1200, height: 900 };

const TRIVELA_SHOT = { chance: 0.5 };

// Pala adelantada de Los Gemelos: más chica, con la IA Difícil de siempre.
// Se distingue de la del arco, que es más rápida pero erra más.
const TWINS_FORWARD_PADDLE = {
  heightScale: 0.6,
  ai: { ...AI_DIFFICULTIES.hard, prediction: false, trackFirstArrival: false },
};

export const LEVELS = [
  {
    id: 1,
    nameKey: KEYS.NOVATO,
    abilityKey: KEYS.SIN_TRUCOS_IDEAL_PARA_APRENDER,
    quoteKey: KEYS.TRANQUI_YO_TAMBIEN_ESTOY_APRENDIENDO,
    boss: null,
    ai: { ...AI_DIFFICULTIES.easy, prediction: false, trackFirstArrival: false },
    field: NORMAL_FIELD,
  },
  {
    id: 2,
    nameKey: KEYS.APRENDIZ,
    abilityKey: KEYS.UN_RIVAL_PAREJO_SIN_TRUCOS,
    quoteKey: KEYS.YA_PRACTIQUE_ESTA_VEZ_NO_TE_LA_HAGO_FACIL,
    boss: null,
    ai: { ...AI_DIFFICULTIES.normal, prediction: false, trackFirstArrival: false },
    field: NORMAL_FIELD,
  },
  {
    id: 3,
    nameKey: KEYS.EL_MURO,
    abilityKey: KEYS.SU_PALA_ES_ENORME_PERO_LENTA,
    quoteKey: KEYS.POR_ACA_NO_PASA_NADA,
    boss: null,
    ai: { ...AI_DIFFICULTIES.normal, speed: 200, prediction: false, trackFirstArrival: false },
    field: NORMAL_FIELD,
    rules: { rivalPaddleHeightScale: 1.6 },
  },
  {
    id: 4,
    nameKey: KEYS.VELOCISTA,
    abilityKey: KEYS.LA_PELOTA_SALE_MAS_RAPIDO_Y_ACELERA_MAS,
    quoteKey: KEYS.PESTANEA_Y_TE_LA_PERDISTE,
    boss: null,
    ai: { ...AI_DIFFICULTIES.normal, speed: 380, prediction: false, trackFirstArrival: false },
    field: NORMAL_FIELD,
    rules: { ballSpeed: 440, ballSpeedIncrement: 1.04 },
  },
  {
    id: 5,
    nameKey: KEYS.LOS_GEMELOS,
    abilityKey: KEYS.DOS_PALAS_UNA_EN_EL_ARCO_Y_OTRA_ADELANTADA,
    quoteKey: KEYS.DOS_CONTRA_UNO_NO_ES_TRAMPA_SI_SOMOS_GEMELOS,
    boss: "boss",
    // Pala del arco: más rápida (400 px/s) pero con más error (± 30 px).
    ai: { ...AI_DIFFICULTIES.hard, speed: 400, errorMargin: 30, prediction: false, trackFirstArrival: false },
    field: MEDIUM_FIELD,
    rules: { forwardPaddle: TWINS_FORWARD_PADDLE },
  },
  {
    id: 6,
    nameKey: KEYS.TRIVELA,
    abilityKey: KEYS.SUS_TIROS_CON_EFECTO_SE_CURVAN,
    quoteKey: KEYS.LE_PEGO_DE_AFUERA_DEL_PIE_SUERTE_ADIVINANDO,
    boss: null,
    ai: { ...AI_DIFFICULTIES.hard, prediction: false, trackFirstArrival: false },
    field: NORMAL_FIELD,
    rules: { trivela: TRIVELA_SHOT },
  },
  {
    id: 7,
    nameKey: KEYS.ESTADIO,
    abilityKey: KEYS.CANCHA_GRANDE_Y_CALCULA_DONDE_VA_A_LLEGAR_LA_PELOTA,
    quoteKey: KEYS.BIENVENIDO_A_LA_CANCHA_GRANDE,
    boss: null,
    ai: { ...AI_DIFFICULTIES.hard, prediction: true, trackFirstArrival: false },
    field: LARGE_FIELD,
  },
  {
    id: 8,
    nameKey: KEYS.SABOTEADOR,
    abilityKey: KEYS.CADA_TANTO_TE_INVIERTE_LOS_CONTROLES_O_TE_FRENA_LA_PALA,
    quoteKey: KEYS.TUS_CONTROLES_ANDAN_RARO_QUE_CASUALIDAD,
    boss: null,
    ai: { ...AI_DIFFICULTIES.hard, prediction: false, trackFirstArrival: false },
    field: NORMAL_FIELD,
    rules: {
      sabotage: { interval: 12000, duration: 4000, effects: ["invert", "slowDown"] },
      powerUpColorWeights: { yellow: 1, green: 1, red: 2 },
    },
  },
  {
    id: 9,
    nameKey: KEYS.TORMENTA,
    abilityKey: KEYS.DOS_PELOTAS_POR_RONDA_Y_LLUVIA_DE_POWER_UPS,
    quoteKey: KEYS.ESPERO_QUE_TE_GUSTE_EL_CAOS,
    boss: null,
    ai: { ...AI_DIFFICULTIES.hard, prediction: true, trackFirstArrival: true },
    field: NORMAL_FIELD,
    rules: { ballsPerRound: 2, powerUpSpawnDelay: { min: 1500, max: 1500 } },
  },
  {
    id: 10,
    nameKey: KEYS.EL_CAMPEON,
    abilityKey: KEYS.SUMA_TRUCOS_A_MEDIDA_QUE_TE_ACERCAS_A_GANARLE,
    quoteKey: KEYS.LLEGASTE_LEJOS_ACA_SE_TERMINA,
    boss: "final",
    ai: { ...AI_DIFFICULTIES.hard, prediction: true, trackFirstArrival: true },
    field: LARGE_FIELD,
    rules: { extraBallAfterTotalScore: 10 },
    phases: [
      { fromPlayerScore: 3, rules: { trivela: TRIVELA_SHOT } },
      {
        fromPlayerScore: 5,
        ai: { ...AI_DIFFICULTIES.impossible, prediction: true, trackFirstArrival: true },
        rules: { trivela: TRIVELA_SHOT, forwardPaddle: TWINS_FORWARD_PADDLE },
      },
    ],
  },
];

export const LEVEL_COUNT = LEVELS.length;

export function getLevel(id) {
  return LEVELS.find((level) => level.id === id) ?? null;
}
