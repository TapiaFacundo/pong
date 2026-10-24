import Phaser from "phaser";
import { COLORS, BOSS_COLOR } from "../config.js";
import { playWallBounce, playBossPhase } from "./SoundEffects.js";
import { burst, pulse } from "./FeelEffects.js";

// Estela: cuánto tiempo de recorrido deja ver detrás de la pelota (más larga
// cuanto más rápida va) y qué tan visible es.
const TRAIL_MIN_TIME = 60;
const TRAIL_EXTRA_TIME = 110;
const TRAIL_MIN_ALPHA = 0.15;
const TRAIL_EXTRA_ALPHA = 0.3;
// Golpe de pala: un pulso que se abre desde la pala y chispas que salen hacia
// donde va la pelota (amarillas cuando va rápida).
const HIT_PULSE_DURATION = 160;
const HIT_SPARKS_MIN = 4;
const HIT_SPARKS_EXTRA = 6;
const FAST_SPARK_COLOR = 0xffdd33;
const FAST_SPARK_RATIO = 0.6;
const WALL_DUST_COLOR = 0x888888;
// Gol: explosión de la pelota en forma de media luna contra el borde por donde
// salió (un resplandor y una onda que se abre), partículas y sacudón.
const GOAL_PARTICLES = 14;
const GOAL_GLOW_RADIUS = 110;
const GOAL_GLOW_ALPHA = 0.35;
const GOAL_WAVE_RADIUS = 190;
const GOAL_FLASH_DURATION = 450;
const GOAL_SHAKE_DURATION = 160;
const GOAL_SHAKE_INTENSITY = 0.006;
// Saque: la pelota parpadea, la rodea un anillo que late y una flechita
// muestra hacia dónde va a salir.
const SERVE_BLINK = 160;
const SERVE_BLINK_ALPHA = 0.25;
const SERVE_RING_PERIOD = 500;
const SERVE_ARROW_GAP = 14;
const SERVE_ARROW_SIZE = 7;
const SERVE_ARROW_ALPHA = 0.6;
// Fase nueva del jefe: toda la cancha destella en violeta y tiembla.
const BOSS_FLASH_ALPHA = 0.35;
const BOSS_FLASH_DURATION = 600;
const BOSS_SHAKE_DURATION = 300;
const BOSS_SHAKE_INTENSITY = 0.01;

// "Game feel" de cualquier partida (Batalla, Modo Historia y Arcade): solo
// imagen y sonido, no cambia nada del juego. Escucha eventos de la escena:
// - "paddleHit" { ball, paddle, directionX }: lo emite BallManager.
// - "ballOut" { ball, x, y, exitSide }: lo emite BallManager.
// - "serveWait" { ball, directionX } / "serve" { ball }: los emite la escena
//   al poner la pelota a esperar el saque y al sacarla.
// - "bossPhase": lo emite GameScene cuando el jefe pasa a una fase nueva.
// y el rebote de las pelotas contra los bordes de la cancha (worldbounds de Phaser).
//
// options.goalFlashColor: color del destello del gol (en el Arcade, rojo:
// es una vida perdida).
export default class GameFeel {
  constructor(scene, ballManager, { goalFlashColor = COLORS.PADDLE } = {}) {
    this.scene = scene;
    this.ballManager = ballManager;
    this.goalFlashColor = goalFlashColor;
    this.trails = new Map(); // ball -> [{ x, y, time }]
    this.serving = new Map(); // ball -> { ring, arrow, directionX }
    this.trailGraphics = scene.add.graphics();

    const events = scene.events;
    const world = scene.physics.world;
    const onWorldBounds = (body, up, down, left, right) => this.onWallBounce(body, { up, down, left, right });
    events.on("paddleHit", this.onPaddleHit, this);
    events.on("ballOut", this.onBallOut, this);
    events.on("serveWait", this.onServeWait, this);
    events.on("serve", this.onServe, this);
    events.on("bossPhase", this.onBossPhase, this);
    // Después de la física: la pelota ya está en su lugar de este frame.
    events.on("postupdate", this.update, this);
    world.on("worldbounds", onWorldBounds);

    // Phaser reutiliza la escena: los eventos se sacan al salir.
    events.once("shutdown", () => {
      events.off("paddleHit", this.onPaddleHit, this);
      events.off("ballOut", this.onBallOut, this);
      events.off("serveWait", this.onServeWait, this);
      events.off("serve", this.onServe, this);
      events.off("bossPhase", this.onBossPhase, this);
      events.off("postupdate", this.update, this);
      world.off("worldbounds", onWorldBounds);
    });
  }

