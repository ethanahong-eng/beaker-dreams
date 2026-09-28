import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { DiatomicStage } from "@/components/DiatomicStage";
import {
  ELEMENT_LIST,
  FORM,
  antiProfiles,
  bondingProfile,
  coeffs,
  ease,
  el,
  hund,
  moleculeInfo,
  partners,
  sceneMetrics,
  type DiatomicElement,
  type MOLevel,
  type MoleculeInfo,
  type Profile,
  type SceneMetrics,
} from "@/lib/diatomic";

/**
 * Diatomic Bond Explorer — a WebGL port of the original three.js artifact.
 *
 * Pick any two main-group elements that form a tabulated diatomic and watch the
 * bond assemble over five seconds: the atoms approach from a wide separation,
 * their valence functions overlap into a sigma molecular orbital drawn as a
 * |psi| = 0.3 isosurface, the Monte-Carlo electron density settles, and the
 * bond then breathes at its vibrational frequency. Labels are HTML pinned to
 * projected scene points with leader lines and a small collision-avoidance
 * relaxation; the sidebar carries the periodic-table picker, the measured
 * gas-phase data and the valence MO energy diagram with its Hund's-rule boxes.
 *
 * Everything from the artifact is here except the pieces that only made sense
 * in a standalone 3D-export page: the OBJ/GLB toolbar, the export telemetry and
 * the branding badge. The fixed full-viewport layout became an in-flow panel
 * with a wrapping sidebar, and the palette was retuned from the artifact's
 * cool cyan/green/salmon toward this site's warm academic set. The stage stays
 * dark: the orbital shells are additive, emissive and semi-transparent, and
 * wash out completely on a light background.
 *
 * Nothing WebGL-shaped runs during render. `three` is imported for types and
 * for the effect body only; the renderer, the geometry, the Monte-Carlo
 * sampling and every `performance.now()` live inside `useEffect`, so the server
 * emits a sized, labelled placeholder and hydration sees identical markup.
 */

// --- Palette -------------------------------------------------------------
// The one thing deliberately changed from the original. Left column is the
// artifact's value; everything else is a faithful port.

/** On the dark stage: warm near-black ground, warm paper text. */
const SCENE = {
  bg: "#14120e", //            was #0d0f14  cool blue-black -> warm near-black
  fg: "#f2ece0", //            was #e9e7e2
  muted: "#b8ae9c", //         was #a9a7a1
  dim: "#8c8477", //           was #7d7b76
  panel: "rgba(24, 20, 14, 0.9)", // was rgba(18,20,27,0.9)
  hairline: "rgba(242, 236, 224, 0.14)", // was rgba(233,231,226,0.16)
  leader: "rgba(242, 236, 224, 0.45)", // was rgba(233,231,226,0.45)
};

/** Three.js material hues. Same roles, warmer hues, same relative luminance. */
const MAT = {
  sigma: 0x74b6d6, //          was 0x62c3e8
  sigmaEmissive: 0x1f4454, //  was 0x1d4d66
  pi: 0x9ec87e, //             was 0x7fd49a
  piEmissive: 0x2b4423, //     was 0x1f4a2c
  antiPos: 0xe59470, //        was 0xf0937a
  antiPosEmissive: 0x53291a, //was 0x5a2a1c
  antiNeg: 0xb79ad6, //        was 0xb9a3f0
  antiNegEmissive: 0x332950, //was 0x33285a
  node: 0xe59470, //           was 0xf0937a
  cloud: 0xa9d3e2, //          was 0x9fdcf3
  guide: 0xf2ece0, //          was 0xe9e7e2
  nucleus: 0xf5efe2, //        was 0xf4efe6
};

/**
 * The same four MO roles again, stepped darker so they read on this site's
 * cream card instead of on the artifact's dark panel. The 3D scene and the
 * sidebar are on opposite backgrounds, so one palette cannot serve both.
 */
const PANEL = {
  sigma: "#2d6b8a",
  pi: "#4a7a2e",
  anti: "#a8512c",
  nonbonding: "var(--muted-foreground)",
  cloud: "#4e8ca8",
  neutral: "var(--foreground)",
  recessive: "var(--muted-foreground)",
};

const NPTS = 9000;
const ARC_N = 49;

// --- Scene ---------------------------------------------------------------

type ToggleKey = "cloud" | "sigma" | "pi" | "anti";

type Box = { x: number; y: number; w: number; h: number; fixed: boolean };

type Label = Box & {
  at: () => [number, number, number];
  dx: number;
  dy: number;
  bare: boolean;
  noDot: boolean;
  show: (() => boolean) | null;
  el: HTMLDivElement;
  dot: HTMLDivElement | null;
  line: SVGLineElement;
  /** Anchor: the projected scene point the leader line starts from. */
  ax: number;
  ay: number;
};

type Mounts = {
  stage: HTMLDivElement;
  overlay: HTMLDivElement;
  svg: SVGSVGElement;
  caption: HTMLDivElement;
  note: HTMLDivElement;
};

/**
 * The molecule itself: the three.js scene graph, the label overlay and the
 * animation loop, all driven imperatively so a 60 Hz frame never re-renders
 * React. React owns the selection and the toggles and pushes them in.
 */
