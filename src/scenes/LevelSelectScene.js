import Phaser from "phaser";
import { GAME_WIDTH, COLORS } from "../config.js";
import { LEVELS } from "../data/levels.js";
import { KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";
import ProgressStorage from "../services/ProgressStorage.js";
import LevelCell, { LEVEL_CELL_WIDTH, LEVEL_CELL_HEIGHT } from "../ui/LevelCell.js";
import { addBackNavigation } from "../ui/IconButton.js";
import { addTitle } from "../ui/ScreenLayout.js";

const COLUMNS = 5;
const CELL_GAP = 20;
const GRID_TOP = 200;

// Selección de nivel del Modo Historia: los 10 niveles en una grilla de 5 × 2.
// Se puede recorrer todos (los bloqueados muestran cómo desbloquearlos), pero
// solo se juegan los desbloqueados.
export default class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super("LevelSelectScene");
  }

  create() {
    this.progress = new ProgressStorage();

    addTitle(this, getPhrase(KEYS.MODO_HISTORIA));

    this.cells = LEVELS.map((level, index) => this.createCell(level, index));

    this.infoTitle = this.add.text(GAME_WIDTH / 2, 460, "", { fontSize: "20px", color: COLORS.TEXT }).setOrigin(0.5);
    this.infoDetail = this.add.text(GAME_WIDTH / 2, 490, "", { fontSize: "15px", color: "#888888" }).setOrigin(0.5);

    this.select(this.progress.highestUnlocked - 1);

    const keyboard = this.input.keyboard;
    ["A", "LEFT"].forEach((key) => keyboard.on(`keydown-${key}`, () => this.moveCursor(-1, 0)));
    ["D", "RIGHT"].forEach((key) => keyboard.on(`keydown-${key}`, () => this.moveCursor(1, 0)));
    ["W", "UP"].forEach((key) => keyboard.on(`keydown-${key}`, () => this.moveCursor(0, -1)));
    ["S", "DOWN"].forEach((key) => keyboard.on(`keydown-${key}`, () => this.moveCursor(0, 1)));
    keyboard.on("keydown-ENTER", () => this.playSelected());

    addBackNavigation(this, () => this.scene.start("MenuScene", { mode: "story" }));
  }

  createCell(level, index) {
    const gridWidth = COLUMNS * LEVEL_CELL_WIDTH + (COLUMNS - 1) * CELL_GAP;
    const column = index % COLUMNS;
    const row = Math.floor(index / COLUMNS);
    const x = (GAME_WIDTH - gridWidth) / 2 + LEVEL_CELL_WIDTH / 2 + column * (LEVEL_CELL_WIDTH + CELL_GAP);
    const y = GRID_TOP + row * (LEVEL_CELL_HEIGHT + CELL_GAP);

    const cell = new LevelCell(this, x, y, level, {
      unlocked: this.progress.isUnlocked(level.id),
      completed: this.progress.isCompleted(level.id),
    });

    cell.box.on("pointerover", () => this.select(index));
    cell.box.on("pointerdown", () => {
      this.select(index);
      this.playSelected();
    });

    return cell;
  }

  moveCursor(dx, dy) {
    const column = (this.selectedIndex % COLUMNS) + dx;
    const row = Math.floor(this.selectedIndex / COLUMNS) + dy;
    const rows = Math.ceil(this.cells.length / COLUMNS);

    if (column < 0 || column >= COLUMNS || row < 0 || row >= rows) return;
    this.select(row * COLUMNS + column);
  }

  select(index) {
    this.selectedIndex = index;
    this.cells.forEach((cell, i) => cell.setSelected(i === index));

    const cell = this.cells[index];
    if (cell.unlocked) {
      this.infoTitle.setText(getPhrase(cell.level.nameKey));
      this.infoDetail.setText(getPhrase(cell.level.abilityKey));
    } else {
      this.infoTitle.setText(getPhrase(KEYS.BLOQUEADO));
      this.infoDetail.setText(getPhrase(KEYS.GANA_EL_NIVEL_N_PARA_DESBLOQUEARLO).replace("{n}", cell.level.id - 1));
    }
  }

  playSelected() {
    const cell = this.cells[this.selectedIndex];
    if (!cell.unlocked) return;

    this.scene.start("LevelIntroScene", { levelId: cell.level.id });
  }
}
