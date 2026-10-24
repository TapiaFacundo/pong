import Phaser from "phaser";
import { getSetting } from "../services/SettingsStorage.js";

// Efectos visuales sueltos que usan GameFeel y ArcadeFeel. Son solo dibujo:
// cada uno se crea, se anima y se borra solo, sin cuerpo físico.

// Sacude la pantalla, salvo que la opción "Sacudir la pantalla" esté apagada.
export function shakeCamera(scene, duration, intensity) {
  if (getSetting("screenShake")) scene.cameras.main.shake(duration, intensity);
}

// Si están permitidos los destellos grandes (opción "Destellos").
export function flashesEnabled() {
  return getSetting("flashes");
}

// Partículas cuadradas que salen de (x, y) hacia `angle`, abiertas ± spread / 2,
// y se apagan mientras viajan. distance: [mínima, máxima]. Con `spin` giran
// (pedazos de ladrillo).
export function burst(scene, x, y, { count, color, angle, spread, distance, size = 3, duration = 260, spin = false }) {
  for (let i = 0; i < count; i++) {
    const direction = angle + Phaser.Math.FloatBetween(-spread / 2, spread / 2);
    const travel = Phaser.Math.FloatBetween(distance[0], distance[1]);
    const particle = scene.add.rectangle(x, y, size, size, color);

    scene.tweens.add({
      targets: particle,
      x: x + Math.cos(direction) * travel,
      y: y + Math.sin(direction) * travel,
      angle: spin ? Phaser.Math.Between(-270, 270) : 0,
      alpha: 0,
      scale: 0.3,
      duration: duration * Phaser.Math.FloatBetween(0.7, 1.1),
      ease: "Quad.easeOut",
      onComplete: () => particle.destroy(),
    });
  }
}

// Copia del rectángulo `rect` (una pala, un ladrillo) que se abre y se apaga
// encima de él: un golpe, un destello.
export function pulse(scene, rect, { color = 0xffffff, alpha = 0.5, scaleX = 1, scaleY = 1, duration = 160 } = {}) {
  const copy = scene.add.rectangle(rect.x, rect.y, rect.width, rect.height, color, alpha);
  scene.tweens.add({
    targets: copy,
    scaleX,
    scaleY,
    alpha: 0,
    duration,
    ease: "Quad.easeOut",
    onComplete: () => copy.destroy(),
  });
}
