import { GAME_WIDTH } from "../config.js";
import { getPhrase } from "../services/translations.js";
import CarouselRow from "./CarouselRow.js";

const SELECTED_COLOR = "#66ff66";
const UNSELECTED_COLOR = "#888888";
// Separación entre la marca "▶" y el texto de la opción marcada.
const MARKER_GAP = 12;

// Lista vertical de opciones que se usa en todos los menús. Se navega con
// W / S o las flechas arriba / abajo y se confirma con Enter; con el mouse,
// pasar por encima marca la opción y el clic la confirma. La opción marcada
// se ve en verde con "▶" adelante. La marca es un texto aparte, a la izquierda:
// así cada opción queda centrada igual, esté marcada o no.
//
// items: [{ labelKey, action }] (labelKey es una clave de texto; también se
// puede pasar `label` con un texto que no se traduce).
// Un item también puede ser un carrusel de opciones (ver CarouselRow):
// { labelKey, options, index, defaultIndex, onChange }. En esa fila, A / D o
// las flechas izquierda / derecha (y Enter) cambian la opción.
// Cualquier item puede llevar `gapBefore`: espacio extra (px) antes de él.
// topIcons: íconos de las esquinas de arriba (IconButton) a los que se llega
// con el teclado subiendo desde la primera opción; entre ellos se pasa con
// A / D o las flechas izquierda / derecha, y se vuelve a la lista bajando.
export default class MenuList {
  constructor(scene, { items, x = GAME_WIDTH / 2, y, spacing = 44, fontSize = "26px", initialIndex = 0, topIcons = [] }) {
    this.scene = scene;
    this.enabled = true;
    this.topIcons = topIcons;
    this.iconIndex = null; // null: el foco está en la lista

    this.marker = scene.add.text(0, 0, "▶", { fontSize, color: SELECTED_COLOR }).setOrigin(1, 0.5);

    let gaps = 0;
    this.items = items.map((item, index) => {
      gaps += item.gapBefore ?? 0;
      const itemY = y + index * spacing + gaps;

      if (item.options) {
        const row = new CarouselRow(scene, {
          ...item,
          y: itemY,
          fontSize,
          onHover: () => this.enabled && this.select(index),
          onChange: (optionIndex) => {
            this.select(index);
            item.onChange(optionIndex);
          },
        });
        return { ...item, row };
      }

      const text = scene.add
        .text(x, itemY, "", { fontSize, color: UNSELECTED_COLOR })
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
    ["A", "LEFT"].forEach((key) => keyboard.on(`keydown-${key}`, () => this.moveSideways(-1)));
    ["D", "RIGHT"].forEach((key) => keyboard.on(`keydown-${key}`, () => this.moveSideways(1)));
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

  // Izquierda / derecha: pasa de un ícono de arriba a otro, o cambia la
  // opción del carrusel marcado.
  moveSideways(step) {
    if (!this.enabled) return;

    if (this.iconIndex !== null) {
      this.focusIcon(Math.min(this.topIcons.length - 1, Math.max(0, this.iconIndex + step)));
    } else {
      this.items[this.selectedIndex].row?.step(step);
    }
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

  // En un carrusel, confirmar pasa a la opción siguiente.
  activate(index) {
    this.select(index);
    const item = this.items[index];
    if (item.row) item.row.step(1);
    else item.action();
  }

  // Vuelve a escribir los textos (por ejemplo, después de cambiar de idioma).
  refreshTexts() {
    this.items.forEach((item, index) => {
      const isSelected = this.iconIndex === null && index === this.selectedIndex;
      if (item.row) {
        item.row.setSelected(isSelected);
        return;
      }

      item.text.setText(item.labelKey ? getPhrase(item.labelKey) : item.label);
      item.text.setColor(isSelected ? SELECTED_COLOR : UNSELECTED_COLOR);
    });
    this.placeMarker();
  }

  // La marca va a la izquierda de la opción marcada (en los carruseles no:
  // ahí lo marcado se ve en verde).
  placeMarker() {
    const item = this.iconIndex === null ? this.items[this.selectedIndex] : null;
    const text = item?.text;
    this.marker.setVisible(!!text);
    if (text) this.marker.setPosition(text.x - text.displayWidth / 2 - MARKER_GAP, text.y);
  }

  // Mientras hay un panel encima (por ejemplo el de idioma), la lista no responde.
  setEnabled(enabled) {
    this.enabled = enabled;
  }
}
