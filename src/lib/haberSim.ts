/* eslint-disable */
// @ts-nocheck
// Haber–Bosch simulation, imported as authored in Claude Design: a framework-free
// three.js module (see HaberBoschSim.tsx for the React wrapper). Kept out of
// Prettier (.prettierignore) and type-checking so it can be re-synced verbatim.
// Local changes from the design export: PCFShadowMap (three r186 removed PCFSoftShadowMap); the title is an <h3> to sit under the
// essay's <h2>, and the return value exposes redraw() so the canvas charts can
// re-read the site's light/dark palette (styles.css, "Haber–Bosch simulation").
// Haber–Bosch interactive simulation — framework-free ES module.
// Usage: const sim = mountHaberSim(containerEl); ... sim.destroy();
// Depends only on `three` (npm i three). Works unchanged in Vite / Lovable.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ============================== CHEMISTRY ============================== */
const RG = 8.314;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);

// Gillespie–Beattie fit, ½N2 + 3/2H2 ⇌ NH3, Kp in atm^-1
export function Kp(T) {
  const l = 2250.322 / T - 0.8534 - 1.51049 * Math.log10(T) - 25.8987e-5 * T + 14.8961e-8 * T * T;
  return 10 ** l;
}
// Equilibrium NH3 mole fraction from a feed of 1 N2 : r H2 with inert mole fraction yI (ideal gas)
export function eqNH3(T, Pbar, r = 3, yI = 0) {
  const K = Kp(T), P = Pbar / 1.01325, nI = (yI / (1 - yI)) * (1 + r);
  let lo = 0, hi = Math.min(1, r / 3) * 0.999999;
  for (let i = 0; i < 60; i++) {
    const xi = (lo + hi) / 2, n = 1 + r + nI - 2 * xi;
    const f = (2 * xi) / n - K * P * Math.sqrt((1 - xi) / n) * Math.pow((r - 3 * xi) / n, 1.5);
    if (f > 0) hi = xi; else lo = xi;
  }
  const xi = (lo + hi) / 2;
  return (2 * xi) / (1 + r + nI - 2 * xi);
}
export const CATS = {
  none: { A: 1.55e7, Ea: 230e3, name: 'None' },
  fe: { A: 1.55e7, Ea: 100e3, name: 'Iron' },
  ru: { A: 3.24e6, Ea: 80e3, name: 'Ruthenium' },
};
// k·τ for one pass through a fixed reactor (calibrated: Fe, 450 °C, 200 bar ≈ 60% of equilibrium)
const kTau = (cat, T, P) => CATS[cat].A * Math.exp(-CATS[cat].Ea / (RG * T)) * Math.sqrt(P / 200);
// NH3 vapour pressure, bar (NIST Antoine)
export const nh3Vap = Tk => 10 ** (4.86886 - 1113.928 / (Tk - 10.409));

export function plantModel(s) {
  const T = s.T + 273.15, P = s.P, r = s.ratio, p = s.purge / 100, fIn = 0.012;
  const Pv = nh3Vap(s.cond + 273.15), yRes = Math.min(1, Pv / P);
  const a = 1 - Math.exp(-kTau(s.cat, T, P));
  let yI = 0.08, o;
  for (let i = 0; i < 40; i++) {
    const xEq = eqNH3(T, P, r, yI);
    const y0 = Math.min(yRes, xEq);
    const xOut = y0 + a * Math.max(0, xEq - y0);
    const d = Math.max(0, xOut - yRes);
    const yN2 = (1 - xOut - yI) / (1 + r);
    const X = d / (d + 2 * yN2 + 1e-12);
    const yINew = clamp((fIn * (X + p)) / p, 0, 0.6);
    o = { xEq, y0, xOut, d, X, yI, yN2, yH2: yN2 * r, a };
    yI = lerp(yI, yINew, 0.5);
  }
  o.overall = o.X / (o.X + p * (1 - o.X) + 1e-12);
  o.recovery = o.xOut > 0 ? clamp(o.d / o.xOut) : 0;
  o.Pv = Pv; o.yRes = yRes;
  o.compGJ = (2 * RG * 300 * Math.log(P / 1) / 0.7) * (1e6 / 17.03) / 1e9;
  o.xEq0 = eqNH3(T, P, r, 0);
  return o;
}
export function farmModel(f) {
  const N = f.N;
  const Y = 2 + 7 * (1 - Math.exp(-N / 90));
  const Rmax = f.split ? 185 : 160, k = f.split ? 120 : 130;
  const rec = Math.min(0.85 * N, Rmax * (1 - Math.exp(-N / k)));
  const surplus = N - rec;
  const [lf, drain] = { dry: [0.15, 120], avg: [0.35, 250], wet: [0.55, 420] }[f.rain];
  const leach = surplus * lf;
  const no3 = ((leach * 100) / drain) * 4.43; // mg/L as NO3-
  const DO = clamp(9.5 - 0.2 * leach, 0.2, 9.5);
  return { Y, rec, surplus, leach, no3, DO, algae: clamp(leach / 40), hyp: clamp((5 - DO) / 5), n2o: 0.01 * N * 44 / 28, recPct: N > 0 ? rec / N : 0 };
}

/* ============================== STYLES ============================== */
const MONO = 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';
const CSS = `
.hbs{--hbs-ink:#16181b;--hbs-muted:#5b6066;--hbs-line:#dedbd3;--hbs-panel:#fbfaf7;--hbs-card:#fff;--hbs-stage:#ebe8e1;--hbs-accent:#c4501f;--hbs-cold:#2b67a8;--hbs-n:#3557d6;--hbs-good:#2d7a4a;--hbs-bad:#b3261e;
color:var(--hbs-ink);font-family:inherit;font-size:15px;line-height:1.5;container-type:inline-size}
.hbs *{box-sizing:border-box}.hbs [hidden]{display:none!important}
.hbs-eyebrow{font:600 11px/1 ${MONO};letter-spacing:.08em;text-transform:uppercase;color:var(--hbs-muted)}
.hbs-title{font-size:28px;line-height:1.15;font-weight:650;letter-spacing:-.01em;margin:8px 0 6px}
.hbs-lede{margin:0;color:var(--hbs-muted);max-width:70ch;text-wrap:pretty}
.hbs-eqn{font-family:${MONO};color:var(--hbs-ink);font-size:14px}
.hbs-tabs{display:flex;gap:2px;border-bottom:1px solid var(--hbs-line);margin-top:18px;overflow-x:auto}
.hbs-tabs button{appearance:none;background:none;border:0;border-bottom:2px solid transparent;margin-bottom:-1px;padding:10px 14px;font:inherit;font-weight:550;color:var(--hbs-muted);cursor:pointer;display:flex;gap:8px;align-items:baseline;white-space:nowrap}
.hbs-tabs button span{font:12px ${MONO}}
.hbs-tabs button:hover{color:var(--hbs-ink)}
.hbs-tabs button.on{color:var(--hbs-ink);border-color:var(--hbs-ink)}
.hbs-main{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:16px;margin-top:16px;align-items:start}
.hbs-stage{position:sticky;top:12px;aspect-ratio:16/10;min-height:340px;border-radius:12px;overflow:hidden;background:var(--hbs-stage)}
.hbs-gl,.hbs-gl canvas{position:absolute;inset:0;width:100%!important;height:100%!important;display:block}
.hbs-labels{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.hbs-lbl{position:absolute;left:0;top:0;white-space:nowrap;font:500 11.5px/1 ${MONO};background:rgba(255,255,255,.9);border:1px solid var(--hbs-line);padding:5px 7px;border-radius:5px;pointer-events:auto;cursor:pointer;color:var(--hbs-ink);will-change:transform}
.hbs-lbl:hover{border-color:var(--hbs-ink)}.hbs-lbl.sel{background:var(--hbs-ink);color:#fff;border-color:var(--hbs-ink)}.hbs-lbl.static{cursor:default}
.hbs-hint{position:absolute;right:10px;bottom:10px;font:11px ${MONO};color:var(--hbs-muted);background:rgba(255,255,255,.75);padding:4px 8px;border-radius:4px;pointer-events:none}
.hbs-card{position:absolute;left:12px;bottom:12px;width:min(380px,calc(100% - 24px));background:var(--hbs-card);border:1px solid var(--hbs-line);border-radius:10px;padding:12px 14px 13px;box-shadow:0 8px 28px rgba(0,0,0,.1);font-size:13.5px;line-height:1.45}
.hbs-card h4{margin:0 0 4px;font-size:14.5px;padding-right:24px}.hbs-card p{margin:0;text-wrap:pretty}
.hbs-card .x{position:absolute;right:8px;top:8px;width:24px;height:24px;border:0;background:none;cursor:pointer;font-size:18px;line-height:1;color:var(--hbs-muted)}
.hbs-cap{position:absolute;left:12px;top:12px;right:12px;display:flex;gap:10px;align-items:flex-start;pointer-events:none}
.hbs-cap>div{background:rgba(255,255,255,.92);border:1px solid var(--hbs-line);border-radius:8px;padding:8px 12px;max-width:440px}
.hbs-cap b{display:block;font-size:14px}.hbs-cap small{font:11px ${MONO};color:var(--hbs-muted)}
.hbs-badge{display:inline-block;font:600 10.5px/1 ${MONO};letter-spacing:.06em;text-transform:uppercase;background:var(--hbs-accent);color:#fff;padding:4px 6px;border-radius:4px;margin-left:6px;vertical-align:2px}
.hbs-panel{background:var(--hbs-panel);border:1px solid var(--hbs-line);border-radius:12px;padding:16px}
.hbs-panel>section{display:flex;flex-direction:column;gap:20px}
.hbs-h{font:600 11px/1 ${MONO};letter-spacing:.08em;text-transform:uppercase;color:var(--hbs-muted);margin-bottom:10px}
.hbs-chips{display:flex;flex-wrap:wrap;gap:6px}
.hbs-chip{font:inherit;font-size:12.5px;padding:5px 10px;border:1px solid var(--hbs-line);border-radius:999px;background:var(--hbs-card);cursor:pointer;color:var(--hbs-ink)}
.hbs-chip:hover{border-color:var(--hbs-ink)}.hbs-chip.on{background:var(--hbs-ink);color:#fff;border-color:var(--hbs-ink)}
.hbs-sl{display:block}.hbs-sl+.hbs-sl{margin-top:14px}
.hbs-sl-top{display:flex;justify-content:space-between;gap:8px;font-size:13.5px}
.hbs-sl-top b{font:600 13px ${MONO};white-space:nowrap}
.hbs input[type=range]{width:100%;accent-color:var(--hbs-ink);margin:6px 0 0;height:22px}
.hbs-note{font-size:12px;color:var(--hbs-muted);margin-top:1px;text-wrap:pretty}
.hbs-seg{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;border:1px solid var(--hbs-line);border-radius:8px;overflow:hidden;background:var(--hbs-card)}
.hbs-seg button{font:inherit;font-size:13px;padding:8px 6px;border:0;background:none;cursor:pointer;color:var(--hbs-ink)}
.hbs-seg button+button{border-left:1px solid var(--hbs-line)}.hbs-seg button.on{background:var(--hbs-ink);color:#fff}
.hbs-check{display:flex;gap:10px;align-items:flex-start;font-size:13.5px;cursor:pointer}.hbs-check input{margin-top:3px;accent-color:var(--hbs-ink)}
.hbs-btns{display:flex;gap:6px}.hbs-btn{flex:1;font:inherit;font-size:13px;padding:8px 10px;border:1px solid var(--hbs-line);border-radius:8px;background:var(--hbs-card);cursor:pointer;color:var(--hbs-ink)}
.hbs-btn:hover{border-color:var(--hbs-ink)}.hbs-btn.pri{background:var(--hbs-ink);color:#fff;border-color:var(--hbs-ink)}
.hbs-steps{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px}
.hbs-steps button{width:100%;text-align:left;font:inherit;font-size:13px;padding:6px 8px;border:0;border-radius:6px;background:none;cursor:pointer;color:var(--hbs-muted);display:flex;gap:10px}
.hbs-steps button span{font:12px ${MONO};min-width:18px}.hbs-steps button:hover{background:rgba(0,0,0,.04);color:var(--hbs-ink)}
.hbs-steps button.on{background:var(--hbs-ink);color:#fff}
.hbs-below{margin-top:16px;display:flex;flex-direction:column;gap:16px}
.hbs-ro{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1px;background:var(--hbs-line);border:1px solid var(--hbs-line);border-radius:12px;overflow:hidden}
.hbs-ro>div{background:var(--hbs-card);padding:12px 14px}
.hbs-ro .k{font-size:12.5px;color:var(--hbs-muted)}.hbs-ro .v{font:600 22px/1.25 ${MONO};margin-top:2px}.hbs-ro .s{font-size:12px;color:var(--hbs-muted);text-wrap:pretty}
.hbs-ro .bad{color:var(--hbs-bad)}.hbs-ro .good{color:var(--hbs-good)}
.hbs-two{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(0,1fr);gap:16px}
.hbs-box{border:1px solid var(--hbs-line);border-radius:12px;padding:14px 16px;background:var(--hbs-card);min-width:0}
.hbs-box h3{margin:0;font-size:15px;font-weight:650}.hbs-box p{margin:6px 0 0;text-wrap:pretty}
.hbs-box-h{display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px 16px;align-items:baseline;margin-bottom:10px}
.hbs-legend{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:var(--hbs-muted)}
.hbs-legend i{display:inline-block;width:16px;height:3px;border-radius:2px;vertical-align:middle;margin-right:6px}
.hbs-cv{width:100%;height:270px;display:block}
.hbs-comp{display:flex;height:28px;border-radius:6px;overflow:hidden;margin-top:10px}
.hbs-comp>div{display:flex;align-items:center;justify-content:center;font:600 11px ${MONO};color:#fff;min-width:0;overflow:hidden;white-space:nowrap;transition:flex-basis .3s}
.hbs-keys{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:8px;font-size:12px;color:var(--hbs-muted)}
.hbs-keys i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px;vertical-align:-1px;border:1px solid rgba(0,0,0,.15)}
.hbs-concept .hbs-h{margin-bottom:6px}.hbs-concept p{margin:0;font-size:15px;text-wrap:pretty}
.hbs-concept strong{font-weight:650}
@container (max-width:860px){.hbs-main,.hbs-two{grid-template-columns:minmax(0,1fr)}.hbs-stage{position:relative;top:auto}}
@container (max-width:520px){.hbs-stage{aspect-ratio:4/5}.hbs-title{font-size:23px}.hbs-hint{display:none}}
`;

