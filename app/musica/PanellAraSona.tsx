"use client";

import type { Canco, Lletra } from "./biblioteca";
import { LletraEnCurs } from "./LletraEnCurs";
import { IconaLletra } from "./icones";
import { TaulaDeMescles } from "./TaulaDeMescles";

type Props = {
  canco: Canco | null;
  caratulaUrl: string | null;
  lletra: Lletra | null;
  posicio: number;
  reproduint: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onSalta: (segons: number) => void;
  onLletra: () => void;
};

/**
 * El panell de la dreta a les pantalles amples: la cançó que sona, amb la
 * caràtula gran i la lletra avançant sola. A les estretes no es dibuixa; allà
 * l'espai és per a la llista.
 */
export function PanellAraSona({
  canco,
  caratulaUrl,
  lletra,
  posicio,
  reproduint,
  audioRef,
  onSalta,
  onLletra,
}: Props) {
  const teLletra = Boolean(lletra?.text.trim());

  return (
    <aside className="sticky top-6 hidden max-h-[calc(100vh-11rem)] flex-col rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-lg shadow-black/20 lg:flex">
      {/* Si la cançó porta caràtula, mana ella; si no (cap dels fitxers
          baixats de YouTube no en porta), hi ha la taula de mescles. */}
      <div className="flex aspect-square w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/[0.06] p-2 text-zinc-600">
        {caratulaUrl ? (
          // Blob del dispositiu: next/image no el pot optimitzar.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={caratulaUrl} alt="" className="-m-2 h-full w-full object-cover" />
        ) : (
          <TaulaDeMescles audioRef={audioRef} reproduint={reproduint} />
        )}
      </div>

      <div className="mt-3 shrink-0">
        <p className="truncate text-sm font-bold text-zinc-50">
          {canco ? canco.titol : "Cap cançó seleccionada"}
        </p>
        <p className="truncate text-xs text-zinc-400">
          {canco ? canco.artista : "Tria'n una de la llista"}
        </p>
        {canco?.album && <p className="truncate text-xs text-zinc-500">{canco.album}</p>}
      </div>

      {canco && (
        <>
          <div className="mt-3 min-h-0 flex-1 border-t border-white/10 pt-3">
            {teLletra && lletra ? (
              <LletraEnCurs lletra={lletra} posicio={posicio} mida="text-sm" onSalta={onSalta} />
            ) : (
              <div className="flex h-full min-h-24 flex-col items-center justify-center gap-2 text-center">
                <IconaLletra className="h-6 w-6 text-zinc-600" />
                <p className="text-xs text-zinc-500">Aquesta cançó encara no té lletra.</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onLletra}
            className="mt-3 shrink-0 rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-teal-400"
          >
            {teLletra ? "Karaoke" : "Afegeix la lletra"}
          </button>
        </>
      )}
    </aside>
  );
}
