"use client";

import { useEffect, useRef } from "react";

type Props = {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  reproduint: boolean;
};

const BARRES = 13;
const BASE = 84; // on recolzen les barres del VU
const ALCADA_MAXIMA = 22;

// L'àudio només es pot enganxar una vegada a l'analitzador, i és el mateix
// element per a tota l'app: per això viuen fora del component.
let context: AudioContext | null = null;
let font: MediaElementAudioSourceNode | null = null;
let analitzador: AnalyserNode | null = null;

function preparaAnalitzador(audio: HTMLAudioElement): AnalyserNode | null {
  try {
    context ??= new AudioContext();
    if (!font) {
      font = context.createMediaElementSource(audio);
      analitzador = context.createAnalyser();
      analitzador.fftSize = 64;
      analitzador.smoothingTimeConstant = 0.75;
      // El so passa per l'analitzador i d'allà als altaveus: si no es
      // connectés a la sortida, la cançó emmudiria.
      font.connect(analitzador);
      analitzador.connect(context.destination);
    }
    return analitzador;
  } catch {
    // Si el navegador no ho permet, les barres es mouen igual amb una
    // animació falsa i la cançó segueix sonant com sempre.
    return null;
  }
}

/**
 * Una taula de mescles dibuixada que va amb la cançó: els plats giren mentre
 * sona i el VU es mou amb el so de debò. Ocupa el lloc de la caràtula quan la
 * cançó no en porta (cap dels fitxers baixats de YouTube en porta).
 */
export function TaulaDeMescles({ audioRef, reproduint }: Props) {
  const barres = useRef<(SVGRectElement | null)[]>([]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !reproduint) return;

    const analisi = preparaAnalitzador(audio);
    // El navegador deixa el context aturat fins que algú toca alguna cosa;
    // reprendre'l aquí és segur perquè hi hem arribat prement "reprodueix".
    void context?.resume();

    let seguent = 0;
    const dades = analisi ? new Uint8Array(analisi.frequencyBinCount) : null;

    const pinta = () => {
      seguent = requestAnimationFrame(pinta);
      if (analisi && dades) analisi.getByteFrequencyData(dades);

      for (let i = 0; i < BARRES; i += 1) {
        const barra = barres.current[i];
        if (!barra) continue;
        const valor =
          analisi && dades
            ? dades[Math.floor((i * dades.length) / BARRES)] / 255
            : // Sense analitzador, una oneta perquè no sembli espatllat.
              0.25 + 0.2 * Math.sin(Date.now() / 260 + i / 1.6);
        const alcada = Math.max(1.2, valor * ALCADA_MAXIMA);
        barra.setAttribute("height", String(alcada));
        barra.setAttribute("y", String(BASE - alcada));
      }
    };

    seguent = requestAnimationFrame(pinta);
    return () => cancelAnimationFrame(seguent);
  }, [audioRef, reproduint]);

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label="Taula de mescles">
      <defs>
        <radialGradient id="disc" cx="50%" cy="50%" r="50%">
          <stop offset="55%" stopColor="#17191d" />
          <stop offset="100%" stopColor="#0f1114" />
        </radialGradient>
      </defs>

      {[26, 74].map((cx, plat) => {
        const esquerra = plat === 0;
        // Cada braç al seu costat de fora: al mig es creuarien.
        const pivot = esquerra ? cx - 15 : cx + 15;
        return (
          <g key={cx}>
            <circle cx={cx} cy={33} r={17} fill="#1f2228" stroke="rgba(255,255,255,0.07)" />
            <circle cx={cx} cy={33} r={14.5} fill="url(#disc)" />
            <g
              style={{
                transformBox: "view-box",
                transformOrigin: `${cx}px 33px`,
                animation: "gira 1.8s linear infinite",
                animationPlayState: reproduint ? "running" : "paused",
              }}
            >
              {/* Solcs del vinil i etiqueta central. */}
              <circle cx={cx} cy={33} r={12} fill="none" stroke="rgba(255,255,255,0.05)" />
              <circle cx={cx} cy={33} r={9} fill="none" stroke="rgba(255,255,255,0.05)" />
              <circle cx={cx} cy={33} r={5.2} fill="#0d9488" />
              <circle cx={cx} cy={33} r={0.9} fill="#0f1114" />
              <path
                d={`M ${cx} 27.8 v 1.8`}
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="0.7"
                strokeLinecap="round"
              />
            </g>
            {/* El braç cau sobre el disc quan sona i es retira quan para. */}
            <g
              style={{
                transformBox: "view-box",
                transformOrigin: `${pivot}px 21px`,
                transform: `rotate(${reproduint ? (esquerra ? 18 : -18) : 0}deg)`,
                transition: "transform 600ms ease",
              }}
            >
              <path
                d={`M ${pivot} 21 L ${esquerra ? pivot + 9 : pivot - 9} 34`}
                stroke="#6b7280"
                strokeWidth="1.1"
                strokeLinecap="round"
              />
              <circle cx={pivot} cy={21} r={2.3} fill="#2a2e35" stroke="rgba(255,255,255,0.08)" />
            </g>
          </g>
        );
      })}

      {/* Cos de la taula */}
      <rect x="8" y="56" width="84" height="40" rx="4" fill="#1f2228" stroke="rgba(255,255,255,0.07)" />

      {/* VU: es mou amb el so que està sonant */}
      {Array.from({ length: BARRES }, (_, i) => (
        <rect
          key={i}
          ref={(element) => {
            barres.current[i] = element;
          }}
          x={13.5 + i * 5.6}
          y={BASE - 1.2}
          width="3.2"
          height="1.2"
          rx="1"
          fill={i > BARRES - 4 ? "#f59e0b" : "#2dd4bf"}
          opacity={reproduint ? 0.95 : 0.35}
        />
      ))}

      {/* Crossfader i dos potenciòmetres */}
      <rect x="13.5" y="89" width="45" height="2.6" rx="1.3" fill="#15171b" />
      <rect x="31" y="87.4" width="6" height="5.8" rx="1.4" fill="#3f444c" stroke="rgba(255,255,255,0.1)" />
      <circle cx="71" cy="90.4" r="3.6" fill="#2a2e35" stroke="rgba(255,255,255,0.08)" />
      <path d="M 71 90.4 v -2.4" stroke="#2dd4bf" strokeWidth="0.9" strokeLinecap="round" />
      <circle cx="83" cy="90.4" r="3.6" fill="#2a2e35" stroke="rgba(255,255,255,0.08)" />
      <path d="M 83 90.4 v -2.4" stroke="#2dd4bf" strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  );
}