/* ============================== TEMPLATE ============================== */
const TEMPLATE = `
<header>
  <div class="hbs-eyebrow">Interactive · Equilibrium, kinetics &amp; catalysis</div>
  <h3 class="hbs-title">The Haber–Bosch process</h3>
  <p class="hbs-lede"><span class="hbs-eqn">N₂ + 3H₂ ⇌ 2NH₃ &nbsp;ΔH = −92 kJ/mol</span><br>Run the ammonia plant, zoom into the iron surface where the triple bond breaks, then follow the nitrogen onto a field and into a lake.</p>
</header>
<nav class="hbs-tabs" role="tablist">
  <button data-tab="plant" class="on"><span>01</span>The plant</button>
  <button data-tab="cat"><span>02</span>On the catalyst</button>
  <button data-tab="farm"><span>03</span>Into the field</button>
</nav>
<div class="hbs-main">
  <div class="hbs-stage">
    <div class="hbs-gl"></div>
    <div class="hbs-labels"></div>
    <div class="hbs-hint" data-hint>Drag to orbit · scroll to zoom · click equipment</div>
    <div class="hbs-cap" data-cap hidden><div><small data-cap-n></small><b data-cap-t></b></div></div>
    <div class="hbs-card" data-card hidden><button class="x" data-card-x aria-label="Close">×</button><h4 data-card-t></h4><p data-card-b></p></div>
  </div>
  <aside class="hbs-panel">
    <section data-pane="plant">
      <div><div class="hbs-h">Scenarios</div><div class="hbs-chips" data-presets></div></div>
      <div><div class="hbs-h">Reactor</div><div data-sl-reactor></div></div>
      <div><div class="hbs-h">Catalyst</div><div class="hbs-seg" data-seg-cat>
        <button data-v="none">None</button><button data-v="fe">Iron</button><button data-v="ru">Ruthenium</button></div>
        <div class="hbs-note" data-cat-note></div></div>
      <div><div class="hbs-h">Loop</div><div data-sl-loop></div></div>
    </section>
    <section data-pane="cat" hidden>
      <div><div class="hbs-h">Mechanism on Fe</div><ol class="hbs-steps" data-steps></ol></div>
      <div class="hbs-btns"><button class="hbs-btn" data-prev>← Step</button><button class="hbs-btn pri" data-play>Pause</button><button class="hbs-btn" data-next>Step →</button></div>
      <div data-sl-cat></div>
      <label class="hbs-check"><input type="checkbox" data-uncat checked><span>Show the uncatalysed route on the energy diagram</span></label>
      <div><div class="hbs-h">What's happening</div><p style="margin:0;font-size:13.5px;text-wrap:pretty" data-step-detail></p></div>
    </section>
    <section data-pane="farm" hidden>
      <div><div class="hbs-h">Fertiliser</div><div data-sl-farm></div></div>
      <div><div class="hbs-h">Rainfall</div><div class="hbs-seg" data-seg-rain><button data-v="dry">Dry</button><button data-v="avg">Average</button><button data-v="wet">Wet</button></div>
        <div class="hbs-note">More water draining through the soil carries more nitrate with it.</div></div>
      <label class="hbs-check"><input type="checkbox" data-split><span>Split the dose — apply in 2–3 smaller doses as the crop grows<span class="hbs-note" style="display:block">Roots take up more of each dose, so less is left to wash out.</span></span></label>
    </section>
  </aside>
</div>
<div class="hbs-below">
  <section data-pane="plant">
    <div class="hbs-ro" data-ro-plant></div>
    <div class="hbs-two" style="margin-top:16px">
      <div class="hbs-box">
        <div class="hbs-box-h"><h3>Equilibrium vs. what one pass achieves</h3>
          <div class="hbs-legend"><span><i style="background:var(--hbs-ink)"></i>Equilibrium limit at your pressure</span><span><i style="background:var(--hbs-accent)"></i>After one pass over the catalyst</span><span><i style="background:#c9c5bb"></i>Other pressures</span></div></div>
        <canvas class="hbs-cv" data-cv-plant></canvas>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
        <div class="hbs-box"><h3>Gas leaving the reactor</h3><div class="hbs-comp" data-comp></div>
          <div class="hbs-keys"><span><i style="background:var(--hbs-n)"></i>N₂</span><span><i style="background:#f3f3f1"></i>H₂</span><span><i style="background:var(--hbs-accent)"></i>NH₃</span><span><i style="background:#9aa3a8"></i>Ar, CH₄</span></div></div>
        <div class="hbs-box hbs-concept"><div class="hbs-h">Quick concept</div><p data-concept-plant></p></div>
      </div>
    </div>
  </section>
  <section data-pane="cat" hidden>
    <div class="hbs-two">
      <div class="hbs-box">
        <div class="hbs-box-h"><h3>Energy profile, per ½N₂ + 3⁄2H₂ → NH₃</h3>
          <div class="hbs-legend"><span><i style="background:var(--hbs-ink)"></i>On iron</span><span><i style="background:#b8b3a8"></i>Uncatalysed (break every bond in the gas)</span></div></div>
        <canvas class="hbs-cv" data-cv-cat style="height:300px"></canvas>
        <div class="hbs-note" style="margin-top:6px">Illustrative energies (kJ/mol), shape after Ertl's profile for promoted iron. * = adsorbed on the surface.</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
        <div class="hbs-ro" style="grid-template-columns:1fr 1fr">
          <div><div class="k">N≡N bond</div><div class="v">945</div><div class="s">kJ/mol to break</div></div>
          <div><div class="k">H–H bond</div><div class="v">436</div><div class="s">kJ/mol to break</div></div>
          <div><div class="k">N–H bond</div><div class="v">391</div><div class="s">kJ/mol released, ×3</div></div>
          <div><div class="k">N₂ sticking</div><div class="v">~10⁻⁶</div><div class="s">collisions that dissociate</div></div>
        </div>
        <div class="hbs-box hbs-concept"><div class="hbs-h">Quick concept</div><p>A catalyst gives the reaction a different route with lower barriers — it doesn't change ΔH or the equilibrium constant. That's why the plant still has to compromise on temperature: iron makes the reaction <strong>fast enough</strong> at 400–500 °C, but only pressure and cooling make it <strong>go far enough</strong>.</p></div>
      </div>
    </div>
  </section>
  <section data-pane="farm" hidden>
    <div class="hbs-ro" data-ro-farm></div>
    <div class="hbs-two" style="margin-top:16px">
      <div class="hbs-box">
        <div class="hbs-box-h"><h3>Diminishing returns</h3>
          <div class="hbs-legend"><span><i style="background:var(--hbs-good)"></i>Grain yield</span><span><i style="background:var(--hbs-accent)"></i>N washed out of the soil</span></div></div>
        <canvas class="hbs-cv" data-cv-farm></canvas>
      </div>
      <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
        <div class="hbs-box hbs-concept"><div class="hbs-h">Quick concept</div><p data-concept-farm></p></div>
        <div class="hbs-box"><h3>From air to bread</h3><p style="font-size:13.5px">N₂ → NH₃ in the plant → urea or ammonium nitrate → nitrate in soil → amino acids in grain → protein in you. Roughly half the nitrogen in the proteins of a typical person today passed through a Haber–Bosch reactor. The part the crop doesn't take up leaves as nitrate in water — or as N₂O, a greenhouse gas.</p></div>
      </div>
    </div>
  </section>
</div>`;

/* ============================== HELPERS ============================== */
function poly(pts) {
  const P = pts.map(p => new THREE.Vector3(...p)), L = [0];
  for (let i = 1; i < P.length; i++) L.push(L[i - 1] + P[i].distanceTo(P[i - 1]));
  const len = L[L.length - 1];
  return {
    P, L, len,
    at(d, out) {
      d = clamp(d, 0, len);
      let i = 1; while (i < L.length - 1 && L[i] < d) i++;
      const t = (d - L[i - 1]) / (L[i] - L[i - 1] || 1);
      return out.copy(P[i - 1]).lerp(P[i], t);
    },
  };
}
const UP = new THREE.Vector3(0, 1, 0);
function cyl(a, b, r, mat, seg = 20, open = false) {
  const len = a.distanceTo(b);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg, 1, open), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(UP, b.clone().sub(a).normalize());
  return m;
}
function setBond(mesh, a, b, off) {
  const d = b.clone().sub(a), len = d.length();
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  if (off) mesh.position.add(off);
  mesh.quaternion.setFromUnitVectors(UP, d.normalize());
  mesh.scale.set(1, len, 1);
}
function std(name, color, rough = 0.5, metal = 0, extra = {}) {
  const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
  m.name = name; return m;
}
function addLights(scene, shadowSize = 14) {
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb7b0a2, 1.7));
  const d = new THREE.DirectionalLight(0xffffff, 2.4);
  d.position.set(6, 14, 9); d.castShadow = true;
  d.shadow.mapSize.set(2048, 2048);
  Object.assign(d.shadow.camera, { left: -shadowSize, right: shadowSize, top: shadowSize, bottom: -shadowSize, near: 0.5, far: 60 });
  d.shadow.bias = -0.0004;
  scene.add(d);
}
const fmt = (v, d = 1) => (Number.isFinite(v) ? v.toFixed(d) : '—');
const pct = (v, d = 1) => fmt(v * 100, d) + '%';

