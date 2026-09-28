import { LEVEL_COUNT } from "../data/levels.js";

// Clave propia: no puede compartir la de "translations", porque el sistema de
// idiomas la vacía cada vez que se cambia de idioma.
const STORAGE_KEY = "ponger-up:story-progress";
const DATA_VERSION = 1;

function isValidLevelId(id) {
  return Number.isInteger(id) && id >= 1 && id <= LEVEL_COUNT;
}

// Progreso del Modo Historia guardado en localStorage del navegador: qué
// niveles se superaron. De eso sale qué niveles están desbloqueados (el 1
// siempre, y cada nivel después de uno superado).
//
// localStorage puede fallar (ventana privada, datos bloqueados) o traer datos
// rotos: en ese caso se arranca con solo el nivel 1 y, si no se puede guardar,
// el progreso vale igual durante la sesión, sin romper el juego.
export default class ProgressStorage {
  constructor() {
    this.completedLevels = this.load();
  }

  load() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return new Set();

      const data = JSON.parse(raw);
      if (data?.version !== DATA_VERSION || !Array.isArray(data.completedLevels)) return new Set();

      return new Set(data.completedLevels.filter(isValidLevelId));
    } catch {
      return new Set();
    }
  }

  save() {
    const data = {
      version: DATA_VERSION,
      completedLevels: [...this.completedLevels].sort((a, b) => a - b),
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Sin almacenamiento disponible: el progreso queda solo en memoria.
    }
  }

  isCompleted(levelId) {
    return this.completedLevels.has(levelId);
  }

  isUnlocked(levelId) {
    if (!isValidLevelId(levelId)) return false;
    return levelId === 1 || this.isCompleted(levelId) || this.isCompleted(levelId - 1);
  }

  // El nivel desbloqueado más alto: el que se resalta en la selección de nivel.
  get highestUnlocked() {
    let highest = 1;
    for (let id = 1; id <= LEVEL_COUNT; id++) {
      if (this.isUnlocked(id)) highest = id;
    }
    return highest;
  }

  markCompleted(levelId) {
    if (!isValidLevelId(levelId) || this.isCompleted(levelId)) return;

    this.completedLevels.add(levelId);
    this.save();
  }

  reset() {
    this.completedLevels.clear();

    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nada que borrar si el almacenamiento no está disponible.
    }
  }
}
