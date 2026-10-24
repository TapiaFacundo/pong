import Phaser from "phaser";
import { KEYS } from "../enums/keys.js";
import { EN, ES } from "../enums/languages.js";
import { getPhrase, getTranslations } from "../services/translations.js";
import { getSetting, getDefaultSetting, setSetting, getLanguage } from "../services/SettingsStorage.js";
import { CAN_VIBRATE, vibrate } from "../services/Vibration.js";
import ProgressStorage from "../services/ProgressStorage.js";
import { clearArcadeRecord } from "../services/ArcadeStorage.js";
import { playPaddleHit } from "../systems/SoundEffects.js";
import { shakeCamera } from "../systems/FeelEffects.js";
import MenuList from "../ui/MenuList.js";
import { addBackNavigation } from "../ui/IconButton.js";
import { addTitle, addOverlayBackdrop, menuTop, MENU_FONT_SIZE, MENU_SPACING } from "../ui/ScreenLayout.js";

// Los nombres de los idiomas van siempre en su idioma: no se traducen.
const LANGUAGES = [
  { id: ES, label: "Español" },
  { id: EN, label: "English" },
];
const VOLUMES = [0, 25, 50, 75, 100];
const YES_NO = [{ labelKey: KEYS.SI }, { labelKey: KEYS.NO }];
const DELETE_GAP = 20;
// Al activar una opción se muestra cómo es: un sacudón, un destello o una vibración.
const PREVIEW_SHAKE = { duration: 200, intensity: 0.008 };
const PREVIEW_FLASH = { duration: 250, gray: 90 };
const PREVIEW_VIBRATION = 40;

// Opciones del juego: idioma, volumen, sacudir la pantalla, destellos,
// vibración (solo en pantallas táctiles que la soportan) y borrar el
// progreso (con confirmación). Cada cambio se guarda en el momento (ver
// services/SettingsStorage.js).
//
// Se abre desde el ícono ⚙ del menú (pantalla propia) o desde "Opciones" en
// la pausa (encima de ella, que queda pausada abajo). Volver (Esc o ←)
// regresa a donde se abrió.
export default class OptionsScene extends Phaser.Scene {
  constructor() {
    super("OptionsScene");
  }

  // data.returnTo: "MenuScene" o "PauseScene".
  init(data) {
    this.returnTo = data.returnTo ?? "MenuScene";
    this.overPause = this.returnTo === "PauseScene";
    this.deleteState = "idle"; // "idle" → "confirm" → "done"
    this.languageRequest = 0;
  }

  create() {
    if (this.overPause) addOverlayBackdrop(this);
    this.title = addTitle(this, getPhrase(KEYS.OPCIONES));

    const items = [
      this.languageRow(),
      this.volumeRow(),
      this.toggleRow(KEYS.SACUDIR_LA_PANTALLA, "screenShake", () =>
        shakeCamera(this, PREVIEW_SHAKE.duration, PREVIEW_SHAKE.intensity)
      ),
      this.toggleRow(KEYS.DESTELLOS, "flashes", () => {
        const { duration, gray } = PREVIEW_FLASH;
        this.cameras.main.flash(duration, gray, gray, gray);
      }),
    ];
    if (CAN_VIBRATE) {
      items.push(this.toggleRow(KEYS.VIBRACION, "vibration", () => vibrate(PREVIEW_VIBRATION)));
    }
    items.push({ labelKey: KEYS.BORRAR_PROGRESO, action: () => this.deleteProgress(), gapBefore: DELETE_GAP });
    this.deleteIndex = items.length - 1;

    this.menu = new MenuList(this, {
      y: menuTop(items.length) - DELETE_GAP / 2,
      spacing: MENU_SPACING,
      fontSize: MENU_FONT_SIZE,
      items,
    });

    addBackNavigation(this, () => this.goBack());
  }

  update() {
    // Si se pidió confirmar el borrado y se pasó a otra opción, se cancela.
    const deleteFocused = this.menu.iconIndex === null && this.menu.selectedIndex === this.deleteIndex;
    if (this.deleteState === "confirm" && !deleteFocused) this.setDeleteState("idle");
  }

  languageRow() {
    const index = Math.max(0, LANGUAGES.findIndex(({ id }) => id === getLanguage()));
    return {
      labelKey: KEYS.IDIOMA,
      options: LANGUAGES,
      index,
      onChange: (optionIndex) => this.changeLanguage(LANGUAGES[optionIndex].id),
    };
  }

  // Al cambiarlo suena un golpe con el volumen nuevo.
  volumeRow() {
    const indexOf = (volume) => Math.max(0, VOLUMES.indexOf(volume));
    return {
      labelKey: KEYS.VOLUMEN,
      options: VOLUMES.map((volume) => ({ label: `${volume}%` })),
      index: indexOf(getSetting("volume")),
      defaultIndex: indexOf(getDefaultSetting("volume")),
      onChange: (index) => {
        setSetting("volume", VOLUMES[index]);
        playPaddleHit();
      },
    };
  }

  // Fila Sí / No de una opción. onEnable: muestra cómo es al activarla.
  toggleRow(labelKey, setting, onEnable) {
    const indexOf = (enabled) => (enabled ? 0 : 1);
    return {
      labelKey,
      options: YES_NO,
      index: indexOf(getSetting(setting)),
      defaultIndex: indexOf(getDefaultSetting(setting)),
      onChange: (index) => {
        setSetting(setting, index === 0);
        if (index === 0) onEnable();
      },
    };
  }

  // Las traducciones llegan de internet: si mientras tanto se eligió otro
  // idioma, la respuesta vieja se descarta y se vuelve a cargar el elegido.
  changeLanguage(language) {
    setSetting("language", language);
    const request = ++this.languageRequest;

    getTranslations(language, () => {
      if (request !== this.languageRequest) {
        getTranslations(getSetting("language")).catch(() => {});
        return;
      }
      if (this.scene.isActive()) this.refreshTexts();
    }).catch(() => {});
  }

  refreshTexts() {
    this.title.setText(getPhrase(KEYS.OPCIONES));
    this.menu.refreshTexts();
  }

  // Primero pide confirmación; la segunda vez borra el progreso del Modo
  // Historia y el récord del Arcade (las opciones y el idioma quedan).
  deleteProgress() {
    if (this.deleteState === "idle") {
      this.setDeleteState("confirm");
    } else if (this.deleteState === "confirm") {
      new ProgressStorage().reset();
      clearArcadeRecord();
      this.setDeleteState("done");
    }
  }

  setDeleteState(state) {
    const labels = {
      idle: KEYS.BORRAR_PROGRESO,
      confirm: KEYS.BORRAR_TODO_CONFIRMAR,
      done: KEYS.PROGRESO_BORRADO,
    };
    this.deleteState = state;
    this.menu.items[this.deleteIndex].labelKey = labels[state];
    this.menu.refreshTexts();
  }

  goBack() {
    if (this.overPause) {
      this.scene.stop();
      this.scene.resume("PauseScene");
    } else {
      this.scene.start("MenuScene");
    }
  }
}
