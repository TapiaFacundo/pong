import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from "../config.js";
import { KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";
import MenuList from "../ui/MenuList.js";
import { addOverlayPanel, MENU_FONT_SIZE } from "../ui/ScreenLayout.js";
import { pop } from "../ui/Pop.js";

// Resultado de una partida de la Batalla: "¡Gana {jugador}!" y "Volver al
// menú" (también con Esc), encima de la cancha con el marcador final. Es una
// escena aparte, como la pausa, para que se vea centrada y de su tamaño
// aunque la cancha sea más grande que la pantalla (con la cámara alejada).
export default class BattleResultScene extends Phaser.Scene {
  constructor() {
    super("BattleResultScene");
  }

  // data.winnerLabel: quién ganó, ya traducido ("Jugador 1", "CPU"...).
  init(data) {
    this.winnerLabel = data.winnerLabel;
  }

  create() {
    addOverlayPanel(this, 200);
    const title = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 35, getPhrase(KEYS.GANA_LABEL).replace("{label}", this.winnerLabel), {
        fontSize: "40px",
        color: COLORS.TEXT,
      })
      .setOrigin(0.5);
    pop(this, title, { from: 0.6, duration: 320 });

    const backToMenu = () => {
      this.scene.stop("GameScene");
      this.scene.start("MenuScene");
    };
    new MenuList(this, {
      y: GAME_HEIGHT / 2 + 40,
      fontSize: MENU_FONT_SIZE,
      items: [{ labelKey: KEYS.VOLVER_AL_MENU, action: backToMenu }],
    });
    this.input.keyboard.on("keydown-ESC", backToMenu);
  }
}
