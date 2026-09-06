import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { rotate3d, rotateAroundAxis, vAdd, vScale, vNormalize, type Vec3 } from "@/lib/project3d";
import { AxisGizmo } from "@/components/AxisGizmo";

// Four organic mechanisms, one shared geometric language: every scene is
// built from real tetrahedral (109.47 deg) and trigonal-planar (120 deg)
// bond angles, not stylized art. SN1 and E1 share an identical first
// stage (ionization to a planar carbocation with an empty p orbital);
// SN2 and E2 are both single concerted steps with a strict geometric
// requirement (backside attack / anti-periplanar elimination) that fails
// outside a narrow angular window, which the angle sliders let you find.
type Mode = "SN2" | "SN1" | "E1" | "E2";

const DEG = Math.PI / 180;
const TETRA_FROM_AXIS = 70.5288; // deg between a tetrahedral bond and the "opposite" axis
const LCC = 56; // C-C bond
const LCH = 32; // C-H bond
const LC_LG_START = 42; // C-leaving-group bond, before it starts breaking
const LC_LG_GONE = 150; // leaving group's final distance once fully departed
const FAR = 190; // incoming nucleophile/base starting distance

function nlerp(a: Vec3, b: Vec3, t: number): Vec3 {
  const c = Math.max(0, Math.min(1, t));
  return vNormalize([a[0] + (b[0] - a[0]) * c, a[1] + (b[1] - a[1]) * c, a[2] + (b[2] - a[2]) * c]);
}
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
function ringDir(zSign: 1 | -1, azimuthDeg: number): Vec3 {
  const theta = TETRA_FROM_AXIS * DEG;
  const phi = azimuthDeg * DEG;
  return [
    Math.sin(theta) * Math.cos(phi),
    Math.sin(theta) * Math.sin(phi),
    zSign * Math.cos(theta),
  ];
}
function smoothstep(x: number): number {
  const c = Math.max(0, Math.min(1, x));
  return c * c * (3 - 2 * c);
}

type Atom = { key: string; pos: Vec3; color: string; r: number; label?: string };
type Bond = {
  from: Vec3;
  to: Vec3;
  color: string;
  width: number;
  opacity: number;
  dashed?: boolean;
};
type PiLobePair = { center: Vec3; axis: Vec3; length: number; width: number; opacity: number };

type Scene = { atoms: Atom[]; bonds: Bond[]; piLobes: PiLobePair[]; caption: string };

const COLOR = {
  c: "rgba(15, 23, 42, 0.92)",
  h: "rgba(148, 163, 184, 0.9)",
  lg: "rgba(234, 179, 8, 0.92)",
  nu: "rgba(14, 165, 233, 0.92)",
  emptyP: "rgba(148, 163, 184, 0.35)",
  pi: "rgba(168, 85, 247, 0.45)",
};

// Stage shared by SN1 and E1: Cα (bonded to LG + 3 other groups) ionizes.
// LG departs along its own tetrahedral direction; the other 3 groups swing
// from their staggered tetrahedral positions (angled away from LG) into a
// flat, 120-degree trigonal-planar arrangement, and an empty 2p orbital
// (the lobes an incoming nucleophile or a beta C-H bond must line up with)
// opens up along the axis LG just vacated.
function ionize(t: number, thirdGroupLabel: "R" | "Cb") {
  // The true tetrahedron with LG at the apex (0,0,1): the other three
  // substituents sit 109.47 deg from it, spaced 120 deg apart azimuthally.
  const apex: Vec3 = [0, 0, 1];
  const base = (az: number): Vec3 => [
    Math.sin(109.4712 * DEG) * Math.cos(az * DEG),
    Math.sin(109.4712 * DEG) * Math.sin(az * DEG),
    Math.cos(109.4712 * DEG),
  ];
  const dThird = base(0); // becomes R (SN1/SN2) or Cb (E1/E2)'s partner
  const dHa = base(120);
  const dHb = base(240);

  const flatten = (d: Vec3, az: number): Vec3 => {
    const planar: Vec3 = [Math.cos(az * DEG), Math.sin(az * DEG), 0];
    return nlerp(d, planar, smoothstep(t));
  };
  const thirdPlanar = flatten(dThird, 0);
  const haPlanar = flatten(dHa, 120);
  const hbPlanar = flatten(dHb, 240);

  const lgDist = LC_LG_START + (LC_LG_GONE - LC_LG_START) * smoothstep(t);
  const lgPos: Vec3 = vScale(apex, lgDist);
  const thirdPos = vScale(thirdPlanar, thirdGroupLabel === "Cb" ? LCC : LCH * 1.3);
  const haPos = vScale(haPlanar, LCH);
  const hbPos = vScale(hbPlanar, LCH);
  const emptyPOpacity = smoothstep(t);

  return { lgPos, thirdPos, haPos, hbPos, thirdDirFinal: thirdPlanar, emptyPOpacity, apex };
}

