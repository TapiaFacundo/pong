import Phaser from "phaser";
import { GAME_WIDTH, COLORS, POWERUP_TEXT_COLORS } from "../config.js";
import { KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";
import MenuList from "../ui/MenuList.js";
import { addBackNavigation } from "../ui/IconButton.js";
import { isTouchDevice } from "../ui/TouchControls.js";
import { addTitle, MENU_FONT_SIZE } from "../ui/ScreenLayout.js";

const HINT_COLOR = "#888888";

// Cómo jugar: controles y colores de los power-ups. Se abre con el "?" del
// menú (con la opción "Arcade", que lleva a cómo jugar el Arcade) y antes del
// nivel 1 del Modo Historia (ahí con la opción "Jugar").
export default class TutorialScene extends Phaser.Scene {
  constructor() {
    super("TutorialScene");
  }

  // data: { returnTo, returnData, next } — escena a la que vuelve con Esc / "←"
  // y, si hay `next`, los datos de la partida que arranca con "Jugar".
  init(data) {
    this.returnTo = data.returnTo ?? "MenuScene";
    this.returnData = data.returnData;
    this.next = data.next;
  }

  create() {
    addTitle(this, getPhrase(KEYS.COMO_JUGAR));

    // Controles: teclas en la PC, botones de los costados en pantallas táctiles.
    if (isTouchDevice()) {
      this.addLine(196, KEYS.MANTENE_APRETADAS_LAS_FLECHAS_DE_TU_LADO, COLORS.TEXT, "20px");
      this.addLine(236, KEYS.PAUSA_ARRIBA_AL_CENTRO, HINT_COLOR, "16px");
    } else {
      this.addLine(180, KEYS.JUGADOR_1_W_S, COLORS.TEXT, "20px");
      this.addLine(212, KEYS.JUGADOR_2_FLECHAS, COLORS.TEXT, "20px");
      this.addLine(244, KEYS.ESC_PAUSA, HINT_COLOR, "16px");
    }

    this.addLine(310, KEYS.TOCA_LOS_POWER_UPS_CON_LA_PELOTA, COLORS.TEXT, "20px");
    this.addLine(348, KEYS.VERDE_A_TU_FAVOR, POWERUP_TEXT_COLORS.green);
    this.addLine(380, KEYS.ROJO_EN_TU_CONTRA, POWERUP_TEXT_COLORS.red);
    this.addLine(412, KEYS.AMARILLO_PARA_LOS_DOS, POWERUP_TEXT_COLORS.yellow);

    // Antes del nivel 1 del Modo Historia: "Jugar". Desde el menú: la pantalla del Arcade.
    const item = this.next
      ? { labelKey: KEYS.JUGAR, action: () => this.scene.start("GameScene", this.next) }
      : {
          labelKey: KEYS.ARCADE,
          action: () => this.scene.start("ArcadeTutorialScene", { returnTo: this.returnTo, returnData: this.returnData }),
        };
    new MenuList(this, { y: 490, fontSize: MENU_FONT_SIZE, items: [item] });

    addBackNavigation(this, () => this.scene.start(this.returnTo, this.returnData));
  }

  addLine(y, key, color, fontSize = "19px") {
    this.add.text(GAME_WIDTH / 2, y, getPhrase(key), { fontSize, color }).setOrigin(0.5);
  }
}
