// Botones táctiles ▲ / ▼ de cada jugador, para jugar en celulares y tablets.
// Son elementos HTML (no de Phaser) para poder ubicarlos en las franjas que
// quedan a los costados de la cancha. En pantallas táctiles siempre hay
// franjas: si la pantalla no es lo bastante ancha, la cancha se achica (ver
// #game-area en index.html).
//
// Mantener apretado un botón mueve la pala; varios dedos a la vez funcionan
// (dos jugadores en el mismo celular). Solo aparecen en pantallas táctiles.

const BAR_PADDING = 8;
const MAX_BUTTON_WIDTH = 150;
const BUTTON_HEIGHT_RATIO = 0.36; // del alto de la cancha
const BUTTON_GAP_RATIO = 0.06;
const SIDES = ["p1", "p2"];
const DIRECTIONS = ["up", "down"];
const ARROWS = {
  up: '<svg viewBox="0 0 40 40" width="40" height="40"><polygon points="20,8 36,32 4,32" fill="currentColor"/></svg>',
  down: '<svg viewBox="0 0 40 40" width="40" height="40"><polygon points="20,32 36,8 4,8" fill="currentColor"/></svg>',
};

export function isTouchDevice() {
  return window.matchMedia("(pointer: coarse)").matches;
}

class TouchControls {
  constructor() {
    this.pressed = { p1: { up: false, down: false }, p2: { up: false, down: false } };
    this.visibleSides = [];
    this.buttons = null;
  }

  // Crea los botones dentro del contenedor de toda la pantalla (así se ven
  // también en pantalla completa) y los reubica cada vez que cambia el tamaño.
  mount(game, container) {
    if (!isTouchDevice()) return;

    this.game = game;
    this.container = container;
    this.buttons = {};

    for (const side of SIDES) {
      this.buttons[side] = {};
      for (const direction of DIRECTIONS) {
        this.buttons[side][direction] = this.createButton(side, direction);
      }
    }

    game.scale.on("resize", () => this.layout());
    window.addEventListener("resize", () => this.layout());
    this.hide();
  }

  createButton(side, direction) {
    const button = document.createElement("div");
    button.className = "touch-button";
    button.innerHTML = ARROWS[direction];

    const press = (event) => {
      event.preventDefault();
      this.setPressed(side, direction, true, button);
      // Con el dedo "capturado", el botón sigue apretado aunque se deslice afuera.
      try {
        button.setPointerCapture(event.pointerId);
      } catch {
        // Sin captura igual funciona: se suelta al levantar el dedo sobre el botón.
      }
    };
    const release = () => this.setPressed(side, direction, false, button);

    button.addEventListener("pointerdown", press);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
    button.addEventListener("contextmenu", (event) => event.preventDefault());

    this.container.appendChild(button);
    return button;
  }

  setPressed(side, direction, pressed, button) {
    this.pressed[side][direction] = pressed;
    button.classList.toggle("pressed", pressed);
  }

  isDown(side, direction) {
    return this.pressed[side][direction];
  }

  // sides: los lados que tienen jugador humano (["p1"] o ["p1", "p2"]).
  show(sides) {
    this.visibleSides = sides;
    this.layout();
  }

  hide() {
    this.show([]);
    for (const side of SIDES) {
      for (const direction of DIRECTIONS) this.pressed[side][direction] = false;
    }
  }

  layout() {
    if (!this.buttons) return;

    const canvas = this.game.canvas.getBoundingClientRect();
    const container = this.container.getBoundingClientRect();
    const barWidth = canvas.left - container.left;
    const width = Math.min(barWidth - 2 * BAR_PADDING, MAX_BUTTON_WIDTH);
    const height = canvas.height * BUTTON_HEIGHT_RATIO;
    const gap = canvas.height * BUTTON_GAP_RATIO;
    const top = canvas.top - container.top + (canvas.height - 2 * height - gap) / 2;

    for (const side of SIDES) {
      const visible = this.visibleSides.includes(side);
      const centerX = side === "p1" ? barWidth / 2 : container.width - barWidth / 2;

      DIRECTIONS.forEach((direction, index) => {
        const button = this.buttons[side][direction];
        Object.assign(button.style, {
          display: visible ? "flex" : "none",
          left: `${centerX - width / 2}px`,
          top: `${top + index * (height + gap)}px`,
          width: `${width}px`,
          height: `${height}px`,
        });
      });
    }
  }
}

// Una sola instancia para todo el juego: los botones son de la página, no de una escena.
export const touchControls = new TouchControls();
