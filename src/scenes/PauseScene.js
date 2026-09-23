import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from "../config.js";
import { KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";
import LanguagePanel from "../ui/LanguagePanel.js";

const OPTIONS_LABEL_KEY = "Opciones";

export default class PauseScene extends Phaser.Scene {
  constructor() {
    super("PauseScene");
  }

  create() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6);

    this.titleText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 80, getPhrase(KEYS.PAUSA), { fontSize: "36px", color: COLORS.TEXT })
      .setOrigin(0.5);

    this.resumeText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, getPhrase(KEYS.REANUDAR), { fontSize: "26px", color: COLORS.TEXT })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.resumeGame());

    this.exitText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 55, getPhrase(KEYS.VOLVER_AL_MENU), { fontSize: "26px", color: COLORS.TEXT })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.exitToMenu());

    this.optionsText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100, getPhrase(OPTIONS_LABEL_KEY), { fontSize: "18px", color: "#aaaaaa" })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.languagePanel.toggle());

    this.hintText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 150, getPhrase(KEYS.ENTER_ESC_REANUDAR_M_VOLVER_AL_MENU), {
        fontSize: "14px",
        color: "#888888",
      })
      .setOrigin(0.5);

    this.languagePanel = new LanguagePanel(this, () => this.refreshTexts());

    this.input.keyboard.on("keydown-ESC", () => this.handleEscape());
    this.input.keyboard.on("keydown-ENTER", () => this.resumeGame());
    this.input.keyboard.on("keydown-M", () => this.exitToMenu());
  }

  update() {
    this.languagePanel.update();
  }

  refreshTexts() {
    this.titleText.setText(getPhrase(KEYS.PAUSA));
    this.resumeText.setText(getPhrase(KEYS.REANUDAR));
    this.exitText.setText(getPhrase(KEYS.VOLVER_AL_MENU));
    this.optionsText.setText(getPhrase(OPTIONS_LABEL_KEY));
    this.hintText.setText(getPhrase(KEYS.ENTER_ESC_REANUDAR_M_VOLVER_AL_MENU));
  }

  handleEscape() {
    if (this.languagePanel.isOpen) {
      this.languagePanel.close();
      return;
    }

    this.resumeGame();
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
