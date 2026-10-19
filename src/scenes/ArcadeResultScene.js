import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from "../config.js";
import { KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";
import MenuList from "../ui/MenuList.js";

const DETAIL_COLOR = "#888888";
const RECORD_COLOR = "#ffdd33";

// Fin de una partida del Arcade, encima del muro: puntaje, nivel al que se
// llegó y el récord (o "¡Nuevo récord!"). Reintentar arranca otra partida;
// "Volver al menú" (o Esc) lleva al menú principal.
export default class ArcadeResultScene extends Phaser.Scene {
  constructor() {
    super("ArcadeResultScene");
  }

  // data: { score, level, record: { score, level }, isNew }.
  init(data) {
    this.result = data;
  }

  create() {
    const { score, level, record, isNew } = this.result;
    const centerX = GAME_WIDTH / 2;

    this.add.rectangle(centerX, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);

    this.add.text(centerX, 150, getPhrase(KEYS.FIN_DEL_JUEGO), { fontSize: "40px", color: COLORS.TEXT }).setOrigin(0.5);
    this.add.text(centerX, 225, String(score), { fontSize: "56px", color: COLORS.TEXT }).setOrigin(0.5);
    this.add
      .text(centerX, 280, getPhrase(KEYS.NIVEL_N).replace("{n}", level), { fontSize: "20px", color: DETAIL_COLOR })
      .setOrigin(0.5);

    const recordText = isNew ? getPhrase(KEYS.NUEVO_RECORD) : getPhrase(KEYS.RECORD_N).replace("{n}", record.score);
    this.add
      .text(centerX, 318, recordText, { fontSize: "20px", color: isNew ? RECORD_COLOR : DETAIL_COLOR })
      .setOrigin(0.5);

    const backToMenu = () => {
      this.scene.stop("ArcadeScene");
      this.scene.start("MenuScene", { mode: "arcade" });
    };
    new MenuList(this, {
      y: 400,
      spacing: 48,
      items: [
        {
          labelKey: KEYS.REINTENTAR,
          action: () => {
            this.scene.stop("ArcadeScene");
            this.scene.start("ArcadeScene");
          },
        },
        { labelKey: KEYS.VOLVER_AL_MENU, action: backToMenu },
      ],
    });
    this.input.keyboard.on("keydown-ESC", backToMenu);
  }
}
