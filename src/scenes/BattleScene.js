import Phaser from "phaser";
import { KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";
import MenuList from "../ui/MenuList.js";
import { addBackNavigation } from "../ui/IconButton.js";
import { addTitle, menuTop, MENU_SPACING, MENU_FONT_SIZE } from "../ui/ScreenLayout.js";

// Batalla (partida casual): contra la CPU o entre dos jugadores.
// 1 jugador sigue a la dificultad; 2 jugadores, directo al puntaje.
export default class BattleScene extends Phaser.Scene {
  constructor() {
    super("BattleScene");
  }

  // data.mode: la opción que queda marcada al volver desde el puntaje.
  init(data) {
    this.initialIndex = data?.mode === "2p" ? 1 : 0;
  }

  create() {
    addTitle(this, getPhrase(KEYS.BATALLA));

    new MenuList(this, {
      y: menuTop(2),
      spacing: MENU_SPACING,
      fontSize: MENU_FONT_SIZE,
      initialIndex: this.initialIndex,
      items: [
        { labelKey: KEYS.TEXT_1_JUGADOR, action: () => this.scene.start("DifficultyScene") },
        { labelKey: KEYS.TEXT_2_JUGADORES, action: () => this.scene.start("PointsScene", { mode: "2p" }) },
      ],
    });

    addBackNavigation(this, () => this.scene.start("MenuScene"));
  }
}
