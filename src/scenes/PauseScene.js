import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from "../config.js";
import { KEYS } from "../enums/keys.js";
import { getPhrase } from "../services/translations.js";
import MenuList from "../ui/MenuList.js";
import IconButton from "../ui/IconButton.js";
import { addOverlayPanel, TITLE_FONT_SIZE, MENU_FONT_SIZE } from "../ui/ScreenLayout.js";

// Pausa de cualquier partida, encima de ella: Reanudar, salir y Opciones
// (que se abren encima de la pausa).
export default class PauseScene extends Phaser.Scene {
  constructor() {
    super("PauseScene");
  }

  // data (lo arma MatchPause): gameSceneKey (la partida a reanudar o cerrar),
  // exitTo / exitData / exitLabelKey (a dónde lleva la opción de salir, con
  // qué datos y su texto: en el Modo Historia, la selección de nivel).
  init(data) {
    this.gameSceneKey = data.gameSceneKey;
    this.exitTo = data.exitTo;
    this.exitData = data.exitData;
    this.exitLabelKey = data.exitLabelKey;
  }

  create() {
    addOverlayPanel(this, 300);

    this.titleText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 95, getPhrase(KEYS.PAUSA), {
        fontSize: TITLE_FONT_SIZE,
        fontStyle: "bold",
        color: COLORS.TEXT,
      })
      .setOrigin(0.5);

    this.menu = new MenuList(this, {
      y: GAME_HEIGHT / 2 - 15,
      fontSize: MENU_FONT_SIZE,
      spacing: 48,
      items: [
        { labelKey: KEYS.REANUDAR, action: () => this.resumeGame() },
        { labelKey: this.exitLabelKey, action: () => this.exitToMenu() },
        { labelKey: KEYS.OPCIONES, action: () => this.openOptions() },
      ],
    });

    // Volver (ícono o Esc) reanuda la partida.
    new IconButton(this, 30, 28, "←", () => this.resumeGame(), { fontSize: "28px" });
    this.input.keyboard.on("keydown-ESC", () => this.resumeGame());
  }

  // La pausa queda quieta abajo mientras están las opciones; al volver, los
  // textos se rescriben por si se cambió el idioma.
  openOptions() {
    this.events.once("resume", () => this.refreshTexts());
    this.scene.launch("OptionsScene", { returnTo: "PauseScene" });
    this.scene.pause();
  }

  refreshTexts() {
    this.titleText.setText(getPhrase(KEYS.PAUSA));
    this.menu.refreshTexts();
  }

  resumeGame() {
    this.scene.stop();
    this.scene.resume(this.gameSceneKey);
  }

  exitToMenu() {
    this.scene.stop(this.gameSceneKey);
    this.scene.start(this.exitTo, this.exitData);
  }
}
