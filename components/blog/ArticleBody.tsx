import type { Block } from "@/lib/blog";

export default function ArticleBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((b, i) => {
        if (b.type === "h2")
          return (
            <h2 key={i} className="pt-5 font-display text-2xl font-semibold tracking-tight text-ink">
              {b.text}
            </h2>
          );
        if (b.type === "p")
          return (
            <p key={i} className="text-[17px] leading-[1.75] text-ink-soft">
              {b.text}
            </p>
          );
        if (b.type === "ul")
          return (
            <ul key={i} className="space-y-2.5">
              {b.items.map((it, j) => (
                <li key={j} className="flex gap-3 text-[17px] leading-relaxed text-ink-soft">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          );
        if (b.type === "callout")
          return (
            <div
              key={i}
              className="rounded-2xl border border-line bg-paper px-5 py-4 text-[15px] leading-relaxed text-ink-soft"
            >
              {b.text}
            </div>
          );
        return null;
      })}
    </div>
  );
}
