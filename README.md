# Coworking SaaS

Eina de gestió interna per a coworkings: reserves d'espais (puntuals i recurrents), clients, recursos, facturació automàtica i calendari. Multitenant, amb autenticació i seguretat a nivell de fila (RLS) gestionades per Supabase.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [Supabase](https://supabase.com) (Postgres, Auth, RLS)
- Desplegat a [Vercel](https://vercel.com)

## Documentació

- [`arquitectura-tecnica-v1.md`](./arquitectura-tecnica-v1.md)
- [`model-dades-v1_1.md`](./model-dades-v1_1.md)
- [`flux-usuari-v1.pdf`](./flux-usuari-v1.pdf)

## Reproductor de música (`/musica`)

Dins del mateix projecte hi viu una segona aplicació, independent del SaaS: un
reproductor de les cançons que ja tens descarregades al dispositiu. S'instal·la
com una app (PWA) tant a l'ordinador com al mòbil, funciona sense connexió i la
música no surt mai del navegador (es desa a IndexedDB). No comparteix compte ni
base de dades amb la gestió de coworkings.

## Desenvolupament local

```bash
npm install
npm run dev
```

Calen les variables d'entorn de `.env.local` (URL i claus de Supabase) — no incloses al repositori.
