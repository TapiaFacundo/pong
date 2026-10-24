import { getSetting } from "./SettingsStorage.js";

// Vibración del celular (solo Android: iPhone no la soporta en el navegador).
// En una computadora el navegador puede tener la función pero no hace nada,
// así que solo cuenta en pantallas táctiles (la misma condición que usa
// index.html para los botones táctiles). Si no se puede, la opción no aparece.
export const CAN_VIBRATE =
  typeof navigator.vibrate === "function" && window.matchMedia("(pointer: coarse)").matches;

// Vibra `duration` ms, si la opción está activada.
export function vibrate(duration) {
  if (!CAN_VIBRATE || !getSetting("vibration")) return;
  navigator.vibrate(duration);
}
