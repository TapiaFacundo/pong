import { getLanguageConfig } from "./translations.js";

// Clave propia: no puede compartir la de "translations", porque el sistema de
// idiomas la vacía cada vez que se cambia de idioma.
const STORAGE_KEY = "ponger-up:settings";
const DATA_VERSION = 1;

// Opciones del juego (pantalla de Opciones):
// - language: idioma elegido ("es" / "en"), o null si nunca se eligió (se usa
//   el de la dirección o el del navegador).
// - volume: volumen de los sonidos, de 0 a 100.
// - screenShake: si la pantalla se sacude (goles, jefe, muro del Arcade...).
// - flashes: si hay destellos grandes (gol, fase del jefe, nivel completo).
// - vibration: si el celular vibra (solo donde se puede).
const DEFAULTS = { language: null, volume: 100, screenShake: true, flashes: true, vibration: true };

let current = load();

// Lo guardado, completando con los valores por defecto lo que falte. Si el
// almacenamiento no está disponible o los datos están rotos, se usan los de
// por defecto (y los cambios valen solo mientras dure la sesión).
function load() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : null;
    if (data?.version === DATA_VERSION && data.settings) return { ...DEFAULTS, ...data.settings };
  } catch {
    // Arranca con los de por defecto.
  }
  return { ...DEFAULTS };
}

// El idioma a usar: el elegido en Opciones o, si nunca se eligió, el de la
// dirección (?lang=en) o el del navegador.
export function getLanguage() {
  return getSetting("language") ?? getLanguageConfig();
}

export function getSetting(name) {
  return current[name];
}

export function getDefaultSetting(name) {
  return DEFAULTS[name];
}

export function setSetting(name, value) {
  current = { ...current, [name]: value };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: DATA_VERSION, settings: current }));
  } catch {
    // Sin almacenamiento disponible: vale para esta sesión.
  }
}
