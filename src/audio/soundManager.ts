/**
 * Digital Expedition: Mouse Island - Sound & Audio Engine
 * Pure Web Audio API synthesized sound effects and procedural background music.
 * 100% reliable, zero network latency, zero broken external file links.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  // Audio State
  public bgmEnabled: boolean = true;
  public sfxEnabled: boolean = true;
  public voiceEnabled: boolean = true;
  public bgmVolume: number = 0.35;
  public sfxVolume: number = 0.7;

  // BGM Engine
  private isBgmPlaying: boolean = false;
  private bgmTimer: number | null = null;
  private currentStep: number = 0;

  // Animalese Voice cache
  private isSpeaking: boolean = false;

  constructor() {
    // Load preferences from localStorage if available
    try {
      const savedBgm = localStorage.getItem('mouse_island_bgm');
      if (savedBgm !== null) this.bgmEnabled = savedBgm === 'true';
      const savedSfx = localStorage.getItem('mouse_island_sfx');
      if (savedSfx !== null) this.sfxEnabled = savedSfx === 'true';
      const savedVoice = localStorage.getItem('mouse_island_voice');
      if (savedVoice !== null) this.voiceEnabled = savedVoice === 'true';
      const savedBgmVol = localStorage.getItem('mouse_island_bgm_vol');
      if (savedBgmVol) this.bgmVolume = parseFloat(savedBgmVol);
      const savedSfxVol = localStorage.getItem('mouse_island_sfx_vol');
      if (savedSfxVol) this.sfxVolume = parseFloat(savedSfxVol);
    } catch {
      // Ignore
    }
  }

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.bgmEnabled ? this.bgmVolume : 0, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxEnabled ? this.sfxVolume : 0, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setBgmEnabled(enabled: boolean) {
    this.bgmEnabled = enabled;
    localStorage.setItem('mouse_island_bgm', String(enabled));
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setTargetAtTime(enabled ? this.bgmVolume : 0, this.ctx.currentTime, 0.1);
    }
    if (enabled && !this.isBgmPlaying) {
      this.startBgm();
    } else if (!enabled && this.isBgmPlaying) {
      this.stopBgm();
    }
  }

  public setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
    localStorage.setItem('mouse_island_sfx', String(enabled));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(enabled ? this.sfxVolume : 0, this.ctx.currentTime, 0.05);
    }
  }

  public setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
    localStorage.setItem('mouse_island_voice', String(enabled));
  }

  public setBgmVolume(vol: number) {
    this.bgmVolume = vol;
    localStorage.setItem('mouse_island_bgm_vol', String(vol));
    if (this.bgmGain && this.ctx && this.bgmEnabled) {
      this.bgmGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);
    }
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = vol;
    localStorage.setItem('mouse_island_sfx_vol', String(vol));
    if (this.sfxGain && this.ctx && this.sfxEnabled) {
      this.sfxGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);
    }
  }

  /* ============================================================
     BGM Engine: Upbeat, Cheerful Adventure Island Melody
     ============================================================ */
  public startBgm() {
    this.init();
    if (!this.bgmEnabled || this.isBgmPlaying || !this.ctx) return;
    this.isBgmPlaying = true;
    this.currentStep = 0;

    const tempo = 120; // 120 BPM
    const stepDuration = 60 / tempo / 2; // eighth notes

    // Melody scale (Pentatonic/Diatonic Major, cheerful C Major)
    // C4=261.63, D4=293.66, E4=329.63, F4=349.23, G4=392.00, A4=440.00, B4=493.88, C5=523.25, D5=587.33, E5=659.25, G5=783.99
    const notes: (number | null)[] = [
      // Measure 1 (C Major)
      523.25, 659.25, 783.99, 659.25, 523.25, 392.0, 523.25, null,
      // Measure 2 (A Minor)
      440.0, 523.25, 659.25, 523.25, 440.0, 329.63, 440.0, 523.25,
      // Measure 3 (F Major)
      349.23, 440.0, 523.25, 587.33, 659.25, 523.25, 440.0, null,
      // Measure 4 (G Major)
      392.0, 493.88, 587.33, 659.25, 783.99, 659.25, 587.33, 493.88,
      // Measure 5 (High playful flourish)
      523.25, 587.33, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33,
      // Measure 6
      659.25, 523.25, 440.0, 523.25, 392.0, 523.25, 659.25, null,
      // Measure 7
      698.46, 659.25, 587.33, 523.25, 440.0, 523.25, 587.33, 659.25,
      // Measure 8
      783.99, null, 659.25, null, 587.33, 493.88, 523.25, null,
    ];

    const bassNotes: (number | null)[] = [
      130.81, null, 196.0, null, 130.81, null, 196.0, null, // C3, G3
      110.0, null, 164.81, null, 110.0, null, 164.81, null, // A2, E3
      87.31, null, 130.81, null, 87.31, null, 130.81, null, // F2, C3
      98.0, null, 146.83, null, 98.0, null, 146.83, null, // G2, D3
      130.81, null, 196.0, null, 130.81, null, 196.0, null,
      110.0, null, 164.81, null, 110.0, null, 164.81, null,
      87.31, null, 130.81, null, 87.31, null, 130.81, null,
      98.0, null, 146.83, null, 98.0, null, 130.81, null,
    ];

    const tick = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.bgmGain) return;

      const idx = this.currentStep % notes.length;
      const note = notes[idx];
      const bass = bassNotes[idx];

      const now = this.ctx.currentTime;

      // Play melody note (chime/marimba timbre)
      if (note && this.bgmEnabled) {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        // Warm rounded wave
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note, now);

        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(0.08, now + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.5);

        osc.connect(noteGain);
        noteGain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + stepDuration * 1.6);
      }

      // Play bass note
      if (bass && this.bgmEnabled) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();

        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(bass, now);

        bassGain.gain.setValueAtTime(0.001, now);
        bassGain.gain.linearRampToValueAtTime(0.12, now + 0.03);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.8);

        bassOsc.connect(bassGain);
        bassGain.connect(this.bgmGain);

        bassOsc.start(now);
        bassOsc.stop(now + stepDuration * 1.9);
      }

      // Play light woodblock / click percussion on beats 0, 4, 8...
      if (idx % 2 === 0 && this.bgmEnabled) {
        this.playDrumTick(now, idx % 4 === 0);
      }

      this.currentStep++;
      this.bgmTimer = window.setTimeout(tick, stepDuration * 1000);
    };

    tick();
  }

  private playDrumTick(time: number, isDownbeat: boolean) {
    if (!this.ctx || !this.bgmGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isDownbeat ? 220 : 350, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.05);

    gain.gain.setValueAtTime(isDownbeat ? 0.04 : 0.02, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);

    osc.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(time);
    osc.stop(time + 0.06);
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  /* ============================================================
     SFX Engine: High-tactile Sound Effects
     ============================================================ */

  // Standard Button Click
  public playClick() {
    this.init();
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Hover Pop
  public playHover() {
    this.init();
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Mission 1: Star Catch with rising combo pitch
  public playStarCatch(combo: number = 1) {
    this.init();
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const baseFreq = 523.25; // C5
    const semitones = Math.min(combo * 2, 24);
    const freq = baseFreq * Math.pow(2, semitones / 12);

    // Primary bell tone
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);
    osc1.frequency.linearRampToValueAtTime(freq * 1.05, now + 0.2);

    // Shimmer overtone (fifth above)
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 1.5, now);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.36);
    osc2.stop(now + 0.36);
  }

  // Mission 2: Whack-a-Mole Machine Spring Pop-up ("철컥-보잉~!")
  public playMoleAppear() {
    this.init();
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // 1. Mechanical solenoid "k-clack"
    const click = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    click.type = 'square';
    click.frequency.setValueAtTime(120, now);
    click.frequency.exponentialRampToValueAtTime(30, now + 0.04);
    clickGain.gain.setValueAtTime(0.18, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    click.connect(clickGain);
    clickGain.connect(this.sfxGain);
    click.start(now);
    click.stop(now + 0.05);

    // 2. Spring whistle/boing (arcade machine spring upward glide)
    const spring = this.ctx.createOscillator();
    const springGain = this.ctx.createGain();
    spring.type = 'triangle';
    spring.frequency.setValueAtTime(140, now + 0.02);
    spring.frequency.exponentialRampToValueAtTime(720, now + 0.18);
    springGain.gain.setValueAtTime(0.28, now + 0.02);
    springGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    spring.connect(springGain);
    springGain.connect(this.sfxGain);
    spring.start(now + 0.02);
    spring.stop(now + 0.23);
  }

  // Mission 2: Single click reminder ("One more time! Arcade alert beeps")
  public playMoleReminder() {
    this.init();
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Two rapid arcade alert beeps (high tempo "beep-beep!")
    [0, 0.07].forEach((delay, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(idx === 0 ? 587.33 : 880, now + delay); // D5 -> A5

      gain.gain.setValueAtTime(0.15, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.06);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + delay);
      osc.stop(now + delay + 0.065);
    });
  }

  // Mission 2: REAL ARCADE WHACK-A-MOLE IMPACT ("쾅! 뿅! 땡-!")
  public playMoleWhack() {
    this.init();
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // 1. Heavy Rubber Mallet Heavy Impact ("BAM/THUD!")
    const thud = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(220, now);
    thud.frequency.exponentialRampToValueAtTime(35, now + 0.12);
    thudGain.gain.setValueAtTime(0.7, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    thud.connect(thudGain);
    thudGain.connect(this.sfxGain);
    thud.start(now);
    thud.stop(now + 0.15);

    // Impact transient snap noise
    const snap = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snap.type = 'sawtooth';
    snap.frequency.setValueAtTime(350, now);
    snap.frequency.exponentialRampToValueAtTime(60, now + 0.05);
    snapGain.gain.setValueAtTime(0.4, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    snap.connect(snapGain);
    snapGain.connect(this.sfxGain);
    snap.start(now);
    snap.stop(now + 0.07);

    // 2. Comic Rubber Squeaker / Dizzy Mole ("뿅-!")
    const squeak = this.ctx.createOscillator();
    const squeakGain = this.ctx.createGain();
    squeak.type = 'sine';
    squeak.frequency.setValueAtTime(450, now + 0.04);
    squeak.frequency.linearRampToValueAtTime(1600, now + 0.11);
    squeak.frequency.exponentialRampToValueAtTime(700, now + 0.22);
    squeakGain.gain.setValueAtTime(0.35, now + 0.04);
    squeakGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    squeak.connect(squeakGain);
    squeakGain.connect(this.sfxGain);
    squeak.start(now + 0.04);
    squeak.stop(now + 0.25);

    // 3. Arcade Hit Bell / Score Chime ("DING!")
    const bell = this.ctx.createOscillator();
    const bellGain = this.ctx.createGain();
    bell.type = 'triangle';
    bell.frequency.setValueAtTime(1318.5, now + 0.06); // E6
    bellGain.gain.setValueAtTime(0.25, now + 0.06);
    bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    bell.connect(bellGain);
    bellGain.connect(this.sfxGain);
    bell.start(now + 0.06);
    bell.stop(now + 0.4);
  }

  // Paint Bucket Fill Sound ("퐁당-!")
  public playPaintFill() {
    this.init();
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(950, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.16);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Mission 3: Food Grab Pluck
  public playFoodGrab() {
    this.init();
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  // Mission 3: Eating & Chomp
  public playChomp() {
    this.init();
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Crunch 1
    const crunch1 = this.ctx.createOscillator();
    const cGain1 = this.ctx.createGain();
    crunch1.type = 'sawtooth';
    crunch1.frequency.setValueAtTime(180, now);
    crunch1.frequency.linearRampToValueAtTime(90, now + 0.08);
    cGain1.gain.setValueAtTime(0.25, now);
    cGain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    crunch1.connect(cGain1);
    cGain1.connect(this.sfxGain);
    crunch1.start(now);
    crunch1.stop(now + 0.1);

    // Crunch 2 (Chomp)
    const crunch2 = this.ctx.createOscillator();
    const cGain2 = this.ctx.createGain();
    crunch2.type = 'triangle';
    crunch2.frequency.setValueAtTime(280, now + 0.12);
    crunch2.frequency.linearRampToValueAtTime(110, now + 0.22);
    cGain2.gain.setValueAtTime(0.35, now + 0.12);
    cGain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    crunch2.connect(cGain2);
    cGain2.connect(this.sfxGain);
    crunch2.start(now + 0.12);
    crunch2.stop(now + 0.26);

    // Cute Mouse Happy Squeak
    setTimeout(() => this.playMouseSqueak(), 200);
  }

  // Cute Mouse Squeak
  public playMouseSqueak() {
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.linearRampToValueAtTime(2200, now + 0.07);
    osc.frequency.linearRampToValueAtTime(1800, now + 0.14);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Mission 4: Shape Connect line start
  public playShapeStart() {
    this.init();
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, now); // E5

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Mission 4: Shape Connect Match Success (Harmonious Bell Chord!)
  public playShapeMatch() {
    this.init();
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const chord = [523.25, 659.25, 783.99, 1046.5]; // C Major arpeggio
    chord.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.2, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.36);
    });
  }

  // Mission 4 & 5: Wrong shape match / rock collision ("Uh-oh / Bonk")
  public playWrong() {
    this.init();
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.linearRampToValueAtTime(140, now + 0.2);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.23);
  }

  // Mission 4: Brush Stroke / Stamp
  public playBrushStroke() {
    this.init();
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(700 + Math.random() * 200, now);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  // Mission 5: Character step
  public playStep() {
    this.init();
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.05);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Mission 5: Flag Collect
  public playFlagGet(step: number = 1) {
    this.init();
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const notes = [
      [587.33, 783.99], // D5, G5
      [659.25, 880.0],  // E5, A5
      [783.99, 1046.5]  // G5, C6
    ][(step - 1) % 3];

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.3, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.42);
    });
  }

  // Victory Celebration Fanfare
  public playVictory() {
    this.init();
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Victory fanfare notes: C5, E5, G5, C6, rest, G5, C6 (Held)
    const melody = [
      { f: 523.25, t: 0.0, d: 0.12 },
      { f: 659.25, t: 0.14, d: 0.12 },
      { f: 783.99, t: 0.28, d: 0.15 },
      { f: 1046.5, t: 0.45, d: 0.28 },
      { f: 783.99, t: 0.76, d: 0.12 },
      { f: 1046.5, t: 0.9, d: 0.6 },
    ];

    melody.forEach(({ f, t, d }) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + t);

      gain.gain.setValueAtTime(0.25, now + t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + t);
      osc.stop(now + t + d + 0.05);
    });
  }

  // Badge Unlock Shimmer
  public playBadgeUnlock() {
    this.init();
    if (!this.sfxEnabled || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    for (let i = 0; i < 7; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = 600 + i * 140;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.05);

      gain.gain.setValueAtTime(0.18, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.26);
    }
  }

  /* ============================================================
     Animalese Cute Voice Chatter (Animal Crossing style cute squeaks)
     ============================================================ */
  public playAnimalese(text: string) {
    this.init();
    if (!this.voiceEnabled || !this.ctx || !this.sfxGain || this.isSpeaking) return;
    this.isSpeaking = true;

    const chars = text.slice(0, 15).split('');
    const now = this.ctx.currentTime;

    chars.forEach((char, idx) => {
      const code = char.charCodeAt(0);
      // Derive pitch from character code (high-pitched cute mouse chatter 800 - 1500 Hz)
      const freq = 850 + (code % 24) * 28;
      const startTime = now + idx * 0.065;

      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.linearRampToValueAtTime(freq * 1.15, startTime + 0.05);

      gain.gain.setValueAtTime(0.1, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.055);

      // Lowpass filter for warm speech formant
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq, startTime);
      filter.Q.setValueAtTime(3.0, startTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(startTime);
      osc.stop(startTime + 0.06);
    });

    setTimeout(() => {
      this.isSpeaking = false;
    }, chars.length * 65 + 100);
  }

  // Voice Speech Guidance (Web Speech API Korean TTS)
  public speakGuidance(text: string) {
    if (!this.voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      // Fallback to cute animalese chatter
      this.playAnimalese(text);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.pitch = 1.35; // Cheerful friendly high pitch for kids
      utterance.rate = 1.05;
      utterance.volume = this.sfxVolume;

      // Also trigger a cute animalese squeak as an audio intro
      this.playAnimalese(text.slice(0, 4));

      window.speechSynthesis.speak(utterance);
    } catch {
      this.playAnimalese(text);
    }
  }
}

export const sound = new SoundManager();
