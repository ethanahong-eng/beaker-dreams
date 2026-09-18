import type { TopicOverride } from "./types";
import { MechanismExplorer3D } from "@/components/MechanismExplorer3D";

export const kineticsOverrides: Record<string, TopicOverride> = {
  "rate-laws": {
    easy: {
      significance: [
        "Chemistry classes usually ask whether a reaction happens. Kinetics asks how fast, and that is often the question that actually matters: how long a painkiller keeps working, how quickly milk spoils in a warm kitchen, how many years a plastic bottle takes to break down. All of those are rate questions.",
        "On the AP exam this shows up as data tables. You get a set of experiments with different starting concentrations and the measured rates, and you have to work out the rate law from the numbers. It is a pattern-matching skill more than a math skill, and once you see the pattern the rest of the question falls out.",
      ],
      theory: [
        {
          heading: "Rate means how fast a concentration is changing",
          body: [
            "The rate of a reaction is how much reactant disappears (or product appears) per second, usually written in molarity per second, M/s. Reactions almost always start fast and slow down, because there is less reactant left to react as time goes on.",
            "If the balanced equation has coefficients, you divide by them so everyone gets the same answer. For 2A → B, A disappears twice as fast as B appears, so the reaction rate is defined as −(1/2)Δ[A]/Δt, which equals +Δ[B]/Δt.",
          ],
        },
        {
          heading: "The rate law is measured, not read off the equation",
          body: [
            "A rate law says how the rate depends on concentration: rate = k[A]ᵐ[B]ⁿ. The exponents m and n are called the orders, and k is the rate constant. The single most common mistake is assuming the orders match the coefficients in the balanced equation. They do not. You have to get them from experimental data.",
            "The way you get them is the method of initial rates: change one concentration at a time and see what happens to the rate. Suppose these three experiments: run 1 has [A] = 0.10 M, [B] = 0.10 M, rate = 2.0×10⁻³ M/s; run 2 has [A] = 0.20 M, [B] = 0.10 M, rate = 4.0×10⁻³ M/s; run 3 has [A] = 0.10 M, [B] = 0.20 M, rate = 8.0×10⁻³ M/s. From run 1 to run 2, [A] doubled and the rate doubled, so the order in A is 1. From run 1 to run 3, [B] doubled and the rate went up by four times, so the order in B is 2. The rate law is rate = k[A][B]², third order overall.",
            "Now solve for k using any one run: k = rate/([A][B]²) = 2.0×10⁻³/(0.10 × 0.10²) = 2.0×10⁻³/(1.0×10⁻³) = 2.0, with units of M⁻² s⁻¹.",
          ],
        },
        {
          heading: "Half-life: the time for half the reactant to disappear",
          body: [
            "For a first-order reaction, the half-life is the same no matter how much you start with, and it is t½ = 0.693/k. That constant half-life is the signature of first order, and it is why radioactive decay is described by a single number.",
            "Example: a first-order reaction has a half-life of 20 seconds, so k = 0.693/20 s = 0.0347 s⁻¹. Starting from 0.80 M, after 20 s you have 0.40 M, after 40 s you have 0.20 M, after 60 s you have 0.10 M. Sixty seconds is three half-lives, so 1/8 — that is 12.5% — of the original amount is left.",
            "Zero- and second-order reactions do not behave this way. A second-order reaction's half-lives get longer and longer as it proceeds; a zero-order reaction's get shorter. If a problem tells you the half-life is constant, it is telling you the reaction is first order.",
          ],
        },
        {
          heading: "The graph test tells you the order",
          body: [
            "If you have concentration-versus-time data instead of initial rates, make three graphs and see which one is a straight line. Plot [A] against time: straight means zero order. Plot ln[A] against time: straight means first order. Plot 1/[A] against time: straight means second order.",
            "The slope of whichever line comes out straight gives you k — negative slope for zero and first order (so k is the magnitude of the slope), positive slope for second order. AP questions often hand you three graphs and ask which order the reaction is; you are just looking for the straight one.",
          ],
        },
      ],
      reviewQuestions: [
        {
          question:
            "For the reaction 2NO + O₂ → 2NO₂, doubling [NO] at constant [O₂] makes the rate four times larger, and doubling [O₂] at constant [NO] doubles the rate. Write the rate law.",
          answer: "rate = k[NO]²[O₂], third order overall.",
          explanation:
            "Four times the rate for twice the concentration means second order in NO; twice the rate for twice the concentration means first order in O₂. Adding the orders, 2 + 1, gives the overall order of 3.",
        },
        {
          question:
            "The reaction 2N₂O₅ → 4NO₂ + O₂ is found experimentally to be first order in N₂O₅. Why does the coefficient of 2 not make it second order?",
          answer:
            "Because rate laws come from experiment, not from the balanced equation — coefficients and orders are unrelated.",
          explanation:
            "A balanced equation only counts atoms over the whole transformation. The rate law reflects the single slowest molecular step, which is not visible in the overall equation.",
        },
        {
          question:
            "A first-order reaction has a rate constant of 0.0231 s⁻¹. What fraction of the reactant remains after 90 seconds?",
          answer: "One eighth (12.5%).",
          explanation:
            "t½ = 0.693/k = 0.693/0.0231 = 30 s, so 90 seconds is exactly three half-lives. Each half-life leaves half, so 1/2 × 1/2 × 1/2 = 1/8 remains.",
        },
        {
          question:
            "A rate constant is reported with units of M⁻¹ s⁻¹. What is the overall order of the reaction?",
          answer: "Second order.",
          explanation:
            "Rate always has units of M/s. For rate = k[A]², k must supply units of M⁻¹ s⁻¹ so that k[A]² comes out as M/s. Zero order gives k in M/s and first order gives k in s⁻¹.",
        },
        {
          question:
            "For a reaction of A, a plot of 1/[A] versus time is a straight line while plots of [A] and ln[A] versus time are curved. What is the order in A, and what does the slope give you?",
          answer: "Second order; the slope equals the rate constant k.",
          explanation:
            "Each order is linear in a different function of concentration. Only the second-order integrated law, 1/[A] = 1/[A]₀ + kt, is a straight line when 1/[A] is plotted against t, with slope k and intercept 1/[A]₀.",
        },
      ],
    },
  },
  "reaction-mechanisms": {
    easy: {
      significance: [
        "A balanced equation tells you what goes in and what comes out, but not how it happened. Real reactions almost never occur in one collision — they go through a series of smaller steps, and the sequence of those steps is called the mechanism.",
        "Mechanisms matter because they tell you where to intervene. If you want a reaction to go faster, you have to speed up the slow step specifically; speeding up any of the others changes nothing. That is also the idea behind catalysts, which show up on the AP exam constantly.",
      ],
      theory: [
        {
          heading: "Reactions happen in steps called elementary steps",
          body: [
            "An elementary step is one actual molecular event: two molecules collide, or one molecule falls apart. A mechanism is a list of elementary steps that add up to the overall balanced equation. If the steps do not add up, the mechanism is wrong immediately.",
            "A species made in one step and used up in a later step is an intermediate. It shows up in the mechanism but not in the overall equation. A catalyst is the opposite bookkeeping: it is used up early and regenerated later, so it appears at the start of the mechanism and comes back out at the end.",
          ],
        },
        {
          heading: "For an elementary step only, the coefficients do give the rate law",
          body: [
            "This is the one place the rule from the last topic is reversed. An elementary step's rate law comes directly from its own stoichiometry, because the step really is a single collision. A → products gives rate = k[A]. A + B → products gives rate = k[A][B]. A + A → products gives rate = k[A]².",
            "The number of molecules colliding in a step is called its molecularity: one is unimolecular, two is bimolecular. Steps requiring three molecules to hit at once are essentially never proposed, because three particles arriving simultaneously with the right energy and orientation is far too improbable.",
          ],
        },
        {
          heading: "The slowest step controls the overall rate",
          body: [
            "If one step is much slower than the others, it acts like a single-lane bridge on a highway: nothing gets through faster than that step allows. It is called the rate-determining step, and when it comes first in the mechanism the overall rate law is just that step's rate law.",
            "Worked example. The reaction NO₂ + CO → NO + CO₂ is measured to follow rate = k[NO₂]² — notice CO is not in it at all. A proposed mechanism is: step 1 (slow) NO₂ + NO₂ → NO₃ + NO, step 2 (fast) NO₃ + CO → NO₂ + CO₂. Check the sum: NO₃ cancels and one NO₂ cancels, leaving NO₂ + CO → NO + CO₂, which is correct. Now check the rate law: step 1 is bimolecular in NO₂, so it predicts rate = k[NO₂]², which matches. CO is missing from the rate law because it only reacts after the bottleneck, so its concentration cannot affect how fast the reaction runs. NO₃ is the intermediate.",
          ],
        },
        {
          heading: "Activation energy, temperature and catalysts",
          body: [
            "Every reaction has an energy hill to climb between reactants and products, called the activation energy, Ea. Only collisions with at least that much energy — and with the molecules lined up correctly — actually react. In a multi-step mechanism, the step with the tallest hill is the slow step.",
            "Raising the temperature speeds a reaction up because it increases the fraction of molecules with enough energy to clear the hill. A catalyst does something different: it provides a completely different route with a lower hill. A catalyst is not consumed, it speeds up the forward and reverse reactions equally, and it does not change ΔH or the position of equilibrium — it only gets you there sooner.",
          ],
        },
      ],
      reviewQuestions: [
        {
          question:
            "In the mechanism NO₂ + NO₂ → NO₃ + NO (slow) followed by NO₃ + CO → NO₂ + CO₂ (fast), which species is the intermediate?",
          answer: "NO₃.",
          explanation:
            "NO₃ is produced in the first step and consumed in the second, so it never appears in the overall equation. An intermediate is made and used up; a catalyst is used up and made again.",
        },
        {
          question:
            "For that same mechanism, why does CO not appear in the experimentally observed rate law?",
          answer: "Because CO only reacts in the fast step, which occurs after the slow step.",
          explanation:
            "Anything that happens after the rate-determining step cannot control the overall speed. Adding more CO just makes an already-fast step faster, so the measured rate does not change.",
        },
        {
          question:
            "A proposed mechanism's steps add up correctly to the overall equation but predict a rate law different from the measured one. What can you conclude?",
          answer: "The mechanism is wrong and must be rejected.",
          explanation:
            "A valid mechanism has to pass both tests — the steps must sum to the overall equation, and the predicted rate law must match experiment. Failing either one is fatal. Passing both does not prove a mechanism is correct, only that it has survived.",
        },
        {
          question:
            "A catalyst is added to a reaction at equilibrium. What happens to the amount of product at equilibrium, and to ΔH?",
          answer: "Neither changes. Only the time taken to reach equilibrium is shorter.",
          explanation:
            "A catalyst lowers the activation energy for the forward and reverse directions by the same amount, so the ratio of the two rates — and therefore K — is unchanged. ΔH depends only on the energies of reactants and products, which the catalyst does not touch.",
        },
        {
          question:
            "Why does raising the temperature by 10 °C often roughly double a reaction rate, even though the average molecular speed barely changes?",
          answer:
            "Because the rate depends on the fraction of collisions with energy above Ea, and that fraction grows very rapidly with temperature.",
          explanation:
            "Raising the temperature stretches out the high-energy tail of the molecular energy distribution far more than it shifts the average, so many more collisions clear the activation barrier even though typical molecules are only slightly faster.",
        },
      ],
    },
  },
  "organic-mechanisms": {
    simulation: {
      heading: "SN1, SN2, E1, E2 — side by side, in 3D",
      caption:
        "Switch between all four mechanisms on the same tetrahedral carbon: watch the concerted backside attack that inverts SN2's stereocenter, the planar carbocation SN1 and E1 share, and the anti-periplanar geometry E2 requires — including exactly where each one fails outside its required geometry.",
      render: () => <MechanismExplorer3D />,
    },
    easy: {
      significance: [
        "Substitution and elimination are the two ways a molecule with a leaving group can react, and telling them apart — along with predicting what happens to the molecule's shape in the process — is one of the core organic-chemistry skills tested on the AP exam. You don't need to derive rate laws to do this well; you need to recognize the pattern.",
        "These four mechanisms — SN1, SN2, E1, E2 — show up constantly as multiple-choice questions asking you to identify a mechanism from a reaction setup, or free-response questions asking you to predict a product and explain why. A small set of clues (how crowded the carbon is, how strong the nucleophile or base is) is enough to answer both.",
      ],
      theory: [
        {
          heading: "SN2: one smooth step, and the molecule flips",
          body: [
            "In an SN2 reaction, the incoming nucleophile attacks the carbon from the side directly opposite the leaving group, and the leaving group departs at the same moment the new bond forms — a single, one-step event. The other three groups on that carbon get pushed through to the other side, like an umbrella flipping inside-out in the wind.",
            "The result is that the molecule's 3D arrangement is inverted every time — this reaction happens best on carbons that aren't crowded with other groups, since a crowded carbon leaves no room for the nucleophile to approach from behind.",
          ],
        },
        {
          heading: "SN1: two steps, with a fork in the road",
          body: [
            "An SN1 reaction happens in two separate steps. First, the leaving group leaves on its own, before the nucleophile ever gets involved, leaving behind a flat, positively charged carbon called a carbocation. Only after that does the nucleophile come in and bond to it.",
            "Because the carbocation is flat, the nucleophile can attack from either face with about equal ease, giving a mixture of both possible 3D arrangements rather than one clean inverted product. SN1 is favored on more crowded (more substituted) carbons, since those form more stable carbocations.",
          ],
        },
        {
          heading: "E1 and E2: when a base wins out over substitution",
          body: [
            "Elimination reactions compete with substitution: instead of a nucleophile swapping in for the leaving group, a base pulls off a hydrogen from a neighboring carbon, and the electrons from that C–H bond become a new double bond as the leaving group departs. E2 does this in one concerted step, like SN2; E1 does it in two steps through the same kind of carbocation intermediate SN1 forms.",
            "A strong, bulky base — one that's better at grabbing a proton than squeezing into a crowded carbon — tips the reaction toward elimination; a smaller, purely nucleophilic reagent favors substitution instead.",
          ],
        },
      ],
      reviewQuestions: [
        {
          question:
            "A reaction follows a two-step mechanism in which the leaving group departs before the nucleophile attacks. Which mechanism is this, and what intermediate forms?",
          answer: "SN1, through a carbocation intermediate.",
          explanation:
            "SN1 is defined by its two steps: ionization first (forming a carbocation), then nucleophilic attack. SN2 has no intermediate — it happens in one step.",
        },
        {
          question:
            "A chiral substrate undergoes an SN2 reaction at its stereocenter. What happens to its stereochemistry?",
          answer:
            "It inverts — the product has the opposite 3D configuration from the starting material.",
          explanation:
            "Backside attack in SN2 forces the other three groups on that carbon through to the opposite side in a single step, flipping the configuration every time, like an umbrella turning inside out.",
        },
        {
          question:
            "Why can an SN1 reaction produce a mixture of two different stereochemical outcomes from a single starting material?",
          answer:
            "Because the carbocation intermediate is flat, so the nucleophile can attack from either face with roughly equal likelihood.",
          explanation:
            'Once the leaving group has departed, there\'s no longer a defined "back side" to react from — the planar carbocation offers two equally open faces, giving a mix of both possible products.',
        },
        {
          question:
            "A chemist wants to favor elimination over substitution for a given alkyl halide. Which change to the reagent would help?",
          answer: "Switching to a strong, bulky base.",
          explanation:
            "A bulky base has trouble squeezing in to attack a crowded carbon as a nucleophile, but can still easily grab a proton, so it favors E1/E2 elimination over SN1/SN2 substitution.",
        },
        {
          question:
            "Which pair of mechanisms are both single-step (concerted) processes, with no intermediate in between?",
          answer: "SN2 and E2.",
          explanation:
            "SN2 and E2 both happen in one smooth step — bond-breaking and bond-forming occur simultaneously. SN1 and E1 instead both pass through a carbocation intermediate formed in a separate first step.",
        },
      ],
    },
  },
};
