import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from "../config.js";
import { KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";
import LanguagePanel from "../ui/LanguagePanel.js";
import MenuList from "../ui/MenuList.js";
import IconButton from "../ui/IconButton.js";

// Pausa de cualquier partida, encima de ella: Reanudar, salir y Opciones (idioma).
export default class PauseScene extends Phaser.Scene {
  constructor() {
    super("PauseScene");
  }

  // data (lo arma MatchPause): gameSceneKey (la partida a reanudar o cerrar),
  // exitTo / exitData / exitLabelKey (a dónde lleva la opción de salir, con
  // qué datos y su texto: en el Modo Historia, la selección de nivel).
  init(data) {
    this.gameSceneKey = data.gameSceneKey;
    this.exitTo = data.exitTo;
    this.exitData = data.exitData;
    this.exitLabelKey = data.exitLabelKey;
  }

  create() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6);

    this.titleText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 90, getPhrase(KEYS.PAUSA), { fontSize: "36px", color: COLORS.TEXT })
      .setOrigin(0.5);

    this.menu = new MenuList(this, {
      y: GAME_HEIGHT / 2 - 10,
      spacing: 48,
      items: [
        { labelKey: KEYS.REANUDAR, action: () => this.resumeGame() },
        { labelKey: this.exitLabelKey, action: () => this.exitToMenu() },
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
    this.scene.stop();
    this.scene.resume(this.gameSceneKey);
  }

  exitToMenu() {
    this.scene.stop(this.gameSceneKey);
    this.scene.start(this.exitTo, this.exitData);
  }
}