  update() {
    this.drawTrails();
    this.followServingBalls();
  }

  // Cada pelota en movimiento deja detrás los puntos por los que pasó en los
  // últimos milisegundos, cada vez más chicos y transparentes.
  drawTrails() {
    const now = this.scene.time.now;
    const balls = this.ballManager.balls;
    const graphics = this.trailGraphics.clear();

    for (const ball of this.trails.keys()) {
      if (!balls.includes(ball)) this.trails.delete(ball);
    }

    for (const ball of balls) {
      const moving = !ball.isHeld && !this.serving.has(ball) && ball.circle.visible;
      if (!moving) {
        this.trails.delete(ball);
        continue;
      }

      const ratio = ball.speedRatio;
      const points = this.trails.get(ball) ?? [];
      points.push({ x: ball.x, y: ball.y, time: now });
      const maxAge = TRAIL_MIN_TIME + TRAIL_EXTRA_TIME * ratio;
      while (points.length > 0 && now - points[0].time > maxAge) points.shift();
      this.trails.set(ball, points);

      const alpha = TRAIL_MIN_ALPHA + TRAIL_EXTRA_ALPHA * ratio;
      // El último punto es donde está la pelota: ese ya lo dibuja ella.
      for (let i = 0; i < points.length - 1; i++) {
        const progress = (i + 1) / points.length;
        graphics.fillStyle(COLORS.BALL, alpha * progress);
        graphics.fillCircle(points[i].x, points[i].y, ball.radius * (0.35 + 0.6 * progress));
      }
    }
  }

  onPaddleHit({ ball, paddle, directionX }) {
    const ratio = ball.speedRatio;

    pulse(this.scene, paddle.rect, { scaleX: 2.4, scaleY: 1.08, duration: HIT_PULSE_DURATION });
    burst(this.scene, ball.x - directionX * ball.radius, ball.y, {
      count: HIT_SPARKS_MIN + Math.round(HIT_SPARKS_EXTRA * ratio),
      color: ratio > FAST_SPARK_RATIO ? FAST_SPARK_COLOR : COLORS.PADDLE,
      angle: directionX > 0 ? 0 : Math.PI,
      spread: Math.PI / 3,
      distance: [18, 40 + 30 * ratio],
      size: 4,
    });
  }

  // Pelota contra el techo, el piso o (en el Arcade) la pared derecha.
  onWallBounce(body, { up, down, right }) {
    const ball = this.ballManager.balls.find((item) => item.circle.body === body);
    if (!ball) return;

    const bounds = this.scene.physics.world.bounds;
    let x = ball.x;
    let y = ball.y;
    let angle = 0;
    if (up) {
      y = bounds.top;
      angle = Math.PI / 2;
    } else if (down) {
      y = bounds.bottom;
      angle = -Math.PI / 2;
    } else if (right) {
      x = bounds.right;
      angle = Math.PI;
    } else {
      return;
    }

    playWallBounce();
    burst(this.scene, x, y, {
      count: 3,
      color: WALL_DUST_COLOR,
      angle,
      spread: Math.PI / 2.5,
      distance: [8, 20],
      size: 2,
    });
  }

