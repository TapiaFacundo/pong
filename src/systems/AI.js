import Phaser from "phaser";
import { AI_DEAD_ZONE, AI_DIFFICULTIES } from "../config.js";

export default class AI {
  constructor(paddle, ballManager, side = "right", difficulty = "normal") {
    this.paddle = paddle;
    this.ballManager = ballManager;
    this.side = side;

    this.reactionTimer = 0;
    this.targetY = paddle.y;
    this.wasBallApproaching = false;

    this.setDifficulty(difficulty);
  }

  setDifficulty(difficulty) {
    const settings = AI_DIFFICULTIES[difficulty] ?? AI_DIFFICULTIES.normal;
    this.reactionDelay = settings.reactionDelay;
    this.errorMargin = settings.errorMargin;
    this.paddle.setBaseSpeed(settings.speed);
  }

  update(delta) {
    const ball = this.ballManager.primary;

    if (!ball) {
      this.paddle.stop();
      this.wasBallApproaching = false;
      return;
    }

    const ballApproaching =
      (this.side === "right" && ball.velocityX > 0) || (this.side === "left" && ball.velocityX < 0);

    if (!ballApproaching) {
      this.paddle.stop();
      this.wasBallApproaching = false;
      return;
    }

    // Al empezar a acercarse la pelota, la IA tarda "reactionDelay" en fijar
    // un objetivo (simula el tiempo de reacción) y después lo actualiza con
    // ese mismo período, con un margen de error que baja según la dificultad.
    if (!this.wasBallApproaching) {
      this.reactionTimer = 0;
      this.wasBallApproaching = true;
    }

    this.reactionTimer += delta;

    if (this.reactionTimer >= this.reactionDelay) {
      this.reactionTimer -= this.reactionDelay;
      this.targetY = ball.y + Phaser.Math.FloatBetween(-this.errorMargin, this.errorMargin);
    }

    const diff = this.targetY - this.paddle.y;

    if (diff > AI_DEAD_ZONE) {
      this.paddle.moveDown();
    } else if (diff < -AI_DEAD_ZONE) {
      this.paddle.moveUp();
    } else {
      this.paddle.stop();
    }
  }
}
