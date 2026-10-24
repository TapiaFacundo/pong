import Phaser from "phaser";
import {
  GAME_HEIGHT,
  PADDLE_OFFSET_X,
  PADDLE_HEIGHT,
  FORWARD_PADDLE_POSITION,
  COLORS,
  KEYS,
  WIN_SCORE_SHORT,
  STORY_WIN_SCORE,
  STORY_RESULT_DELAY,
  PADDLE_POWERUP_KINDS,
  POWERUP_EFFECT_DURATION,
  AI_DIFFICULTIES,
  SLOW_MOTION_DURATION,
  SERVE_DELAY_START,
  SERVE_DELAY_AFTER_POINT,
  ROUND_BALLS_SPACING,
  PADDLE_RECENTER_DURATION,
  BOSS_COLOR,
  BOSS_TEXT_COLOR,
} from "../config.js";
import Paddle from "../entities/Paddle.js";
import PlayerController from "../systems/PlayerController.js";
import AI from "../systems/AI.js";
import ScoreManager from "../systems/ScoreManager.js";
import ScoreBoard from "../systems/ScoreBoard.js";
import PowerUpSpawner from "../systems/PowerUpSpawner.js";
import PowerUpEffects from "../systems/PowerUpEffects.js";
import PowerUpFeedback from "../systems/PowerUpFeedback.js";
import { playPowerUpPickup, playScore, playConcede, playMatchWin, playMatchLose } from "../systems/SoundEffects.js";
import BallManager from "../systems/BallManager.js";
import GameFeel from "../systems/GameFeel.js";
import PaddleFeel from "../systems/PaddleFeel.js";
import BallEffects from "../systems/BallEffects.js";
import CenterPaddleEffect from "../systems/CenterPaddleEffect.js";
import TrickShot from "../systems/TrickShot.js";
import Sabotage from "../systems/Sabotage.js";
import DebugKey from "../systems/DebugKey.js";
import SlowMotionEffect from "../systems/SlowMotionEffect.js";
import ShieldEffect from "../systems/ShieldEffect.js";
import SmallGoalEffect from "../systems/SmallGoalEffect.js";
import CannonEffect from "../systems/CannonEffect.js";
import BossPhases from "../systems/BossPhases.js";
import Field from "../systems/Field.js";
import EffectIndicators from "../systems/EffectIndicators.js";
import { KEYS as TRANSLATION_KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";
import { getLevel } from "../data/levels.js";
import MatchPause from "../systems/MatchPause.js";
import { announce } from "../ui/Announcement.js";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  init(data) {
    // En el Modo Historia la partida sale del nivel: siempre a 7 puntos y
    // con la IA del rival de ese nivel.
    this.level = data.levelId ? getLevel(data.levelId) : null;
    this.mode = this.level ? "story" : data.mode ?? "1p";
    this.winScore = this.level ? STORY_WIN_SCORE : data.winScore ?? WIN_SCORE_SHORT;
    this.difficulty = this.level ? this.level.ai : data.difficulty ?? "normal";
    // En la Batalla, los modificadores elegidos: { field, rules } con la misma
    // forma que un nivel (ver data/mutators.js).
    this.mutators = this.level ? null : data.mutators ?? null;
    this.matchOver = false;
    // Phaser reutiliza la misma instancia de escena entre partidas: los
    // sistemas opcionales de un nivel no pueden quedar de la partida anterior.
    this.trickShot = null;
    this.paddleForward = null;
    this.controllerForward = null;
    this.sabotage = null;
    this.bossPhases = null;
  }

  create() {
    // La cancha del nivel o de los modificadores (si no, la normal de 800 × 600).
    this.field = new Field(this, this.level?.field ?? this.mutators?.field);
    const field = this.field;

    this.drawMidLine();
    this.scoreManager = new ScoreManager(this.winScore);

    // Reglas especiales del nivel del Modo Historia o de los modificadores de
    // la Batalla (vacías en una partida normal).
    const rules = this.level?.rules ?? this.mutators?.rules ?? {};
    this.levelRules = rules;
    this.effectDuration = rules.powerUpDuration ?? POWERUP_EFFECT_DURATION;

    // La velocidad de las palas (también la de la CPU) sigue al alto de la cancha y a los modificadores.
    const paddleOptions = { speedScale: field.paddleSpeedScale * (rules.paddleSpeedScale ?? 1) };
    this.paddleLeft = new Paddle(this, PADDLE_OFFSET_X, field.centerY, paddleOptions);
    this.paddleRight = new Paddle(this, field.width - PADDLE_OFFSET_X, field.centerY, paddleOptions);
    if (rules.paddleHeightScale) {
      this.paddleLeft.setBaseHeight(PADDLE_HEIGHT * rules.paddleHeightScale);
      this.paddleRight.setBaseHeight(PADDLE_HEIGHT * rules.paddleHeightScale);
    }
    if (rules.rivalPaddleHeightScale) {
      this.paddleRight.setBaseHeight(PADDLE_HEIGHT * rules.rivalPaddleHeightScale);
    }

    const ballSettings = {
      baseSpeed: rules.ballSpeed,
      speedIncrement: rules.ballSpeedIncrement,
      sizeScale: rules.ballSizeScale,
    };
    this.ballManager = new BallManager(
      this,
      this.paddleLeft,
      this.paddleRight,
      (side, ball) => this.onBallOut(side, ball),
      ballSettings
    );
    this.ballsPerRound = rules.ballsPerRound ?? 1;
    new GameFeel(this, this.ballManager, { vibrateSides: this.mode === "2p" ? ["p1", "p2"] : ["p1"] });
    new PaddleFeel(this, this.ballManager);

    if (rules.trickShot) this.enableTrickShot(rules.trickShot);

    this.controllerLeft = new PlayerController(this, this.paddleLeft, { up: KEYS.P1_UP, down: KEYS.P1_DOWN }, "p1");

    this.controllerRight =
      this.mode === "2p"
        ? new PlayerController(this, this.paddleRight, { up: KEYS.P2_UP, down: KEYS.P2_DOWN }, "p2")
        : new AI(this.paddleRight, this.ballManager, "right", this.casualAiSettings());

    this.scoreBoard = new ScoreBoard(this, field, this.winScore);

    this.powerUpEffects = new PowerUpEffects(
      this,
      { p1: this.paddleLeft, p2: this.paddleRight },
      { duration: this.effectDuration }
    );
    this.powerUpFeedback = new PowerUpFeedback(this);
    this.effectIndicators = new EffectIndicators(this, field);
    this.ballEffects = new BallEffects(this, { duration: this.effectDuration });
    this.centerPaddleEffect = new CenterPaddleEffect(this, this.ballManager);
    this.slowMotion = new SlowMotionEffect(this, field);
    this.shieldEffect = new ShieldEffect(this, field, this.powerUpFeedback);
    this.smallGoalEffect = new SmallGoalEffect(this, field);
    this.cannonEffect = new CannonEffect(
      this,
      field,
      this.powerUpEffects.paddlesBySide,
      { p1: this.paddleRight, p2: this.paddleLeft },
      this.powerUpFeedback
    );
    this.ballManager.setBallCatcher(this.cannonEffect);

    if (rules.forwardPaddle) this.addForwardPaddle(rules.forwardPaddle);

    if (rules.sabotage) {
      this.sabotage = new Sabotage(this, rules.sabotage, {
        ballManager: this.ballManager,
        feedback: this.powerUpFeedback,
        applyEffect: (kind, side, duration) => this.applyEffectToSide(kind, side, duration),
        playerSide: "p1",
        rivalSide: "p2",
        playerPaddle: this.paddleLeft,
        rivalPaddle: this.paddleRight,
      });
    }

    this.powerUpSpawner = new PowerUpSpawner(
      this,
      this.ballManager,
      (definition, ball) => this.onPowerUpActivated(definition, ball),
      {
        enabled: !rules.powerUpsDisabled,
        spawnDelay: rules.powerUpSpawnDelay,
        colorWeights: rules.powerUpColorWeights,
      }
    );

    if (this.level?.phases) {
      this.bossPhases = new BossPhases(this.level.phases, (phase, number) => this.enterBossPhase(phase, number));
    }

    this.startRound(null, SERVE_DELAY_START);

    // Esc, el ícono de pausa (arriba al centro, entre los marcadores) y los botones táctiles.
    this.matchPause = new MatchPause(this, {
      field,
      touchSides: this.mode === "2p" ? ["p1", "p2"] : ["p1"],
      exitTo: this.level ? "LevelSelectScene" : "MenuScene",
      exitLabelKey: this.level ? TRANSLATION_KEYS.SELECCION_DE_NIVEL : TRANSLATION_KEYS.VOLVER_AL_MENU,
    });

    // Tecla de prueba (solo con npm run dev).
    new DebugKey(this);
  }

  // IA de la Batalla: la dificultad elegida. Con varias pelotas por ronda
  // (modificador), sigue a la que va a llegar antes, como en la Tormenta.
  casualAiSettings() {
    if (this.ballsPerRound <= 1 || typeof this.difficulty !== "string") return this.difficulty;

    return { ...(AI_DIFFICULTIES[this.difficulty] ?? AI_DIFFICULTIES.normal), trackFirstArrival: true };
  }

  // Tiros con efecto del rival (Palinho Jr., y la fase 2 del jefe final).
  enableTrickShot(config) {
    this.trickShot = new TrickShot(this, this.paddleRight, "p2", config);
    this.ballManager.setShotModifier(this.trickShot);
  }

  // Fase nueva del jefe final: puede cambiar su IA y sumarle habilidades
  // (tiro con efecto, pala adelantada). Se anuncia en el centro de la pantalla.
  enterBossPhase(phase, number) {
    if (phase.ai) this.controllerRight.setDifficulty(phase.ai);
    if (phase.rules?.trickShot && !this.trickShot) this.enableTrickShot(phase.rules.trickShot);
    if (phase.rules?.forwardPaddle && !this.paddleForward) this.addForwardPaddle(phase.rules.forwardPaddle);

    this.announce(getPhrase(TRANSLATION_KEYS.FASE_N).replace("{n}", number));
    this.powerUpFeedback.flashPaddle(this.paddleRight, BOSS_COLOR);
    this.events.emit("bossPhase");
  }

  // Anuncio grande (fase del jefe, partido largo), en el color de los jefes.
  announce(message) {
    announce(this, this.field, message, BOSS_TEXT_COLOR);
  }

  // Segunda pala del rival, a mitad de su lado (Los Gemelos), con su propio
  // alto e IA ({ heightScale, ai }). Los power-ups de pala del rival la afectan también.
  addForwardPaddle({ heightScale, ai }) {
    this.paddleForward = new Paddle(this, this.field.width * FORWARD_PADDLE_POSITION, this.field.centerY, {
      speedScale: this.field.paddleSpeedScale,
    });
    this.paddleForward.setBaseHeight(PADDLE_HEIGHT * heightScale);
    this.ballManager.addPaddle(this.paddleForward, "p2", -1);
    this.powerUpEffects.addPaddle("p2", this.paddleForward);
    this.controllerForward = new AI(this.paddleForward, this.ballManager, "right", ai);
  }

  update(time, delta) {
    if (this.matchOver) return;

    this.effectIndicators.update();
    this.controllerLeft.update(delta);
    this.controllerRight.update(delta);
    this.controllerForward?.update(delta);
    // Los efectos de movimiento de las pelotas (zigzag, curva) van al ritmo de
    // la física: en cámara lenta también se frenan.
    this.ballManager.update(delta / this.physics.world.timeScale);
    this.trickShot?.update(this.ballManager.balls);
    this.sabotage?.update(delta);
    // Primero las paredes del arco chico: si la pelota pega en una, el escudo no se gasta.
    this.cannonEffect.update(delta);
    this.smallGoalEffect.update(this.ballManager.balls);
    this.shieldEffect.update(this.ballManager.balls);
  }

  drawMidLine() {
    const graphics = this.add.graphics();
    graphics.lineStyle(4, COLORS.MID_LINE, 1);

    const dashHeight = 16;
    const gap = 12;
    for (let y = 0; y < this.field.height; y += dashHeight + gap) {
      graphics.lineBetween(this.field.centerX, y, this.field.centerX, y + dashHeight);
    }
  }

  onBallOut(exitSide, ball) {
    // Sus efectos (gigante, invisible...) se terminan con ella, aunque queden otras pelotas.
    this.ballEffects.clearBall(ball);

    const scoringSide = exitSide === "left" ? "p2" : "p1";
    this.lastScoringSide = scoringSide;

    const matchEnded = this.awardPoint(scoringSide);
    if (matchEnded || this.ballManager.count > 0) return;

    this.resetRound(this.lastScoringSide);
  }

  // Suma el punto, actualiza el marcador y las fases del jefe, y termina el
  // partido si alguien llegó al puntaje. Devuelve true si el partido terminó.
  awardPoint(scoringSide) {
    this.scoreManager.addPoint(scoringSide);
    this.scoreBoard.update({ p1: this.scoreManager.scoreP1, p2: this.scoreManager.scoreP2 });
    this.updateDoublePointIndicator();
    // Contra la CPU, el punto del rival suena distinto (para abajo).
    if (scoringSide === "p2" && this.mode !== "2p") playConcede();
    else playScore();

    // "Gana quien llegue primero": el partido termina apenas se alcanza el
    // puntaje objetivo, aunque queden otras pelotas en cancha por salir.
    const winner = this.scoreManager.checkWinner();
    if (winner) {
      this.showWinner(winner);
      return true;
    }

    this.bossPhases?.update(this.scoreManager.scoreP1);
    return false;
  }

  // Bola extra por partido largo (jefe final): con más de cierta cantidad de
  // puntos sumados entre los dos, cada ronda arranca con 2 pelotas.
  checkLongMatch() {
    const threshold = this.levelRules.extraBallAfterTotalScore;
    if (threshold == null || this.ballsPerRound >= 2) return;

    if (this.scoreManager.scoreP1 + this.scoreManager.scoreP2 > threshold) {
      this.ballsPerRound = 2;
      this.announce(getPhrase(TRANSLATION_KEYS.PARTIDO_LARGO_DOS_PELOTAS_POR_RONDA));
    }
  }

  resetRound(scoringSide) {
    this.powerUpSpawner.clearAll();
    this.powerUpEffects.clearAll();
    this.ballEffects.clearAll();
    this.centerPaddleEffect.clear();
    this.slowMotion.clear();
    this.shieldEffect.clearAll();
    this.smallGoalEffect.clearAll();
    this.cannonEffect.clearAll();

    this.paddleLeft.recenter(PADDLE_RECENTER_DURATION);
    this.paddleRight.recenter(PADDLE_RECENTER_DURATION);
    this.paddleForward?.recenter(PADDLE_RECENTER_DURATION);

    this.checkLongMatch();

    const directionTowardsLoser = scoringSide === "p1" ? 1 : -1;
    this.startRound(directionTowardsLoser, SERVE_DELAY_AFTER_POINT);
  }

  // Pone las pelotas de la ronda en el centro y las saca después de "delay".
  // Con una sola pelota sale hacia firstDirection (o a un lado al azar). Con
  // varias (Tormenta), se reparten una hacia cada jugador, un poco separadas
  // en altura: la primera hacia firstDirection.
  startRound(firstDirection, delay) {
    const direction = firstDirection ?? (Math.random() < 0.5 ? -1 : 1);
    const balls = [];

    for (let i = 0; i < this.ballsPerRound; i++) {
      const offsetY = (i - (this.ballsPerRound - 1) / 2) * ROUND_BALLS_SPACING;
      balls.push({
        ball: this.ballManager.addBall(this.field.centerX, this.field.centerY + offsetY),
        directionX: i % 2 === 0 ? direction : -direction,
      });
    }

    this.serveAfter(delay, balls);
  }

  // Saca las pelotas después de "delay" y recién ahí arranca el spawn de power-ups.
  // Mientras esperan, GameFeel muestra que están por salir y hacia dónde.
  serveAfter(delay, balls) {
    balls.forEach(({ ball, directionX }) => this.events.emit("serveWait", { ball, directionX }));
    this.time.delayedCall(delay, () => {
      balls.forEach(({ ball, directionX }) => {
        ball.launch(directionX);
        this.events.emit("serve", { ball });
      });
      this.powerUpSpawner.startTimer();
    });
  }

  // Aplica un efecto directamente a un lado, sin pasar por un power-up (lo usa
  // el Saboteador). Los de pala duran `duration`; el cañón y el punto doble,
  // lo mismo que como power-up.
  applyEffectToSide(kind, side, duration) {
    if (kind === "cannon") {
      this.effectIndicators.track(side, kind, this.cannonEffect.arm(side, this.effectDuration));
    } else if (kind === "doublePoint") {
      this.scoreManager.setDoublePoint(side);
      this.updateDoublePointIndicator();
    } else {
      this.effectIndicators.track(side, kind, this.powerUpEffects.applyToSide(side, kind, duration));
    }
  }

  // El punto doble no tiene tiempo: su ícono se ve completo hasta el próximo punto.
  updateDoublePointIndicator() {
    const side = this.scoreManager.doublePointSide;

    this.effectIndicators.hide("p1", "doublePoint");
    this.effectIndicators.hide("p2", "doublePoint");
    if (side) this.effectIndicators.showUntimed(side, "doublePoint");
  }

  paddleForSide(side) {
    return side === "p1" ? this.paddleLeft : this.paddleRight;
  }

  // Cañón, arco chico y escudo: se aplican a un lado. Devuelven su temporizador.
  applyGoalSideEffect(kind, side) {
    if (kind === "cannon") return this.cannonEffect.arm(side, this.effectDuration);
    if (kind === "smallGoal") return this.smallGoalEffect.activate(side, this.effectDuration);
    return this.shieldEffect.activate(side, this.effectDuration);
  }

  // Amarillos con duración (afectan a los dos). Devuelven su temporizador.
  applyNeutralEffect(kind, ball) {
    switch (kind) {
      case "zigzag":
      case "curve":
        return this.ballEffects.applyMotion(ball, kind);
      case "slowMotion":
        // Más corta que el resto porque frena todo; sigue la proporción si cambia la duración.
        return this.slowMotion.activate((SLOW_MOTION_DURATION * this.effectDuration) / POWERUP_EFFECT_DURATION);
      case "giant":
        return this.ballEffects.applyGiant(ball);
      case "invisible":
        return this.ballEffects.applyInvisible(ball);
      case "rain":
        return this.powerUpSpawner.startRain(this.effectDuration);
      case "centerPaddle":
        return this.centerPaddleEffect.activate(this.effectDuration);
      default:
        return null;
    }
  }

  onPowerUpActivated(definition, ball) {
    const attackerSide = ball.lastTouchedBy;
    const pickupX = ball.x;
    const pickupY = ball.y;
    let targetPaddle = null;

    if (PADDLE_POWERUP_KINDS.includes(definition.kind)) {
      const applied = this.powerUpEffects.applyPaddleEffect(definition.kind, definition.colorCategory, attackerSide);
      if (applied) {
        this.effectIndicators.track(applied.side, definition.kind, applied.timer);
        targetPaddle = this.paddleForSide(applied.side);
      }
    } else if (["cannon", "smallGoal", "shield"].includes(definition.kind)) {
      const targetSide = this.powerUpEffects.resolveTarget(definition.kind, definition.colorCategory, attackerSide);
      if (targetSide) {
        this.effectIndicators.track(targetSide, definition.kind, this.applyGoalSideEffect(definition.kind, targetSide));
        targetPaddle = this.paddleForSide(targetSide);
      }
    } else if (definition.kind === "doublePoint") {
      const targetSide = this.powerUpEffects.resolveTarget(definition.kind, definition.colorCategory, attackerSide);
      if (targetSide) {
        this.scoreManager.setDoublePoint(targetSide);
        this.updateDoublePointIndicator();
      }
    } else if (definition.kind === "extraBall") {
      // La pelota nueva sale en sentido contrario a la que agarró el power-up
      // (hacia quien la mandó): así cada jugador tiene una pelota para
      // defender, en vez de que las dos vayan contra el mismo.
      const newBall = this.ballManager.addBall(ball.x, ball.y);
      newBall.launch(-Math.sign(ball.velocityX) || null);
      this.powerUpSpawner.registerBall(newBall);
      this.centerPaddleEffect.registerBall(newBall);
    } else if (definition.kind === "turbo") {
      ball.applyTurbo();
    } else {
      // Amarillos con duración: su ícono va en el centro, debajo del marcador.
      this.effectIndicators.track(null, definition.kind, this.applyNeutralEffect(definition.kind, ball));
    }

    this.powerUpFeedback.playPickup(pickupX, pickupY, definition, targetPaddle);
    playPowerUpPickup();
  }

  showWinner(winner) {
    this.matchOver = true;
    this.matchPause.finish();
    this.powerUpSpawner.stop();
    this.powerUpEffects.clearAll();
    this.ballEffects.clearAll();
    this.centerPaddleEffect.clear();
    this.slowMotion.clear();
    this.shieldEffect.clearAll();
    this.smallGoalEffect.clearAll();
    this.cannonEffect.clearAll();
    this.ballManager.clearAll();
    this.effectIndicators.clearAll();
    this.trickShot?.clear();

    // Ganó una persona (el jugador 1, o cualquiera de los dos con 2 jugadores) o la CPU.
    const humanWon = winner === "p1" || this.mode === "2p";
    if (humanWon) playMatchWin();
    else playMatchLose();

    if (this.level) {
      this.finishStoryLevel(winner);
    } else {
      this.showCasualWinner(winner, humanWon);
    }
  }

  // En el Modo Historia, el resultado (y el guardado del progreso) lo maneja
  // LevelResultScene; acá solo se deja ver el marcador final un momento.
  finishStoryLevel(winner) {
    this.time.delayedCall(STORY_RESULT_DELAY, () => {
      this.scene.start("LevelResultScene", {
        levelId: this.level.id,
        won: winner === "p1",
        scoreP1: this.scoreManager.scoreP1,
        scoreP2: this.scoreManager.scoreP2,
      });
    });
  }

  // El resultado se muestra en su propia escena, encima de la cancha (BattleResultScene).
  // celebrate: festeja con papelitos (si no ganó la CPU).
  showCasualWinner(winner, celebrate) {
    const label =
      winner === "p1"
        ? getPhrase(TRANSLATION_KEYS.JUGADOR_1)
        : this.mode === "2p"
          ? getPhrase(TRANSLATION_KEYS.JUGADOR_2)
          : getPhrase(TRANSLATION_KEYS.CPU);

    this.scene.launch("BattleResultScene", { winnerLabel: label, celebrate });
  }
}
