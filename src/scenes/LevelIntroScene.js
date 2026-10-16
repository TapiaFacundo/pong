import Phaser from "phaser";
import { GAME_WIDTH, COLORS } from "../config.js";
import { getLevel } from "../data/levels.js";
import { KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";
import MenuList from "../ui/MenuList.js";
import { addBackNavigation } from "../ui/IconButton.js";

const BOSS_COLOR = "#b69cff";

// Tarjeta de presentación del rival antes de cada nivel del Modo Historia:
// número de nivel, nombre, habilidad y su frase.
export default class LevelIntroScene extends Phaser.Scene {
  constructor() {
    super("LevelIntroScene");
  }

  init(data) {
    this.level = getLevel(data.levelId);
  }

  create() {
    const level = this.level;
    const levelLabel = getPhrase(KEYS.NIVEL_N).replace("{n}", level.id);
    const bossLabel = level.boss ? getPhrase(level.boss === "final" ? KEYS.JEFE_FINAL : KEYS.JEFE) : null;

    this.add
      .text(GAME_WIDTH / 2, 140, bossLabel ? `${levelLabel} · ${bossLabel}` : levelLabel, {
        fontSize: "20px",
        color: bossLabel ? BOSS_COLOR : "#888888",
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 200, getPhrase(level.nameKey), { fontSize: "48px", color: COLORS.TEXT })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 268, getPhrase(level.abilityKey), { fontSize: "18px", color: "#aaaaaa" })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 335, `“${getPhrase(level.quoteKey)}”`, {
        fontSize: "20px",
        fontStyle: "italic",
        color: COLORS.TEXT,
        align: "center",
        wordWrap: { width: GAME_WIDTH - 120 },
      })
      .setOrigin(0.5);

    new MenuList(this, {
      y: 450,
      fontSize: "28px",
      items: [{ labelKey: KEYS.JUGAR, action: () => this.startLevel() }],
    });

    addBackNavigation(this, () => this.scene.start("LevelSelectScene"));
  }

  // Antes del nivel 1 se muestra el tutorial, que después arranca la partida
  // (y si se vuelve atrás desde ahí, regresa a esta presentación).
  startLevel() {
    const gameData = { mode: "story", levelId: this.level.id };

    if (this.level.id === 1) {
      this.scene.start("TutorialScene", {
        next: gameData,
        returnTo: "LevelIntroScene",
        returnData: { levelId: this.level.id },
      });
    } else {
      this.scene.start("GameScene", gameData);
    }
  }
}
