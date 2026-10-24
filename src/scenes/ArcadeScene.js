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
  ARCADE_DANGER_X,
  ARCADE_DANGER_COLOR,
  ARCADE_EXTRA_LIFE_EVERY,
  POWERUP_TEXT_COLORS,
  GAME_HEIGHT,
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
import EffectIndicators from "../systems/EffectIndicators.js";
import CapsuleDrops from "../systems/CapsuleDrops.js";
import ArcadePowerUps from "../systems/ArcadePowerUps.js";
import MatchPause from "../systems/MatchPause.js";
import DebugKey from "../systems/DebugKey.js";
import {
  playConcede,
  playWallAdvance,
  playPowerUpPickup,
  playMatchWin,
  playMatchLose,
} from "../systems/SoundEffects.js";
import GameFeel from "../systems/GameFeel.js";
import ArcadeFeel from "../systems/ArcadeFeel.js";
import PaddleFeel from "../systems/PaddleFeel.js";
import { announce } from "../ui/Announcement.js";

// Arcade: romper ladrillos, para 1 jugador. La pala va a la izquierda, como
// en Pong, y el muro de ladrillos a la derecha (la pelota rebota en el borde
// derecho). Si se te pasan todas las pelotas perdés una vida; al romper todo
// el muro pasás al nivel siguiente, más difícil (ver data/arcade.js). Desde
// el nivel 3 el muro avanza hacia vos: si un ladrillo cruza la línea de
// peligro, o te quedás sin vidas, fin del juego. Los ladrillos rotos pueden
// soltar cápsulas con power-ups que se agarran con la pala (ArcadePowerUps).
export default class ArcadeScene extends Phaser.Scene {
  constructor() {
    super("ArcadeScene");
  }

