/**
 * Seawater carbonate chemistry, solved exactly rather than approximated, so
 * the ocean-acidification figure and simulation always agree with each other
 * and with the numbers quoted in the "Chemistry in the World" essay.
 *
 * Atmospheric CO2 sets [CO2(aq)] through Henry's law. Total alkalinity (TA)
 * is conserved as that CO2 reacts through CO2 + H2O ⇌ H+ + HCO3- ⇌ 2H+ +
 * CO3^2- — dissolving a neutral gas adds no net charge — so for fixed TA each
 * CO2 level pins down exactly one pH, found by bisection on the alkalinity
 * balance. Borate is included because it is the second-largest contributor to
 * seawater alkalinity; leaving it out shifts pH by a visible amount.
 *
 * Temperature- and salinity-dependent constants are the standard set used by
 * CO2SYS (total pH scale): Weiss 1974 (K0), Lueker et al. 2000 (K1, K2),
 * Dickson 1990 (KB), Millero 1995 (Kw), Weiss & Price 1980 (water vapour),
 * Mucci 1983 (calcite/aragonite Ksp), Uppström 1974 (total boron). At 25 °C,
 * S = 35 they give pK1 5.847, pK2 8.966, pKsp(aragonite) 6.188 — the
 * published reference values. With TA = 2300 µmol/kg the solver returns
 * pH 8.18 at 280 ppm and 8.03 at 430 ppm, the essay's "about 8.2 to about
 * 8.1", and a Revelle factor of 9.8 today, the essay's "around 10".
 */

const TOTAL_ALKALINITY = 2300e-6; // mol/kg — unchanged by CO2 uptake

export const PREINDUSTRIAL_PPM = 280;
export const TODAY_PPM = 430;
export const DOUBLING_PPM = 560;
export const MIN_PPM = 180;
export const MAX_PPM = 2400;

export type WaterMassId = "tropical" | "temperate" | "polar";

export const WATER_MASSES: {
  id: WaterMassId;
  label: string;
  tempC: number;
  salinity: number;
  blurb: string;
}[] = [
  {
    id: "tropical",
    label: "Tropical reef",
    tempC: 25,
    salinity: 35,
    blurb: "Warm surface water over a coral reef.",
  },
  {
    id: "temperate",
    label: "Temperate shelf",
    tempC: 15,
    salinity: 35,
    blurb: "Mid-latitude coastal water — shellfish and oyster country.",
  },
  {
    id: "polar",
    label: "Polar sea",
    tempC: 2,
    salinity: 34,
    blurb: "Southern Ocean surface water, home to shelled pteropods.",
  },
];

export type SeawaterConstants = {
  K0: number;
  K1: number;
  K2: number;
  KB: number;
  KW: number;
  vapour: number; // water vapour pressure, atm — air above the sea is humid
  kspCalcite: number;
  kspAragonite: number;
  boron: number;
  calcium: number;
};

export function seawaterConstants(tempC: number, salinity: number): SeawaterConstants {
  const T = tempC + 273.15;
  const T100 = T / 100;
  const S = salinity;
  const sqS = Math.sqrt(S);
  const lnT = Math.log(T);

  const lnK0 =
    -60.2409 +
    93.4517 / T100 +
    23.3585 * Math.log(T100) +
    S * (0.023517 - 0.023656 * T100 + 0.0047036 * T100 * T100);
  const pK1 = 3633.86 / T - 61.2172 + 9.6777 * lnT - 0.011555 * S + 0.0001152 * S * S;
  const pK2 = 471.78 / T + 25.929 - 3.16967 * lnT - 0.01781 * S + 0.0001122 * S * S;
  const lnKB =
    (-8966.9 - 2890.53 * sqS - 77.942 * S + 1.728 * S * sqS - 0.0996 * S * S) / T +
    (148.0248 + 137.1942 * sqS + 1.62142 * S) +
    (-24.4344 - 25.085 * sqS - 0.2474 * S) * lnT +
    0.053105 * sqS * T;
  const lnKW =
    148.9802 -
    13847.26 / T -
    23.6521 * lnT +
    (-5.977 + 118.67 / T + 1.0495 * lnT) * sqS -
    0.01615 * S;
  const lnVapour = 24.4543 - 67.4509 / T100 - 4.8489 * Math.log(T100) - 0.000544 * S;
  const logKspCalcite =
    -171.9065 -
    0.077993 * T +
    2839.319 / T +
    71.595 * Math.log10(T) +
    (-0.77712 + 0.0028426 * T + 178.34 / T) * sqS -
    0.07711 * S +
    0.0041249 * S * sqS;
  const logKspAragonite =
    -171.945 -
    0.077993 * T +
    2903.293 / T +
    71.595 * Math.log10(T) +
    (-0.068393 + 0.0017276 * T + 88.135 / T) * sqS -
    0.10018 * S +
    0.0059415 * S * sqS;

  return {
    K0: Math.exp(lnK0),
    K1: Math.pow(10, -pK1),
    K2: Math.pow(10, -pK2),
    KB: Math.exp(lnKB),
    KW: Math.exp(lnKW),
    vapour: Math.exp(lnVapour),
    kspCalcite: Math.pow(10, logKspCalcite),
    kspAragonite: Math.pow(10, logKspAragonite),
    boron: (4.157e-4 * S) / 35,
    calcium: (0.010283 * S) / 35,
  };
}

