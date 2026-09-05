import Phaser from "phaser";
import { GAME_WIDTH, COLORS, WIN_SCORE_SHORT, WIN_SCORE_LONG } from "../config.js";

const SELECTED_COLOR = "#66ff66";
const UNSELECTED_COLOR = "#888888";

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    this.mode = "1p";
    this.winScore = WIN_SCORE_SHORT;

    this.add
      .text(GAME_WIDTH / 2, 70, "PONG con Power-ups", { fontSize: "40px", color: COLORS.TEXT })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 130, "Elegí una opción de cada grupo y confirmá con ENTER", {
        fontSize: "16px",
        color: "#888888",
      })
      .setOrigin(0.5);

    this.modeOption1p = this.createOption(190, "1: 1 Jugador vs CPU", () => this.setMode("1p"));
    this.modeOption2p = this.createOption(222, "2: 2 Jugadores", () => this.setMode("2p"));

    this.pointsOption5 = this.createOption(272, "5: Partida a 5 puntos", () =>
      this.setWinScore(WIN_SCORE_SHORT)
    );
    this.pointsOption10 = this.createOption(304, "0: Partida a 10 puntos", () =>
      this.setWinScore(WIN_SCORE_LONG)
    );

    this.add
      .text(GAME_WIDTH / 2, 360, "Jugador 1: W / S     Jugador 2: Flechas arriba/abajo", {
        fontSize: "16px",
        color: "#888888",
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 440, "ENTER: Empezar", { fontSize: "22px", color: COLORS.TEXT })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.startGame());

    this.updateOptionStyles();

    this.input.keyboard.on("keydown-ONE", () => this.setMode("1p"));
    this.input.keyboard.on("keydown-TWO", () => this.setMode("2p"));
    this.input.keyboard.on("keydown-FIVE", () => this.setWinScore(WIN_SCORE_SHORT));
    this.input.keyboard.on("keydown-ZERO", () => this.setWinScore(WIN_SCORE_LONG));
    this.input.keyboard.on("keydown-ENTER", () => this.startGame());
  }

  createOption(y, label, onClick) {
    return this.add
      .text(GAME_WIDTH / 2, y, label, { fontSize: "22px", color: UNSELECTED_COLOR })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", onClick);
  }

  startGame() {
    if (this.mode === "1p") {
      this.scene.start("DifficultyScene", { winScore: this.winScore });
    } else {
      this.scene.start("TutorialScene", { mode: this.mode, winScore: this.winScore });
    }
  }

  setMode(mode) {
    this.mode = mode;
    this.updateOptionStyles();
  }

  setWinScore(winScore) {
    this.winScore = winScore;
    this.updateOptionStyles();
  }

  updateOptionStyles() {
    this.styleOption(this.modeOption1p, "1: 1 Jugador vs CPU", this.mode === "1p");
    this.styleOption(this.modeOption2p, "2: 2 Jugadores", this.mode === "2p");
    this.styleOption(this.pointsOption5, "5: Partida a 5 puntos", this.winScore === WIN_SCORE_SHORT);
    this.styleOption(this.pointsOption10, "0: Partida a 10 puntos", this.winScore === WIN_SCORE_LONG);
  }

  styleOption(textObject, label, isSelected) {
    const prefix = isSelected ? "▶ " : "   ";
    textObject.setText(prefix + label);
    textObject.setColor(isSelected ? SELECTED_COLOR : UNSELECTED_COLOR);
  }
}
