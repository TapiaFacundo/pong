import { GAME_WIDTH, GAME_HEIGHT, COLORS } from "../config.js";

// Medidas comunes de las pantallas, para que todas se vean iguales: el título
// siempre a la misma altura y del mismo tamaño, y las listas de opciones
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
const BACKDROP_ALPHA = 0.6;
const PANEL_WIDTH = 440;

export function addTitle(scene, text, { y = TITLE_Y, color = COLORS.TEXT, fontSize = TITLE_FONT_SIZE } = {}) {
  return scene.add.text(GAME_WIDTH / 2, y, text, { fontSize, color }).setOrigin(0.5);
}

// Dónde empieza una lista de `count` opciones para quedar centrada en `centerY`.
export function menuTop(count, { spacing = MENU_SPACING, centerY = MENU_CENTER_Y } = {}) {
  return centerY - ((count - 1) * spacing) / 2;
}

// Oscurece lo que hay detrás (la partida) y dibuja un panel centrado de alto
// `height`, para que los textos no queden encima de la cancha.
export function addOverlayPanel(scene, height) {
  scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, BACKDROP_ALPHA);
  scene.add
    .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, PANEL_WIDTH, height, PANEL_FILL_COLOR, 0.95)
    .setStrokeStyle(2, PANEL_BORDER_COLOR);
}
