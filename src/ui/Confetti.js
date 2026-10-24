import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT, POWERUP_COLORS } from "../config.js";

// Papelitos de los colores de los power-ups que caen desde arriba de la
// pantalla girando. Con `loop` vuelven a caer sin fin (pantalla final del
// Modo Historia); si no, caen una sola vez (festejo de una victoria).
export function spawnConfetti(scene, { count = 50, loop = false, maxDelay = 3000 } = {}) {
  const colors = Object.values(POWERUP_COLORS);

  for (let i = 0; i < count; i++) {
    const piece = scene.add
      .rectangle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(-GAME_HEIGHT, 0),
        6,
        10,
        Phaser.Utils.Array.GetRandom(colors),
        0.8
      )
      .setAngle(Phaser.Math.Between(0, 360));

    scene.tweens.add({
      targets: piece,
      y: GAME_HEIGHT + 20,
      angle: piece.angle + Phaser.Math.Between(180, 540),
      duration: Phaser.Math.Between(3000, 6000),
      delay: Phaser.Math.Between(0, maxDelay),
      repeat: loop ? -1 : 0,
      onRepeat: () => piece.setX(Phaser.Math.Between(0, GAME_WIDTH)),
      onComplete: () => piece.destroy(),
    });
  }
}
