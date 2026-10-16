import Phaser from "phaser";
import { GAME_WIDTH, COLORS, POWERUP_TEXT_COLORS } from "../config.js";
import { KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";
import MenuList from "../ui/MenuList.js";
import { addBackNavigation } from "../ui/IconButton.js";

const HINT_COLOR = "#888888";

// Cómo jugar: controles y colores de los power-ups. Se abre con el "?" del
// menú y antes del nivel 1 del Modo Historia (ahí con la opción "Jugar").
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
    this.add.text(GAME_WIDTH / 2, 80, getPhrase(KEYS.COMO_JUGAR), { fontSize: "34px", color: COLORS.TEXT }).setOrigin(0.5);

    this.addLine(150, KEYS.JUGADOR_1_W_S, COLORS.TEXT, "20px");
    this.addLine(182, KEYS.JUGADOR_2_FLECHAS, COLORS.TEXT, "20px");
    this.addLine(214, KEYS.ESC_PAUSA, HINT_COLOR, "16px");

    this.addLine(280, KEYS.TOCA_LOS_POWER_UPS_CON_LA_PELOTA, COLORS.TEXT, "20px");
    this.addLine(318, KEYS.VERDE_A_TU_FAVOR, POWERUP_TEXT_COLORS.green);
    this.addLine(350, KEYS.ROJO_EN_TU_CONTRA, POWERUP_TEXT_COLORS.red);
    this.addLine(382, KEYS.AMARILLO_PARA_LOS_DOS, POWERUP_TEXT_COLORS.yellow);

    if (this.next) {
      new MenuList(this, {
        y: 470,
        fontSize: "28px",
        items: [{ labelKey: KEYS.JUGAR, action: () => this.scene.start("GameScene", this.next) }],
      });
    }

    addBackNavigation(this, () => this.scene.start(this.returnTo, this.returnData));
  }

  addLine(y, key, color, fontSize = "19px") {
    this.add.text(GAME_WIDTH / 2, y, getPhrase(key), { fontSize, color }).setOrigin(0.5);
  }
}
