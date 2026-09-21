"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buidaBiblioteca,
  demanaEmmagatzematgePersistent,
  desaCanco,
  esborraCanco,
  espaiUsat,
  llistaCancons,
  obtenAudio,
  obtenCaratula,
  ordenaCancons,
  type Canco,
} from "./biblioteca";
import { etiquetesDelNom, llegeixDurada, llegeixEtiquetes } from "./etiquetes";
import { formatMida } from "./format";
import { BarraReproduccio } from "./BarraReproduccio";
import { InstalaApp } from "./InstalaApp";
import { LlistaCancons } from "./LlistaCancons";
import { IconaCarpeta, IconaCerca, IconaMes, IconaNota } from "./icones";
import type { Repeticio } from "./tipus";

// Hi ha navegadors que no omplen el tipus MIME dels fitxers triats, així que
// el nom també compta com a prova que allò és música.
const EXTENSIONS_AUDIO = /\.(mp3|m4a|m4b|mp4|aac|ogg|oga|opus|wav|flac|webm|weba|aiff?)$/i;
const CLAU_PREFERENCIES = "musica:preferencies";

type Preferencies = {
  volum: number;
  barreja: boolean;
  repeticio: Repeticio;
  darrera: string | null;
};

export function Reproductor() {
  const [cancons, setCancons] = useState<Canco[]>([]);
  const [carregant, setCarregant] = useState(true);
  const [cerca, setCerca] = useState("");
  const [idActual, setIdActual] = useState<string | null>(null);
  const [reproduint, setReproduint] = useState(false);
  const [posicio, setPosicio] = useState(0);
  const [durada, setDurada] = useState(0);
  const [volum, setVolum] = useState(1);
  const [barreja, setBarreja] = useState(false);
  const [llavor, setLlavor] = useState(1);
  const [repeticio, setRepeticio] = useState<Repeticio>("cap");
  const [progres, setProgres] = useState<{ fets: number; total: number } | null>(null);
  const [avis, setAvis] = useState<string | null>(null);
  const [caratulaUrl, setCaratulaUrl] = useState<string | null>(null);
  const [espai, setEspai] = useState<{ usat: number; disponible: number } | null>(null);
  const [arrossegant, setArrossegant] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const urlAudio = useRef<string | null>(null);
  const urlCaratula = useRef<string | null>(null);
  const reprodueixEnCarregar = useRef(false);
  const preferenciesLlestes = useRef(false);
  const inputFitxers = useRef<HTMLInputElement>(null);
  const inputCarpeta = useRef<HTMLInputElement>(null);

  const cancoActual = useMemo(
    () => cancons.find((canco) => canco.id === idActual) ?? null,
    [cancons, idActual],
  );

  const visibles = useMemo(() => {
    const text = cerca.trim().toLowerCase();
    if (!text) return cancons;
    return cancons.filter((canco) =>
      `${canco.titol} ${canco.artista} ${canco.album} ${canco.nomFitxer}`.toLowerCase().includes(text),
    );
  }, [cancons, cerca]);

  // Ordre en què sonaran les cançons: el de la llista que es veu, barrejat si
  // cal. La llavor fa que la barreja sigui sempre la mateixa mentre no es
  // torni a activar el botó, perquè "anterior" torni on tocava.
  const ordre = useMemo(() => {
    const ids = visibles.map((canco) => canco.id);
    return barreja ? barrejaAmbLlavor(ids, llavor) : ids;
  }, [visibles, barreja, llavor]);

  const refrescaEspai = useCallback(() => {
    espaiUsat().then(setEspai);
  }, []);

  // Càrrega inicial de la biblioteca i de les preferències.
  useEffect(() => {
    let viu = true;
    (async () => {
      try {
        const desades = await llistaCancons();
        if (!viu) return;
        setCancons(desades);

        const preferencies = llegeixPreferencies();
        if (preferencies) {
          setVolum(preferencies.volum);
          setBarreja(preferencies.barreja);
          setRepeticio(preferencies.repeticio);
          if (preferencies.darrera && desades.some((canco) => canco.id === preferencies.darrera)) {
            // Es deixa a punt, però no sona fins que algú ho demana: cap
            // navegador no deixa arrencar so sol, i tampoc seria agradable.
            setIdActual(preferencies.darrera);
          }
        }
      } catch (error) {
        if (viu) setAvis(missatge(error));
      } finally {
        preferenciesLlestes.current = true;
        if (viu) setCarregant(false);
      }
      refrescaEspai();
    })();
    return () => {
      viu = false;
    };
  }, [refrescaEspai]);

  useEffect(() => {
    // Fins que no s'han llegit les preferències desades, no se'n desen de
    // noves: si no, la primera renderització (encara sense cançó triada)
    // esborraria quina sonava l'últim cop.
    if (!preferenciesLlestes.current) return;
    try {
      const preferencies: Preferencies = { volum, barreja, repeticio, darrera: idActual };
      localStorage.setItem(CLAU_PREFERENCIES, JSON.stringify(preferencies));
    } catch {
      // Mode privat o emmagatzematge ple: no passa res, són preferències.
    }
  }, [volum, barreja, repeticio, idActual]);

  // Carrega el so de la cançó triada des d'IndexedDB.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!idActual) {
      audio.removeAttribute("src");
      return;
    }

    let cancelat = false;
    const volReproduir = reprodueixEnCarregar.current;
    reprodueixEnCarregar.current = false;

    (async () => {
      try {
        const [so, portada] = await Promise.all([obtenAudio(idActual), obtenCaratula(idActual)]);
        if (cancelat) return;
        if (!so) {
          setAvis("No s'ha trobat el fitxer d'aquesta cançó al dispositiu.");
          return;
        }

        if (urlAudio.current) URL.revokeObjectURL(urlAudio.current);
        urlAudio.current = URL.createObjectURL(so);
        audio.src = urlAudio.current;
        audio.load();

        if (urlCaratula.current) URL.revokeObjectURL(urlCaratula.current);
        urlCaratula.current = portada ? URL.createObjectURL(portada) : null;
        setCaratulaUrl(urlCaratula.current);
        setPosicio(0);

        if (volReproduir) {
          try {
            await audio.play();
          } catch {
            setReproduint(false);
          }
        }
      } catch (error) {
        if (!cancelat) setAvis(missatge(error));
      }
    })();

    return () => {
      cancelat = true;
    };
  }, [idActual]);

  // Allibera les URL temporals dels blobs en marxar de la pàgina.
  useEffect(
    () => () => {
      if (urlAudio.current) URL.revokeObjectURL(urlAudio.current);
      if (urlCaratula.current) URL.revokeObjectURL(urlCaratula.current);
    },
    [],
  );

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volum;
  }, [volum]);

  const salta = useCallback((segons: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = segons;
    setPosicio(segons);
  }, []);

  const alterna = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!idActual) {
      if (ordre.length) {
        reprodueixEnCarregar.current = true;
        setIdActual(ordre[0]);
      }
      return;
    }
    if (audio.paused) audio.play().catch(() => setReproduint(false));
    else audio.pause();
  }, [idActual, ordre]);

  const vesA = useCallback(
    (desplacament: number, automatic = false) => {
      if (!ordre.length) return;
      const actual = idActual ? ordre.indexOf(idActual) : -1;
      let desti = actual === -1 ? 0 : actual + desplacament;

      if (desti >= ordre.length) {
        // En acabar la llista sola, només torna a començar si s'ha demanat
        // repetir-ho tot; si el salt l'ha demanat una persona, sempre dona la volta.
        if (automatic && repeticio !== "tot") {
          setReproduint(false);
          return;
        }
        desti = 0;
      }
      if (desti < 0) desti = ordre.length - 1;

      const id = ordre[desti];
      reprodueixEnCarregar.current = true;
      if (id === idActual) {
        const audio = audioRef.current;
        if (audio) {
          audio.currentTime = 0;
          audio.play().catch(() => setReproduint(false));
        }
        reprodueixEnCarregar.current = false;
        return;
      }
      setIdActual(id);
    },
    [ordre, idActual, repeticio],
  );

  const seguent = useCallback((automatic = false) => vesA(1, automatic), [vesA]);

  const anterior = useCallback(() => {
    const audio = audioRef.current;
    // Costum de tota la vida: si la cançó ja ha avançat, "anterior" la torna
    // a començar en lloc de canviar-la.
    if (audio && audio.currentTime > 3) {
      salta(0);
      return;
    }
    vesA(-1);
  }, [salta, vesA]);

  const triaCanco = useCallback(
    (id: string) => {
      if (id === idActual) {
        alterna();
        return;
      }
      reprodueixEnCarregar.current = true;
      setIdActual(id);
    },
    [alterna, idActual],
  );

  // Controls del sistema: pantalla de bloqueig, auriculars, cotxe...
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    if (!cancoActual) {
      navigator.mediaSession.metadata = null;
      return;
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title: cancoActual.titol,
      artist: cancoActual.artista,
      album: cancoActual.album || undefined,
      artwork: caratulaUrl
        ? [{ src: caratulaUrl, sizes: "512x512" }]
        : [{ src: "/musica/icona-512.png", sizes: "512x512", type: "image/png" }],
    });
  }, [cancoActual, caratulaUrl]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const accions: [MediaSessionAction, MediaSessionActionHandler][] = [
      ["play", () => audioRef.current?.play()],
      ["pause", () => audioRef.current?.pause()],
      ["previoustrack", () => anterior()],
      ["nexttrack", () => seguent()],
      [
        "seekto",
        (detalls) => {
          if (typeof detalls.seekTime === "number") salta(detalls.seekTime);
        },
      ],
    ];

    for (const [accio, gestor] of accions) {
      try {
        navigator.mediaSession.setActionHandler(accio, gestor);
      } catch {
        // Hi ha accions que algun navegador no admet; les altres sí.
      }
    }
    return () => {
      for (const [accio] of accions) {
        try {
          navigator.mediaSession.setActionHandler(accio, null);
        } catch {
          // Igual que abans.
        }
      }
    };
  }, [anterior, salta, seguent]);

  // Barra espaiadora per posar en marxa i aturar, com a qualsevol reproductor.
  useEffect(() => {
    const alPremer = (event: KeyboardEvent) => {
      if (event.code !== "Space") return;
      const origen = event.target as HTMLElement | null;
      const etiqueta = origen?.tagName;
      if (etiqueta === "INPUT" || etiqueta === "TEXTAREA" || etiqueta === "BUTTON") return;
      event.preventDefault();
      alterna();
    };
    window.addEventListener("keydown", alPremer);
    return () => window.removeEventListener("keydown", alPremer);
  }, [alterna]);

  const importa = useCallback(
    async (fitxers: File[]) => {
      const candidats = fitxers.filter(
        (fitxer) => fitxer.type.startsWith("audio/") || EXTENSIONS_AUDIO.test(fitxer.name),
      );
      if (!candidats.length) {
        setAvis("Aquests fitxers no són cançons. Tria fitxers d'àudio (mp3, m4a, flac, ogg, wav...).");
        return;
      }

      setAvis(null);
      setProgres({ fets: 0, total: candidats.length });
      await demanaEmmagatzematgePersistent();

      const jaHiSon = new Set(cancons.map((canco) => `${canco.nomFitxer}:${canco.mida}`));
      const noves: Canco[] = [];
      let repetides = 0;
      let fallades = 0;

      for (const fitxer of candidats) {
        const empremta = `${fitxer.name}:${fitxer.size}`;
        if (jaHiSon.has(empremta)) {
          repetides += 1;
        } else {
          jaHiSon.add(empremta);
          try {
            const [etiquetes, duradaFitxer] = await Promise.all([
              llegeixEtiquetes(fitxer),
              llegeixDurada(fitxer),
            ]);
            const delNom = etiquetesDelNom(fitxer.name);
            const canco: Canco = {
              id: identificador(),
              nomFitxer: fitxer.name,
              titol: etiquetes.titol || delNom.titol,
              artista: etiquetes.artista || delNom.artista || "Artista desconegut",
              album: etiquetes.album || "",
              durada: duradaFitxer,
              mida: fitxer.size,
              tipus: fitxer.type || "audio/mpeg",
              teCaratula: Boolean(etiquetes.caratula),
              afegit: Date.now(),
            };
            await desaCanco(canco, fitxer, etiquetes.caratula);
            noves.push(canco);
          } catch (error) {
            fallades += 1;
            setAvis(missatge(error));
          }
        }
        setProgres((anterior) => (anterior ? { ...anterior, fets: anterior.fets + 1 } : anterior));
      }

      if (noves.length) setCancons((previes) => ordenaCancons([...previes, ...noves]));
      setProgres(null);
      refrescaEspai();

      const parts: string[] = [];
      if (noves.length) parts.push(`${noves.length} ${noves.length === 1 ? "cançó afegida" : "cançons afegides"}`);
      if (repetides) parts.push(`${repetides} ja hi ${repetides === 1 ? "era" : "eren"}`);
      if (fallades) parts.push(`${fallades} no s'${fallades === 1 ? "ha" : "han"} pogut desar`);
      if (parts.length) setAvis(`${parts.join(", ")}.`);
    },
    [cancons, refrescaEspai],
  );

  const treu = useCallback(
    async (canco: Canco) => {
      if (!window.confirm(`Vols treure «${canco.titol}» d'aquest dispositiu?`)) return;
      try {
        await esborraCanco(canco.id);
        setCancons((previes) => previes.filter((altra) => altra.id !== canco.id));
        if (canco.id === idActual) {
          audioRef.current?.pause();
          setIdActual(null);
          setPosicio(0);
          setDurada(0);
        }
        refrescaEspai();
      } catch (error) {
        setAvis(missatge(error));
      }
    },
    [idActual, refrescaEspai],
  );

  const buida = useCallback(async () => {
    if (!window.confirm("Vols esborrar tota la biblioteca d'aquest dispositiu? Els fitxers originals no es toquen.")) {
      return;
    }
    try {
      await buidaBiblioteca();
      audioRef.current?.pause();
      setCancons([]);
      setIdActual(null);
      setPosicio(0);
      setDurada(0);
      setAvis(null);
      refrescaEspai();
    } catch (error) {
      setAvis(missatge(error));
    }
  }, [refrescaEspai]);

  // El selector de carpeta és un atribut no estàndard, i React no el coneix.
  useEffect(() => {
    inputCarpeta.current?.setAttribute("webkitdirectory", "");
  }, []);

  const desDelInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fitxers = Array.from(event.target.files ?? []);
    event.target.value = ""; // per poder tornar a triar els mateixos fitxers
    if (fitxers.length) void importa(fitxers);
  };

  const totalMida = cancons.reduce((total, canco) => total + canco.mida, 0);

  return (
    <div className="flex flex-1 flex-col bg-estudi">
      <header className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
        <p className="text-xs font-medium uppercase tracking-wide text-teal-400">Reproductor</p>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50">Música</h1>
        <p className="mt-1 text-sm text-zinc-300">
          Les cançons que ja tens descarregades, desades en aquest dispositiu i a punt per sonar sense connexió.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 pb-8 sm:px-6">
        <InstalaApp />

        {avis && (
          <div className="flex items-start justify-between gap-3 rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            <p>{avis}</p>
            <button
              type="button"
              onClick={() => setAvis(null)}
              className="shrink-0 text-xs font-semibold uppercase tracking-wide text-amber-300 hover:text-amber-100"
            >
              Entesos
            </button>
          </div>
        )}

        <section
          onDragOver={(event) => {
            event.preventDefault();
            setArrossegant(true);
          }}
          onDragLeave={() => setArrossegant(false)}
          onDrop={(event) => {
            event.preventDefault();
            setArrossegant(false);
            const fitxers = Array.from(event.dataTransfer.files ?? []);
            if (fitxers.length) void importa(fitxers);
          }}
          className={`rounded-2xl border px-4 py-4 shadow-lg shadow-black/20 transition-colors sm:px-6 ${
            arrossegant ? "border-teal-400 bg-teal-400/15" : "border-white/10 bg-white/[0.06]"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-50">La teva biblioteca</h2>
              <p className="text-xs text-zinc-400">
                {carregant
                  ? "Carregant…"
                  : `${cancons.length} ${cancons.length === 1 ? "cançó" : "cançons"} · ${formatMida(totalMida)}`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => inputFitxers.current?.click()}
                className="inline-flex items-center gap-2 rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-sm transition-colors hover:bg-teal-400"
              >
                <IconaMes className="h-5 w-5" />
                Afegeix cançons
              </button>
              <button
                type="button"
                onClick={() => inputCarpeta.current?.click()}
                className="hidden items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:bg-white/10 sm:inline-flex"
              >
                <IconaCarpeta className="h-5 w-5" />
                Una carpeta
              </button>
            </div>
          </div>

          <input
            ref={inputFitxers}
            type="file"
            accept="audio/*,.mp3,.m4a,.aac,.flac,.ogg,.oga,.opus,.wav"
            multiple
            onChange={desDelInput}
            className="hidden"
          />
          <input ref={inputCarpeta} type="file" multiple onChange={desDelInput} className="hidden" />

          {progres && (
            <div className="mt-4">
              <p className="text-xs text-zinc-400">
                Afegint cançons… {progres.fets} de {progres.total}
              </p>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-teal-400 transition-all"
                  style={{ width: `${Math.round((progres.fets / progres.total) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {cancons.length > 0 && (
            <div className="relative mt-4">
              <IconaCerca className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
              <input
                type="search"
                value={cerca}
                onChange={(event) => setCerca(event.target.value)}
                placeholder="Cerca per títol, artista o àlbum"
                aria-label="Cerca a la biblioteca"
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] py-2 pl-11 pr-3 text-sm text-zinc-50 outline-none transition-colors placeholder:text-zinc-500 focus:border-teal-400"
              />
            </div>
          )}

          <div className="mt-2">
            {carregant ? null : cancons.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
                <IconaNota className="h-10 w-10 text-teal-400" />
                <p className="text-sm font-semibold text-zinc-50">Encara no hi ha cap cançó</p>
                <p className="max-w-sm text-xs text-zinc-400">
                  Afegeix fitxers d&apos;àudio del teu dispositiu (o arrossega&apos;ls aquí, si ets a l&apos;ordinador).
                  Es queden desats aquí dins: no es pugen enlloc.
                </p>
              </div>
            ) : visibles.length === 0 ? (
              <p className="px-2 py-8 text-center text-sm text-zinc-400">
                Cap cançó coincideix amb «{cerca}».
              </p>
            ) : (
              <LlistaCancons
                cancons={visibles}
                idActual={idActual}
                reproduint={reproduint}
                onTria={triaCanco}
                onEsborra={treu}
              />
            )}
          </div>

          {cancons.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs text-zinc-400">
              <span>
                {espai
                  ? `${formatMida(espai.usat)} ocupats en aquest dispositiu${
                      espai.disponible ? ` de ${formatMida(espai.disponible)} disponibles` : ""
                    }`
                  : "Desat en aquest dispositiu"}
              </span>
              <button type="button" onClick={buida} className="font-semibold text-red-400 hover:text-red-300">
                Esborra-ho tot
              </button>
            </div>
          )}
        </section>
      </main>

      <BarraReproduccio
        canco={cancoActual}
        caratulaUrl={caratulaUrl}
        reproduint={reproduint}
        posicio={posicio}
        durada={durada}
        volum={volum}
        barreja={barreja}
        repeticio={repeticio}
        onAlterna={alterna}
        onAnterior={anterior}
        onSeguent={() => seguent()}
        onSalta={salta}
        onVolum={setVolum}
        onBarreja={() => {
          setBarreja((actiu) => !actiu);
          setLlavor(Math.floor(Math.random() * 2147483647) + 1);
        }}
        onRepeticio={() =>
          setRepeticio((actual) => (actual === "cap" ? "tot" : actual === "tot" ? "una" : "cap"))
        }
      />

      <audio
        ref={audioRef}
        onPlay={() => setReproduint(true)}
        onPause={() => setReproduint(false)}
        onEnded={() => {
          if (repeticio === "una") {
            const audio = audioRef.current;
            if (audio) {
              audio.currentTime = 0;
              audio.play().catch(() => setReproduint(false));
            }
            return;
          }
          seguent(true);
        }}
        onTimeUpdate={(event) => setPosicio(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => {
          const duradaReal = event.currentTarget.duration;
          if (!Number.isFinite(duradaReal) || duradaReal <= 0) return;
          setDurada(duradaReal);
          // Si en importar no es va poder llegir la durada, aprofita ara que
          // el navegador ja l'ha calculada i desa-la.
          if (cancoActual && !cancoActual.durada) {
            const actualitzada = { ...cancoActual, durada: duradaReal };
            setCancons((previes) =>
              previes.map((canco) => (canco.id === actualitzada.id ? actualitzada : canco)),
            );
            obtenAudio(actualitzada.id).then((so) => {
              if (so) void desaCanco(actualitzada, so);
            });
          }
        }}
        onError={() => {
          setReproduint(false);
          if (idActual) setAvis("Aquest navegador no sap reproduir el format d'aquesta cançó.");
        }}
      />
    </div>
  );
}

function llegeixPreferencies(): Preferencies | null {
  try {
    const desades = localStorage.getItem(CLAU_PREFERENCIES);
    if (!desades) return null;
    const dades = JSON.parse(desades) as Partial<Preferencies>;
    return {
      volum: typeof dades.volum === "number" ? Math.min(Math.max(dades.volum, 0), 1) : 1,
      barreja: Boolean(dades.barreja),
      repeticio: dades.repeticio === "tot" || dades.repeticio === "una" ? dades.repeticio : "cap",
      darrera: typeof dades.darrera === "string" ? dades.darrera : null,
    };
  } catch {
    return null;
  }
}

/** Barreja de Fisher-Yates amb una llavor, per obtenir sempre el mateix ordre. */
function barrejaAmbLlavor(ids: string[], llavor: number): string[] {
  const barrejats = [...ids];
  let estat = llavor || 1;
  for (let i = barrejats.length - 1; i > 0; i -= 1) {
    estat = (estat * 1103515245 + 12345) % 2147483648;
    const j = estat % (i + 1);
    [barrejats[i], barrejats[j]] = [barrejats[j], barrejats[i]];
  }
  return barrejats;
}

function identificador(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function missatge(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : "Hi ha hagut un problema inesperat amb la biblioteca.";
}
