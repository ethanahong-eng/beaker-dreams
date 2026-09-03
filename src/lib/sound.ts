// Tiny Web Audio helper shared by the interactive sims. Synthesizes short
// blips/chimes/drones instead of loading audio files, and only ever touches
// the AudioContext after `ensure()` is called from a real user gesture
// (browsers block audio autoplay otherwise).
export type SoundEngine = {
  ensure: () => void;
  click: (opts?: { freq?: number; gain?: number; duration?: number }) => void;
  chime: (notes?: number[]) => void;
  setDrone: (freq: number, gain: number) => void;
  stopDrone: () => void;
  dispose: () => void;
};

export function createSoundEngine(): SoundEngine {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let drone: { osc: OscillatorNode; gain: GainNode } | null = null;
  let lastClick = 0;

  const ensure = () => {
    if (typeof window === "undefined") return;
    if (!ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      ctx = new Ctor();
      master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") void ctx.resume();
  };

  const click = ({
    freq = 700,
    gain = 0.12,
    duration = 0.05,
  }: { freq?: number; gain?: number; duration?: number } = {}) => {
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    if (now - lastClick < 0.03) return; // throttle so bursts of collisions stay a soft texture
    lastClick = now;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    g.gain.value = 0.0001;
    osc.connect(g);
    g.connect(master);
    g.gain.exponentialRampToValueAtTime(gain, now + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.start(now);
    osc.stop(now + duration + 0.01);
  };

  const chime = (notes: number[] = [523.25, 659.25, 783.99]) => {
    if (!ctx || !master) return;
    const t0 = ctx.currentTime;
    for (let i = 0; i < notes.length; i++) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = notes[i]!;
      g.gain.value = 0.0001;
      osc.connect(g);
      g.connect(master);
      const t = t0 + i * 0.09;
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      osc.start(t);
      osc.stop(t + 0.45);
    }
  };

  const setDrone = (freq: number, gain: number) => {
    if (!ctx || !master) return;
    if (!drone) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      g.gain.value = 0;
      osc.connect(g);
      g.connect(master);
      osc.start();
      drone = { osc, gain: g };
    }
    drone.osc.frequency.setTargetAtTime(freq, ctx.currentTime, 0.05);
    drone.gain.gain.setTargetAtTime(gain, ctx.currentTime, 0.08);
  };

  const stopDrone = () => {
    if (!ctx || !drone) return;
    drone.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
  };

  const dispose = () => {
    drone?.osc.stop();
    void ctx?.close();
    ctx = null;
    master = null;
    drone = null;
  };

  return { ensure, click, chime, setDrone, stopDrone, dispose };
}
