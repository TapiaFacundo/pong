import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT, PADDLE_OFFSET_X, COLORS, KEYS, WIN_SCORE_SHORT, PADDLE_POWERUP_KINDS } from "../config.js";
import Paddle from "../entities/Paddle.js";
import PlayerController from "../systems/PlayerController.js";
import AI from "../systems/AI.js";
import ScoreManager from "../systems/ScoreManager.js";
import PowerUpSpawner from "../systems/PowerUpSpawner.js";
import PowerUpEffects from "../systems/PowerUpEffects.js";
import PowerUpFeedback from "../systems/PowerUpFeedback.js";
import { playPowerUpPickup } from "../systems/SoundEffects.js";
import BallManager from "../systems/BallManager.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  init(data) {
    this.mode = data.mode ?? "1p";
    this.winScore = data.winScore ?? WIN_SCORE_SHORT;
    this.matchOver = false;
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
        : new AI(this.paddleRight, this.ballManager, "right");

    this.scoreTextLeft = this.add
      .text(GAME_WIDTH / 2 - 60, 30, "0", { fontSize: "48px", color: COLORS.TEXT })
      .setOrigin(0.5);
    this.scoreTextRight = this.add
      .text(GAME_WIDTH / 2 + 60, 30, "0", { fontSize: "48px", color: COLORS.TEXT })
      .setOrigin(0.5);

    this.powerUpEffects = new PowerUpEffects(this, { p1: this.paddleLeft, p2: this.paddleRight });
    this.powerUpFeedback = new PowerUpFeedback(this);

    this.powerUpSpawner = new PowerUpSpawner(this, this.ballManager, (definition, ball) =>
      this.onPowerUpActivated(definition, ball)
    );

    this.time.delayedCall(600, () => this.ballManager.primary.launch());
  }

  update() {
    if (this.matchOver) return;

    this.controllerLeft.update();
    this.controllerRight.update();
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

    if (this.ballManager.count > 0) return;

    const winner = this.scoreManager.checkWinner();
    if (winner) {
      this.showWinner(winner);
    } else {
      this.resetRound(this.lastScoringSide);
    }
  }

  resetRound(scoringSide) {
    this.powerUpSpawner.clearAll();
    this.powerUpEffects.clearAll();

    const directionTowardsLoser = scoringSide === "p1" ? 1 : -1;
    const ball = this.ballManager.addBall(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    this.time.delayedCall(600, () => ball.launch(directionTowardsLoser));
  }

  onPowerUpActivated(definition, ball) {
    const attackerSide = ball.lastTouchedBy;
    const pickupX = ball.x;
    const pickupY = ball.y;
    let targetPaddle = null;

    if (PADDLE_POWERUP_KINDS.includes(definition.kind)) {
      targetPaddle = this.powerUpEffects.applyPaddleEffect(definition.kind, definition.colorCategory, attackerSide);
    } else if (definition.kind === "extraBall") {
      const newBall = this.ballManager.addBall(ball.x, ball.y);
      newBall.launch();
      this.powerUpSpawner.registerBall(newBall);
    } else if (definition.kind === "turbo") {
      ball.applyTurbo();
    }

    this.powerUpFeedback.playPickup(pickupX, pickupY, definition, targetPaddle);
    playPowerUpPickup();
  }

  showWinner(winner) {
    this.matchOver = true;
    this.powerUpSpawner.stop();
    this.powerUpEffects.clearAll();
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
      .setOrigin(0.5);

    this.input.keyboard.once("keydown-ENTER", () => this.scene.start("MenuScene"));
  }
}
