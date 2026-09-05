import { POWERUP_COLORS, POWERUP_TEXT_COLORS, POWERUP_LABELS, COLORS } from "../config.js";

export default class PowerUpFeedback {
  constructor(scene) {
    this.scene = scene;
  }

  playPickup(x, y, definition, targetPaddle) {
    const color = POWERUP_COLORS[definition.colorCategory];
    const textColor = POWERUP_TEXT_COLORS[definition.colorCategory];
    const label = POWERUP_LABELS[definition.kind] ?? definition.id;

    this.spawnBurst(x, y, color);
    this.spawnLabel(x, y, label, textColor);

    if (targetPaddle) this.flashPaddle(targetPaddle, color);
  }

  spawnBurst(x, y, color) {
    const ring = this.scene.add.circle(x, y, 6, color, 0.7);

    this.scene.tweens.add({
      targets: ring,
      radius: 36,
      alpha: 0,
      duration: 350,
      onComplete: () => ring.destroy(),
    });
  }

  spawnLabel(x, y, label, textColor) {
    const text = this.scene.add.text(x, y - 20, label, { fontSize: "16px", color: textColor }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: text,
      y: y - 60,
      alpha: 0,
      duration: 900,
      onComplete: () => text.destroy(),
    });
  }

  flashPaddle(paddle, color) {
    paddle.rect.fillColor = color;

    this.scene.time.delayedCall(250, () => {
      paddle.rect.fillColor = COLORS.PADDLE;
    });
  }
}
