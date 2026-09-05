import Phaser from "phaser";
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PADDLE_OFFSET_X,
  COLORS,
  KEYS,
  WIN_SCORE_SHORT,
  PADDLE_POWERUP_KINDS,
  POWERUP_TEXT_COLORS,
  POWERUP_EFFECT_DURATION,
} from "../config.js";
import Paddle from "../entities/Paddle.js";
import PlayerController from "../systems/PlayerController.js";
import AI from "../systems/AI.js";
import ScoreManager from "../systems/ScoreManager.js";
import PowerUpSpawner from "../systems/PowerUpSpawner.js";
import PowerUpEffects from "../systems/PowerUpEffects.js";
import PowerUpFeedback from "../systems/PowerUpFeedback.js";
import { playPowerUpPickup, playScore } from "../systems/SoundEffects.js";
import BallManager from "../systems/BallManager.js";
import BallEffects from "../systems/BallEffects.js";
import CenterPaddleEffect from "../systems/CenterPaddleEffect.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  init(data) {
    this.mode = data.mode ?? "1p";
    this.winScore = data.winScore ?? WIN_SCORE_SHORT;
    this.difficulty = data.difficulty ?? "normal";
    this.matchOver = false;
    this.isPaused = false;
  }

  create() {
    this.physics.world.setBoundsCollision(false, false, true, true);

    this.drawMidLine();
    this.scoreManager = new ScoreManager(this.winScore);

    this.paddleLeft = new Paddle(this, PADDLE_OFFSET_X, GAME_HEIGHT / 2);
    this.paddleRight = new Paddle(this, GAME_WIDTH - PADDLE_OFFSET_X, GAME_HEIGHT / 2);

    this.ballManager = new BallManager(this, this.paddleLeft, this.paddleRight, (side) =>
      this.onBallOut(side)
    );
    this.ballManager.addBall(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    this.controllerLeft = new PlayerController(this, this.paddleLeft, {
      up: KEYS.P1_UP,
      down: KEYS.P1_DOWN,
    });

    this.controllerRight =
      this.mode === "2p"
        ? new PlayerController(this, this.paddleRight, { up: KEYS.P2_UP, down: KEYS.P2_DOWN })
        : new AI(this.paddleRight, this.ballManager, "right", this.difficulty);

    this.scoreTextLeft = this.add
      .text(GAME_WIDTH / 2 - 60, 30, "0", { fontSize: "48px", color: COLORS.TEXT })
      .setOrigin(0.5);
    this.scoreTextRight = this.add
      .text(GAME_WIDTH / 2 + 60, 30, "0", { fontSize: "48px", color: COLORS.TEXT })
      .setOrigin(0.5);

    this.powerUpEffects = new PowerUpEffects(this, { p1: this.paddleLeft, p2: this.paddleRight });
    this.powerUpFeedback = new PowerUpFeedback(this);
    this.ballEffects = new BallEffects(this);
    this.centerPaddleEffect = new CenterPaddleEffect(this, this.ballManager);

    this.powerUpSpawner = new PowerUpSpawner(this, this.ballManager, (definition, ball) =>
      this.onPowerUpActivated(definition, ball)
    );

    this.doublePointIndicator = this.add
      .text(0, 0, "×2", { fontSize: "18px", color: POWERUP_TEXT_COLORS.yellow })
      .setOrigin(0.5)
      .setVisible(false);

    this.time.delayedCall(600, () => this.ballManager.primary.launch());

    this.input.keyboard.on("keydown-ESC", () => this.pauseGame());
  }

  pauseGame() {
    if (this.isPaused || this.matchOver) return;

    this.isPaused = true;
    this.scene.launch("PauseScene");
    this.scene.pause();
  }

  update(time, delta) {
    if (this.matchOver) return;

    this.controllerLeft.update(delta);
    this.controllerRight.update(delta);
    this.ballManager.update();
  }

  drawMidLine() {
    const graphics = this.add.graphics();
    graphics.lineStyle(4, COLORS.MID_LINE, 1);

    const dashHeight = 16;
    const gap = 12;
    for (let y = 0; y < GAME_HEIGHT; y += dashHeight + gap) {
      graphics.lineBetween(GAME_WIDTH / 2, y, GAME_WIDTH / 2, y + dashHeight);
    }
  }

  onBallOut(exitSide) {
    const scoringSide = exitSide === "left" ? "p2" : "p1";
    this.lastScoringSide = scoringSide;

    this.scoreManager.addPoint(scoringSide);
    this.scoreTextLeft.setText(String(this.scoreManager.scoreP1));
    this.scoreTextRight.setText(String(this.scoreManager.scoreP2));
    this.updateDoublePointIndicator();
    playScore();

    // "Gana quien llegue primero": el partido termina apenas se alcanza el
    // puntaje objetivo, aunque queden otras pelotas en cancha por salir.
    const winner = this.scoreManager.checkWinner();
    if (winner) {
      this.showWinner(winner);
      return;
    }

    if (this.ballManager.count > 0) return;

    this.resetRound(this.lastScoringSide);
  }

  resetRound(scoringSide) {
    this.powerUpSpawner.clearAll();
    this.powerUpEffects.clearAll();
    this.ballEffects.clearAll();
    this.centerPaddleEffect.clear();

    const directionTowardsLoser = scoringSide === "p1" ? 1 : -1;
    const ball = this.ballManager.addBall(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    this.time.delayedCall(600, () => ball.launch(directionTowardsLoser));
  }

  updateDoublePointIndicator() {
    const side = this.scoreManager.doublePointSide;

    if (side === "p1") {
      this.doublePointIndicator.setPosition(GAME_WIDTH / 2 - 60, 65).setVisible(true);
    } else if (side === "p2") {
      this.doublePointIndicator.setPosition(GAME_WIDTH / 2 + 60, 65).setVisible(true);
    } else {
      this.doublePointIndicator.setVisible(false);
    }
  }

  onPowerUpActivated(definition, ball) {
    const attackerSide = ball.lastTouchedBy;
    const pickupX = ball.x;
    const pickupY = ball.y;
    let targetPaddle = null;

    if (PADDLE_POWERUP_KINDS.includes(definition.kind)) {
      targetPaddle = this.powerUpEffects.applyPaddleEffect(definition.kind, definition.colorCategory, attackerSide);
    } else if (definition.kind === "doublePoint") {
      const targetSide = this.powerUpEffects.resolveTarget(definition.kind, definition.colorCategory, attackerSide);
      if (targetSide) {
        this.scoreManager.setDoublePoint(targetSide);
        this.updateDoublePointIndicator();
      }
    } else if (definition.kind === "extraBall") {
      const newBall = this.ballManager.addBall(ball.x, ball.y);
      newBall.launch();
      this.powerUpSpawner.registerBall(newBall);
      this.centerPaddleEffect.registerBall(newBall);
    } else if (definition.kind === "turbo") {
      ball.applyTurbo();
    } else if (definition.kind === "erratic") {
      this.ballEffects.applyErratic(ball);
    } else if (definition.kind === "invisible") {
      this.ballEffects.applyInvisible(ball);
    } else if (definition.kind === "rain") {
      this.powerUpSpawner.startRain(POWERUP_EFFECT_DURATION);
    } else if (definition.kind === "centerPaddle") {
      this.centerPaddleEffect.activate(POWERUP_EFFECT_DURATION);
    }

    this.powerUpFeedback.playPickup(pickupX, pickupY, definition, targetPaddle);
    playPowerUpPickup();
  }

  showWinner(winner) {
    this.matchOver = true;
    this.powerUpSpawner.stop();
    this.powerUpEffects.clearAll();
    this.ballEffects.clearAll();
    this.centerPaddleEffect.clear();
    this.ballManager.clearAll();

    const label = winner === "p1" ? "Jugador 1" : this.mode === "2p" ? "Jugador 2" : "CPU";

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, `¡Gana ${label}!`, {
        fontSize: "40px",
        color: COLORS.TEXT,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, "ENTER: Volver al menú", {
        fontSize: "20px",
        color: COLORS.TEXT,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.scene.start("MenuScene"));

    this.input.keyboard.once("keydown-ENTER", () => this.scene.start("MenuScene"));
  }
}
