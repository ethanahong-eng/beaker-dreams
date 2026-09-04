import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

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
          "Learn hard chemistry topics through interactive simulations: molecular geometry, orbital hybridization, reaction kinetics and dynamic equilibrium.",
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
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
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

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background font-sans text-foreground selection:bg-accent/20">
        <nav className="sticky top-0 z-50 border-b border-border bg-background/95 px-6 py-5">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center border border-primary bg-primary font-display text-sm font-bold text-primary-foreground">
              V
            </span>
            <span className="font-display text-lg font-bold uppercase">
              Valence.lab
            </span>
          </Link>
          <div className="hidden items-center gap-7 text-[11px] font-bold uppercase text-muted-foreground md:flex">
            <Link
              to="/"
              className="border-b border-transparent py-1 transition-colors hover:border-primary hover:text-primary"
              activeProps={{ className: "border-primary text-primary" }}
              activeOptions={{ exact: true }}
            >
              Home
            </Link>
            <Link
              to="/geometry"
              className="border-b border-transparent py-1 transition-colors hover:border-primary hover:text-primary"
              activeProps={{ className: "border-primary text-primary" }}
            >
              Geometry
            </Link>
            <Link
              to="/hybridization"
              className="border-b border-transparent py-1 transition-colors hover:border-primary hover:text-primary"
              activeProps={{ className: "border-primary text-primary" }}
            >
              Hybridization
            </Link>
            <Link
              to="/kinetics"
              className="border-b border-transparent py-1 transition-colors hover:border-primary hover:text-primary"
              activeProps={{ className: "border-primary text-primary" }}
            >
              Kinetics
            </Link>
            <Link
              to="/equilibrium"
              className="border-b border-transparent py-1 transition-colors hover:border-primary hover:text-primary"
              activeProps={{ className: "border-primary text-primary" }}
            >
              Equilibrium
            </Link>
            <Link
              to="/everyday"
              className="border-b border-transparent py-1 transition-colors hover:border-primary hover:text-primary"
              activeProps={{ className: "border-primary text-primary" }}
            >
              Daily Life
            </Link>
          </div>
          <Link
            to="/geometry"
            className="border border-primary bg-primary px-5 py-2 text-[11px] font-bold uppercase text-primary-foreground transition-colors hover:bg-transparent hover:text-primary"
          >
            Launch Lab
          </Link>
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
              <Link to="/geometry" className="transition-colors hover:text-foreground">
                Geometry
              </Link>
              <Link to="/hybridization" className="transition-colors hover:text-foreground">
                Hybridization
              </Link>
              <Link to="/kinetics" className="transition-colors hover:text-foreground">
                Kinetics
              </Link>
              <Link to="/equilibrium" className="transition-colors hover:text-foreground">
                Equilibrium
              </Link>
              <Link to="/everyday" className="transition-colors hover:text-foreground">
                Daily Life
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}
