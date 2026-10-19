import Phaser from "phaser";
import { GAME_WIDTH, POWERUP_RADIUS } from "../config.js";
import PowerUpIcon from "../ui/PowerUpIcon.js";
import { isBuffKind } from "./PowerUpEffects.js";

const ICON_RADIUS = 14;
const ICON_SCALE = ICON_RADIUS / POWERUP_RADIUS;
const ICON_SPACING = 34;
const CORNER_MARGIN = 26;
const SIDE_ROW_Y = 26;
const NEUTRAL_ROW_Y = 84;
// Debajo del tinte azul de la cámara lenta, encima de pelotas y palas.
const INDICATOR_DEPTH = 5;
const START_ANGLE = -90; // las 12 del reloj

// Indicadores de los efectos activos: el ícono de cada efecto que afecta a un
// jugador aparece en la esquina de arriba de su lado, y los neutros (amarillos)
// en el centro, debajo del marcador. Cada ícono se va borrando como una aguja
// de reloj a medida que se le acaba el tiempo.
//
// No lleva la cuenta del tiempo: lee el temporizador de cada efecto, así que
// el ícono desaparece solo cuando el efecto vence, se reemplaza o se corta
// antes (escudo roto, cañón disparado, fin de la ronda).
export default class EffectIndicators {
  constructor(scene, field) {
    this.scene = scene;
    this.field = field;
    this.entries = new Map(); // key -> { side, icon, timer, mask }

    // Las máscaras no están en la escena: Phaser no las borra solo al salir.
    scene.events.once("shutdown", () => this.clearAll());
  }

  // side: "p1" / "p2", o null para los neutros. El color dice si al jugador le
  // conviene (verde) o lo perjudica (rojo); los neutros van en amarillo.
  // colorCategory lo fija a mano (en el Arcade todos ayudan: van en verde).
  // Si ya había un ícono del mismo efecto en ese lugar, lo reemplaza.
  track(side, kind, timer, colorCategory) {
    if (!timer) return;
    this.show(side, kind, timer, colorCategory);
  }

  // Efecto sin duración fija (punto doble: hasta el próximo punto). Se ve
  // completo hasta que se saca con hide.
  showUntimed(side, kind) {
    this.show(side, kind, null);
  }

  hide(side, kind) {
    this.remove(this.keyFor(side, kind));
  }

  show(side, kind, timer, colorCategory = this.defaultColor(side, kind)) {
    const key = this.keyFor(side, kind);
    this.remove(key, false);

    const icon = new PowerUpIcon(this.scene, 0, 0, kind, colorCategory).setDepth(INDICATOR_DEPTH);

    let mask = null;
    if (timer) {
      mask = this.scene.make.graphics({}, false);
      icon.setMask(mask.createGeometryMask());
    }

    this.entries.set(key, { side, icon, timer, mask });
    this.layout();
    this.update();
  }

  defaultColor(side, kind) {
    if (!side) return "yellow";
    return isBuffKind(kind) ? "green" : "red";
  }

  keyFor(side, kind) {
    return `${side ?? "neutral"}:${kind}`;
  }

  remove(key, relayout = true) {
    const entry = this.entries.get(key);
    if (!entry) return;

    entry.icon.destroy();
    entry.mask?.destroy();
    this.entries.delete(key);
    if (relayout) this.layout();
  }

  update() {
    for (const [key, { timer, mask }] of this.entries) {
      if (!timer) continue;

      const remaining = timer.getRemaining() / timer.delay;
      if (remaining <= 0) {
        this.remove(key);
        continue;
      }

      // Queda visible la parte que la aguja todavía no recorrió.
      const elapsedAngle = START_ANGLE + 360 * (1 - remaining);
      mask.clear();
      mask.fillStyle(0xffffff);
      mask.slice(
        0,
        0,
        POWERUP_RADIUS * ICON_SCALE + 1,
        Phaser.Math.DegToRad(elapsedAngle),
        Phaser.Math.DegToRad(START_ANGLE + 360),
        false
      );
      mask.fillPath();
    }
  }

  // Ubica cada ícono: los de cada jugador desde su esquina hacia el centro, y
  // los neutros centrados debajo del marcador.
  layout() {
    const rows = { p1: [], p2: [], neutral: [] };
    for (const entry of this.entries.values()) rows[entry.side ?? "neutral"].push(entry);

    rows.p1.forEach((entry, index) => this.place(entry, CORNER_MARGIN + index * ICON_SPACING, SIDE_ROW_Y));
    rows.p2.forEach((entry, index) =>
      this.place(entry, GAME_WIDTH - CORNER_MARGIN - index * ICON_SPACING, SIDE_ROW_Y)
    );
    rows.neutral.forEach((entry, index) =>
      this.place(entry, GAME_WIDTH / 2 + (index - (rows.neutral.length - 1) / 2) * ICON_SPACING, NEUTRAL_ROW_Y)
    );
  }

  // En pantalla y con el mismo tamaño aunque la cámara esté alejada (cancha grande).
  place({ icon, mask }, screenX, screenY) {
    this.field.placeOnScreen(icon, screenX, screenY);
    icon.setScale(icon.scaleX * ICON_SCALE);
    if (mask) this.field.placeOnScreen(mask, screenX, screenY);
  }

  clearAll() {
    Array.from(this.entries.keys()).forEach((key) => this.remove(key, false));
  }
}
