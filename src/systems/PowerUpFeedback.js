import { POWERUP_COLORS, POWERUP_TEXT_COLORS, POWERUP_LABELS, COLORS } from "../config.js";
import { KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";

// Corrimiento del texto del Saboteador respecto de la pala afectada, hacia el
// centro, para que no quede cortado contra el borde de la pantalla.
const RIVAL_ABILITY_LABEL_OFFSET_X = 130;

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

  // Habilidad del Saboteador. Si es un sabotaje, destellan en rojo su pala y
  // la del jugador, y junto a la del jugador aparece "¡Sabotaje!" con el
  // efecto. Si es un refuerzo para él, su pala destella en verde y junto a
  // ella aparece "¡Refuerzo!" con el efecto.
  playRivalAbility({ kind, isSabotage, targetPaddle, sourcePaddle }) {
    const prefixKey = isSabotage ? KEYS.SABOTAJE : KEYS.REFUERZO;
    const colorCategory = isSabotage ? "red" : "green";
    const label = `${getPhrase(prefixKey)} ${getPhrase(POWERUP_LABELS[kind])}`;
    const towardCenter = targetPaddle.x < this.scene.physics.world.bounds.centerX ? 1 : -1;

    this.spawnLabel(
      targetPaddle.x + towardCenter * RIVAL_ABILITY_LABEL_OFFSET_X,
      targetPaddle.y,
      label,
      POWERUP_TEXT_COLORS[colorCategory]
    );
    this.flashPaddle(targetPaddle, POWERUP_COLORS[colorCategory]);
    if (sourcePaddle !== targetPaddle) this.flashPaddle(sourcePaddle, POWERUP_COLORS[colorCategory]);
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
