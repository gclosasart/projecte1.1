"use client";

import { useState } from "react";
import Link from "next/link";
import { DeleteClientInline } from "./DeleteClientInline";
import { eliminarClient } from "./actions";

type Textos = {
  edita: string;
  elimina: string;
  confirma: string;
  cancela: string;
  escriuElimina: string;
};

export function ClientRowActions({ id, textos }: { id: string; textos: Textos }) {
  const [confirmant, setConfirmant] = useState(false);

  if (confirmant) {
    return (
      <DeleteClientInline
        action={eliminarClient.bind(null, id)}
        onCancel={() => setConfirmant(false)}
        textos={textos}
      />
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/clients/${id}`}
        className="text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300"
      >
        {textos.edita}
      </Link>
      <button
        type="button"
        onClick={() => setConfirmant(true)}
        className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
      >
        {textos.elimina}
      </button>
    </div>
  );
}
