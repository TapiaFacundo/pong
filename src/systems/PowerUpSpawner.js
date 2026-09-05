import Phaser from "phaser";
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  POWERUP_SPAWN_MIN_DELAY,
  POWERUP_SPAWN_MAX_DELAY,
  POWERUP_MIN_DISTANCE,
  POWERUP_SPAWN_AREA,
  POWERUP_DEFINITIONS,
} from "../config.js";
import PowerUp from "../entities/PowerUp.js";

const MAX_POSITION_ATTEMPTS = 20;

export default class PowerUpSpawner {
  constructor(scene, ballManager, onActivate) {
    this.scene = scene;
    this.ballManager = ballManager;
    this.onActivate = onActivate;
    this.activePowerUps = [];
    this.stopped = false;

    this.scheduleNextSpawn();
  }

  scheduleNextSpawn() {
    if (this.stopped) return;

    const delay = Phaser.Math.Between(POWERUP_SPAWN_MIN_DELAY, POWERUP_SPAWN_MAX_DELAY);
    this.spawnTimer = this.scene.time.delayedCall(delay, () => this.spawn());
  }

  spawn() {
    const position = this.findFreePosition();

    if (position) {
      const definition = Phaser.Utils.Array.GetRandom(POWERUP_DEFINITIONS);
      const powerUp = new PowerUp(this.scene, position.x, position.y, definition);
      this.activePowerUps.push(powerUp);

      this.ballManager.balls.forEach((ball) => this.watchCollision(powerUp, ball));
    }

    this.scheduleNextSpawn();
  }

  // Un power-up nuevo se registra contra las pelotas actuales; una pelota nueva
  // (bola extra) necesita registrarse contra los power-ups ya presentes en cancha.
  registerBall(ball) {
    this.activePowerUps.forEach((powerUp) => this.watchCollision(powerUp, ball));
  }

  watchCollision(powerUp, ball) {
    this.scene.physics.add.overlap(powerUp.circle, ball.circle, () => this.activate(powerUp, ball));
  }

  findFreePosition() {
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;

    for (let attempt = 0; attempt < MAX_POSITION_ATTEMPTS; attempt++) {
      const x = centerX + Phaser.Math.Between(-POWERUP_SPAWN_AREA.width / 2, POWERUP_SPAWN_AREA.width / 2);
      const y = centerY + Phaser.Math.Between(-POWERUP_SPAWN_AREA.height / 2, POWERUP_SPAWN_AREA.height / 2);

      const overlaps = this.activePowerUps.some(
        (powerUp) => Phaser.Math.Distance.Between(powerUp.x, powerUp.y, x, y) < POWERUP_MIN_DISTANCE
      );

      if (!overlaps) return { x, y };
    }

    return null;
  }

  activate(powerUp, ball) {
    this.activePowerUps = this.activePowerUps.filter((p) => p !== powerUp);
    powerUp.destroy();
    this.onActivate(powerUp.definition, ball);
  }

  clearAll() {
    this.activePowerUps.forEach((powerUp) => powerUp.destroy());
    this.activePowerUps = [];
  }

  stop() {
    this.stopped = true;
    if (this.spawnTimer) this.spawnTimer.remove();
    this.clearAll();
  }
}
