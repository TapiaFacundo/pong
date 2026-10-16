import Phaser from "phaser";
import {
  PADDLE_WIDTH,
  CANNON_COLOR,
  CANNON_FUSE_DURATION,
  CANNON_MAX_ANGLE,
  CANNON_AIM_SPEED,
  CANNON_ARROW_LENGTH,
  CANNON_SPEED_MULTIPLIER,
  CANNON_MIN_SPEED,
} from "../config.js";
import { playCannonShot } from "./SoundEffects.js";

const BARREL_LENGTH = 10;
const BARREL_HEIGHT = 14;
const FUSE_WIDTH = 40;
const FUSE_HEIGHT = 5;
// Hacia dónde apunta la IA: lejos de la pala rival, cerca de esta fracción
// del alto de la cancha (arriba o abajo, la que esté más lejos).
const AI_TARGET_EDGE = 0.15;

// Power-up "Cañón": la próxima vez que una pala del lado afectado toca la
// pelota, la agarra. Mientras se consume la mecha, las teclas de esa pala
// mueven una flecha para apuntar (la IA apunta sola, lejos de la pala rival)
// y al terminar la pelota sale disparada en esa dirección con mucha potencia.
//
// Mientras el cañón está cargado, cada pala de ese lado muestra un caño
// naranja adelante. Se engancha a BallManager como "atrapador" (tryCatch) y
// necesita update() cada frame.
export default class CannonEffect {
  constructor(scene, field, paddlesBySide, opponentBySide, feedback) {
    this.scene = scene;
    this.field = field;
    this.paddlesBySide = paddlesBySide; // side -> [palas] (comparte la lista de PowerUpEffects)
    this.opponentBySide = opponentBySide; // side -> pala rival principal
    this.feedback = feedback;

    this.armed = {}; // side -> { expireTimer, barrels }
    this.loaded = {}; // side -> { ball, paddle, direction, angle, elapsed, graphics }
  }

  // Volver a agarrarlo reinicia el tiempo (no suma disparos). Devuelve el
  // temporizador de la espera (se corta al agarrar la pelota), o null si esa
  // pala ya tiene la pelota agarrada.
  arm(side, duration) {
    if (this.loaded[side]) return null;
    this.disarm(side);

    const barrels = this.paddlesBySide[side].map(() =>
      this.scene.add.rectangle(0, 0, BARREL_LENGTH, BARREL_HEIGHT, CANNON_COLOR)
    );
    const expireTimer = this.scene.time.delayedCall(duration, () => this.disarm(side));
    this.armed[side] = { expireTimer, barrels };
    this.updateBarrels(side);
    return expireTimer;
  }

  disarm(side) {
    const armed = this.armed[side];
    if (!armed) return;

    armed.expireTimer.remove();
    armed.barrels.forEach((barrel) => barrel.destroy());
    delete this.armed[side];
  }

  tryCatch(ball, paddle, playerId, directionX) {
    if (!this.armed[playerId] || this.loaded[playerId] || ball.isHeld) return false;

    this.disarm(playerId);
    ball.isHeld = true;
    ball.circle.body.setVelocity(0, 0);

    const loaded = {
      ball,
      paddle,
      direction: directionX,
      angle: 0,
      elapsed: 0,
      graphics: this.scene.add.graphics().setDepth(5),
    };
    this.loaded[playerId] = loaded;

    paddle.aim = {
      steer: (input, delta) => this.steer(loaded, input, delta),
      autoSteer: (delta) => this.autoSteer(playerId, loaded, delta),
    };
    this.holdBall(loaded);
    return true;
  }

  // input: -1 = arriba, 1 = abajo, 0 = nada.
  steer(loaded, input, delta) {
    loaded.angle = Phaser.Math.Clamp(
      loaded.angle + input * CANNON_AIM_SPEED * (delta / 1000),
      -CANNON_MAX_ANGLE,
      CANNON_MAX_ANGLE
    );
  }

