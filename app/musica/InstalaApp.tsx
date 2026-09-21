"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { IconaDescarrega } from "./icones";

// Chrome i Edge disparen aquest esdeveniment quan el lloc compleix els
// requisits d'instal·lació; no és estàndard, i per això no és als tipus del
// DOM. Safari (iOS i macOS) no el dispara mai: allà s'ha d'instal·lar a mà
// des del menú de compartir.
type EsdevenimentInstalacio = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Plataforma = "ios" | "android" | "escriptori";

// Llegides amb useSyncExternalStore i no amb un efecte: depenen del
// navegador, que al servidor no existeix, i així React les demana just quan
// toca en lloc de provocar una segona renderització.
const SENSE_CANVIS = () => () => {};

function llegeixPlataforma(): Plataforma {
  const agent = navigator.userAgent;
  // A l'iPad modern el navegador es fa passar per Mac; el tacte el delata.
  const esIOS =
    /iPad|iPhone|iPod/.test(agent) || (agent.includes("Macintosh") && navigator.maxTouchPoints > 1);
  if (esIOS) return "ios";
  return /Android/.test(agent) ? "android" : "escriptori";
}

function subscriuAFinestraApp(alCanviar: () => void) {
  const consulta = window.matchMedia("(display-mode: standalone)");
  consulta.addEventListener("change", alCanviar);
  return () => consulta.removeEventListener("change", alCanviar);
}

function obertaComAApp(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches;
}

export function InstalaApp() {
  const [peticio, setPeticio] = useState<EsdevenimentInstalacio | null>(null);
  const [acabadaInstallar, setAcabadaInstallar] = useState(false);
  const plataforma = useSyncExternalStore(SENSE_CANVIS, llegeixPlataforma, () => "escriptori" as Plataforma);
  const obertaComApp = useSyncExternalStore(subscriuAFinestraApp, obertaComAApp, () => false);
  const installada = obertaComApp || acabadaInstallar;

  useEffect(() => {
    const alPreparar = (event: Event) => {
      event.preventDefault(); // no mostris el bàner del navegador: ja tenim botó
      setPeticio(event as EsdevenimentInstalacio);
    };
    const alInstalar = () => {
      setAcabadaInstallar(true);
      setPeticio(null);
    };

    window.addEventListener("beforeinstallprompt", alPreparar);
    window.addEventListener("appinstalled", alInstalar);
    return () => {
      window.removeEventListener("beforeinstallprompt", alPreparar);
      window.removeEventListener("appinstalled", alInstalar);
    };
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // També en desenvolupament, perquè el reproductor es pugui instal·lar i
    // provar del tot executant l'app en local (a "localhost" el navegador
    // tracta la pàgina com a segura i ho permet). El paràmetre "dev" li diu
    // al service worker que no serveixi res de la memòria cau mentre hi hagi
    // xarxa: els fragments de Next.js canvien a cada recàrrega.
    const guio = process.env.NODE_ENV === "production" ? "/musica-sw.js" : "/musica-sw.js?dev=1";

    navigator.serviceWorker.register(guio, { scope: "/musica", updateViaCache: "none" }).catch(() => {
      // Sense service worker el reproductor segueix funcionant: només perd
      // poder obrir-se sense connexió.
    });
  }, []);

  if (installada) {
    return (
      <p className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-xs text-zinc-500 shadow-sm dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-400">
        Tens l&apos;app instal·lada al dispositiu. Un cop hi has afegit cançons, funciona sense connexió.
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-black/5 bg-white px-4 py-4 shadow-sm dark:border-white/10 dark:bg-zinc-950">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Instal·la l&apos;app</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {plataforma === "ios"
              ? "A l'iPhone i l'iPad: botó Compartir → «Afegeix a la pantalla d'inici»."
              : peticio
                ? "Queda't el reproductor com una app més, amb icona pròpia i sense barra del navegador."
                : plataforma === "android"
                  ? "Menú ⋮ del navegador → «Instal·la l'aplicació» o «Afegeix a la pantalla d'inici»."
                  : "Al Chrome o l'Edge: icona d'instal·lar a la dreta de la barra d'adreces."}
          </p>
        </div>

        {peticio && (
          <button
            type="button"
            onClick={async () => {
              await peticio.prompt();
              const { outcome } = await peticio.userChoice;
              if (outcome === "accepted") setAcabadaInstallar(true);
              setPeticio(null); // la petició només es pot fer servir un cop
            }}
            className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
          >
            <IconaDescarrega className="h-5 w-5" />
            Instal·la
          </button>
        )}
      </div>
    </div>
  );
}
