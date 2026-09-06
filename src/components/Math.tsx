import katex from "katex";
import { useMemo } from "react";

// Renders real typeset math via KaTeX's renderToString -- safe to call
// during SSR (no DOM access needed) unlike KaTeX's own auto-render, which
// requires a document. `inline` uses KaTeX's inline mode (no display
// centering/sizing); the default is display mode for standalone equations.
export function Math({ tex, inline = false }: { tex: string; inline?: boolean }) {
  const html = useMemo(
    () =>
      katex.renderToString(tex, {
        throwOnError: false,
        displayMode: !inline,
      }),
    [tex, inline],
  );
  const Tag = inline ? "span" : "div";
  return (
    <Tag
      className={inline ? "" : "overflow-x-auto py-1"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
