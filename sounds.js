/* ===== SOUND SYSTEM ===== */
const SOUND_FILES = {
  snore: "sounds/snore.mp3",   // BulldogSnort (loops softly while Butch sleeps)
  whine: "sounds/whine.mp3",   // HQ Dog Whining (Restless)
  growl: "sounds/growl.mp3",   // Baby Bulldog (Alert / Almost awake)
  bark:  "sounds/bark.mp3"     // Barking Dog 1 (Butch wakes up)
};
const Sound = (() => {
  let ctx = null, muted = false, snoreTimer = null;
  const audio = {}, missing = {}, stopTimers = {};
  Object.entries(SOUND_FILES).forEach(([k, src]) => {
    const a = new Audio(src); a.preload = "auto";
    a.addEventListener("error", () => { missing[k] = true; });
    audio[k] = a;
  });

  function init() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
  }
  function tone(freq, dur, type = "sine", vol = 0.2, delay = 0, slideTo = null) {
    if (muted || !ctx) return;
    const t = ctx.currentTime + delay, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur);
  }
  function noise(dur, vol = 0.15, cutoff = 400, delay = 0) {
    if (muted || !ctx) return;
    const t = ctx.currentTime + delay, len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = buf; f.type = "lowpass"; f.frequency.value = cutoff;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f).connect(g).connect(ctx.destination); s.start(t);
  }
  // play a real file for maxMs (fades out); returns false if the file is missing
  function file(name, maxMs, vol = 0.7) {
    const a = audio[name];
    if (muted) return true;
    if (missing[name] || !a) return false;
    clearTimeout(stopTimers[name]);
    a.loop = false; a.currentTime = 0; a.volume = vol;
    a.play().catch(() => { missing[name] = true; });
    stopTimers[name] = setTimeout(() => {
      let v = a.volume; const f = setInterval(() => {
        v -= 0.1; if (v <= 0) { clearInterval(f); a.pause(); } else a.volume = v;
      }, 40);
    }, maxMs);
    return true;
  }

  const effects = {
    pickup: () => tone(500, 0.08, "triangle", 0.15, 0, 700),
    miss: () => { tone(160, 0.18, "sine", 0.25, 0, 70); noise(0.1, 0.1, 300); },
    bone: type => {
      if (type === "gold") [880, 1175, 1568].forEach((f, i) => tone(f, 0.25, "triangle", 0.2, i * 0.09));
      else if (type === "blue") [660, 880].forEach((f, i) => tone(f, 0.2, "triangle", 0.18, i * 0.08));
      else tone(660, 0.15, "triangle", 0.16);
    },
    stage1: () => file("whine", 1500) || tone(700, 0.6, "sine", 0.15, 0, 350),
    stage2: () => file("growl", 1500) || (tone(90, 0.6, "sawtooth", 0.12, 0, 70), noise(0.6, 0.06, 250)),
    stage3: () => file("growl", 2000, 0.85) || (tone(75, 0.9, "sawtooth", 0.18, 0, 60), noise(0.9, 0.1, 300)),
    stage4: () => file("bark", 2000, 1) || [0, 0.25].forEach(d => { tone(220, 0.18, "sawtooth", 0.25, d, 110); noise(0.18, 0.2, 900, d); }),
    win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.3, "triangle", 0.22, i * 0.13)),
    lose: () => [400, 330, 260, 190].forEach((f, i) => tone(f, 0.3, "sawtooth", 0.14, i * 0.16)),
    tick: () => tone(1000, 0.05, "square", 0.08),
    formError: () => { tone(200, 0.15, "square", 0.12); tone(160, 0.2, "square", 0.12, 0.12); },
    formSuccess: () => [660, 880].forEach((f, i) => tone(f, 0.2, "triangle", 0.2, i * 0.1))
  };

  function snoreOn() {
    if (muted || snoreTimer) return;
    if (!missing.snore) {
      const a = audio.snore; a.loop = true; a.volume = 0.25;
      a.play().catch(() => { missing.snore = true; });
    }
    if (missing.snore) {           // code-made snoring fallback
      const s = () => { noise(1.1, 0.08, 220); tone(70, 1.1, "sine", 0.05, 0, 55); };
      s(); snoreTimer = setInterval(s, 3200);
    }
  }
  function snoreOff() {
    audio.snore.pause(); clearInterval(snoreTimer); snoreTimer = null;
  }
  return {
    init,
    play: (name, arg) => { if (ctx || name) effects[name] && effects[name](arg); },
    snoreOn, snoreOff,
    stopAll: () => { snoreOff(); Object.keys(audio).forEach(k => audio[k].pause()); },
    toggleMute: () => { muted = !muted; if (muted) Sound.stopAll(); return muted; },
    isMuted: () => muted
  };
})();
