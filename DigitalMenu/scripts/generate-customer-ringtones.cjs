/**
 * Generates two 16-bit PCM WAV ringtones for the customer Digital Menu:
 * - order-placed.wav  (~1.5s confirmation chime)
 * - order-ready.wav   (~3.0s collect alert)
 */
const fs = require("fs");
const path = require("path");

const SAMPLE_RATE = 44100;

function writeWav(samples, outFile) {
  let peak = 0;
  for (let i = 0; i < samples.length; i++) peak = Math.max(peak, Math.abs(samples[i]));
  const norm = peak > 0 ? 0.92 / peak : 1;

  const pcm = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) {
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

  fs.writeFileSync(outFile, Buffer.concat([header, pcm]));
  console.log(`Wrote ${outFile} (${(pcm.length / SAMPLE_RATE / 2).toFixed(2)}s)`);
}

function addTone(samples, freq, startSec, durationSec, peak = 0.32, harmonics = [1, 0.42, 0.18, 0.08]) {
  const start = Math.floor(startSec * SAMPLE_RATE);
  const len = Math.floor(durationSec * SAMPLE_RATE);
  const attack = Math.max(1, Math.floor(0.012 * SAMPLE_RATE));

  for (let i = 0; i < len && start + i < samples.length; i++) {
    const t = i / SAMPLE_RATE;
    const env = i < attack ? i / attack : Math.exp((-3.4 * (i - attack)) / len);
    let wave = 0;
    for (let h = 0; h < harmonics.length; h++) {
      wave += harmonics[h] * Math.sin(2 * Math.PI * freq * (h + 1) * t);
    }
    samples[start + i] += peak * env * wave;
  }
}

function addBell(samples, freq, startSec, durationSec, peak = 0.36) {
  addTone(samples, freq, startSec, durationSec, peak, [1, 0.55, 0.28, 0.12, 0.06]);
}

function makePlaced() {
  const duration = 1.5;
  const samples = new Float64Array(Math.round(SAMPLE_RATE * duration));
  addBell(samples, 1046.5, 0.0, 0.42, 0.34);
  addBell(samples, 1318.51, 0.22, 0.48, 0.36);
  addBell(samples, 1567.98, 0.48, 0.72, 0.4);
  return samples;
}

function makeReady() {
  const duration = 3.0;
  const samples = new Float64Array(Math.round(SAMPLE_RATE * duration));
  addBell(samples, 523.25, 0.0, 0.55, 0.34);
  addBell(samples, 659.25, 0.18, 0.62, 0.32);
  addBell(samples, 783.99, 0.72, 0.7, 0.38);
  addBell(samples, 1046.5, 0.95, 0.85, 0.4);
  addBell(samples, 783.99, 1.7, 0.55, 0.3);
  addBell(samples, 1046.5, 1.95, 0.9, 0.42);
  return samples;
}

const outDir = path.join(__dirname, "..", "public", "sounds");
fs.mkdirSync(outDir, { recursive: true });
writeWav(makePlaced(), path.join(outDir, "order-placed.wav"));
writeWav(makeReady(), path.join(outDir, "order-ready.wav"));
