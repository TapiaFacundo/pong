export default class ScoreManager {
  constructor(winScore) {
    this.winScore = winScore;
    this.scoreP1 = 0;
    this.scoreP2 = 0;
    this.doublePointSide = null;
  }

  setDoublePoint(side) {
    this.doublePointSide = side;
  }

  addPoint(side) {
    const amount = this.doublePointSide === side ? 2 : 1;
    this.doublePointSide = null;

    if (side === "p1") {
      this.scoreP1 += amount;
    } else {
      this.scoreP2 += amount;
    }
  }

  checkWinner() {
    if (this.scoreP1 >= this.winScore) return "p1";
    if (this.scoreP2 >= this.winScore) return "p2";
    return null;
  }
}
