import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from "../config.js";
import { KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";
import LanguagePanel from "../ui/LanguagePanel.js";
import MenuList from "../ui/MenuList.js";
import IconButton from "../ui/IconButton.js";

export default class PauseScene extends Phaser.Scene {
  constructor() {
    super("PauseScene");
  }

  create() {
    // En el Modo Historia, salir de la pausa lleva a la selección de nivel.
    this.isStory = this.scene.get("GameScene").mode === "story";

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6);

    this.titleText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 90, getPhrase(KEYS.PAUSA), { fontSize: "36px", color: COLORS.TEXT })
      .setOrigin(0.5);

    this.menu = new MenuList(this, {
      y: GAME_HEIGHT / 2 - 10,
      spacing: 48,
      items: [
        { labelKey: KEYS.REANUDAR, action: () => this.resumeGame() },
        { labelKey: this.isStory ? KEYS.SELECCION_DE_NIVEL : KEYS.VOLVER_AL_MENU, action: () => this.exitToMenu() },
        { labelKey: KEYS.OPCIONES, action: () => this.languagePanel.open() },
      ],
    });

    // Volver (ícono o Esc) reanuda la partida; con el panel de idioma abierto, lo cierra.
    new IconButton(this, 30, 28, "←", () => this.handleBack(), { fontSize: "28px" });
    this.input.keyboard.on("keydown-ESC", () => this.handleBack());

    this.languagePanel = new LanguagePanel(this, () => this.refreshTexts());
  }

  update() {
    this.languagePanel.update();
    this.menu.setEnabled(!this.languagePanel.isOpen);
  }

  refreshTexts() {
    this.titleText.setText(getPhrase(KEYS.PAUSA));
    this.menu.refreshTexts();
  }

  handleBack() {
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
    this.scene.start(this.isStory ? "LevelSelectScene" : "MenuScene");
  }
}
