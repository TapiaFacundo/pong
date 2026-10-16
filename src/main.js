import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from "./config.js";
import MenuScene from "./scenes/MenuScene.js";
import BattleScene from "./scenes/BattleScene.js";
import DifficultyScene from "./scenes/DifficultyScene.js";
import PointsScene from "./scenes/PointsScene.js";
import TutorialScene from "./scenes/TutorialScene.js";
import GameScene from "./scenes/GameScene.js";
import PauseScene from "./scenes/PauseScene.js";
import LevelSelectScene from "./scenes/LevelSelectScene.js";
import LevelIntroScene from "./scenes/LevelIntroScene.js";
import LevelResultScene from "./scenes/LevelResultScene.js";
import StoryEndScene from "./scenes/StoryEndScene.js";
import { touchControls } from "./ui/TouchControls.js";
import { mountRotateNotice } from "./ui/RotateNotice.js";

const config = {
  type: Phaser.AUTO,
  parent: "game-area",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: COLORS.BACKGROUND,
  // La cancha se agranda o achica para entrar en la pantalla, sin deformarse.
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    // En pantalla completa entra todo #game: la cancha y los botones táctiles.
    fullscreenTarget: "game",
  },
  // Dos jugadores en el mismo celular: varios dedos a la vez.
  input: {
    activePointers: 3,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scene: [MenuScene, BattleScene, DifficultyScene, PointsScene, TutorialScene, LevelSelectScene, LevelIntroScene, GameScene, PauseScene, LevelResultScene, StoryEndScene],
};

const game = new Phaser.Game(config);

game.events.once("ready", () => {
  const container = document.getElementById("game");
  touchControls.mount(game, container);
  mountRotateNotice(container);
});
