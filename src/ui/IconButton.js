import Phaser from "phaser";
import { COLORS } from "../config.js";

const ICON_SIZE = 34;
// Zona que responde al clic o al toque: más grande que el dibujo, para que
// en el celular se pueda tocar con el dedo.
const HIT_SIZE = 52;
const HIGHLIGHT_COLOR = "#66ff66";
const CIRCLE_COLOR = 0xffffff;
const CIRCLE_HIGHLIGHT_COLOR = 0x66ff66;
const DRAWN_COLOR = 0xffffff;
const DRAWN_HIGHLIGHT_COLOR = 0x66ff66;
// Resaltado, el ícono se agranda un poco.
const HIGHLIGHT_SCALE = 1.15;

// Íconos dibujados (para símbolos que no todas las fuentes tienen). Cada uno
// se dibuja centrado en (0, 0), dentro de un cuadrado de ICON_SIZE.
export const DRAWN_ICONS = {
  // Pausa: dos barras.
  pause(g, color) {
    g.fillStyle(color).fillRect(-8, -10, 6, 20).fillRect(2, -10, 6, 20);
  },
  // Pantalla completa: cuatro esquinas.
  fullscreen(g, color) {
    const s = 11;
    const l = 7;
    g.lineStyle(3, color);
    [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ].forEach(([dx, dy]) => {
      g.lineBetween(dx * s, dy * s, dx * (s - l), dy * s);
      g.lineBetween(dx * s, dy * s, dx * s, dy * (s - l));
    });
  },
};

// Ícono clicable: "←" (volver), "?" (cómo jugar), "⚙" (idioma), o uno de
// DRAWN_ICONS (pausa, pantalla completa). Con `circle` se dibuja encerrado en
// un círculo. Se resalta en verde (y se agranda un poco) al pasar el mouse o cuando tiene el foco del
// teclado (ver `topIcons` en MenuList).
export default class IconButton {
  constructor(scene, x, y, symbol, onClick, { circle = false, fontSize = "24px" } = {}) {
    this.onClick = onClick;
    this.hovered = false;
    this.focused = false;
    this.baseScale = 1;
    this.drawIcon = DRAWN_ICONS[symbol] ?? null;

    // La zona de toque va en coordenadas locales: centrada en (0, 0) para el
    // dibujo y en el centro del texto para los símbolos.
    if (this.drawIcon) {
      this.display = scene.add.graphics({ x, y });
      this.display.setInteractive(
        new Phaser.Geom.Rectangle(-HIT_SIZE / 2, -HIT_SIZE / 2, HIT_SIZE, HIT_SIZE),
        Phaser.Geom.Rectangle.Contains
      );
    } else {
      this.display = scene.add.text(x, y, symbol, { fontSize, color: COLORS.TEXT }).setOrigin(0.5);
      this.display.setInteractive(
        new Phaser.Geom.Rectangle(
          this.display.width / 2 - HIT_SIZE / 2,
          this.display.height / 2 - HIT_SIZE / 2,
          HIT_SIZE,
          HIT_SIZE
        ),
        Phaser.Geom.Rectangle.Contains
      );
    }

    this.display
      .setDepth(30)
      .on("pointerover", () => this.setHovered(true))
      .on("pointerout", () => this.setHovered(false))
      .on("pointerdown", (pointer) => {
        // Con un dedo no hay "salir de encima": que no quede resaltado después del toque.
        if (pointer.wasTouch) this.setHovered(false);
        this.activate();
      });
    if (this.display.input) this.display.input.cursor = "pointer";

    if (circle) {
      this.circle = scene.add.circle(x, y, ICON_SIZE / 2).setStrokeStyle(2, CIRCLE_COLOR).setDepth(30);
    }

    this.refreshColor();
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

    if (this.drawIcon) {
      this.display.clear();
      this.drawIcon(this.display, highlighted ? DRAWN_HIGHLIGHT_COLOR : DRAWN_COLOR);
    } else {
      this.display.setColor(highlighted ? HIGHLIGHT_COLOR : COLORS.TEXT);
    }
    this.circle?.setStrokeStyle(2, highlighted ? CIRCLE_HIGHLIGHT_COLOR : CIRCLE_COLOR);

    const scale = this.baseScale * (highlighted ? HIGHLIGHT_SCALE : 1);
    this.display.setScale(scale);
    this.circle?.setScale(scale);
  }

  // Ubica el ícono en coordenadas de pantalla aunque la cámara esté alejada (ver Field).
  placeOnScreen(field, screenX, screenY) {
    field.placeOnScreen(this.display, screenX, screenY);
    if (this.circle) field.placeOnScreen(this.circle, screenX, screenY);
    this.baseScale = this.display.scaleX;
    this.refreshColor();
    return this;
  }

  setVisible(visible) {
    this.display.setVisible(visible);
    this.circle?.setVisible(visible);
    return this;
  }
}

// "Volver" estándar: ícono "←" arriba a la izquierda y la tecla Esc.
export function addBackNavigation(scene, onBack) {
  new IconButton(scene, 30, 28, "←", onBack, { fontSize: "28px" });
  scene.input.keyboard.on("keydown-ESC", onBack);
}