function createExplorer(m: Mounts) {
  const stage = new DiatomicStage(m.stage);

  // Materials
  const glass = (name: string, color: number, emissive: number, op: number) =>
    new THREE.MeshStandardMaterial({
      name,
      color,
      emissive,
      roughness: 0.28,
      transparent: true,
      opacity: op,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  const M = {
    nucA: new THREE.MeshStandardMaterial({
      name: "nucleus_A",
      color: MAT.nucleus,
      emissiveIntensity: 0.35,
      roughness: 0.35,
    }),
    nucB: new THREE.MeshStandardMaterial({
      name: "nucleus_B",
      color: MAT.nucleus,
      emissiveIntensity: 0.35,
      roughness: 0.35,
    }),
    sigma: glass("sigma_bonding", MAT.sigma, MAT.sigmaEmissive, 0.26),
    pi: glass("pi_bonding", MAT.pi, MAT.piEmissive, 0.22),
    antiPos: glass("sigma_star_phase_pos", MAT.antiPos, MAT.antiPosEmissive, 0.3),
    antiNeg: glass("sigma_star_phase_neg", MAT.antiNeg, MAT.antiNegEmissive, 0.3),
    node: new THREE.MeshBasicMaterial({
      name: "nodal_plane",
      color: MAT.node,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    cloud: new THREE.PointsMaterial({
      name: "electron_density",
      color: MAT.cloud,
      size: 0.013,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
    guide: new THREE.LineBasicMaterial({
      name: "guide_lines",
      color: MAT.guide,
      transparent: true,
      opacity: 0.85,
      depthTest: false,
    }),
    axis: new THREE.LineDashedMaterial({
      name: "axis_line",
      color: MAT.guide,
      dashSize: 0.06,
      gapSize: 0.05,
      transparent: true,
      opacity: 0.4,
      depthTest: false,
    }),
  };

  const model = new THREE.Group();
  model.name = "diatomic_molecule";
  const unitSphere = new THREE.SphereGeometry(1, 32, 16);
  const nucA = new THREE.Mesh(unitSphere, M.nucA);
  const nucB = new THREE.Mesh(unitSphere, M.nucB);
  const sigma = new THREE.Mesh(new THREE.BufferGeometry(), M.sigma);
  sigma.name = "sigma_bonding_MO";
  sigma.renderOrder = 2;
  const piGroup = new THREE.Group();
  piGroup.name = "pi_bonds";
  const piDirs: [number, number][] = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  const piLobes = piDirs.map(([y, z], i) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), M.pi);
    mesh.name = `pi_lobe_${i}`;
    piGroup.add(mesh);
    return { mesh, dy: y, dz: z };
  });
  const antiA = new THREE.Mesh(new THREE.BufferGeometry(), M.antiPos);
  antiA.name = "sigma_star_lobe_A";
  const antiB = new THREE.Mesh(new THREE.BufferGeometry(), M.antiNeg);
  antiB.name = "sigma_star_lobe_B";
  const node = new THREE.Mesh(new THREE.CircleGeometry(1, 64), M.node);
  node.name = "sigma_star_nodal_plane";
  node.rotation.y = Math.PI / 2;
  const anti = new THREE.Group();
  anti.name = "sigma_star_antibonding_MO";
  anti.add(antiA, antiB, node);
  anti.visible = false;

  const cloudPos = new Float32Array(NPTS * 3);
  const cloudGeo = new THREE.BufferGeometry();
  cloudGeo.setAttribute("position", new THREE.BufferAttribute(cloudPos, 3));
  const cloud = new THREE.Points(cloudGeo, M.cloud);
  cloud.name = "electron_density_cloud";
  cloud.renderOrder = 3;

  const dimGeo = new THREE.BufferGeometry();
  dimGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(30), 3));
  const dim = new THREE.LineSegments(dimGeo, M.guide);
  dim.name = "bond_length_dimension";
  dim.renderOrder = 10;
  const arcGeo = new THREE.BufferGeometry();
  arcGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(ARC_N * 3), 3));
  const arc = new THREE.Line(arcGeo, M.guide);
  arc.name = "bond_angle_arc";
  arc.renderOrder = 10;
  const axis = new THREE.Line(new THREE.BufferGeometry(), M.axis);
  axis.name = "internuclear_axis";
  axis.renderOrder = 10;
  model.add(nucA, nucB, sigma, piGroup, anti, cloud, dim, arc, axis);

  // Current molecule
  let mol: MoleculeInfo | null = null;
  let met: SceneMetrics | null = null;
  let R = 1;
  let cA = 1;
  let cB = 1;
  let kA = el("H").k;
  let kB = el("H").k;
  let nodeX = 0;
  const v3 = new THREE.Vector3();

  /** A profile of revolution about x, as three wants it: radius in x, height in y. */
  const lathe = (p: Profile) => {
    const g = new THREE.LatheGeometry(
      p.pts.map((q) => new THREE.Vector2(q.rho, q.x)),
      64,
    );
    g.rotateZ(-Math.PI / 2);
    return g;
  };

  /** Rejection-sample one point of |psi_sigma|^2 into slot `i` of the cloud. */
  function sample(i: number) {
    const wA = (cA * cA) / kA ** 3;
    const wB = (cB * cB) / kB ** 3;
    for (let tries = 0; tries < 200; tries++) {
      const onA = Math.random() < wA / (wA + wB);
      const k = onA ? kA : kB;
      const r =
        -(Math.log(Math.random()) + Math.log(Math.random()) + Math.log(Math.random())) / (2 * k);
      v3.randomDirection().multiplyScalar(r);
      v3.x += (onA ? -1 : 1) * (R / 2);
      const a = cA * Math.exp(-kA * Math.hypot(v3.x + R / 2, v3.y, v3.z));
      const b = cB * Math.exp(-kB * Math.hypot(v3.x - R / 2, v3.y, v3.z));
      if (Math.random() < (a + b) ** 2 / (2 * (a * a + b * b))) {
        cloudPos.set([v3.x, v3.y, v3.z], i * 3);
        return;
      }
    }
  }

  /** Dimension line, its witness lines and ticks, plus the 180-degree arc. */
  function setGuides() {
    if (!met) return;
    const h = R / 2;
    const u = met.u;
    const y = met.dimY;
    const p = dimGeo.attributes["position"]!.array as Float32Array;
    (
      [
        [-h, y, h, y],
        [-h, -2 * u, -h, y - u],
        [h, -2 * u, h, y - u],
        [-h - u * 0.7, y - u * 0.7, -h + u * 0.7, y + u * 0.7],
        [h - u * 0.7, y - u * 0.7, h + u * 0.7, y + u * 0.7],
      ] as [number, number, number, number][]
    ).forEach((s, i) => p.set([s[0], s[1], 0, s[2], s[3], 0], i * 6));
    dimGeo.attributes["position"]!.needsUpdate = true;
    const a = arcGeo.attributes["position"]!.array as Float32Array;
    const rr = Math.max(h, 5 * u);
    for (let i = 0; i < ARC_N; i++) {
      const th = (Math.PI * i) / (ARC_N - 1);
      a.set([-Math.cos(th) * rr, Math.sin(th) * rr, 0], i * 3);
    }
    arcGeo.attributes["position"]!.needsUpdate = true;
  }

  /** Schematic side-on p-orbital lobes, two per pi bond. */
  function setPi() {
    if (!mol) return;
    const rc = mol.rcAvg;
    const nPi = mol.nPi;
    piLobes.forEach(({ mesh, dy, dz }, i) => {
      mesh.visible = i < nPi * 2;
      mesh.position.set(0, dy * rc * 0.8, dz * rc * 0.8);
      mesh.scale.set(R / 2 + rc * 0.45, dy ? rc * 0.42 : rc * 0.55, dz ? rc * 0.42 : rc * 0.55);
    });
  }

  /** Re-solve every isosurface for a separation `r` and a polarity `p`. */
  function setState(r: number, p: number, rebuildAnti: boolean) {
    if (!mol) return;
    R = r;
    [cA, cB] = coeffs(p);
    nucA.position.set(-R / 2, 0, 0);
    nucB.position.set(R / 2, 0, 0);
    sigma.geometry.dispose();
    sigma.geometry = lathe(bondingProfile(R, cA, cB, kA, kB));
    if (rebuildAnti) {
      // Antibonding is weighted toward the less electronegative atom, so the
      // coefficients — but not the exponents — swap.
      const { lower, upper, nodeX: xn } = antiProfiles(R, cB, cA, kA, kB);
      antiA.geometry.dispose();
      antiB.geometry.dispose();
      antiA.geometry = lathe(lower);
      antiB.geometry = lathe(upper);
      nodeX = xn;
      node.position.x = xn;
      node.scale.setScalar(mol.rcAvg * 1.3);
    }
    setGuides();
    setPi();
  }

  // --- Labels ------------------------------------------------------------
  const L: Record<string, Label> = {};
  function mkLabel(
    id: string,
    opts: {
      at: () => [number, number, number];
      dx: number;
      dy: number;
      bare?: boolean;
      noDot?: boolean;
      show?: () => boolean;
    },
  ) {
    const div = document.createElement("div");
    div.className = opts.bare ? "dbe-lbl dbe-bare" : "dbe-lbl";
    m.overlay.appendChild(div);
    let dot: HTMLDivElement | null = null;
    if (!opts.noDot) {
      dot = document.createElement("div");
      dot.className = "dbe-dot";
      m.overlay.appendChild(dot);
    }
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("stroke", SCENE.leader);
    line.setAttribute("stroke-width", "1");
    m.svg.appendChild(line);
    L[id] = {
      at: opts.at,
      dx: opts.dx,
      dy: opts.dy,
      bare: opts.bare === true,
      noDot: opts.noDot === true,
      show: opts.show ?? null,
      el: div,
      dot,
      line,
      ax: 0,
      ay: 0,
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      fixed: false,
    };
  }
  mkLabel("nucA", { at: () => [-R / 2, 0, 0], dx: -130, dy: -110 });
  mkLabel("nucB", { at: () => [R / 2, 0, 0], dx: 130, dy: -110 });
  mkLabel("len", { at: () => [0, met?.dimY ?? 0, 0], dx: 0, dy: 20, bare: true, noDot: true });
  mkLabel("ang", {
    at: () => [0, Math.max(R / 2, 5 * (met?.u ?? 0)), 0],
    dx: 0,
    dy: -110,
  });
  mkLabel("sigma", {
    at: () => [-R * 0.2, -(met?.rhoMax ?? 0) * 0.6, (met?.rhoMax ?? 0) * 0.5],
    dx: -170,
    dy: 110,
    show: () => sigma.visible,
  });
  mkLabel("pi", {
    at: () => [R * 0.15, (mol?.rcAvg ?? 0) * 1.15, 0],
    dx: 150,
    dy: -90,
    show: () => piGroup.visible && (mol?.nPi ?? 0) > 0,
  });
  mkLabel("dens", {
    at: () => [R * 0.3, (met?.rhoMax ?? 0) * 0.3, (met?.rhoMax ?? 0) * 0.4],
    dx: 190,
    dy: 120,
    show: () => cloud.visible,
  });
  mkLabel("axis", { at: () => [(met?.xR ?? 0) + 6 * (met?.u ?? 0), 0, 0], dx: 60, dy: -45 });
  mkLabel("anti", {
    at: () => [-R / 2 - (mol?.rcAvg ?? 0) * 0.7, 0, 0],
    dx: -120,
    dy: 20,
    show: () => anti.visible,
  });
  mkLabel("node", {
    at: () => [nodeX, (mol?.rcAvg ?? 0) * 1.3, 0],
    dx: 110,
    dy: -70,
    show: () => anti.visible,
  });

  let labelsOn = true;
  let labelAlpha = 1;

  /** The caption pill and the footnote: labels are pushed clear of both. */
  function obstacles(): Box[] {
    const o = m.overlay.getBoundingClientRect();
    return [m.caption, m.note].map((node_) => {
      const r = node_.getBoundingClientRect();
      return {
        x: r.left - o.left + r.width / 2,
        y: r.top - o.top + r.height / 2,
        w: r.width,
        h: r.height,
        fixed: true,
      };
    });
  }

  function drawLabels() {
    const cam = stage.camera;
    const cw = m.stage.clientWidth;
    const ch = m.stage.clientHeight;
    const vis: Label[] = [];
    for (const l of Object.values(L)) {
      const a = labelsOn && (!l.show || l.show()) ? labelAlpha : 0;
      l.el.style.opacity = String(a);
      if (l.dot) l.dot.style.opacity = String(a);
      l.line.style.opacity = String(l.noDot ? 0 : a);
      if (a === 0) continue;
      model.localToWorld(v3.set(...l.at())).project(cam);
      l.ax = ((v3.x + 1) / 2) * cw;
      l.ay = ((1 - v3.y) / 2) * ch;
      l.w = l.el.offsetWidth;
      l.h = l.el.offsetHeight;
      l.x = l.ax + l.dx;
      l.y = l.ay + l.dy;
      vis.push(l);
    }
    const obs = obstacles();
    const yTop = obs[0]!.y + obs[0]!.h / 2 + 6;
    const yBot = obs[1]!.y - obs[1]!.h / 2 - 6;
    const clamp = (l: Box) => {
      const hw = l.w / 2 + 8;
      const hh = l.h / 2 + 4;
      l.x = Math.min(Math.max(l.x, hw), cw - hw);
      l.y = Math.min(Math.max(l.y, yTop + hh), yBot - hh);
    };
    vis.forEach(clamp);
    for (let pass = 0; pass < 4; pass++) {
      const all: Box[] = [...obs, ...vis];
      for (let i = 0; i < all.length; i++)
        for (let j = Math.max(i + 1, obs.length); j < all.length; j++) {
          const p = all[i]!;
          const q = all[j]!;
          const ox = (p.w + q.w) / 2 + 6 - Math.abs(p.x - q.x);
          const oy = (p.h + q.h) / 2 + 6 - Math.abs(p.y - q.y);
          if (ox <= 0 || oy <= 0) continue;
          const dir = q.y >= p.y ? 1 : -1;
          if (p.fixed) q.y += dir * oy;
          else {
            p.y -= (dir * oy) / 2;
            q.y += (dir * oy) / 2;
            clamp(p);
          }
          clamp(q);
        }
    }
    for (const l of vis) {
      l.el.style.left = `${l.x}px`;
      l.el.style.top = `${l.y}px`;
      if (l.dot) {
        l.dot.style.left = `${l.ax}px`;
        l.dot.style.top = `${l.ay}px`;
      }
      if (!l.noDot) {
        l.line.setAttribute("x1", String(l.ax));
        l.line.setAttribute("y1", String(l.ay));
        l.line.setAttribute("x2", String(l.x));
        l.line.setAttribute("y2", String(l.y));
      }
    }
  }

  // --- Load --------------------------------------------------------------
  let t0 = performance.now();
  let lastCap = "";

  function load(info: MoleculeInfo) {
    mol = info;
    met = sceneMetrics(info);
    const { A, B, r } = info;
    kA = A.k;
    kB = B.k;
    [cA, cB] = coeffs(info.pFinal);
    R = r;
    model.scale.setScalar(met.s);
    M.cloud.size = 0.013;
    M.nucA.color.setHex(A.color);
    M.nucA.emissive.setHex(A.color);
    M.nucB.color.setHex(B.color);
    M.nucB.emissive.setHex(B.color);
    nucA.scale.setScalar((0.035 + 0.005 * Math.sqrt(A.Z)) / met.s);
    nucA.name = `${A.sym}_nucleus_A`;
    nucB.scale.setScalar((0.035 + 0.005 * Math.sqrt(B.Z)) / met.s);
    nucB.name = `${B.sym}_nucleus_B`;
    axis.geometry.dispose();
    axis.geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(met.xL - 6 * met.u, 0, 0),
      new THREE.Vector3(met.xR + 6 * met.u, 0, 0),
    ]);
    M.axis.dashSize = 3 * met.u;
    M.axis.gapSize = 2.5 * met.u;
    axis.computeLineDistances();
    setState(r, info.pFinal, true);
    for (let i = 0; i < NPTS; i++) sample(i);
    cloudGeo.attributes["position"]!.needsUpdate = true;
    model.name = `${A.sym}${info.homo ? "2" : B.sym}_molecule`;
    stage.setObject(model);
    stage.ground.visible = false;

    // Copy
    const polar = info.type !== "nonpolar covalent";
    const neg = info.neg;
    const charge = (X: DiatomicElement) =>
      !polar
        ? ""
        : info.type === "ionic"
          ? X === neg
            ? " · anion (−)"
            : " · cation (+)"
          : X === neg
            ? " · δ−"
            : " · δ+";
    L["nucA"]!.el.innerHTML =
      `${A.sym} nucleus<small>Z = ${A.Z} · valence ${A.val}${charge(A)}</small>`;
    L["nucB"]!.el.innerHTML =
      `${B.sym} nucleus<small>Z = ${B.Z} · valence ${B.val}${charge(B)}</small>`;
    L["len"]!.el.innerHTML =
      `r<sub>e</sub> = ${r.toFixed(3)} Å <span style="color:${SCENE.muted}">(${Math.round(r * 100)} pm)</span>`;
    L["ang"]!.el.innerHTML =
      `∠ ${A.sym}–${B.sym} = 180°<small>linear · ${info.homo ? "D∞h" : "C∞v"}</small>`;
    L["sigma"]!.el.innerHTML =
      `σ bonding MO<small>${info.type}${polar ? ` · density shifted toward ${neg.sym}` : " · shared equally"} · 2 e⁻ ↑↓</small>`;
    L["pi"]!.el.innerHTML =
      `π bond${info.nPi > 1 ? `s ×${info.nPi}` : ""}<small>side-on p-orbital overlap (schematic)</small>`;
    L["dens"]!.el.innerHTML =
      `Electron density |ψ<sub>σ</sub>|²<small>bonding-pair probability cloud</small>`;
    L["axis"]!.el.innerHTML = `internuclear axis<small>C∞ symmetry axis</small>`;
    L["anti"]!.el.innerHTML = `σ* antibonding MO<small>opposite phases · empty</small>`;
    L["node"]!.el.innerHTML = `nodal plane<small>ψ = 0 between nuclei</small>`;

    t0 = performance.now();
  }

  // --- Animation loop ----------------------------------------------------
  stage.onFrame = () => {
    if (!mol) return;
    const t = (performance.now() - t0) / 1000;
    const forming = t < FORM;
    const u = ease(Math.min(t / (FORM - 0.5), 1));
    const start = met?.R0 ?? mol.r;
    const r = forming
      ? start + (mol.r - start) * u
      : mol.r * (1 + 0.025 * Math.sin((t - FORM) * 2 * Math.PI * 0.6));
    setState(r, mol.pFinal * (forming ? u : 1), anti.visible);
    piGroup.scale.set(1, forming ? Math.max(u, 0.001) : 1, forming ? Math.max(u, 0.001) : 1);
    const n = forming ? 1500 : 160;
    for (let k = 0; k < n; k++) sample((Math.random() * NPTS) | 0);
    cloudGeo.attributes["position"]!.needsUpdate = true;
    labelAlpha = forming ? 0 : Math.min((t - FORM) / 0.6, 1);
    const { A, B } = mol;
    const c =
      t < 2.2
        ? `${A.sym}· + ·${B.sym}  approach`
        : forming
          ? mol.type === "ionic"
            ? `electron density transfers ${mol.dEN > 0 ? `${A.sym} → ${B.sym}` : `${B.sym} → ${A.sym}`}`
            : `valence orbitals overlap → σ${mol.nPi ? " + π" : ""} bond`
          : `${mol.formula} · ${mol.type} · bond order ${mol.bo}`;
    if (c !== lastCap) {
      m.caption.textContent = c;
      lastCap = c;
    }
    drawLabels();
  };

  stage.controls.autoRotateSpeed = 0.8;

  return {
    load,
    replay() {
      t0 = performance.now();
    },
    setVisible(which: ToggleKey, on: boolean) {
      if (which === "cloud") cloud.visible = on;
      else if (which === "sigma") sigma.visible = on;
      else if (which === "pi") piGroup.visible = on;
      else {
        anti.visible = on;
        setState(R, (cB * cB - cA * cA) / 2, true);
      }
    },
    setLabelsOn(on: boolean) {
      labelsOn = on;
    },
    setAutoRotate(on: boolean) {
      stage.controls.autoRotate = on;
    },
    dispose() {
      stage.onFrame = null;
      stage.dispose();
      model.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
      });
      unitSphere.dispose();
      cloudGeo.dispose();
      dimGeo.dispose();
      arcGeo.dispose();
      for (const mat of Object.values(M)) mat.dispose();
      for (const l of Object.values(L)) {
        l.el.remove();
        l.dot?.remove();
        l.line.remove();
      }
    },
  };
}

