export type Reserva = {
  id: string;
  tipus: string;
  frequencia: string | null;
  data_inici: string;
  condicio_final: string | null;
  model_preu: string | null;
  estat: string;
  arxivada: boolean;
  recursos: { nom: string } | null;
  clients: { nom: string } | null;
};

// Estat de la RESERVA (activa/cancel·lada) — no confondre amb el pagament de la factura.
export const ESTAT_RESERVA_ESTIL: Record<string, string> = {
  activa: "bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300",
  "cancel·lada": "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};
