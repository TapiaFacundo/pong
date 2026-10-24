let audioContext = null;

function getContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

// Cuánto puede variar al azar el tono de los sonidos que se repiten mucho
// (golpes), para que no suenen siempre idénticos.
const PITCH_VARIATION = 0.04;

function varied(frequency) {
  return frequency * (1 + (Math.random() * 2 - 1) * PITCH_VARIATION);
}

function playTone({ frequency, duration, type = "sine", delay = 0, volume = 0.2 }) {
  const context = getContext();
  const startTime = context.currentTime + delay;

  const oscillator = context.createOscillator();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);

  const gain = context.createGain();
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

export function playPowerUpPickup() {
  playTone({ frequency: 660, duration: 0.12, type: "square" });
  playTone({ frequency: 990, duration: 0.1, type: "square", delay: 0.08 });
}

// Ladrillo del Arcade: más agudo si se rompe que si solo se agrieta. streak:
// cuántos se rompieron seguidos antes que este; cada uno sube un semitono.
export function playBrickHit(broken, streak = 0) {
  const frequency = (broken ? 520 : 330) * 2 ** (streak / 12);
  playTone({ frequency, duration: 0.06, type: "square", volume: 0.12 });
}

// Pelota contra un ladrillo de metal: un "clink" metálico.
export function playMetalHit() {
  playTone({ frequency: 1400, duration: 0.05, type: "triangle", volume: 0.15 });
}

// Rayos del láser del Arcade.
export function playLaserShot() {
  playTone({ frequency: 1200, duration: 0.05, type: "sawtooth", volume: 0.06 });
}

// Pelota explosiva del Arcade: un estallido grave.
export function playExplosion() {
  playTone({ frequency: 120, duration: 0.25, type: "sawtooth", volume: 0.2 });
  playTone({ frequency: 70, duration: 0.3, type: "square", volume: 0.15, delay: 0.03 });
}

// El muro del Arcade avanza un paso: un golpe grave.
export function playWallAdvance() {
  playTone({ frequency: 90, duration: 0.2, type: "sawtooth", volume: 0.15 });
}

// intensity (0 a 1): qué tan rápida va la pelota. Más rápida, más agudo: un
// peloteo largo se escucha cada vez más tenso.
export function playPaddleHit(intensity = 0) {
  playTone({ frequency: varied(220 * (1 + 0.6 * intensity)), duration: 0.07, type: "sine", volume: 0.25 });
}

// Pelota contra el techo, el piso o una pared: un "tic" más grave y suave que el de la pala.
export function playWallBounce() {
  playTone({ frequency: varied(150), duration: 0.05, type: "sine", volume: 0.15 });
}

export function playCannonShot() {
  playTone({ frequency: 120, duration: 0.25, type: "sawtooth", volume: 0.3 });
  playTone({ frequency: 70, duration: 0.35, type: "square", volume: 0.2, delay: 0.03 });
}

// Pequeña fanfarria ascendente para la pantalla final del Modo Historia.
export function playVictoryFanfare() {
  [523, 659, 784, 1047].forEach((frequency, index) => {
    playTone({ frequency, duration: index === 3 ? 0.5 : 0.15, type: "square", volume: 0.15, delay: index * 0.15 });
  });
}

export function playScore() {
  playTone({ frequency: 440, duration: 0.15, type: "sawtooth", volume: 0.22 });
  playTone({ frequency: 220, duration: 0.25, type: "sawtooth", volume: 0.18, delay: 0.1 });
}

// Punto en contra (de la CPU) o vida perdida en el Arcade: tres notas que bajan.
export function playConcede() {
  [330, 262, 196].forEach((frequency, index) => {
    playTone({ frequency, duration: index === 2 ? 0.3 : 0.12, type: "triangle", volume: 0.22, delay: index * 0.1 });
  });
}
