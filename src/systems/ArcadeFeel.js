import Phaser from "phaser";
import { ARCADE_DANGER_X, ARCADE_LASER_COLOR, POWERUP_COLORS, COLORS } from "../config.js";
import { playBrickHit, playMetalHit } from "./SoundEffects.js";
import { burst, pulse } from "./FeelEffects.js";

// Ladrillos: destello blanco al recibir un golpe; al romperse, pedazos de su
// color que salen girando y los puntos que dio flotando hacia arriba.
const BRICK_FLASH_ALPHA = 0.8;
const BRICK_FLASH_DURATION = 120;
const DEBRIS_COUNT = 6;
const POINTS_RISE = 26;
const POINTS_DURATION = 650;
// Racha: cada ladrillo roto seguido, sin que la pelota vuelva a la pala, suena
// un semitono más agudo (hasta una octava).
const MAX_STREAK = 12;
// Línea de peligro: late cada vez más fuerte y más rápido a medida que el muro
// se acerca (desde DANGER_WARNING_RANGE px de distancia).
const DANGER_WARNING_RANGE = 130;
const DANGER_SLOW_PERIOD = 900;
const DANGER_FAST_PERIOD = 260;
const WALL_SHAKE = { duration: 120, intensity: 0.004 };
const EXPLOSION_SHAKE = { duration: 150, intensity: 0.006 };
// Nivel completo: una franja de luz barre la zona del muro.
const SWEEP_WIDTH = 40;
const SWEEP_DURATION = 380;
const LASER_FLASH_RADIUS = 5;

// "Game feel" propio del Arcade (se suma al de GameFeel): solo imagen y
// sonido, no cambia nada del juego. Escucha eventos que emite ArcadeScene
// ("brickHit", "wallAdvance", "levelCleared", "capsuleCaught"), ArcadePowerUps
// ("brickExplosion") y ArcadeLaser ("laserShot"); "paddleHit" y "serve"
// cortan la racha.
//
// wall: el muro (para saber qué tan cerca está de la línea de peligro).
// dangerLine: la línea de peligro dibujada (su alpha es el de reposo).
export default class ArcadeFeel {
  constructor(scene, { wall, dangerLine }) {
    this.scene = scene;
    this.wall = wall;
    this.dangerLine = dangerLine;
    this.dangerLineAlpha = dangerLine.alpha;
    this.streak = 0;

    const handlers = {
      brickHit: this.onBrickHit,
      wallAdvance: () => this.shake(WALL_SHAKE),
      brickExplosion: () => this.shake(EXPLOSION_SHAKE),
      levelCleared: this.onLevelCleared,
      laserShot: this.onLaserShot,
      capsuleCaught: this.onCapsuleCaught,
      paddleHit: this.resetStreak,
      serve: this.resetStreak,
      update: this.updateDangerLine,
    };
    const events = scene.events;
    for (const [event, handler] of Object.entries(handlers)) events.on(event, handler, this);
    events.once("shutdown", () => {
      for (const [event, handler] of Object.entries(handlers)) events.off(event, handler, this);
    });
  }

  resetStreak() {
    this.streak = 0;
  }

  // points: los que sumó (0 si no se rompió).
  onBrickHit({ brick, broken, points }) {
    if (brick.isMetal) {
      playMetalHit();
      pulse(this.scene, brick.rect, { alpha: 0.4, duration: BRICK_FLASH_DURATION });
      return;
    }

    if (!broken) {
      playBrickHit(false, 0);
      pulse(this.scene, brick.rect, { alpha: BRICK_FLASH_ALPHA, duration: BRICK_FLASH_DURATION });
      return;
    }

    this.streak = Math.min(this.streak + 1, MAX_STREAK);
    playBrickHit(true, this.streak - 1);

    burst(this.scene, brick.x, brick.y, {
      count: DEBRIS_COUNT,
      color: brick.color,
      angle: 0,
      spread: Math.PI * 2,
      distance: [12, 40],
      size: 6,
      duration: 450,
      spin: true,
    });
    if (points > 0) this.floatPoints(brick.x, brick.y, points);
  }

  floatPoints(x, y, points) {
    const text = this.scene.add
      .text(x, y, `+${points}`, { fontSize: "14px", color: COLORS.TEXT, stroke: "#000000", strokeThickness: 3 })
      .setOrigin(0.5)
      .setDepth(10);

    this.scene.tweens.add({
      targets: text,
      y: y - POINTS_RISE,
      alpha: { from: 1, to: 0 },
      duration: POINTS_DURATION,
      ease: "Quad.easeOut",
      onComplete: () => text.destroy(),
    });
  }

  onLevelCleared() {
    const bounds = this.scene.physics.world.bounds;
    const sweep = this.scene.add.rectangle(ARCADE_DANGER_X, bounds.centerY, SWEEP_WIDTH, bounds.height, 0xffffff, 0.3);

    this.scene.tweens.add({
      targets: sweep,
      x: bounds.right,
      alpha: 0,
      duration: SWEEP_DURATION,
      ease: "Quad.easeIn",
      onComplete: () => sweep.destroy(),
    });
  }

  // Fogonazo en la punta de cada rayo al salir. ys: alturas de los rayos.
  onLaserShot({ x, ys }) {
    ys.forEach((y) => {
      const flash = this.scene.add.circle(x, y, LASER_FLASH_RADIUS, ARCADE_LASER_COLOR, 0.9);
      this.scene.tweens.add({
        targets: flash,
        scale: 2.2,
        alpha: 0,
        duration: 110,
        onComplete: () => flash.destroy(),
      });
    });
  }

  // La pala "se traga" la cápsula: un pulso del color del power-up.
  onCapsuleCaught({ paddle, colorCategory }) {
    pulse(this.scene, paddle.rect, { color: POWERUP_COLORS[colorCategory], scaleX: 2.2, scaleY: 1.1, duration: 200 });
  }

  updateDangerLine() {
    const line = this.dangerLine;
    if (!line.visible) return;

    const distance = this.wall.frontX - ARCADE_DANGER_X;
    const closeness = Phaser.Math.Clamp(1 - distance / DANGER_WARNING_RANGE, 0, 1);
    if (closeness === 0) {
      line.setAlpha(this.dangerLineAlpha);
      return;
    }

    const period = Phaser.Math.Linear(DANGER_SLOW_PERIOD, DANGER_FAST_PERIOD, closeness);
    const wave = 0.5 + 0.5 * Math.sin((this.scene.time.now / period) * Math.PI * 2);
    line.setAlpha(this.dangerLineAlpha + (1 - this.dangerLineAlpha) * closeness * wave);
  }

  shake({ duration, intensity }) {
    this.scene.cameras.main.shake(duration, intensity);
  }
}
