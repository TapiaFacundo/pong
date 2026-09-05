import Phaser from "phaser";
import { GAME_WIDTH, COLORS, POWERUP_TEXT_COLORS } from "../config.js";

export default class TutorialScene extends Phaser.Scene {
  constructor() {
    super("TutorialScene");
  }

  init(data) {
    this.gameData = data;
  }

  create() {
    this.add
      .text(GAME_WIDTH / 2, 60, "Cómo jugar", { fontSize: "34px", color: COLORS.TEXT })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 115, "Jugador 1: W / S     Jugador 2: Flechas arriba/abajo", {
        fontSize: "18px",
        color: COLORS.TEXT,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 150, "ESC: pausar la partida en cualquier momento", {
        fontSize: "15px",
        color: "#888888",
      })
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        205,
        "Los power-ups aparecen en el centro de la cancha.\nLos activa el primero que los toca con la pelota:",
        { fontSize: "15px", color: "#888888", align: "center" }
      )
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 270, "Amarillo: afecta a ambos jugadores por igual", {
        fontSize: "19px",
        color: POWERUP_TEXT_COLORS.yellow,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 305, "Verde: te beneficia a vos (o perjudica al rival)", {
        fontSize: "19px",
        color: POWERUP_TEXT_COLORS.green,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 340, "Rojo: te perjudica a vos (o beneficia al rival)", {
        fontSize: "19px",
        color: POWERUP_TEXT_COLORS.red,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 420, "ENTER o clic: Empezar", { fontSize: "22px", color: COLORS.TEXT })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.startGame());

    this.input.keyboard.on("keydown-ENTER", () => this.startGame());
  }

  startGame() {
    this.scene.start("GameScene", this.gameData);
  }
}
