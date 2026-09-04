/**
 * Generates a 3.7s "order received" ringtone as 16-bit PCM WAV.
 * Two incoming-ring bursts, then a shop-bell chime so staff notice it.
 */
const fs = require("fs");
const path = require("path");

const SAMPLE_RATE = 44100;
const DURATION = 3.7;
const TOTAL = Math.round(SAMPLE_RATE * DURATION);
const samples = new Float64Array(TOTAL);

function addTone(freq, startSec, durationSec, peak = 0.32, harmonics = [1, 0.42, 0.18, 0.08]) {
  const start = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(durationSec * SAMPLE_RATE);
  const attack = Math.max(1, Math.floor(0.012 * SAMPLE_RATE));

  for (let i = 0; i < len && start + i < TOTAL; i++) {
    const t = i / SAMPLE_RATE;
    const env =
      i < attack ? i / attack : Math.exp((-3.4 * (i - attack)) / len);
    let wave = 0;
    for (let h = 0; h < harmonics.length; h++) {
      wave += harmonics[h] * Math.sin(2 * Math.PI * freq * (h + 1) * t);
    }
    samples[start + i] += peak * env * wave;
  }
}

function addRingBurst(startSec, durationSec) {
  const start = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(durationSec * SAMPLE_RATE);
  const f1 = 440;
  const f2 = 480;
  const tremolo = 20;

  for (let i = 0; i < len && start + i < TOTAL; i++) {
    const t = i / SAMPLE_RATE;
    const attack = Math.min(1, i / (0.02 * SAMPLE_RATE));
    const release = Math.min(1, (len - i) / (0.05 * SAMPLE_RATE));
    const mod = 0.55 + 0.45 * Math.sin(2 * Math.PI * tremolo * t);
    const wave =
      0.55 * Math.sin(2 * Math.PI * f1 * t) +
      0.45 * Math.sin(2 * Math.PI * f2 * t);
    samples[start + i] += 0.28 * attack * release * mod * wave;
  }
}

addRingBurst(0.0, 0.85);
addRingBurst(1.15, 0.85);
addTone(1318.51, 2.2, 0.55, 0.3);
addTone(1046.5, 2.38, 0.62, 0.26);
addTone(1567.98, 2.95, 0.7, 0.34);
addTone(1174.66, 3.12, 0.55, 0.22);

let peak = 0;
for (let i = 0; i < TOTAL; i++) peak = Math.max(peak, Math.abs(samples[i]));
const norm = peak > 0 ? 0.92 / peak : 1;

const pcm = Buffer.alloc(TOTAL * 2);
for (let i = 0; i < TOTAL; i++) {
  const v = Math.max(-1, Math.min(1, samples[i] * norm));
  pcm.writeInt16LE(Math.round(v * 32767), i * 2);
}

const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + pcm.length, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(1, 22);
header.writeUInt32LE(SAMPLE_RATE, 24);
header.writeUInt32LE(SAMPLE_RATE * 2, 28);
header.writeUInt16LE(2, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(pcm.length, 40);

const outDir = path.join(__dirname, "..", "public", "sounds");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "new-order.wav");
fs.writeFileSync(outFile, Buffer.concat([header, pcm]));
console.log(`Wrote ${outFile} (${(pcm.length / SAMPLE_RATE / 2).toFixed(2)}s)`);
