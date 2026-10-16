import { KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";

// Cuándo se muestra el aviso: pantalla táctil en vertical. Es la misma
// condición que usa el CSS de index.html (la partida la usa para pausarse).
export const ROTATE_NOTICE_QUERY = "(orientation: portrait) and (pointer: coarse)";

// Aviso "Girá el celular" que tapa el juego mientras se cumple
// ROTATE_NOTICE_QUERY (se muestra y oculta solo, con CSS). El texto se vuelve
// a escribir al cambiar el tamaño, por si cambió el idioma.
export function mountRotateNotice(container) {
  const notice = document.createElement("div");
  notice.id = "rotate-notice";
  notice.innerHTML = '<div class="rotate-phone"></div><p></p>';
  container.appendChild(notice);

  const text = notice.querySelector("p");
  const refresh = () => (text.textContent = getPhrase(KEYS.GIRA_EL_CELULAR_PARA_JUGAR));
  refresh();
  window.addEventListener("resize", refresh);
}
