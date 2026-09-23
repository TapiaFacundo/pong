import { GAME_WIDTH, GAME_HEIGHT } from "../config.js";
import { EN, ES } from "../enums/languages.js";
import { FETCHED, FETCHING, READY, TODO } from "../enums/status.js";
import { getTranslations } from "../services/translations.js";

const PANEL_WIDTH = 240;
const PANEL_HEIGHT = 160;
const SELECTED_COLOR = "#66ff66";
const UNSELECTED_COLOR = "#ffffff";

function detectCurrentLanguage() {
  try {
    const stored = localStorage.getItem("translations");
    const parsed = stored ? JSON.parse(stored) : null;
    return parsed?.data?.language === EN ? EN : ES;
  } catch {
    return ES;
  }
}

// Panel de selección de idioma (Español/English) reutilizado por MenuScene
// (ícono de configuración) y PauseScene (texto "Opciones").
export default class LanguagePanel {
  constructor(scene, onLanguageChanged) {
    this.scene = scene;
    this.onLanguageChanged = onLanguageChanged;
    this.language = detectCurrentLanguage();
    this.status = TODO;
    this.isOpen = false;

    this.build();
    this.close();
  }

  build() {
    const x = GAME_WIDTH / 2;
    const y = GAME_HEIGHT / 2;

    this.backdrop = this.scene.add
      .rectangle(x, y, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.65)
      .setInteractive()
      .on("pointerdown", () => this.close());

    this.box = this.scene.add
      .rectangle(x, y, PANEL_WIDTH, PANEL_HEIGHT, 0x111111, 0.97)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive()
      .on("pointerdown", () => {});

    this.title = this.scene.add
      .text(x, y - PANEL_HEIGHT / 2 + 28, "Idioma / Language", { fontSize: "15px", color: "#888888" })
      .setOrigin(0.5);

    this.optionEs = this.scene.add
      .text(x, y - 12, "Español", { fontSize: "22px", color: UNSELECTED_COLOR })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.selectLanguage(ES));

    this.optionEn = this.scene.add
      .text(x, y + 30, "English", { fontSize: "22px", color: UNSELECTED_COLOR })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.selectLanguage(EN));

    this.elements = [this.backdrop, this.box, this.title, this.optionEs, this.optionEn];
    this.updateHighlight();
  }

  open() {
    this.isOpen = true;
    this.elements.forEach((el) => el.setVisible(true));
  }

  close() {
    this.isOpen = false;
    this.elements.forEach((el) => el.setVisible(false));
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  selectLanguage(language) {
    if (this.language === language || this.status === FETCHING) return;

    this.language = language;
    this.status = FETCHING;
    this.updateHighlight();

    getTranslations(language, () => {
      this.status = FETCHED;
    });
  }

  updateHighlight() {
    this.optionEs.setColor(this.language === ES ? SELECTED_COLOR : UNSELECTED_COLOR);
    this.optionEn.setColor(this.language === EN ? SELECTED_COLOR : UNSELECTED_COLOR);
  }

  update() {
    if (this.status === FETCHED) {
      this.status = READY;
      this.close();
      if (this.onLanguageChanged) this.onLanguageChanged();
    }
  }
}
