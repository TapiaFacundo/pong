import Phaser from "phaser";
import { playPowerUpPickup } from "./SoundEffects.js";

// Habilidad del rival Saboteador (nivel 8): cada `interval` ms de juego le
// aplica al jugador uno de `effects` (efectos rojos de pala, como controles
// invertidos o pala lenta) durante `duration` ms.
//
// El reloj solo corre con la pelota en movimiento (no durante la espera del
// saque) y no se reinicia entre rondas: si no, como muchas rondas duran menos
// que el intervalo, casi nunca llegaría a sabotear.
export default class Sabotage {
  constructor(scene, { interval, duration, effects }, { ballManager, powerUpEffects, feedback, targetSide, targetPaddle, sourcePaddle }) {
    this.scene = scene;
    this.interval = interval;
    this.duration = duration;
    this.effects = effects;

    this.ballManager = ballManager;
    this.powerUpEffects = powerUpEffects;
    this.feedback = feedback;
    this.targetSide = targetSide;
    this.targetPaddle = targetPaddle;
    this.sourcePaddle = sourcePaddle;

    this.elapsed = 0;
  }

  update(delta) {
    const ballInPlay = this.ballManager.balls.some((ball) => ball.velocityX !== 0);
    if (!ballInPlay) return;

    this.elapsed += delta;
    if (this.elapsed < this.interval) return;

    this.elapsed = 0;
    this.sabotage();
  }

  sabotage() {
    const kind = Phaser.Utils.Array.GetRandom(this.effects);

    this.powerUpEffects.applyToSide(this.targetSide, kind, this.duration);
    this.feedback.playSabotage(this.targetPaddle, this.sourcePaddle, kind);
    playPowerUpPickup();
  }
}
