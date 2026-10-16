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

const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: COLORS.BACKGROUND,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scene: [MenuScene, BattleScene, DifficultyScene, PointsScene, TutorialScene, LevelSelectScene, LevelIntroScene, GameScene, PauseScene, LevelResultScene, StoryEndScene],
};

new Phaser.Game(config);
