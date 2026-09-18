import { useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SectionNav } from "@/components/SectionNav";
import { NextTopicNav } from "@/components/NextTopicNav";
import { ReviewLevelToggle } from "@/components/ReviewLevelToggle";
import { ReviewQuestions } from "@/components/ReviewQuestions";
import { EmissionsScrubbingSim } from "@/components/EmissionsScrubbingSim";
import type { Level, ReviewQuestion } from "@/lib/reviewContent";

export const Route = createFileRoute("/everyday")({
  head: () => ({
    meta: [
      { title: "Chemistry in Daily Life — Chirality, Plastics & More | Valence Lab" },
      {
        name: "description",
        content:
          "Long-form explainers on the chemistry that shapes daily life: chirality and drug safety, microplastics, ocean acidification, refrigerants and food chemistry.",
      },
      { property: "og:title", content: "Chemistry in Daily Life — Valence Lab" },
      {
        property: "og:description",
        content:
          "Why handedness in molecules matters, how plastics really break down, and other chemistry worth knowing.",
      },
    ],
  }),
  component: EverydayPage,
});

type Essay = {
  tag: string;
  title: string;
  lede: string;
  body: string[];
  easyBody: string[];
  /** Optional interactive embed rendered after the essay body. */
  sim?: () => ReactNode;
};

