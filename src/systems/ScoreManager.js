export default class ScoreManager {
  constructor(winScore) {
    this.winScore = winScore;
    this.scoreP1 = 0;
    this.scoreP2 = 0;
  }

  addPoint(side) {
    if (side === "p1") {
      this.scoreP1 += 1;
    } else {
      this.scoreP2 += 1;
    }
  }

  checkWinner() {
    if (this.scoreP1 >= this.winScore) return "p1";
    if (this.scoreP2 >= this.winScore) return "p2";
    return null;
  }
}