function computeSN2Scene(t: number, angleOffsetDeg: number, outcome: "reacted" | "blocked"): Scene {
  const apex: Vec3 = [0, 0, 1];
  const base = (az: number): Vec3 => [
    Math.sin(109.4712 * DEG) * Math.cos(az * DEG),
    Math.sin(109.4712 * DEG) * Math.sin(az * DEG),
    Math.cos(109.4712 * DEG),
  ];
  const dR = base(0);
  const dHa = base(120);
  const dHb = base(240);

  if (outcome === "blocked") {
    const dir: Vec3 = rotateAroundAxis([0, 0, -1], [1, 0, 0], -angleOffsetDeg * DEG);
    const closest = 95;
    const p =
      t < 0.5
        ? FAR - (FAR - closest) * smoothstep(t / 0.5)
        : closest + (FAR - closest) * smoothstep((t - 0.5) / 0.5);
    return {
      atoms: [
        { key: "C", pos: [0, 0, 0], color: COLOR.c, r: 11 },
        { key: "LG", pos: vScale(apex, LC_LG_START), color: COLOR.lg, r: 9, label: "LG" },
        { key: "R", pos: vScale(dR, LCH * 1.3), color: COLOR.h, r: 7, label: "R" },
        { key: "Ha", pos: vScale(dHa, LCH), color: COLOR.h, r: 6 },
        { key: "Hb", pos: vScale(dHb, LCH), color: COLOR.h, r: 6 },
        { key: "Nu", pos: vScale(dir, p), color: COLOR.nu, r: 9, label: "Nu" },
      ],
      bonds: [
        { from: [0, 0, 0], to: vScale(apex, LC_LG_START), color: COLOR.lg, width: 3, opacity: 1 },
        { from: [0, 0, 0], to: vScale(dR, LCH * 1.3), color: COLOR.h, width: 2, opacity: 1 },
        { from: [0, 0, 0], to: vScale(dHa, LCH), color: COLOR.h, width: 2, opacity: 1 },
        { from: [0, 0, 0], to: vScale(dHb, LCH), color: COLOR.h, width: 2, opacity: 1 },
      ],
      piLobes: [],
      caption:
        t < 0.5
          ? "Nucleophile approaches off the LG–C axis..."
          : "Blocked by the other substituents — SN2 only works from directly opposite the leaving group.",
    };
  }

  // Umbrella inversion: the 3 retained groups swing from pointing away
  // from LG (109.5 deg off the LG axis) through planar at the transition
  // state to pointing away from the new Nu bond — a mirror-image flip.
  const theta = lerp(109.4712, 70.5288, t) * DEG;
  const swap = (d: Vec3): Vec3 => {
    const az = Math.atan2(d[1], d[0]) / DEG;
    return [
      Math.sin(theta) * Math.cos(az * DEG),
      Math.sin(theta) * Math.sin(az * DEG),
      Math.cos(theta),
    ];
  };
  const rNow = swap(dR);
  const haNow = swap(dHa);
  const hbNow = swap(dHb);
  const lgDist =
    t < 0.5 ? LC_LG_START : LC_LG_START + (LC_LG_GONE - LC_LG_START) * smoothstep((t - 0.5) / 0.5);
  const nuDist = t < 0.5 ? FAR - (FAR - LC_LG_START) * smoothstep(t / 0.5) : LC_LG_START;
  const bondNu = Math.max(0, Math.min(1, 1 - (nuDist - LC_LG_START) / (FAR - LC_LG_START)));
  const bondLg = Math.max(0, Math.min(1, 1 - (lgDist - LC_LG_START) / (LC_LG_GONE - LC_LG_START)));

  return {
    atoms: [
      { key: "C", pos: [0, 0, 0], color: COLOR.c, r: 11 },
      { key: "LG", pos: vScale(apex, lgDist), color: COLOR.lg, r: 9, label: "LG" },
      { key: "Nu", pos: vScale(apex, -nuDist), color: COLOR.nu, r: 9, label: "Nu" },
      { key: "R", pos: vScale(rNow, LCH * 1.3), color: COLOR.h, r: 7, label: "R" },
      { key: "Ha", pos: vScale(haNow, LCH), color: COLOR.h, r: 6 },
      { key: "Hb", pos: vScale(hbNow, LCH), color: COLOR.h, r: 6 },
    ],
    bonds: [
      { from: [0, 0, 0], to: vScale(apex, lgDist), color: COLOR.lg, width: 3, opacity: bondLg },
      { from: [0, 0, 0], to: vScale(apex, -nuDist), color: COLOR.nu, width: 3, opacity: bondNu },
      { from: [0, 0, 0], to: vScale(rNow, LCH * 1.3), color: COLOR.h, width: 2, opacity: 1 },
      { from: [0, 0, 0], to: vScale(haNow, LCH), color: COLOR.h, width: 2, opacity: 1 },
      { from: [0, 0, 0], to: vScale(hbNow, LCH), color: COLOR.h, width: 2, opacity: 1 },
    ],
    piLobes: [],
    caption:
      t < 0.35
        ? "Nucleophile lines up directly opposite the leaving group — the only angle that works."
        : t < 0.65
          ? "Transition state: C–LG is breaking as C–Nu forms, both partial bonds at once."
          : "LG leaves. The other three groups have flipped through like an umbrella — configuration inverted.",
  };
}

