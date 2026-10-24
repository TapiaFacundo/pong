import Phaser from "phaser";
import { FONT_FAMILY, FONT_NAME } from "../config.js";

// Variantes de la letra que usa el juego (los archivos están en public/fonts
// y se declaran con @font-face en index.html).
const FACES = ["", "bold ", "italic "].map((variant) => `${variant}16px "${FONT_NAME}"`);

// Hace que todo texto creado con scene.add.text use la letra del juego, sin
// tener que ponerla en cada estilo. Un estilo que diga otra `fontFamily` la
// sigue respetando.
export function useGameFont() {
  const factory = Phaser.GameObjects.GameObjectFactory.prototype;
  const createText = factory.text;

  factory.text = function (x, y, text, style) {
    return createText.call(this, x, y, text, { fontFamily: FONT_FAMILY, ...style });
  };
}

// Espera a que el navegador tenga la letra cargada. Hay que llamarla antes de
// arrancar Phaser: los textos de canvas no se redibujan solos cuando llega la
// letra, así que los primeros quedarían con la de respaldo. Si alguna variante
// no carga, se sigue igual (con la letra de respaldo).
export function loadGameFont() {
  return Promise.allSettled(FACES.map((face) => document.fonts.load(face)));
}
