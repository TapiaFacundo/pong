import Phaser from "phaser";
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  POWERUP_SPAWN_MIN_DELAY,
  POWERUP_SPAWN_MAX_DELAY,
  POWERUP_RAIN_MIN_DELAY,
  POWERUP_RAIN_MAX_DELAY,
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
    this.rainActive = false;
    this.rainTimer = null;
    this.spawnTimer = null;
  }

  // El temporizador corre solo mientras hay pelota en juego: arranca con cada
  // saque y se cancela al terminar la ronda (clearAll), para que no aparezcan
  // power-ups en la trayectoria del saque antes de que nadie toque la pelota.
  startTimer() {
    this.cancelTimer();
    this.scheduleNextSpawn();
  }

  cancelTimer() {
    if (this.spawnTimer) {
      this.spawnTimer.remove();
      this.spawnTimer = null;
    }
  }

  scheduleNextSpawn() {
    if (this.stopped) return;

    const [min, max] = this.rainActive
      ? [POWERUP_RAIN_MIN_DELAY, POWERUP_RAIN_MAX_DELAY]
      : [POWERUP_SPAWN_MIN_DELAY, POWERUP_SPAWN_MAX_DELAY];
    const delay = Phaser.Math.Between(min, max);
    this.spawnTimer = this.scene.time.delayedCall(delay, () => this.spawn());
  }

  startRain(duration) {
    this.rainActive = true;
    if (this.rainTimer) this.rainTimer.remove();
    this.rainTimer = this.scene.time.delayedCall(duration, () => this.stopRain());

    // Reprograma el próximo spawn con el intervalo de la lluvia en vez de
    // esperar al que ya estaba pendiente con el intervalo normal.
    this.startTimer();
  }

  stopRain() {
    this.rainActive = false;
    if (this.rainTimer) {
      this.rainTimer.remove();
      this.rainTimer = null;
    }
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
    // La zona de aparición está en el centro de la cancha y crece en proporción
    // si la cancha es más grande que la normal.
    const field = this.scene.physics.world.bounds;
    const areaWidth = POWERUP_SPAWN_AREA.width * (field.width / GAME_WIDTH);
    const areaHeight = POWERUP_SPAWN_AREA.height * (field.height / GAME_HEIGHT);

    for (let attempt = 0; attempt < MAX_POSITION_ATTEMPTS; attempt++) {
      const x = field.centerX + Phaser.Math.Between(-areaWidth / 2, areaWidth / 2);
      const y = field.centerY + Phaser.Math.Between(-areaHeight / 2, areaHeight / 2);

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
    this.cancelTimer();
    this.activePowerUps.forEach((powerUp) => powerUp.destroy());
    this.activePowerUps = [];
    this.stopRain();
  }

  stop() {
    this.stopped = true;
    this.clearAll();
  }
}
