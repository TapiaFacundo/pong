import { ARCADE_LIVES } from "../config.js";

// Estado de una partida del Arcade: puntaje, vidas y nivel.
export default class ArcadeRun {
  constructor() {
    this.score = 0;
    this.lives = ARCADE_LIVES;
    this.level = 1;
  }

  addPoints(points) {
    this.score += points;
  }

  gainLife() {
    this.lives += 1;
  }

  // Devuelve las vidas que quedan.
  loseLife() {
    this.lives -= 1;
    return this.lives;
  }

  get isOver() {
    return this.lives <= 0;
  }
}
