const fs = require("fs");
const path = require("path");

const sampleRate = 22050;
const bpm = 72;
const beat = 60 / bpm;
const melody = [
	[261.63, 1],
	[329.63, 1],
	[392.0, 1],
	[523.25, 2],
	[392.0, 1],
	[329.63, 1],
	[261.63, 2],
	[293.66, 1],
	[349.23, 1],
	[440.0, 1],
	[523.25, 2],
	[440.0, 1],
	[349.23, 1],
	[293.66, 2],
	[246.94, 1],
	[329.63, 1],
	[392.0, 1],
	[493.88, 2],
	[392.0, 1],
	[329.63, 1],
	[261.63, 3],
];

const notes = [...melody, ...melody];
const totalSeconds = notes.reduce((sum, [, beats]) => sum + beats * beat, 0);
const sampleCount = Math.floor(totalSeconds * sampleRate);
const samples = new Float32Array(sampleCount);
let cursor = 0;

const envelope = (t, duration) => {
	const attack = 0.04;
	const release = Math.min(0.28, duration * 0.35);
	if (t < attack) return t / attack;
	if (t > duration - release) return Math.max(0, (duration - t) / release);
	return 1;
};

for (const [freq, beats] of notes) {
	const duration = beats * beat;
	const length = Math.floor(duration * sampleRate);
	for (let i = 0; i < length && cursor + i < sampleCount; i += 1) {
		const t = i / sampleRate;
		const amp = envelope(t, duration);
		const fundamental = Math.sin(2 * Math.PI * freq * t);
		const harmonic = 0.35 * Math.sin(2 * Math.PI * freq * 2 * t);
		const pad = 0.18 * Math.sin(2 * Math.PI * (freq / 2) * t);
		samples[cursor + i] += (fundamental + harmonic + pad) * amp * 0.22;
	}
	cursor += length;
}

const buffer = Buffer.alloc(44 + sampleCount * 2);
buffer.write("RIFF", 0);
buffer.writeUInt32LE(36 + sampleCount * 2, 4);
buffer.write("WAVE", 8);
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(1, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * 2, 28);
buffer.writeUInt16LE(2, 32);
buffer.writeUInt16LE(16, 34);
buffer.write("data", 36);
buffer.writeUInt32LE(sampleCount * 2, 40);

for (let i = 0; i < sampleCount; i += 1) {
	const clipped = Math.max(-1, Math.min(1, samples[i]));
	buffer.writeInt16LE(Math.round(clipped * 32767), 44 + i * 2);
}

const outDir = path.join(__dirname, "..", "public", "music");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "default.wav");
fs.writeFileSync(outFile, buffer);
console.log(`wrote ${outFile} (${buffer.length} bytes)`);
