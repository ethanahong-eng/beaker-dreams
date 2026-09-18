import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { topics as allTopics, unitsOf, type Topic } from "../lib/topics";
import { TopicLink } from "../components/TopicLink";

function BeakerLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 3h6M10 3v5.2L5.4 16.2A2 2 0 0 0 7.2 19h9.6a2 2 0 0 0 1.8-2.8L14 8.2V3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7.5 14h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M8.8 16.5c1.6-.6 3 .3 3.4.9.5.7 2 1.2 3.2.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Valence Lab — Interactive Chemistry Simulations" },
      {
        name: "description",
        content:
          "Learn chemistry from the atom up, at a college level: solving the Schrödinger equation, molecular geometry, orbital hybridization, reaction kinetics and dynamic equilibrium.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=Nunito+Sans:wght@400;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/** Which unit (if any) the current page belongs to, so its nav item can stay highlighted. */
function useActiveUnit(topics: Topic[]): string | undefined {
  const pathname = useLocation({ select: (loc) => loc.pathname });
  if (pathname.startsWith("/topic/")) {
    const slug = pathname.slice("/topic/".length);
    return topics.find((t) => t.slug === slug)?.unit;
  }
  return topics.find((t) => t.builtIn === pathname)?.unit;
}

function UnitNavItem({ unit, active, topics }: { unit: string; active: boolean; topics: Topic[] }) {
  const unitTopics = topics.filter((t) => t.unit === unit);
  const first = unitTopics[0];
  if (!first) return null;

  return (
    <div className="group relative">
      <TopicLink
        topic={first}
        className={`flex items-center gap-1.5 border-b py-1 transition-colors hover:border-primary hover:text-primary ${
          active ? "border-primary text-primary" : "border-transparent"
        }`}
      >
        {unit}
        <svg
          viewBox="0 0 10 6"
          className="h-2 w-2.5 fill-current opacity-60 transition-transform group-hover:-rotate-180"
          aria-hidden="true"
        >
          <path d="M0 0l5 6 5-6z" />
        </svg>
      </TopicLink>

      <div className="invisible absolute left-1/2 top-full -translate-x-1/2 pt-3 opacity-0 transition-opacity duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        <div className="w-64 border border-border bg-background p-2 shadow-lg">
          {unitTopics.map((t) => (
            <TopicLink
              key={t.slug}
              topic={t}
              className="block px-3 py-2.5 text-[11px] normal-case tracking-normal text-foreground transition-colors hover:bg-accent/10 hover:text-accent"
              activeProps={{ className: "bg-accent/10 text-accent" }}
            >
              <span className="mr-2 font-display text-accent">{t.index}</span>
              {t.title}
            </TopicLink>
          ))}
        </div>
      </div>
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const topics = allTopics;
  const units = unitsOf(topics);
  const activeUnit = useActiveUnit(topics);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background font-sans text-foreground selection:bg-accent/20">
        <nav className="sticky top-0 z-50 border-b border-border bg-background/95 px-6 py-5">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center border border-primary bg-primary text-primary-foreground">
                <BeakerLogo className="h-5 w-5" />
              </span>
              <span className="font-display text-lg font-bold uppercase">Valence.lab</span>
            </Link>
            <div className="hidden items-center gap-6 text-[11px] font-bold uppercase text-muted-foreground lg:flex">
              {units.map((unit) => (
                <UnitNavItem key={unit} unit={unit} active={unit === activeUnit} topics={topics} />
              ))}
            </div>
          </div>
        </nav>

        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />

        <footer className="mt-24 border-t border-border bg-background py-12">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 md:flex-row">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 border border-primary bg-primary" />
              <span className="font-display text-sm font-bold uppercase">
                Valence Laboratory © 2026
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold uppercase text-muted-foreground">
              <Link to="/" className="transition-colors hover:text-foreground">
                Home
              </Link>
              {units.map((unit) => (
                <TopicLink
                  key={unit}
                  topic={topics.find((t) => t.unit === unit)!}
                  className="transition-colors hover:text-foreground"
                >
                  {unit}
                </TopicLink>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}
