import { useEffect, useState } from "react";
import { Math as MathBlock } from "@/components/Math";

type Step = { title: string; tex: string[]; narration: string };

// Solving the time-independent Schrodinger equation for hydrogen -- the one
// atom it can be solved for exactly -- step by step. Every equation here is
// the real derivation (not a simplified stand-in): the same separation of
// variables and boundary conditions that fix n, l and m_l in the
// atomic-orbitals lesson, worked through explicitly rather than asserted.
const STEPS: Step[] = [
  {
    title: "The equation to solve",
    tex: [
      "\\hat{H}\\psi = E\\psi",
      "\\hat{H} = -\\frac{\\hbar^2}{2m}\\nabla^2 - \\frac{e^2}{4\\pi\\varepsilon_0 r}",
    ],
    narration:
      "For hydrogen -- one electron, one proton, a pure Coulomb attraction -- this is the equation whose solutions are every orbital shape and every energy level the rest of this unit relies on.",
  },
  {
    title: "Rewrite the Laplacian in spherical coordinates",
    tex: [
      "\\nabla^2 = \\frac{1}{r^2}\\frac{\\partial}{\\partial r}\\!\\left(r^2\\frac{\\partial}{\\partial r}\\right) + \\frac{1}{r^2\\sin\\theta}\\frac{\\partial}{\\partial \\theta}\\!\\left(\\sin\\theta\\frac{\\partial}{\\partial \\theta}\\right) + \\frac{1}{r^2\\sin^2\\theta}\\frac{\\partial^2}{\\partial \\varphi^2}",
    ],
    narration:
      "Because the potential depends only on r, spherical coordinates (r, θ, φ) are the natural choice — the Laplacian looks more complicated here, but it now separates cleanly into a radial part and an angular part, which Cartesian coordinates never would.",
  },
  {
    title: "Assume a separable solution",
    tex: ["\\psi(r,\\theta,\\varphi) = R(r)\\,Y(\\theta,\\varphi)"],
    narration:
      "This is an ansatz — a guess about the form of the solution, not yet a physical claim. It's justified afterward: substituting it in actually produces two independent ordinary differential equations, one in r alone and one in (θ, φ) alone.",
  },
  {
    title: "Substitute and separate",
    tex: [
      "\\underbrace{\\frac{1}{R}\\frac{d}{dr}\\!\\left(r^2\\frac{dR}{dr}\\right) - \\frac{2mr^2}{\\hbar^2}\\big(V(r)-E\\big)}_{\\text{function of }r\\text{ only}} \\;=\\; \\underbrace{-\\frac{1}{Y}\\left[\\frac{1}{\\sin\\theta}\\frac{\\partial}{\\partial\\theta}\\!\\left(\\sin\\theta\\frac{\\partial Y}{\\partial \\theta}\\right)+\\frac{1}{\\sin^2\\theta}\\frac{\\partial^2 Y}{\\partial \\varphi^2}\\right]}_{\\text{function of }\\theta,\\varphi\\text{ only}}",
    ],
    narration:
      "Substituting ψ = RY into the full equation and dividing through, every term sorts onto one side depending only on r or only on (θ, φ). Two expressions in different variables can stay equal for every r, θ, φ only if both equal the same constant — call it l(l+1).",
  },
  {
    title: "The angular equation quantizes l and mₗ",
    tex: [
      "-\\frac{1}{\\sin\\theta}\\frac{\\partial}{\\partial\\theta}\\!\\left(\\sin\\theta\\frac{\\partial Y}{\\partial \\theta}\\right)-\\frac{1}{\\sin^2\\theta}\\frac{\\partial^2 Y}{\\partial \\varphi^2} = l(l+1)\\,Y",
      "Y_l^{m_l}(\\theta,\\varphi), \\quad l = 0,1,2,\\dots \\quad m_l = -l,\\dots,l",
    ],
    narration:
      "Solving this with the requirement that Y stay single-valued as φ increases by 2π forces l to be a non-negative integer and mₗ to be an integer between −l and l. The solutions are exactly the spherical harmonics from the orbital-shapes lesson.",
  },
  {
    title: "The radial equation quantizes n",
    tex: [
      "\\frac{1}{r^2}\\frac{d}{dr}\\!\\left(r^2\\frac{dR}{dr}\\right) + \\frac{2m}{\\hbar^2}\\left(E + \\frac{e^2}{4\\pi\\varepsilon_0 r} - \\frac{\\hbar^2 l(l+1)}{2mr^2}\\right)R = 0",
    ],
    narration:
      "The separation constant l(l+1) reappears as a centrifugal barrier term. Demanding R(r) stay finite everywhere and actually decay to zero as r → ∞ — a bound electron, not a free one — forces the principal quantum number n to be an integer with n > l.",
  },
  {
    title: "The result: quantized energy levels",
    tex: ["E_n = -\\frac{me^4}{8\\varepsilon_0^2 h^2 n^2} = -\\frac{13.6\\ \\text{eV}}{n^2}"],
    narration:
      "Solving the radial equation's boundary-value problem doesn't just quantize n — it pins down the exact energy at each n. Every hydrogen emission line Bohr's model could only fit empirically falls directly out of this one boundary condition.",
  },
  {
    title: "Putting it together",
    tex: ["\\psi_{n,l,m_l}(r,\\theta,\\varphi) = R_{n,l}(r)\\,Y_l^{m_l}(\\theta,\\varphi)"],
    narration:
      "Every orbital is one specific (n, l, mₗ) solution of this pair of equations. The shapes, nodes and energies explored throughout this unit aren't separate rules to memorize — they're all read directly off this one derivation.",
  },
];

