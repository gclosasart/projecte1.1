"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Dict } from "@/lib/i18n";

export function InvitatForm({ textos: t }: { textos: Dict["invitat"] }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmacio, setConfirmacio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(t.errorCurta);
      return;
    }
    if (password !== confirmacio) {
      setError(t.errorNoCoincideixen);
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (updateError) {
      setError(t.errorEstablir);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {t.contrasenya}
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-teal-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmacio" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {t.confirmaContrasenya}
        </label>
        <input
          id="confirmacio"
          type="password"
          value={confirmacio}
          onChange={(e) => setConfirmacio(e.target.value)}
          autoComplete="new-password"
          required
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-teal-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-50 dark:bg-teal-500 dark:text-white dark:hover:bg-teal-400"
      >
        {pending ? t.desant : t.entra}
      </button>
    </form>
  );
}
