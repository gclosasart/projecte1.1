// Icones del reproductor. Dibuixades aquí i no importades de cap paquet
// perquè el projecte no en fa servir cap (la resta de l'app també porta els
// seus SVG a mà, com ara app/BackButton.tsx).

type Props = { className?: string };

function Svg({ className = "h-5 w-5", children }: Props & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {children}
    </svg>
  );
}

export function IconaReprodueix({ className }: Props) {
  return (
    <Svg className={className}>
      <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" />
    </Svg>
  );
}

export function IconaPausa({ className }: Props) {
  return (
    <Svg className={className}>
      <path d="M8 5h3v14H8zM13 5h3v14h-3z" fill="currentColor" />
    </Svg>
  );
}

export function IconaAnterior({ className }: Props) {
  return (
    <Svg className={className}>
      <path d="M7 6h2.2v12H7zM19 6v12l-8.5-6L19 6Z" fill="currentColor" />
    </Svg>
  );
}

export function IconaSeguent({ className }: Props) {
  return (
    <Svg className={className}>
      <path d="M14.8 6H17v12h-2.2zM5 6l8.5 6L5 18V6Z" fill="currentColor" />
    </Svg>
  );
}

export function IconaBarreja({ className }: Props) {
  return (
    <Svg className={className}>
      <path
        d="M4 7h3.2c1.1 0 2.1.5 2.7 1.4l4.2 6.2c.6.9 1.6 1.4 2.7 1.4H20M4 17h3.2c1.1 0 2.1-.5 2.7-1.4l.9-1.3M14.2 9.7l.9-1.3c.6-.9 1.6-1.4 2.7-1.4H20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17.5 4.5 21 7l-3.5 2.5zM17.5 13.5 21 16l-3.5 2.5z" fill="currentColor" />
    </Svg>
  );
}

export function IconaRepeticio({ className, una = false }: Props & { una?: boolean }) {
  return (
    <Svg className={className}>
      <path
        d="M7 5h10a3 3 0 0 1 3 3v3M17 19H7a3 3 0 0 1-3-3v-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M9.5 2.5 6 5l3.5 2.5zM14.5 16.5 18 19l-3.5 2.5z" fill="currentColor" />
      {una && <path d="M11 15.5v-5l-1.4.9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
    </Svg>
  );
}

export function IconaNota({ className }: Props) {
  return (
    <Svg className={className}>
      <path
        d="M9 18V6.5l10-2V16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse cx="6.8" cy="18" rx="2.8" ry="2.2" fill="currentColor" />
      <ellipse cx="16.8" cy="16" rx="2.8" ry="2.2" fill="currentColor" />
    </Svg>
  );
}

export function IconaMes({ className }: Props) {
  return (
    <Svg className={className}>
      <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function IconaCarpeta({ className }: Props) {
  return (
    <Svg className={className}>
      <path
        d="M4 7.5A1.5 1.5 0 0 1 5.5 6h3.2c.5 0 1 .2 1.3.6l1 1.1c.3.3.7.5 1.1.5h6.4A1.5 1.5 0 0 1 20 9.7v7.8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconaPaperera({ className }: Props) {
  return (
    <Svg className={className}>
      <path
        d="M5 7h14M10 7V5.5A1.5 1.5 0 0 1 11.5 4h1A1.5 1.5 0 0 1 14 5.5V7M7 7l.8 11.1A1.5 1.5 0 0 0 9.3 19.5h5.4a1.5 1.5 0 0 0 1.5-1.4L17 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconaAgafador({ className }: Props) {
  return (
    <Svg className={className}>
      <path
        d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconaAfegeixALlista({ className }: Props) {
  return (
    <Svg className={className}>
      <path
        d="M4 7h11M4 12h7M4 17h7M16 12v8M20 16h-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconaTreuDeLlista({ className }: Props) {
  return (
    <Svg className={className}>
      <path
        d="M4 7h11M4 12h7M4 17h7M20 16h-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconaLlapis({ className }: Props) {
  return (
    <Svg className={className}>
      <path
        d="M4 20h4l10-10a2.1 2.1 0 0 0-3-3L5 17v3ZM14.5 6.5l3 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconaCerca({ className }: Props) {
  return (
    <Svg className={className}>
      <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="m16 16 4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function IconaDescarrega({ className }: Props) {
  return (
    <Svg className={className}>
      <path
        d="M12 4v10m0 0 3.5-3.5M12 14l-3.5-3.5M5 17.5V19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconaVolum({ className, silenci = false }: Props & { silenci?: boolean }) {
  return (
    <Svg className={className}>
      <path d="M4 9.5h3L11 6v12l-4-3.5H4z" fill="currentColor" />
      {silenci ? (
        <path d="m15 9.5 4.5 5M19.5 9.5l-4.5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <path
          d="M14.5 9.2a4 4 0 0 1 0 5.6M17 7a7 7 0 0 1 0 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </Svg>
  );
}
