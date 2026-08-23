import { getDict, getIdioma } from "@/lib/i18n";
import { LoginForm } from "./LoginForm";
import { SelectorIdioma } from "../SelectorIdioma";

export default async function LoginPage() {
  const idioma = await getIdioma();
  const t = await getDict();

  return (
    <div className="flex flex-1 items-center justify-center bg-neutral-50 dark:bg-black">
      <div className="w-full max-w-sm rounded-2xl border border-black/5 bg-white shadow-sm p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
            {t.login.titol}
          </h1>
          <SelectorIdioma actual={idioma} textos={t.comu.idiomes} />
        </div>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t.login.subtitol}</p>

        <div className="mt-6">
          <LoginForm textos={t.login} />
        </div>
      </div>
    </div>
  );
}