// --- Overlay CSS ---------------------------------------------------------
// Descendant selectors (a label's <small>, <sub>) need a stylesheet, so the
// label chrome lives here rather than in inline styles. Static text, so it is
// byte-identical on the server and the client.
const OVERLAY_CSS = `
.dbe-lbl { opacity: 0; position: absolute; transform: translate(-50%, -50%); font: 500 12px/1.35 ui-monospace, SFMono-Regular, Menlo, monospace; color: ${SCENE.fg}; white-space: nowrap; background: ${SCENE.panel}; border: 1px solid ${SCENE.hairline}; padding: 5px 8px; border-radius: 4px; }
.dbe-lbl small { display: block; font-weight: 400; color: ${SCENE.muted}; font-size: 11px; }
.dbe-lbl.dbe-bare { background: none; border: none; padding: 0; text-shadow: 0 0 6px ${SCENE.bg}, 0 0 3px ${SCENE.bg}; }
.dbe-dot { opacity: 0; position: absolute; width: 5px; height: 5px; margin: -2.5px 0 0 -2.5px; border-radius: 50%; background: ${SCENE.fg}; }
.dbe-leaders line { opacity: 0; }
.dbe-cap { font: 500 12px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace; }
`;

// --- Component -----------------------------------------------------------

type Selection = { a: string; b: string | null };

