import Phaser from "phaser";
import { ARCADE_DROP_CHANCE, ARCADE_RAIN_DROP_CHANCE } from "../config.js";
import { ARCADE_POWERUPS } from "../data/arcade.js";
import Capsule from "../entities/Capsule.js";

// Cápsulas de power-up del Arcade: cada ladrillo roto tiene una chance de
// soltar una (más alta durante la lluvia de power-ups). Viajan hacia el
// jugador; si tocan la pala, avisan con onCatch(definition, capsule), y si
// pasan de largo, se pierden.
export default class CapsuleDrops {
  constructor(scene, paddle, { onCatch }) {
    this.scene = scene;
    this.paddle = paddle;
    this.onCatch = onCatch;
    this.capsules = [];
    this.rainTimer = null;
  }

  get dropChance() {
    return this.rainTimer ? ARCADE_RAIN_DROP_CHANCE : ARCADE_DROP_CHANCE;
  }

  maybeDrop(x, y) {
    if (Math.random() < this.dropChance) this.drop(x, y, Phaser.Utils.Array.GetRandom(ARCADE_POWERUPS));
  }

  drop(x, y, definition) {
    this.capsules.push(new Capsule(this.scene, x, y, definition));
  }

  // Lluvia de power-ups: durante `duration` ms los ladrillos sueltan cápsulas
  // mucho más seguido. Volver a agarrarla reinicia el tiempo. Devuelve el temporizador.
  startRain(duration) {
    this.rainTimer?.remove();
    this.rainTimer = this.scene.time.delayedCall(duration, () => (this.rainTimer = null));
    return this.rainTimer;
  }

  update(delta) {
    for (const capsule of [...this.capsules]) {
      capsule.update(delta);

      if (capsule.touches(this.paddle)) {
        this.onCatch(capsule.definition, capsule);
        this.remove(capsule);
      } else if (capsule.isGone) {
        this.remove(capsule);
      }
    }
  }

  remove(capsule) {
    this.capsules = this.capsules.filter((other) => other !== capsule);
    capsule.destroy();
  }

  // Al perder una vida o pasar de nivel: se van las cápsulas en camino y la lluvia.
  clearAll() {
    this.capsules.forEach((capsule) => capsule.destroy());
    this.capsules = [];
    this.rainTimer?.remove();
    this.rainTimer = null;
  }
}
