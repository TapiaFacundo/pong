import Phaser from "phaser";
import { AI_DEAD_ZONE, AI_DIFFICULTIES, BALL_SIZE } from "../config.js";

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

  // difficulty: el nombre de una dificultad ("easy", "hard", ...) o una
  // configuración completa con la misma forma (la IA de un nivel del Modo Historia).
  setDifficulty(difficulty) {
    const settings =
      typeof difficulty === "string" ? AI_DIFFICULTIES[difficulty] ?? AI_DIFFICULTIES.normal : difficulty;
    this.reactionDelay = settings.reactionDelay;
    this.errorMargin = settings.errorMargin;
    this.anticipationChance = settings.anticipationChance ?? 0;
    // Predicción de trayectoria: 0 = sigue la altura actual de la pelota,
    // 1 = apunta a donde va a llegar; valores intermedios, a mitad de camino.
    this.prediction = settings.prediction === true ? 1 : Number(settings.prediction) || 0;
    this.paddle.setBaseSpeed(settings.speed);
  }

  // Altura a la que apunta la IA cuando la pelota viene hacia su lado.
  aimY(ball) {
    if (this.prediction <= 0) return ball.y;
    return ball.y + (this.predictArrivalY(ball) - ball.y) * this.prediction;
  }

  // Dónde va a cruzar la pelota la x de esta pala, contando los rebotes en el
  // techo y el piso (en línea recta: no adivina curvas ni zigzags).
  predictArrivalY(ball) {
    const velocity = ball.circle.body.velocity;
    if (velocity.x === 0) return ball.y;

    const secondsToArrive = (this.paddle.x - ball.x) / velocity.x;
    if (secondsToArrive <= 0) return ball.y;

    const bounds = this.paddle.scene.physics.world.bounds;
    const radius = BALL_SIZE / 2;
    const top = bounds.top + radius;
    const span = bounds.bottom - radius - top;

    // Desplegar los rebotes: la posición "sin paredes" se pliega dentro de la cancha.
    let offset = (ball.y + velocity.y * secondsToArrive - top) % (2 * span);
    if (offset < 0) offset += 2 * span;
    return top + (offset > span ? 2 * span - offset : offset);
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
      this.targetY = this.aimY(ball) + Phaser.Math.FloatBetween(-this.errorMargin, this.errorMargin);
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
