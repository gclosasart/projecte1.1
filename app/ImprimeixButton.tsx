"use client";

export function ImprimeixButton({ text }: { text: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
    >
      {text}
    </button>
  );
}
