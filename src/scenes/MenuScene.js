import Phaser from "phaser";
import { GAME_WIDTH, COLORS, WIN_SCORE_SHORT, WIN_SCORE_LONG } from "../config.js";
import { KEYS } from "../enums/keys.js";
import { getTranslations, getPhrase, getLanguageConfig } from "../services/translations.js";
import LanguagePanel from "../ui/LanguagePanel.js";

const SELECTED_COLOR = "#66ff66";
const UNSELECTED_COLOR = "#888888";

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    this.mode = "1p";
    this.winScore = WIN_SCORE_SHORT;

    getTranslations(getLanguageConfig(), () => this.buildScene());
  }

  buildScene() {
    this.titleText = this.add
      .text(GAME_WIDTH / 2, 70, getPhrase(KEYS.PONG_CON_POWER_UPS), { fontSize: "40px", color: COLORS.TEXT })
      .setOrigin(0.5);

    this.subtitleText = this.add
      .text(GAME_WIDTH / 2, 130, getPhrase(KEYS.ELEGI_UNA_OPCION_DE_CADA_GRUPO_Y_CONFIRMA_CON_ENTER), {
        fontSize: "16px",
        color: "#888888",
      })
      .setOrigin(0.5);

    this.modeOption1p = this.createOption(190, "1: ", KEYS.TEXT_1_JUGADOR_VS_CPU, () => this.setMode("1p"));
    this.modeOption2p = this.createOption(222, "2: ", KEYS.TEXT_2_JUGADORES, () => this.setMode("2p"));

    this.pointsOption5 = this.createOption(272, "5: ", KEYS.PARTIDA_A_5_PUNTOS, () =>
      this.setWinScore(WIN_SCORE_SHORT)
    );
    this.pointsOption10 = this.createOption(304, "0: ", KEYS.PARTIDA_A_10_PUNTOS, () =>
      this.setWinScore(WIN_SCORE_LONG)
    );

    this.controlsHintText = this.add
      .text(GAME_WIDTH / 2, 360, getPhrase(KEYS.JUGADOR_1_W_S_JUGADOR_2_FLECHAS_ARRIBA_ABAJO), {
        fontSize: "16px",
        color: "#888888",
      })
      .setOrigin(0.5);

    this.startText = this.add
      .text(GAME_WIDTH / 2, 440, getPhrase(KEYS.ENTER_EMPEZAR), { fontSize: "22px", color: COLORS.TEXT })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.startGame());

    this.createSettingsButton();

    this.updateOptionStyles();

    this.input.keyboard.on("keydown-ONE", () => this.setMode("1p"));
    this.input.keyboard.on("keydown-TWO", () => this.setMode("2p"));
    this.input.keyboard.on("keydown-FIVE", () => this.setWinScore(WIN_SCORE_SHORT));
    this.input.keyboard.on("keydown-ZERO", () => this.setWinScore(WIN_SCORE_LONG));
    this.input.keyboard.on("keydown-ENTER", () => this.startGame());
  }

  createSettingsButton() {
    this.settingsIcon = this.add
      .text(GAME_WIDTH - 30, 24, "⚙", { fontSize: "26px", color: COLORS.TEXT })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.languagePanel.toggle());

    this.languagePanel = new LanguagePanel(this, () => this.refreshTexts());
  }

  update() {
    this.languagePanel?.update();
  }

  refreshTexts() {
    this.titleText.setText(getPhrase(KEYS.PONG_CON_POWER_UPS));
    this.subtitleText.setText(getPhrase(KEYS.ELEGI_UNA_OPCION_DE_CADA_GRUPO_Y_CONFIRMA_CON_ENTER));
    this.controlsHintText.setText(getPhrase(KEYS.JUGADOR_1_W_S_JUGADOR_2_FLECHAS_ARRIBA_ABAJO));
    this.startText.setText(getPhrase(KEYS.ENTER_EMPEZAR));
    this.updateOptionStyles();
  }

  createOption(y, keyPrefix, labelKey, onClick) {
    const text = this.add
      .text(GAME_WIDTH / 2, y, keyPrefix + getPhrase(labelKey), { fontSize: "22px", color: UNSELECTED_COLOR })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", onClick);

    text.keyPrefix = keyPrefix;
    text.labelKey = labelKey;
    return text;
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
    this.styleOption(this.modeOption1p, this.mode === "1p");
    this.styleOption(this.modeOption2p, this.mode === "2p");
    this.styleOption(this.pointsOption5, this.winScore === WIN_SCORE_SHORT);
    this.styleOption(this.pointsOption10, this.winScore === WIN_SCORE_LONG);
  }

  styleOption(textObject, isSelected) {
    const prefix = isSelected ? "▶ " : "   ";
    textObject.setText(prefix + textObject.keyPrefix + getPhrase(textObject.labelKey));
    textObject.setColor(isSelected ? SELECTED_COLOR : UNSELECTED_COLOR);
  }
}
