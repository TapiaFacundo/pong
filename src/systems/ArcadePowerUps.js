import {
  POWERUP_EFFECT_DURATION,
  SLOW_MOTION_DURATION,
  COLORS,
  ARCADE_FIRE_DURATION,
  ARCADE_FIRE_COLOR,
  ARCADE_LASER_DURATION,
  ARCADE_EXPLOSIVE_CHARGES,
  ARCADE_EXPLOSION_COLOR,
} from "../config.js";
import { playExplosion } from "./SoundEffects.js";
import ArcadeLaser from "./ArcadeLaser.js";
import PowerUpEffects from "./PowerUpEffects.js";
import BallEffects from "./BallEffects.js";
import ShieldEffect from "./ShieldEffect.js";
import SmallGoalEffect from "./SmallGoalEffect.js";
import CannonEffect from "./CannonEffect.js";
import SlowMotionEffect from "./SlowMotionEffect.js";

const SIDE = "p1";
const INDICATOR_COLOR = "green";

// Power-ups del Arcade (los que llegan en las cápsulas). Todos ayudan al
// jugador y reutilizan los efectos de la Batalla sobre su lado:
// - Pala grande / rápida, escudo, arco chico: igual que en la Batalla.
// - Cañón: la pala agarra la pelota y se apunta, pero el disparo sale a la
//   misma velocidad (no más rápido).
// - Bola extra: sale una pelota nueva desde la pala hacia el muro.
// - Pelota gigante: agranda todas las pelotas en juego.
// - Cámara lenta: igual que en la Batalla.
// - Puntos ×2 (el punto doble): los puntos valen el doble durante un rato.
// - Lluvia de power-ups: los ladrillos sueltan cápsulas más seguido un rato.
// Propios del Arcade:
// - Pelota de fuego: las pelotas atraviesan los ladrillos (no el metal)
//   rompiéndolos enteros, y se ven naranjas.
// - Láser: la pala dispara sola (ver ArcadeLaser).
// - Vida extra: una vida más.
// - Pelota explosiva: los próximos ladrillos que toca una pelota explotan y
//   rompen a sus vecinos (el indicador se vacía de a una carga).
// Cada efecto con duración se muestra en los indicadores (arriba a la izquierda).
//
// deps: { field, paddle, ballManager, wall, feedback, indicators, drops, run,
//         launchExtraBall, refreshHud }
export default class ArcadePowerUps {
  constructor(scene, deps) {
    this.scene = scene;
    Object.assign(this, deps);

    this.paddleEffects = new PowerUpEffects(scene, { p1: deps.paddle });
    this.ballEffects = new BallEffects(scene);
    this.shield = new ShieldEffect(scene, deps.field, deps.feedback);
    this.smallGoal = new SmallGoalEffect(scene, deps.field);
    this.cannon = new CannonEffect(scene, deps.field, this.paddleEffects.paddlesBySide, {}, deps.feedback, {
      powerShot: false,
    });
    deps.ballManager.setBallCatcher(this.cannon);
    this.slowMotion = new SlowMotionEffect(scene, deps.field);
    this.laser = new ArcadeLaser(scene, deps.paddle, deps.wall);
    this.doublePointsTimer = null;
    this.fireTimer = null;
    this.explosiveCharges = null;
  }

  get isFireActive() {
    return this.fireTimer !== null;
  }

  activate(kind) {
    const timer = this.applyEffect(kind);
    this.indicators.track(SIDE, kind, timer, INDICATOR_COLOR);
  }