  // La pelota explota contra el borde por donde salió: media luna de luz, una
  // onda que se abre, partículas y un sacudón de la pantalla.
  onBallOut({ ball, y, exitSide }) {
    this.clearServe(ball);
    this.trails.delete(ball);

    const bounds = this.scene.physics.world.bounds;
    const left = exitSide === "left";
    const edgeX = left ? bounds.left : bounds.right;
    const edgeY = Phaser.Math.Clamp(y, bounds.top, bounds.bottom);

    burst(this.scene, edgeX, edgeY, {
      count: GOAL_PARTICLES,
      color: COLORS.BALL,
      angle: left ? 0 : Math.PI,
      spread: Math.PI * 0.9,
      distance: [30, 100],
      size: 4,
      duration: 450,
    });

    // Medio círculo abierto hacia la cancha (los ángulos de Arc van en grados).
    const [startAngle, endAngle] = left ? [-90, 90] : [90, 270];
    const glow = this.scene.add
      .arc(edgeX, edgeY, GOAL_GLOW_RADIUS, startAngle, endAngle, false, this.goalFlashColor, GOAL_GLOW_ALPHA)
      .setScale(0.2);
    const wave = this.scene.add
      .arc(edgeX, edgeY, GOAL_WAVE_RADIUS, startAngle, endAngle, false)
      .setClosePath(false)
      .setStrokeStyle(3, this.goalFlashColor, 0.8)
      .setScale(0.1);

    this.scene.tweens.add({
      targets: [glow, wave],
      scale: 1,
      alpha: 0,
      duration: GOAL_FLASH_DURATION,
      ease: "Quad.easeOut",
      onComplete: () => {
        glow.destroy();
        wave.destroy();
      },
    });

    this.scene.cameras.main.shake(GOAL_SHAKE_DURATION, GOAL_SHAKE_INTENSITY);
  }

  onBossPhase() {
    const bounds = this.scene.physics.world.bounds;
    const flash = this.scene.add
      .rectangle(bounds.centerX, bounds.centerY, bounds.width, bounds.height, BOSS_COLOR, BOSS_FLASH_ALPHA)
      .setDepth(15);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: BOSS_FLASH_DURATION,
      ease: "Quad.easeIn",
      onComplete: () => flash.destroy(),
    });
    this.scene.cameras.main.shake(BOSS_SHAKE_DURATION, BOSS_SHAKE_INTENSITY);
    playBossPhase();
  }

  onServeWait({ ball, directionX }) {
    this.clearServe(ball);

    const ring = this.scene.add.circle(ball.x, ball.y, ball.radius).setStrokeStyle(2, COLORS.BALL);
    this.scene.tweens.add({
      targets: ring,
      scale: 3,
      alpha: { from: 0.7, to: 0 },
      duration: SERVE_RING_PERIOD,
      repeat: -1,
    });

    const arrow = this.scene.add.graphics().setAlpha(SERVE_ARROW_ALPHA);
    arrow
      .fillStyle(COLORS.BALL)
      .fillTriangle(
        directionX * SERVE_ARROW_SIZE,
        0,
        -directionX * SERVE_ARROW_SIZE,
        -SERVE_ARROW_SIZE,
        -directionX * SERVE_ARROW_SIZE,
        SERVE_ARROW_SIZE
      );

    this.scene.tweens.add({
      targets: ball.circle,
      alpha: SERVE_BLINK_ALPHA,
      duration: SERVE_BLINK,
      yoyo: true,
      repeat: -1,
    });

    this.serving.set(ball, { ring, arrow, directionX });
    this.followServingBalls();
  }

  onServe({ ball }) {
    if (!this.serving.has(ball)) return;

    this.clearServe(ball);
    burst(this.scene, ball.x, ball.y, {
      count: 6,
      color: COLORS.BALL,
      angle: 0,
      spread: Math.PI,
      distance: [10, 26],
      size: 2,
    });
  }

  // El anillo y la flecha acompañan a la pelota (en el Arcade espera pegada a la pala, que se mueve).
  followServingBalls() {
    for (const [ball, { ring, arrow, directionX }] of this.serving) {
      if (!ball.circle.active) {
        this.clearServe(ball);
        continue;
      }
      ring.setPosition(ball.x, ball.y);
      arrow.setPosition(ball.x + directionX * (ball.radius + SERVE_ARROW_GAP), ball.y);
    }
  }

  clearServe(ball) {
    const serving = this.serving.get(ball);
    if (!serving) return;

    this.scene.tweens.killTweensOf(ball.circle);
    if (ball.circle.active) ball.circle.setAlpha(1);
    serving.ring.destroy();
    serving.arrow.destroy();
    this.serving.delete(ball);
  }
}