function computeSN1Scene(t: number, face: 1 | -1): Scene {
  const ION_END = 0.5;
  const tIon = Math.min(1, t / ION_END);
  const { lgPos, thirdPos, haPos, hbPos, thirdDirFinal, emptyPOpacity, apex } = ionize(tIon, "R");

  if (t <= ION_END) {
    return {
      atoms: [
        { key: "C", pos: [0, 0, 0], color: COLOR.c, r: 11 },
        { key: "LG", pos: lgPos, color: COLOR.lg, r: 9, label: "LG" },
        { key: "R", pos: thirdPos, color: COLOR.h, r: 7, label: "R" },
        { key: "Ha", pos: haPos, color: COLOR.h, r: 6 },
        { key: "Hb", pos: hbPos, color: COLOR.h, r: 6 },
      ],
      bonds: [
        {
          from: [0, 0, 0],
          to: lgPos,
          color: COLOR.lg,
          width: 3,
          opacity: Math.max(0, 1 - tIon * 1.4),
        },
        { from: [0, 0, 0], to: thirdPos, color: COLOR.h, width: 2, opacity: 1 },
        { from: [0, 0, 0], to: haPos, color: COLOR.h, width: 2, opacity: 1 },
        { from: [0, 0, 0], to: hbPos, color: COLOR.h, width: 2, opacity: 1 },
      ],
      piLobes: [
        { center: [0, 0, 0], axis: apex, length: 30, width: 11, opacity: emptyPOpacity * 0.7 },
      ],
      caption:
        tIon < 0.5
          ? "Leaving group ionizes off on its own, before any nucleophile gets involved..."
          : "A flat carbocation forms — three groups now trigonal-planar, with an empty p orbital straddling the plane on both faces.",
    };
  }

  const tAtk = (t - ION_END) / (1 - ION_END);
  const nuDist = FAR - (FAR - LCH * 1.3) * smoothstep(tAtk);
  const nuPos = vScale(apex, face * nuDist);
  const pyramidT = smoothstep(tAtk);
  const finalThird: Vec3 = nlerp(
    thirdDirFinal,
    [thirdDirFinal[0] * 0.94, thirdDirFinal[1] * 0.94, -face / 3],
    pyramidT,
  );
  const finalHa: Vec3 = nlerp(
    [Math.cos(120 * DEG), Math.sin(120 * DEG), 0],
    [Math.cos(120 * DEG) * 0.94, Math.sin(120 * DEG) * 0.94, -face / 3],
    pyramidT,
  );
  const finalHb: Vec3 = nlerp(
    [Math.cos(240 * DEG), Math.sin(240 * DEG), 0],
    [Math.cos(240 * DEG) * 0.94, Math.sin(240 * DEG) * 0.94, -face / 3],
    pyramidT,
  );
  const bondNu = smoothstep(tAtk);

  return {
    atoms: [
      { key: "C", pos: [0, 0, 0], color: COLOR.c, r: 11 },
      { key: "Nu", pos: nuPos, color: COLOR.nu, r: 9, label: "Nu" },
      { key: "R", pos: vScale(finalThird, LCH * 1.3), color: COLOR.h, r: 7, label: "R" },
      { key: "Ha", pos: vScale(finalHa, LCH), color: COLOR.h, r: 6 },
      { key: "Hb", pos: vScale(finalHb, LCH), color: COLOR.h, r: 6 },
    ],
    bonds: [
      { from: [0, 0, 0], to: nuPos, color: COLOR.nu, width: 3, opacity: bondNu },
      { from: [0, 0, 0], to: vScale(finalThird, LCH * 1.3), color: COLOR.h, width: 2, opacity: 1 },
      { from: [0, 0, 0], to: vScale(finalHa, LCH), color: COLOR.h, width: 2, opacity: 1 },
      { from: [0, 0, 0], to: vScale(finalHb, LCH), color: COLOR.h, width: 2, opacity: 1 },
    ],
    piLobes: [
      { center: [0, 0, 0], axis: apex, length: 30, width: 11, opacity: (1 - bondNu) * 0.7 },
    ],
    caption:
      tAtk < 0.5
        ? `Nucleophile drifts in toward the ${face === 1 ? "front" : "back"} face of the flat carbocation — either face works equally well.`
        : "Bond forms and the carbon re-pyramidalizes. Attack from the other face would give the mirror-image product — that's why SN1 racemizes a stereocenter.",
  };
}

