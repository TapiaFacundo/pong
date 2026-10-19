import Phaser from "phaser";
import {
  GAME_WIDTH,
  COLORS,
  PADDLE_WIDTH,
  BALL_SIZE,
  ARCADE_TOUGH_BRICK_COLORS,
  ARCADE_BRICK_COLORS,
  ARCADE_METAL_COLOR,
  ARCADE_METAL_BORDER_COLOR,
  ARCADE_DANGER_COLOR,
} from "../config.js";
import { KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";
import { addBackNavigation } from "../ui/IconButton.js";
import PowerUpIcon from "../ui/PowerUpIcon.js";
import { isTouchDevice } from "../ui/TouchControls.js";
import { addTitle } from "../ui/ScreenLayout.js";

const TEXT_X = 250;
const PICTURE_X = 200;
const FIRST_LINE_Y = 195;
const LINE_SPACING = 54;
const BRICK_WIDTH = 10;
const BRICK_HEIGHT = 22;

// Cómo jugar el Arcade: una línea por regla, cada una con un dibujito al lado
// (pala y pelota, ladrillos de cada tipo, la línea de peligro, una cápsula).
// Se llega desde "Cómo jugar" (opción "Arcade"); volver regresa ahí.
export default class ArcadeTutorialScene extends Phaser.Scene {
  constructor() {
    super("ArcadeTutorialScene");
  }

  // data: a dónde vuelve "Cómo jugar" después (para devolvérselo).
  init(data) {
    this.tutorialData = data;
  }

  create() {
    addTitle(this, getPhrase(KEYS.ARCADE));

    const lines = [
      [isTouchDevice() ? KEYS.MANTENE_APRETADAS_LAS_FLECHAS_DE_TU_LADO : KEYS.W_S_O_FLECHAS, (y) => this.drawPaddle(y)],
      [KEYS.ROMPE_TODOS_LOS_LADRILLOS_PARA_PASAR_DE_NIVEL, (y) => this.drawBricks(y, [ARCADE_BRICK_COLORS[0], ARCADE_BRICK_COLORS[1]])],
      [KEYS.SI_SE_TE_PASA_LA_PELOTA_PERDES_UNA_VIDA, (y) => this.drawLife(y)],
      [
        KEYS.DORADOS_Y_PLATEADOS_AGUANTAN_MAS_GOLPES,
        (y) => this.drawBricks(y, [ARCADE_TOUGH_BRICK_COLORS[3], ARCADE_TOUGH_BRICK_COLORS[2]]),
      ],
      [KEYS.EL_METAL_NO_SE_ROMPE, (y) => this.drawMetal(y)],
      [KEYS.EL_MURO_AVANZA_QUE_NO_CRUCE_LA_LINEA_ROJA, (y) => this.drawDangerLine(y)],
      [KEYS.AGARRA_LAS_CAPSULAS_CON_LA_PALA, (y) => new PowerUpIcon(this, PICTURE_X, y, "laser", "green", 14)],
    ];

    lines.forEach(([key, drawPicture], index) => {
      const y = FIRST_LINE_Y + index * LINE_SPACING;
      drawPicture(y);
      this.add.text(TEXT_X, y, getPhrase(key), { fontSize: "19px", color: COLORS.TEXT }).setOrigin(0, 0.5);
    });

    addBackNavigation(this, () => this.scene.start("TutorialScene", this.tutorialData));
  }

  drawPaddle(y) {
    this.add.rectangle(PICTURE_X - 8, y, PADDLE_WIDTH / 2, 30, COLORS.PADDLE);
    this.add.circle(PICTURE_X + 10, y, BALL_SIZE / 2 - 2, COLORS.BALL);
  }

  drawBricks(y, colors) {
    colors.forEach((color, index) => {
      this.add.rectangle(PICTURE_X - 7 + index * (BRICK_WIDTH + 4), y, BRICK_WIDTH, BRICK_HEIGHT, color);
    });
  }

  drawMetal(y) {
    this.add
      .rectangle(PICTURE_X, y, BRICK_WIDTH + 2, BRICK_HEIGHT, ARCADE_METAL_COLOR)
      .setStrokeStyle(2, ARCADE_METAL_BORDER_COLOR);
  }

  // Las vidas como en el marcador (pelotitas), con una ya perdida (apagada).
  drawLife(y) {
    this.add.circle(PICTURE_X - 8, y, 6, COLORS.BALL);
    this.add.circle(PICTURE_X + 10, y, 6, COLORS.BALL, 0.3);
  }

  drawDangerLine(y) {
    const graphics = this.add.graphics().lineStyle(2, ARCADE_DANGER_COLOR, 0.8);
    for (let dashY = y - 14; dashY < y + 14; dashY += 8) graphics.lineBetween(PICTURE_X, dashY, PICTURE_X, dashY + 4);
  }
}
