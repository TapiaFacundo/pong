import Phaser from "phaser";
import { GAME_WIDTH, COLORS } from "../config.js";
import { KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";
import { MUTATORS, defaultMutatorSelection } from "../data/mutators.js";
import { saveMutatorSelection } from "../services/MutatorStorage.js";
import MenuList from "../ui/MenuList.js";
import { addBackNavigation } from "../ui/IconButton.js";

const ROWS_TOP = 104;
const ROW_SPACING = 32;
const BUTTONS_GAP = 22;

// Modificadores de la Batalla: una fila con carrusel por modificador y, al
// final, "Restablecer" (deja todo como por defecto, sin guardar todavía) y
// "Guardar" (confirma y vuelve a la elección de puntos). Volver (Esc o ←)
// descarta los cambios.
export default class MutatorsScene extends Phaser.Scene {
  constructor() {
    super("MutatorsScene");
  }

  // data: { mode, difficulty, selection } (la partida en preparación y los
  // modificadores elegidos hasta ahora).
  init(data) {
    this.gameData = { mode: data.mode, difficulty: data.difficulty };
    this.savedSelection = data.selection;
    this.selection = { ...data.selection };
  }

  create() {
    this.add
      .text(GAME_WIDTH / 2, 50, getPhrase(KEYS.MODIFICADORES), { fontSize: "32px", fontStyle: "bold", color: COLORS.TEXT })
      .setOrigin(0.5);

    this.menu = new MenuList(this, {
      y: ROWS_TOP,
      spacing: ROW_SPACING,
      fontSize: "19px",
      items: [
        ...MUTATORS.map((mutator) => ({
          labelKey: mutator.labelKey,
          options: mutator.options,
          index: this.optionIndex(mutator, this.selection[mutator.id]),
          defaultIndex: this.optionIndex(mutator, mutator.defaultOption),
          onChange: (index) => (this.selection[mutator.id] = mutator.options[index].id),
        })),
        { labelKey: KEYS.RESTABLECER, action: () => this.resetAll(), gapBefore: BUTTONS_GAP },
        { labelKey: KEYS.GUARDAR, action: () => this.save() },
      ],
    });

    addBackNavigation(this, () =>
      this.scene.start("PointsScene", { ...this.gameData, selection: this.savedSelection, focusMutators: true })
    );
  }

  optionIndex(mutator, optionId) {
    return Math.max(0, mutator.options.findIndex(({ id }) => id === optionId));
  }

  resetAll() {
    this.selection = defaultMutatorSelection();
    MUTATORS.forEach((mutator, index) => {
      this.menu.items[index].row.setIndex(this.optionIndex(mutator, mutator.defaultOption));
    });
  }

  save() {
    saveMutatorSelection(this.selection);
    this.scene.start("PointsScene", { ...this.gameData, selection: this.selection });
  }
}