function computeE1Scene(t: number): Scene {
  const ION_END = 0.5;
  const tIon = Math.min(1, t / ION_END);
  const { lgPos, thirdPos, haPos, hbPos, emptyPOpacity, apex } = ionize(tIon, "Cb");
  const cbDir = vNormalize(thirdPos);

  // Cb's own 3 hydrogens, tetrahedral about the Ca-Cb bond. One of them
  // (whichever ends up best-aligned with Ca's empty p orbital, found by
  // projecting onto that axis) is the beta-hydrogen a base can actually
  // remove -- only a C-H bond that overlaps the empty orbital can donate
  // into it.
  const cbBase = (az: number): Vec3 =>
    rotateAroundAxis(rotateAroundAxis([0, 0, -1], [1, 0, 0], 109.4712 * DEG), cbDir, az * DEG);
  // Anchor the tetrahedral construction so one Cb-H leans toward +apex.
  const alignAxis = vNormalize([cbDir[1], -cbDir[0], 0]) as Vec3;
  const tilted: Vec3 = rotateAroundAxis(vScale(cbDir, -1), alignAxis, 109.4712 * DEG);
  const hSet = [0, 120, 240].map((az) => rotateAroundAxis(tilted, cbDir, az * DEG));
  let bestIdx = 0;
  let bestDot = -Infinity;
  hSet.forEach((h, i) => {
    const d = h[0] * apex[0] + h[1] * apex[1] + h[2] * apex[2];
    if (d > bestDot) {
      bestDot = d;
      bestIdx = i;
    }
  });
  const keptDirs = hSet.filter((_, i) => i !== bestIdx);
  const leavingDir = hSet[bestIdx]!;

  const cbPos = thirdPos;
  const hKept1Pos = vAdd(cbPos, vScale(keptDirs[0]!, LCH));
  const hKept2Pos = vAdd(cbPos, vScale(keptDirs[1]!, LCH));

  if (t <= ION_END) {
    const hLeavingPos = vAdd(cbPos, vScale(leavingDir, LCH));
    return {
      atoms: [
        { key: "Ca", pos: [0, 0, 0], color: COLOR.c, r: 11, label: "Cα" },
        { key: "Cb", pos: cbPos, color: COLOR.c, r: 11, label: "Cβ" },
        { key: "LG", pos: lgPos, color: COLOR.lg, r: 9, label: "LG" },
        { key: "Ha", pos: haPos, color: COLOR.h, r: 6 },
        { key: "Hb", pos: hbPos, color: COLOR.h, r: 6 },
        { key: "Hbeta", pos: hLeavingPos, color: "rgba(168, 85, 247, 0.85)", r: 6.5, label: "Hβ" },
        { key: "Hk1", pos: hKept1Pos, color: COLOR.h, r: 6 },
        { key: "Hk2", pos: hKept2Pos, color: COLOR.h, r: 6 },
      ],
      bonds: [
        {
          from: [0, 0, 0],
          to: lgPos,
          color: COLOR.lg,
          width: 3,
          opacity: Math.max(0, 1 - tIon * 1.4),
        },
        { from: [0, 0, 0], to: cbPos, color: COLOR.c, width: 3, opacity: 1 },
        { from: [0, 0, 0], to: haPos, color: COLOR.h, width: 2, opacity: 1 },
        { from: [0, 0, 0], to: hbPos, color: COLOR.h, width: 2, opacity: 1 },
        { from: cbPos, to: hLeavingPos, color: "rgba(168, 85, 247, 0.85)", width: 2, opacity: 1 },
        { from: cbPos, to: hKept1Pos, color: COLOR.h, width: 2, opacity: 1 },
        { from: cbPos, to: hKept2Pos, color: COLOR.h, width: 2, opacity: 1 },
      ],
      piLobes: [
        { center: [0, 0, 0], axis: apex, length: 30, width: 11, opacity: emptyPOpacity * 0.7 },
      ],
      caption:
        tIon < 0.5
          ? "Same first step as SN1: the leaving group ionizes away, unassisted."
          : "Carbocation forms. One β-hydrogen on the neighboring carbon (violet) already overlaps the empty p orbital — that's the one a base can pull off.",
    };
  }

  const tE = (t - ION_END) / (1 - ION_END);
  const baseDist = FAR - (FAR - LCH) * smoothstep(tE);
  const basePos = vAdd(cbPos, vScale(leavingDir, baseDist));
  const hLeavingNow = vAdd(cbPos, vScale(leavingDir, LCH * (1 - 0.3 * smoothstep(tE))));
  const piGrow = smoothstep(tE);

  const haFinal = nlerp(vNormalize(haPos), [Math.cos(120 * DEG), Math.sin(120 * DEG), 0], piGrow);
  const hbFinal = nlerp(vNormalize(hbPos), [Math.cos(240 * DEG), Math.sin(240 * DEG), 0], piGrow);
  const cbAxisFinal = vNormalize(cbPos);
  const k1Final = nlerp(
    keptDirs[0]!,
    rotateAroundAxis(vScale(cbAxisFinal, -1), apex, 120 * DEG),
    piGrow,
  );
  const k2Final = nlerp(
    keptDirs[1]!,
    rotateAroundAxis(vScale(cbAxisFinal, -1), apex, -120 * DEG),
    piGrow,
  );

  return {
    atoms: [
      { key: "Ca", pos: [0, 0, 0], color: COLOR.c, r: 11, label: "Cα" },
      { key: "Cb", pos: cbPos, color: COLOR.c, r: 11, label: "Cβ" },
      { key: "Base", pos: basePos, color: COLOR.nu, r: 9, label: "Base" },
      { key: "Hbeta", pos: hLeavingNow, color: "rgba(168, 85, 247, 0.85)", r: 6.5 },
      { key: "Ha", pos: vScale(haFinal, LCH), color: COLOR.h, r: 6 },
      { key: "Hb", pos: vScale(hbFinal, LCH), color: COLOR.h, r: 6 },
      { key: "Hk1", pos: vAdd(cbPos, vScale(k1Final, LCH)), color: COLOR.h, r: 6 },
      { key: "Hk2", pos: vAdd(cbPos, vScale(k2Final, LCH)), color: COLOR.h, r: 6 },
    ],
    bonds: [
      { from: [0, 0, 0], to: cbPos, color: COLOR.c, width: piGrow > 0.05 ? 5 : 3, opacity: 1 },
      { from: [0, 0, 0], to: vScale(haFinal, LCH), color: COLOR.h, width: 2, opacity: 1 },
      { from: [0, 0, 0], to: vScale(hbFinal, LCH), color: COLOR.h, width: 2, opacity: 1 },
      { from: cbPos, to: vAdd(cbPos, vScale(k1Final, LCH)), color: COLOR.h, width: 2, opacity: 1 },
      { from: cbPos, to: vAdd(cbPos, vScale(k2Final, LCH)), color: COLOR.h, width: 2, opacity: 1 },
      {
        from: basePos,
        to: hLeavingNow,
        color: COLOR.nu,
        width: 2,
        opacity: smoothstep(tE),
        dashed: tE < 0.9,
      },
      {
        from: cbPos,
        to: hLeavingNow,
        color: "rgba(168, 85, 247, 0.85)",
        width: 2,
        opacity: 1 - piGrow,
      },
    ],
    piLobes: [
      {
        center: vScale(vAdd([0, 0, 0], cbPos), 0.5),
        axis: apex,
        length: 22 + 12 * piGrow,
        width: 9 + 4 * piGrow,
        opacity: piGrow * 0.55,
      },
    ],
    caption:
      tE < 0.6
        ? "Base pulls that β-hydrogen away; its electrons flow into a new π bond as it leaves."
        : "Alkene formed — both carbons now trigonal-planar, sharing the π bond shown above and below the plane.",
  };
}

