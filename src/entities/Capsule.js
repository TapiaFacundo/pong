import { ARCADE_CAPSULE_SPEED, ARCADE_CAPSULE_RADIUS } from "../config.js";
import PowerUpIcon from "../ui/PowerUpIcon.js";

// Mientras cae, la cápsula late un poco (solo el dibujo: para agarrarla cuenta su radio).
const PULSE_SCALE = 1.15;
const PULSE_DURATION = 300;

// Cápsula de power-up del Arcade: el ícono del power-up, que sale de un
// ladrillo roto y viaja en línea recta hacia el lado del jugador.
export default class Capsule {
  constructor(scene, x, y, definition) {
    this.definition = definition;
    this.icon = new PowerUpIcon(scene, x, y, definition.kind, definition.colorCategory, ARCADE_CAPSULE_RADIUS);
    scene.tweens.add({
      targets: this.icon,
      scale: this.icon.scale * PULSE_SCALE,
      duration: PULSE_DURATION,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });
  }

  get x() {
    return this.icon.x;
  }

  get y() {
    return this.icon.y;
  }

  update(delta) {
    this.icon.x -= ARCADE_CAPSULE_SPEED * (delta / 1000);
  }

  // Si toca la pala (rectángulo contra el círculo de la cápsula).
  touches(paddle) {
    const rect = paddle.rect;
    const closestX = Math.max(rect.x - rect.width / 2, Math.min(this.x, rect.x + rect.width / 2));
    const closestY = Math.max(rect.y - paddle.height / 2, Math.min(this.y, rect.y + paddle.height / 2));
    return (this.x - closestX) ** 2 + (this.y - closestY) ** 2 <= ARCADE_CAPSULE_RADIUS ** 2;
  }

  // Si ya pasó de largo por el lado del jugador.
  get isGone() {
    return this.x < -ARCADE_CAPSULE_RADIUS;
  }

  destroy() {
    this.icon.scene?.tweens.killTweensOf(this.icon);
    this.icon.destroy();
  }
}
