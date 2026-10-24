import { GAME_WIDTH, GAME_HEIGHT, COLORS } from "../config.js";
import { fadeIn } from "./Pop.js";

// Medidas comunes de las pantallas, para que todas se vean iguales: el título
// siempre a la misma altura, del mismo tamaño y en negrita, y las listas de opciones
// centradas a lo alto de la pantalla, con el mismo tamaño de letra.
export const TITLE_Y = 110;
export const TITLE_FONT_SIZE = "36px";
export const MENU_FONT_SIZE = "26px";
export const MENU_SPACING = 50;
export const MENU_CENTER_Y = 340;
export const DETAIL_COLOR = "#888888";

// Fondo y borde de los paneles que se superponen a una partida (pausa,
// resultados) y del panel de idioma.
export const PANEL_FILL_COLOR = 0x111111;
export const PANEL_BORDER_COLOR = 0x555555;
// Borde de arriba del panel, más claro: le da un poco de relieve.
const PANEL_TOP_EDGE_COLOR = 0x999999;
const BACKDROP_ALPHA = 0.6;
const PANEL_WIDTH = 440;

export function addTitle(scene, text, { y = TITLE_Y, color = COLORS.TEXT, fontSize = TITLE_FONT_SIZE } = {}) {
  return scene.add.text(GAME_WIDTH / 2, y, text, { fontSize, fontStyle: "bold", color }).setOrigin(0.5);
}

// Dónde empieza una lista de `count` opciones para quedar centrada en `centerY`.
export function menuTop(count, { spacing = MENU_SPACING, centerY = MENU_CENTER_Y } = {}) {
  return centerY - ((count - 1) * spacing) / 2;
}

// Oscurece lo que hay detrás (la partida) y dibuja un panel centrado de alto
// `height`, para que los textos no queden encima de la cancha. La escena
// entera (panel y lo que tenga encima) aparece fundiéndose.
export function addOverlayPanel(scene, height) {
  const top = GAME_HEIGHT / 2 - height / 2;
  scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, BACKDROP_ALPHA);
  scene.add
    .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, PANEL_WIDTH, height, PANEL_FILL_COLOR, 0.95)
    .setStrokeStyle(2, PANEL_BORDER_COLOR);
  scene.add.rectangle(GAME_WIDTH / 2, top, PANEL_WIDTH, 2, PANEL_TOP_EDGE_COLOR);
  fadeIn(scene, scene.cameras.main);
}
