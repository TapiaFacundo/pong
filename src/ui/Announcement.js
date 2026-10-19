import { GAME_WIDTH, GAME_HEIGHT, ANNOUNCEMENT_DURATION } from "../config.js";

// Texto grande en el centro de la pantalla que se desvanece ("¡Fase 2!",
// "¡Nivel 3!"). Se ubica en pantalla con la cancha (field), así se ve igual
// aunque la cámara esté alejada.
export function announce(scene, field, message, color) {
  const text = field.placeOnScreen(
    scene.add.text(0, 0, message, { fontSize: "40px", color }).setOrigin(0.5).setDepth(20),
    GAME_WIDTH / 2,
    GAME_HEIGHT / 2 - 60
  );

  scene.tweens.add({
    targets: text,
    alpha: 0,
    delay: ANNOUNCEMENT_DURATION / 2,
    duration: ANNOUNCEMENT_DURATION / 2,
    onComplete: () => text.destroy(),
  });
}
