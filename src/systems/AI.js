import Phaser from "phaser";
import {
  AI_DEAD_ZONE,
  AI_DIFFICULTIES,
  AI_INVISIBLE_BALL_MISS,
  AI_INVERTED_EXTRA_REACTION,
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
    this.trackedBall = null;
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
    // Con varias pelotas: seguir a la que va a llegar antes (si no, siempre a la primera).
    this.trackFirstArrival = settings.trackFirstArrival ?? false;
    // Mientras la pelota se aleja: patrullar de pared a pared en vez de
    // quedarse quieta (o de la anticipación ocasional).
    this.patrolWhenIdle = settings.patrolWhenIdle ?? false;
    this.patrolDirection = 1;
    this.paddle.setBaseSpeed(settings.speed);
  }

  isApproaching(ball) {
    return (this.side === "right" && ball.velocityX > 0) || (this.side === "left" && ball.velocityX < 0);
  }

  // La pelota que sigue la IA: la primera en juego o, con trackFirstArrival,
  // la que viene hacia su lado y va a llegar antes.
  selectBall() {
    if (!this.trackFirstArrival) return this.ballManager.primary;

    let firstBall = null;
    let firstTime = Infinity;
    for (const ball of this.ballManager.balls) {
      if (!this.isApproaching(ball)) continue;

      const secondsToArrive = (this.paddle.x - ball.x) / ball.velocityX;
      if (secondsToArrive >= 0 && secondsToArrive < firstTime) {
        firstBall = ball;
        firstTime = secondsToArrive;
      }
    }

    return firstBall ?? this.ballManager.primary;
  }

  // Con los controles invertidos (power-up en su contra) la IA tarda más en
  // reaccionar: le "cuesta" manejar la pala, igual que al jugador.
  get currentReactionDelay() {
    return this.reactionDelay + (this.paddle.invertControls ? AI_INVERTED_EXTRA_REACTION : 0);
  }

  // Al empezar cada jugada (la pelota empieza a venir hacia este lado) se
  // sortea el error que la IA arrastra durante toda esa jugada si la pelota
  // está invisible. A diferencia del margen de error normal, que se vuelve a
  // sortear en cada reacción y en promedio se compensa, este no se compensa:
  // la IA de verdad se equivoca.
  startPlay() {
    this.reactionTimer = 0;
    this.blindMissOffset = Phaser.Math.FloatBetween(-AI_INVISIBLE_BALL_MISS, AI_INVISIBLE_BALL_MISS);
  }

  // Altura a la que apunta la IA cuando la pelota viene hacia su lado: la
  // altura actual de la pelota (con la pelota invisible, "no la ve bien" y erra más).
  aimY(ball) {
    return ball.isInvisible ? ball.y + this.blindMissOffset : ball.y;
  }

  update(delta) {
    const ball = this.selectBall();

    if (!ball) {
      this.paddle.stop();
      this.wasBallApproaching = false;
      this.trackedBall = null;
      return;
    }

    if (!this.isApproaching(ball)) {
      this.wasBallApproaching = false;
      this.trackedBall = null;
      if (this.patrolWhenIdle) {
        this.patrol();
      } else {
        this.updateAnticipation(ball, delta);
      }
      return;
    }

    // Al empezar a acercarse la pelota (o al cambiar a otra pelota que llega
    // antes), la IA tarda el tiempo de reacción en fijar un objetivo y después
    // lo actualiza con ese mismo período, con un margen de error que baja
    // según la dificultad.
    if (!this.wasBallApproaching || ball !== this.trackedBall) {
      this.startPlay();
      this.wasBallApproaching = true;
      this.trackedBall = ball;
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

  // Sube y baja de pared a pared, dando la vuelta al tocar el borde.
  patrol() {
    const body = this.paddle.rect.body;
    if (body.blocked.up || body.top <= body.world.bounds.top) this.patrolDirection = 1;
    if (body.blocked.down || body.bottom >= body.world.bounds.bottom) this.patrolDirection = -1;

    if (this.patrolDirection > 0) {
      this.paddle.moveDown();
    } else {
      this.paddle.moveUp();
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
