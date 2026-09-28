import { BALL_ZIGZAG_AMPLITUDE, BALL_ZIGZAG_PERIOD } from "../config.js";

// Efecto de movimiento "bola zigzagueante": la pelota ondula en curvas
// amplias alrededor de su trayectoria normal. No cambia su dirección base,
// solo le suma un desvío de ángulo que oscila, así que en promedio la
// pelota sigue yendo al mismo lugar.
export default class ZigzagMotion {
  constructor() {
    this.elapsed = 0;
  }

  update(ball, delta) {
    this.elapsed += delta;

    // Para que la onda mida siempre lo mismo de ancho, el ángulo máximo se
    // ajusta a la velocidad actual: a más velocidad, menos inclinación.
    const angularFrequency = (2 * Math.PI) / BALL_ZIGZAG_PERIOD;
    const maxAngle = Math.atan((BALL_ZIGZAG_AMPLITUDE * angularFrequency * 1000) / ball.speed);

    return maxAngle * Math.cos(angularFrequency * this.elapsed);
  }

  // Al rebotar en una pared, la onda se espeja junto con la pelota para que
  // no la vuelva a empujar contra el borde.
  onWallBounce() {
    this.elapsed += BALL_ZIGZAG_PERIOD / 2;
  }
}
