import { GAME_WIDTH } from "../config.js";
import IconButton from "../ui/IconButton.js";
import { touchControls } from "../ui/TouchControls.js";
import { ROTATE_NOTICE_QUERY } from "../ui/RotateNotice.js";

const PAUSE_BUTTON_Y = 30;

// Pausa de una partida (Batalla, Modo Historia o Arcade). Esc o el ícono de
// pausa (arriba al centro) abren PauseScene encima de la partida congelada, y
// en pantallas táctiles la partida se pausa sola si el celular queda vertical.
// También muestra los botones táctiles de los jugadores humanos mientras se
// juega y los esconde en la pausa y al terminar.
//
// options:
// - field: la cancha (para ubicar el ícono en pantalla aunque la cámara esté alejada).
// - touchSides: lados con jugador humano (["p1"] o ["p1", "p2"]).
// - exitTo / exitData / exitLabelKey: a qué escena (y con qué datos) lleva la
//   opción de salir de la pausa, y su texto.
export default class MatchPause {
  constructor(scene, { field, touchSides, exitTo, exitData, exitLabelKey }) {
    this.scene = scene;
    this.touchSides = touchSides;
    this.exitTo = exitTo;
    this.exitData = exitData;
    this.exitLabelKey = exitLabelKey;
    this.isPaused = false;
    this.finished = false;

    scene.input.keyboard.on("keydown-ESC", () => this.pause());
    this.button = new IconButton(scene, 0, 0, "pause", () => this.pause()).placeOnScreen(
      field,
      GAME_WIDTH / 2,
      PAUSE_BUTTON_Y
    );

    this.listenToScene();
  }

  listenToScene() {
    const scene = this.scene;
    const showControls = () => touchControls.show(this.touchSides);
    const onResume = () => {
      this.isPaused = false;
      showControls();
    };
    const onPause = () => touchControls.hide();
    const portrait = window.matchMedia(ROTATE_NOTICE_QUERY);
    const onOrientationChange = () => {
      if (portrait.matches) this.pause();
    };

    showControls();
    scene.events.on("pause", onPause);
    scene.events.on("resume", onResume);
    portrait.addEventListener("change", onOrientationChange);

    // Los eventos de la escena y de la ventana sobreviven a la escena: se sacan al salir.
    scene.events.once("shutdown", () => {
      touchControls.hide();
      scene.events.off("pause", onPause);
      scene.events.off("resume", onResume);
      portrait.removeEventListener("change", onOrientationChange);
    });
  }

  pause() {
    if (this.isPaused || this.finished) return;

    this.isPaused = true;
    this.scene.scene.launch("PauseScene", {
      gameSceneKey: this.scene.scene.key,
      exitTo: this.exitTo,
      exitData: this.exitData,
      exitLabelKey: this.exitLabelKey,
    });
    this.scene.scene.pause();
  }

  // Fin de la partida: ya no se puede pausar y se esconden los controles.
  finish() {
    this.finished = true;
    touchControls.hide();
    this.button.setVisible(false);
  }
}
