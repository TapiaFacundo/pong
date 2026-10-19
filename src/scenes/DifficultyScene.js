import Phaser from "phaser";
import { KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";
import MenuList from "../ui/MenuList.js";
import { addBackNavigation } from "../ui/IconButton.js";
import { addTitle, menuTop, MENU_SPACING, MENU_FONT_SIZE } from "../ui/ScreenLayout.js";

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
    addTitle(this, getPhrase(KEYS.DIFICULTAD));

    new MenuList(this, {
      y: menuTop(DIFFICULTIES.length),
      spacing: MENU_SPACING,
      fontSize: MENU_FONT_SIZE,
      initialIndex: this.initialIndex,
      items: DIFFICULTIES.map(({ key, labelKey }) => ({
        labelKey,
        action: () => this.scene.start("PointsScene", { mode: "1p", difficulty: key }),
      })),
    });

    addBackNavigation(this, () => this.scene.start("BattleScene"));
  }
}
