import { GAME_WIDTH, GAME_HEIGHT } from "../config.js";

// La cancha de la partida. Puede ser más grande que la pantalla (niveles del
// Modo Historia): en ese caso la cámara se aleja para que entre completa.
//
// Los límites del mundo físico son la cancha, así que el resto del juego
// (palas, pelotas, power-ups) toma de ahí su tamaño y su centro. El marcador
// y otros textos fijos se ubican con placeOnScreen para que queden en el
// mismo lugar y tamaño de pantalla aunque la cámara esté alejada.
export default class Field {
  constructor(scene, { width = GAME_WIDTH, height = GAME_HEIGHT } = {}) {
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.zoom = Math.min(GAME_WIDTH / width, GAME_HEIGHT / height);

    // Solo rebota en el techo y el piso: por los costados la pelota sale y es punto.
    scene.physics.world.setBounds(0, 0, width, height, false, false, true, true);
    scene.cameras.main.setZoom(this.zoom).centerOn(width / 2, height / 2);
  }

  get centerX() {
    return this.width / 2;
  }

  get centerY() {
    return this.height / 2;
  }

  // Cuánto más rápido se mueven las palas: en una cancha más alta, cruzarla
  // tarda lo mismo que en la normal.
  get paddleSpeedScale() {
    return this.height / GAME_HEIGHT;
  }

  // Ubica un objeto en coordenadas de pantalla (800 × 600) y con su tamaño
  // normal, compensando el zoom de la cámara.
  placeOnScreen(gameObject, screenX, screenY) {
    gameObject.setPosition(
      this.centerX + (screenX - GAME_WIDTH / 2) / this.zoom,
      this.centerY + (screenY - GAME_HEIGHT / 2) / this.zoom
    );
    gameObject.setScale(1 / this.zoom);
    return gameObject;
  }
}
