import type { Level } from "@/lib/reviewContent";

// The same hand-rolled pill-tab pattern used for mode switches throughout
// this codebase (e.g. the SN1/SN2/E1/E2 tabs in MechanismExplorer3D, the
// orbital picker in OrbitalSim) -- reused here rather than the unused
// shadcn toggle-group primitive, to stay visually consistent with every
// other mode switch on the site.
export function ReviewLevelToggle({
  level,
  onChange,
}: {
  level: Level;
  onChange: (level: Level) => void;
}) {
  return (
    <div className="mb-10 flex flex-wrap gap-2">
      <button
        onClick={() => onChange("hard")}
        className={`rounded-full border px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest transition-colors ${
          level === "hard"
            ? "border-accent bg-accent/10 text-accent"
            : "border-border hover:bg-secondary"
        }`}
      >
        Deep Dive
      </button>
      <button
        onClick={() => onChange("easy")}
        className={`rounded-full border px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest transition-colors ${
          level === "easy"
            ? "border-accent bg-accent/10 text-accent"
            : "border-border hover:bg-secondary"
        }`}
      >
        AP Review
      </button>
    </div>
  );
}
