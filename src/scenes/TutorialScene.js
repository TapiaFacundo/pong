import Phaser from "phaser";
import { GAME_WIDTH, COLORS, POWERUP_TEXT_COLORS } from "../config.js";
import { KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";

export default class TutorialScene extends Phaser.Scene {
  constructor() {
    super("TutorialScene");
  }

  init(data) {
    this.gameData = data;
  }

  create() {
    this.add
      .text(GAME_WIDTH / 2, 60, getPhrase(KEYS.COMO_JUGAR), { fontSize: "34px", color: COLORS.TEXT })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 115, getPhrase(KEYS.JUGADOR_1_W_S_JUGADOR_2_FLECHAS_ARRIBA_ABAJO), {
        fontSize: "18px",
        color: COLORS.TEXT,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 150, getPhrase(KEYS.ESC_PAUSAR_LA_PARTIDA_EN_CUALQUIER_MOMENTO), {
        fontSize: "15px",
        color: "#888888",
      })
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        205,
        getPhrase(KEYS.LOS_POWER_UPS_APARECEN_EN_EL_CENTRO_DE_LA_CANCHA_NLOS_ACTIVA_EL_PRIMERO_QUE_LOS_TOCA_CON_LA_PELOTA).replace(
          /\\n/g,
          "\n"
        ),
        { fontSize: "15px", color: "#888888", align: "center" }
      )
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 270, getPhrase(KEYS.AMARILLO_AFECTA_A_AMBOS_JUGADORES_POR_IGUAL), {
        fontSize: "19px",
        color: POWERUP_TEXT_COLORS.yellow,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 305, getPhrase(KEYS.VERDE_TE_BENEFICIA_A_VOS_O_PERJUDICA_AL_RIVAL), {
        fontSize: "19px",
        color: POWERUP_TEXT_COLORS.green,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 340, getPhrase(KEYS.ROJO_TE_PERJUDICA_A_VOS_O_BENEFICIA_AL_RIVAL), {
        fontSize: "19px",
        color: POWERUP_TEXT_COLORS.red,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 420, getPhrase(KEYS.ENTER_O_CLIC_EMPEZAR), { fontSize: "22px", color: COLORS.TEXT })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.startGame());

    this.input.keyboard.on("keydown-ENTER", () => this.startGame());
  }

  startGame() {
    this.scene.start("GameScene", this.gameData);
  }
}
