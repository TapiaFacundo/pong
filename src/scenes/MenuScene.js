import Phaser from "phaser";
import { GAME_TITLE, GAME_WIDTH, COLORS } from "../config.js";
import { KEYS } from "../enums/keys.js";
import { getTranslations, getLanguageConfig } from "../services/translations.js";
import LanguagePanel from "../ui/LanguagePanel.js";
import MenuList from "../ui/MenuList.js";
import IconButton from "../ui/IconButton.js";

// Menú principal: Batalla (partidas casuales) o Modo Historia. En las esquinas,
// "?" abre cómo jugar y "⚙" el panel de idioma.
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  // data.mode: "story" deja marcado el Modo Historia al volver desde ahí.
  init(data) {
    this.initialIndex = data?.mode === "story" ? 1 : 0;
  }

  create() {
    this.languagePanel = null;
    getTranslations(getLanguageConfig(), () => this.buildScene());
  }

  buildScene() {
    this.add.text(GAME_WIDTH / 2, 150, GAME_TITLE, { fontSize: "48px", color: COLORS.TEXT }).setOrigin(0.5);

    const helpIcon = new IconButton(this, 30, 28, "?", () => this.openTutorial(), { circle: true, fontSize: "20px" });
    const settingsIcon = new IconButton(this, GAME_WIDTH - 30, 28, "⚙", () => this.languagePanel.toggle(), {
      fontSize: "26px",
    });

    // Con el teclado, subiendo desde "Batalla" se llega a los íconos de las esquinas.
    this.menu = new MenuList(this, {
      y: 300,
      spacing: 52,
      fontSize: "28px",
      initialIndex: this.initialIndex,
      topIcons: [helpIcon, settingsIcon],
      items: [
        { labelKey: KEYS.BATALLA, action: () => this.scene.start("BattleScene") },
        { labelKey: KEYS.MODO_HISTORIA, action: () => this.scene.start("LevelSelectScene") },
      ],
    });

    this.languagePanel = new LanguagePanel(this, () => this.menu.refreshTexts());

    this.input.keyboard.on("keydown-ESC", () => this.languagePanel.close());
  }

  openTutorial() {
    if (this.languagePanel.isOpen) return;
    this.scene.start("TutorialScene", { returnTo: "MenuScene" });
  }

  update() {
    if (!this.languagePanel) return;

    this.languagePanel.update();
    this.menu.setEnabled(!this.languagePanel.isOpen);
  }
}
