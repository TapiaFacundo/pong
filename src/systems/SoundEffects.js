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

// Ladrillo del Arcade: más agudo si se rompe que si solo se agrieta.
export function playBrickHit(broken) {
  playTone({ frequency: broken ? 520 : 330, duration: 0.06, type: "square", volume: 0.12 });
}

// Pelota contra un ladrillo de metal: un "clink" metálico.
export function playMetalHit() {
  playTone({ frequency: 1400, duration: 0.05, type: "triangle", volume: 0.15 });
}

// El muro del Arcade avanza un paso: un golpe grave.
export function playWallAdvance() {
  playTone({ frequency: 90, duration: 0.2, type: "sawtooth", volume: 0.15 });
}

export function playPaddleHit() {
  playTone({ frequency: 220, duration: 0.07, type: "sine", volume: 0.25 });
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