const STEP_DURATION_MS = 6500;

/**
 * An animated, narrated step-through of solving the hydrogen atom's
 * Schrodinger equation -- playback controls like a video, but it's an
 * in-page equation-by-equation walkthrough, not a rendered video file.
 */
export function SchrodingerWalkthrough() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const step = STEPS[index]!;
  const isLast = index === STEPS.length - 1;

  useEffect(() => {
    if (!playing) return;
    if (isLast) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(
      () => setIndex((i) => Math.min(i + 1, STEPS.length - 1)),
      STEP_DURATION_MS,
    );
    return () => window.clearTimeout(timer);
  }, [playing, index, isLast]);

  const goTo = (i: number) => {
    setIndex(Math.max(0, Math.min(STEPS.length - 1, i)));
  };

  const togglePlay = () => {
    if (isLast) {
      setIndex(0);
      setPlaying(true);
      return;
    }
    setPlaying((p) => !p);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Animated walkthrough — solving the hydrogen atom
        </h3>
        <span className="font-mono text-[10px] text-muted-foreground">
          Step {index + 1} / {STEPS.length}
        </span>
      </div>

      <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-accent transition-all duration-300"
          style={{ width: `${((index + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-accent">
        {step.title}
      </p>
      <div className="my-4 space-y-3 rounded-lg border border-border bg-background p-5 text-foreground">
        {step.tex.map((t) => (
          <MathBlock key={t} tex={t} />
        ))}
      </div>
      <p className="min-h-[4.5rem] leading-relaxed text-muted-foreground">{step.narration}</p>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          className="rounded-full border border-border px-4 py-2 text-xs font-bold uppercase transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-30"
        >
          ← Back
        </button>
        <button
          onClick={togglePlay}
          className="rounded-full bg-primary px-6 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-accent"
        >
          {isLast ? "Replay" : playing ? "Pause" : "Play"}
        </button>
        <button
          onClick={() => goTo(index + 1)}
          disabled={isLast}
          className="rounded-full border border-border px-4 py-2 text-xs font-bold uppercase transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-30"
        >
          Next →
        </button>
      </div>

      <div className="mt-4 flex justify-center gap-1.5">
        {STEPS.map((s, i) => (
          <button
            key={s.title}
            onClick={() => {
              setPlaying(false);
              goTo(i);
            }}
            aria-label={`Go to step ${i + 1}`}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${
              i === index ? "bg-accent" : "bg-border hover:bg-muted-foreground"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
