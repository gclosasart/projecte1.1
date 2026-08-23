"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";
import type { Dict } from "@/lib/i18n";

const initialState: LoginState = { error: null };

export function LoginForm({ textos }: { textos: Dict["login"] }) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          {textos.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-rose-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          {textos.contrasenya}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-rose-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-rose-500"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:opacity-50 dark:bg-rose-500 dark:text-white dark:hover:bg-rose-400"
      >
        {pending ? textos.entrant : textos.entra}
      </button>
    </form>
  );
}
