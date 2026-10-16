// Fases del jefe final (El Campeón): cada fase arranca cuando el jugador llega
// a `fromPlayerScore` puntos. Si un punto doble lo hace saltar dos fases a la
// vez, se aplican las dos en orden. Las fases están numeradas desde 2 (la 1 es
// cómo empieza el nivel).
export default class BossPhases {
  // onEnterPhase(phase, number): aplica la fase (lo provee GameScene).
  constructor(phases, onEnterPhase) {
    this.phases = phases;
    this.onEnterPhase = onEnterPhase;
    this.nextIndex = 0;
  }

  update(playerScore) {
    while (this.nextIndex < this.phases.length && playerScore >= this.phases[this.nextIndex].fromPlayerScore) {
      const phase = this.phases[this.nextIndex];
      this.nextIndex++;
      this.onEnterPhase(phase, this.nextIndex + 1);
    }
  }
}
