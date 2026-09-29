import Phaser from "phaser";
import { BALL_SIZE } from "../config.js";
import Ball from "../entities/Ball.js";
import { playPaddleHit } from "./SoundEffects.js";

export default class BallManager {
  // ballSettings: opciones para cada pelota nueva ({ baseSpeed, speedIncrement }).
  constructor(scene, paddleLeft, paddleRight, onBallOut, ballSettings = {}) {
    this.scene = scene;
    this.ballSettings = ballSettings;
    this.shotModifier = null;
    this.paddleLeft = paddleLeft;
    this.paddleRight = paddleRight;
    this.onBallOut = onBallOut;
    this.balls = [];
    this.paddles = [];

    this.addPaddle(paddleLeft, "p1", 1);
    this.addPaddle(paddleRight, "p2", -1);
  }

  // Suma una pala que rebota pelotas. directionX: hacia dónde sale la pelota
  // al rebotar en ella (1 = derecha). Sirve también para palas extra, como la
  // pala adelantada de Los Gemelos.
  addPaddle(paddle, playerId, directionX) {
    const entry = { paddle, playerId, directionX };
    this.paddles.push(entry);
    this.balls.forEach((ball) => this.watchPaddle(ball, entry));
  }

  // Una pala solo choca las pelotas que vienen de frente (hacia su arco): así
  // una pelota que ya rebotó y se aleja la atraviesa por detrás en vez de
  // volver a rebotar hacia el arco de esa pala.
  watchPaddle(ball, { paddle, playerId, directionX }) {
    this.scene.physics.add.collider(
      ball.circle,
      paddle.rect,
      () => this.handlePaddleHit(ball, paddle, playerId, directionX),
      () => Math.sign(ball.velocityX) === -directionX
    );
  }

  get count() {
    return this.balls.length;
  }

  get primary() {
    return this.balls[0] ?? null;
  }

  addBall(x, y) {
    const ball = new Ball(this.scene, x, y, this.ballSettings);

    this.paddles.forEach((entry) => this.watchPaddle(ball, entry));

    this.balls.push(ball);
    return ball;
  }

  // Un sistema que puede cambiar cómo sale un golpe de pala (por ejemplo, el
  // tiro con efecto de Trivela): beforeBounce(ball, playerId, offset) devuelve
  // el offset a usar y afterBounce(ball, playerId, offset) corre después del rebote.
  setShotModifier(modifier) {
    this.shotModifier = modifier;
  }

  handlePaddleHit(ball, paddle, playerId, directionX) {
    ball.lastTouchedBy = playerId;

    let offset = Phaser.Math.Clamp((ball.y - paddle.y) / (paddle.rect.height / 2), -1, 1);
    if (this.shotModifier) offset = this.shotModifier.beforeBounce(ball, playerId, offset);

    ball.bounceOffPaddle(offset, directionX);
    this.shotModifier?.afterBounce(ball, playerId, offset);
    playPaddleHit();
  }

  update(delta) {
    const radius = BALL_SIZE / 2;

    // onBallOut puede terminar el partido y vaciar this.balls (clearAll) o
    // arrancar una ronda nueva (addBall) en medio de este recorrido, así que
    // se itera sobre una copia y se revisa que la pelota siga en juego.
    for (const ball of [...this.balls]) {
      if (!this.balls.includes(ball)) continue;

      ball.update(delta);

      if (ball.x < -radius) {
        this.removeBall(ball);
        this.onBallOut("left");
      } else if (ball.x > this.scene.physics.world.bounds.right + radius) {
        this.removeBall(ball);
        this.onBallOut("right");
      }
    }
  }

  removeBall(ball) {
    const index = this.balls.indexOf(ball);
    if (index !== -1) this.balls.splice(index, 1);
    ball.destroy();
  }

  clearAll() {
    this.balls.forEach((ball) => ball.destroy());
    this.balls = [];
  }
}