const essays: Essay[] = [
  {
    tag: "Stereochemistry",
    title: "Chirality: why a molecule's handedness can decide a life",
    lede: "Two molecules can share every atom, every bond and every formula — and still behave like strangers.",
    body: [
      "A carbon atom bonded to four different groups can be assembled in two ways that are mirror images of one another, like your left and right hands. No amount of rotation makes one sit on top of the other. Chemists call these enantiomers, and on every ordinary measurement they are indistinguishable: identical melting point, identical solubility, identical NMR and infrared spectra, identical energy. That is not a coincidence or a limitation of the instruments. The electromagnetic interaction that fixes those properties does not distinguish left from right, so the two forms are exactly degenerate. (The weak nuclear force does distinguish them, by an energy difference on the order of 10⁻¹¹ joules per mole — far too small to have ever been detected in a molecule.)",
      "The difference appears only when an enantiomer meets something that is itself handed. Plane-polarized light is the classic case: the two forms rotate it by equal angles in opposite directions, which is how Pasteur identified the phenomenon in 1848 by hand-sorting tartrate crystals under a lens. The consequential case is biology. Nearly every amino acid in your proteins is the L form, nearly every sugar the D form, so enzymes and receptors are chiral pockets — and the geometry of why a pocket can tell two hands apart is specific: it takes three points of contact. Any two interactions can be satisfied by either enantiomer, but the third can only be reached by one of them. That is the Easson–Stedman model, and it is why carvone smells of spearmint in one form and caraway in the other from the same receptors.",
      "The same three-point discrimination governs drugs. (S)-ibuprofen does essentially all the cyclooxygenase inhibition while the R form is nearly inert as an analgesic — the racemic tablet works only because an enzyme in the body converts R to S, one way, over a few hours. In other pairs the second enantiomer is not a passenger but an active liability.",
      "That became public with thalidomide, sold from 1957 as a racemate — both enantiomers together — for morning sickness. The R form is the sedative; the S form interferes with fetal development, and thousands of children were born with severe limb malformations before the withdrawal in 1961. The lesson was not simply 'separate the enantiomers.' In the body the two forms racemize into each other within hours, so even a pure R preparation would have generated the S form in the patient. What the disaster did establish is that each hand of a drug must be studied as though it were a separate compound, which is now the regulatory default worldwide.",
      "Modern pharmaceutical chemistry is built on that premise. Asymmetric catalysis — a chiral catalyst that steers a reaction toward one mirror image, recognised with the 2001 Nobel Prize to Knowles, Noyori and Sharpless — lets chemists build the enantiomer they want instead of making both and discarding half. Roughly half of the drugs on the market today are single enantiomers. When a label reads esomeprazole, levocetirizine or dextromethorphan, the prefix is telling you which hand you are taking.",
    ],
    easyBody: [
      "Some molecules come in two versions that are mirror images of each other, like your left and right hand — same parts, same connections, but impossible to overlap perfectly no matter how you turn them. Chemists call these two versions enantiomers.",
      "Your body is handed too, and that is what makes the difference matter. Enzymes and receptors are pockets with a specific shape, and holding a molecule in place takes about three points of contact — which only one of the two mirror images can reach. That is why one form of a molecule smells like spearmint and its twin smells like caraway, and why one form of a drug can do the intended job while the other does little or, in rare and serious cases, causes harm.",
      "The thalidomide disaster of the late 1950s made the point unforgettable: the drug was sold as a mixture of both forms, and one of them caused severe birth defects in thousands of children. Today regulators require each mirror-image form of a new medicine to be tested as if it were a separate drug.",
    ],
  },
  {
    tag: "Materials",
    title: "Plastics don't disappear — they get smaller",
    lede: "Degradation and decomposition are not the same chemical event, and the gap between them is where microplastics live.",
    body: [
      "Polyethylene and polypropylene are chains of carbon joined by bonds that are, chemically speaking, extremely boring. Breaking a C–C bond costs about 348 kJ/mol and a C–H about 413, and neither is polarized enough to give water anywhere to attack — hydrolysis needs a carbon carrying a partial positive charge, and a polyolefin simply does not have one. Nor is there an enzyme for the job. No microbe had four billion years of selection pressure to digest a substrate that did not exist before the 1930s.",
      "PET is the instructive exception, and it proves the rule. Its backbone is held together by ester linkages, which are polar and genuinely hydrolysable, and in 2016 a bacterium found outside a Japanese recycling plant — Ideonella sakaiensis — turned out to carry an enzyme that cleaves them. Engineered versions of that enzyme now run at industrial scale. Nothing comparable exists for polyethylene, because there is no bond for an enzyme to grip.",
      "What sunlight does to a polyolefin is therefore not clean scission but radical autoxidation. Ultraviolet light absorbed by trace chromophores — catalyst residues, stray ketone groups left over from processing — knocks out a hydrogen and leaves a carbon radical; oxygen adds to it; the resulting peroxy radical abstracts a hydrogen from the neighbouring chain and the cycle propagates. Hydroperoxides accumulate and then decompose by the Norrish reactions into shorter chains. The polymer yellows, embrittles, and crumbles under mechanical stress, which is degradation without decomposition: the chains get shorter, and the carbon goes nowhere.",
      "The result is a material that becomes invisible without becoming absent. Fragments below five millimetres — microplastics — pass through filtration, ride ocean currents, and accumulate in sediment and tissue. Additives compound the problem: plasticisers and flame retardants are frequently not bonded to the polymer at all, merely dissolved in it, so they leach out on a schedule of their own that has nothing to do with the backbone.",
      "'Biodegradable' is therefore a claim about conditions, not about chemistry alone. PLA is a polyester, so its bonds can hydrolyse in principle, but the rate depends on getting water into a solid — and PLA's glass transition sits near 60 °C. Above it the chains loosen and water floods in; below it the material is a glass and hydrolysis takes decades. That single threshold is the entire difference between an industrial composter held at 58 °C and a cold sea. Reading the certification — home compostable, industrially compostable, oxo-degradable — matters far more than the word on the front of the packet.",
    ],
    easyBody: [
      "Plastics like polyethylene and PET are made of extremely stable carbon chains. The bonds are strong and not at all lopsided in charge, so water has nothing to grab onto, and no microbe ever evolved an enzyme for a material that did not exist before the 1930s.",
      "So instead of being digested, plastic gets taken apart physically. Sunlight and oxygen slowly chop the long chains into shorter ones, and wear and abrasion grind those into fragments smaller than five millimetres — microplastics — which are small enough to spread through water, soil, and living tissue instead of ever breaking down completely.",
      'A label that says "biodegradable" or "compostable" is describing conditions, not the plastic on its own. PLA, the common compostable plastic, comes apart well in an industrial composter held near 58 °C, because that heat is what lets water get into the material at all; in a cold ocean or a home compost bin the same plastic can last for years.',
    ],
  },
  {
    tag: "Environment",
    title: "Ocean acidification is an equilibrium problem",
    lede: "The same Le Chatelier logic from the equilibrium module is quietly reshaping marine chemistry.",
    body: [
      "Carbon dioxide dissolving in seawater sets up a linked chain of equilibria: CO₂(aq) + H₂O ⇌ H₂CO₃ ⇌ H⁺ + HCO₃⁻ ⇌ 2H⁺ + CO₃²⁻. In seawater the two dissociation steps have pK values near 5.9 and 8.9, and surface pH sits around 8.1 — squarely between them. That placement is what fixes the composition: roughly 90% of the dissolved inorganic carbon is bicarbonate, about 9% is carbonate, and only around 1% is dissolved CO₂ itself.",
      "Add CO₂ to the atmosphere and the whole chain is pushed to the right, exactly the disturbance you can impose in the equilibrium simulation by raising a reactant concentration. Surface ocean pH has fallen by roughly 0.1 units since the industrial revolution, from about 8.2 to about 8.1. On a logarithmic scale that is a rise in hydrogen ion concentration of about 26 percent, since 10 to the power 0.1 is 1.26.",
      "But the damage is done by a reaction that gets missed if you only watch pH. Most of those new hydrogen ions do not stay free — they are mopped up by carbonate already in the water, so the net change is CO₂ + CO₃²⁻ + H₂O → 2 HCO₃⁻. Dissolving carbon dioxide consumes carbonate. And carbonate is precisely the raw material corals, molluscs and plankton use to precipitate calcium carbonate shells. The organisms are not being dissolved by acid in any dramatic sense; they are being starved of a building block by a shifted equilibrium.",
      "The quantitative version is the saturation state, Ω = [Ca²⁺][CO₃²⁻]/Ksp. Above 1, shell formation is thermodynamically downhill; below 1, existing shells begin to dissolve. Aragonite, the form of calcium carbonate corals and pteropods build with, is about 50% more soluble than calcite, so those organisms cross the threshold first — and cold polar water, which holds more dissolved CO₂, crosses it earliest of all.",
      "This is also why the ocean is a carbon sink with a ceiling rather than an unlimited sponge. Because uptake works by consuming carbonate, every tonne absorbed leaves less carbonate to absorb the next. The bookkeeping is captured by the Revelle factor, around 10 in surface water today: a 1% increase in total dissolved carbon raises the CO₂ partial pressure by roughly 10%. The buffer is being spent.",
    ],
    easyBody: [
      "When carbon dioxide dissolves in seawater, it reacts to form an acid, which releases hydrogen ions into the water. More CO₂ in the atmosphere means more of this reaction happening, and surface ocean pH has already fallen from about 8.2 to about 8.1 since before the industrial revolution — which sounds tiny, but pH is a logarithmic scale, so it means roughly 26% more hydrogen ions.",
      'Those extra hydrogen ions get mopped up by carbonate ions already dissolved in the water, converting them into bicarbonate. Carbonate is exactly the building block corals and shellfish need to make their shells, so it is less that these organisms are being "dissolved by acid" and more that the raw material is being used up before they can reach it.',
      "This also puts a limit on how much CO₂ the ocean can keep absorbing. Every tonne it takes up consumes some of the carbonate that made absorbing the next tonne possible — it is a buffer being spent down, not an unlimited sponge.",
    ],
  },
  {
    tag: "Kinetics at home",
    title: "Why the fridge works, and why cooking is chemistry",
    lede: "Refrigeration and roasting are the same rate equation read in opposite directions.",
    body: [
      "Cooling food does not sterilise it. It slows the enzymatic and microbial reactions that spoil it, and the mechanism is the one in the kinetics simulation: at a lower temperature, fewer molecules sit in the high-energy tail of the Maxwell–Boltzmann distribution, so fewer collisions clear the activation barrier and the shaded region shrinks. Put numbers on it with the Arrhenius expression and a spoilage reaction with an activation energy near 50 kJ/mol runs about four times slower at a refrigerator's 4 °C than on a 22 °C counter. That factor of four is the difference between days and hours.",
      "A freezer does something categorically different as well. Below about −18 °C most of the water in the food has crystallised, and ice is not available as a solvent — the water activity drops far enough that microbial growth stops almost entirely rather than merely slowing. What continues is physical: ice crystals coarsening and rupturing cell walls, and fats oxidising through the same radical chain reaction that degrades polyethylene in sunlight.",
      "Turn the dial the other way and the same arithmetic browns a steak. The Maillard reaction is a condensation between an amino acid's amine group and a reducing sugar's carbonyl, followed by the Amadori rearrangement and a branching cascade that ends in hundreds of aroma compounds and the brown melanoidin polymers on the crust. Its activation energy is high, which by the same Arrhenius logic makes it exquisitely temperature-sensitive: essentially idle at 100 °C, unmistakable above about 140 °C.",
      "That is the real reason boiled chicken stays pale, and it is not that water is chemically hostile to browning. As long as there is liquid water at the surface, evaporation clamps that surface at 100 °C no matter how hot the pan beneath it is, because every joule arriving is spent on the latent heat of vaporisation instead of on raising the temperature. Browning begins the moment the surface dries and the temperature is finally free to climb. Pat a steak dry and it sears in seconds; leave it wet and it steams.",
      "Caramelisation is a separate pathway — sugar decomposing on its own with no amino acid involved, beginning near 160 °C for sucrose — which is why the two processes give different flavours from the same pan. And a pressure cooker is a third lever on the same equation: at about one bar of gauge pressure water boils at 121 °C rather than 100 °C, so the water-bound reactions that were pinned at the boiling point finally run several times faster.",
    ],
    easyBody: [
      "Cooling food doesn't kill microbes or stop chemical spoilage completely — it just slows those reactions down, because at a lower temperature fewer molecules have enough energy to get over the activation energy barrier. As a rough rule, reaction rates roughly cut in half for every 10 °C you cool something, so a fridge at 4 °C runs spoilage about four times slower than a 22 °C kitchen counter.",
      "Cooking runs the same rule in reverse. Heat speeds up the Maillard reaction, a reaction between the amino acids in protein and the sugars in food that produces hundreds of new brown, savory compounds. It has a high activation energy, which makes it especially sensitive to temperature: barely running at 100 °C, and taking off above about 140 °C.",
      "That is why a seared steak tastes completely different from a boiled one, and the reason is not the water itself. While the surface is wet, evaporation pins it at 100 °C, because the incoming heat goes into turning water into steam instead of raising the temperature. Dry the surface off and the temperature is finally free to climb high enough to brown.",
    ],
  },
  {
    tag: "Buffers",
    title: "Your blood is a titration you never notice",
    lede: "A buffer keeps arterial pH between 7.35 and 7.45 while you sprint, sleep and digest.",
    body: [
      "The dominant system is carbon dioxide and bicarbonate. Dissolved CO₂ hydrates to carbonic acid, which dissociates to bicarbonate and a hydrogen ion; when metabolism dumps acid into the blood, bicarbonate absorbs it, and when the blood drifts basic the reaction runs the other way and gives protons back. That is exactly the flat stretch of a titration curve — the region where adding acid barely moves the pH — which you can drag through in the titration simulation.",
      "The Henderson–Hasselbalch equation puts numbers on it: pH = pKa + log([HCO₃⁻]/[CO₂]). In arterial blood the effective pKa of the pair is 6.1, bicarbonate runs about 24 mM, and dissolved CO₂ about 1.2 mM — that second figure being 0.03 mM per mmHg times a partial pressure of 40 mmHg. The ratio is 20, its logarithm is 1.3, and 6.1 + 1.3 = 7.4, the number printed on every blood gas report.",
      "By textbook rules that should not work at all. A buffer is strongest within about one pH unit of its pKa, and blood operates 1.3 units above it, where a sealed buffer would already be most of the way to exhaustion. It works because the system is open at both ends. The lungs set the CO₂ term wherever the brainstem asks, within minutes; the kidneys reset the bicarbonate term over hours to days. A beaker's buffer has a fixed capacity and eventually collapses, while the body simply removes one side of the equilibrium as fast as it accumulates. Carbonic anhydrase is what makes that possible — uncatalysed, CO₂ hydration takes tens of seconds, far too slow to keep pace with a breath, and the enzyme accelerates it by a factor near 10⁷.",
      "The failure modes have familiar names, and both are ratio failures. Hyperventilation blows off CO₂ faster than metabolism produces it, the denominator collapses, and pH climbs — respiratory alkalosis, with the tingling and light-headedness that come with it. (Breathing into a paper bag was the old advice and is no longer recommended, since the same symptoms can come from conditions that rebreathing makes considerably worse.) Uncontrolled diabetes runs the other way: ketoacids with pKa near 4.7 are fully ionised at blood pH, so each one delivers a proton, and they arrive faster than bicarbonate and the kidneys can clear them. The deep, rapid Kussmaul breathing of ketoacidosis is the respiratory system trying to rescue the ratio by driving the denominator down.",
    ],
    easyBody: [
      "Your blood is held in a very narrow pH range, between 7.35 and 7.45, by a buffer — a pair of chemicals (carbonic acid and bicarbonate) where one member can soak up extra hydrogen ions and the other can release them. Whichever way the blood gets pushed, one member of the pair pushes back and the pH barely moves.",
      "What sets the pH is the ratio between the two, and in healthy blood there are about 20 bicarbonate ions for every dissolved carbonic acid. What makes the body's version far better than a buffer in a beaker is that both numbers are adjustable: your lungs breathe off the acid side as CO₂ within minutes, and your kidneys top the bicarbonate side back up over hours. A beaker's buffer eventually runs out of capacity; yours is continuously refilled.",
      "Push it too far and the ratio breaks anyway. Breathing too fast strips out CO₂ faster than the body makes it and the blood turns too basic; uncontrolled diabetes produces acid faster than the lungs and kidneys can clear it and the blood turns too acidic. Both are medical emergencies, which is a measure of how tightly that pH has to be held.",
    ],
  },
  {
    tag: "Policy",
    title: "The ozone layer, and the one time we fixed it",
    lede: "A radical chain reaction with a catalytic step is the reason a single chlorine atom mattered so much.",
    body: [
      "Stratospheric ozone is not a layer so much as a steady state, first written down by Sydney Chapman in 1930: ultraviolet light splits O₂ into atoms, each atom adds to another O₂ to make O₃, more ultraviolet splits O₃ back apart, and occasionally an O atom meets an O₃ and the pair annihilate to two O₂. Absorbing those photons is the whole point — the cycle turns ultraviolet into heat, which is why there is a warm stratosphere at all and why the surface receives so little UV-B.",
      "Chlorofluorocarbons were engineered to be inert, which was the selling point for refrigerants and propellants and also, precisely, the problem. Nothing in the lower atmosphere reacts with them, so they survive for decades and drift upward until stratospheric ultraviolet finally breaks off a chlorine atom. What that atom does next is catalytic in the strict sense: Cl + O₃ → ClO + O₂, then ClO + O → Cl + O₂. Add the two steps and the chlorine cancels out, leaving O + O₃ → 2 O₂ — the natural Chapman sink, enormously accelerated. A single chlorine atom destroys on the order of 10⁵ ozone molecules before it is finally parked as HCl or chlorine nitrate. Rowland and Molina published the argument in 1974 and shared the 1995 Nobel Prize with Crutzen for it.",
      "The Antarctic hole needed a second mechanism, because the polar winter stratosphere holds almost no free oxygen atoms for that second step. Two things supply the gap. Molina identified a ClO dimer cycle that needs only sunlight rather than atomic oxygen, and — the part nobody had thought to look for — the extreme cold of the polar vortex condenses polar stratospheric clouds, whose ice and nitric acid surfaces convert the inert chlorine reservoirs back into reactive forms: chlorine nitrate plus HCl gives Cl₂, which accumulates through the dark winter and photolyses the instant the sun returns. That is why the depletion shows up as a seasonal hole in the southern spring rather than a uniform global thinning, and why the Arctic, whose vortex is warmer and leakier, is affected far less.",
      "The Montreal Protocol of 1987 phased the compounds out and is the only UN treaty ever ratified by every member state. Stratospheric chlorine peaked around 1997 and has been declining since; the Antarctic hole is measurably smaller, with a return to 1980 levels projected for around 2066. It remains the clearest case of a reaction mechanism being worked out at the bench and translated directly into international policy that worked. The sequel is less tidy — the HFCs brought in as replacements do nothing to ozone but are potent greenhouse gases, which is what the 2016 Kigali Amendment was written to unwind.",
    ],
    easyBody: [
      "Chlorofluorocarbons (CFCs) were designed to be extremely unreactive, which is exactly what let them survive long enough to drift up into the stratosphere, where strong ultraviolet light finally broke them apart and released chlorine atoms.",
      "A chlorine atom destroys an ozone molecule, and then the very next step hands the chlorine atom back unchanged so it can start over. That is what makes it a catalyst, and it is why a single atom can take out on the order of 100,000 ozone molecules, and why a relatively small amount of CFCs did so much damage.",
      "The damage shows up as a hole over Antarctica each spring rather than an even thinning everywhere, because the reaction needs two things that only line up there: the ice clouds that form in the extreme cold of the polar winter, which release the chlorine from storage, and returning sunlight to set it going. The Montreal Protocol of 1987 phased CFCs out, and the ozone layer is now measurably recovering — it is widely considered the most successful environmental treaty ever signed.",
    ],
  },
  {
    tag: "Energy & Policy",
    title: "Scrubbing a smokestack is a cost-benefit problem, not just a chemistry one",
    lede: "The same SO₂ that would otherwise become acid rain can be redirected into gypsum — the question is whether it's worth the cost.",
    body: [
      "A coal plant's flue gas carries sulfur dioxide from sulfur impurities in the coal. Left alone, that SO₂ drifts into the atmosphere, oxidizes to SO₃, and dissolves in water vapor to form sulfuric acid — acid rain. A flue-gas desulfurization scrubber intercepts it first, reacting it with a limestone slurry to precipitate calcium sulfate (gypsum, a real building material) instead.",
      "No scrubber is 100% efficient, and running one costs money — so the real-world question a utility (or a regulator) faces is whether the cost of removing another ton of SO₂ is worth what that ton would otherwise cost in acid rain damage, crop loss and respiratory illness. Play with the simulation below to see how that tradeoff moves as the numbers change.",
    ],
    easyBody: [
      "Coal contains sulfur, so burning it releases sulfur dioxide (SO₂), which reacts with water in the air to form sulfuric acid — acid rain. A scrubber reacts the SO₂ with limestone before it can escape, turning it into gypsum (a solid, useful building material) instead of letting it reach the atmosphere.",
      "No scrubber catches everything, and scrubbers cost money to run. So it comes down to a cost-benefit question: is removing more SO₂ worth what it costs, compared to the damage that SO₂ would otherwise cause? The simulation below lets you test that tradeoff yourself.",
    ],
    sim: () => <EmissionsScrubbingSim />,
  },
];

