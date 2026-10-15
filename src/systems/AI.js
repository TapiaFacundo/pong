import Phaser from "phaser";
import {
  AI_DEAD_ZONE,
  AI_DIFFICULTIES,
  AI_PREDICTION_MISS,
  AI_INVISIBLE_BALL_MISS,
  AI_INVERTED_EXTRA_REACTION,
  BALL_SIZE,
} from "../config.js";

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
    this.predictionMissFactor = 0;
    this.blindMissOffset = 0;

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

  // Con los controles invertidos (power-up en su contra) la IA tarda más en
  // reaccionar: le "cuesta" manejar la pala, igual que al jugador.
  get currentReactionDelay() {
    return this.reactionDelay + (this.paddle.invertControls ? AI_INVERTED_EXTRA_REACTION : 0);
  }

  // Al empezar cada jugada (la pelota empieza a venir hacia este lado) se
  // sortean los errores que la IA arrastra durante toda esa jugada. A
  // diferencia del margen de error normal, que se vuelve a sortear en cada
  // reacción y en promedio se compensa, estos no se compensan: la IA de
  // verdad se equivoca.
  startPlay() {
    this.reactionTimer = 0;
    this.predictionMissFactor = Phaser.Math.FloatBetween(-1, 1);
    this.blindMissOffset = Phaser.Math.FloatBetween(-AI_INVISIBLE_BALL_MISS, AI_INVISIBLE_BALL_MISS);
  }

  // Altura a la que apunta la IA cuando la pelota viene hacia su lado.
  aimY(ball) {
    let aim = ball.y;

    if (this.prediction > 0) {
      // La predicción nunca es exacta: arrastra un desvío fijo durante toda la
      // jugada. Si no, con tiempo de sobra (cancha grande) la IA no falla nunca.
      const predictedY = this.predictArrival(ball).y + this.predictionMissFactor * AI_PREDICTION_MISS;
      aim = ball.y + (predictedY - ball.y) * this.prediction;
    }

    // Con la pelota invisible la IA "no la ve bien" y erra más.
    if (ball.isInvisible) aim += this.blindMissOffset;

    return aim;
  }

  // Dónde va a cruzar la pelota la x de esta pala, contando los rebotes en el
  // techo y el piso (en línea recta: no adivina curvas ni zigzags).
  predictArrival(ball) {
    const velocity = ball.circle.body.velocity;
    if (velocity.x === 0) return { y: ball.y };

    const secondsToArrive = (this.paddle.x - ball.x) / velocity.x;
    if (secondsToArrive <= 0) return { y: ball.y };

    const bounds = this.paddle.scene.physics.world.bounds;
    const radius = BALL_SIZE / 2;
    const top = bounds.top + radius;
    const span = bounds.bottom - radius - top;

    // Desplegar los rebotes: la posición "sin paredes" se pliega dentro de la cancha.
    let offset = (ball.y + velocity.y * secondsToArrive - top) % (2 * span);
    if (offset < 0) offset += 2 * span;

    return { y: top + (offset > span ? 2 * span - offset : offset) };
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

    // Al empezar a acercarse la pelota, la IA tarda el tiempo de reacción en
    // fijar un objetivo y después lo actualiza con ese mismo período, con un
    // margen de error que baja según la dificultad.
    if (!this.wasBallApproaching) {
      this.startPlay();
      this.wasBallApproaching = true;
    }

    this.reactionTimer += delta;

    const reactionDelay = this.currentReactionDelay;
    if (this.reactionTimer >= reactionDelay) {
      this.reactionTimer -= reactionDelay;
      this.targetY = this.aimY(ball) + Phaser.Math.FloatBetween(-this.errorMargin, this.errorMargin);
    }

    this.moveTowardTarget();
  }

  // Solo relevante en difícil: aunque la pelota no venga hacia este lado, cada
  // tiempo de reacción hay una chance de igual reaccionar y reposicionarse (una
  // anticipación ocasional), en vez de quedarse siempre quieta.
  updateAnticipation(ball, delta) {
    if (this.anticipationChance <= 0) {
      this.paddle.stop();
      return;
    }

    this.anticipationTimer += delta;

    const reactionDelay = this.currentReactionDelay;
    if (this.anticipationTimer >= reactionDelay) {
      this.anticipationTimer -= reactionDelay;
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