/* ============================== MOUNT ============================== */
export function mountHaberSim(host, opts = {}) {
  if (!document.getElementById('hbs-css')) {
    const st = document.createElement('style'); st.id = 'hbs-css'; st.textContent = CSS; document.head.appendChild(st);
  }
  const el = document.createElement('div');
  el.className = 'hbs'; el.innerHTML = TEMPLATE; host.appendChild(el);
  const $ = s => el.querySelector(s), $$ = s => [...el.querySelectorAll(s)];
  const cssVar = n => getComputedStyle(el).getPropertyValue(n).trim();

  const S = {
    tab: 'plant',
    plant: { T: 450, P: 200, cat: 'fe', ratio: 3, cond: -20, purge: 2 },
    cat: { playing: true, t: 0, speed: 1, uncat: true },
    farm: { N: 150, rain: 'avg', split: false },
    sel: null,
  };
  let PM = plantModel(S.plant), FM = farmModel(S.farm);

  /* ---------- renderer / camera ---------- */
  const glWrap = $('.hbs-gl');
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setClearColor(new THREE.Color(cssVar('--hbs-stage') || '#ebe8e1'));
  glWrap.appendChild(renderer.domElement);
  const camera = new THREE.PerspectiveCamera(38, 1.6, 0.1, 200);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.08; controls.maxPolarAngle = Math.PI * 0.49; controls.minDistance = 3; controls.maxDistance = 40;
  const POSES = {
    plant: { p: [2.2, 9.5, 21.5], t: [-0.9, 3.6, 0] },
    cat: { p: [0.6, 4.4, 6.6], t: [0, 0.9, 0] },
    farm: { p: [4.5, 8, 14.5], t: [1.2, -0.4, 0] },
  };
  const applyPose = k => { camera.position.set(...POSES[k].p); controls.target.set(...POSES[k].t); controls.update(); };
  applyPose('plant');

  const labelsEl = $('.hbs-labels');
  const labels = { plant: [], cat: [], farm: [] };
  function label(scene, text, pos, key) {
    const d = document.createElement('div');
    d.className = 'hbs-lbl' + (key ? '' : ' static'); d.textContent = text;
    if (key) d.addEventListener('click', e => { e.stopPropagation(); select(key); });
    labelsEl.appendChild(d);
    if (scene !== 'plant') d.style.display = 'none';
    const L = { el: d, pos: new THREE.Vector3(...pos), key, show: true };
    labels[scene].push(L); return L;
  }

  /* ====================== SCENE 1 · PLANT ====================== */
  const plant = new THREE.Scene(); addLights(plant);
  const M = {
    steel: std('steel', 0xb9bfc6, 0.35, 0.6), dark: std('dark_steel', 0x5c636b, 0.45, 0.5),
    paint: std('paint_slate', 0x47566a, 0.55, 0.1), glass: std('glass', 0xa9c3da, 0.15, 0, { transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide }),
    pipe: std('pipe_glass', 0x9db4c9, 0.2, 0, { transparent: true, opacity: 0.22, depthWrite: false }),
    cat: std('catalyst', 0x4a443d, 0.9, 0.1, { emissive: 0xff5a1a, emissiveIntensity: 0.3 }),
    coil: std('coil', 0xb9c2cc, 0.3, 0.5, { emissive: 0x6fb6ff, emissiveIntensity: 0 }),
    liquid: std('liquid_nh3', 0xc8dcff, 0.1, 0, { transparent: true, opacity: 0.7 }),
    ground: std('ground', 0xe3dfd6, 1, 0),
  };
  const g0 = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), M.ground);
  g0.rotation.x = -Math.PI / 2; g0.receiveShadow = true; plant.add(g0);
  const grid = new THREE.GridHelper(40, 40, 0xd3cec2, 0xd9d4ca); grid.position.y = 0.002; plant.add(grid);

  const equip = []; // clickable groups
  function group(key, ...meshes) {
    const g = new THREE.Group(); g.name = key; g.userData.key = key;
    meshes.forEach(m => { m.castShadow = true; m.receiveShadow = true; g.add(m); });
    plant.add(g); equip.push(g); return g;
  }
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  function tank(x, z, h, r, mat, key) {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 40), mat); body.position.set(x, h / 2 + 0.15, z);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat); dome.position.set(x, h + 0.15, z);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.8, r * 0.85, 0.3, 32), M.dark); foot.position.set(x, 0.15, z);
    return group(key, body, dome, foot);
  }
  tank(-9.1, -1.6, 2.4, 0.75, std('n2_tank', 0x3d5fbf, 0.45, 0.3), 'n2');
  tank(-9.1, 1.6, 2.4, 0.75, std('h2_tank', 0xd9d6cf, 0.45, 0.3), 'h2');
  // compressor
  const cBox = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.2), M.paint); cBox.position.set(-5.2, 0.75, 0);
  const fly = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.14, 40), M.steel); fly.rotation.x = Math.PI / 2; fly.position.set(-5.2, 0.85, 0.72);
  const spokes = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.16), M.dark); spokes.position.set(-5.2, 0.85, 0.8);
  const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.8, 32), M.dark); motor.rotation.z = Math.PI / 2; motor.position.set(-5.2, 0.5, -0.95);
  group('comp', cBox, fly, spokes, motor);
  // heat exchanger
  const hx = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 1.8, 40), M.steel); hx.rotation.z = Math.PI / 2; hx.position.set(-3, 0.8, 0);
  const hxParts = [hx];
  [-0.7, 0, 0.7].forEach(dx => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 10, 40), M.dark); r.rotation.y = Math.PI / 2; r.position.set(-3 + dx, 0.8, 0); hxParts.push(r); });
  [-0.55, 0.55].forEach(dx => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35, 0.7), M.dark); l.position.set(-3 + dx, 0.17, 0); hxParts.push(l); });
  group('hx', ...hxParts);
  // reactor
  const rShell = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 5, 48, 1, true), M.glass); rShell.position.set(0, 3, 0);
  const rDome = new THREE.Mesh(new THREE.SphereGeometry(0.95, 48, 14, 0, Math.PI * 2, 0, Math.PI / 2), M.glass); rDome.position.set(0, 5.5, 0);
  const rBase = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.06, 48), M.dark); rBase.position.set(0, 0.5, 0);
  const rSkirt = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.85, 0.5, 40), M.dark); rSkirt.position.set(0, 0.25, 0);
  const rParts = [rShell, rDome, rBase, rSkirt];
  const BED_Y = [5.0, 3.4, 1.8];
  BED_Y.forEach(y => {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.93, 0.93, 0.34, 48), M.cat); b.position.set(0, y, 0); rParts.push(b);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.97, 0.04, 10, 48), M.steel); ring.rotation.x = Math.PI / 2; ring.position.set(0, y - 0.2, 0); rParts.push(ring);
  });
  [0.53, 5.5].forEach(y => { const f = new THREE.Mesh(new THREE.TorusGeometry(0.97, 0.06, 10, 48), M.steel); f.rotation.x = Math.PI / 2; f.position.set(0, y, 0); rParts.push(f); });
  const rGrp = group('reactor', ...rParts);
  rShell.castShadow = rDome.castShadow = false;
  const rLight = new THREE.PointLight(0xff7a3a, 0, 6, 1.5); rLight.position.set(0, 3, 0); plant.add(rLight);
  // condenser + separator
  const cShell = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 2.4, 40, 1, true), M.glass); cShell.position.set(3.2, 1.6, 0);
  const cTop = new THREE.Mesh(new THREE.SphereGeometry(0.62, 40, 10, 0, Math.PI * 2, 0, Math.PI / 2), M.steel); cTop.position.set(3.2, 2.8, 0);
  const cBot = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.5, 0.25, 40), M.steel); cBot.position.set(3.2, 0.3, 0);
  const cParts = [cShell, cTop, cBot];
  for (let i = 0; i < 7; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.045, 10, 36), M.coil); t.rotation.x = Math.PI / 2; t.position.set(3.2, 0.65 + i * 0.32, 0); cParts.push(t); }
  const sep = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 20), M.steel); sep.position.set(4.6, 0.75, 0); cParts.push(sep);
  group('cond', ...cParts); cShell.castShadow = false;
  // NH3 storage
  const sShell = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 2.1, 40, 1, true), M.glass); sShell.position.set(7.4, 1.2, 1.4);
  const sDome = new THREE.Mesh(new THREE.SphereGeometry(0.85, 40, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.steel); sDome.position.set(7.4, 2.25, 1.4);
  const sBase = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.15, 40), M.dark); sBase.position.set(7.4, 0.1, 1.4);
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1, 40), M.liquid); liquid.position.set(7.4, 0.17, 1.4);
  liquid.geometry.translate(0, 0.5, 0);
  group('store', sShell, sDome, sBase, liquid); sShell.castShadow = false;
  // purge stack
  const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.5, 20), M.dark); stack.position.set(4.6, 9.3, -2.2);
  group('purge', stack);

  const PATHS = {
    feedN: poly([[-8.3, 0.8, -1.6], [-7.4, 0.8, -1.6], [-7.4, 0.8, 0], [-6.4, 0.8, 0]]),
    feedH: poly([[-8.3, 0.8, 1.6], [-7.4, 0.8, 1.6], [-7.4, 0.8, 0], [-6.4, 0.8, 0]]),
    main1: poly([[-6.4, 0.8, 0], [-1.7, 0.8, 0], [-1.7, 6.9, 0], [0, 6.9, 0], [0, 6.2, 0]]),
    reactor: poly([[0, 6.2, 0], [0, 0.8, 0]]),
    main2: poly([[0, 0.8, 0], [1.7, 0.8, 0], [1.7, 3.5, 0], [3.2, 3.5, 0], [3.2, 0.75, 0], [4.6, 0.75, 0]]),
    product: poly([[4.6, 0.75, 0], [4.6, 0.3, 0], [4.6, 0.3, 1.4], [6.7, 0.3, 1.4]]),
    rec1: poly([[4.6, 0.75, 0], [4.6, 0.75, -2.2], [4.6, 7.6, -2.2]]),
    rec2: poly([[4.6, 7.6, -2.2], [-6.4, 7.6, -2.2], [-6.4, 0.8, -2.2], [-6.4, 0.8, 0]]),
    purge: poly([[4.6, 7.6, -2.2], [4.6, 9.1, -2.2]]),
  };
  const recycleGrp = new THREE.Group(); recycleGrp.userData.key = 'recycle'; plant.add(recycleGrp); equip.push(recycleGrp);
  const mainPipes = new THREE.Group(); plant.add(mainPipes);
  for (const [k, p] of Object.entries(PATHS)) {
    if (k === 'reactor') continue;
    const tgt = k.startsWith('rec') ? recycleGrp : mainPipes;
    for (let i = 1; i < p.P.length; i++) tgt.add(cyl(p.P[i - 1], p.P[i], 0.2, M.pipe, 20, true));
    for (let i = 1; i < p.P.length - 1; i++) { const j = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 12), M.pipe); j.position.copy(p.P[i]); tgt.add(j); }
  }

  // molecules (instanced atoms)
  const NMOL = 220;
  const atomGeo = new THREE.SphereGeometry(1, 16, 12);
  const instN = new THREE.InstancedMesh(atomGeo, std('nitrogen', 0x3557d6, 0.35, 0.05), NMOL * 2);
  const instH = new THREE.InstancedMesh(atomGeo, std('hydrogen', 0xf6f6f3, 0.4, 0), NMOL * 3);
  const instAr = new THREE.InstancedMesh(atomGeo, std('inert', 0x8e979c, 0.5, 0), NMOL);
  [instN, instH, instAr].forEach(m => { m.frustumCulled = false; plant.add(m); });
  const SHAPES = {
    N2: [['N', 0.075, 0, 0], ['N', -0.075, 0, 0]],
    H2: [['H', 0.045, 0, 0], ['H', -0.045, 0, 0]],
    NH3: [['N', 0, 0.02, 0], ['H', 0.1, -0.035, 0], ['H', -0.05, -0.035, 0.087], ['H', -0.05, -0.035, -0.087]],
    Ar: [['A', 0, 0, 0]],
  };
  const RAD = { N: 0.08, H: 0.055, A: 0.085 };
  const SPEED = { reactor: 0.55, purge: 1.2 };
  const BED_D = BED_Y.map(y => 6.2 - y);
  const mols = [];
  const feedSpecies = () => (Math.random() < 0.04 ? 'Ar' : Math.random() < 1 / (1 + S.plant.ratio) ? 'N2' : 'H2');
  function newMol(path, d, sp) {
    return { sp: sp || feedSpecies(), path, d, bed: 0, j: new THREE.Vector3((Math.random() - 0.5) * 0.14, (Math.random() - 0.5) * 0.14, (Math.random() - 0.5) * 0.14),
      ang: Math.random() * Math.PI * 2, rad: 0.15 + Math.random() * 0.6, q: new THREE.Quaternion().random(), ax: new THREE.Vector3().randomDirection(), w: 1 + Math.random() * 3 };
  }
  {
    const loop = ['main1', 'reactor', 'main2', 'rec1', 'rec2'], w = loop.map(k => PATHS[k].len / (SPEED[k] || 2));
    const tot = w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < NMOL; i++) {
      let r = Math.random() * tot, k = 0; while (r > w[k]) { r -= w[k]; k++; }
      const m = newMol(loop[k], Math.random() * PATHS[loop[k]].len);
      if (loop[k] === 'reactor') m.bed = BED_D.filter(b => b < m.d).length;
      mols.push(m);
    }
  }
  let produced = 0;
  const tmpV = new THREE.Vector3(), tmpO = new THREE.Vector3(), tmpM = new THREE.Matrix4(), tmpS = new THREE.Vector3(), tmpQ = new THREE.Quaternion(), qd = new THREE.Quaternion();
  function stepPlant(dt) {
    const qPass = (() => { const t = clamp((PM.xOut - PM.y0) / Math.max(0.05, 1 - PM.y0 - PM.yI)); return 1 - Math.pow(1 - t, 1 / 3); })();
    const pVis = Math.min(0.5, (S.plant.purge / 100) * 6);
    let iN = 0, iH = 0, iA = 0;
    for (const m of mols) {
      m.d += dt * (SPEED[m.path] || 2);
      const P = PATHS[m.path];
      if (m.path === 'reactor') {
        while (m.bed < 3 && m.d >= BED_D[m.bed]) {
          if ((m.sp === 'N2' || m.sp === 'H2') && Math.random() < qPass) m.sp = 'NH3';
          m.bed++;
        }
      }
      if (m.d >= P.len) {
        const over = m.d - P.len; m.d = over;
        switch (m.path) {
          case 'feedN': case 'feedH': m.path = 'main1'; break;
          case 'main1': m.path = 'reactor'; m.bed = 0; break;
          case 'reactor': m.path = 'main2'; break;
          case 'main2': m.path = m.sp === 'NH3' && Math.random() < PM.recovery ? 'product' : 'rec1'; break;
          case 'rec1': m.path = Math.random() < pVis ? 'purge' : 'rec2'; break;
          case 'rec2': m.path = 'main1'; break;
          case 'product': case 'purge':
            if (m.path === 'product') produced++;
            m.sp = feedSpecies(); m.path = m.sp === 'H2' ? 'feedH' : 'feedN'; m.d = 0; break;
        }
      }
      const PP = PATHS[m.path];
      PP.at(m.d, tmpV);
      if (m.path === 'reactor') { const a = m.ang + m.d * 0.9; tmpV.x += Math.cos(a) * m.rad; tmpV.z += Math.sin(a) * m.rad; }
      else tmpV.add(m.j);
      if (m.path === 'product' && m.d > PP.len - 0.3) continue;
      if (m.path === 'purge' && m.d > PP.len - 0.2) continue;
      qd.setFromAxisAngle(m.ax, m.w * dt); m.q.multiply(qd);
      for (const [a, x, y, z] of SHAPES[m.sp]) {
        tmpO.set(x, y, z).applyQuaternion(m.q).add(tmpV);
        const r = RAD[a]; tmpS.set(r, r, r);
        tmpM.compose(tmpO, tmpQ.identity(), tmpS);
        if (a === 'N') instN.setMatrixAt(iN++, tmpM); else if (a === 'H') instH.setMatrixAt(iH++, tmpM); else instAr.setMatrixAt(iA++, tmpM);
      }
    }
    instN.count = iN; instH.count = iH; instAr.count = iA;
    instN.instanceMatrix.needsUpdate = instH.instanceMatrix.needsUpdate = instAr.instanceMatrix.needsUpdate = true;
    const comp = equip.find(g => g.userData.key === 'comp');
    fly.rotation.y += dt * (1 + Math.log(S.plant.P) * 1.6); spokes.rotation.z += dt * (1 + Math.log(S.plant.P) * 1.6);
    const lvl = 0.12 + 0.8 * (1 - Math.exp(-produced / 260));
    liquid.scale.y = lvl * 2.0;
  }
  function plantVisuals() {
    const h = clamp((S.plant.T - 250) / 400);
    M.cat.emissiveIntensity = 0.05 + h * 0.75;
    M.cat.emissive.setHSL(lerp(0.0, 0.07, h), 1, 0.5);
    rLight.intensity = S.plant.cat === 'none' ? h * 4 : h * 9;
    const c = clamp((40 - S.plant.cond) / 70);
    M.coil.color.set(0xb9c2cc).lerp(new THREE.Color(0x9fd0f2), c);
    M.coil.emissiveIntensity = c * 0.35;
  }

  label('plant', 'N₂ · from air', [-9.1, 3.2, -1.6], 'n2');
  label('plant', 'H₂ · from methane', [-9.1, 3.2, 1.6], 'h2');
  label('plant', 'Compressor', [-5.2, 1.65, 0], 'comp');
  label('plant', 'Heat exchanger', [-3, 1.55, 0], 'hx');
  label('plant', 'Reactor', [1.15, 5.9, 0], 'reactor');
  label('plant', 'Condenser', [3.95, 3.0, 0], 'cond');
  label('plant', 'Liquid NH₃', [7.4, 3.4, 1.4], 'store');
  label('plant', 'Recycle loop', [-1, 8.2, -2.2], 'recycle');
  label('plant', 'Purge', [4.6, 9.9, -2.2], 'purge');

  function info(key) {
    const s = S.plant, o = PM;
    const t = {
      n2: ['Nitrogen, from air', `Air is 78% N₂ — yet almost no living thing can use it, because the N≡N triple bond (945 kJ/mol) is one of the strongest in chemistry. Here it's fed in at a 1 : ${fmt(s.ratio, 1)} ratio with hydrogen; the reaction needs 1 : 3.`],
      h2: ['Hydrogen, from natural gas', 'Steam reforming: CH₄ + H₂O → CO + 3H₂, then CO + H₂O → CO₂ + H₂. This step — not the reactor — emits most of the process CO₂, roughly 2 t of CO₂ per tonne of NH₃. "Green" ammonia swaps in H₂ from electrolysing water.'],
      comp: ['Compressor', `4 moles of gas become 2, so raising pressure shifts the equilibrium toward NH₃ (Le Chatelier). It also packs molecules closer, so collisions — and the rate — go up. The cost: about ${fmt(o.compGJ, 1)} GJ of work per tonne of NH₃ at ${s.P} bar, and much thicker steel.`],
      hx: ['Heat exchanger', 'The reaction is exothermic, so hot gas leaving the reactor is used to warm the cold feed to reaction temperature. Once running, the plant largely heats itself.'],
      reactor: ['Reactor · catalyst beds', `${CATS[s.cat].name === 'None' ? 'No catalyst loaded' : CATS[s.cat].name + ' catalyst'} at ${s.T} °C. Gas reaches ${pct(o.a, 0)} of equilibrium in one pass. Because the reaction releases heat, gas warms as it reacts and that lowers the equilibrium yield — so real reactors cool the gas between beds.`],
      cond: ['Condenser & separator', `Cooling to ${s.cond} °C liquefies NH₃ (boils at −33 °C) while N₂ (−196 °C) and H₂ (−253 °C) stay gas. Hydrogen bonding between NH₃ molecules is what makes this separation easy. At this temperature NH₃'s vapour pressure is ${fmt(o.Pv, 1)} bar, so ${pct(o.yRes, 1)} stays in the gas and recycles.`],
      store: ['Liquid ammonia', 'About 180 million tonnes are made each year, roughly 70% of it for fertiliser — directly, or converted to urea and ammonium nitrate. See tab 03.'],
      recycle: ['Recycle loop', `Only ${pct(o.X, 0)} of the nitrogen reacts per pass, so the unreacted gas is pumped back to the start. Each N atom goes round about ${fmt(1 / Math.max(o.X, 1e-3), 1)} times before leaving as ammonia.`],
      purge: ['Purge', `Argon and methane ride in with the feed and never react. Without a purge they'd build up and dilute the reactants (now ${pct(o.yI, 0)} of the loop). Purge too much and you throw away hydrogen — overall yield is ${pct(o.overall, 0)}.`],
    }[key];
    return t;
  }
  function select(key) {
    S.sel = key;
    labels.plant.forEach(L => L.el.classList.toggle('sel', L.key === key));
    const card = $('[data-card]');
    if (!key) { card.hidden = true; return; }
    const [t, b] = info(key); $('[data-card-t]').textContent = t; $('[data-card-b]').textContent = b; card.hidden = false;
  }
  $('[data-card-x]').addEventListener('click', () => select(null));

  /* ====================== SCENE 2 · CATALYST ====================== */
  const cat = new THREE.Scene(); addLights(cat, 8);
  const feMat = std('iron', 0x8d939b, 0.42, 0.75), kMat = std('potassium_promoter', 0x8a5cc2, 0.5, 0.1);
  const cG = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), M.ground); cG.rotation.x = -Math.PI / 2; cG.position.y = -1.6; cG.receiveShadow = true; cat.add(cG);
  {
    const n1 = 11, n2 = 10, sp = 0.9, R = 0.46;
    const fe = new THREE.InstancedMesh(new THREE.SphereGeometry(R, 28, 18), feMat, n1 * n1 + n2 * n2 + n1 * n1);
    let i = 0;
    for (let a = 0; a < n1; a++) for (let b = 0; b < n1; b++) fe.setMatrixAt(i++, tmpM.makeTranslation((a - 5) * sp, 0, (b - 5) * sp));
    for (let a = 0; a < n2; a++) for (let b = 0; b < n2; b++) fe.setMatrixAt(i++, tmpM.makeTranslation((a - 4.5) * sp, -0.55, (b - 4.5) * sp));
    for (let a = 0; a < n1; a++) for (let b = 0; b < n1; b++) fe.setMatrixAt(i++, tmpM.makeTranslation((a - 5) * sp, -1.1, (b - 5) * sp));
    fe.castShadow = fe.receiveShadow = true; cat.add(fe);
    [[-3.15, -2.7], [3.6, 2.25], [-2.25, 3.6], [2.7, -3.6]].forEach(([x, z]) => {
      const k = new THREE.Mesh(new THREE.SphereGeometry(0.55, 28, 18), kMat); k.position.set(x, 0.62, z); k.castShadow = true; cat.add(k);
    });
  }
  const nMatC = std('nitrogen', 0x3557d6, 0.3, 0.05, { transparent: true }), hMatC = std('hydrogen', 0xf6f6f3, 0.35, 0, { transparent: true });
  const bondMat = std('bond', 0x6e747b, 0.5, 0.2, { transparent: true });
  const A = [];
  for (let i = 0; i < 2; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 20), nMatC); m.castShadow = true; cat.add(m); A.push(m); }
  for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.19, 24, 16), hMatC); m.castShadow = true; cat.add(m); A.push(m); }
  const bondGeo = new THREE.CylinderGeometry(0.045, 0.045, 1, 10);
  const triple = [0, 1, 2].map(() => { const b = new THREE.Mesh(bondGeo, bondMat); cat.add(b); return b; });
  const hh = [0, 1, 2].map(() => { const b = new THREE.Mesh(bondGeo, bondMat); cat.add(b); return b; });
  const HPAIR = [[2, 3], [4, 7], [5, 6]]; // atom indices: 0 Na, 1 Nb, 2..7 = H1..H6
  const NH_OFF = {
    1: [[0, 0.44, 0]],
    2: [[0.32, 0.3, 0], [-0.32, 0.3, 0]],
    3: [[0.36, 0.22, 0], [-0.18, 0.22, 0.31], [-0.18, 0.22, -0.31]],
  };
  const KF = (() => {
    const v = a => new THREE.Vector3(...a);
    const sites = [[-1.8, 0.4, 0.45], [-1.35, 0.4, -0.9], [-0.45, 0.4, 0.95], [1.8, 0.4, 0.45], [1.35, 0.4, -0.9], [0.45, 0.4, 0.95]];
    const gas = (cA, cB, cC) => { const o = []; const pr = (c, ax) => [v([c[0] - 0.17 * ax[0], c[1], c[2] - 0.17 * ax[1]]), v([c[0] + 0.17 * ax[0], c[1], c[2] + 0.17 * ax[1]])];
      const [h1, h2] = pr(cA, [0.6, -0.8]), [h3, h6] = pr(cB, [1, 0]), [h4, h5] = pr(cC, [-0.6, -0.8]); return [h1, h2, h3, h4, h5, h6]; };
    const Na = c => c, frames = [];
    const ammo = (N, n, hs) => hs.map((h, i) => (i < n ? N.clone().add(v(NH_OFF[n][i])) : v(sites[h])));
    frames[0] = [v([-0.28, 3.1, 0]), v([0.28, 3.1, 0]), ...gas([-2.4, 2.6, 0.6], [0.2, 3.3, 2.0], [2.4, 2.7, 0.3])];
    frames[1] = [v([-0.28, 0.74, 0]), v([0.28, 0.74, 0]), ...gas([-2.0, 2.0, 0.4], [0.1, 2.3, 1.7], [2.0, 2.0, 0.3])];
    frames[2] = [v([-0.9, 0.6, 0]), v([0.9, 0.6, 0]), ...gas([-1.8, 1.6, 0.0], [0.0, 1.8, 1.3], [1.8, 1.6, 0.0])];
    frames[3] = [v([-0.9, 0.6, 0]), v([0.9, 0.6, 0]), ...sites.map(v)];
    const build = n => { const a = v([-0.9, 0.62 + n * 0.03, 0]), b = v([0.9, 0.62 + n * 0.03, 0]); const ha = ammo(a, n, [0, 1, 2]), hb = ammo(b, n, [3, 4, 5]); return [a, b, ...ha, ...hb]; };
    frames[4] = build(1); frames[5] = build(2); frames[6] = build(3);
    frames[7] = frames[6].map((p, i) => { const left = i === 0 || (i >= 2 && i <= 4); return p.clone().add(left ? v([-0.9, 2.3, 0.4]) : v([0.9, 2.6, -0.3])); });
    // reorder hydrogens to H1..H6 index layout [H1,H2,H3,H4,H5,H6]
    return frames;
  })();
  const STEPS = [
    ['Gas phase', 'N₂ and H₂ arrive at the iron surface. On their own they won’t react at 450 °C: splitting N≡N in the gas costs 945 kJ/mol.'],
    ['N₂ lands on iron', 'N₂ lies on the surface. Iron’s d-electrons flow into N₂’s empty π* antibonding orbitals, weakening the triple bond before it breaks.'],
    ['N≡N breaks', 'The weakened bond splits into two N atoms, each bonded to iron. The energy barrier is small, but only about 1 in a million N₂ collisions lands right — this is the rate-determining step. Potassium promoter (purple) donates electrons to the iron and helps.'],
    ['H₂ splits', 'H–H (436 kJ/mol) breaks easily on the metal. The H atoms skate across the surface toward the nitrogen.'],
    ['N + H → NH', 'The first N–H bond forms. Each hydrogenation step is slightly uphill on the surface — the iron holds N tightly.'],
    ['NH + H → NH₂', 'A second hydrogen adds. Still bound to the iron through nitrogen.'],
    ['NH₂ + H → NH₃', 'Ammonia is complete: three N–H bonds (391 kJ/mol each), with nitrogen’s lone pair pointing at the metal.'],
    ['NH₃ leaves', 'Ammonia desorbs and the site is free again. The iron is unchanged — it lowered the barriers but didn’t change ΔH (−46 kJ per mol NH₃) or the equilibrium position.'],
  ];
  const STEP_DUR = 2.6;
  $('[data-steps]').innerHTML = STEPS.map((s, i) => `<li><button data-step="${i}"><span>${i + 1}</span>${s[0]}${i === 2 ? '<span class="hbs-badge" style="min-width:0">slow</span>' : ''}</button></li>`).join('');
  let lastStep = -1;
  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
  function stepCat(dt) {
    const C = S.cat;
    if (C.playing) C.t = (C.t + dt * C.speed) % (STEP_DUR * 8);
    const st = Math.floor(C.t / STEP_DUR) % 8, u = (C.t % STEP_DUR) / STEP_DUR;
    const k = smooth(clamp(u / 0.55));
    const from = KF[st === 0 ? 0 : st - 1], to = KF[st];
    A.forEach((m, i) => m.position.copy(from[i]).lerp(to[i], k));
    let op = 1;
    if (st === 0) op = smooth(clamp(u / 0.3));
    if (st === 7) op = 1 - smooth(clamp((u - 0.65) / 0.35));
    nMatC.opacity = hMatC.opacity = op;
    // triple bond
    const tb = st < 2 ? 1 : st === 2 ? 1 - smooth(clamp(u / 0.35)) : 0;
    const a = A[0].position, b = A[1].position;
    triple.forEach((bm, i) => { bm.visible = tb > 0.01; setBond(bm, a, b, tmpA.set(0, (i - 1) * 0.11, 0)); bm.scale.x = bm.scale.z = tb; });
    const hb = st < 3 ? 1 : st === 3 ? 1 - smooth(clamp(u / 0.35)) : 0;
    hh.forEach((bm, i) => { const [p, q] = HPAIR[i]; bm.visible = hb > 0.01; setBond(bm, A[p].position, A[q].position); bm.scale.x = bm.scale.z = hb * 1.3; });
    bondMat.opacity = op;
    if (st !== lastStep) {
      lastStep = st;
      $$('[data-step]').forEach(b => b.classList.toggle('on', +b.dataset.step === st));
      $('[data-cap-n]').textContent = `Step ${st + 1} of 8`;
      $('[data-cap-t]').innerHTML = STEPS[st][0] + (st === 2 ? '<span class="hbs-badge">rate-limiting</span>' : '');
      $('[data-step-detail]').textContent = STEPS[st][1];
      drawCat(st);
    }
  }

  /* ====================== SCENE 3 · FARM ====================== */
  const farm = new THREE.Scene(); addLights(farm, 14);
  const FMs = {
    slab: std('soil_section', 0x8b6b4c, 0.95), grass: std('grass', 0xb7bf8c, 1), field: std('tilled_soil', 0x7d5b3e, 1),
    crop: std('crop', 0x3f7a3a, 0.8), water: std('water', 0x4f86b8, 0.15, 0, { transparent: true, opacity: 0.55, depthWrite: false }),
    stream: std('stream', 0x4f86b8, 0.2, 0), hyp: std('hypoxic_water', 0x2c2433, 0.6, 0, { transparent: true, opacity: 0.7, depthWrite: false }),
    bed: std('sediment', 0x4a3b2e, 1), algae: std('algae', 0x6a9a2c, 0.9), nitrate: std('nitrate', 0xd9772b, 0.4, 0, { emissive: 0xd9772b, emissiveIntensity: 0.25 }),
    fish: std('fish', 0xd8a24a, 0.5), dead: std('dead_fish', 0xb9b6ad, 0.7), rain: std('rain', 0x8fb3d6, 0.2, 0, { transparent: true, opacity: 0.55 }),
  };
  const fG = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), M.ground); fG.rotation.x = -Math.PI / 2; fG.position.y = -1.7; fG.receiveShadow = true; farm.add(fG);
  const slab = new THREE.Mesh(new THREE.BoxGeometry(14.5, 1.6, 12), FMs.slab); slab.position.set(-1.75, -0.8, 0); slab.receiveShadow = true; farm.add(slab);
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(14.5, 12), FMs.grass); grass.rotation.x = -Math.PI / 2; grass.position.set(-1.75, 0.002, 0); grass.receiveShadow = true; farm.add(grass);
  const field = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), FMs.field); field.rotation.x = -Math.PI / 2; field.position.set(-2, 0.004, 0); field.receiveShadow = true; farm.add(field);
  const stream = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.6), FMs.stream); stream.rotation.x = -Math.PI / 2; stream.position.set(4.2, 0.006, 0.5); farm.add(stream);
  const lakeBed = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.12, 8), FMs.bed); lakeBed.position.set(8.3, -1.64, 0); lakeBed.receiveShadow = true; farm.add(lakeBed);
  const water = new THREE.Mesh(new THREE.BoxGeometry(5.6, 1.5, 8), FMs.water); water.position.set(8.3, -0.83, 0); farm.add(water);
  const hypBox = new THREE.Mesh(new THREE.BoxGeometry(5.56, 1, 7.96), FMs.hyp); farm.add(hypBox);
  const CR = 26, CZ = 18;
  const cropGeo = new THREE.ConeGeometry(0.12, 0.62, 6); cropGeo.translate(0, 0.31, 0);
  const crops = new THREE.InstancedMesh(cropGeo, FMs.crop, CR * CZ); crops.castShadow = true; farm.add(crops);
  const cropJ = Array.from({ length: CR * CZ }, () => [(Math.random() - 0.5) * 0.12, (Math.random() - 0.5) * 0.12, 0.85 + Math.random() * 0.3]);
  function placeCrops() {
    const s = 0.35 + 0.95 * ((FM.Y - 2) / 7);
    let i = 0;
    for (let a = 0; a < CR; a++) for (let b = 0; b < CZ; b++) {
      const j = cropJ[i];
      tmpM.compose(tmpO.set(-6.7 + a * 0.375 + j[0], 0, -3.6 + b * 0.42 + j[1]), tmpQ.identity(), tmpS.set(1, s * j[2], 1));
      crops.setMatrixAt(i++, tmpM);
    }
    crops.instanceMatrix.needsUpdate = true;
    FMs.crop.color.set(0xc9b85a).lerp(new THREE.Color(0x3c7838), 1 - Math.exp(-S.farm.N / 70));
  }
  const NRAIN = 420, rain = new THREE.InstancedMesh(new THREE.BoxGeometry(0.018, 0.34, 0.018), FMs.rain, NRAIN); rain.frustumCulled = false; farm.add(rain);
  const drops = Array.from({ length: NRAIN }, () => [-7 + Math.random() * 15, Math.random() * 8, -4.5 + Math.random() * 9]);
  const NNO = 160, nitr = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 12, 8), FMs.nitrate, NNO); nitr.frustumCulled = false; farm.add(nitr);
  const nps = Array.from({ length: NNO }, () => ({ t: Math.random(), a: V(-6.5 + Math.random() * 9.3, 0.08, -3.6 + Math.random() * 7.2), c: V(6 + Math.random() * 4.6, -0.12, -3.6 + Math.random() * 7.2) }));
  const NAL = 140, alg = new THREE.InstancedMesh(new THREE.CircleGeometry(0.28, 12), FMs.algae, NAL); farm.add(alg);
  for (let i = 0; i < NAL; i++) { tmpQ.setFromAxisAngle(V(1, 0, 0), -Math.PI / 2); const s = 0.6 + Math.random() * 0.9; alg.setMatrixAt(i, tmpM.compose(tmpO.set(5.8 + Math.random() * 5, -0.07, -3.7 + Math.random() * 7.4), tmpQ, tmpS.set(s, s, s))); }
  const fish = Array.from({ length: 12 }, (_, i) => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 10), FMs.fish); body.scale.set(2, 0.75, 0.6);
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.22, 8), FMs.fish); tail.rotation.z = Math.PI / 2; tail.position.x = -0.38;
    g.add(body, tail); farm.add(g);
    return { g, body, tail, ph: Math.random() * 6.28, r: 0.8 + Math.random() * 1.6, y: -0.45 - Math.random() * 0.75, cx: 8.3 + (Math.random() - 0.5) * 1.5, cz: (Math.random() - 0.5) * 3, sp: 0.35 + Math.random() * 0.4, rank: i };
  });
  label('farm', 'Wheat field', [-2, 1.3, -4], null);
  label('farm', 'Drainage', [4.2, 0.5, 0.5], null);
  label('farm', 'Lake', [8.3, 0.5, -4], null);
  const lblHyp = label('farm', 'Hypoxic bottom water', [8.3, -1.25, 4.05], null);
  let farmT = 0;
  function farmVisuals() {
    placeCrops();
    FMs.water.color.set(0x4f86b8).lerp(new THREE.Color(0x6f9a3a), FM.algae * 0.85);
    FMs.stream.color.copy(FMs.water.color);
    const h = FM.hyp * 1.35;
    hypBox.visible = h > 0.02; hypBox.scale.y = Math.max(0.001, h); hypBox.position.set(8.3, -1.58 + h / 2, 0);
    lblHyp.show = h > 0.12;
    alg.count = Math.round(NAL * FM.algae);
  }
  function stepFarm(dt) {
    farmT += dt;
    const nr = { dry: 60, avg: 220, wet: NRAIN }[S.farm.rain];
    rain.count = nr;
    for (let i = 0; i < nr; i++) { const d = drops[i]; d[1] -= dt * 9; if (d[1] < 0) d[1] += 8; rain.setMatrixAt(i, tmpM.makeTranslation(d[0], d[1], d[2])); }
    rain.instanceMatrix.needsUpdate = true;
    const nn = Math.round(NNO * clamp(FM.leach / 45));
    nitr.count = nn;
    const s0 = V(3.0, 0.08, 0.5), s1 = V(5.6, 0.0, 0.5);
    for (let i = 0; i < nn; i++) {
      const p = nps[i]; p.t += dt * 0.12; if (p.t > 1) p.t -= 1;
      const t = p.t;
      if (t < 0.45) tmpO.copy(p.a).lerp(s0, t / 0.45);
      else if (t < 0.65) tmpO.copy(s0).lerp(s1, (t - 0.45) / 0.2);
      else tmpO.copy(s1).lerp(p.c, smooth((t - 0.65) / 0.35));
      nitr.setMatrixAt(i, tmpM.makeTranslation(tmpO.x, tmpO.y, tmpO.z));
    }
    nitr.instanceMatrix.needsUpdate = true;
    const alive = Math.round(12 * clamp((FM.DO - 1.5) / 5));
    fish.forEach(f => {
      const dead = f.rank >= alive;
      f.body.material = f.tail.material = dead ? FMs.dead : FMs.fish;
      if (dead) {
        f.g.position.set(f.cx + Math.cos(f.ph) * f.r * 0.8, -0.1 + Math.sin(farmT + f.ph) * 0.01, f.cz + Math.sin(f.ph) * f.r);
        f.g.rotation.set(Math.PI, f.ph, 0);
      } else {
        f.ph += dt * f.sp;
        const x = f.cx + Math.cos(f.ph) * f.r, z = f.cz + Math.sin(f.ph) * f.r * 1.3;
        f.g.position.set(clamp(x, 5.8, 10.8), Math.max(f.y, -1.55 + FM.hyp * 1.35 + 0.15), clamp(z, -3.7, 3.7));
        f.g.rotation.set(0, -f.ph - Math.PI / 2, 0);
        f.tail.rotation.y = Math.sin(farmT * 8 + f.ph) * 0.4;
      }
    });
  }

  /* ============================== UI ============================== */
  function slider(host, key, obj, def) {
    const id = 'hbs-' + key;
    const w = document.createElement('label'); w.className = 'hbs-sl';
    w.innerHTML = `<div class="hbs-sl-top"><span>${def.label}</span><b></b></div><input type="range" min="${def.min}" max="${def.max}" step="${def.step}"><div class="hbs-note">${def.note || ''}</div>`;
    const inp = w.querySelector('input'), out = w.querySelector('b');
    const sync = () => { inp.value = obj[key]; out.textContent = def.fmt(obj[key]); };
    inp.addEventListener('input', () => { obj[key] = +inp.value; out.textContent = def.fmt(obj[key]); def.on(); });
    host.appendChild(w); sync(); return sync;
  }
  const syncers = [];
  const onPlant = () => { PM = plantModel(S.plant); updatePlantUI(); $$('[data-presets] .hbs-chip').forEach(c => c.classList.remove('on')); };
  [['T', { label: 'Temperature', min: 250, max: 650, step: 5, fmt: v => v + ' °C', note: 'Hotter: faster, but equilibrium shifts back toward N₂ + H₂.' }],
   ['P', { label: 'Pressure', min: 10, max: 400, step: 5, fmt: v => v + ' bar', note: '4 gas moles → 2: pressure favours ammonia.' }]]
    .forEach(([k, d]) => syncers.push(slider($('[data-sl-reactor]'), k, S.plant, { ...d, on: onPlant })));
  [['ratio', { label: 'H₂ : N₂ feed ratio', min: 1, max: 5, step: 0.1, fmt: v => v.toFixed(1) + ' : 1', note: 'Stoichiometry says 3 : 1.' }],
   ['cond', { label: 'Condenser', min: -30, max: 40, step: 1, fmt: v => v + ' °C', note: 'Colder pulls more NH₃ out as liquid.' }],
   ['purge', { label: 'Purge', min: 0.5, max: 10, step: 0.5, fmt: v => v.toFixed(1) + '%', note: 'Share of recycle gas bled off to remove Ar and CH₄.' }]]
    .forEach(([k, d]) => syncers.push(slider($('[data-sl-loop]'), k, S.plant, { ...d, on: onPlant })));
  syncers.push(slider($('[data-sl-cat]'), 'speed', S.cat, { label: 'Animation speed', min: 0.25, max: 2, step: 0.25, fmt: v => v + '×', on: () => {} }));
  syncers.push(slider($('[data-sl-farm]'), 'N', S.farm, { label: 'Nitrogen applied', min: 0, max: 300, step: 5, fmt: v => v + ' kg N/ha', note: 'Typical wheat: 120–220 kg N per hectare.', on: () => { FM = farmModel(S.farm); updateFarmUI(); } }));

  const PRESETS = [
    ['Industrial', { T: 450, P: 200, cat: 'fe', ratio: 3, cond: -20, purge: 2 }],
    ['Too cold', { T: 300, P: 200, cat: 'fe', ratio: 3, cond: -20, purge: 2 }],
    ['Too hot', { T: 600, P: 200, cat: 'fe', ratio: 3, cond: -20, purge: 2 }],
    ['Low pressure', { T: 450, P: 40, cat: 'fe', ratio: 3, cond: -20, purge: 2 }],
    ['No catalyst', { T: 450, P: 200, cat: 'none', ratio: 3, cond: -20, purge: 2 }],
    ['Ruthenium', { T: 380, P: 100, cat: 'ru', ratio: 3, cond: -20, purge: 2 }],
    ['Warm condenser', { T: 450, P: 100, cat: 'fe', ratio: 3, cond: 30, purge: 2 }],
    ['Tiny purge', { T: 450, P: 200, cat: 'fe', ratio: 3, cond: -20, purge: 0.5 }],
  ];
  $('[data-presets]').innerHTML = PRESETS.map((p, i) => `<button class="hbs-chip${i === 0 ? ' on' : ''}" data-preset="${i}">${p[0]}</button>`).join('');
  $$('[data-preset]').forEach(b => b.addEventListener('click', () => {
    Object.assign(S.plant, PRESETS[+b.dataset.preset][1]); syncers.forEach(f => f());
    PM = plantModel(S.plant); updatePlantUI();
    $$('[data-preset]').forEach(c => c.classList.toggle('on', c === b));
  }));
  function seg(sel, obj, key, on) {
    const btns = $$(sel + ' button');
    const sync = () => btns.forEach(b => b.classList.toggle('on', b.dataset.v === obj[key]));
    btns.forEach(b => b.addEventListener('click', () => { obj[key] = b.dataset.v; sync(); on(); }));
    sync(); syncers.push(sync);
  }
  seg('[data-seg-cat]', S.plant, 'cat', onPlant);
  seg('[data-seg-rain]', S.farm, 'rain', () => { FM = farmModel(S.farm); updateFarmUI(); });
  $('[data-split]').addEventListener('change', e => { S.farm.split = e.target.checked; FM = farmModel(S.farm); updateFarmUI(); });
  $('[data-uncat]').addEventListener('change', e => { S.cat.uncat = e.target.checked; drawCat(lastStep); });
  const playBtn = $('[data-play]');
  const setPlay = v => { S.cat.playing = v; playBtn.textContent = v ? 'Pause' : 'Play'; };
  playBtn.addEventListener('click', () => setPlay(!S.cat.playing));
  const goStep = n => { setPlay(false); S.cat.t = (((n % 8) + 8) % 8) * STEP_DUR + STEP_DUR * 0.7; };
  $('[data-next]').addEventListener('click', () => goStep(lastStep + 1));
  $('[data-prev]').addEventListener('click', () => goStep(lastStep - 1));
  $$('[data-step]').forEach(b => b.addEventListener('click', () => goStep(+b.dataset.step)));

  const CAT_NOTES = {
    none: 'Without a catalyst almost nothing reacts — the N≡N bond is too hard to break at any temperature the steel can survive.',
    fe: 'Promoted iron (Fe₃O₄ reduced to Fe, with K₂O and Al₂O₃). Cheap, robust — used in most plants since 1913.',
    ru: 'More active at lower temperature and pressure, but far more expensive and slowed by H₂ sticking to its surface.',
  };
  function tile(k, v, s, cls = '') { return `<div><div class="k">${k}</div><div class="v ${cls}">${v}</div><div class="s">${s}</div></div>`; }
  function updatePlantUI() {
    const o = PM, s = S.plant;
    $('[data-cat-note]').textContent = CAT_NOTES[s.cat];
    $('[data-ro-plant]').innerHTML = [
      tile('Equilibrium NH₃', pct(o.xEq), 'the most this mixture could ever reach'),
      tile('NH₃ leaving reactor', pct(o.xOut), `${pct(o.a, 0)} of the way to equilibrium`, o.a < 0.3 ? 'bad' : ''),
      tile('Passes per N atom', o.X > 1e-4 ? fmt(1 / o.X, 1) : '∞', 'unreacted gas loops back'),
      tile('Overall N → NH₃', pct(o.overall, 0), 'after recycling, minus purge', o.overall < 0.6 ? 'bad' : o.overall > 0.9 ? 'good' : ''),
      tile('Inerts in loop', pct(o.yI, 0), 'Ar + CH₄ that never react', o.yI > 0.3 ? 'bad' : ''),
      tile('Feed compression', fmt(o.compGJ, 1) + ' GJ/t', 'work per tonne of NH₃'),
    ].join('');
    const parts = [['N₂', o.yN2, 'var(--hbs-n)', '#fff'], ['H₂', o.yH2, '#f3f3f1', '#16181b'], ['NH₃', o.xOut, 'var(--hbs-accent)', '#fff'], ['inert', o.yI, '#9aa3a8', '#fff']];
    $('[data-comp]').innerHTML = parts.map(([n, v, bg, fg]) => `<div style="flex-basis:${(v * 100).toFixed(2)}%;background:${bg};color:${fg}" title="${n} ${pct(v)}">${v > 0.17 ? `${n} ${pct(v, 0)}` : v > 0.08 ? n : ''}</div>`).join('');
    $('[data-concept-plant]').innerHTML = conceptPlant();
    plantVisuals(); drawPlant();
    if (S.sel) select(S.sel);
  }
  function conceptPlant() {
    const o = PM, s = S.plant;
    if (s.cat === 'none') return `<strong>Kinetically blocked.</strong> Equilibrium allows ${pct(o.xEq, 0)} ammonia here, but with no catalyst the N≡N bond almost never breaks, so essentially none forms. Thermodynamics says <em>can</em>; kinetics says <em>not in this century</em>.`;
    if (o.a < 0.3) return `<strong>Rate-limited.</strong> At ${s.T} °C equilibrium would give ${pct(o.xEq, 0)} NH₃, but the gas only gets ${pct(o.a, 0)} of the way there before it leaves the reactor. Few molecules have the activation energy. Warm it up — accepting a lower equilibrium for a much faster rate is the Haber compromise.`;
    if (o.d < 0.3 * o.xOut || o.xOut <= o.yRes) return `<strong>Separation-limited.</strong> At ${s.cond} °C ammonia's vapour pressure is ${fmt(o.Pv, 1)} bar, so ${pct(o.yRes, 1)} of the loop gas stays as NH₃ vapour and recycles. Ammonia sent back into the reactor pushes the equilibrium left. Colder condenser or higher pressure fixes it.`;
    if (o.yI > 0.3) return `<strong>Inerts are piling up.</strong> Argon and methane now make up ${pct(o.yI, 0)} of the loop, diluting N₂ and H₂ and lowering their partial pressures — the equilibrium drops to ${pct(o.xEq, 0)}. Purge a little more.`;
    if (o.xEq < 0.12) return `<strong>Equilibrium-limited.</strong> The forward reaction is exothermic, so at ${s.T} °C equilibrium favours N₂ + H₂: only ${pct(o.xEq, 0)} NH₃ is possible. ${s.P < 120 ? 'Raise the pressure — 4 moles of gas become 2, so pressure pushes the equilibrium right.' : 'Lower the temperature, and lean on the catalyst to keep the rate up.'}`;
    if (Math.abs(s.ratio - 3) > 0.6) return `<strong>Off-stoichiometry.</strong> The reaction uses H₂ and N₂ at 3 : 1. At ${fmt(s.ratio, 1)} : 1 the excess gas just dilutes the other — equilibrium NH₃ falls to ${pct(o.xEq, 0)}.`;
    return `<strong>A working compromise.</strong> One pass converts only ${pct(o.X, 0)} of the nitrogen — far from complete — but condensing out the NH₃ and recycling the rest keeps pulling the reaction forward (Le Chatelier, applied as plumbing). Overall ${pct(o.overall, 0)} of the nitrogen ends up as ammonia.`;
  }
  function farmTone(v, good, bad, rev) { return rev ? (v < bad ? 'bad' : v > good ? 'good' : '') : v > bad ? 'bad' : v < good ? 'good' : ''; }
  function updateFarmUI() {
    const o = FM, s = S.farm;
    $('[data-ro-farm]').innerHTML = [
      tile('Grain yield', fmt(o.Y, 1) + ' t/ha', 'wheat · 2.0 t/ha with no N'),
      tile('Fertiliser N in crop', s.N ? pct(o.recPct, 0) : '—', s.N ? `${fmt(o.rec, 0)} of ${s.N} kg N/ha taken up` : 'nothing applied'),
      tile('Nitrate in drainage', fmt(o.no3, 0) + ' mg/L', 'drinking-water limit 50 mg/L', o.no3 > 50 ? 'bad' : ''),
      tile('Lake bottom O₂', fmt(o.DO, 1) + ' mg/L', o.DO < 2 ? 'hypoxic — fish die or leave' : o.DO < 5 ? 'stressed' : 'healthy', farmTone(o.DO, 6, 2, true)),
      tile('N₂O released', fmt(o.n2o, 1) + ' kg/ha', 'greenhouse gas, ~270× CO₂'),
    ].join('');
    $('[data-concept-farm]').innerHTML = conceptFarm();
    farmVisuals(); drawFarm();
  }
  function conceptFarm() {
    const o = FM, s = S.farm;
    if (s.N < 50) return `<strong>Nitrogen-starved.</strong> Leaves yellow because chlorophyll and every protein need nitrogen, and the soil can't supply enough on its own. This is the ceiling farming hit before 1913 — Haber–Bosch nitrogen roughly feeds half the world today.`;
    if (o.DO < 2) return `<strong>Dead zone.</strong> ${fmt(o.leach, 0)} kg N/ha washes out as nitrate. In the lake it feeds an algal bloom; when the algae die, bacteria decomposing them use up the dissolved O₂ in the bottom water. The Gulf of Mexico dead zone forms this way every summer.`;
    if (o.no3 > 50) return `<strong>Over the drinking-water limit.</strong> Nitrate (NO₃⁻) is very soluble and isn't held by negatively charged soil particles, so surplus N drains straight into groundwater.`;
    if (o.surplus > 50) return `<strong>Diminishing returns.</strong> The last kilograms add little grain but ${fmt(o.surplus, 0)} kg N/ha is left in the soil for rain to wash out. ${s.split ? '' : 'Try splitting the dose.'}`;
    return `<strong>Close to the sweet spot.</strong> The crop takes up ${pct(o.recPct, 0)} of what's applied. The rest still has to go somewhere: some is stored, some is washed out as nitrate, and some returns to the air — as N₂, and as N₂O.`;
  }

  /* ---------- charts ---------- */
  function prep(cv) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2), w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return null;
    if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, h);
    c.font = `11px ${MONO}`; c.lineJoin = 'round'; c.lineCap = 'round';
    return { c, w, h };
  }
  function axes(c, L, R, T, B, xt, yt, xl, yl) {
    const ink = cssVar('--hbs-muted'), line = cssVar('--hbs-line');
    c.strokeStyle = line; c.lineWidth = 1; c.fillStyle = ink;
    yt.forEach(([v, y]) => { c.beginPath(); c.moveTo(L, y); c.lineTo(R, y); c.stroke(); c.textAlign = 'right'; c.textBaseline = 'middle'; c.fillText(v, L - 6, y); });
    xt.forEach(([v, x]) => { c.textAlign = 'center'; c.textBaseline = 'top'; c.fillText(v, x, B + 6); });
    c.textAlign = 'center'; c.fillText(xl, (L + R) / 2, B + 20);
    c.save(); c.translate(12, (T + B) / 2); c.rotate(-Math.PI / 2); c.textBaseline = 'middle'; c.fillText(yl, 0, 0); c.restore();
  }
  function drawPlant() {
    const r = prep($('[data-cv-plant]')); if (!r) return;
    const { c, w, h } = r, L = 44, R = w - 58, T = 10, B = h - 36;
    const X = t => L + ((t - 250) / 400) * (R - L), Y = v => B - v * (B - T);
    axes(c, L, R, T, B, [250, 350, 450, 550, 650].map(t => [t + '°', X(t)]), [0, 0.25, 0.5, 0.75, 1].map(v => [v * 100 + '%', Y(v)]), 'reactor temperature (°C)', 'NH₃ in gas');
    const s = S.plant, o = PM;
    const curve = (fn, col, lw, dash) => { c.beginPath(); for (let t = 250; t <= 650; t += 5) { const y = Y(fn(t)); t === 250 ? c.moveTo(X(t), y) : c.lineTo(X(t), y); } c.strokeStyle = col; c.lineWidth = lw; c.setLineDash(dash || []); c.stroke(); c.setLineDash([]); };
    [50, 100, 200, 300, 400].filter(p => Math.abs(p - s.P) > 15).forEach(p => {
      curve(t => eqNH3(t + 273.15, p, s.ratio, o.yI), '#cfcbc1', 1.2);
      c.fillStyle = cssVar('--hbs-muted'); c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(p + ' bar', R + 6, Y(eqNH3(923.15, p, s.ratio, o.yI)) );
    });
    const ink = cssVar('--hbs-ink'), acc = cssVar('--hbs-accent');
    curve(t => eqNH3(t + 273.15, s.P, s.ratio, o.yI), ink, 2.2);
    const a = t => 1 - Math.exp(-kTau(s.cat, t + 273.15, s.P));
    curve(t => { const e = eqNH3(t + 273.15, s.P, s.ratio, o.yI); const y0 = Math.min(o.yRes, e); return y0 + a(t) * Math.max(0, e - y0); }, acc, 2.2);
    c.fillStyle = ink; c.textAlign = 'left'; c.font = `600 11px ${MONO}`; c.fillText(s.P + ' bar', R + 6, Y(eqNH3(923.15, s.P, s.ratio, o.yI)) - 1);
    const x = X(s.T);
    c.strokeStyle = ink; c.lineWidth = 1; c.setLineDash([3, 4]); c.beginPath(); c.moveTo(x, T); c.lineTo(x, B); c.stroke(); c.setLineDash([]);
    [[o.xEq, ink], [o.xOut, acc]].forEach(([v, col]) => { c.beginPath(); c.arc(x, Y(v), 5, 0, Math.PI * 2); c.fillStyle = col; c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke(); });
    if (o.xEq - o.xOut > 0.04) {
      c.strokeStyle = acc; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x + 9, Y(o.xEq) + 6); c.lineTo(x + 9, Y(o.xOut) - 6); c.stroke();
      c.fillStyle = acc; c.font = `11px ${MONO}`; c.textAlign = 'left'; c.textBaseline = 'middle';
      const lbl = 'not reached in one pass'; const lx = x + 14 + c.measureText(lbl).width > R ? x - 14 - c.measureText(lbl).width : x + 14;
      c.fillText(lbl, lx, (Y(o.xEq) + Y(o.xOut)) / 2);
    }
  }
  const ENERGY = [
    { l: '½N₂ + ³⁄₂H₂', e: 0 }, { l: 'N₂*', e: -17 }, { l: 'N*', e: -146, ts: 21 }, { l: 'N* + 3H*', e: -314 },
    { l: 'NH*', e: -257, ts: -210 }, { l: 'NH₂*', e: -218, ts: -160 }, { l: 'NH₃*', e: -129, ts: -100 }, { l: 'NH₃(g)', e: -46 },
  ];
  function drawCat(st) {
    const r = prep($('[data-cv-cat]')); if (!r) return;
    const { c, w, h } = r, L = 50, R = w - 12, T = 16, B = h - 40;
    const top = S.cat.uncat ? 1200 : 100, bot = -360;
    const Y = e => T + ((top - e) / (top - bot)) * (B - T);
    const n = ENERGY.length, dx = (R - L) / n, X = i => L + dx * (i + 0.5), half = Math.min(26, dx * 0.32);
    const ticks = S.cat.uncat ? [1200, 800, 400, 0, -300] : [100, 0, -100, -200, -300];
    axes(c, L, R, T, B, [], ticks.map(v => [v, Y(v)]), '', 'kJ/mol');
    const ink = cssVar('--hbs-ink'), acc = cssVar('--hbs-accent'), mut = cssVar('--hbs-muted');
    if (S.cat.uncat) {
      const xa = X(0), xb = X(n - 1), xm = (xa + xb) / 2;
      c.strokeStyle = '#b8b3a8'; c.lineWidth = 2; c.setLineDash([6, 5]);
      c.beginPath(); c.moveTo(xa + half, Y(0)); c.bezierCurveTo(xa + (xm - xa) * 0.5, Y(0), xm - dx, Y(1126), xm, Y(1126)); c.bezierCurveTo(xm + dx, Y(1126), xb - (xb - xm) * 0.5, Y(-46), xb - half, Y(-46)); c.stroke(); c.setLineDash([]);
      c.fillStyle = mut; c.textAlign = 'center'; c.textBaseline = 'bottom'; c.font = `11px ${MONO}`; c.fillText('N + 3H as free atoms: +1126', xm, Y(1126) - 6);
    }
    for (let i = 1; i < n; i++) {
      const a = ENERGY[i - 1], b = ENERGY[i], x0 = X(i - 1) + half, x1 = X(i) - half;
      c.strokeStyle = ink; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(x0, Y(a.e));
      if (b.ts !== undefined) { const xm = (x0 + x1) / 2; c.bezierCurveTo(x0 + (xm - x0) * 0.6, Y(a.e), xm - (xm - x0) * 0.5, Y(b.ts), xm, Y(b.ts)); c.bezierCurveTo(xm + (x1 - xm) * 0.5, Y(b.ts), x1 - (x1 - xm) * 0.6, Y(b.e), x1, Y(b.e)); }
      else { c.setLineDash([2, 4]); c.lineTo(x1, Y(b.e)); }
      c.stroke(); c.setLineDash([]);
      if (i === 2) { const xm = (x0 + x1) / 2; c.fillStyle = acc; c.font = `600 10.5px ${MONO}`; c.textAlign = 'center'; c.textBaseline = 'bottom'; c.fillText('slow', xm, Y(b.ts) - 5); }
    }
    ENERGY.forEach((s, i) => {
      const on = i === st, x = X(i);
      c.strokeStyle = on ? acc : ink; c.lineWidth = on ? 4 : 2.5;
      c.beginPath(); c.moveTo(x - half, Y(s.e)); c.lineTo(x + half, Y(s.e)); c.stroke();
      c.fillStyle = on ? acc : ink; c.font = `${on ? 600 : 400} 11px ${MONO}`; c.textAlign = 'center'; c.textBaseline = 'top';
      c.fillText(String(s.e), x, Y(s.e) + 5);
      c.fillStyle = on ? acc : mut; c.save(); c.translate(x, B + 8); c.fillText(s.l, 0, 0); c.restore();
    });
  }
  function drawFarm() {
    const r = prep($('[data-cv-farm]')); if (!r) return;
    const { c, w, h } = r, L = 44, R = w - 48, T = 10, B = h - 36;
    const X = n => L + (n / 300) * (R - L), Y = y => B - (y / 10) * (B - T), Y2 = v => B - (v / 120) * (B - T);
    axes(c, L, R, T, B, [0, 50, 100, 150, 200, 250, 300].map(n => [n, X(n)]), [0, 2, 4, 6, 8, 10].map(v => [v, Y(v)]), 'nitrogen applied (kg N/ha)', 'yield, t/ha');
    c.fillStyle = cssVar('--hbs-accent'); c.textAlign = 'left'; c.textBaseline = 'middle';
    [0, 40, 80, 120].forEach(v => c.fillText(v, R + 6, Y2(v)));
    const good = cssVar('--hbs-good'), acc = cssVar('--hbs-accent'), ink = cssVar('--hbs-ink');
    const curve = (fn, Yf, col) => { c.beginPath(); for (let n = 0; n <= 300; n += 3) { const y = Yf(fn(n)); n === 0 ? c.moveTo(X(n), y) : c.lineTo(X(n), y); } c.strokeStyle = col; c.lineWidth = 2.2; c.stroke(); };
    curve(n => farmModel({ ...S.farm, N: n }).Y, Y, good);
    curve(n => farmModel({ ...S.farm, N: n }).leach, Y2, acc);
    const opt = 90 * Math.log(7 / 90 / 0.02);
    c.strokeStyle = cssVar('--hbs-muted'); c.setLineDash([2, 4]); c.lineWidth = 1; c.beginPath(); c.moveTo(X(opt), T); c.lineTo(X(opt), B); c.stroke(); c.setLineDash([]);
    c.fillStyle = cssVar('--hbs-muted'); c.textAlign = 'left'; c.textBaseline = 'top'; { const t1 = 'beyond: +1 kg N →', t2 = '< 20 kg grain'; c.fillText(t1, X(opt) + 6, T + 2); c.fillText(t2, X(opt) + 6, T + 16); }
    const x = X(S.farm.N);
    c.strokeStyle = ink; c.setLineDash([3, 4]); c.beginPath(); c.moveTo(x, T + 18); c.lineTo(x, B); c.stroke(); c.setLineDash([]);
    [[Y(FM.Y), good], [Y2(FM.leach), acc]].forEach(([y, col]) => { c.beginPath(); c.arc(x, y, 5, 0, Math.PI * 2); c.fillStyle = col; c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke(); });
  }

  /* ---------- tabs ---------- */
  const SCENES = { plant, cat, farm };
  function setTab(t) {
    POSES[S.tab] = { p: camera.position.toArray(), t: controls.target.toArray() };
    S.tab = t;
    $$('[data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === t));
    $$('[data-pane]').forEach(p => (p.hidden = p.dataset.pane !== t));
    Object.entries(labels).forEach(([k, arr]) => arr.forEach(L => (L.el.style.display = k === t ? '' : 'none')));
    $('[data-cap]').hidden = t !== 'cat';
    $('[data-card]').hidden = t !== 'plant' || !S.sel;
    $('[data-hint]').textContent = t === 'plant' ? 'Drag to orbit · scroll to zoom · click equipment' : 'Drag to orbit · scroll to zoom';
    applyPose(t);
    requestAnimationFrame(() => { if (t === 'plant') drawPlant(); else if (t === 'cat') drawCat(lastStep); else drawFarm(); });
  }
  $$('[data-tab]').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));

  /* ---------- picking ---------- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let down = null;
  const cv = renderer.domElement;
  const pick = e => {
    const r = cv.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(equip, true)[0];
    let o = hit && hit.object; while (o && !o.userData.key) o = o.parent;
    return o ? o.userData.key : null;
  };
  cv.addEventListener('pointerdown', e => (down = [e.clientX, e.clientY]));
  cv.addEventListener('pointerup', e => {
    if (S.tab !== 'plant' || !down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
    select(pick(e));
  });
  cv.addEventListener('pointermove', e => { if (S.tab === 'plant' && e.buttons === 0) cv.style.cursor = pick(e) ? 'pointer' : 'grab'; });

  /* ---------- loop ---------- */
  let W = 1, H = 1;
  function resize() {
    W = glWrap.clientWidth || 1; H = glWrap.clientHeight || 1;
    renderer.setSize(W, H, false); camera.aspect = W / H;
    camera.fov = W / H < 1 ? 55 : 38; camera.updateProjectionMatrix();
    if (S.tab === 'plant') drawPlant(); else if (S.tab === 'cat') drawCat(lastStep); else drawFarm();
  }
  const ro = new ResizeObserver(resize); ro.observe(glWrap); ro.observe(el);
  let visible = true;
  const io = new IntersectionObserver(es => (visible = es[0].isIntersecting)); io.observe(glWrap);
  const proj = new THREE.Vector3();
  function updLabels() {
    for (const L of labels[S.tab]) {
      proj.copy(L.pos).project(camera);
      const vis = L.show && proj.z < 1 && Math.abs(proj.x) < 1.1 && Math.abs(proj.y) < 1.1;
      L.el.style.visibility = vis ? 'visible' : 'hidden';
      if (vis) L.el.style.transform = `translate(${((proj.x + 1) / 2) * W}px,${((1 - proj.y) / 2) * H}px) translate(-50%,-100%)`;
    }
  }
  let last = performance.now(), raf = 0;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!visible) return;
    controls.update();
    if (S.tab === 'plant') stepPlant(dt); else if (S.tab === 'cat') stepCat(dt); else stepFarm(dt);
    renderer.render(SCENES[S.tab], camera);
    updLabels();
  }
  updatePlantUI(); updateFarmUI(); stepCat(0); resize();
  if (opts.tab) setTab(opts.tab);
  raf = requestAnimationFrame(frame);

  return {
    setTab,
    redraw() { if (S.tab === 'plant') drawPlant(); else if (S.tab === 'cat') drawCat(lastStep); else drawFarm(); },
    destroy() {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); controls.dispose();
      [plant, cat, farm].forEach(sc => sc.traverse(o => { if (o.geometry) o.geometry.dispose(); }));
      renderer.dispose(); el.remove();
    },
  };
}
