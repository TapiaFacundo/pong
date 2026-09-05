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