const REVIEW_QUESTIONS: ReviewQuestion[] = [
  {
    question:
      "Two molecules are enantiomers of each other. What does that mean about their structures?",
    answer:
      "They are non-superimposable mirror images of each other — same atoms and bonds, arranged as mirror images, like left and right hands.",
    explanation:
      "Because biological molecules (enzymes, receptors) are themselves handed, two enantiomers can have very different effects in the body even though their physical properties, like melting point, are otherwise identical.",
  },
  {
    question:
      "Rising atmospheric CO₂ is causing ocean pH to drop. What equilibrium concept explains this?",
    answer:
      "Le Chatelier's principle — adding more CO₂ shifts the CO₂/carbonic acid/bicarbonate equilibrium, producing more hydrogen ions and lowering pH.",
    explanation:
      "This is the same kind of equilibrium shift you'd force by adding a reactant in any Le Chatelier problem, just happening at an ocean-wide scale. The hydrogen ions then consume carbonate, which is the building block shells are made from.",
  },
  {
    question: "Why does lowering a food's temperature slow down spoilage?",
    answer:
      "Fewer molecules have enough kinetic energy to overcome the activation energy barrier at lower temperatures, so reaction rates — including spoilage reactions — slow down.",
    explanation:
      "This follows directly from the same collision-theory reasoning used to explain reaction rates elsewhere: lower temperature means fewer high-energy collisions, so slower reactions.",
  },
  {
    question:
      "Blood is buffered near pH 7.4 by the carbonic acid / bicarbonate pair. What happens chemically when acid enters the bloodstream?",
    answer:
      "Bicarbonate ions react with the added hydrogen ions to form carbonic acid, so the free hydrogen ion concentration — and therefore the pH — barely changes.",
    explanation:
      "A buffer is a weak acid together with its conjugate base. The base absorbs added H⁺ and the acid releases H⁺ if the blood turns basic, so pH stays nearly constant until one member of the pair is used up. In the body it isn't: the lungs and kidneys keep replenishing both sides.",
  },
  {
    question: "What role does a chlorine atom play in ozone depletion, chemically speaking?",
    answer:
      "It acts as a catalyst — it destroys ozone molecules but is regenerated afterward, so a single atom can destroy many thousands of ozone molecules.",
    explanation:
      "Because it isn't consumed in the reaction, one chlorine atom keeps reacting over and over, which is why even trace amounts of CFCs caused disproportionately large ozone damage.",
  },
  {
    question: "What does a flue-gas scrubber do to the SO₂ in a power plant's exhaust, chemically?",
    answer:
      "It reacts the SO₂ with a limestone (calcium carbonate) slurry to form solid calcium sulfate (gypsum) instead of letting the SO₂ escape into the atmosphere.",
    explanation:
      "Without a scrubber, that same SO₂ would oxidize in the atmosphere to SO₃ and dissolve in water vapor to form sulfuric acid — acid rain. The scrubber redirects the sulfur into a solid, useful byproduct instead.",
  },
  {
    question:
      "Why can running an expensive SO₂ scrubber still be a net financial benefit, not just an environmental one?",
    answer:
      "Because the health, agricultural and infrastructure damage that a ton of released SO₂ causes is usually worth more than the cost of removing that ton with a scrubber.",
    explanation:
      "This is the core idea of cost-benefit analysis applied to pollution control: comparing the cost of prevention against the cost of the damage prevention avoids, rather than treating environmental cost as free.",
  },
];

