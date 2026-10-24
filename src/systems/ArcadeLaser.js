import {
  ARCADE_LASER_INTERVAL,
  ARCADE_LASER_SPEED,
  ARCADE_LASER_COLOR,
  PADDLE_WIDTH,
} from "../config.js";
import { playLaserShot } from "./SoundEffects.js";

const SHOT_WIDTH = 14;
const SHOT_HEIGHT = 3;
// Los dos rayos salen cerca de las puntas de la pala.
const SHOT_SPREAD = 0.35;

// Láser del Arcade: mientras dura, la pala dispara sola dos rayos hacia el
// muro cada ARCADE_LASER_INTERVAL. Cada rayo le saca un golpe al primer
// ladrillo que toca (el metal lo frena sin romperse) y desaparece.
export default class ArcadeLaser {
  constructor(scene, paddle, wall) {
    this.scene = scene;
    this.paddle = paddle;
    this.wall = wall;
    this.shots = [];
    this.durationTimer = null;
    this.fireTimer = null;
  }

  // Volver a agarrarlo reinicia el tiempo. Devuelve el temporizador.
  start(duration) {
    this.stop();
    this.fireTimer = this.scene.time.addEvent({ delay: ARCADE_LASER_INTERVAL, loop: true, callback: () => this.fire() });
    this.durationTimer = this.scene.time.delayedCall(duration, () => this.stop());
    return this.durationTimer;
  }

  fire() {
    const x = this.paddle.x + PADDLE_WIDTH / 2 + SHOT_WIDTH / 2;
    const offset = this.paddle.rect.height * SHOT_SPREAD;
    const ys = [this.paddle.y - offset, this.paddle.y + offset];
    ys.forEach((y) => this.addShot(x, y));
    playLaserShot();
    this.scene.events.emit("laserShot", { x, ys });
  }

  addShot(x, y) {
    const shot = this.scene.add.rectangle(x, y, SHOT_WIDTH, SHOT_HEIGHT, ARCADE_LASER_COLOR);
    this.scene.physics.add.existing(shot);
    shot.body.setVelocityX(ARCADE_LASER_SPEED);

    // Se está calculando el choque: el rayo solo se apaga; se borra en update().
    const overlap = this.scene.physics.add.overlap(shot, this.wall.group, (_shot, rect) => {
      if (!shot.active) return;
      shot.setActive(false).setVisible(false);
      shot.body.enable = false;
      this.wall.damage(rect.brick);
    });
    this.shots.push({ shot, overlap });
  }

  removeShot(shot) {
    const entry = this.shots.find((candidate) => candidate.shot === shot);
    if (!entry) return;

    entry.overlap.destroy();
    shot.destroy();
    this.shots = this.shots.filter((candidate) => candidate !== entry);
  }

  // Borra los rayos que ya pegaron o que salieron de la cancha.
  update() {
    const right = this.scene.physics.world.bounds.right;
    this.shots
      .filter(({ shot }) => !shot.active || shot.x > right)
      .forEach(({ shot }) => this.removeShot(shot));
  }

  stop() {
    this.fireTimer?.remove();
    this.durationTimer?.remove();
    this.fireTimer = null;
    this.durationTimer = null;
  }

  // Al perder una vida o pasar de nivel: se corta y se borran los rayos en vuelo.
  clearAll() {
    this.stop();
    [...this.shots].forEach(({ shot }) => this.removeShot(shot));
  }
}
