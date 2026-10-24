import Phaser from "phaser";
import { GAME_WIDTH, COLORS } from "../config.js";
import { getLevel, LEVEL_COUNT } from "../data/levels.js";
import { KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";
import ProgressStorage from "../services/ProgressStorage.js";
import { MENU_FONT_SIZE } from "../ui/ScreenLayout.js";
import MenuList from "../ui/MenuList.js";
import { addBackNavigation } from "../ui/IconButton.js";
import { pop } from "../ui/Pop.js";
import { spawnConfetti } from "../ui/Confetti.js";

const WIN_COLOR = "#33dd55";
const LOSE_COLOR = "#dd3333";
const OPTIONS_TOP = 410;
const OPTION_SPACING = 48;
const CONFETTI_COUNT = 40;
const CONFETTI_MAX_DELAY = 800;

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
    // Al ganar caen papelitos, por detrás del texto.
    if (this.won) spawnConfetti(this, { count: CONFETTI_COUNT, maxDelay: CONFETTI_MAX_DELAY });
    const rivalName = getPhrase(this.level.nameKey);

    const title = this.add
      .text(GAME_WIDTH / 2, 145, getPhrase(this.won ? KEYS.GANASTE : KEYS.PERDISTE), {
        fontSize: "48px",
        color: this.won ? WIN_COLOR : LOSE_COLOR,
      })
      .setOrigin(0.5);
    pop(this, title, { from: 0.6, duration: 320 });

    const summaryKey = this.won ? KEYS.LE_GANASTE_A_RIVAL : KEYS.RIVAL_TE_GANO;
    this.add
      .text(GAME_WIDTH / 2, 210, getPhrase(summaryKey).replace("{rival}", rivalName), { fontSize: "20px", color: "#aaaaaa" })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 270, `${this.scoreP1} - ${this.scoreP2}`, { fontSize: "44px", color: COLORS.TEXT })
      .setOrigin(0.5);

    if (unlockedLevelId) {
      this.add
        .text(GAME_WIDTH / 2, 335, getPhrase(KEYS.NIVEL_N_DESBLOQUEADO).replace("{n}", unlockedLevelId), {
          fontSize: "20px",
          color: "#ffdd33",
        })
        .setOrigin(0.5);
    }

    new MenuList(this, { y: OPTIONS_TOP, spacing: OPTION_SPACING, fontSize: MENU_FONT_SIZE, items: this.buildOptions() });
    addBackNavigation(this, () => this.goToLevelSelect());
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
    // Ganarle al Campeón (último nivel) lleva a la pantalla final.
    return [{ labelKey: KEYS.CONTINUAR, action: () => this.scene.start("StoryEndScene") }, toLevelSelect];
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
