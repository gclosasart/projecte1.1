import { arxivarReserva } from "./actions";

export function ArxivaButton({
  id,
  arxivada,
  textos,
}: {
  id: string;
  arxivada: boolean;
  textos: { arxiva: string; desarxiva: string };
}) {
  return (
    <form action={arxivarReserva.bind(null, id, !arxivada)}>
      <button
        type="submit"
        className="shrink-0 text-xs font-medium text-zinc-500 hover:underline dark:text-zinc-400"
      >
        {arxivada ? textos.desarxiva : textos.arxiva}
      </button>
    </form>
  );
}
