import { GAME_WIDTH, GAME_HEIGHT } from "../config.js";
import { EN, ES } from "../enums/languages.js";
import { FETCHED, FETCHING, READY, TODO } from "../enums/status.js";
import { getTranslations } from "../services/translations.js";

const PANEL_WIDTH = 240;
const PANEL_HEIGHT = 160;
const SELECTED_COLOR = "#66ff66";
const UNSELECTED_COLOR = "#ffffff";
const LANGUAGES = [ES, EN];

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
// (ícono de configuración) y PauseScene (texto "Opciones"). El idioma actual
// se ve en verde; con el teclado se marca uno con W / S o flechas ("▶") y se
// elige con Enter. Esc lo cierra (lo maneja cada escena).
export default class LanguagePanel {
  constructor(scene, onLanguageChanged) {
    this.scene = scene;
    this.onLanguageChanged = onLanguageChanged;
    this.language = detectCurrentLanguage();
    this.status = TODO;
    this.isOpen = false;
    this.justOpened = false;
    this.focusIndex = LANGUAGES.indexOf(this.language);

    this.build();
    this.close();

    const keyboard = scene.input.keyboard;
    ["W", "UP"].forEach((key) => keyboard.on(`keydown-${key}`, () => this.moveFocus(-1)));
    ["S", "DOWN"].forEach((key) => keyboard.on(`keydown-${key}`, () => this.moveFocus(1)));
    keyboard.on("keydown-ENTER", () => this.confirmFocus());
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
      .on("pointerover", () => this.setFocus(0))
      .on("pointerdown", () => this.selectLanguage(ES));

    this.optionEn = this.scene.add
      .text(x, y + 30, "English", { fontSize: "22px", color: UNSELECTED_COLOR })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => this.setFocus(1))
      .on("pointerdown", () => this.selectLanguage(EN));

    this.elements = [this.backdrop, this.box, this.title, this.optionEs, this.optionEn];
    this.updateHighlight();
  }

  open() {
    this.isOpen = true;
    // El mismo Enter que abrió el panel no tiene que elegir un idioma.
    this.justOpened = true;
    this.focusIndex = LANGUAGES.indexOf(this.language);
    this.updateHighlight();
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
    if (this.status === FETCHING) return;
    if (this.language === language) {
      this.close();
      return;
    }

    this.language = language;
    this.status = FETCHING;
    this.updateHighlight();

    getTranslations(language, () => {
      this.status = FETCHED;
    });
  }

  setFocus(index) {
    this.focusIndex = index;
    this.updateHighlight();
  }

  moveFocus(step) {
    if (!this.isOpen) return;
    this.focusIndex = Math.min(LANGUAGES.length - 1, Math.max(0, this.focusIndex + step));
    this.updateHighlight();
  }

  confirmFocus() {
    if (!this.isOpen || this.justOpened) return;
    this.selectLanguage(LANGUAGES[this.focusIndex]);
  }

  updateHighlight() {
    [this.optionEs, this.optionEn].forEach((option, index) => {
      const language = LANGUAGES[index];
      option.setText((index === this.focusIndex ? "▶ " : "   ") + (language === ES ? "Español" : "English"));
      option.setColor(this.language === language ? SELECTED_COLOR : UNSELECTED_COLOR);
    });
  }

  update() {
    this.justOpened = false;

    if (this.status === FETCHED) {
      this.status = READY;
      this.close();
      if (this.onLanguageChanged) this.onLanguageChanged();
    }
  }
}
