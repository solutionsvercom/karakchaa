const STORAGE_KEY = "pos_order_sound_enabled";
const SOUND_PATH = `${import.meta.env.BASE_URL}sounds/new-order.mp3`;

let mp3Audio: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;
let audioUnlocked = false;
let unlockHintShown = false;
let onUnlockHint: (() => void) | null = null;

export function isOrderSoundEnabled(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) return true;
  return stored === "true";
}

export function setOrderSoundEnabled(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY, String(enabled));
}

export function registerAudioUnlockHint(callback: () => void): void {
  onUnlockHint = callback;
}

function getMp3Audio(): HTMLAudioElement {
  if (!mp3Audio) {
    mp3Audio = new Audio(SOUND_PATH);
    mp3Audio.volume = 0.75;
    mp3Audio.preload = "auto";
  }
  return mp3Audio;
}

function playWebAudioChime(): void {
  const ctx = audioContext ?? new AudioContext();
  audioContext = ctx;

  if (ctx.state === "suspended") {
    void ctx.resume();
  }

  const now = ctx.currentTime;
  const tones = [
    { freq: 880, start: 0, duration: 0.12 },
    { freq: 1174.66, start: 0.14, duration: 0.18 },
  ];

  tones.forEach(({ freq, start, duration }) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now + start);
    gain.gain.exponentialRampToValueAtTime(0.35, now + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now + start);
    oscillator.stop(now + start + duration + 0.05);
  });
}

function showUnlockHintOnce(): void {
  if (unlockHintShown || !onUnlockHint) return;
  unlockHintShown = true;
  onUnlockHint();
}

export function unlockAudioOnUserGesture(): void {
  if (audioUnlocked) return;

  audioUnlocked = true;

  try {
    const ctx = audioContext ?? new AudioContext();
    audioContext = ctx;
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
  } catch {
    // ignore
  }

  try {
    const audio = getMp3Audio();
    audio.muted = true;
    const playPromise = audio.play();
    if (playPromise) {
      playPromise
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = false;
        })
        .catch(() => {
          audio.muted = false;
        });
    }
  } catch {
    // ignore
  }
}

export async function playNewOrderSound(): Promise<void> {
  if (!isOrderSoundEnabled()) return;

  try {
    const audio = getMp3Audio();
    audio.currentTime = 0;
    await audio.play();
    audioUnlocked = true;
    return;
  } catch {
    // Fall back to Web Audio chime when mp3 is missing or autoplay is blocked.
  }

  try {
    playWebAudioChime();
    audioUnlocked = true;
  } catch {
    if (!audioUnlocked) {
      showUnlockHintOnce();
    }
  }
}
