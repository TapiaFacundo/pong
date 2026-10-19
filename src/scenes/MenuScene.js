import Phaser from "phaser";
import { GAME_TITLE, GAME_WIDTH } from "../config.js";
import { KEYS } from "../enums/keys.js";
import { getTranslations, getLanguageConfig } from "../services/translations.js";
import LanguagePanel from "../ui/LanguagePanel.js";
import MenuList from "../ui/MenuList.js";
import IconButton from "../ui/IconButton.js";
import { addTitle, menuTop } from "../ui/ScreenLayout.js";

// Menú principal: Batalla (partidas casuales), Modo Historia o Arcade. En las esquinas,
// "?" abre cómo jugar y "⚙" el panel de idioma.
// Modos que, al volver, quedan marcados en el menú (después de "Batalla").
const MENU_MODES = ["story", "arcade"];

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  // data.mode: "story" o "arcade" deja marcado ese modo al volver desde ahí.
  init(data) {
    this.initialIndex = MENU_MODES.indexOf(data?.mode) + 1;
  }

  create() {
    this.languagePanel = null;
    getTranslations(getLanguageConfig(), () => this.buildScene());
  }

  buildScene() {
    addTitle(this, GAME_TITLE, { y: 170, fontSize: "56px" });

    const helpIcon = new IconButton(this, 30, 28, "?", () => this.openTutorial(), { circle: true, fontSize: "20px" });
    const settingsIcon = new IconButton(this, GAME_WIDTH - 30, 28, "⚙", () => this.languagePanel.toggle(), {
      fontSize: "26px",
    });
    // Pantalla completa, solo donde el navegador lo permite (en iPhone no).
    const fullscreenIcon = this.sys.game.device.fullscreen.available
      ? new IconButton(this, GAME_WIDTH - 86, 28, "fullscreen", () => this.toggleFullscreen())
      : null;

    // Con el teclado, subiendo desde "Batalla" se llega a los íconos de las esquinas.
    this.menu = new MenuList(this, {
      y: menuTop(3, { spacing: 54, centerY: 360 }),
      spacing: 54,
      fontSize: "28px",
      initialIndex: this.initialIndex,
      topIcons: [helpIcon, fullscreenIcon, settingsIcon].filter(Boolean),
      items: [
        { labelKey: KEYS.BATALLA, action: () => this.scene.start("BattleScene") },
        { labelKey: KEYS.MODO_HISTORIA, action: () => this.scene.start("LevelSelectScene") },
        { labelKey: KEYS.ARCADE, action: () => this.scene.start("ArcadeScene") },
      ],
    });

    this.languagePanel = new LanguagePanel(this, () => this.menu.refreshTexts());

    this.input.keyboard.on("keydown-ESC", () => this.languagePanel.close());
  }

  // En el celular, además, intenta dejar la pantalla acostada.
  toggleFullscreen() {
    if (this.languagePanel.isOpen) return;

    if (this.scale.isFullscreen) {
      this.scale.stopFullscreen();
      return;
    }

    this.scale.startFullscreen();
    this.scale.once("enterfullscreen", () => window.screen.orientation?.lock?.("landscape").catch(() => {}));
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
