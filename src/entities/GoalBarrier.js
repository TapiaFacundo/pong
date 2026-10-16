import { GOAL_BARRIER_WIDTH, GOAL_BARRIER_OFFSET_X } from "../config.js";

// Barrera vertical sobre la línea del arco de un lado, entre las alturas top y
// bottom. Una pelota que llega desde la cancha a esa altura rebota hacia la
// cancha con su misma velocidad. La usan el escudo (todo el alto) y el arco
// chico (las puntas).
export default class GoalBarrier {
  constructor(scene, field, side, { top, bottom, color, alpha = 0.85 }) {
    // Hacia dónde rebota la pelota: hacia la cancha.
    this.direction = side === "p1" ? 1 : -1;
    this.top = top;
    this.bottom = bottom;

    const x = side === "p1" ? GOAL_BARRIER_OFFSET_X : field.width - GOAL_BARRIER_OFFSET_X;
    this.rect = scene.add.rectangle(x, (top + bottom) / 2, GOAL_BARRIER_WIDTH, bottom - top, color, alpha);
    // Borde de la barrera que mira hacia la cancha.
    this.faceX = x + (this.direction * GOAL_BARRIER_WIDTH) / 2;
  }

  // Una pelota que va hacia el arco, a la altura de la barrera, que en este
  // frame llegó a su cara desde la cancha. Se usa la posición de la física (ya
  // actualizada en este frame): la del dibujo recién se copia al final del frame.
  blocks(ball) {
    if (Math.sign(ball.velocityX) !== -this.direction) return false;

    const body = ball.circle.body;
    const radius = ball.radius;
    const x = body.center.x;
    const y = body.center.y;
    const previousX = body.prev.x + body.halfWidth;

    const atHeight = y + radius > this.top && y - radius < this.bottom;
    const atFace = this.direction > 0 ? x - radius <= this.faceX : x + radius >= this.faceX;
    // Si ya estaba detrás de la barrera (entró al arco por el hueco), no la saca.
    const cameFromField = this.direction > 0 ? previousX - radius >= this.faceX - 1 : previousX + radius <= this.faceX + 1;

    return atHeight && atFace && cameFromField;
  }

  // Rebota la pelota hacia la cancha. A alta velocidad puede haberse metido
  // unos px en la barrera: se la acomoda justo contra la cara. Se mueve solo
  // la física: al final del frame Phaser le pasa ese movimiento al dibujo.
  bounce(ball) {
    const body = ball.circle.body;
    const correctedX = this.faceX + this.direction * ball.radius;
    body.x += correctedX - body.center.x;
    body.updateCenter();

    ball.setDirection(Math.abs(body.velocity.x) * this.direction, body.velocity.y);
  }

  get x() {
    return this.rect.x;
  }

  destroy() {
    this.rect.destroy();
  }
}