  // La IA mueve la flecha hacia el lado de la cancha más lejos de la pala rival.
  autoSteer(side, loaded, delta) {
    const opponent = this.opponentBySide[side];
    const targetY =
      opponent.y < this.field.centerY ? this.field.height * (1 - AI_TARGET_EDGE) : this.field.height * AI_TARGET_EDGE;
    const targetAngle = Phaser.Math.Clamp(
      Math.atan2(targetY - loaded.ball.y, Math.abs(opponent.x - loaded.ball.x)),
      -CANNON_MAX_ANGLE,
      CANNON_MAX_ANGLE
    );

    const difference = targetAngle - loaded.angle;
    const maxStep = CANNON_AIM_SPEED * (delta / 1000);
    if (Math.abs(difference) <= maxStep) {
      loaded.angle = targetAngle;
    } else {
      this.steer(loaded, Math.sign(difference), delta);
    }
  }

  update(delta) {
    Object.keys(this.armed).forEach((side) => this.updateBarrels(side));

    for (const [side, loaded] of Object.entries(this.loaded)) {
      if (!loaded.ball.circle.body) {
        this.release(side);
        continue;
      }

      loaded.elapsed += delta;
      this.holdBall(loaded);
      this.draw(loaded);

      if (loaded.elapsed >= CANNON_FUSE_DURATION) this.fire(side);
    }
  }

  // El caño naranja de cada pala con el cañón cargado la sigue adelante.
  updateBarrels(side) {
    const direction = side === "p1" ? 1 : -1;
    this.armed[side].barrels.forEach((barrel, index) => {
      const paddle = this.paddlesBySide[side][index];
      barrel.setPosition(paddle.x + direction * (PADDLE_WIDTH / 2 + BARREL_LENGTH / 2), paddle.y);
    });
  }

  // La pelota queda quieta pegada adelante de la pala.
  holdBall({ ball, paddle, direction }) {
    ball.circle.body.reset(paddle.x + direction * (PADDLE_WIDTH / 2 + ball.radius + 2), paddle.y);
  }

  // Flecha desde la pelota hacia donde apunta, y la mecha (barra que se
  // consume) sobre la pala.
  draw({ ball, paddle, direction, angle, elapsed, graphics }) {
    const dirX = Math.cos(angle) * direction;
    const dirY = Math.sin(angle);
    const tipX = ball.x + dirX * CANNON_ARROW_LENGTH;
    const tipY = ball.y + dirY * CANNON_ARROW_LENGTH;
    const headSize = 12;
    const backX = tipX - dirX * headSize;
    const backY = tipY - dirY * headSize;

    graphics.clear();
    graphics.lineStyle(4, CANNON_COLOR, 1);
    graphics.lineBetween(ball.x, ball.y, tipX, tipY);
    graphics.fillStyle(CANNON_COLOR, 1);
    graphics.fillTriangle(
      tipX,
      tipY,
      backX - dirY * headSize * 0.6,
      backY + dirX * headSize * 0.6,
      backX + dirY * headSize * 0.6,
      backY - dirX * headSize * 0.6
    );

    const remaining = Math.max(0, 1 - elapsed / CANNON_FUSE_DURATION);
    const fuseY = paddle.y - paddle.rect.height / 2 - 14;
    graphics.fillStyle(0x444444, 1);
    graphics.fillRect(paddle.x - FUSE_WIDTH / 2, fuseY, FUSE_WIDTH, FUSE_HEIGHT);
    graphics.fillStyle(CANNON_COLOR, 1);
    graphics.fillRect(paddle.x - FUSE_WIDTH / 2, fuseY, FUSE_WIDTH * remaining, FUSE_HEIGHT);
  }

  fire(side) {
    const { ball, direction, angle } = this.loaded[side];
    this.release(side);

    ball.speed = Math.max(ball.speed * CANNON_SPEED_MULTIPLIER, CANNON_MIN_SPEED);
    ball.setDirection(Math.cos(angle) * direction, Math.sin(angle));
    ball.lastTouchedBy = side;

    this.feedback.spawnBurst(ball.x, ball.y, CANNON_COLOR);
    playCannonShot();
  }

  // Suelta la pelota (sin disparar) y borra la flecha y la mecha.
  release(side) {
    const loaded = this.loaded[side];
    if (!loaded) return;

    loaded.ball.isHeld = false;
    loaded.graphics.destroy();
    delete loaded.paddle.aim;
    delete this.loaded[side];
  }

  clearAll() {
    Object.keys(this.armed).forEach((side) => this.disarm(side));
    Object.keys(this.loaded).forEach((side) => this.release(side));
  }
}
