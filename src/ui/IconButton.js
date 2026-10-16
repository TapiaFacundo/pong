import { COLORS } from "../config.js";

const ICON_SIZE = 34;
const HIGHLIGHT_COLOR = "#66ff66";
const CIRCLE_COLOR = 0xffffff;
const CIRCLE_HIGHLIGHT_COLOR = 0x66ff66;

// Ícono clicable de una esquina de la pantalla: "←" (volver), "?" (cómo
// jugar) o "⚙" (idioma). Con `circle` se dibuja encerrado en un círculo.
// Se resalta en verde al pasar el mouse o cuando tiene el foco del teclado
// (ver `topIcons` en MenuList).
export default class IconButton {
  constructor(scene, x, y, symbol, onClick, { circle = false, fontSize = "24px" } = {}) {
    this.onClick = onClick;
    this.hovered = false;
    this.focused = false;

    this.text = scene.add
      .text(x, y, symbol, { fontSize, color: COLORS.TEXT })
      .setOrigin(0.5)
      .setDepth(30)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => this.setHovered(true))
      .on("pointerout", () => this.setHovered(false))
      .on("pointerdown", () => this.activate());

    if (circle) {
      this.circle = scene.add.circle(x, y, ICON_SIZE / 2).setStrokeStyle(2, CIRCLE_COLOR).setDepth(30);
    }
  }

  activate() {
    this.onClick();
  }

  setHovered(hovered) {
    this.hovered = hovered;
    this.refreshColor();
  }

  setFocused(focused) {
    this.focused = focused;
    this.refreshColor();
  }

  refreshColor() {
    const highlighted = this.hovered || this.focused;
    this.text.setColor(highlighted ? HIGHLIGHT_COLOR : COLORS.TEXT);
    this.circle?.setStrokeStyle(2, highlighted ? CIRCLE_HIGHLIGHT_COLOR : CIRCLE_COLOR);
  }
}

// "Volver" estándar: ícono "←" arriba a la izquierda y la tecla Esc.
export function addBackNavigation(scene, onBack) {
  new IconButton(scene, 30, 28, "←", onBack, { fontSize: "28px" });
  scene.input.keyboard.on("keydown-ESC", onBack);
}