  // Phaser reutiliza la escena al reintentar: el estado de la partida se arma de nuevo.
  init() {
    this.matchOver = false;
    this.heldBall = null;
    this.clearingLevel = false;
    this.advanceTimer = null;
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
    new GameFeel(this, this.ballManager, { goalFlashColor: ARCADE_DANGER_COLOR, vibrateSides: ["p1"] });
    new PaddleFeel(this, this.ballManager);
    this.feedback = new PowerUpFeedback(this);
    this.wall = new BrickWall(this, this.field, {
      onBrickHit: (brick, broken) => this.onBrickHit(brick, broken),
      onBallHit: (ball, brick, options) => this.powerUps.onBallHitBrick(ball, brick, options),
      isPiercing: () => this.powerUps.isFireActive,
    });
    this.hud = new ArcadeHud(this);
    this.dangerLine = this.drawDangerLine();
    new ArcadeFeel(this, { wall: this.wall, dangerLine: this.dangerLine });

    this.indicators = new EffectIndicators(this, this.field);
    this.drops = new CapsuleDrops(this, this.paddle, {
      onCatch: (definition, capsule) => this.onCapsuleCaught(definition, capsule),
    });
    this.powerUps = new ArcadePowerUps(this, {
      field: this.field,
      paddle: this.paddle,
      ballManager: this.ballManager,
      wall: this.wall,
      feedback: this.feedback,
      indicators: this.indicators,
      drops: this.drops,
      run: this.run,
      launchExtraBall: () => this.launchExtraBall(),
      refreshHud: () => this.hud.update(this.run),
    });

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

  // Línea punteada roja tenue: si un ladrillo rompible la cruza, fin del juego.
  // Se ve solo en los niveles en los que el muro avanza (y late cuando el muro se acerca: ArcadeFeel).
  drawDangerLine() {
    const graphics = this.add.graphics().setAlpha(0.4).lineStyle(2, ARCADE_DANGER_COLOR);
    for (let y = ARCADE_PLAY_TOP; y < GAME_HEIGHT; y += 20) {
      graphics.lineBetween(ARCADE_DANGER_X, y, ARCADE_DANGER_X, y + 10);
    }
    return graphics.setVisible(false);
  }

  startLevel(level) {
    this.run.level = level;
    const levelData = getArcadeLevel(level);
    this.ballManager.ballSettings.baseSpeed = levelData.ballSpeed;
    this.wall.build(levelData);
    this.hud.update(this.run);

    this.advanceTimer?.remove();
    this.advanceTimer = levelData.advanceInterval
      ? this.time.addEvent({ delay: levelData.advanceInterval, loop: true, callback: () => this.advanceWall() })
      : null;
    this.dangerLine.setVisible(!!levelData.advanceInterval);

    announce(this, this.field, getPhrase(KEYS.NIVEL_N_ANUNCIO).replace("{n}", level), COLORS.TEXT);
    this.serve();
  }

  advanceWall() {
    if (this.matchOver) return;

    this.wall.advance();
    playWallAdvance();
    this.events.emit("wallAdvance");
    if (this.wall.frontX <= ARCADE_DANGER_X) this.gameOver();
  }

  // Bola extra: una pelota nueva sale de la pala hacia el muro, sin esperar.
  launchExtraBall() {
    const ball = this.ballManager.addBall(this.paddle.x + ARCADE_SERVE_OFFSET_X, this.paddle.y);
    this.wall.registerBall(ball);
    ball.launch(1);
  }

  onCapsuleCaught(definition, capsule) {
    this.powerUps.activate(definition.kind);
    this.feedback.playPickup(capsule.x, capsule.y, definition, this.paddle);
    playPowerUpPickup();
    this.events.emit("capsuleCaught", { paddle: this.paddle, colorCategory: definition.colorCategory });
  }

  // Al perder una vida o pasar de nivel: sin efectos ni cápsulas en camino.
  clearPowerUps() {
    this.powerUps.clearAll();
    this.drops.clearAll();
  }

  // Una pelota nueva espera pegada a la pala (se mueve con ella) y después sale hacia el muro.
  serve() {
    const ball = this.ballManager.addBall(this.paddle.x + ARCADE_SERVE_OFFSET_X, this.paddle.y);
    this.wall.registerBall(ball);
    this.heldBall = ball;
    this.events.emit("serveWait", { ball, directionX: 1 });

    this.time.delayedCall(ARCADE_SERVE_DELAY, () => {
      if (this.heldBall !== ball) return;
      this.heldBall = null;
      ball.launch(1);
      this.events.emit("serve", { ball });
    });
  }

  update(time, delta) {
    if (this.matchOver) return;

    this.indicators.update();
    this.controller.update(delta);
    this.heldBall?.circle.body.reset(this.paddle.x + ARCADE_SERVE_OFFSET_X, this.paddle.y);
    this.ballManager.update(delta);
    // Las cápsulas van al ritmo de la física: en cámara lenta también se frenan.
    this.drops.update(delta / this.physics.world.timeScale);
    this.powerUps.update(delta, this.ballManager.balls);
  }

  // El sonido y los efectos de cada golpe los pone ArcadeFeel (evento "brickHit").
  onBrickHit(brick, broken) {
    if (brick.isMetal || !broken) {
      this.events.emit("brickHit", { brick, broken, points: 0 });
      return;
    }

    // Los resistentes valen más: 10 por cada golpe que aguantaban.
    const scoreBefore = this.run.score;
    this.feedback.spawnBurst(brick.x, brick.y, brick.color);
    this.run.addPoints(ARCADE_BRICK_POINTS * brick.maxHits);
    this.events.emit("brickHit", { brick, broken, points: this.run.score - scoreBefore });
    this.drops.maybeDrop(brick.x, brick.y);
    this.hud.update(this.run);

    // El choque se está calculando: el muro nuevo se arma en el próximo frame.
    if (this.wall.remaining === 0 && !this.clearingLevel) {
      this.clearingLevel = true;
      this.time.delayedCall(0, () => this.clearLevel());
    }
  }

  // Al completar un nivel: bonus, y cada ARCADE_EXTRA_LIFE_EVERY niveles una vida extra.
  clearLevel() {
    this.clearingLevel = false;
    const completedLevel = this.run.level;
    this.events.emit("levelCleared");
    this.run.addPoints(ARCADE_LEVEL_BONUS * completedLevel);
    this.clearPowerUps();
    this.ballManager.clearAll();
    this.heldBall = null;
    this.startLevel(completedLevel + 1);

    if (completedLevel % ARCADE_EXTRA_LIFE_EVERY === 0) {
      this.run.gainLife();
      this.hud.update(this.run);
      announce(this, this.field, getPhrase(KEYS.VIDA_EXTRA_ANUNCIO), POWERUP_TEXT_COLORS.green, 56);
    }
  }

  // Se pierde una vida cuando ya no queda ninguna pelota en juego.
  onBallOut(ball) {
    this.wall.unregisterBall(ball);
    this.powerUps.onBallLost(ball);
    if (this.ballManager.count > 0) return;

    playConcede();
    this.clearPowerUps();
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
    this.advanceTimer?.remove();
    this.clearPowerUps();

    const { record, isNew } = submitArcadeScore(this.run.score, this.run.level);
    // Con récord nuevo, fin del juego suena a festejo (y en el resultado caen papelitos).
    if (isNew) playMatchWin();
    else playMatchLose();
    this.scene.launch("ArcadeResultScene", { score: this.run.score, level: this.run.level, record, isNew });
  }
}
