"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function InvitatPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmacio, setConfirmacio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contrasenya ha de tenir almenys 8 caràcters.");
      return;
    }
    if (password !== confirmacio) {
      setError("Les contrasenyes no coincideixen.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (updateError) {
      setError("No s'ha pogut establir la contrasenya. Torna a obrir l'enllaç de l'email.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-sky-50 dark:bg-black">
      <div className="w-full max-w-sm rounded-xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          Benvingut a l&apos;equip
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Estableix una contrasenya per accedir.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Contrasenya
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmacio" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Confirma la contrasenya
            </label>
            <input
              id="confirmacio"
              type="password"
              value={confirmacio}
              onChange={(e) => setConfirmacio(e.target.value)}
              autoComplete="new-password"
              required
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-sky-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-full bg-sky-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-50 dark:bg-indigo-500 dark:text-white dark:hover:bg-indigo-400"
          >
            {pending ? "Desant..." : "Entra"}
          </button>
        </form>
      </div>
    </div>
  );
}