function EverydayPage() {
  const [level, setLevel] = useState<Level>("hard");
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <header className="mb-16 max-w-3xl border-b border-border pb-12">
        <div className="mb-5 inline-block border-y border-border px-4 py-2 text-[10px] font-bold uppercase text-accent">
          TOPIC 21: APPLIED CHEMISTRY
        </div>
        <h1 className="mb-6 font-display text-5xl font-bold md:text-6xl">
          Chemistry in <span className="text-accent">Daily Life</span>
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Not everything worth understanding fits inside a simulation. These are longer reads on the
          chemistry that shapes medicine, food, climate and policy — the ideas most worth spreading
          beyond the lab.
        </p>
      </header>

      <ReviewLevelToggle level={level} onChange={setLevel} />

      <div className="grid gap-4 border-y border-border py-6 md:grid-cols-3">
        {essays.map((e, i) => (
          <a
            key={e.title}
            href={`#essay-${i}`}
            className="group flex gap-3 text-sm transition-colors hover:text-accent"
          >
            <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
            <span className="font-medium leading-snug">{e.title}</span>
          </a>
        ))}
      </div>

      <div className="mt-20 space-y-24">
        {essays.map((e, i) => (
          <article
            key={e.title}
            id={`essay-${i}`}
            className="grid scroll-mt-24 gap-10 md:grid-cols-12"
          >
            <div className="md:col-span-4">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
                {String(i + 1).padStart(2, "0")} / {e.tag}
              </span>
              <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight">{e.title}</h2>
              <p className="mt-4 border-l-2 border-accent pl-4 text-sm italic leading-relaxed text-muted-foreground">
                {e.lede}
              </p>
            </div>
            <div className="space-y-6 md:col-span-8">
              {(level === "easy" ? e.easyBody : e.body).map((p, j) => (
                <p key={j} className="leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
              {e.sim && <div className="mt-10">{e.sim()}</div>}
            </div>
          </article>
        ))}
      </div>

      {level === "easy" && (
        <section id="quick-review" className="mt-24 scroll-mt-24">
          <ReviewQuestions questions={REVIEW_QUESTIONS} />
        </section>
      )}

      <section className="mt-24 border border-border bg-card/70 p-10">
        <h2 className="mb-4 text-2xl font-bold italic">A closing thought</h2>
        <p className="max-w-3xl leading-relaxed text-muted-foreground">
          Every topic on this page reduces to the three ideas you can play with in the simulations:
          equilibria that shift when you disturb them, rates governed by an energy barrier, and
          protons moving between molecules. Chemistry is not a list of facts to memorise — it is a
          small set of behaviours applied at wildly different scales, from a beaker to an ocean.
        </p>
      </section>

      <NextTopicNav currentSlug="everyday" />

      <SectionNav items={essays.map((e, i) => ({ id: `essay-${i}`, label: e.tag }))} />
    </main>
  );
}
