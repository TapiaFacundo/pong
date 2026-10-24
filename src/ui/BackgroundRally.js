import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_OFFSET_X, BALL_SIZE } from "../config.js";

// Colores apagados: es decoración y no tiene que competir con las opciones.
const PIECE_COLOR = 0x2a2a2a;
const MID_LINE_COLOR = 0x111111;
const BALL_SPEED = 260;
// Inclinación máxima de la pelota al salir de una pala (velocidad vertical / horizontal).
const MAX_SLOPE = 0.7;
// Qué tan rápido las palas siguen a la pelota (fracción del camino por segundo).
const PADDLE_FOLLOW = 4;
const DEPTH = -10;

// Un peloteo de Pong que se juega solo en el fondo de una pantalla (el menú
// principal), con las palas y la pelota del juego en gris oscuro. Las palas
// siempre llegan: es solo para que la pantalla tenga algo de movimiento.
export default class BackgroundRally {
  constructor(scene) {
    this.scene = scene;
    this.drawMidLine(scene);

    const leftX = PADDLE_OFFSET_X;
    const rightX = GAME_WIDTH - PADDLE_OFFSET_X;
    this.paddles = [leftX, rightX].map((x) =>
      scene.add.rectangle(x, GAME_HEIGHT / 2, PADDLE_WIDTH, PADDLE_HEIGHT, PIECE_COLOR).setDepth(DEPTH)
    );
    this.ball = scene.add.circle(GAME_WIDTH / 2, GAME_HEIGHT / 2, BALL_SIZE / 2, PIECE_COLOR).setDepth(DEPTH);
    // Dónde rebota la pelota: en la cara de adentro de cada pala.
    this.minX = leftX + PADDLE_WIDTH / 2 + BALL_SIZE / 2;
    this.maxX = rightX - PADDLE_WIDTH / 2 - BALL_SIZE / 2;
    this.velocity = { x: BALL_SPEED, y: BALL_SPEED * Phaser.Math.FloatBetween(-MAX_SLOPE, MAX_SLOPE) };

    scene.events.on("update", this.update, this);
    scene.events.once("shutdown", () => scene.events.off("update", this.update, this));
  }

  drawMidLine(scene) {
    const graphics = scene.add.graphics().setDepth(DEPTH);
    graphics.lineStyle(4, MID_LINE_COLOR);
    for (let y = 0; y < GAME_HEIGHT; y += 28) graphics.lineBetween(GAME_WIDTH / 2, y, GAME_WIDTH / 2, y + 16);
  }

  update(time, delta) {
    const seconds = delta / 1000;
    const ball = this.ball;

    ball.x += this.velocity.x * seconds;
    ball.y += this.velocity.y * seconds;

    const radius = BALL_SIZE / 2;
    if (ball.y < radius || ball.y > GAME_HEIGHT - radius) {
      ball.y = Phaser.Math.Clamp(ball.y, radius, GAME_HEIGHT - radius);
      this.velocity.y *= -1;
    }
    if (ball.x < this.minX || ball.x > this.maxX) {
      ball.x = Phaser.Math.Clamp(ball.x, this.minX, this.maxX);
      this.velocity.x *= -1;
      this.velocity.y = BALL_SPEED * Phaser.Math.FloatBetween(-MAX_SLOPE, MAX_SLOPE);
    }

    // Cada pala sigue a la pelota cuando viene hacia ella, y si no vuelve despacio al centro.
    const follow = Math.min(1, PADDLE_FOLLOW * seconds);
    this.paddles.forEach((paddle, index) => {
      const comingTowards = index === 0 ? this.velocity.x < 0 : this.velocity.x > 0;
      const targetY = comingTowards ? ball.y : GAME_HEIGHT / 2;
      const halfHeight = PADDLE_HEIGHT / 2;
      paddle.y = Phaser.Math.Clamp(paddle.y + (targetY - paddle.y) * follow, halfHeight, GAME_HEIGHT - halfHeight);
    });
  }
}
