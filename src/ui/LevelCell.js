import { KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";

export const LEVEL_CELL_WIDTH = 120;
export const LEVEL_CELL_HEIGHT = 110;

const COLORS = {
  fill: 0x111111,
  lockedFill: 0x0a0a0a,
  border: 0xaaaaaa,
  lockedBorder: 0x333333,
  completedBorder: 0x33dd55,
  cursor: 0xffdd33,
  number: "#ffffff",
  lockedNumber: "#444444",
  name: "#aaaaaa",
  boss: "#b69cff",
  check: "#33dd55",
  lock: 0x555555,
};

// Una casilla de la grilla de selección de nivel: número, nombre del rival,
// marca de jefe, marca de superado o candado si está bloqueado, y el borde
// amarillo cuando es la casilla elegida.
export default class LevelCell {
  constructor(scene, x, y, level, { unlocked, completed }) {
    this.level = level;
    this.unlocked = unlocked;
    this.completed = completed;

    this.box = scene.add
      .rectangle(x, y, LEVEL_CELL_WIDTH, LEVEL_CELL_HEIGHT, unlocked ? COLORS.fill : COLORS.lockedFill)
      .setStrokeStyle(1, this.baseBorderColor())
      .setInteractive({ useHandCursor: unlocked });

    scene.add
      .text(x, y - 22, String(level.id), { fontSize: "34px", color: unlocked ? COLORS.number : COLORS.lockedNumber })
      .setOrigin(0.5);

    if (unlocked) {
      scene.add.text(x, y + 16, getPhrase(level.nameKey), { fontSize: "14px", color: COLORS.name }).setOrigin(0.5);
      if (level.boss) {
        const bossKey = level.boss === "final" ? KEYS.JEFE_FINAL : KEYS.JEFE;
        scene.add.text(x, y + 36, getPhrase(bossKey), { fontSize: "12px", color: COLORS.boss }).setOrigin(0.5);
      }
    } else {
      this.drawLock(scene, x, y + 22);
    }

    if (completed) {
      scene.add
        .text(x + LEVEL_CELL_WIDTH / 2 - 14, y - LEVEL_CELL_HEIGHT / 2 + 14, "✓", { fontSize: "18px", color: COLORS.check })
        .setOrigin(0.5);
    }
  }

  baseBorderColor() {
    if (!this.unlocked) return COLORS.lockedBorder;
    return this.completed ? COLORS.completedBorder : COLORS.border;
  }

  drawLock(scene, x, y) {
    const graphics = scene.add.graphics();
    graphics.lineStyle(3, COLORS.lock, 1);
    graphics.beginPath();
    graphics.arc(x, y - 6, 7, Math.PI, 0);
    graphics.strokePath();
    graphics.fillStyle(COLORS.lock, 1);
    graphics.fillRect(x - 11, y - 6, 22, 16);
  }

  setSelected(selected) {
    if (selected) {
      this.box.setStrokeStyle(3, COLORS.cursor);
    } else {
      this.box.setStrokeStyle(1, this.baseBorderColor());
    }
  }
}
