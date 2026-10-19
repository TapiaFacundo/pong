import { FIELD_SIZES } from "../config.js";
import { KEYS } from "../enums/keys.js";

// Modificadores de la Batalla (1 jugador y 2 jugadores), descritos como datos.
// Cada opción aporta lo mismo que un nivel del Modo Historia (ver levels.js):
// un tamaño de cancha (`field`) y/o reglas (`rules`). La partida se arma con
// la suma de las opciones elegidas; la opción por defecto no cambia nada.
//
// Reglas que usan solo los modificadores (además de las de levels.js):
//   ballSizeScale: tamaño de la pelota (× normal).
//   paddleHeightScale: alto de las dos palas (× normal).
//   paddleSpeedScale: velocidad de todas las palas, también la de la CPU (× normal).
//   powerUpsDisabled: no aparecen power-ups.
//   powerUpDuration: duración de los efectos de los power-ups (ms).
//
// Campos de cada modificador: id, labelKey, defaultOption (id de la opción
// por defecto) y options ({ id, labelKey o label, field?, rules? }).

function onOff(id, labelKey, color) {
  return {
    id,
    labelKey,
    defaultOption: "on",
    options: [
      { id: "on", labelKey: KEYS.SI },
      { id: "off", labelKey: KEYS.NO, rules: { powerUpColorWeights: { [color]: 0 } } },
    ],
  };
}

export const MUTATORS = [
  {
    id: "field",
    labelKey: KEYS.CANCHA,
    defaultOption: "normal",
    options: [
      { id: "normal", labelKey: KEYS.NORMAL },
      { id: "medium", labelKey: KEYS.GRANDE, field: FIELD_SIZES.medium },
      { id: "large", labelKey: KEYS.ENORME, field: FIELD_SIZES.large },
    ],
  },
  {
    id: "ballSize",
    labelKey: KEYS.TAMANO_DE_PELOTA,
    defaultOption: "normal",
    options: [
      { id: "small", labelKey: KEYS.CHICA, rules: { ballSizeScale: 0.6 } },
      { id: "normal", labelKey: KEYS.NORMAL },
      { id: "large", labelKey: KEYS.GRANDE, rules: { ballSizeScale: 1.6 } },
      { id: "huge", labelKey: KEYS.MUY_GRANDE, rules: { ballSizeScale: 2.4 } },
    ],
  },
  {
    id: "ballSpeed",
    labelKey: KEYS.VELOCIDAD_DE_PELOTA,
    defaultOption: "normal",
    options: [
      { id: "slow", labelKey: KEYS.LENTA, rules: { ballSpeed: 290 } },
      { id: "normal", labelKey: KEYS.NORMAL },
      { id: "fast", labelKey: KEYS.RAPIDA, rules: { ballSpeed: 470 } },
      { id: "veryFast", labelKey: KEYS.MUY_RAPIDA, rules: { ballSpeed: 560 } },
    ],
  },
  {
    id: "ballAcceleration",
    labelKey: KEYS.ACELERACION_DE_PELOTA,
    defaultOption: "normal",
    options: [
      { id: "none", labelKey: KEYS.SIN_ACELERACION, rules: { ballSpeedIncrement: 1 } },
      { id: "normal", labelKey: KEYS.NORMAL },
      { id: "high", labelKey: KEYS.ALTA, rules: { ballSpeedIncrement: 1.06 } },
    ],
  },
  {
    id: "ballsPerRound",
    labelKey: KEYS.PELOTAS_POR_RONDA,
    defaultOption: "1",
    options: [
      { id: "1", label: "1" },
      { id: "2", label: "2", rules: { ballsPerRound: 2 } },
      { id: "3", label: "3", rules: { ballsPerRound: 3 } },
    ],
  },
  {
    id: "paddleSize",
    labelKey: KEYS.TAMANO_DE_PALAS,
    defaultOption: "normal",
    options: [
      { id: "small", labelKey: KEYS.CHICAS, rules: { paddleHeightScale: 0.6 } },
      { id: "normal", labelKey: KEYS.NORMALES },
      { id: "large", labelKey: KEYS.GRANDES, rules: { paddleHeightScale: 1.5 } },
    ],
  },
  {
    id: "paddleSpeed",
    labelKey: KEYS.VELOCIDAD_DE_PALAS,
    defaultOption: "normal",
    options: [
      { id: "slow", labelKey: KEYS.LENTAS, rules: { paddleSpeedScale: 0.7 } },
      { id: "normal", labelKey: KEYS.NORMALES },
      { id: "fast", labelKey: KEYS.RAPIDAS, rules: { paddleSpeedScale: 1.4 } },
    ],
  },
  {
    id: "powerUpSpawn",
    labelKey: KEYS.APARICION_DE_POWER_UPS,
    defaultOption: "normal",
    options: [
      { id: "none", labelKey: KEYS.NINGUNA, rules: { powerUpsDisabled: true } },
      { id: "few", labelKey: KEYS.POCOS, rules: { powerUpSpawnDelay: { min: 9000, max: 11000 } } },
      { id: "normal", labelKey: KEYS.NORMAL },
      { id: "many", labelKey: KEYS.MUCHOS, rules: { powerUpSpawnDelay: { min: 2500, max: 3500 } } },
      { id: "rain", labelKey: KEYS.LLUVIA, rules: { powerUpSpawnDelay: { min: 1500, max: 1500 } } },
    ],
  },
  {
    id: "powerUpDuration",
    labelKey: KEYS.DURACION_DE_POWER_UPS,
    defaultOption: "normal",
    options: [
      { id: "short", labelKey: KEYS.CORTOS, rules: { powerUpDuration: 8000 } },
      { id: "normal", labelKey: KEYS.NORMALES },
      { id: "long", labelKey: KEYS.LARGOS, rules: { powerUpDuration: 25000 } },
    ],
  },
  onOff("yellowPowerUps", KEYS.POWER_UPS_AMARILLOS, "yellow"),
  onOff("redPowerUps", KEYS.POWER_UPS_ROJOS, "red"),
  onOff("greenPowerUps", KEYS.POWER_UPS_VERDES, "green"),
];

// La elección por defecto: { idDelModificador: idDeLaOpción }.
export function defaultMutatorSelection() {
  return Object.fromEntries(MUTATORS.map((mutator) => [mutator.id, mutator.defaultOption]));
}

export function countActiveMutators(selection) {
  return MUTATORS.filter((mutator) => selection[mutator.id] !== mutator.defaultOption).length;
}

// Arma la cancha y las reglas de la partida a partir de lo elegido. Las
// reglas que son objetos (como los pesos por color) se combinan entre opciones.
export function buildMutatorSetup(selection) {
  const setup = { field: undefined, rules: {} };

  for (const mutator of MUTATORS) {
    const option = mutator.options.find(({ id }) => id === selection[mutator.id]);
    if (!option) continue;

    if (option.field) setup.field = option.field;
    for (const [key, value] of Object.entries(option.rules ?? {})) {
      const current = setup.rules[key];
      setup.rules[key] = isPlainObject(value) && isPlainObject(current) ? { ...current, ...value } : value;
    }
  }

  return setup;
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
