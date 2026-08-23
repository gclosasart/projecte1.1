import { getDict } from "@/lib/i18n";
import { InvitatForm } from "./InvitatForm";

export default async function InvitatPage() {
  const t = await getDict();

  return (
    <div className="flex flex-1 items-center justify-center bg-rose-50 dark:bg-black">
      <div className="w-full max-w-sm rounded-2xl border border-black/5 bg-white shadow-sm p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950 dark:shadow-none">
        <h1 className="text-2xl font-semibold text-rose-600 dark:text-rose-400">{t.invitat.titol}</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t.invitat.subtitol}</p>

        <InvitatForm textos={t.invitat} />
      </div>
    </div>
  );
}
