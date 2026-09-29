import { PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_SPEED, COLORS } from "../config.js";

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

  setHeightScale(scale) {
    const height = this.baseHeight * scale;
    this.rect.setSize(PADDLE_WIDTH, height);
    this.rect.body.setSize(PADDLE_WIDTH, height, true);
  }

  // Cambia la altura "normal" de la pala: los power-ups de tamaño se aplican
  // sobre ella y, al terminar, vuelven a ella.
  setBaseHeight(height) {
    this.baseHeight = height;
    this.setHeightScale(1);
  }

  resetHeightScale() {
    this.setHeightScale(1);
  }
}
