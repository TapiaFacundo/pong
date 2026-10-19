import Phaser from "phaser";
import {
  PADDLE_OFFSET_X,
  KEYS as CONTROL_KEYS,
  COLORS,
  ARCADE_BRICK_POINTS,
  ARCADE_LEVEL_BONUS,
  ARCADE_SERVE_DELAY,
  ARCADE_SERVE_OFFSET_X,
  ARCADE_PLAY_TOP,
} from "../config.js";
import { KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";
import { getArcadeLevel } from "../data/arcade.js";
import { submitArcadeScore } from "../services/ArcadeStorage.js";
import Paddle from "../entities/Paddle.js";
import Field from "../systems/Field.js";
import PlayerController from "../systems/PlayerController.js";
import BallManager from "../systems/BallManager.js";
import BrickWall from "../systems/BrickWall.js";
import ArcadeRun from "../systems/ArcadeRun.js";
import ArcadeHud from "../systems/ArcadeHud.js";
import PowerUpFeedback from "../systems/PowerUpFeedback.js";
import MatchPause from "../systems/MatchPause.js";
import DebugKey from "../systems/DebugKey.js";
import { playBrickHit, playScore } from "../systems/SoundEffects.js";
import { announce } from "../ui/Announcement.js";

// Arcade: romper ladrillos, para 1 jugador. La pala va a la izquierda, como
// en Pong, y el muro de ladrillos a la derecha (la pelota rebota en el borde
// derecho). Si se te pasan todas las pelotas perdés una vida; al romper todo
// el muro pasás al nivel siguiente, más difícil. Sin vidas, fin del juego.
export default class ArcadeScene extends Phaser.Scene {
  constructor() {
    super("ArcadeScene");
  }

  // Phaser reutiliza la escena al reintentar: el estado de la partida se arma de nuevo.
  init() {
    this.matchOver = false;
    this.heldBall = null;
    this.clearingLevel = false;
  }

  create() {
    this.field = new Field(this, { rightWall: true, playTop: ARCADE_PLAY_TOP });
    this.run = new ArcadeRun();

    this.paddle = new Paddle(this, PADDLE_OFFSET_X, this.physics.world.bounds.centerY);
    // Juega uno solo: W / S y también las flechas.
    this.controller = new PlayerController(
      this,
      this.paddle,
      { up: [CONTROL_KEYS.P1_UP, CONTROL_KEYS.P2_UP], down: [CONTROL_KEYS.P1_DOWN, CONTROL_KEYS.P2_DOWN] },
      "p1"
    );
    this.ballManager = new BallManager(this, this.paddle, null, (_side, ball) => this.onBallOut(ball));
    this.feedback = new PowerUpFeedback(this);
    this.wall = new BrickWall(this, this.field, { onBrickHit: (brick, broken) => this.onBrickHit(brick, broken) });
    this.hud = new ArcadeHud(this);

    this.matchPause = new MatchPause(this, {
      field: this.field,
      touchSides: ["p1"],
      exitTo: "MenuScene",
      exitData: { mode: "arcade" },
      exitLabelKey: KEYS.VOLVER_AL_MENU,
    });

    this.startLevel(1);

    // Tecla de prueba (solo con npm run dev).
    new DebugKey(this);
  }

  startLevel(level) {
    this.run.level = level;
    const levelData = getArcadeLevel(level);
    this.ballManager.ballSettings.baseSpeed = levelData.ballSpeed;
    this.wall.build(levelData);
    this.hud.update(this.run);

    announce(this, this.field, getPhrase(KEYS.NIVEL_N_ANUNCIO).replace("{n}", level), COLORS.TEXT);
    this.serve();
  }

  // Una pelota nueva espera pegada a la pala (se mueve con ella) y después sale hacia el muro.
  serve() {
    const ball = this.ballManager.addBall(this.paddle.x + ARCADE_SERVE_OFFSET_X, this.paddle.y);
    this.wall.registerBall(ball);
    this.heldBall = ball;

    this.time.delayedCall(ARCADE_SERVE_DELAY, () => {
      if (this.heldBall !== ball) return;
      this.heldBall = null;
      ball.launch(1);
    });
  }

  update(time, delta) {
    if (this.matchOver) return;

    this.controller.update(delta);
    this.heldBall?.circle.body.reset(this.paddle.x + ARCADE_SERVE_OFFSET_X, this.paddle.y);
    this.ballManager.update(delta);
  }

  onBrickHit(brick, broken) {
    playBrickHit(broken);
    if (!broken) return;

    this.feedback.spawnBurst(brick.x, brick.y, brick.color);
    this.run.addPoints(ARCADE_BRICK_POINTS);
    this.hud.update(this.run);

    // El choque se está calculando: el muro nuevo se arma en el próximo frame.
    if (this.wall.remaining === 0 && !this.clearingLevel) {
      this.clearingLevel = true;
      this.time.delayedCall(0, () => this.clearLevel());
    }
  }

  clearLevel() {
    this.clearingLevel = false;
    this.run.addPoints(ARCADE_LEVEL_BONUS * this.run.level);
    this.ballManager.clearAll();
    this.heldBall = null;
    this.startLevel(this.run.level + 1);
  }

  // Se pierde una vida cuando ya no queda ninguna pelota en juego.
  onBallOut(ball) {
    this.wall.unregisterBall(ball);
    if (this.ballManager.count > 0) return;

    playScore();
    this.run.loseLife();
    this.hud.update(this.run);

    if (this.run.isOver) {
      this.gameOver();
    } else {
      this.serve();
    }
  }

  gameOver() {
    this.matchOver = true;
    this.matchPause.finish();

    const { record, isNew } = submitArcadeScore(this.run.score, this.run.level);
    this.scene.launch("ArcadeResultScene", { score: this.run.score, level: this.run.level, record, isNew });
  }
}
