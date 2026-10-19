import Phaser from "phaser";
import { getPhrase } from "../services/translations.js";

const SELECTED_COLOR = "#66ff66";
const LABEL_COLOR = "#888888";
const VALUE_COLOR = "#ffffff";
const CHANGED_VALUE_COLOR = "#ffdd33";
const ARROW_COLOR = "#555555";

// Columnas: nombre (alineado a la derecha), ◀, valor y ▶. El conjunto queda
// centrado en la pantalla.
const LABEL_RIGHT_X = 368;
const LEFT_ARROW_X = 418;
const VALUE_X = 548;
const RIGHT_ARROW_X = 678;
// Zona de toque de cada flecha, más grande que el símbolo (para el dedo).
const ARROW_HIT_WIDTH = 50;
const ARROW_HIT_HEIGHT = 34;

// Fila con un nombre y un carrusel de opciones: "Cancha   ◀ Normal ▶". Las
// flechas pasan a la opción anterior o siguiente (en ronda: después de la
// última vuelve a la primera). Tocar el nombre o el valor pasa a la siguiente.
// Si la opción elegida no es la de por defecto, el valor se ve en amarillo.
//
// La maneja MenuList (items con `options`): ella decide cuál fila está
// marcada y le pasa las teclas izquierda / derecha.
//
// options: [{ labelKey } o { label }]; onChange(index) avisa cada cambio.
export default class CarouselRow {
  constructor(scene, { y, labelKey, options, index, defaultIndex, fontSize, onChange, onHover }) {
    this.options = options;
    this.index = index;
    this.defaultIndex = defaultIndex;
    this.labelKey = labelKey;
    this.onChange = onChange;
    this.selected = false;

    const style = { fontSize, color: LABEL_COLOR };
    this.label = scene.add.text(LABEL_RIGHT_X, y, "", style).setOrigin(1, 0.5);
    this.value = scene.add.text(VALUE_X, y, "", style).setOrigin(0.5);
    this.leftArrow = this.createArrow(scene, LEFT_ARROW_X, y, "◀", fontSize, -1);
    this.rightArrow = this.createArrow(scene, RIGHT_ARROW_X, y, "▶", fontSize, 1);

    for (const text of [this.label, this.value]) {
      text
        .setInteractive({ useHandCursor: true })
        .on("pointerover", onHover)
        .on("pointerdown", () => this.step(1));
    }
    for (const arrow of [this.leftArrow, this.rightArrow]) arrow.on("pointerover", onHover);

    this.refresh();
  }

  createArrow(scene, x, y, symbol, fontSize, direction) {
    const arrow = scene.add.text(x, y, symbol, { fontSize, color: ARROW_COLOR }).setOrigin(0.5);
    arrow
      .setInteractive(
        new Phaser.Geom.Rectangle(
          arrow.width / 2 - ARROW_HIT_WIDTH / 2,
          arrow.height / 2 - ARROW_HIT_HEIGHT / 2,
          ARROW_HIT_WIDTH,
          ARROW_HIT_HEIGHT
        ),
        Phaser.Geom.Rectangle.Contains
      )
      .on("pointerdown", () => this.step(direction));
    arrow.input.cursor = "pointer";
    return arrow;
  }

  step(direction) {
    this.index = (this.index + direction + this.options.length) % this.options.length;
    this.refresh();
    this.onChange(this.index);
  }

  setIndex(index) {
    this.index = index;
    this.refresh();
  }

  setSelected(selected) {
    this.selected = selected;
    this.refresh();
  }

  refresh() {
    const option = this.options[this.index];
    const changed = this.index !== this.defaultIndex;

    this.label.setText(getPhrase(this.labelKey));
    this.value.setText(option.labelKey ? getPhrase(option.labelKey) : option.label);

    this.label.setColor(this.selected ? SELECTED_COLOR : LABEL_COLOR);
    this.value.setColor(this.selected ? SELECTED_COLOR : changed ? CHANGED_VALUE_COLOR : VALUE_COLOR);
    this.leftArrow.setColor(this.selected ? SELECTED_COLOR : ARROW_COLOR);
    this.rightArrow.setColor(this.selected ? SELECTED_COLOR : ARROW_COLOR);
  }
}
