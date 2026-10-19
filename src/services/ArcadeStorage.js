// Clave propia: no puede compartir la de "translations", porque el sistema de
// idiomas la vacía cada vez que se cambia de idioma.
const STORAGE_KEY = "ponger-up:arcade-record";
const DATA_VERSION = 1;

// Récord del Arcade (mejor puntaje y el nivel al que se llegó en esa partida),
// guardado en localStorage. Si no hay nada guardado, los datos están rotos o
// el almacenamiento no está disponible, el récord arranca en 0.
export function loadArcadeRecord() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : null;
    if (data?.version === DATA_VERSION && Number.isFinite(data.score) && Number.isFinite(data.level)) {
      return { score: data.score, level: data.level };
    }
  } catch {
    // Arranca de cero.
  }
  return { score: 0, level: 0 };
}

// Guarda la partida si superó el récord. Devuelve el récord vigente y si es nuevo.
export function submitArcadeScore(score, level) {
  const record = loadArcadeRecord();
  if (score <= record.score) return { record, isNew: false };

  const newRecord = { score, level };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: DATA_VERSION, ...newRecord }));
  } catch {
    // Sin almacenamiento disponible: el récord vale solo para esta pantalla.
  }
  return { record: newRecord, isNew: true };
}
