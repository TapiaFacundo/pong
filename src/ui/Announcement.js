import { GAME_WIDTH, GAME_HEIGHT, ANNOUNCEMENT_DURATION } from "../config.js";
import { pop } from "./Pop.js";

// Ancho máximo antes de pasar a una segunda línea (los anuncios largos, como
// el del partido largo, no entran en una sola).
const MAX_WIDTH = GAME_WIDTH - 80;

// Texto grande en el centro de la pantalla que entra con un salto y se
// desvanece ("¡Fase 2!", "¡Nivel 3!"). Lleva un borde negro para que se lea
// encima de la pelota o los ladrillos. Se ubica en pantalla con la cancha
// (field), así se ve igual aunque la cámara esté alejada. offsetY: para un
// segundo anuncio debajo del primero.
export function announce(scene, field, message, color, offsetY = 0) {
  const text = field.placeOnScreen(
    scene.add
      .text(0, 0, message, {
        fontSize: "40px",
        fontStyle: "bold",
        color,
        stroke: "#000000",
        strokeThickness: 6,
        align: "center",
        wordWrap: { width: MAX_WIDTH },
      })
      .setOrigin(0.5)
      .setDepth(20),
    GAME_WIDTH / 2,
    GAME_HEIGHT / 2 - 60 + offsetY
  );

  pop(scene, text, { baseScale: text.scaleX, from: 0.6, duration: 320 });
  scene.tweens.add({
    targets: text,
    alpha: 0,
    delay: ANNOUNCEMENT_DURATION / 2,
    duration: ANNOUNCEMENT_DURATION / 2,
    onComplete: () => text.destroy(),
  });
}
