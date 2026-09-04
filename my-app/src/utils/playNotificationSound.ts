const STORAGE_KEY = "pos_order_sound_enabled";
const SOUND_PATH = `${import.meta.env.BASE_URL}sounds/new-order.wav`;

let ringtoneAudio: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;
let audioUnlocked = false;
let unlockHintShown = false;
let onUnlockHint: (() => void) | null = null;
const unlockSubscribers = new Set<(unlocked: boolean) => void>();

export function isOrderSoundEnabled(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) return true;
  return stored === "true";
}

export function setOrderSoundEnabled(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY, String(enabled));
}

export function isAudioUnlocked(): boolean {
  return audioUnlocked;
}

export function registerAudioUnlockHint(callback: () => void): void {
  onUnlockHint = callback;
}

export function subscribeAudioUnlock(callback: (unlocked: boolean) => void): () => void {
  unlockSubscribers.add(callback);
  callback(audioUnlocked);
  return () => {
    unlockSubscribers.delete(callback);
  };
}

function notifyUnlockChange(): void {
  unlockSubscribers.forEach((callback) => callback(audioUnlocked));
}

function getRingtoneAudio(): HTMLAudioElement {
  if (!ringtoneAudio) {
    ringtoneAudio = new Audio(SOUND_PATH);
    ringtoneAudio.preload = "auto";
    ringtoneAudio.volume = 1;
  }
  return ringtoneAudio;
}

async function ensureAudioContext(): Promise<AudioContext | null> {
  try {
    const Ctx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;

    audioContext = audioContext ?? new Ctx();
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }
    return audioContext;
  } catch {
    return null;
  }
}

function playTone(
  ctx: AudioContext,
  freq: number,
  start: number,
  duration: number,
  peak = 0.28
) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "triangle";
  oscillator.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
}

function playRingBurst(ctx: AudioContext, start: number, duration: number) {
  [880, 960].forEach((freq) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(0.32, start + 0.03);
    gain.gain.linearRampToValueAtTime(0.32, start + duration - 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  });
}

function playWebAudioChime(ctx: AudioContext): void {
  const now = ctx.currentTime;
  playRingBurst(ctx, now, 0.85);
  playRingBurst(ctx, now + 1.15, 0.85);
  playTone(ctx, 1318.51, now + 2.2, 0.55, 0.3);
  playTone(ctx, 1046.5, now + 2.38, 0.62, 0.24);
  playTone(ctx, 1567.98, now + 2.95, 0.7, 0.34);
  playTone(ctx, 1174.66, now + 3.12, 0.55, 0.22);
}

function markUnlocked(): void {
  if (audioUnlocked) return;
  audioUnlocked = true;
  unlockHintShown = false;
  notifyUnlockChange();
}

function showUnlockHintOnce(): void {
  if (unlockHintShown || !onUnlockHint) return;
  unlockHintShown = true;
  onUnlockHint();
}

export async function unlockAudioOnUserGesture(): Promise<boolean> {
  if (audioUnlocked) return true;

  try {
    const ctx = await ensureAudioContext();
    const audio = getRingtoneAudio();
    audio.muted = true;
    audio.volume = 0;
    await audio.play();
    audio.pause();
    audio.currentTime = 0;
    audio.muted = false;
    audio.volume = 1;
    if (!ctx || ctx.state === "running") {
      markUnlocked();
      return true;
    }
  } catch {
    // Browser still blocking audio until a stronger gesture.
  }

  try {
    const ctx = await ensureAudioContext();
    if (ctx?.state === "running") {
      markUnlocked();
      return true;
    }
  } catch {
    // ignore
  }

  return audioUnlocked;
}

export function installAudioUnlockListeners(): () => void {
  const tryUnlock = () => {
    void unlockAudioOnUserGesture();
  };

  const options: AddEventListenerOptions = { capture: true };
  window.addEventListener("pointerdown", tryUnlock, options);
  window.addEventListener("touchstart", tryUnlock, options);
  window.addEventListener("click", tryUnlock, options);
  window.addEventListener("keydown", tryUnlock, options);

  return () => {
    window.removeEventListener("pointerdown", tryUnlock, options);
    window.removeEventListener("touchstart", tryUnlock, options);
    window.removeEventListener("click", tryUnlock, options);
    window.removeEventListener("keydown", tryUnlock, options);
  };
}

export async function playNewOrderSound(): Promise<void> {
  if (!isOrderSoundEnabled()) return;

  try {
    const audio = getRingtoneAudio();
    audio.muted = false;
    audio.volume = 1;
    audio.currentTime = 0;
    await audio.play();
    markUnlocked();
    return;
  } catch {
    // Fall back to a generated ring if the file is blocked or missing.
  }

  try {
    const ctx = await ensureAudioContext();
    if (ctx?.state === "running") {
      playWebAudioChime(ctx);
      markUnlocked();
      return;
    }
  } catch {
    // ignore
  }

  if (!audioUnlocked) {
    showUnlockHintOnce();
  }
}
