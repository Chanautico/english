// Sons gerados com WebAudio (sem arquivos de áudio). Troque por trilha própria
// antes do lançamento se quiser — veja docs/STEAM.md.
(function () {
  let ctx = null, master = null, musicGain = null, musicTimer = null;
  const state = { sfx: true, music: true };

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = 0.12; musicGain.connect(master);
    return ctx;
  }

  function tone(freq, start, dur, type, vol, dest) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(vol, start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g); g.connect(dest || master);
    o.start(start); o.stop(start + dur + 0.05);
  }

  const SFX = {
    click() { tone(880, ctx.currentTime, 0.06, 'triangle', 0.15); },
    blip() { tone(620 + Math.random() * 80, ctx.currentTime, 0.03, 'square', 0.03); },
    success() { const t = ctx.currentTime; [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.08, 0.35, 'triangle', 0.2)); },
    error() { const t = ctx.currentTime; tone(220, t, 0.18, 'sawtooth', 0.08); tone(185, t + 0.12, 0.25, 'sawtooth', 0.08); },
    hint() { const t = ctx.currentTime; tone(988, t, 0.2, 'sine', 0.15); tone(1319, t + 0.1, 0.3, 'sine', 0.12); },
    achievement() { const t = ctx.currentTime; [784, 988, 1175, 1568].forEach((f, i) => tone(f, t + i * 0.07, 0.5, 'sine', 0.18)); },
  };

  // Loop musical tranquilo (progressão estilo lo-fi).
  const CHORDS = [[261.6, 329.6, 392.0, 493.9], [220.0, 261.6, 329.6, 392.0], [174.6, 220.0, 261.6, 329.6], [196.0, 246.9, 293.7, 349.2]];
  let bar = 0;
  function scheduleBar() {
    if (!ctx || !state.music) return;
    const t = ctx.currentTime + 0.05, chord = CHORDS[bar % CHORDS.length];
    chord.forEach((f) => tone(f / 2, t, 2.3, 'sine', 0.25, musicGain));
    [0, 1, 2, 3, 2, 1, 3, 2].forEach((n, i) => tone(chord[n] * 2, t + i * 0.3, 0.4, 'triangle', 0.12, musicGain));
    tone(chord[0] / 4, t, 1.2, 'sine', 0.4, musicGain);
    bar++;
  }

  const Audio = {
    setSfx(on) { state.sfx = on; },
    setMusic(on) {
      state.music = on;
      if (!on && musicTimer) { clearInterval(musicTimer); musicTimer = null; }
      if (on) this.startMusic();
    },
    startMusic() {
      if (!state.music || !ensure()) return;
      if (ctx.state === 'suspended') ctx.resume();
      if (musicTimer) return;
      scheduleBar(); musicTimer = setInterval(scheduleBar, 2400);
    },
    play(name) {
      if (!state.sfx || !ensure()) return;
      if (ctx.state === 'suspended') ctx.resume();
      try { SFX[name] && SFX[name](); } catch (e) { /* ignora */ }
    },
  };
  window.GameAudio = Audio;
})();
