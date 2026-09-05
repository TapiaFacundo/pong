import Phaser from "phaser";
import { GAME_WIDTH, BALL_SIZE } from "../config.js";
import Ball from "../entities/Ball.js";
import { playPaddleHit } from "./SoundEffects.js";

export default class BallManager {
  constructor(scene, paddleLeft, paddleRight, onBallOut) {
    this.scene = scene;
    this.paddleLeft = paddleLeft;
    this.paddleRight = paddleRight;
    this.onBallOut = onBallOut;
    this.balls = [];
  }

  get count() {
    return this.balls.length;
  }

  get primary() {
    return this.balls[0] ?? null;
  }

  addBall(x, y) {
    const ball = new Ball(this.scene, x, y);

    this.scene.physics.add.collider(ball.circle, this.paddleLeft.rect, () =>
      this.handlePaddleHit(ball, this.paddleLeft, "p1")
    );
    this.scene.physics.add.collider(ball.circle, this.paddleRight.rect, () =>
      this.handlePaddleHit(ball, this.paddleRight, "p2")
    );

    this.balls.push(ball);
    return ball;
  }

  handlePaddleHit(ball, paddle, playerId) {
    ball.lastTouchedBy = playerId;

    const offset = Phaser.Math.Clamp((ball.y - paddle.y) / (paddle.rect.height / 2), -1, 1);
    const directionX = paddle === this.paddleLeft ? 1 : -1;
    ball.bounceOffPaddle(offset, directionX);
    playPaddleHit();
  }

  update() {
    const radius = BALL_SIZE / 2;

    // onBallOut puede terminar el partido y vaciar this.balls (clearAll) o
    // arrancar una ronda nueva (addBall) en medio de este recorrido, así que
    // se itera sobre una copia y se revisa que la pelota siga en juego.
    for (const ball of [...this.balls]) {
      if (!this.balls.includes(ball)) continue;

      if (ball.x < -radius) {
        this.removeBall(ball);
        this.onBallOut("left");
      } else if (ball.x > GAME_WIDTH + radius) {
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
