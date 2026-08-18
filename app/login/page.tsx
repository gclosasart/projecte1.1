import { getDict, getIdioma } from "@/lib/i18n";
import { LoginForm } from "./LoginForm";
import { SelectorIdioma } from "../SelectorIdioma";

export default async function LoginPage() {
  const idioma = await getIdioma();
  const t = await getDict();

  return (
    <div className="flex flex-1 items-center justify-center bg-sky-50 dark:bg-black">
      <div className="w-full max-w-sm rounded-xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-semibold text-sky-600 dark:text-indigo-400">
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
