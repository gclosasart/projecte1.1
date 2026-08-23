import Link from "next/link";

export function BackButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label="Enrere"
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-teal-600 shadow-sm transition-colors hover:bg-teal-50 dark:border-white/10 dark:bg-zinc-950 dark:text-teal-400 dark:hover:bg-zinc-900"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
        <path
          d="M19 12H5M11 18l-6-6 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
