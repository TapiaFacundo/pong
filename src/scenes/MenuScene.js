import Phaser from "phaser";
import { GAME_TITLE, GAME_WIDTH, COLORS, WIN_SCORE_SHORT, WIN_SCORE_MEDIUM, WIN_SCORE_LONG } from "../config.js";
import { KEYS } from "../enums/keys.js";
import { getTranslations, getPhrase, getLanguageConfig } from "../services/translations.js";
import LanguagePanel from "../ui/LanguagePanel.js";

const SELECTED_COLOR = "#66ff66";
const UNSELECTED_COLOR = "#888888";
const DISABLED_COLOR = "#444444";

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
    this.add
      .text(GAME_WIDTH / 2, 70, GAME_TITLE, { fontSize: "40px", color: COLORS.TEXT })
      .setOrigin(0.5);

    this.subtitleText = this.add
      .text(GAME_WIDTH / 2, 130, getPhrase(KEYS.ELEGI_UNA_OPCION_DE_CADA_GRUPO_Y_CONFIRMA_CON_ENTER), {
        fontSize: "16px",
        color: "#888888",
      })
      .setOrigin(0.5);

    this.modeOption1p = this.createOption(180, "1: ", KEYS.TEXT_1_JUGADOR_VS_CPU, () => this.setMode("1p"));
    this.modeOption2p = this.createOption(212, "2: ", KEYS.TEXT_2_JUGADORES, () => this.setMode("2p"));
    this.modeOptionStory = this.createOption(244, "3: ", KEYS.MODO_HISTORIA, () => this.setMode("story"));

    this.pointsOption5 = this.createOption(294, "5: ", KEYS.PARTIDA_A_5_PUNTOS, () =>
      this.setWinScore(WIN_SCORE_SHORT)
    );
    this.pointsOption7 = this.createOption(326, "7: ", KEYS.PARTIDA_A_7_PUNTOS, () =>
      this.setWinScore(WIN_SCORE_MEDIUM)
    );
    this.pointsOption10 = this.createOption(358, "0: ", KEYS.PARTIDA_A_10_PUNTOS, () =>
      this.setWinScore(WIN_SCORE_LONG)
    );

    this.controlsHintText = this.add
      .text(GAME_WIDTH / 2, 404, getPhrase(KEYS.JUGADOR_1_W_S_JUGADOR_2_FLECHAS_ARRIBA_ABAJO), {
        fontSize: "16px",
        color: "#888888",
      })
      .setOrigin(0.5);

    this.startText = this.add
      .text(GAME_WIDTH / 2, 454, getPhrase(KEYS.ENTER_EMPEZAR), { fontSize: "22px", color: COLORS.TEXT })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.startGame());

    this.createSettingsButton();

    this.updateOptionStyles();

    this.input.keyboard.on("keydown-ONE", () => this.setMode("1p"));
    this.input.keyboard.on("keydown-TWO", () => this.setMode("2p"));
    this.input.keyboard.on("keydown-THREE", () => this.setMode("story"));
    this.input.keyboard.on("keydown-FIVE", () => this.setWinScore(WIN_SCORE_SHORT));
    this.input.keyboard.on("keydown-SEVEN", () => this.setWinScore(WIN_SCORE_MEDIUM));
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
    if (this.mode === "story") {
      this.scene.start("LevelSelectScene");
    } else if (this.mode === "1p") {
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
    this.styleOption(this.modeOptionStory, this.mode === "story");

    // El Modo Historia siempre se juega a 7 puntos: el puntaje no aplica.
    const pointsDisabled = this.mode === "story";
    this.styleOption(this.pointsOption5, this.winScore === WIN_SCORE_SHORT, pointsDisabled);
    this.styleOption(this.pointsOption7, this.winScore === WIN_SCORE_MEDIUM, pointsDisabled);
    this.styleOption(this.pointsOption10, this.winScore === WIN_SCORE_LONG, pointsDisabled);
  }

  styleOption(textObject, isSelected, isDisabled = false) {
    const showSelected = isSelected && !isDisabled;
    const prefix = showSelected ? "▶ " : "   ";
    textObject.setText(prefix + textObject.keyPrefix + getPhrase(textObject.labelKey));
    textObject.setColor(isDisabled ? DISABLED_COLOR : showSelected ? SELECTED_COLOR : UNSELECTED_COLOR);
  }
}
