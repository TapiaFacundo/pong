import Phaser from "phaser";
import { playPowerUpPickup } from "./SoundEffects.js";

// Habilidad del rival Saboteador (nivel 8): cada `interval` ms de juego elige
// al azar una de `effects`. Cada opción es { kind, target }: target "player"
// es un sabotaje contra el jugador y "self" un refuerzo para el rival.
// Los efectos de pala duran `duration` ms; el cañón y el punto doble duran lo
// mismo que como power-up (lo resuelve applyEffect).
//
// El reloj solo corre con la pelota en movimiento (no durante la espera del
// saque) y no se reinicia entre rondas: si no, como muchas rondas duran menos
// que el intervalo, casi nunca llegaría a actuar.
export default class Sabotage {
  // applyEffect(kind, side, duration): aplica un efecto a un lado (lo provee GameScene).
  constructor(scene, { interval, duration, effects }, { ballManager, feedback, applyEffect, playerSide, rivalSide, playerPaddle, rivalPaddle }) {
    this.scene = scene;
    this.interval = interval;
    this.duration = duration;
    this.effects = effects;

    this.ballManager = ballManager;
    this.feedback = feedback;
    this.applyEffect = applyEffect;
    this.playerSide = playerSide;
    this.rivalSide = rivalSide;
    this.playerPaddle = playerPaddle;
    this.rivalPaddle = rivalPaddle;

    this.elapsed = 0;
  }

  update(delta) {
    const ballInPlay = this.ballManager.balls.some((ball) => ball.velocityX !== 0);
    if (!ballInPlay) return;

    this.elapsed += delta;
    if (this.elapsed < this.interval) return;

    this.elapsed = 0;
    this.act();
  }

  act() {
    const { kind, target } = Phaser.Utils.Array.GetRandom(this.effects);
    const isSabotage = target === "player";

    this.applyEffect(kind, isSabotage ? this.playerSide : this.rivalSide, this.duration);
    this.feedback.playRivalAbility({
      kind,
      isSabotage,
      targetPaddle: isSabotage ? this.playerPaddle : this.rivalPaddle,
      sourcePaddle: this.rivalPaddle,
    });
    playPowerUpPickup();
  }
}
