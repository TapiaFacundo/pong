import { AI_PADDLE_SPEED, AI_DEAD_ZONE } from "../config.js";

export default class AI {
  constructor(paddle, ballManager, side = "right") {
    this.paddle = paddle;
    this.ballManager = ballManager;
    this.side = side;
    this.paddle.setBaseSpeed(AI_PADDLE_SPEED);
  }

  update() {
    const ball = this.ballManager.primary;

    if (!ball) {
      this.paddle.stop();
      return;
    }

    const ballComingTowardsMe =
      (this.side === "right" && ball.velocityX > 0) || (this.side === "left" && ball.velocityX < 0);

    if (!ballComingTowardsMe) {
      this.paddle.stop();
      return;
    }

    const diff = ball.y - this.paddle.y;

    if (diff > AI_DEAD_ZONE) {
      this.paddle.moveDown();
    } else if (diff < -AI_DEAD_ZONE) {
      this.paddle.moveUp();
    } else {
      this.paddle.stop();
    }
  }
}