export type CarbonateState = {
  pH: number;
  co2aq: number; // mol/kg — CO2(aq) + H2CO3, the conventional lumped species
  hco3: number;
  co3: number;
  dic: number; // total dissolved inorganic carbon
  /** The atmospheric CO2 (ppm, dry air) this water would be in equilibrium with. */
  seawaterPpm: number;
  omegaCalcite: number;
  omegaAragonite: number;
  pK1: number;
  pK2: number;
};

function nonCarbonateAlk(h: number, c: SeawaterConstants): number {
  return (c.boron * c.KB) / (c.KB + h) + c.KW / h - h;
}

/** Bisection on pH; alkalinity rises monotonically with pH, so the root is unique. */
function bisectPH(alkAt: (h: number) => number): number {
  let lo = 4,
    hi = 10;
  for (let i = 0; i < 64; i++) {
    const mid = (lo + hi) / 2;
    if (alkAt(Math.pow(10, -mid)) < TOTAL_ALKALINITY) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function stateFrom(pH: number, co2aq: number, c: SeawaterConstants): CarbonateState {
  const h = Math.pow(10, -pH);
  const hco3 = (c.K1 * co2aq) / h;
  const co3 = (c.K1 * c.K2 * co2aq) / (h * h);
  return {
    pH,
    co2aq,
    hco3,
    co3,
    dic: co2aq + hco3 + co3,
    seawaterPpm: (co2aq / c.K0 / (1 - c.vapour)) * 1e6,
    omegaCalcite: (c.calcium * co3) / c.kspCalcite,
    omegaAragonite: (c.calcium * co3) / c.kspAragonite,
    pK1: -Math.log10(c.K1),
    pK2: -Math.log10(c.K2),
  };
}

/** Surface water fully equilibrated with an atmosphere at `ppm`. */
export function solveCarbonateSystem(ppm: number, tempC = 25, salinity = 35): CarbonateState {
  const c = seawaterConstants(tempC, salinity);
  const co2aq = c.K0 * ppm * 1e-6 * (1 - c.vapour);
  const pH = bisectPH(
    (h) => (c.K1 * co2aq) / h + (2 * c.K1 * c.K2 * co2aq) / (h * h) + nonCarbonateAlk(h, c),
  );
  return stateFrom(pH, co2aq, c);
}

/**
 * Water holding a given amount of dissolved carbon, whether or not it has
 * caught up with the air yet — what the simulation integrates while CO2 is
 * still crossing the surface.
 */
export function solveFromDIC(dic: number, c: SeawaterConstants): CarbonateState {
  const pH = bisectPH((h) => {
    const d = h * h + c.K1 * h + c.K1 * c.K2;
    return (dic * (c.K1 * h + 2 * c.K1 * c.K2)) / d + nonCarbonateAlk(h, c);
  });
  const h = Math.pow(10, -pH);
  const co2aq = (dic * h * h) / (h * h + c.K1 * h + c.K1 * c.K2);
  return stateFrom(pH, co2aq, c);
}

/**
 * Revelle factor: the % rise in seawater pCO2 per 1% rise in DIC. The larger
 * it is, the less extra carbon the water takes up for the same push from the
 * atmosphere — the essay's "buffer being spent", as a number.
 */
export function revelleFactor(ppm: number, tempC = 25, salinity = 35): number {
  const a = solveCarbonateSystem(ppm, tempC, salinity);
  const b = solveCarbonateSystem(ppm * 1.001, tempC, salinity);
  return 0.001 / ((b.dic - a.dic) / a.dic);
}
