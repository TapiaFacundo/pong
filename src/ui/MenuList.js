import { GAME_WIDTH } from "../config.js";
import { getPhrase } from "../services/translations.js";

const SELECTED_COLOR = "#66ff66";
const UNSELECTED_COLOR = "#888888";

// Lista vertical de opciones que se usa en todos los menús. Se navega con
// W / S o las flechas arriba / abajo y se confirma con Enter; con el mouse,
// pasar por encima marca la opción y el clic la confirma. La opción marcada
// se ve en verde con "▶" adelante.
//
// items: [{ labelKey, action }] (labelKey es una clave de texto; también se
// puede pasar `label` con un texto que no se traduce).
// topIcons: íconos de las esquinas de arriba (IconButton) a los que se llega
// con el teclado subiendo desde la primera opción; entre ellos se pasa con
// A / D o las flechas izquierda / derecha, y se vuelve a la lista bajando.
export default class MenuList {
  constructor(scene, { items, x = GAME_WIDTH / 2, y, spacing = 44, fontSize = "26px", initialIndex = 0, topIcons = [] }) {
    this.scene = scene;
    this.enabled = true;
    this.topIcons = topIcons;
    this.iconIndex = null; // null: el foco está en la lista

    this.items = items.map((item, index) => {
      const text = scene.add
        .text(x, y + index * spacing, "", { fontSize, color: UNSELECTED_COLOR })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on("pointerover", () => this.enabled && this.select(index))
        .on("pointerdown", () => this.enabled && this.activate(index));
      return { ...item, text };
    });

    this.select(initialIndex);

    const keyboard = scene.input.keyboard;
    ["W", "UP"].forEach((key) => keyboard.on(`keydown-${key}`, () => this.moveUp()));
    ["S", "DOWN"].forEach((key) => keyboard.on(`keydown-${key}`, () => this.moveDown()));
    ["A", "LEFT"].forEach((key) => keyboard.on(`keydown-${key}`, () => this.moveIcon(-1)));
    ["D", "RIGHT"].forEach((key) => keyboard.on(`keydown-${key}`, () => this.moveIcon(1)));
    keyboard.on("keydown-ENTER", () => this.confirm());
  }

  moveUp() {
    if (!this.enabled || this.iconIndex !== null) return;

    if (this.selectedIndex === 0 && this.topIcons.length > 0) {
      this.focusIcon(0);
    } else {
      this.move(-1);
    }
  }

  moveDown() {
    if (!this.enabled) return;

    if (this.iconIndex !== null) {
      this.focusIcon(null);
    } else {
      this.move(1);
    }
  }

  moveIcon(step) {
    if (!this.enabled || this.iconIndex === null) return;
    this.focusIcon(Math.min(this.topIcons.length - 1, Math.max(0, this.iconIndex + step)));
  }

  confirm() {
    if (!this.enabled) return;

    if (this.iconIndex !== null) {
      this.topIcons[this.iconIndex].activate();
    } else {
      this.activate(this.selectedIndex);
    }
  }

  move(step) {
    this.select(Math.min(this.items.length - 1, Math.max(0, this.selectedIndex + step)));
  }

  // index null devuelve el foco a la lista.
  focusIcon(index) {
    this.iconIndex = index;
    this.topIcons.forEach((icon, i) => icon.setFocused(i === index));
    this.refreshTexts();
  }

  select(index) {
    this.selectedIndex = index;
    if (this.iconIndex !== null) {
      this.focusIcon(null);
    } else {
      this.refreshTexts();
    }
  }

  activate(index) {
    this.select(index);
    this.items[index].action();
  }

  // Vuelve a escribir los textos (por ejemplo, después de cambiar de idioma).
  refreshTexts() {
    this.items.forEach((item, index) => {
      const isSelected = this.iconIndex === null && index === this.selectedIndex;
      const label = item.labelKey ? getPhrase(item.labelKey) : item.label;
      item.text.setText((isSelected ? "▶ " : "   ") + label);
      item.text.setColor(isSelected ? SELECTED_COLOR : UNSELECTED_COLOR);
    });
  }

  // Mientras hay un panel encima (por ejemplo el de idioma), la lista no responde.
  setEnabled(enabled) {
    this.enabled = enabled;
  }
}
