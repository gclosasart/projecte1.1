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

## Desenvolupament local

```bash
npm install
npm run dev
```

Calen les variables d'entorn de `.env.local` (URL i claus de Supabase) — no incloses al repositori.
