import Phaser from "phaser";
import { AI_DEAD_ZONE, AI_DIFFICULTIES } from "../config.js";

export default class AI {
  constructor(paddle, ballManager, side = "right", difficulty = "normal") {
    this.paddle = paddle;
    this.ballManager = ballManager;
    this.side = side;

    this.reactionTimer = 0;
    this.anticipationTimer = 0;
    this.isAnticipating = false;
    this.targetY = paddle.y;
    this.wasBallApproaching = false;

    this.setDifficulty(difficulty);
  }

  setDifficulty(difficulty) {
    const settings = AI_DIFFICULTIES[difficulty] ?? AI_DIFFICULTIES.normal;
    this.reactionDelay = settings.reactionDelay;
    this.errorMargin = settings.errorMargin;
    this.anticipationChance = settings.anticipationChance ?? 0;
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
      this.wasBallApproaching = false;
      this.updateAnticipation(ball, delta);
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

    this.moveTowardTarget();
  }

  // Solo relevante en difícil: aunque la pelota no venga hacia este lado, cada
  // "reactionDelay" hay una chance de igual reaccionar y reposicionarse (una
  // anticipación ocasional), en vez de quedarse siempre quieta.
  updateAnticipation(ball, delta) {
    if (this.anticipationChance <= 0) {
      this.paddle.stop();
      return;
    }

    this.anticipationTimer += delta;

    if (this.anticipationTimer >= this.reactionDelay) {
      this.anticipationTimer -= this.reactionDelay;
      this.isAnticipating = Math.random() < this.anticipationChance;

      if (this.isAnticipating) {
        this.targetY = ball.y + Phaser.Math.FloatBetween(-this.errorMargin, this.errorMargin);
      }
    }

    if (this.isAnticipating) {
      this.moveTowardTarget();
    } else {
      this.paddle.stop();
    }
  }

  moveTowardTarget() {
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
