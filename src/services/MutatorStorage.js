import { MUTATORS, defaultMutatorSelection } from "../data/mutators.js";

// Clave propia: no puede compartir la de "translations", porque el sistema de
// idiomas la vacía cada vez que se cambia de idioma.
const STORAGE_KEY = "ponger-up:mutators";
const DATA_VERSION = 1;

// Modificadores elegidos para la Batalla, guardados en localStorage para que
// la próxima partida arranque con los mismos. Si no hay nada guardado, los
// datos están rotos o el almacenamiento no está disponible, se usan los de
// por defecto (y un modificador u opción que ya no existe vuelve al suyo).
export function loadMutatorSelection() {
  const selection = defaultMutatorSelection();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : null;
    if (data?.version !== DATA_VERSION) return selection;

    for (const mutator of MUTATORS) {
      const saved = data.selection?.[mutator.id];
      if (mutator.options.some(({ id }) => id === saved)) selection[mutator.id] = saved;
    }
  } catch {
    // Se queda con los de por defecto.
  }

  return selection;
}

export function saveMutatorSelection(selection) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: DATA_VERSION, selection }));
  } catch {
    // Sin almacenamiento disponible: la pantalla de puntos los recibe igual
    // al guardar, pero no se recuerdan para la próxima vez.
  }
}
