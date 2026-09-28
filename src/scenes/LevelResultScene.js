import Phaser from "phaser";
import { GAME_WIDTH, COLORS } from "../config.js";
import { getLevel, LEVEL_COUNT } from "../data/levels.js";
import { KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";
import ProgressStorage from "../services/ProgressStorage.js";

const WIN_COLOR = "#33dd55";
const LOSE_COLOR = "#dd3333";
const SELECTED_COLOR = "#66ff66";
const UNSELECTED_COLOR = "#888888";
const OPTIONS_TOP = 380;
const OPTION_SPACING = 40;

// Resultado de un nivel del Modo Historia. Si el jugador ganó, guarda el
// nivel como superado (y avisa si desbloqueó el siguiente); después ofrece
// seguir, reintentar o volver a la selección de nivel.
export default class LevelResultScene extends Phaser.Scene {
  constructor() {
    super("LevelResultScene");
  }

  init(data) {
    this.level = getLevel(data.levelId);
    this.won = data.won;
    this.scoreP1 = data.scoreP1;
    this.scoreP2 = data.scoreP2;
  }

  create() {
    const unlockedLevelId = this.won ? this.saveProgress() : null;
    const rivalName = getPhrase(this.level.nameKey);

    this.add
      .text(GAME_WIDTH / 2, 120, getPhrase(this.won ? KEYS.GANASTE : KEYS.PERDISTE), {
        fontSize: "48px",
        color: this.won ? WIN_COLOR : LOSE_COLOR,
      })
      .setOrigin(0.5);

    const summaryKey = this.won ? KEYS.LE_GANASTE_A_RIVAL : KEYS.RIVAL_TE_GANO;
    this.add
      .text(GAME_WIDTH / 2, 185, getPhrase(summaryKey).replace("{rival}", rivalName), { fontSize: "20px", color: "#aaaaaa" })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 245, `${this.scoreP1} - ${this.scoreP2}`, { fontSize: "44px", color: COLORS.TEXT })
      .setOrigin(0.5);

    if (unlockedLevelId) {
      this.add
        .text(GAME_WIDTH / 2, 310, getPhrase(KEYS.NIVEL_N_DESBLOQUEADO).replace("{n}", unlockedLevelId), {
          fontSize: "20px",
          color: "#ffdd33",
        })
        .setOrigin(0.5);
    }

    this.options = this.buildOptions().map((option, index) => this.createOption(option, index));
    this.select(0);

    this.add
      .text(GAME_WIDTH / 2, 540, getPhrase(KEYS.FLECHAS_ELEGIR_ENTER_CONFIRMAR), { fontSize: "15px", color: "#888888" })
      .setOrigin(0.5);

    this.input.keyboard.on("keydown-UP", () => this.select(Math.max(0, this.selectedIndex - 1)));
    this.input.keyboard.on("keydown-DOWN", () => this.select(Math.min(this.options.length - 1, this.selectedIndex + 1)));
    this.input.keyboard.on("keydown-ENTER", () => this.options[this.selectedIndex].action());
    this.input.keyboard.on("keydown-ESC", () => this.goToLevelSelect());
  }

  // Devuelve el id del nivel que se desbloqueó con esta victoria, o null si
  // ya estaba desbloqueado (por ejemplo, al repetir un nivel ya superado).
  saveProgress() {
    const progress = new ProgressStorage();
    const nextLevelId = this.level.id + 1;
    const wasUnlocked = progress.isUnlocked(nextLevelId);

    progress.markCompleted(this.level.id);

    return !wasUnlocked && progress.isUnlocked(nextLevelId) ? nextLevelId : null;
  }

  buildOptions() {
    const toLevelSelect = { labelKey: KEYS.SELECCION_DE_NIVEL, action: () => this.goToLevelSelect() };

    if (!this.won) {
      return [{ labelKey: KEYS.REINTENTAR, action: () => this.retry() }, toLevelSelect];
    }
    if (this.level.id < LEVEL_COUNT) {
      return [{ labelKey: KEYS.SIGUIENTE_NIVEL, action: () => this.goToNextLevel() }, toLevelSelect];
    }
    return [toLevelSelect];
  }

  createOption(option, index) {
    const text = this.add
      .text(GAME_WIDTH / 2, OPTIONS_TOP + index * OPTION_SPACING, "", { fontSize: "24px", color: UNSELECTED_COLOR })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => this.select(index))
      .on("pointerdown", () => option.action());

    return { ...option, text };
  }

  select(index) {
    this.selectedIndex = index;
    this.options.forEach((option, i) => {
      const isSelected = i === index;
      option.text.setText((isSelected ? "▶ " : "   ") + getPhrase(option.labelKey));
      option.text.setColor(isSelected ? SELECTED_COLOR : UNSELECTED_COLOR);
    });
  }

  retry() {
    this.scene.start("GameScene", { mode: "story", levelId: this.level.id });
  }

  goToNextLevel() {
    this.scene.start("LevelIntroScene", { levelId: this.level.id + 1 });
  }

  goToLevelSelect() {
    this.scene.start("LevelSelectScene");
  }
}
