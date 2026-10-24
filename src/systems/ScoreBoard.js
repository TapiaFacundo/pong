import { GAME_WIDTH, COLORS } from "../config.js";
import { pop } from "../ui/Pop.js";

const SCORE_OFFSET_X = 60;
const SCORE_Y = 30;
// Debajo de cada puntaje, una fila de puntitos: cuántos puntos hacen falta
// para ganar, rellenos los que ya se hicieron.
const PIPS_Y = 62;
const PIP_RADIUS = 3;
const PIP_SPACING = 11;
const PIP_EMPTY_COLOR = 0x444444;
// Punto de partido: al que le falta un punto para ganar, su puntaje late.
const MATCH_POINT_SCALE = 1.15;
const MATCH_POINT_PERIOD = 380;
const POP_DURATION = 220;

// Marcador de la Batalla y el Modo Historia: el puntaje de cada jugador
// arriba al centro (a los lados del ícono de pausa) y los puntos que le
// faltan para ganar. El puntaje que cambia da un salto, y el de quien está a
// un punto de ganar late.
//
// Va en coordenadas de pantalla: no se achica con la cámara alejada (ver Field).
export default class ScoreBoard {
  constructor(scene, field, winScore) {
    this.scene = scene;
    this.winScore = winScore;

    this.sides = ["p1", "p2"].map((side, index) => {
      const x = GAME_WIDTH / 2 + (index === 0 ? -SCORE_OFFSET_X : SCORE_OFFSET_X);
      const text = field.placeOnScreen(
        scene.add.text(0, 0, "0", { fontSize: "48px", fontStyle: "bold", color: COLORS.TEXT }).setOrigin(0.5),
        x,
        SCORE_Y
      );
      const pips = field.placeOnScreen(scene.add.graphics(), x, PIPS_Y);
      return { side, text, pips, baseScale: text.scaleX, score: 0 };
    });

    this.sides.forEach((entry) => this.drawPips(entry));
  }

  // scores: { p1, p2 }.
  update(scores) {
    for (const entry of this.sides) {
      const score = scores[entry.side];
      if (score === entry.score) continue;

      entry.score = score;
      entry.text.setText(String(score));
      pop(this.scene, entry.text, { baseScale: entry.baseScale, duration: POP_DURATION });
      this.drawPips(entry);
      if (score === this.winScore - 1) this.startMatchPointPulse(entry);
    }
  }

  // Empieza cuando termina el salto del punto.
  startMatchPointPulse({ text, baseScale }) {
    this.scene.tweens.add({
      targets: text,
      scale: baseScale * MATCH_POINT_SCALE,
      delay: POP_DURATION,
      duration: MATCH_POINT_PERIOD,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });
  }

  drawPips({ pips, score }) {
    const left = -((this.winScore - 1) * PIP_SPACING) / 2;

    pips.clear();
    for (let i = 0; i < this.winScore; i++) {
      const x = left + i * PIP_SPACING;
      if (i < score) {
        pips.fillStyle(COLORS.PADDLE).fillCircle(x, 0, PIP_RADIUS);
      } else {
        pips.lineStyle(1, PIP_EMPTY_COLOR).strokeCircle(x, 0, PIP_RADIUS);
      }
    }
  }
}
