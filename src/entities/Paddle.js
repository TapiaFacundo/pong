import { PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_SPEED, COLORS } from "../config.js";

// Al crecer o achicarse por un power-up, el dibujo llega a su tamaño con un
// pequeño rebote; el choque cambia al instante (ver setHeightScale).
const RESIZE_DURATION = 220;

export default class Paddle {
  // speedScale: multiplica cualquier velocidad que se le asigne a la pala (en
  // una cancha más alta, las palas se mueven más rápido en proporción).
  constructor(scene, x, y, { speedScale = 1 } = {}) {
    this.scene = scene;
    this.isLocked = false;
    this.speedScale = speedScale;
    this.baseSpeed = PADDLE_SPEED * speedScale;
    this.speed = this.baseSpeed;
    this.baseHeight = PADDLE_HEIGHT;
    this.invertControls = false;
    this.resizeTween = null;

    this.rect = scene.add.rectangle(x, y, PADDLE_WIDTH, PADDLE_HEIGHT, COLORS.PADDLE);
    scene.physics.add.existing(this.rect);
    this.rect.body.setCollideWorldBounds(true);
    this.rect.body.setImmovable(true);
  }

  get x() {
    return this.rect.x;
  }

  get y() {
    return this.rect.y;
  }

  // El alto con el que choca (el dibujo puede estar todavía animándose).
  get height() {
    return this.rect.body.height;
  }

  moveUp() {
    if (this.isLocked) return;
    this.rect.body.setVelocityY(-this.speed);
  }

  moveDown() {
    if (this.isLocked) return;
    this.rect.body.setVelocityY(this.speed);
  }

  // Lleva la pala al centro de su lado con una animación. Mientras dura no
  // responde a los controles (ni del jugador ni de la IA).
  recenter(duration) {
    this.isLocked = true;
    this.stop();

    this.scene.tweens.add({
      targets: this.rect,
      y: this.scene.physics.world.bounds.centerY,
      duration,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.isLocked = false;
      },
    });
  }

  stop() {
    this.rect.body.setVelocityY(0);
  }

  setBaseSpeed(value) {
    this.baseSpeed = value * this.speedScale;
    this.speed = this.baseSpeed;
  }

  setSpeedScale(scale) {
    this.speed = this.baseSpeed * scale;
  }

  resetSpeed() {
    this.speed = this.baseSpeed;
  }

  // El cuerpo físico toma el alto nuevo en el momento; con `animate`, solo el
  // dibujo va de un alto al otro (con un pequeño rebote).
  setHeightScale(scale, { animate = true } = {}) {
    const height = this.baseHeight * scale;
    this.rect.body.setSize(PADDLE_WIDTH, height, false);

    this.resizeTween?.remove();
    this.resizeTween = null;
    if (!animate) {
      this.setDrawnHeight(height, height);
      return;
    }

    // Desde ya, el cuerpo queda centrado aunque el dibujo todavía no cambió.
    this.setDrawnHeight(this.rect.height, height);
    this.resizeTween = this.scene.tweens.addCounter({
      from: this.rect.height,
      to: height,
      duration: RESIZE_DURATION,
      ease: "Back.easeOut",
      onUpdate: (tween) => this.setDrawnHeight(tween.getValue(), height),
      onComplete: () => (this.resizeTween = null),
    });
  }

  // Dibuja la pala con alto `drawnHeight` y deja el cuerpo físico (de alto
  // `bodyHeight`) centrado igual: Phaser ubica el cuerpo respecto del dibujo,
  // así que el corrimiento se compensa con el offset.
  setDrawnHeight(drawnHeight, bodyHeight) {
    this.rect.setSize(PADDLE_WIDTH, drawnHeight);
    this.rect.body.setOffset(0, (drawnHeight - bodyHeight) / 2);
  }

  // Cambia la altura "normal" de la pala: los power-ups de tamaño se aplican
  // sobre ella y, al terminar, vuelven a ella.
  setBaseHeight(height) {
    this.baseHeight = height;
    this.setHeightScale(1, { animate: false });
  }

  resetHeightScale() {
    this.setHeightScale(1);
  }
}