  // Aplica el efecto y devuelve su temporizador (null si es instantáneo).
  applyEffect(kind) {
    switch (kind) {
      case "grow":
      case "speedUp":
        return this.paddleEffects.applyToSide(SIDE, kind, POWERUP_EFFECT_DURATION);
      case "shield":
        return this.shield.activate(SIDE, POWERUP_EFFECT_DURATION);
      case "smallGoal":
        return this.smallGoal.activate(SIDE, POWERUP_EFFECT_DURATION);
      case "cannon":
        return this.cannon.arm(SIDE, POWERUP_EFFECT_DURATION);
      case "extraBall":
        this.launchExtraBall();
        return null;
      case "giant":
        return this.applyGiant();
      case "slowMotion":
        return this.slowMotion.activate(SLOW_MOTION_DURATION);
      case "doublePoint":
        return this.startDoublePoints();
      case "rain":
        return this.drops.startRain(POWERUP_EFFECT_DURATION);
      case "fireBall":
        return this.startFire();
      case "laser":
        return this.laser.start(ARCADE_LASER_DURATION);
      case "extraLife":
        this.run.gainLife();
        this.refreshHud();
        return null;
      case "explosive":
        return this.loadExplosiveCharges();
      default:
        return null;
    }
  }

  startFire() {
    this.fireTimer?.remove();
    this.fireTimer = this.scene.time.delayedCall(ARCADE_FIRE_DURATION, () => (this.fireTimer = null));
    return this.fireTimer;
  }

  // Las cargas se muestran en el indicador como si fueran tiempo: se vacía de
  // a un tercio con cada ladrillo que explota (mismo formato que un temporizador).
  loadExplosiveCharges() {
    this.explosiveCharges = {
      delay: ARCADE_EXPLOSIVE_CHARGES,
      remaining: ARCADE_EXPLOSIVE_CHARGES,
      getRemaining() {
        return this.remaining;
      },
    };
    return this.explosiveCharges;
  }

  // Qué le hace una pelota a un ladrillo (lo llama el muro en cada choque).
  // piercing: la pelota de fuego lo está atravesando.
  onBallHitBrick(ball, brick, { piercing }) {
    if (!brick.isMetal && this.explosiveCharges?.remaining > 0) {
      this.explosiveCharges.remaining -= 1;
      this.feedback.spawnBurst(brick.x, brick.y, ARCADE_EXPLOSION_COLOR);
      playExplosion();
      this.wall.explode(brick);
    } else if (piercing) {
      this.wall.smash(brick);
    } else {
      this.wall.damage(brick);
    }
  }

  // Todas las pelotas en juego crecen; el indicador sigue al último temporizador.
  applyGiant() {
    let timer = null;
    this.ballManager.balls.forEach((ball) => (timer = this.ballEffects.applyGiant(ball)));
    return timer;
  }

  startDoublePoints() {
    this.doublePointsTimer?.remove();
    this.run.pointsMultiplier = 2;
    this.doublePointsTimer = this.scene.time.delayedCall(POWERUP_EFFECT_DURATION, () => this.stopDoublePoints());
    return this.doublePointsTimer;
  }

  stopDoublePoints() {
    this.doublePointsTimer?.remove();
    this.doublePointsTimer = null;
    this.run.pointsMultiplier = 1;
  }

  update(delta, balls) {
    this.cannon.update(delta);
    this.laser.update();
    // Con la pelota de fuego, las pelotas se ven naranjas.
    balls.forEach((ball) => ball.circle.setFillStyle(this.isFireActive ? ARCADE_FIRE_COLOR : COLORS.BALL));
    // Primero las paredes del arco chico: si la pelota pega en una, el escudo no se gasta.
    this.smallGoal.update(balls);
    this.shield.update(balls);
  }

  // Una pelota que se fue: sus efectos (gigante) se terminan con ella.
  onBallLost(ball) {
    this.ballEffects.clearBall(ball);
  }

  // Al perder una vida o pasar de nivel se terminan todos los efectos.
  clearAll() {
    this.paddleEffects.clearAll();
    this.ballEffects.clearAll();
    this.shield.clearAll();
    this.smallGoal.clearAll();
    this.cannon.clearAll();
    this.slowMotion.clear();
    this.stopDoublePoints();
    this.laser.clearAll();
    this.fireTimer?.remove();
    this.fireTimer = null;
    this.explosiveCharges = null;
    this.indicators.clearAll();
  }
}
