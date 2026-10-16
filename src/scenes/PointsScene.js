import Phaser from "phaser";
import { GAME_WIDTH, COLORS, WIN_SCORE_SHORT, WIN_SCORE_MEDIUM, WIN_SCORE_LONG } from "../config.js";
import { KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";
import MenuList from "../ui/MenuList.js";
import { addBackNavigation } from "../ui/IconButton.js";

const WIN_SCORES = [WIN_SCORE_SHORT, WIN_SCORE_MEDIUM, WIN_SCORE_LONG];

// A cuántos puntos se juega la Batalla. Último paso antes de la partida.
export default class PointsScene extends Phaser.Scene {
  constructor() {
    super("PointsScene");
  }

  // data: { mode: "1p" | "2p", difficulty } (difficulty solo en 1 jugador).
  init(data) {
    this.gameData = data;
  }

  create() {
    this.add.text(GAME_WIDTH / 2, 130, getPhrase(KEYS.PUNTOS), { fontSize: "36px", color: COLORS.TEXT }).setOrigin(0.5);

    new MenuList(this, {
      y: 250,
      spacing: 52,
      items: WIN_SCORES.map((winScore) => ({
        label: getPhrase(KEYS.N_PUNTOS).replace("{n}", winScore),
        action: () => this.scene.start("GameScene", { ...this.gameData, winScore }),
      })),
    });

    // Vuelve a la dificultad (1 jugador) o a la elección de jugadores (2 jugadores).
    addBackNavigation(this, () =>
      this.gameData.mode === "1p"
        ? this.scene.start("DifficultyScene", { difficulty: this.gameData.difficulty })
        : this.scene.start("BattleScene", { mode: "2p" })
    );
  }
}
