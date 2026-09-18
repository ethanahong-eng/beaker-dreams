import type { TopicOverride } from "./types";
import { MolecularOrbitalSim } from "@/components/MolecularOrbitalSim";

export const bondingOverrides: Record<string, TopicOverride> = {
  "chemical-bonding": {
    easy: {
      significance: [
        "Almost everything about a substance — whether it is a gas or a rock, whether it dissolves in water, what temperature it melts at — comes down to what kind of bond holds its atoms together. There are two main kinds, and the difference between them is simply how fairly the bonding electrons are shared.",
        "The tool that decides which kind you have is electronegativity: a number for each element saying how strongly it pulls on shared electrons. Linus Pauling worked out the scale in 1932, and it is still the fastest way to predict what a bond will be like before you know anything else about the compound.",
      ],
      theory: [
        {
          heading: "Transfer or share",
          body: [
            "In an ionic bond, one atom takes an electron from another outright. The two atoms become oppositely charged ions and stick together by electrostatic attraction — this is what happens between a metal and a nonmetal, as in sodium chloride. In a covalent bond, two atoms share a pair of electrons instead, which is what happens between two nonmetals, as in Cl₂ or H₂O.",
            "These are not two separate categories so much as the two ends of one scale. A bond can be shared almost perfectly evenly, shared unevenly (a polar covalent bond, with a partial negative charge on one atom and a partial positive on the other), or so uneven that the electron is effectively transferred. Real bonds appear everywhere along that scale.",
          ],
        },
        {
          heading: "Electronegativity difference tells you where on the scale",
          body: [
            "Subtract the two electronegativities and use the difference, ΔEN, as a guide. Below about 0.4 the bond is nonpolar covalent; from 0.4 to about 1.7 it is polar covalent; above about 1.7 it is usually treated as ionic. These cutoffs are rough, not laws.",
            "Worked example. In NaCl, sodium is 0.93 and chlorine is 3.16, so ΔEN = 2.23 — ionic. In HCl, hydrogen is 2.20 and chlorine is 3.16, so ΔEN = 0.96 — polar covalent, with the chlorine end partly negative. In Cl₂ both atoms are 3.16, so ΔEN = 0 — nonpolar covalent, a perfectly even share.",
          ],
        },
        {
          heading: "Lattice energy: why ionic solids are so tough",
          body: [
            "Lattice energy is the energy released when gaseous ions come together to form a solid crystal, and it measures how strongly that crystal is held. It depends on two things: bigger ion charges mean a much stronger lattice, and smaller ions, which can sit closer together, also mean a stronger lattice. Charge matters more than size.",
            "Compare NaCl (Na⁺ and Cl⁻, lattice energy about 787 kJ/mol, melting point 801 °C) with MgO (Mg²⁺ and O²⁻, lattice energy about 3795 kJ/mol, melting point 2852 °C). Doubling both charges multiplies the attraction roughly fourfold, and the melting point more than triples. Lattice energy cannot be measured in one step, so chemists get it indirectly by adding up all the other steps in a Born–Haber cycle and using the fact that total energy has to balance.",
          ],
        },
        {
          heading: "Bond energy: breaking costs, forming pays",
          body: [
            "Breaking a bond always requires energy; forming one always releases it. A bond energy is the amount involved, tabulated in kJ/mol as an average over many molecules. You can estimate a reaction's enthalpy change by adding up the bonds broken and subtracting the bonds formed.",
            "Worked example: H₂ + Cl₂ → 2 HCl. Bonds broken: one H–H (436 kJ/mol) and one Cl–Cl (243 kJ/mol), total 679. Bonds formed: two H–Cl at 431 kJ/mol each, total 862. ΔH ≈ 679 − 862 = −183 kJ/mol, so the reaction is exothermic. The measured value is −185 kJ/mol, which is close — but remember these are averages, so this method gives an estimate rather than an exact answer.",
          ],
        },
      ],
      reviewQuestions: [
        {
          question:
            "Using electronegativities (K = 0.82, Br = 2.96), classify the bond in KBr and justify your answer.",
          answer: "Ionic, because ΔEN = 2.96 − 0.82 = 2.14, which is well above 1.7.",
          explanation:
            "A difference that large means bromine takes the electron essentially completely, giving K⁺ and Br⁻ held together electrostatically.",
        },
        {
          question: "Which has the higher lattice energy, NaF or MgO? Explain.",
          answer: "MgO, because its ions carry charges of 2+ and 2− rather than 1+ and 1−.",
          explanation:
            "Lattice energy scales with the product of the ion charges, so doubling both charges multiplies the attraction by about four — which is why MgO melts near 2850 °C and NaF near 990 °C.",
        },
        {
          question:
            "Estimate ΔH for H₂ + F₂ → 2 HF using bond energies: H–H = 436, F–F = 159, H–F = 567 kJ/mol.",
          answer: "About −539 kJ/mol.",
          explanation:
            "Bonds broken = 436 + 159 = 595 kJ/mol; bonds formed = 2 × 567 = 1134 kJ/mol; ΔH ≈ 595 − 1134 = −539 kJ/mol, strongly exothermic.",
        },
        {
          question:
            "Why do ionic compounds conduct electricity when molten or dissolved, but not as solids?",
          answer:
            "Conduction needs charged particles that can move. In the solid the ions are locked in the lattice; melting or dissolving frees them.",
          explanation:
            "The ions themselves carry the charge, so the compound conducts only once they are mobile — unlike a metal, where the electrons move and the solid conducts.",
        },
      ],
    },
  },
  "molecular-orbital-theory": {
    simulation: {
      heading: "Build a molecular orbital diagram from any two atoms",
      caption:
        "Pick two elements and a bond length: the diagram is built from real valence orbital energies and a numerically-solved secular equation, not drawn by hand. Click any level to see that exact molecular orbital's 3D shape — bonding, antibonding, σ or π.",
      render: () => <MolecularOrbitalSim />,
    },
    easy: {
      significance: [
        "A basic Lewis structure treats every bond as belonging to just two atoms and can't explain one of the most famous facts about oxygen: liquid O₂ is attracted to a magnet. Molecular orbital (MO) theory fixes this by treating a molecule's electrons as filling a whole new set of orbitals that belong to the molecule as a unit, not to any single bond.",
        "The reward for this shift is a simple, testable idea — combine atomic orbitals, fill the results the same way you'd fill atomic orbitals, and count electrons — that correctly predicts both how strong a bond is and whether a molecule is magnetic, in cases where drawing dots and lines gets the wrong answer.",
      ],
      theory: [
        {
          heading: "Combining atomic orbitals: bonding and antibonding",
          body: [
            'When two atomic orbitals combine, they produce two new molecular orbitals. Combining them "in phase" reinforces the electron density between the two nuclei, creating a lower-energy bonding orbital that holds the atoms together. Combining them "out of phase" cancels the density between the nuclei instead, leaving a node there and producing a higher-energy antibonding orbital (marked with an asterisk, like σ*) that pulls the atoms apart.',
            "Every pair of combining atomic orbitals produces exactly one bonding orbital and one antibonding orbital. Whether a molecule actually forms — and how strongly it's held together — depends entirely on which of these orbitals end up occupied by electrons.",
          ],
        },
        {
          heading: "Filling MOs and calculating bond order",
          body: [
            "Just like atomic orbitals, molecular orbitals fill from lowest energy to highest, one electron at a time before pairing up in orbitals of equal energy (Hund's rule). Bond order tells you how stable the resulting bond is: bond order = (bonding electrons − antibonding electrons) / 2.",
            "A higher bond order means a stronger, shorter bond. A bond order of zero means the bonding and antibonding electrons exactly cancel out — there's no net attraction holding the atoms together, which is why He₂ doesn't exist as a stable molecule.",
          ],
        },
        {
          heading: "The O₂ paramagnetism test",
          body: [
            "O₂ is the classic case where MO theory succeeds and a simple Lewis structure fails. A Lewis structure for O₂ pairs up every electron, predicting a molecule with no unpaired electrons (diamagnetic). But when O₂'s electrons are filled into molecular orbitals following Hund's rule, two electrons end up alone in a pair of equal-energy antibonding orbitals.",
            "Those two unpaired electrons are exactly why liquid oxygen is pulled toward a magnet (paramagnetic) — a real, easily demonstrated property that MO theory predicts correctly and a plain Lewis structure gets wrong. Counting O₂'s bonding and antibonding electrons this way still gives a bond order of 2, matching its measured double-bond strength.",
          ],
        },
      ],
      reviewQuestions: [
        {
          question:
            "A diatomic molecule has 4 electrons in bonding orbitals and 2 electrons in antibonding orbitals. What is its bond order?",
          answer: "1.",
          explanation:
            "Bond order = (bonding electrons − antibonding electrons) / 2 = (4 − 2) / 2 = 1, equivalent to a single bond.",
        },
        {
          question:
            "Why does molecular orbital theory correctly predict that O₂ is paramagnetic, while a standard Lewis structure does not?",
          answer:
            "A Lewis structure pairs all of O₂'s electrons, but filling O₂'s actual molecular orbitals places two electrons unpaired in degenerate antibonding orbitals, which is what makes it paramagnetic.",
          explanation:
            "Lewis structures can only show electrons as paired bonds or lone pairs, so they can't represent two electrons forced into separate, equal-energy orbitals by Hund's rule. MO theory fills real energy levels and shows this directly.",
        },
        {
          question:
            "If a hypothetical diatomic molecule has equal numbers of bonding and antibonding electrons, what does that predict?",
          answer: "It won't form as a stable molecule (bond order = 0).",
          explanation:
            "Equal bonding and antibonding electron counts give a bond order of (n − n) / 2 = 0, meaning there's no net stabilization holding the two atoms together — exactly why He₂ isn't a stable molecule.",
        },
        {
          question:
            "What happens to the energy of two atomic orbitals when they combine out of phase to form a molecular orbital?",
          answer:
            "Their energy increases, forming a higher-energy antibonding orbital with a node between the nuclei.",
          explanation:
            "Out-of-phase (destructive) combination cancels electron density between the two nuclei rather than reinforcing it, raising the orbital's energy above that of the original atomic orbitals.",
        },
        {
          question:
            "Between a molecule with bond order 1 and one with bond order 3 (from the same pair of elements), which has the stronger, shorter bond?",
          answer: "The one with bond order 3.",
          explanation:
            "Higher bond order means more net bonding character, which corresponds to a stronger and shorter bond — the same trend single, double, and triple bonds follow in simpler bonding models.",
        },
      ],
    },
  },
  polarity: {
    easy: {
      significance: [
        'Polarity is the reason oil and water separate, the reason salt dissolves and grease does not, and the reason soap can clean both. A polar molecule has a positive end and a negative end; a nonpolar one does not. Polar substances mix with polar substances and nonpolar with nonpolar — the rule chemists shorten to "like dissolves like."',
        "The catch is that a molecule built from polar bonds is not automatically polar itself. Whether it is depends on its shape, so this topic is as much a geometry question as a bonding one, and getting it right means drawing the molecule before answering.",
      ],
      theory: [
        {
          heading: "A polar bond has a positive end and a negative end",
          body: [
            "When two bonded atoms have different electronegativities, the shared electrons spend more time near the greedier atom. That atom carries a partial negative charge, written δ−, and the other carries a partial positive charge, δ+. The bond is then polar, and chemists draw an arrow along it pointing toward the δ− end.",
            "The size of that separation is called the dipole moment, measured in debyes (D). A bigger electronegativity difference gives a bigger bond dipole. H–F, with ΔEN = 1.78, is strongly polar; C–H, with ΔEN = 0.35, is barely polar at all.",
          ],
        },
        {
          heading: "Bond dipoles are arrows, and arrows can cancel",
          body: [
            "To decide whether the whole molecule is polar, add the bond arrows together the way you would add forces — as vectors, taking direction into account. If they cancel exactly, the molecule is nonpolar even though every bond in it is polar. If anything is left over, the molecule is polar.",
            "The shortcut: a molecule is nonpolar if its outer atoms are all the same and they are arranged symmetrically around the central atom, with no lone pairs on that central atom. Any lone pair, or any mismatched outer atom, breaks the symmetry and usually makes the molecule polar.",
          ],
        },
        {
          heading: "Worked comparison: CO₂ against H₂O",
          body: [
            "CO₂ is linear, with its two C=O bonds pointing in exactly opposite directions at 180°. The two bond dipoles are equal in size and opposite in direction, so they cancel completely, and the measured dipole moment of CO₂ is 0 D. It is nonpolar despite having two very polar bonds.",
            "H₂O has the same number of polar bonds but is bent at 104.5°, because oxygen carries two lone pairs. The two O–H dipoles point partly in the same direction and cannot cancel, so they add up to a measured 1.85 D. Same logic elsewhere: CCl₄ is tetrahedral and symmetric, so μ = 0; replace one chlorine with hydrogen to get CHCl₃ and the symmetry is broken, giving μ = 1.04 D. NH₃, pyramidal with a lone pair, comes in at 1.47 D.",
          ],
        },
        {
          heading: "Why polarity decides what dissolves",
          body: [
            "Polar molecules attract one another positive-end to negative-end. A polar solvent like water surrounds polar solutes and ions and pulls them apart into solution; it has no such grip on a nonpolar molecule, and squeezing one into the network costs more energy than it returns. Hexane, being nonpolar, does the reverse.",
            "This is why table salt and sugar dissolve in water while oil does not, why fat-soluble vitamins behave differently in the body from water-soluble ones, and why a soap molecule — polar at one end, nonpolar at the other — can bridge the two worlds and lift grease into water.",
          ],
        },
      ],
      reviewQuestions: [
        {
          question:
            "Both CO₂ and H₂O contain polar bonds, but only H₂O is a polar molecule. Explain.",
          answer:
            "CO₂ is linear, so its two bond dipoles point in opposite directions and cancel. H₂O is bent at 104.5°, so its two bond dipoles do not cancel and leave a net dipole of 1.85 D.",
          explanation:
            "Molecular polarity depends on shape as well as bond polarity — the same two polar bonds give a nonpolar molecule in one geometry and a polar one in another.",
        },
        {
          question: "Is BF₃ polar? Is NH₃? Both have three bonds to the central atom.",
          answer: "BF₃ is nonpolar; NH₃ is polar (1.47 D).",
          explanation:
            "BF₃ is trigonal planar with no lone pair on boron, so the three B–F dipoles are 120° apart and cancel. Nitrogen in NH₃ has a lone pair that pushes the molecule into a pyramid, so the N–H dipoles cannot cancel.",
        },
        {
          question:
            "Rank CCl₄, CHCl₃ and CH₂Cl₂ by increasing polarity, and say why CCl₄ sits where it does.",
          answer:
            "CCl₄ (0 D) < CHCl₃ (1.04 D) < CH₂Cl₂ (1.60 D). CCl₄ is perfectly tetrahedral with four identical outer atoms, so all four bond dipoles cancel.",
          explanation:
            "Swapping chlorines for hydrogens breaks the tetrahedral symmetry, so the C–Cl dipoles no longer have partners to cancel against and a net moment appears.",
        },
        {
          question:
            "Predict whether NaCl and I₂ will dissolve in water, and justify your prediction.",
          answer:
            "NaCl dissolves; I₂ barely does. Water is polar, so it attracts the ions of NaCl strongly and the nonpolar I₂ molecules weakly.",
          explanation:
            "Like dissolves like: water's dipoles surround and separate charged or polar particles, but have nothing to grip on a symmetric nonpolar molecule such as I₂, which dissolves far better in hexane.",
        },
      ],
    },
  },
  "intermolecular-forces": {
    easy: {
      significance: [
        "Intermolecular forces are the attractions between whole molecules, as opposed to the bonds inside them. They are much weaker than bonds, and they decide everything about a substance's physical behaviour: its boiling point, its melting point, how thick it is, how well it wets a surface.",
        "The clearest illustration is water. Judging by the pattern its chemical relatives follow, water ought to boil at about −80 °C. It boils at 100 °C, and the whole 180-degree gap comes from one especially strong intermolecular force called hydrogen bonding. Without it there would be no liquid water on Earth.",
      ],
      theory: [
        {
          heading: "Boiling breaks attractions between molecules, not bonds",
          body: [
            "When water boils, the H–O bonds inside each molecule stay exactly as they were. What breaks is the attraction holding one water molecule to the next. That is why boiling water takes a few tens of kJ/mol while actually breaking an O–H bond takes several hundred.",
            "So when a question asks why one substance boils higher than another, the answer is always about the forces between its molecules — never about the strength of the bonds inside them.",
          ],
        },
        {
          heading: "Three types, weakest to strongest",
          body: [
            "London dispersion forces act between every molecule without exception. Electrons are constantly moving, so at any instant a molecule's cloud is slightly lopsided; that momentary imbalance pulls on the neighbouring cloud, and the two stay in step. The effect grows with the size and softness of the electron cloud — more electrons, more loosely held, means a stronger force. Mass is only a rough stand-in for this.",
            "Dipole–dipole forces act only between polar molecules, lining up positive ends with negative ends, and are stronger than dispersion between molecules of similar size. Hydrogen bonding is the strongest of the three, but it only happens when a hydrogen is attached directly to N, O or F and there is a lone pair nearby to attract it. It is worth roughly 20 kJ/mol per bond in water, against a few kJ/mol for the others.",
          ],
        },
        {
          heading: "Dispersion in action: the halogens",
          body: [
            "All four halogens are nonpolar diatomic molecules, so dispersion is the only force they have. Going down the group the molecules get larger and their electron clouds looser, so dispersion gets stronger and the boiling point climbs: F₂ boils at −188 °C, Cl₂ at −34 °C, Br₂ at +59 °C and I₂ at +184 °C.",
            "That is why fluorine and chlorine are gases at room temperature, bromine is a liquid and iodine is a solid — one force, one variable, four different states of matter.",
          ],
        },
        {
          heading: "Hydrogen bonding and the boiling-point anomalies",
          body: [
            "Within a group, boiling points normally rise steadily as molecules get bigger. The group 14 hydrides do exactly that: CH₄ (−162 °C), SiH₄ (−112 °C), GeH₄ (−88 °C), SnH₄ (−52 °C). None of them can hydrogen bond, so dispersion alone sets the trend.",
            "Three groups break the pattern at the very first member, and only there. H₂S boils at −60 °C but H₂O at +100 °C; HCl at −85 °C but HF at +20 °C; PH₃ at −88 °C but NH₃ at −33 °C. In each case the first-row hydride has H attached to N, O or F and can hydrogen bond, which lifts it far above the line its heavier relatives follow. Water jumps the furthest because each molecule has two hydrogens to donate and two lone pairs to accept, so it can build a fully connected network — HF has only one hydrogen and NH₃ only one lone pair.",
          ],
        },
      ],
      reviewQuestions: [
        {
          question: "Rank CH₄, NH₃ and H₂O by increasing boiling point and explain the order.",
          answer:
            "CH₄ (−162 °C) < NH₃ (−33 °C) < H₂O (100 °C). CH₄ has only dispersion forces; NH₃ hydrogen bonds but has just one lone pair to accept with; H₂O has two donors and two acceptors and forms the strongest network.",
          explanation:
            "All three are small molecules of similar size, so dispersion is comparable. The differences come entirely from whether hydrogen bonding is possible and how many hydrogen bonds each molecule can make.",
        },
        {
          question:
            "HF (M = 20) boils at 20 °C while HCl (M = 36.5) boils at −85 °C. Why does the lighter molecule boil higher?",
          answer:
            "HF molecules hydrogen bond to one another; HCl molecules cannot, because chlorine is too large and not electronegative enough.",
          explanation:
            "Hydrogen bonding requires H attached to N, O or F, so it overrides the mass-based dispersion trend that would otherwise put HCl higher.",
        },
        {
          question: "Which intermolecular forces are present in CH₄, and which in CH₃OH?",
          answer:
            "CH₄ has London dispersion forces only. CH₃OH has dispersion, dipole–dipole and hydrogen bonding.",
          explanation:
            "CH₄ is nonpolar and has no H on N, O or F. Methanol's O–H group makes it polar and lets it hydrogen bond, which is why methanol is a liquid at room temperature and methane is a gas.",
        },
        {
          question: "Explain why I₂ is a solid at room temperature while F₂ is a gas.",
          answer:
            "I₂ has far more electrons in a much larger, more easily distorted cloud, so its London dispersion forces are much stronger.",
          explanation:
            "Both are nonpolar and have dispersion as their only intermolecular force, so the size of the electron cloud is the only variable — and it changes the boiling point from −188 °C to +184 °C.",
        },
        {
          question:
            "A student says that boiling water breaks the O–H bonds in the water molecules. Correct them.",
          answer:
            "Boiling breaks only the hydrogen bonds between water molecules; the O–H bonds inside each molecule stay intact.",
          explanation:
            "Steam is still H₂O. Vaporizing water costs about 41 kJ/mol, while breaking an O–H bond costs well over 400 kJ/mol — the two are not in the same range.",
        },
      ],
    },
  },
  "lewis-structures": {
    easy: {
      significance: [
        "A Lewis structure is a drawing that shows every valence electron in a molecule — which pairs are shared as bonds and which sit as lone pairs on individual atoms. It is the starting point for almost everything else: once you have the structure, you can predict the shape, the polarity and a good deal of the reactivity.",
        "Formal charge is the bookkeeping that goes with it. When a molecule can be drawn in more than one way, formal charge tells you which drawing is the better representation, and it is a standard AP task to compute it and use it to choose.",
      ],
      theory: [
        {
          heading: "Drawing the structure, step by step",
          body: [
            "Count all the valence electrons in the molecule, adding one for each negative charge and subtracting one for each positive charge. Put the least electronegative atom in the middle (never hydrogen, which only ever makes one bond), connect the outer atoms to it with single bonds, then hand out the remaining electrons as lone pairs, filling the outer atoms to eight first (two for hydrogen). If the central atom ends up short of eight, pull in a lone pair from an outer atom to make a double or triple bond.",
            "Worked example: CO₂. Carbon contributes 4 valence electrons and each oxygen 6, for 16 total. Carbon goes in the middle with a single bond to each oxygen, using 4. The remaining 12 go as lone pairs on the oxygens, filling them — but carbon now has only 4 electrons around it. Move one lone pair from each oxygen into the bond, and you get O=C=O, with two lone pairs left on each oxygen and a complete octet everywhere.",
          ],
        },
        {
          heading: "Formal charge, and what it is for",
          body: [
            "Formal charge on an atom = (its valence electrons) − (its lone-pair electrons) − ½(its bonding electrons). It assumes every shared pair is split exactly evenly, which is a convention rather than a measurement. The formal charges of all the atoms must add up to the overall charge of the species, which is a handy check on your arithmetic.",
            "Worked example. For O=C=O, each oxygen has 6 valence, 4 lone-pair and 4 bonding electrons, so FC = 6 − 4 − 2 = 0; carbon has 4 valence, 0 lone-pair and 8 bonding, so FC = 4 − 0 − 4 = 0. Every atom is zero. Now try the alternative drawing with one single and one triple bond: the single-bonded oxygen gets 6 − 6 − 1 = −1, the triple-bonded oxygen gets 6 − 2 − 3 = +1, and carbon stays at 0. Both drawings are legal, but the first has no charge separation at all, so it is the better structure.",
          ],
        },
        {
          heading: "Choosing between structures",
          body: [
            "When several structures satisfy the octet rule, prefer the one whose formal charges are closest to zero. If charges are unavoidable, put the negative formal charge on the most electronegative atom and the positive on the least, and keep like charges apart.",
            "Formal charge is not the same as oxidation state, even though both put a number on an atom. Oxidation state gives every shared pair entirely to the more electronegative atom; formal charge splits every pair down the middle. In CO they even come out with opposite signs, so it is worth checking which one a question is asking for.",
          ],
        },
        {
          heading: "When the octet rule breaks",
          body: [
            "Three kinds of exception come up regularly. Some atoms are content with fewer than eight: boron in BF₃ has only six, and beryllium in BeCl₂ only four, which is why both are aggressive electron-pair acceptors. Some molecules have an odd number of valence electrons, such as NO with eleven, so one electron has to be left unpaired no matter how you draw it.",
            "And some central atoms take more than eight — PCl₅ with ten, SF₆ with twelve. This only happens for elements in period 3 and beyond. The usual textbook reason is that those elements have empty d orbitals available, but modern calculations show the d orbitals contribute very little; the real picture involves bonding spread over three atoms at once. For AP purposes the rule to apply is the reliable part: period 2 elements are capped at eight, and period 3 and below are not.",
          ],
        },
      ],
      reviewQuestions: [
        {
          question: "How many valence electrons must be placed in the Lewis structure of SO₄²⁻?",
          answer: "32.",
          explanation:
            "Sulfur contributes 6 and each of the four oxygens 6, giving 30, plus 2 more for the 2− charge.",
        },
        {
          question:
            "In the Lewis structure of the nitrite ion NO₂⁻, drawn with one N=O double bond and one N–O single bond, what is the formal charge on the single-bonded oxygen?",
          answer: "−1.",
          explanation:
            "That oxygen has 6 valence electrons, 6 lone-pair electrons and 2 bonding electrons: FC = 6 − 6 − 1 = −1. The double-bonded oxygen is 0 and the nitrogen is 0, summing to the ion's −1 charge.",
        },
        {
          question:
            "Why can sulfur form SF₆ with twelve electrons around it, while oxygen cannot form OF₆?",
          answer:
            "Oxygen is a period 2 element and has only four valence orbitals available, which cap it at eight electrons. Sulfur is in period 3 and is not restricted this way.",
          explanation:
            "Sulfur is also larger, so six fluorines fit around it without crowding — a smaller period 2 atom could not accommodate them even if the electron count allowed it.",
        },
        {
          question:
            "Two Lewis structures for a molecule both satisfy the octet rule. One has formal charges of 0 on every atom; the other has +1 and −1 on adjacent atoms. Which is preferred, and why?",
          answer:
            "The one with all zeros, because structures with less charge separation are lower in energy and better represent the molecule.",
          explanation:
            "Separating charge costs energy, so the drawing that avoids it contributes more to the real structure. If charges cannot be avoided, the negative one should sit on the most electronegative atom.",
        },
      ],
    },
  },
  resonance: {
    easy: {
      significance: [
        "Some molecules cannot be drawn correctly with a single Lewis structure. Ozone is the standard case: one drawing gives it a single bond on one side and a double bond on the other, which predicts two different bond lengths — and measurement shows both bonds are identical.",
        "The fix is called resonance. You draw all the valid structures, and the real molecule is understood to be a blend of them rather than any one. That blend is not just a drawing convention: it makes the molecule genuinely more stable than any single structure suggests, and the extra stability can be measured in a calorimeter.",
      ],
      theory: [
        {
          heading: "When one drawing is not enough",
          body: [
            "Ozone, O₃, has 18 valence electrons. You can draw it with the double bond on the left or on the right, and there is no reason to prefer either. Both are legitimate Lewis structures with the same arrangement of atoms — only the electrons are placed differently. Chemists write them side by side connected by a double-headed arrow.",
            "The measurement settles the matter: both O–O bonds in ozone are 128 pm, in between a normal O–O single bond (148 pm) and a normal O=O double bond (121 pm). Each bond is about one and a half bonds, which is exactly what you get by averaging one single and one double.",
          ],
        },
        {
          heading: "The molecule does not flip back and forth",
          body: [
            "This is the most commonly missed point on the topic. Ozone does not spend half its time in one structure and half in the other. It is in one single state at all times, and that state — the resonance hybrid — is the average of the drawings. The individual structures are limitations of the drawing system, not things the molecule does.",
            "A useful comparison: a mule is not a horse some of the time and a donkey the rest of the time. It is one animal, all the time, that our two available words fail to describe on their own.",
          ],
        },
        {
          heading: "Worked example: the nitrate ion",
          body: [
            "NO₃⁻ has 24 valence electrons: nitrogen in the middle, three oxygens around it, and three equivalent structures depending on which oxygen carries the double bond. Averaging them gives each N–O linkage a bond order of 4/3, or about 1.33 — one double bond shared out among three positions.",
            "Measurement agrees: all three N–O bonds in nitrate are 124 pm, and the ion is a perfectly symmetric flat triangle. The same reasoning applies to carbonate CO₃²⁻ and to the carboxylate group in every organic acid, where the negative charge is spread over two oxygens equally rather than sitting on one.",
          ],
        },
        {
          heading: "Delocalization makes molecules more stable",
          body: [
            "Spreading electrons over more atoms lowers a molecule's energy, and the saving is called resonance or delocalization energy. Benzene, C₆H₆, is the famous case. Its six carbons form a ring, and the two Kekulé structures with alternating single and double bonds give way to a hybrid in which all six C–C bonds are identical at 139 pm — between a single bond (154 pm) and a double bond (134 pm).",
            "The stabilization is measurable. Adding hydrogen to one C=C in cyclohexene releases 120 kJ/mol, so three isolated double bonds should release about 360 kJ/mol. Benzene releases only 208 kJ/mol. The missing 150 kJ/mol is energy benzene never had to start with, because its electrons were already delocalized — and it is why benzene is so much less reactive than its formula suggests.",
          ],
        },
      ],
      reviewQuestions: [
        {
          question:
            "Ozone can be drawn with the double bond on either side. What does that predict about its two O–O bond lengths, and what is measured?",
          answer:
            "Resonance predicts both bonds are identical and intermediate between single and double. Both are measured at 128 pm, between the 148 pm of an O–O single bond and the 121 pm of an O=O double bond.",
          explanation:
            "Each bond has a bond order of about 1.5, the average of the one single and one double bond that the two contributing structures place there.",
        },
        {
          question: "What is the bond order of each N–O bond in the nitrate ion, NO₃⁻?",
          answer: "About 1.33 (4/3).",
          explanation:
            "Three resonance structures share one double bond and two single bonds among three identical positions: (1 + 1 + 2)/3 = 1.33, which is why all three bonds measure 124 pm.",
        },
        {
          question:
            "A student says that a molecule with two resonance structures rapidly alternates between them. Is this correct?",
          answer:
            "No. The molecule exists in one unchanging state, the resonance hybrid, which is a blend of the contributing structures.",
          explanation:
            "The separate structures are a shortcoming of Lewis notation, not something the molecule does in time. Nothing moves and nothing alternates.",
        },
        {
          question:
            "Why does benzene undergo substitution reactions rather than the addition reactions typical of alkenes?",
          answer:
            "Because its π electrons are delocalized around the whole ring, which makes it roughly 150 kJ/mol more stable than three isolated double bonds. Addition would destroy that delocalization.",
          explanation:
            "Substitution keeps the aromatic ring intact and preserves the stabilization, so it is energetically much cheaper than adding across a bond and breaking up the delocalized system.",
        },
        {
          question:
            "Two resonance structures are drawn for the same molecule. One has all formal charges at zero; the other has +1 on an oxygen and −1 on a carbon. Which contributes more to the hybrid?",
          answer: "The structure with all formal charges at zero.",
          explanation:
            "Lower charge separation means lower energy, so that structure resembles the real molecule more closely. Putting a positive charge on oxygen, the more electronegative atom, makes the second structure worse still.",
        },
      ],
    },
  },
};
