import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type SectionNavItem = {
  id: string;
  label: string;
};

export function SectionNav({ items }: { items: SectionNavItem[] }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-25% 0px -65% 0px" }
    );
    for (const { id } of items) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav
      aria-label="Page sections"
      className="fixed bottom-6 right-6 z-50 hidden w-44 rounded-2xl border border-border bg-card/90 p-4 shadow-xl backdrop-blur md:block"
    >
      <span className="mb-3 block font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
        On this page
      </span>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() =>
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              aria-current={active === item.id ? "true" : undefined}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors",
                active === item.id
                  ? "bg-accent/10 font-bold text-accent"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className="font-mono text-[10px]">{String(i + 1).padStart(2, "0")}</span>
              <span className="leading-snug">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
