// Procedural Web Audio API sound synthesizer & Dynamic Courtroom BGM Engine for The Blame Court
class PartyAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmInterval: NodeJS.Timeout | null = null;
  private currentBgmTheme: string | null = null;
  private bgmGainNode: GainNode | null = null;
  private bgmVolume: number = 0.25;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBGM();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setBGMVolume(val: number) {
    this.bgmVolume = Math.max(0, Math.min(1, val));
    if (this.bgmGainNode && this.ctx) {
      this.bgmGainNode.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
    }
  }

  public getBGMVolume(): number {
    return this.bgmVolume;
  }

  // --- PROCEDURAL DRAMATIC BGM SYSTEM (Ace Attorney / Courtroom Style) ---
  public startBGM(theme: 'lobby' | 'court_tension' | 'voting_suspense') {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    if (this.currentBgmTheme === theme && this.bgmInterval) {
      return; // Already playing this theme
    }

    this.stopBGM();
    this.currentBgmTheme = theme;

    this.bgmGainNode = this.ctx.createGain();
    this.bgmGainNode.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
    this.bgmGainNode.connect(this.ctx.destination);

    let step = 0;
    const tempoMs = theme === 'voting_suspense' ? 220 : theme === 'court_tension' ? 280 : 360;

    // Pattern definitions in Hz (Tense minor progression: Dm, F, Gm, A)
    const tensionBassNotes = [73.42, 0, 73.42, 87.31, 0, 98.0, 110.0, 0]; // D2, F2, G2, A2
    const votingBassNotes = [110.0, 110.0, 130.81, 110.0, 146.83, 130.81, 164.81, 146.83]; // Rapid driving rhythm
    const lobbyChords = [146.83, 174.61, 220.0, 174.61]; // Calm warm bouncy Dm / F

    this.bgmInterval = setInterval(() => {
      if (!this.ctx || this.isMuted || !this.bgmGainNode) return;
      const t = this.ctx.currentTime;

      if (theme === 'voting_suspense') {
        // High tension urgent pulse
        const freq = votingBassNotes[step % votingBassNotes.length];
        if (freq > 0) {
          const osc = this.ctx.createOscillator();
          const noteGain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, t);

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(550, t);

          noteGain.gain.setValueAtTime(0.18, t);
          noteGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

          osc.connect(filter);
          filter.connect(noteGain);
          noteGain.connect(this.bgmGainNode);
          osc.start(t);
          osc.stop(t + 0.19);
        }

        // Ticking hi-hat pulse on every beat
        const hatBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.02, this.ctx.sampleRate);
        const data = hatBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const hatSource = this.ctx.createBufferSource();
        hatSource.buffer = hatBuffer;
        const hatFilter = this.ctx.createBiquadFilter();
        hatFilter.type = 'highpass';
        hatFilter.frequency.setValueAtTime(4500, t);
        const hatGain = this.ctx.createGain();
        hatGain.gain.setValueAtTime(step % 2 === 0 ? 0.08 : 0.04, t);
        hatGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
        hatSource.connect(hatFilter);
        hatFilter.connect(hatGain);
        hatGain.connect(this.bgmGainNode);
        hatSource.start(t);
      } else if (theme === 'court_tension') {
        // Courtroom cross-examination walking groove
        const freq = tensionBassNotes[step % tensionBassNotes.length];
        if (freq > 0) {
          const osc = this.ctx.createOscillator();
          const noteGain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);

          noteGain.gain.setValueAtTime(0.22, t);
          noteGain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

          osc.connect(noteGain);
          noteGain.connect(this.bgmGainNode);
          osc.start(t);
          osc.stop(t + 0.25);
        }

        // Mystery chime on step 0 and 4
        if (step % 4 === 0) {
          const chime = this.ctx.createOscillator();
          const chimeGain = this.ctx.createGain();
          chime.type = 'sine';
          chime.frequency.setValueAtTime(step % 8 === 0 ? 587.33 : 659.25, t); // D5 or E5
          chimeGain.gain.setValueAtTime(0.06, t);
          chimeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
          chime.connect(chimeGain);
          chimeGain.connect(this.bgmGainNode);
          chime.start(t);
          chime.stop(t + 0.42);
        }
      } else {
        // Lobby bounce
        const freq = lobbyChords[step % lobbyChords.length];
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        noteGain.gain.setValueAtTime(0.12, t);
        noteGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.connect(noteGain);
        noteGain.connect(this.bgmGainNode);
        osc.start(t);
        osc.stop(t + 0.31);
      }

      step++;
    }, tempoMs);
  }

  public stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.currentBgmTheme = null;
    if (this.bgmGainNode && this.ctx) {
      try {
        this.bgmGainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
      } catch (e) {
        // ignore
      }
    }
  }

  // --- SOUND EFFECTS (SFX) ---

  // Wooden judicial gavel strike: sharp transient crack + deep wooden chamber resonance
  public playGavelStrike() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Transient crack (noise burst)
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.05);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(900, t);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);

    // Deep resonant wood body (decaying sine pulse)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.3);

    gain.gain.setValueAtTime(1.0, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.39);

    // Secondary wooden echo strike (0.1s later)
    setTimeout(() => {
      if (!this.ctx || this.isMuted) return;
      const t2 = this.ctx.currentTime;
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(130, t2);
      osc2.frequency.exponentialRampToValueAtTime(45, t2 + 0.22);
      gain2.gain.setValueAtTime(0.5, t2);
      gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.24);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(t2);
      osc2.stop(t2 + 0.25);
    }, 100);
  }

  // Comical Dramatic Busted Trombone / Sad horn (Wah-wah-wah)
  public playBustedBuzzer() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [290, 270, 250, 220];
    const t = this.ctx.currentTime;

    notes.forEach((freq, index) => {
      const startTime = t + index * 0.18;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);
      if (index === notes.length - 1) {
        osc.frequency.exponentialRampToValueAtTime(freq * 0.65, startTime + 0.45);
      }

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.42);
    });
  }

  // Dramatic "OBJECTION!" / "BÀO CHỮA!" sudden dramatic riser
  public playObjectionWhoosh() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(920, t + 0.18);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.31);
  }

  // Card pickup/hover tactile pop
  public playCardHover() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(540, t);
    osc.frequency.exponentialRampToValueAtTime(720, t + 0.05);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.07);
  }

  // Card slam onto table
  public playCardPlay() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.14);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  // Voting click (finger pointing click)
  public playVoteClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.setValueAtTime(660, t + 0.04);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.11);
  }

  // Floating Emote pop
  public playEmotePop() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600 + Math.random() * 300, t);
    osc.frequency.exponentialRampToValueAtTime(1100, t + 0.08);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  // Countdown second beep
  public playCountdownTick(isFinal: boolean = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isFinal ? 920 : 480, t);

    gain.gain.setValueAtTime(isFinal ? 0.4 : 0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (isFinal ? 0.16 : 0.06));

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.17);
  }

  // Victory / Confetti chord fanfare
  public playVictoryFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, C
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0.2, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t + idx * 0.08);
      osc.stop(t + 0.9);
    });
  }
}

export const partyAudio = new PartyAudioEngine();