function computeE2Scene(
  t: number,
  dihedralOffsetDeg: number,
  outcome: "reacted" | "blocked",
): Scene {
  const Ca: Vec3 = [0, 0, 0];
  const Cb: Vec3 = [0, 0, LCC];
  const front = (az: number) => vScale(ringDir(-1, az), 1);
  const back = (az: number) => vScale(ringDir(1, az), 1);
  const dLG = front(0);
  const dHa = front(120);
  const dHb = front(240);
  const dAnti = back(180 + dihedralOffsetDeg);
  const dG1 = back(60);
  const dG2 = back(300);

  if (outcome === "blocked") {
    const baseDist = FAR - (FAR - LCH) * smoothstep(t < 0.6 ? t / 0.6 : 1);
    const recede = t > 0.6 ? FAR - (FAR - LCH) * smoothstep(1 - (t - 0.6) / 0.4) : baseDist;
    const basePos = vAdd(Cb, vScale(dAnti, recede));
    return {
      atoms: [
        { key: "Ca", pos: Ca, color: COLOR.c, r: 11, label: "Cα" },
        { key: "Cb", pos: Cb, color: COLOR.c, r: 11, label: "Cβ" },
        { key: "LG", pos: vAdd(Ca, vScale(dLG, LC_LG_START)), color: COLOR.lg, r: 9, label: "LG" },
        { key: "Ha", pos: vAdd(Ca, vScale(dHa, LCH)), color: COLOR.h, r: 6 },
        { key: "Hb", pos: vAdd(Ca, vScale(dHb, LCH)), color: COLOR.h, r: 6 },
        {
          key: "Hanti",
          pos: vAdd(Cb, vScale(dAnti, LCH)),
          color: "rgba(168, 85, 247, 0.85)",
          r: 6.5,
        },
        { key: "Hg1", pos: vAdd(Cb, vScale(dG1, LCH)), color: COLOR.h, r: 6 },
        { key: "Hg2", pos: vAdd(Cb, vScale(dG2, LCH)), color: COLOR.h, r: 6 },
        { key: "Base", pos: basePos, color: COLOR.nu, r: 9, label: "Base" },
      ],
      bonds: [
        { from: Ca, to: Cb, color: COLOR.c, width: 3, opacity: 1 },
        { from: Ca, to: vAdd(Ca, vScale(dLG, LC_LG_START)), color: COLOR.lg, width: 3, opacity: 1 },
        { from: Ca, to: vAdd(Ca, vScale(dHa, LCH)), color: COLOR.h, width: 2, opacity: 1 },
        { from: Ca, to: vAdd(Ca, vScale(dHb, LCH)), color: COLOR.h, width: 2, opacity: 1 },
        {
          from: Cb,
          to: vAdd(Cb, vScale(dAnti, LCH)),
          color: "rgba(168, 85, 247, 0.85)",
          width: 2,
          opacity: 1,
        },
        { from: Cb, to: vAdd(Cb, vScale(dG1, LCH)), color: COLOR.h, width: 2, opacity: 1 },
        { from: Cb, to: vAdd(Cb, vScale(dG2, LCH)), color: COLOR.h, width: 2, opacity: 1 },
      ],
      piLobes: [],
      caption:
        t < 0.6
          ? `Base approaches a β-hydrogen ${dihedralOffsetDeg.toFixed(0)}° off anti-periplanar...`
          : "Wrong geometry — that C–H bond isn't lined up with the C–LG bond, so no continuous orbital path exists to form the π bond. Base backs off.",
    };
  }

  const p = smoothstep(t);
  const lgDist = LC_LG_START + (LC_LG_GONE - LC_LG_START) * p;
  const baseDist = FAR - (FAR - LCH) * p;
  const lgPos = vAdd(Ca, vScale(dLG, lgDist));
  const basePos = vAdd(Cb, vScale(dAnti, baseDist));
  const hAntiPos = vAdd(Cb, vScale(dAnti, LCH * (1 - 0.25 * p)));

  const haFinalLocal: Vec3 = [Math.sin(120 * DEG), 0, -Math.cos(120 * DEG)];
  const hbFinalLocal: Vec3 = [-Math.sin(120 * DEG), 0, -Math.cos(120 * DEG)];
  const g1FinalLocal: Vec3 = [Math.sin(120 * DEG), 0, Math.cos(120 * DEG)];
  const g2FinalLocal: Vec3 = [-Math.sin(120 * DEG), 0, Math.cos(120 * DEG)];
  const haNow = nlerp(dHa, haFinalLocal, p);
  const hbNow = nlerp(dHb, hbFinalLocal, p);
  const g1Now = nlerp(dG1, g1FinalLocal, p);
  const g2Now = nlerp(dG2, g2FinalLocal, p);

  return {
    atoms: [
      { key: "Ca", pos: Ca, color: COLOR.c, r: 11, label: "Cα" },
      { key: "Cb", pos: Cb, color: COLOR.c, r: 11, label: "Cβ" },
      { key: "LG", pos: lgPos, color: COLOR.lg, r: 9, label: "LG" },
      { key: "Ha", pos: vAdd(Ca, vScale(haNow, LCH)), color: COLOR.h, r: 6 },
      { key: "Hb", pos: vAdd(Ca, vScale(hbNow, LCH)), color: COLOR.h, r: 6 },
      { key: "Hg1", pos: vAdd(Cb, vScale(g1Now, LCH)), color: COLOR.h, r: 6 },
      { key: "Hg2", pos: vAdd(Cb, vScale(g2Now, LCH)), color: COLOR.h, r: 6 },
      { key: "Base", pos: basePos, color: COLOR.nu, r: 9, label: "Base" },
      { key: "Hanti", pos: hAntiPos, color: "rgba(168, 85, 247, 0.85)", r: 6.5 },
    ],
    bonds: [
      { from: Ca, to: Cb, color: COLOR.c, width: 3 + 2 * p, opacity: 1 },
      { from: Ca, to: lgPos, color: COLOR.lg, width: 3, opacity: Math.max(0, 1 - p * 1.3) },
      { from: Ca, to: vAdd(Ca, vScale(haNow, LCH)), color: COLOR.h, width: 2, opacity: 1 },
      { from: Ca, to: vAdd(Ca, vScale(hbNow, LCH)), color: COLOR.h, width: 2, opacity: 1 },
      { from: Cb, to: vAdd(Cb, vScale(g1Now, LCH)), color: COLOR.h, width: 2, opacity: 1 },
      { from: Cb, to: vAdd(Cb, vScale(g2Now, LCH)), color: COLOR.h, width: 2, opacity: 1 },
      { from: Cb, to: hAntiPos, color: "rgba(168, 85, 247, 0.85)", width: 2, opacity: 1 - p },
      { from: basePos, to: hAntiPos, color: COLOR.nu, width: 2, opacity: p, dashed: p < 0.9 },
    ],
    piLobes: [
      {
        center: vScale(vAdd(Ca, Cb), 0.5),
        axis: [1, 0, 0],
        length: 22 + 12 * p,
        width: 9 + 4 * p,
        opacity: p * 0.55,
      },
    ],
    caption:
      t < 0.5
        ? "Base lines up with the anti-periplanar β-hydrogen — 180° from the leaving group, viewed down the C–C bond."
        : "One concerted step: C–H breaks, the π bond forms, and LG leaves — all at once, no intermediate.",
  };
}

