import { getDict } from "@/lib/i18n";
import { InvitatForm } from "./InvitatForm";

export default async function InvitatPage() {
  const t = await getDict();

  return (
    <div className="flex flex-1 items-center justify-center bg-sky-50 dark:bg-black">
      <div className="w-full max-w-sm rounded-xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <h1 className="text-xl font-semibold text-sky-600 dark:text-indigo-400">{t.invitat.titol}</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t.invitat.subtitol}</p>

        <InvitatForm textos={t.invitat} />
      </div>
    </div>
  );
}
