/**
 * Nappe sonore générée en direct (Web Audio) : aucun fichier audio à charger.
 * Démarre uniquement après une action de l'utilisateur.
 */
export class Ambience {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private air: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  enabled = false;

  private ensure() {
    if (this.ctx) return this.ctx;
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    const ctx = new AC();
    this.ctx = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    this.master = master;

    // Nappe grave : deux oscillateurs légèrement désaccordés, filtrés.
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 520;
    lp.Q.value = 0.6;
    lp.connect(master);
    for (const [f, g] of [
      [55, 0.32],
      [82.6, 0.2],
      [110.4, 0.08],
    ] as const) {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      const gain = ctx.createGain();
      gain.gain.value = g;
      o.connect(gain).connect(lp);
      o.start();
    }
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain).connect(lp.frequency);
    lfo.start();

    // Souffle d'air, modulé par la vitesse de défilement.
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    this.noise = buf;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 700;
    bp.Q.value = 0.7;
    const air = ctx.createGain();
    air.gain.value = 0.02;
    src.connect(bp).connect(air).connect(master);
    src.start();
    this.air = air;
    return ctx;
  }

  async setEnabled(on: boolean) {
    this.enabled = on;
    const ctx = on ? this.ensure() : this.ctx;
    if (!ctx || !this.master) return;
    if (on && ctx.state === "suspended") await ctx.resume();
    const t = ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(on ? 0.22 : 0, t, on ? 0.6 : 0.2);
  }

  /** Vitesse de défilement normalisée (0 → 1). */
  setSpeed(v: number) {
    if (!this.ctx || !this.air || !this.enabled) return;
    const target = 0.02 + Math.min(1, Math.abs(v)) * 0.12;
    this.air.gain.setTargetAtTime(target, this.ctx.currentTime, 0.15);
  }

  /** Souffle bref quand un écran se décroche ou change. */
  whoosh() {
    if (!this.ctx || !this.master || !this.noise || !this.enabled) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(300, t);
    bp.frequency.exponentialRampToValueAtTime(2400, t + 0.5);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.35, t + 0.18);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    src.connect(bp).connect(g).connect(this.master);
    src.start(t, Math.random());
    src.stop(t + 1);
  }

  dispose() {
    void this.ctx?.close();
    this.ctx = null;
  }
}
