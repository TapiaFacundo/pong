import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from "../config.js";

export default class PauseScene extends Phaser.Scene {
  constructor() {
    super("PauseScene");
  }

  create() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, "PAUSA", { fontSize: "36px", color: COLORS.TEXT })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, "Reanudar", { fontSize: "26px", color: COLORS.TEXT })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.resumeGame());

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 55, "Volver al menú", { fontSize: "26px", color: COLORS.TEXT })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.exitToMenu());

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 115, "ENTER / ESC: Reanudar     M: Volver al menú", {
        fontSize: "14px",
        color: "#888888",
      })
      .setOrigin(0.5);

    this.input.keyboard.on("keydown-ESC", () => this.resumeGame());
    this.input.keyboard.on("keydown-ENTER", () => this.resumeGame());
    this.input.keyboard.on("keydown-M", () => this.exitToMenu());
  }

  resumeGame() {
    const gameScene = this.scene.get("GameScene");
    gameScene.isPaused = false;
    this.scene.stop();
    this.scene.resume("GameScene");
  }

  exitToMenu() {
    this.scene.stop("GameScene");
    this.scene.start("MenuScene");
  }
}
