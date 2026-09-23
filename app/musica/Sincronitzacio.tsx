"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { baixa, estatDelNuvol, nomDelDispositiu, nuvol, puja, type EstatNuvol } from "./nuvol";
import { IconaDescarrega, IconaMes } from "./icones";

type Props = {
  /** Es crida quan s'ha baixat res, per rellegir la biblioteca. */
  onCanvis: () => void;
};

const CLAU_PRINCIPAL = "musica:dispositiu-principal";

export function Sincronitzacio({ onCanvis }: Props) {
  const [sessio, setSessio] = useState<Session | null>(null);
  const [carregant, setCarregant] = useState(true);
  const [correu, setCorreu] = useState("");
  const [contrasenya, setContrasenya] = useState("");
  const [principal, setPrincipal] = useState(() => {
    try {
      return localStorage.getItem(CLAU_PRINCIPAL) === "1";
    } catch {
      return false;
    }
  });
  const [estat, setEstat] = useState<EstatNuvol>(null);
  const [treballant, setTreballant] = useState(false);
  const [avis, setAvis] = useState<string | null>(null);

  useEffect(() => {
    let viu = true;
    const client = nuvol();
    client.auth.getSession().then(({ data }) => {
      if (!viu) return;
      setSessio(data.session);
      setCarregant(false);
    });
    const { data } = client.auth.onAuthStateChange((_esdeveniment, novaSessio) => {
      setSessio(novaSessio);
      setCarregant(false);
    });
    return () => {
      viu = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const refrescaEstat = useCallback(() => {
    estatDelNuvol()
      .then(setEstat)
      .catch(() => setEstat(null));
  }, []);

  useEffect(() => {
    if (!sessio) return;
    refrescaEstat();
  }, [sessio, refrescaEstat]);

  const entra = async (nou: boolean) => {
    setTreballant(true);
    setAvis(null);
    try {
      const client = nuvol();
      const credencials = { email: correu.trim(), password: contrasenya };
      const { data, error } = nou
        ? await client.auth.signUp(credencials)
        : await client.auth.signInWithPassword(credencials);
      if (error) throw new Error(error.message);
      if (nou && !data.session) {
        setAvis("Compte creat. Revisa el correu i confirma'l per poder entrar.");
      }
      setContrasenya("");
    } catch (error) {
      setAvis(explica(error, "No s'ha pogut entrar."));
    } finally {
      setTreballant(false);
    }
  };

  const fes = async (que: "puja" | "baixa") => {
    setTreballant(true);
    setAvis(null);
    try {
      if (que === "puja") {
        const resultat = await puja();
        setAvis(
          `Pujades ${resultat.cancons} ${resultat.cancons === 1 ? "cançó" : "cançons"}` +
            (resultat.llistes ? ` i ${resultat.llistes} ${resultat.llistes === 1 ? "llista" : "llistes"}` : "") +
            ".",
        );
      } else {
        const resultat = await baixa();
        onCanvis();
        setAvis(
          `Actualitzades ${resultat.actualitzades} ${resultat.actualitzades === 1 ? "cançó" : "cançons"}` +
            (resultat.llistes ? `, ${resultat.llistes} ${resultat.llistes === 1 ? "llista" : "llistes"}` : "") +
            (resultat.sense ? `. ${resultat.sense} no ${resultat.sense === 1 ? "és" : "són"} en aquest dispositiu.` : "."),
        );
      }
      refrescaEstat();
    } catch (error) {
      setAvis(explica(error, "No s'ha pogut sincronitzar."));
    } finally {
      setTreballant(false);
    }
  };

  const marcaPrincipal = (valor: boolean) => {
    setPrincipal(valor);
    try {
      localStorage.setItem(CLAU_PRINCIPAL, valor ? "1" : "0");
    } catch {
      // Mode privat: es perdrà en tancar, i ja està.
    }
  };

  if (carregant) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 shadow-lg shadow-black/20 sm:px-6">
      <h2 className="text-sm font-semibold text-zinc-50">Sincronització entre dispositius</h2>
      <p className="mt-1 text-xs text-zinc-400">
        Viatgen les llistes, les lletres i l&apos;ordre. Les cançons no: els fitxers es queden a cada
        dispositiu.
      </p>

      {!sessio ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void entra(false);
          }}
          className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          <input
            type="email"
            value={correu}
            onChange={(event) => setCorreu(event.target.value)}
            placeholder="El teu correu"
            aria-label="Correu"
            autoComplete="email"
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-zinc-50 outline-none transition-colors placeholder:text-zinc-500 focus:border-teal-400"
          />
          <input
            type="password"
            value={contrasenya}
            onChange={(event) => setContrasenya(event.target.value)}
            placeholder="Contrasenya"
            aria-label="Contrasenya"
            autoComplete="current-password"
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-zinc-50 outline-none transition-colors placeholder:text-zinc-500 focus:border-teal-400"
          />
          <div className="flex shrink-0 gap-2">
            <button
              type="submit"
              disabled={treballant || !correu.trim() || !contrasenya}
              className="rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-teal-400 disabled:opacity-40"
            >
              Entra
            </button>
            <button
              type="button"
              onClick={() => void entra(true)}
              disabled={treballant || !correu.trim() || !contrasenya}
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:bg-white/10 disabled:opacity-40"
            >
              Crea un compte
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-zinc-400">
              Connectat com a <span className="text-zinc-200">{sessio.user.email}</span>
            </p>
            <button
              type="button"
              onClick={() => void nuvol().auth.signOut()}
              className="text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-300"
            >
              Tanca la sessió
            </button>
          </div>

          <label className="mt-3 flex items-center gap-2 text-xs text-zinc-300">
            <input
              type="checkbox"
              checked={principal}
              onChange={(event) => marcaPrincipal(event.target.checked)}
              className="h-4 w-4 accent-teal-500"
            />
            Aquest ({nomDelDispositiu()}) és el meu dispositiu principal
          </label>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void fes("puja")}
              disabled={treballant || !principal}
              title={principal ? undefined : "Només es puja des del dispositiu principal"}
              className="inline-flex items-center gap-2 rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-teal-400 disabled:opacity-40"
            >
              <IconaMes className="h-5 w-5" />
              Puja el que tinc
            </button>
            <button
              type="button"
              onClick={() => void fes("baixa")}
              disabled={treballant}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:bg-white/10 disabled:opacity-40"
            >
              <IconaDescarrega className="h-5 w-5" />
              Porta&apos;m l&apos;últim
            </button>
          </div>

          <p className="mt-3 text-xs text-zinc-500">
            {treballant
              ? "Sincronitzant…"
              : estat
                ? `Última pujada: ${estat.cancons} ${estat.cancons === 1 ? "cançó" : "cançons"} des de ${estat.dispositiu}, ${quan(estat.quan)}.`
                : "Encara no s'ha pujat res."}
          </p>
        </>
      )}

      {avis && <p className="mt-2 text-xs text-amber-200">{avis}</p>}
    </section>
  );
}

/** Els errors de xarxa arriben com a "Failed to fetch", que no diu res a ningú. */
function explica(error: unknown, perDefecte: string): string {
  const text = error instanceof Error ? error.message : "";
  if (/failed to fetch|networkerror|load failed/i.test(text)) {
    return "No s'hi ha pogut connectar. Comprova que tens internet i torna-ho a provar.";
  }
  if (/invalid login credentials/i.test(text)) return "El correu o la contrasenya no són correctes.";
  if (/email not confirmed/i.test(text)) return "Has de confirmar el correu abans d'entrar-hi.";
  if (/user already registered/i.test(text)) return "Aquest correu ja té compte: entra-hi en lloc de crear-ne un.";
  if (/password should be at least/i.test(text)) return "La contrasenya és massa curta.";
  return text || perDefecte;
}

function quan(data: string): string {
  const moment = new Date(data);
  if (Number.isNaN(moment.getTime())) return "fa poc";
  return moment.toLocaleString("ca-ES", { dateStyle: "short", timeStyle: "short" });
}
