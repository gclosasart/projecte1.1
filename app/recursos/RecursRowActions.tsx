"use client";

import { useState } from "react";
import Link from "next/link";
import { DeleteRecursInline } from "./DeleteRecursInline";
import { canviarEstatActiu, eliminarRecurs } from "./actions";

export function RecursRowActions({ id, actiu }: { id: string; actiu: boolean }) {
  const [confirmant, setConfirmant] = useState(false);

  if (confirmant) {
    return (
      <DeleteRecursInline
        action={eliminarRecurs.bind(null, id)}
        onCancel={() => setConfirmant(false)}
      />
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/recursos/${id}`}
        className="text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300"
      >
        Edita
      </Link>
      <form action={canviarEstatActiu.bind(null, id, !actiu)}>
        <button
          type="submit"
          className="text-sm font-medium text-zinc-500 hover:underline dark:text-zinc-400"
        >
          {actiu ? "Dona de baixa" : "Reactiva"}
        </button>
      </form>
      <button
        type="button"
        onClick={() => setConfirmant(true)}
        className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
      >
        Elimina
      </button>
    </div>
  );
}
