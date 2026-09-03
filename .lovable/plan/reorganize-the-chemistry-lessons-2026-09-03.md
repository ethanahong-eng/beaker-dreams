# Reorganize the Chemistry Lessons

## Goal

Restructure the Equilibrium, Kinetics, and Acid–Base pages so each follows the same learning sequence:

1. Significance — historical context, real-world consequences, and socio-economic relevance
2. Theory — concepts, equations, interpretation guidance, and misconceptions
3. Simulation — the existing interactive demo and its practical instructions

## Implementation

- Reorder the existing material on all three routes without changing simulation behavior.
- Add concise historical and socio-economic framing where the current content does not fully cover significance.
- Group theory content before each demo, including the existing “About this demo” explanations where appropriate.
- Place each interactive simulation last and keep its current controls and functionality intact.
- Use consistent semantic section headings and the established Valence Lab visual system.
- Update `roadmap.md` when the work is complete.

## Verification

- Check all three routes in the live preview.
- Confirm the visible section order is exactly Significance, Theory, Simulation.
- Confirm each simulation still renders and remains interactive.