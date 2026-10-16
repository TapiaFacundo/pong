import { POWERUP_COLORS, POWERUP_TEXT_COLORS, POWERUP_LABELS, COLORS } from "../config.js";
import { KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";

// Corrimiento del texto de sabotaje respecto de la pala afectada, para que no
// quede cortado contra el borde de la pantalla.
const SABOTAGE_LABEL_OFFSET_X = 130;

export default class PowerUpFeedback {
  constructor(scene) {
    this.scene = scene;
  }

  playPickup(x, y, definition, targetPaddle) {
    const color = POWERUP_COLORS[definition.colorCategory];
    const textColor = POWERUP_TEXT_COLORS[definition.colorCategory];
    const label = getPhrase(POWERUP_LABELS[definition.kind] ?? definition.id);

    this.spawnBurst(x, y, color);
    this.spawnLabel(x, y, label, textColor);

    if (targetPaddle) this.flashPaddle(targetPaddle, color);
  }

  // Sabotaje del Saboteador: destellan en rojo su pala y la afectada, y sobre
  // la afectada aparece "¡Sabotaje!" con el nombre del efecto.
  playSabotage(targetPaddle, sourcePaddle, kind) {
    const label = `${getPhrase(KEYS.SABOTAJE)} ${getPhrase(POWERUP_LABELS[kind])}`;
    const direction = targetPaddle.x < sourcePaddle.x ? 1 : -1;

    this.spawnLabel(targetPaddle.x + direction * SABOTAGE_LABEL_OFFSET_X, targetPaddle.y, label, POWERUP_TEXT_COLORS.red);
    this.flashPaddle(targetPaddle, POWERUP_COLORS.red);
    this.flashPaddle(sourcePaddle, POWERUP_COLORS.red);
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
      duration: 1600,
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
