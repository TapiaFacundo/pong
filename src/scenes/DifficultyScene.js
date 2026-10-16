import Phaser from "phaser";
import { GAME_WIDTH, COLORS } from "../config.js";
import { KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";
import MenuList from "../ui/MenuList.js";
import { addBackNavigation } from "../ui/IconButton.js";

const DIFFICULTIES = [
  { key: "easy", labelKey: KEYS.FACIL },
  { key: "normal", labelKey: KEYS.NORMAL },
  { key: "hard", labelKey: KEYS.DIFICIL },
  { key: "impossible", labelKey: KEYS.IMPOSIBLE },
];
const DEFAULT_INDEX = 1; // Normal

// Dificultad de la CPU (Batalla de 1 jugador). Después sigue al puntaje.
export default class DifficultyScene extends Phaser.Scene {
  constructor() {
    super("DifficultyScene");
  }

  // data.difficulty: la que queda marcada al volver desde el puntaje.
  init(data) {
    const index = DIFFICULTIES.findIndex(({ key }) => key === data?.difficulty);
    this.initialIndex = index >= 0 ? index : DEFAULT_INDEX;
  }

  create() {
    this.add.text(GAME_WIDTH / 2, 120, getPhrase(KEYS.DIFICULTAD), { fontSize: "36px", color: COLORS.TEXT }).setOrigin(0.5);

    new MenuList(this, {
      y: 240,
      spacing: 50,
      initialIndex: this.initialIndex,
      items: DIFFICULTIES.map(({ key, labelKey }) => ({
        labelKey,
        action: () => this.scene.start("PointsScene", { mode: "1p", difficulty: key }),
      })),
    });

    addBackNavigation(this, () => this.scene.start("BattleScene"));
  }
}
