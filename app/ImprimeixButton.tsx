"use client";

export function ImprimeixButton({ text }: { text: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      aria-label={text}
      title={text}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-zinc-950 transition-colors hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M7 8.5V4h10v4.5M7 17.5H5.5A1.5 1.5 0 0 1 4 16v-4a1.5 1.5 0 0 1 1.5-1.5h13A1.5 1.5 0 0 1 20 12v4a1.5 1.5 0 0 1-1.5 1.5H17M7 13.5h10V20H7v-6.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
