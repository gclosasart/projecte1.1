"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Lletra } from "./biblioteca";

type Props = {
  lletra: Lletra;
  posicio: number;
  /** Classes de mida del text, que canvien segons on es pinti. */
  mida: string;
  onSalta?: (segons: number) => void;
};

/**
 * La lletra que acompanya la cançó: si està sincronitzada, ressalta la línia
 * que sona i la manté centrada; si no, és text i prou. La fan servir tant el
 * karaoke a pantalla completa com el panell de l'escriptori.
 */
export function LletraEnCurs({ lletra, posicio, mida, onSalta }: Props) {
  const contenidor = useRef<HTMLDivElement>(null);
  const referencies = useRef<(HTMLParagraphElement | null)[]>([]);

  const linies = useMemo(() => lletra.text.split("\n"), [lletra.text]);
  // Els temps només valen si encaixen amb el text que hi ha ara.
  const temps = lletra.temps && lletra.temps.length === linies.length ? lletra.temps : null;

  // La línia que sona és la del temps més tardà que ja ha passat, no l'última
  // de la llista que hagi passat: si en sincronitzar-la se n'ha repetit alguna
  // fora d'ordre, així no es despista.
  const actual = useMemo(() => {
    if (!temps) return -1;
    let trobada = -1;
    let millor = -Infinity;
    for (let i = 0; i < temps.length; i += 1) {
      const quan = temps[i];
      if (typeof quan === "number" && quan <= posicio && quan >= millor) {
        millor = quan;
        trobada = i;
      }
    }
    return trobada;
  }, [temps, posicio]);

  // Es mou la caixa, i no scrollIntoView, que arrossegaria també la pàgina.
  useEffect(() => {
    const caixa = contenidor.current;
    const linia = referencies.current[actual];
    if (!caixa || !linia || actual < 0) return;
    caixa.scrollTo({
      top: linia.offsetTop - caixa.clientHeight / 2 + linia.offsetHeight / 2,
      behavior: "smooth",
    });
  }, [actual]);

  if (!temps) {
    return (
      <div ref={contenidor} className="relative h-full overflow-y-auto">
        <p className={`whitespace-pre-wrap text-center font-semibold leading-relaxed text-zinc-100 ${mida}`}>
          {lletra.text}
        </p>
      </div>
    );
  }

  return (
    <div ref={contenidor} className="relative h-full overflow-y-auto">
      {linies.map((linia, i) => (
        <p
          key={`${i}-${linia}`}
          ref={(element) => {
            referencies.current[i] = element;
          }}
          onClick={() => {
            const quan = temps[i];
            if (onSalta && typeof quan === "number") onSalta(quan);
          }}
          className={`py-1 text-center font-semibold leading-relaxed transition-colors ${mida} ${
            i === actual ? "text-teal-300" : "text-zinc-500"
          } ${onSalta ? "cursor-pointer" : ""}`}
        >
          {linia || " "}
        </p>
      ))}
    </div>
  );
}
