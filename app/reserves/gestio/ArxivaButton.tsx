import { arxivarReserva } from "./actions";

export function ArxivaButton({ id, arxivada }: { id: string; arxivada: boolean }) {
  return (
    <form action={arxivarReserva.bind(null, id, !arxivada)}>
      <button
        type="submit"
        className="shrink-0 text-xs font-medium text-zinc-500 hover:underline dark:text-zinc-400"
      >
        {arxivada ? "Desarxiva" : "Arxiva"}
      </button>
    </form>
  );
}
