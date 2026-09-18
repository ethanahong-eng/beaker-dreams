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
      "A carbon atom bonded to four different groups can be assembled in two ways that are mirror images of one another, like your left and right hands. No amount of rotation makes one sit on top of the other. Chemists call these enantiomers, and on paper they look almost identical: same melting point, same solubility, same spectra in an ordinary lab. The difference only appears when they meet something that is itself handed.",
      "Biology is relentlessly handed. Nearly every amino acid in your body is left-handed; nearly every sugar is right-handed. Enzymes and receptors are therefore chiral pockets, and a chiral pocket accepts one enantiomer snugly while the other rattles or refuses to fit. That is why carvone smells of spearmint in one form and caraway in the other, and why only one enantiomer of ibuprofen does the anti-inflammatory work while its partner is largely a passenger.",
      "The stakes became public with thalidomide in the late 1950s. Marketed as a racemic mixture — both enantiomers together — it eased morning sickness, while the other form interfered with fetal development, and thousands of children were born with severe limb malformations. The lesson was not simply 'separate the enantiomers': in the body the two forms interconvert, so purification alone would not have prevented the tragedy. What it did establish is that a drug's two hands must each be studied as if they were separate drugs.",
      "Modern pharmaceutical chemistry is largely built on this insight. Asymmetric catalysis — recognised with the 2001 Nobel Prize — lets chemists build one enantiomer preferentially rather than making both and throwing half away. Regulators now expect enantiomeric purity data as standard. The next time a label says 'es-' or 'levo-' or 'dextro-', it is telling you which hand you are taking.",
    ],
    easyBody: [
      "Some molecules come in two versions that are mirror images of each other, like your left and right hand — same parts, same connections, but impossible to overlap perfectly no matter how you turn them. Chemists call these two versions enantiomers.",
      'Your body is "handed" too — most of its molecules only accept one specific version. That\'s why one mirror-image form of a molecule can smell or taste different from its twin, and why one form of a drug can work as intended while the other does little or, in rare and serious cases, causes harm.',
      "This is why drug companies now have to test each mirror-image form of a new medicine separately, rather than assuming both halves behave the same way.",
    ],
  },
  {
    tag: "Materials",
    title: "Plastics don't disappear — they get smaller",
    lede: "Degradation and decomposition are not the same chemical event, and the gap between them is where microplastics live.",
    body: [
      "Polyethylene, polypropylene and PET are long chains of carbon held together by bonds that are, chemically speaking, extremely boring. There is little for water to attack and nothing for most microbes to eat, because no enzyme evolved for a substrate that did not exist before the 1900s. What sunlight and mechanical stress do accomplish is chain scission: ultraviolet photons break the polymer into shorter fragments, and abrasion grinds those fragments down.",
      "The result is a material that becomes invisible without becoming absent. Particles below five millimetres — microplastics — pass through filtration, ride ocean currents and accumulate in sediment and tissue. Additives complicate matters further: plasticisers and flame retardants are often not bonded to the polymer at all, merely mixed in, so they leach out on their own timescale.",
      "'Biodegradable' is a claim about conditions, not chemistry alone. PLA, a common compostable plastic, hydrolyses efficiently at the sustained 55–60 °C of an industrial composter and very slowly in a cold sea. Reading the certification — home compostable, industrially compostable, oxo-degradable — matters more than the word on the front of the packet.",
    ],
    easyBody: [
      "Plastics like polyethylene and PET are made of extremely stable carbon chains — there's very little that water or microbes can do to break them apart naturally, since nothing evolved to digest a material invented barely a century ago.",
      "Instead of disappearing, sunlight and physical wear and tear break plastic into smaller and smaller pieces, called microplastics, which are small enough to spread through water, soil, and living tissue instead of breaking down completely.",
      'A label that says "biodegradable" or "compostable" is really describing specific conditions — like the sustained high heat of an industrial composter — rather than guaranteeing the plastic will disappear anywhere, a home compost bin or the ocean included.',
    ],
  },
  {
    tag: "Environment",
    title: "Ocean acidification is an equilibrium problem",
    lede: "The same Le Chatelier logic from the equilibrium module is quietly reshaping marine chemistry.",
    body: [
      "Carbon dioxide dissolves in seawater and reacts to form carbonic acid, which dissociates into bicarbonate and hydrogen ions. Add more CO₂ to the atmosphere and you push this coupled equilibrium to the right — exactly the shift you can force in the equilibrium simulation by raising a reactant concentration. Surface ocean pH has fallen by roughly 0.1 units since the industrial revolution, which on a logarithmic scale is about a 30% rise in hydrogen ion concentration.",
      "Those extra hydrogen ions consume carbonate ions to make bicarbonate, and carbonate is the raw material corals, molluscs and plankton use to build calcium carbonate shells. The organisms are not being dissolved by acid in any dramatic sense; they are being starved of a building block by a shifted equilibrium.",
      "This is also why the ocean is described as a carbon sink with a limit. Each additional tonne absorbed changes the buffer chemistry slightly, reducing the water's capacity to absorb the next one.",
    ],
    easyBody: [
      "When carbon dioxide dissolves in seawater, it reacts to form an acid, which releases hydrogen ions into the water. More CO₂ in the atmosphere means more of this reaction happening, and ocean pH has already dropped measurably since before the industrial revolution.",
      "Those extra hydrogen ions use up carbonate ions in the water — the same building block corals and shellfish need to build their shells. So it's less that these organisms are being \"dissolved by acid\" and more that they're running out of raw material to build with.",
      "The ocean has been absorbing a large share of human CO₂ emissions, but each extra bit absorbed makes it slightly harder for the ocean to absorb the next bit — it's a limited buffer, not an unlimited sponge.",
    ],
  },
  {
    tag: "Kinetics at home",
    title: "Why the fridge works, and why cooking is chemistry",
    lede: "Refrigeration and roasting are the same rate equation read in opposite directions.",
    body: [
      "Cooling food does not sterilise it. It slows the enzymatic and microbial reactions that spoil it, because a lower temperature leaves fewer molecules with enough energy to clear the activation barrier — the shaded region in the kinetics simulation shrinks. A rough rule of thumb from the Arrhenius relationship is that reaction rates roughly halve for every 10 °C drop, which is why a refrigerator buys days and a freezer buys months.",
      "Turn the dial the other way and the same principle browns a steak. The Maillard reaction between amino acids and reducing sugars has a high activation energy and effectively does not run at boiling temperatures in wet food, which is why boiled chicken stays pale and seared chicken does not. Drive the surface above roughly 140 °C and hundreds of new aroma compounds appear within minutes.",
      "Caramelisation is a separate pathway — sugar decomposing without protein involved — and pressure cooking is a third lever, raising the boiling point so that water-bound reactions finally reach useful temperatures.",
    ],
    easyBody: [
      "Cooling food doesn't kill microbes or stop chemical spoilage completely — it just slows those reactions down, because fewer molecules have enough energy to react at lower temperatures. As a rough rule, reaction rates roughly cut in half for every 10 °C you cool something down.",
      "Cooking does the same thing in reverse: heat speeds up the reaction between amino acids and sugars that browns and flavors food (the Maillard reaction), which is why a seared steak develops a completely different flavor than a boiled one — boiling water simply never gets hot enough for that reaction to happen quickly.",
    ],
  },
  {
    tag: "Buffers",
    title: "Your blood is a titration you never notice",
    lede: "A buffer keeps arterial pH between 7.35 and 7.45 while you sprint, sleep and digest.",
    body: [
      "The dominant system is carbonic acid and bicarbonate. When metabolism dumps acid into the blood, bicarbonate mops up hydrogen ions; when the blood drifts basic, carbonic acid releases them. That is precisely the flat buffer region you can drag through in the titration simulation, held near the pKa of the acid–base pair.",
      "What makes the biological version remarkable is that it is open. Excess carbonic acid is exhaled as CO₂ by the lungs within minutes, and the kidneys adjust bicarbonate over hours. A closed beaker eventually exhausts its buffer capacity and the pH collapses; a body vents one side of the equilibrium continuously.",
      "Failures of this system have familiar names. Hyperventilation blows off too much CO₂ and tips the blood basic — respiratory alkalosis — which is why breathing slowly into a smaller volume of air was once the standard advice. Uncontrolled diabetes produces ketoacids faster than the buffer and kidneys can clear them, giving ketoacidosis.",
    ],
    easyBody: [
      "Your blood stays within a very narrow pH range using a buffer — a pair of chemicals (carbonic acid and bicarbonate) that can soak up extra acid or release it to counteract a change, keeping pH steady even as your body constantly produces and consumes acids.",
      "What makes this system special is that it's constantly refreshed: your lungs breathe out excess acid, as CO₂, within minutes, and your kidneys adjust the buffer over hours — unlike a fixed buffer in a beaker, which eventually runs out of capacity.",
      "When this system is pushed too far — by breathing too fast, or by a condition like uncontrolled diabetes producing acid faster than the body can clear it — blood pH can shift dangerously, which is why both are taken seriously medically.",
    ],
  },
  {
    tag: "Policy",
    title: "The ozone layer, and the one time we fixed it",
    lede: "A radical chain reaction with a catalytic step is the reason a single chlorine atom mattered so much.",
    body: [
      "Chlorofluorocarbons were designed to be inert — that was the selling point for refrigerants and propellants. Inertness meant they survived long enough to drift into the stratosphere, where ultraviolet light finally split off a chlorine radical. That radical destroys an ozone molecule and is regenerated in the next step, so it is a catalyst in the strict sense: a single atom can take out tens of thousands of ozone molecules before it is scavenged.",
      "Polar stratospheric clouds make the Antarctic case worse by providing ice surfaces where inactive chlorine reservoirs convert back to active forms, which is why the depletion appears as a seasonal hole rather than a uniform thinning.",
      "The Montreal Protocol of 1987 phased out the compounds and is the most successful environmental treaty ever ratified. Stratospheric chlorine peaked in the late 1990s and the hole is now measurably shrinking, with full recovery projected around mid-century. It is a rare case study in which understanding a reaction mechanism translated directly into international policy that worked.",
    ],
    easyBody: [
      "Chlorofluorocarbons (CFCs) were designed to be extremely unreactive, which is exactly what let them survive long enough to drift up into the stratosphere, where sunlight finally broke them apart and released chlorine atoms.",
      "Each chlorine atom can destroy thousands of ozone molecules one after another without being used up itself — that's what makes it a catalyst, and why even a small amount of CFCs caused such a large amount of ozone damage.",
      "The Montreal Protocol, an international agreement to phase out CFCs, is widely considered one of the most successful environmental treaties ever signed — the ozone layer is now measurably recovering as a direct result.",
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
    question: "Why don't plastics like polyethylene break down quickly in the environment?",
    answer:
      "Their carbon-carbon bonds are extremely stable, and no microbes have evolved enzymes able to digest them.",
    explanation:
      "Instead of decomposing, plastics mostly just physically break into smaller and smaller pieces (microplastics) from sunlight and abrasion, rather than chemically breaking down.",
  },
  {
    question:
      "Rising atmospheric CO₂ is causing ocean pH to drop. What equilibrium concept explains this?",
    answer:
      "Le Chatelier's principle — adding more CO₂ shifts the CO₂/carbonic acid/bicarbonate equilibrium, producing more hydrogen ions and lowering pH.",
    explanation:
      "This is the same kind of equilibrium shift you'd force by adding a reactant in any Le Chatelier problem, just happening at an ocean-wide scale.",
  },
  {
    question: "Why does lowering a food's temperature slow down spoilage?",
    answer:
      "Fewer molecules have enough kinetic energy to overcome the activation energy barrier at lower temperatures, so reaction rates — including spoilage reactions — slow down.",
    explanation:
      "This follows directly from the same collision-theory reasoning used to explain reaction rates elsewhere: lower temperature means fewer high-energy collisions, so slower reactions.",
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
