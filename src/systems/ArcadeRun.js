import { ARCADE_LIVES } from "../config.js";

// Estado de una partida del Arcade: puntaje, vidas y nivel. pointsMultiplier
// vale 2 mientras dura "Puntos ×2".
export default class ArcadeRun {
  constructor() {
    this.score = 0;
    this.pointsMultiplier = 1;
    this.lives = ARCADE_LIVES;
    this.level = 1;
  }

  addPoints(points) {
    this.score += points * this.pointsMultiplier;
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