const CENTER = 175;
const FOCAL = 760;

export function MechanismExplorer3D() {
  const [mode, setMode] = useState<Mode>("SN2");
  const [angleOffset, setAngleOffset] = useState(0);
  const [dihedralOffset, setDihedralOffset] = useState(0);
  const [face, setFace] = useState<1 | -1>(1);
  const [yaw, setYaw] = useState(0.55);
  const [pitch, setPitch] = useState(0.25);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const startRef = useRef<number | null>(null);

  const play = () => {
    if (mode === "SN1") setFace(Math.random() < 0.5 ? 1 : -1);
    startRef.current = null;
    setT(0);
    setPlaying(true);
  };

  useEffect(() => {
    play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const DURATION = mode === "SN2" || mode === "E2" ? 3600 : 5200;
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const next = Math.min(1, (now - startRef.current) / DURATION);
      setT(next);
      if (next < 1) raf = requestAnimationFrame(tick);
      else setPlaying(false);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, mode]);

  const scene = useMemo<Scene>(() => {
    if (mode === "SN2")
      return computeSN2Scene(t, angleOffset, angleOffset > 35 ? "blocked" : "reacted");
    if (mode === "SN1") return computeSN1Scene(t, face);
    if (mode === "E1") return computeE1Scene(t);
    return computeE2Scene(t, dihedralOffset, Math.abs(dihedralOffset) > 40 ? "blocked" : "reacted");
  }, [mode, t, angleOffset, dihedralOffset, face]);

  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    dragRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    dragRef.current = { x: e.clientX, y: e.clientY };
    setYaw((y) => y + dx * 0.01);
    setPitch((p) => Math.max(-1.3, Math.min(1.3, p - dy * 0.01)));
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const project = (pos: Vec3) => {
    const [x1, y1, z2] = rotate3d(pos, yaw, pitch);
    const s = FOCAL / (FOCAL - z2);
    return { x: CENTER + x1 * s, y: CENTER + y1 * s, z: z2, s };
  };

  const projectedAtoms = scene.atoms.map((a) => ({ ...a, proj: project(a.pos) }));
  const zOf = (p: Vec3) => rotate3d(p, yaw, pitch)[2];
  const drawOrder = [
    ...scene.bonds.map((b) => ({
      kind: "bond" as const,
      z: (zOf(b.from) + zOf(b.to)) / 2,
      data: b,
    })),
    ...projectedAtoms.map((a) => ({ kind: "atom" as const, z: a.proj.z, data: a })),
    ...scene.piLobes.map((l) => ({ kind: "pi" as const, z: zOf(l.center), data: l })),
  ].sort((a, b) => a.z - b.z);

  const MODE_INFO: Record<Mode, { name: string; concept: string }> = {
    SN2: {
      name: "SN2 — bimolecular substitution",
      concept:
        "One concerted step: the nucleophile attacks directly opposite the leaving group, so bonding on one side forces the other three groups through like an umbrella — configuration inverts every time.",
    },
    SN1: {
      name: "SN1 — unimolecular substitution",
      concept:
        "The leaving group ionizes off first, giving a flat carbocation that a nucleophile can then attack from either face with equal probability — a racemic mixture, not a single inverted product.",
    },
    E1: {
      name: "E1 — unimolecular elimination",
      concept:
        "Same ionization as SN1, but instead of a nucleophile attacking the empty orbital, a base removes a neighboring β-hydrogen that's aligned with it, and those electrons become the new π bond.",
    },
    E2: {
      name: "E2 — bimolecular elimination",
      concept:
        "One concerted step, but only for a β-hydrogen that's anti-periplanar (180°) to the leaving group — that alignment is what lets the departing electrons become a continuous π bond instead of nothing.",
    },
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <div className="flex flex-wrap gap-2">
          {(["SN2", "SN1", "E1", "E2"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-full border px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest transition-colors ${
                mode === m
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border hover:bg-secondary"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <svg
            viewBox="0 0 350 350"
            className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            {drawOrder.map((item, i) => {
              if (item.kind === "bond") {
                const b = item.data;
                const p1 = project(b.from);
                const p2 = project(b.to);
                return (
                  <line
                    key={i}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={b.color}
                    strokeWidth={b.width}
                    strokeOpacity={b.opacity}
                    strokeDasharray={b.dashed ? "4 4" : undefined}
                  />
                );
              }
              if (item.kind === "pi") {
                const l = item.data;
                const c = project(l.center);
                const tip1 = project(vAdd(l.center, vScale(vNormalize(l.axis), l.length / 60)));
                const tip2 = project(vAdd(l.center, vScale(vNormalize(l.axis), -l.length / 60)));
                const dx1 = tip1.x - c.x;
                const dy1 = tip1.y - c.y;
                const len1 = Math.hypot(dx1, dy1) || 1;
                const dx2 = tip2.x - c.x;
                const dy2 = tip2.y - c.y;
                const len2 = Math.hypot(dx2, dy2) || 1;
                return (
                  <g key={i} opacity={l.opacity}>
                    <ellipse
                      cx={c.x + (dx1 / len1) * l.length * 0.5}
                      cy={c.y - 26 + (dy1 / len1) * l.length * 0.1}
                      rx={l.length * 0.5}
                      ry={l.width}
                      fill={COLOR.pi}
                    />
                    <ellipse
                      cx={c.x + (dx2 / len2) * l.length * 0.5}
                      cy={c.y + 26 + (dy2 / len2) * l.length * 0.1}
                      rx={l.length * 0.5}
                      ry={l.width}
                      fill={COLOR.pi}
                    />
                  </g>
                );
              }
              const a = item.data;
              return (
                <g key={i}>
                  <circle cx={a.proj.x} cy={a.proj.y} r={a.r * a.proj.s} fill={a.color} />
                  {a.label && (
                    <text
                      x={a.proj.x}
                      y={a.proj.y - a.r * a.proj.s - 4}
                      textAnchor="middle"
                      fontSize="9"
                      fontFamily="monospace"
                      fill="var(--muted-foreground)"
                    >
                      {a.label}
                    </text>
                  )}
                </g>
              );
            })}
            <AxisGizmo yaw={yaw} pitch={pitch} cx={45} cy={45} radius={24} />
          </svg>
          <p className="pointer-events-none absolute bottom-3 left-3 right-3 font-mono text-xs text-muted-foreground">
            {scene.caption}
          </p>
          <p className="pointer-events-none absolute right-3 top-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Drag to rotate
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "rgb(15, 23, 42)" }} />
            Carbon
          </span>
          <span className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: "rgb(148, 163, 184)" }}
            />
            Hydrogen
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "rgb(234, 179, 8)" }} />
            Leaving group
          </span>
          <span className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: "rgb(14, 165, 233)" }}
            />
            Nucleophile / base
          </span>
          <span className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: "rgb(168, 85, 247)" }}
            />
            Reactive β-H / π bond
          </span>
        </div>
      </div>

      <aside className="space-y-6 lg:col-span-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-6 font-mono text-xs font-bold uppercase tracking-widest">
            {MODE_INFO[mode].name}
          </h3>
          <div className="space-y-8">
            {mode === "SN2" && (
              <div>
                <div className="mb-3 flex justify-between text-xs font-medium">
                  <span>Attack angle off backside</span>
                  <span className="font-mono text-accent">{angleOffset}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={90}
                  value={angleOffset}
                  aria-label="Attack angle off backside"
                  onChange={(e) => setAngleOffset(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-[var(--accent)]"
                />
                <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                  Past ~35°, the other substituents block the approach entirely.
                </p>
              </div>
            )}
            {mode === "E2" && (
              <div>
                <div className="mb-3 flex justify-between text-xs font-medium">
                  <span>Dihedral offset from anti (180°)</span>
                  <span className="font-mono text-accent">{dihedralOffset}°</span>
                </div>
                <input
                  type="range"
                  min={-90}
                  max={90}
                  value={dihedralOffset}
                  aria-label="Dihedral offset from anti"
                  onChange={(e) => setDihedralOffset(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-[var(--accent)]"
                />
                <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                  Past ~40° off anti, the C–H and C–LG bonds no longer share a plane with the
                  forming π system.
                </p>
              </div>
            )}
            {(mode === "SN1" || mode === "E1") && (
              <p className="font-mono text-[10px] leading-relaxed text-muted-foreground">
                {mode === "SN1"
                  ? "No angle to tune here — once the carbocation forms it's flat, so both faces are open to attack. Replay to see the other face."
                  : "No angle to tune here — whichever β-hydrogen already overlaps the empty p orbital is the one that leaves."}
              </p>
            )}
            <button
              onClick={play}
              disabled={playing}
              className="w-full rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-accent disabled:opacity-50"
            >
              {playing ? "Playing…" : "Replay"}
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-primary p-6 text-primary-foreground">
          <h3 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest opacity-60">
            Quick concept
          </h3>
          <p className="mb-4 text-sm leading-relaxed">{MODE_INFO[mode].concept}</p>
          <div className="font-mono text-xs text-accent">— {mode}</div>
        </div>
      </aside>
    </div>
  );
}
