import { createFileRoute } from "@tanstack/react-router";
import { SectionNav } from "@/components/SectionNav";
import { NextTopicNav } from "@/components/NextTopicNav";

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

const essays = [
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
  },
];

function EverydayPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <header className="mb-16 max-w-3xl border-b border-border pb-12">
        <div className="mb-5 inline-block border-y border-border px-4 py-2 text-[10px] font-bold uppercase text-accent">
          TOPIC 05: APPLIED CHEMISTRY
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
              {e.body.map((p) => (
                <p key={p.slice(0, 24)} className="leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>

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
