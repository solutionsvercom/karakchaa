const PLACED_PATH = `${import.meta.env.BASE_URL}sounds/order-placed.wav`;
const READY_PATH = `${import.meta.env.BASE_URL}sounds/order-ready.wav`;
const READY_PLAYED_PREFIX = "digitalmenu_ready_played_";

let audioContext: AudioContext | null = null;
let placedAudio: HTMLAudioElement | null = null;
let readyAudio: HTMLAudioElement | null = null;

function getAudio(existing: HTMLAudioElement | null, src: string): HTMLAudioElement {
  if (existing) return existing;
  const audio = new Audio(src);
  audio.preload = "auto";
  audio.volume = 1;
  return audio;
}

function getPlacedAudio(): HTMLAudioElement {
  placedAudio = getAudio(placedAudio, PLACED_PATH);
  return placedAudio;
}

function getReadyAudio(): HTMLAudioElement {
  readyAudio = getAudio(readyAudio, READY_PATH);
  return readyAudio;
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
  peak = 0.3
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

function playPlacedFallback(ctx: AudioContext): void {
  const now = ctx.currentTime;
  playTone(ctx, 1046.5, now, 0.35, 0.28);
  playTone(ctx, 1318.51, now + 0.2, 0.4, 0.3);
  playTone(ctx, 1567.98, now + 0.42, 0.55, 0.32);
}

function playReadyFallback(ctx: AudioContext): void {
  const now = ctx.currentTime;
  playTone(ctx, 523.25, now, 0.45, 0.3);
  playTone(ctx, 659.25, now + 0.16, 0.5, 0.28);
  playTone(ctx, 783.99, now + 0.7, 0.55, 0.32);
  playTone(ctx, 1046.5, now + 0.92, 0.7, 0.34);
  playTone(ctx, 783.99, now + 1.65, 0.45, 0.26);
  playTone(ctx, 1046.5, now + 1.9, 0.75, 0.34);
}

async function playWav(audio: HTMLAudioElement, fallback: (ctx: AudioContext) => void): Promise<void> {
  try {
    audio.muted = false;
    audio.volume = 1;
    audio.currentTime = 0;
    await audio.play();
    return;
  } catch {
    // Fall back to generated tones if the file cannot play.
  }

  try {
    const ctx = await ensureAudioContext();
    if (ctx?.state === "running") {
      fallback(ctx);
    }
  } catch {
    // ignore
  }
}

export async function unlockCustomerAudio(): Promise<void> {
  try {
    await ensureAudioContext();
  } catch {
    // ignore
  }

  const unlockOne = async (audio: HTMLAudioElement) => {
    try {
      audio.muted = true;
      audio.volume = 0;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
      audio.volume = 1;
    } catch {
      audio.muted = false;
      audio.volume = 1;
    }
  };

  await Promise.all([unlockOne(getPlacedAudio()), unlockOne(getReadyAudio())]);
}

export async function playOrderPlacedSound(): Promise<void> {
  await playWav(getPlacedAudio(), playPlacedFallback);
}

export async function playOrderReadySound(orderId?: string): Promise<void> {
  if (orderId) {
    const key = `${READY_PLAYED_PREFIX}${orderId}`;
    try {
      if (sessionStorage.getItem(key) === "1") return;
      sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage may be unavailable; still play once this session via caller refs.
    }
  }
  await playWav(getReadyAudio(), playReadyFallback);
}
