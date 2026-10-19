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
  // Opciones de un nivel del Modo Historia o de los modificadores de la
  // Batalla (si faltan, las normales):
  // - enabled: false para que no aparezcan power-ups.
  // - spawnDelay: { min, max } del intervalo normal entre power-ups (5 a 6,5 s).
  // - colorWeights: probabilidad relativa de cada power-up según su color
  //   (por ejemplo { red: 2 }: cada rojo sale el doble que los demás; con 0,
  //   ese color no sale). Si ningún color puede salir, no aparecen power-ups.
  constructor(scene, ballManager, onActivate, { enabled = true, spawnDelay, colorWeights } = {}) {
    this.scene = scene;
    this.ballManager = ballManager;
    this.onActivate = onActivate;
    this.spawnDelay = spawnDelay ?? { min: POWERUP_SPAWN_MIN_DELAY, max: POWERUP_SPAWN_MAX_DELAY };
    this.colorWeights = colorWeights ?? null;
    this.enabled = enabled && POWERUP_DEFINITIONS.some((definition) => this.weightOf(definition) > 0);
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
    if (!this.enabled) return;
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
      : [this.spawnDelay.min, this.spawnDelay.max];
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
    return this.rainTimer;
  }

  stopRain() {
    this.rainActive = false;
    if (this.rainTimer) {
      this.rainTimer.remove();
      this.rainTimer = null;
    }
  }

  weightOf(definition) {
    return this.colorWeights?.[definition.colorCategory] ?? 1;
  }

  // Elige qué power-up aparece: al azar, o pesado por color si el nivel lo pide.
  pickDefinition() {
    if (!this.colorWeights) return Phaser.Utils.Array.GetRandom(POWERUP_DEFINITIONS);

    const totalWeight = POWERUP_DEFINITIONS.reduce((sum, definition) => sum + this.weightOf(definition), 0);

    let roll = Math.random() * totalWeight;
    for (const definition of POWERUP_DEFINITIONS) {
      roll -= this.weightOf(definition);
      if (roll < 0) return definition;
    }
    return POWERUP_DEFINITIONS[POWERUP_DEFINITIONS.length - 1];
  }

  spawn() {
    const position = this.findFreePosition();

    if (position) this.spawnAt(this.pickDefinition(), position.x, position.y);

    this.scheduleNextSpawn();
  }

  spawnAt(definition, x, y) {
    const powerUp = new PowerUp(this.scene, x, y, definition);
    this.activePowerUps.push(powerUp);

    this.ballManager.balls.forEach((ball) => this.watchCollision(powerUp, ball));
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
