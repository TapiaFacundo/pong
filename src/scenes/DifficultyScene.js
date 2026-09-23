import Phaser from "phaser";
import { GAME_WIDTH, COLORS, WIN_SCORE_SHORT } from "../config.js";
import { KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";

const SELECTED_COLOR = "#66ff66";
const UNSELECTED_COLOR = "#888888";

const DIFFICULTIES = [
  { key: "easy", prefix: "1: ", labelKey: KEYS.FACIL },
  { key: "normal", prefix: "2: ", labelKey: KEYS.NORMAL },
  { key: "hard", prefix: "3: ", labelKey: KEYS.DIFICIL },
];

export default class DifficultyScene extends Phaser.Scene {
  constructor() {
    super("DifficultyScene");
  }

  init(data) {
    this.winScore = data.winScore ?? WIN_SCORE_SHORT;
  }

  create() {
    this.difficulty = "normal";

    this.add
      .text(GAME_WIDTH / 2, 120, getPhrase(KEYS.ELEGI_LA_DIFICULTAD_DE_LA_CPU), { fontSize: "30px", color: COLORS.TEXT })
      .setOrigin(0.5);

    this.options = DIFFICULTIES.map((difficulty, index) =>
      this.createOption(220 + index * 44, difficulty)
    );

    this.add
      .text(GAME_WIDTH / 2, 420, getPhrase(KEYS.ENTER_EMPEZAR), { fontSize: "22px", color: COLORS.TEXT })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.startGame());

    this.updateOptionStyles();

    this.input.keyboard.on("keydown-ONE", () => this.setDifficulty("easy"));
    this.input.keyboard.on("keydown-TWO", () => this.setDifficulty("normal"));
    this.input.keyboard.on("keydown-THREE", () => this.setDifficulty("hard"));
    this.input.keyboard.on("keydown-ENTER", () => this.startGame());
  }

  createOption(y, difficulty) {
    const text = this.add
      .text(GAME_WIDTH / 2, y, difficulty.prefix + getPhrase(difficulty.labelKey), {
        fontSize: "24px",
        color: UNSELECTED_COLOR,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.setDifficulty(difficulty.key));

    text.difficultyKey = difficulty.key;
    text.baseDifficulty = difficulty;
    return text;
  }

  setDifficulty(difficulty) {
    this.difficulty = difficulty;
    this.updateOptionStyles();
  }

  updateOptionStyles() {
    this.options.forEach((option) => {
      const isSelected = option.difficultyKey === this.difficulty;
      const prefix = isSelected ? "▶ " : "   ";
      option.setText(prefix + option.baseDifficulty.prefix + getPhrase(option.baseDifficulty.labelKey));
      option.setColor(isSelected ? SELECTED_COLOR : UNSELECTED_COLOR);
    });
  }

  startGame() {
    this.scene.start("TutorialScene", { mode: "1p", winScore: this.winScore, difficulty: this.difficulty });
  }
}