export function DiatomicBondExplorer() {
  const [sel, setSel] = useState<Selection>({ a: "H", b: "H" });
  const [loaded, setLoaded] = useState<[string, string]>(["H", "H"]);
  const [showCloud, setShowCloud] = useState(true);
  const [showSigma, setShowSigma] = useState(true);
  const [showPi, setShowPi] = useState(true);
  const [showAnti, setShowAnti] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const captionRef = useRef<HTMLDivElement | null>(null);
  const noteRef = useRef<HTMLDivElement | null>(null);
  const explorerRef = useRef<ReturnType<typeof createExplorer> | null>(null);

  const info = useMemo(() => moleculeInfo(loaded[0], loaded[1]), [loaded]);

  // The renderer: built once, on the client only. Every WebGL call, every
  // performance.now() and every Math.random() is downstream of this effect.
  useEffect(() => {
    const stage = stageRef.current;
    const overlay = overlayRef.current;
    const svg = svgRef.current;
    const caption = captionRef.current;
    const note = noteRef.current;
    if (!stage || !overlay || !svg || !caption || !note) return;
    let explorer: ReturnType<typeof createExplorer> | null = null;
    try {
      explorer = createExplorer({ stage, overlay, svg, caption, note });
    } catch {
      // No WebGL context available — the placeholder and the whole sidebar,
      // which is plain markup, stay usable.
      return;
    }
    explorerRef.current = explorer;
    // No readiness flag: every effect below is declared after this one, so on
    // mount it runs after the explorer exists, in the same commit. The load
    // effect is what puts the first molecule on the stage.
    return () => {
      explorerRef.current = null;
      explorer.dispose();
    };
  }, []);

  useEffect(() => {
    explorerRef.current?.load(info);
  }, [info]);

  useEffect(() => {
    explorerRef.current?.setVisible("cloud", showCloud);
  }, [showCloud]);
  useEffect(() => {
    explorerRef.current?.setVisible("sigma", showSigma);
  }, [showSigma]);
  useEffect(() => {
    explorerRef.current?.setVisible("pi", showPi);
  }, [showPi, info]);
  useEffect(() => {
    explorerRef.current?.setVisible("anti", showAnti);
  }, [showAnti]);
  useEffect(() => {
    explorerRef.current?.setLabelsOn(showLabels);
  }, [showLabels]);
  useEffect(() => {
    explorerRef.current?.setAutoRotate(autoRotate);
  }, [autoRotate]);

  const choosing = sel.b === null;
  const ok = useMemo(() => (choosing ? partners(sel.a) : null), [choosing, sel.a]);

  const pick = (s: string) => {
    if (el(s).en == null) return;
    if (sel.b !== null) {
      setSel({ a: s, b: null });
    } else if (partners(sel.a).has(s)) {
      setSel({ a: sel.a, b: s });
      setLoaded([sel.a, s]);
    }
  };

  const piDisabled = info.nPi === 0;
  const absEN = Math.abs(info.dEN);

  const stageLabel =
    `Three-dimensional view of ${info.formula}: two nuclei ${info.r.toFixed(3)} ångström apart, ` +
    `joined by a sigma bonding molecular orbital drawn as an isosurface` +
    (info.nPi > 0 ? ` plus ${info.nPi} pi bond${info.nPi > 1 ? "s" : ""}` : "") +
    `, with a Monte-Carlo electron density cloud ` +
    (info.type === "nonpolar covalent"
      ? "shared equally between the two atoms"
      : `shifted toward ${info.neg.sym}`) +
    `. Bond order ${info.bo}. Drag to orbit, scroll to zoom.`;

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <style>{OVERLAY_CSS}</style>

      {/* Stage. Order flips so the sidebar sits to the left on wide screens and
          wraps below the scene on narrow ones. */}
      <div className="order-1 min-w-0 flex-1 lg:order-2">
        <div
          className="relative aspect-[16/10] min-h-[320px] overflow-hidden rounded-xl border border-border shadow-sm"
          style={{ background: SCENE.bg }}
        >
          <div
            ref={stageRef}
            className="absolute inset-0 touch-none"
            role="img"
            aria-label={stageLabel}
          />
          <div ref={overlayRef} className="pointer-events-none absolute inset-0 overflow-hidden">
            <svg ref={svgRef} className="dbe-leaders absolute inset-0 h-full w-full" />
            <div
              ref={captionRef}
              className="dbe-cap absolute left-3 top-3 whitespace-nowrap rounded-full border px-4 py-1.5"
              style={{ color: SCENE.fg, background: SCENE.panel, borderColor: SCENE.hairline }}
            />
            <div
              ref={noteRef}
              className="absolute bottom-3 left-3 max-w-[60%] text-[11px] leading-snug"
              style={{ color: SCENE.dim }}
            >
              Schematic two-center LCAO model · nuclei enlarged · vibration exaggerated · values ≈
              gas-phase diatomic data
            </div>
            <div
              className="absolute bottom-3 right-3 text-[11px]"
              style={{ color: SCENE.dim }}
              aria-hidden="true"
            >
              Drag to orbit · scroll to zoom · right-drag to pan
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="order-2 w-full space-y-4 lg:order-1 lg:w-[312px] lg:flex-none">
        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Choose two elements
          </h3>
          <div className="grid grid-cols-8 gap-1" role="group" aria-label="Element picker">
            {[1, 2, 3].flatMap((row) =>
              [1, 2, 3, 4, 5, 6, 7, 8].map((column) => {
                const e = ELEMENT_LIST.find((x) => x.row === row && x.col === column);
                if (!e) return <div key={`${row}-${column}`} />;
                const noble = e.en == null;
                const off = noble || (choosing && ok !== null && !ok.has(e.sym));
                const isA = e.sym === sel.a;
                const isB = e.sym === sel.b && sel.b !== sel.a;
                const accent = isA ? PANEL.sigma : isB ? PANEL.anti : null;
                return (
                  <button
                    key={`${row}-${column}`}
                    type="button"
                    onClick={() => pick(e.sym)}
                    aria-disabled={off}
                    aria-pressed={isA || isB}
                    title={
                      noble
                        ? `${e.name} — noble gas, forms no stable diatomic bond`
                        : choosing && off
                          ? `${e.name} — no tabulated diatomic with ${el(sel.a).name}`
                          : e.name
                    }
                    aria-label={`${e.name}, atomic number ${e.Z}`}
                    className={`flex aspect-square flex-col items-center justify-center gap-px rounded-md border text-sm font-bold leading-none transition-opacity ${
                      off ? "cursor-not-allowed opacity-25" : "hover:bg-secondary"
                    } ${accent ? "" : "border-border bg-secondary/40"}`}
                    style={
                      accent
                        ? { borderColor: accent, background: `${accent}2e`, color: "inherit" }
                        : undefined
                    }
                  >
                    {e.sym}
                    <span className="font-mono text-[9px] font-normal not-italic text-muted-foreground">
                      {e.Z}
                    </span>
                  </button>
                );
              }),
            )}
          </div>
          <p className="mt-2.5 min-h-4 text-xs text-muted-foreground" aria-live="polite">
            {choosing && ok !== null ? (
              <>
                Pick a partner for <b className="font-medium text-foreground">{el(sel.a).name}</b> ·{" "}
                {ok.size} option{ok.size === 1 ? "" : "s"}
              </>
            ) : (
              <>
                Showing <b className="font-medium text-foreground">{info.formula}</b> · pick a first
                element to start a new bond
              </>
            )}
          </p>
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <h1 className="text-[22px] font-semibold leading-tight tracking-tight">{info.formula}</h1>
          <p className="mb-3 text-[13px] text-muted-foreground">
            {info.homo ? `${info.A.name} · homonuclear` : `${info.A.name} + ${info.B.name}`}
          </p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-1.5 text-[12.5px]">
            <Fact k={<>Bond length r&#8337;</>} v={`${info.r.toFixed(3)} Å`} />
            <Fact k="Bond angle" v="180° (linear)" />
            <Fact k="Point group" v={info.homo ? "D∞h" : "C∞v"} />
            <Fact k="Bond order" v={String(info.bo)} />
            <Fact k={<>Bond energy D&#8320;</>} v={`≈ ${info.D} kJ/mol`} />
            <Fact k="Bond type" v={info.type} />
            <Fact k="ΔEN (Pauling)" v={absEN.toFixed(2)} />
            <Fact
              k="Valence e⁻"
              v={`${info.ve}${info.unpaired ? ` · ${info.unpaired} unpaired` : ""}`}
            />
          </dl>
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Valence MO energy diagram
          </h3>
          <MODiagram info={info} />
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5 text-[10.5px] text-muted-foreground">
            <LegendKey color={PANEL.sigma} label="σ bonding" />
            <LegendKey color={PANEL.pi} label="π bonding" />
            <LegendKey color={PANEL.anti} label="antibonding" />
            <LegendKey color={PANEL.nonbonding} label="nonbonding" />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="sr-only">Display controls</h3>
          <div className="grid grid-cols-2 gap-x-2.5 gap-y-2 text-xs">
            <Toggle
              checked={showCloud}
              onChange={setShowCloud}
              color={PANEL.cloud}
              label="Density |ψ|²"
            />
            <Toggle
              checked={showSigma}
              onChange={setShowSigma}
              color={PANEL.sigma}
              label="σ bonding"
            />
            <Toggle
              checked={showPi}
              onChange={setShowPi}
              color={PANEL.pi}
              label="π bonds"
              disabled={piDisabled}
              disabledHint={`${info.formula} has no π bond`}
            />
            <Toggle
              checked={showAnti}
              onChange={setShowAnti}
              color={PANEL.anti}
              label="σ* antibonding"
            />
            <Toggle
              checked={showLabels}
              onChange={setShowLabels}
              color={PANEL.neutral}
              label="Labels"
            />
            <Toggle
              checked={autoRotate}
              onChange={setAutoRotate}
              color={PANEL.recessive}
              label="Auto-rotate"
            />
            <button
              type="button"
              onClick={() => explorerRef.current?.replay()}
              className="col-span-2 mt-1 rounded-md bg-primary px-2.5 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Replay bond formation
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Fact({ k, v }: { k: ReactNode; v: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="m-0 text-right font-mono tabular-nums">{v}</dd>
    </>
  );
}

function LegendKey({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span aria-hidden="true" className="h-0 w-3 border-t-2" style={{ borderColor: color }} />
      {label}
    </span>
  );
}

function Toggle({
  checked,
  onChange,
  color,
  label,
  disabled = false,
  disabledHint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  color: string;
  label: string;
  disabled?: boolean;
  disabledHint?: string;
}) {
  return (
    <label
      className={`flex items-center gap-2.5 ${disabled ? "opacity-35" : "cursor-pointer"}`}
      {...(disabled && disabledHint ? { title: disabledHint } : {})}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="m-0 accent-[var(--accent)]"
      />
      <span
        aria-hidden="true"
        className="h-2.5 w-2.5 flex-none rounded-sm"
        style={{ background: color }}
      />
      {label}
    </label>
  );
}

// --- MO diagram ----------------------------------------------------------

/**
 * Atomic orbitals on each side, molecular orbitals in the middle, each level a
 * horizontal rule carrying its Hund's-rule arrows. Same absolute pixel geometry
 * as the artifact; the vertical placement of the atomic-orbital columns is
 * indicative, not measured.
 */
function MODiagram({ info }: { info: MoleculeInfo }) {
  const d = info.diagram;
  const { A, B } = info;
  const N = d.levels.length;
  const gap = 30;
  const top = 34;
  const H = top + (N - 1) * gap + 22;
  const y = (i: number) => top + (N - 1 - i) * gap;
  const idx = (name: string) => d.levels.findIndex((l) => l.name === name);
  const col = (l: MOLevel) =>
    l.sign < 0
      ? PANEL.anti
      : l.sign === 0
        ? PANEL.nonbonding
        : l.kind === "p"
          ? PANEL.pi
          : PANEL.sigma;

  const boxes = (e: number, g: number, c: string, key: string) =>
    hund(e, g).map((k, i) => (
      <div
        key={`${key}-${i}`}
        className="relative h-0 w-[18px] border-t-2"
        style={{ borderColor: c }}
      >
        <span
          className="absolute -left-1.5 -right-1.5 bottom-0.5 text-center text-[12px] leading-none"
          style={{ color: PANEL.neutral }}
        >
          {k === 2 ? "↑↓" : k === 1 ? "↑" : ""}
        </span>
      </div>
    ));

  const ao = (X: DiatomicElement) => {
    const out: { nm: string; g: number; e: number; i: number }[] = [];
    const sE = X.sym === "H" ? 1 : Math.min(2, X.ve);
    const pE = X.col >= 3 ? X.ve - 2 : 0;
    const shift = A.sym === B.sym ? 0 : X === d.neg ? -0.3 : 0.3;
    let ys: number;
    let yp = 0;
    if (d.type === "s") ys = 0.5 + shift;
    else if (d.type === "h") {
      if (X.sym === "H") ys = (idx("σ") + idx("σ*")) / 2;
      else {
        ys = idx(`${X.sym} ${X.row}s`);
        yp = idx(`${X.sym} ${X.row}p`);
      }
    } else if (d.type === "i") {
      ys = idx(`${X.sym} ${X.row}s`);
      yp = idx(`${X.sym} ${X.row}p`);
      if (yp < 0) yp = ys + 1.5;
    } else {
      ys = 0.5 + shift;
      yp = 3.5 + shift;
    }
    out.push({ nm: `${X.row}s`, g: 1, e: sE, i: ys });
    if (X.col >= 3) out.push({ nm: `${X.row}p`, g: 3, e: pE, i: yp });
    return out;
  };

  const aoColumn = (X: DiatomicElement, x0: number, side: string) =>
    ao(X).flatMap((o) => [
      <div
        key={`${side}-l-${o.nm}`}
        className="absolute flex -translate-y-px gap-1"
        style={{ left: `${x0}px`, top: `${y(o.i)}px` }}
      >
        {boxes(o.e, o.g, PANEL.neutral, `${side}-${o.nm}`)}
      </div>,
      <div
        key={`${side}-n-${o.nm}`}
        className="absolute -translate-y-1/2 whitespace-nowrap text-[10.5px]"
        style={{ left: `${x0}px`, top: `${y(o.i) + 10}px`, color: PANEL.recessive }}
      >
        {o.nm}
      </div>,
    ]);

  return (
    <div className="overflow-x-auto">
      <div
        className="relative font-mono text-[11px]"
        style={{ height: `${H}px`, width: "278px" }}
        role="img"
        aria-label={`Valence molecular orbital diagram for ${info.formula}: ${d.levels
          .map((l) => `${l.name} holding ${l.e} electron${l.e === 1 ? "" : "s"}`)
          .join(", ")}. Bond order ${info.bo}${
          info.unpaired ? `, ${info.unpaired} unpaired electrons` : ", all electrons paired"
        }.`}
      >
        {[
          { left: 0, text: A.sym, k: "hA" },
          { left: 98, text: info.formula, k: "hM" },
          { left: 214, text: B.sym, k: "hB" },
        ].map((h) => (
          <div
            key={h.k}
            className="absolute top-0 w-16 text-center text-[11px]"
            style={{ left: `${h.left}px`, color: PANEL.recessive }}
          >
            {h.text}
          </div>
        ))}

        {aoColumn(A, 0, "ao-a")}

        {d.levels.map((l, i) => {
          const w = l.g * 18 + (l.g - 1) * 4;
          const x0 = 130 - w / 2;
          return (
            <div key={l.name}>
              <div
                className="absolute flex -translate-y-px gap-1"
                style={{ left: `${x0}px`, top: `${y(i)}px` }}
              >
                {boxes(l.e, l.g, col(l), `mo-${l.name}`)}
              </div>
              <div
                className="absolute -translate-y-1/2 whitespace-nowrap text-[10.5px]"
                style={{ left: `${x0 + w + 6}px`, top: `${y(i)}px`, color: col(l) }}
              >
                {l.name}
              </div>
            </div>
          );
        })}

        {aoColumn(B, 214, "ao-b")}
      </div>
    </div>
  );
}
