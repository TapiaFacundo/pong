import Phaser from "phaser";
import {
  BALL_SIZE,
  BALL_SPEED,
  BALL_MAX_BOUNCE_ANGLE,
  BALL_SPEED_INCREMENT,
  BALL_MAX_SPEED,
  BALL_TURBO_MULTIPLIER,
  BALL_MAX_MOTION_ANGLE,
  COLORS,
} from "../config.js";

export default class Ball {
  // baseSpeed / speedIncrement: velocidad de saque y aceleración por golpe de
  // pala (un nivel del Modo Historia puede cambiarlas; si no, las normales).
  constructor(scene, x, y, { baseSpeed = BALL_SPEED, speedIncrement = BALL_SPEED_INCREMENT } = {}) {
    this.baseSpeed = baseSpeed;
    this.speedIncrement = speedIncrement;

    this.circle = scene.add.circle(x, y, BALL_SIZE / 2, COLORS.BALL);
    scene.physics.add.existing(this.circle);
    this.circle.body.setCircle(BALL_SIZE / 2);
    this.circle.body.setCollideWorldBounds(true);
    this.circle.body.setBounce(1, 1);

    this.speed = baseSpeed;
    this.lastTouchedBy = null;

    // Dirección "base" de la trayectoria (vector unitario). Mientras hay
    // efectos de movimiento activos (zigzag, curva), la velocidad real se
    // arma cada frame a partir de esta dirección y de lo que aporta cada efecto.
    this.heading = { x: 1, y: 0 };
    this.motions = new Set();
  }

  get x() {
    return this.circle.x;
  }

  get y() {
    return this.circle.y;
  }

  get velocityX() {
    return this.circle.body.velocity.x;
  }

  launch(directionX = null) {
    this.speed = this.baseSpeed;

    const dir = directionX ?? (Math.random() < 0.5 ? -1 : 1);
    const angle = Phaser.Math.FloatBetween(-BALL_MAX_BOUNCE_ANGLE / 2, BALL_MAX_BOUNCE_ANGLE / 2);

    this.setDirection(Math.cos(angle) * dir, Math.sin(angle));
  }

  bounceOffPaddle(offsetRatio, directionX) {
    // Sube la velocidad con cada rebote, pero si ya está por encima del tope
    // (por un Turbo previo) no la baja: se queda congelada en ese nivel.
    this.speed = Math.max(this.speed, Math.min(this.speed * this.speedIncrement, BALL_MAX_SPEED));

    const angle = offsetRatio * BALL_MAX_BOUNCE_ANGLE;
    this.setDirection(Math.cos(angle) * directionX, Math.sin(angle));

    this.motions.forEach((motion) => motion.onPaddleHit?.(this, offsetRatio));
  }

  applyTurbo() {
    this.speed *= BALL_TURBO_MULTIPLIER;

    const velocity = this.circle.body.velocity;
    if (this.motions.size > 0) {
      this.setDirection(this.heading.x, this.heading.y);
    } else {
      this.setDirection(velocity.x, velocity.y);
    }
  }

  // Apunta la pelota en la dirección (x, y), sin importar su largo, a la
  // velocidad actual.
  setDirection(x, y) {
    const length = Math.hypot(x, y) || 1;
    this.heading = { x: x / length, y: y / length };
    this.circle.body.setVelocity(this.heading.x * this.speed, this.heading.y * this.speed);
  }

  addMotion(motion) {
    if (this.motions.size === 0) {
      const velocity = this.circle.body.velocity;
      const length = Math.hypot(velocity.x, velocity.y);
      if (length > 0) this.heading = { x: velocity.x / length, y: velocity.y / length };
    }
    this.motions.add(motion);
  }

  removeMotion(motion) {
    this.motions.delete(motion);

    // Sin efectos, la pelota vuelve a seguir su dirección base en línea recta.
    if (this.motions.size === 0 && this.circle.body) {
      this.setDirection(this.heading.x, this.heading.y);
    }
  }

  update(delta) {
    if (this.motions.size === 0 || !this.circle.body) return;

    const body = this.circle.body;

    // Rebote contra el borde superior o inferior: Arcade ya invirtió la
    // velocidad real; la dirección base se espeja igual para acompañarla.
    if (body.blocked.up || body.blocked.down) {
      const headingFlipped = body.blocked.up ? this.heading.y < 0 : this.heading.y > 0;
      this.heading.y = body.blocked.up ? Math.abs(this.heading.y) : -Math.abs(this.heading.y);
      this.motions.forEach((motion) => motion.onWallBounce?.(this, headingFlipped));
    }

    // Cada efecto puede torcer la dirección base (curva) y/o devolver un
    // desvío de ángulo momentáneo (zigzag). Ángulos medidos respecto del
    // avance horizontal: positivo = hacia abajo.
    let angleOffset = 0;
    this.motions.forEach((motion) => {
      angleOffset += motion.update?.(this, delta) ?? 0;
    });

    // El tope de ángulo garantiza que la pelota siempre siga avanzando hacia
    // el mismo arco: nunca puede darse vuelta hacia el lado del que viene.
    const forwardX = Math.sign(this.heading.x) || 1;
    const baseAngle = Math.atan2(this.heading.y, Math.abs(this.heading.x));
    const angle = Phaser.Math.Clamp(baseAngle + angleOffset, -BALL_MAX_MOTION_ANGLE, BALL_MAX_MOTION_ANGLE);

    body.setVelocity(Math.cos(angle) * this.speed * forwardX, Math.sin(angle) * this.speed);
  }

  resetPosition(x, y) {
    this.circle.body.reset(x, y);
    this.speed = this.baseSpeed;
    this.lastTouchedBy = null;
  }

  destroy() {
    this.circle.destroy();
  }
}
