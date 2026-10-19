import Phaser from "phaser";
import { WIN_SCORE_SHORT, WIN_SCORE_MEDIUM, WIN_SCORE_LONG } from "../config.js";
import { KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";
import { buildMutatorSetup, countActiveMutators } from "../data/mutators.js";
import { loadMutatorSelection } from "../services/MutatorStorage.js";
import MenuList from "../ui/MenuList.js";
import { addBackNavigation } from "../ui/IconButton.js";
import { addTitle, menuTop, MENU_SPACING, MENU_FONT_SIZE } from "../ui/ScreenLayout.js";

const WIN_SCORES = [WIN_SCORE_SHORT, WIN_SCORE_MEDIUM, WIN_SCORE_LONG];

// A cuántos puntos se juega la Batalla. Último paso antes de la partida.
// Debajo, "Modificadores" lleva a cambiar las reglas de la partida (muestra
// cuántos hay activos).
export default class PointsScene extends Phaser.Scene {
  constructor() {
    super("PointsScene");
  }

  // data: { mode: "1p" | "2p", difficulty } (difficulty solo en 1 jugador).
  // Al volver de los modificadores trae también `selection` (los elegidos) y
  // `focusMutators` (dejar marcada esa opción en vez del primer puntaje).
  init(data) {
    this.gameData = { mode: data.mode, difficulty: data.difficulty };
    this.selection = data.selection ?? loadMutatorSelection();
    this.initialIndex = data.focusMutators ? WIN_SCORES.length : 0;
  }

  create() {
    addTitle(this, getPhrase(KEYS.PUNTOS));

    const activeMutators = countActiveMutators(this.selection);
    const mutatorsLabel =
      activeMutators > 0
        ? getPhrase(KEYS.MODIFICADORES_N).replace("{n}", activeMutators)
        : getPhrase(KEYS.MODIFICADORES);

    new MenuList(this, {
      y: menuTop(WIN_SCORES.length + 1) - 8,
      spacing: MENU_SPACING,
      fontSize: MENU_FONT_SIZE,
      initialIndex: this.initialIndex,
      items: [
        ...WIN_SCORES.map((winScore) => ({
          label: getPhrase(KEYS.N_PUNTOS).replace("{n}", winScore),
          action: () => this.startMatch(winScore),
        })),
        {
          label: mutatorsLabel,
          gapBefore: 16,
          action: () => this.scene.start("MutatorsScene", { ...this.gameData, selection: this.selection }),
        },
      ],
    });

    // Vuelve a la dificultad (1 jugador) o a la elección de jugadores (2 jugadores).
    addBackNavigation(this, () =>
      this.gameData.mode === "1p"
        ? this.scene.start("DifficultyScene", { difficulty: this.gameData.difficulty })
        : this.scene.start("BattleScene", { mode: "2p" })
    );
  }

  startMatch(winScore) {
    this.scene.start("GameScene", { ...this.gameData, winScore, mutators: buildMutatorSetup(this.selection) });
  }
}
