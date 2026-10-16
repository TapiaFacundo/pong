import Phaser from "phaser";
import { POWERUP_RADIUS, POWERUP_COLORS } from "../config.js";

const DRAWING_COLOR = 0x111111;

// Dibujos de cada tipo de power-up, pensados para un círculo de radio
// POWERUP_RADIUS centrado en (0, 0). Los verdes y rojos del mismo tipo
// comparten dibujo: el color dice a quién favorece.
const DRAWINGS = {
  grow(g) {
    g.fillRect(-3, -9, 6, 18);
    fillPolygon(g, [0, -16, -5, -11, 5, -11]);
    fillPolygon(g, [0, 16, -5, 11, 5, 11]);
  },
  shrink(g) {
    g.fillRect(-3, -4, 6, 8);
    fillPolygon(g, [0, -6, -5, -13, 5, -13]);
    fillPolygon(g, [0, 6, -5, 13, 5, 13]);
  },
  speedUp(g) {
    g.fillRect(-9, -9, 6, 18);
    strokePolyline(g, 2.5, [1, -1, 6, -7, 11, -1]);
    strokePolyline(g, 2.5, [1, 7, 6, 1, 11, 7]);
  },
  slowDown(g) {
    g.fillRect(-10, -9, 6, 18);
    g.lineStyle(2, DRAWING_COLOR).strokeCircle(7, -3, 3);
    fillPolygon(g, [1, 11, 13, 11, 11, 0, 3, 0]);
  },
  invert(g) {
    strokeLine(g, 2.5, -5, 11, -5, -7);
    fillPolygon(g, [-5, -13, -10, -6, 0, -6]);
    strokeLine(g, 2.5, 5, -11, 5, 7);
    fillPolygon(g, [5, 13, 0, 6, 10, 6]);
  },
  // El "×2" va como texto (ver PowerUpIcon).
  doublePoint() {},
  shield(g) {
    const points = [
      new Phaser.Math.Vector2(0, -13),
      new Phaser.Math.Vector2(11, -8),
      new Phaser.Math.Vector2(10, 3),
      ...quadratic([10, 3], [7, 10], [0, 14]),
      ...quadratic([0, 14], [-7, 10], [-10, 3]),
      new Phaser.Math.Vector2(-11, -8),
    ];
    g.fillStyle(DRAWING_COLOR).fillPoints(points, true);
  },
  smallGoal(g) {
    strokeLine(g, 2, 5, -14, 5, 14);
    g.fillRect(2, -14, 7, 8);
    g.fillRect(2, 6, 7, 8);
    g.fillCircle(-7, 0, 4);
  },
  cannon(g) {
    const angle = Phaser.Math.DegToRad(-30);
    const barrel = [-5, -4, 14, -4, 14, 4, -5, 4];
    const rotated = [];
    for (let i = 0; i < barrel.length; i += 2) {
      const point = Phaser.Math.Rotate({ x: barrel[i], y: barrel[i + 1] }, angle);
      rotated.push(point.x, point.y);
    }
    fillPolygon(g, rotated);
    g.fillCircle(-4, 7, 5);
  },
  extraBall(g) {
    g.fillCircle(-5, 0, 7);
    strokeLine(g, 2.5, 5, 0, 13, 0);
    strokeLine(g, 2.5, 9, -4, 9, 4);
  },
  turbo(g) {
    g.fillCircle(7, 0, 5);
    strokeLine(g, 2, -12, -5, -1, -5);
    strokeLine(g, 2, -14, 0, 0, 0);
    strokeLine(g, 2, -12, 5, -1, 5);
  },
  zigzag(g) {
    strokePolyline(g, 2.5, [-13, 6, -8, -5, -3, 6, 2, -5, 6, 2]);
    g.fillCircle(10, -2, 4);
  },
  curve(g) {
    g.lineStyle(2.5, DRAWING_COLOR).strokePoints(quadratic([-13, 9], [-3, -14], [7, -5]), false);
    g.fillCircle(10, -2, 4);
  },
  giant(g) {
    g.fillCircle(-3, 2, 10);
    g.fillCircle(10, -9, 3);
  },
  slowMotion(g) {
    strokeLine(g, 2, -9, -13, 9, -13);
    strokeLine(g, 2, -9, 13, 9, 13);
    fillPolygon(g, [-7, -12, 7, -12, 0, 0]);
    fillPolygon(g, [-7, 12, 7, 12, 0, 0]);
  },
  invisible(g) {
    const eye = [...quadratic([-13, 0], [0, -11], [13, 0]), ...quadratic([13, 0], [0, 11], [-13, 0])];
    g.lineStyle(2, DRAWING_COLOR).strokePoints(eye, true);
    g.fillCircle(0, 0, 3.5);
    strokeLine(g, 2.5, -11, 10, 11, -10);
  },
  rain(g) {
    [
      [-8, 4],
      [0, -2],
      [8, 6],
    ].forEach(([x, y]) => {
      strokeLine(g, 2, x, y - 10, x, y - 4);
      g.fillCircle(x, y, 3);
    });
  },
  centerPaddle(g) {
    for (let y = -15; y < 15; y += 6) strokeLine(g, 2, 0, y, 0, y + 3);
    g.fillRect(-3, -7, 6, 14);
  },
};

function fillPolygon(g, coords) {
  const points = [];
  for (let i = 0; i < coords.length; i += 2) points.push(new Phaser.Math.Vector2(coords[i], coords[i + 1]));
  g.fillStyle(DRAWING_COLOR).fillPoints(points, true);
}

function strokePolyline(g, width, coords) {
  const points = [];
  for (let i = 0; i < coords.length; i += 2) points.push(new Phaser.Math.Vector2(coords[i], coords[i + 1]));
  g.lineStyle(width, DRAWING_COLOR).strokePoints(points, false);
}

function strokeLine(g, width, x1, y1, x2, y2) {
  g.lineStyle(width, DRAWING_COLOR).lineBetween(x1, y1, x2, y2);
}

function quadratic(from, control, to) {
  return new Phaser.Curves.QuadraticBezier(
    new Phaser.Math.Vector2(...from),
    new Phaser.Math.Vector2(...control),
    new Phaser.Math.Vector2(...to)
  ).getPoints(12);
}

// Ícono de un power-up: círculo de su color con el dibujo de su tipo en el
// medio. Se usa en la cancha y se puede dibujar de otro tamaño con `radius`.
export default class PowerUpIcon extends Phaser.GameObjects.Container {
  constructor(scene, x, y, kind, colorCategory, radius = POWERUP_RADIUS) {
    super(scene, x, y);

    const graphics = scene.add.graphics();
    graphics.fillStyle(POWERUP_COLORS[colorCategory]).fillCircle(0, 0, POWERUP_RADIUS);
    graphics.fillStyle(DRAWING_COLOR);
    DRAWINGS[kind]?.(graphics);
    this.add(graphics);

    if (kind === "doublePoint") {
      this.add(
        scene.add
          .text(0, 1, "×2", { fontFamily: "monospace", fontSize: "17px", fontStyle: "bold", color: "#111111" })
          .setOrigin(0.5)
      );
    }

    this.setScale(radius / POWERUP_RADIUS);
    scene.add.existing(this);
  }
}
