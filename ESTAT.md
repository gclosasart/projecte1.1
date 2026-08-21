# Estat del projecte — Coworking SaaS

> Aquest fitxer es manté actualitzat al final de cada sessió de treball perquè una
> conversa nova pugui continuar sense que calgui escriure un resum a mà. Per
> arrencar una sessió nova: "Llegeix ESTAT.md i continua".

## Què és

Aplicació web multitenant de gestió de coworkings (reserves, recursos, clients,
factures). Next.js 16 App Router + TypeScript + Tailwind CSS v4 + Supabase,
desplegada a Vercel.

## On viu tot

- **Codi**: GitHub `gclosasart/projecte1.1`, branca `main` (arrel del repo, sense subcarpeta)
- **Producció**: `app.trempt.es` (projecte Vercel `projecte1-1`) — cada push a `main` desplega sol
- **Base de dades**: Supabase, projecte "NXing", ref `aqoiiintjyqifagxjawe`, regió eu-west-2, org slug `zimmsajhqqzoklvmoqbu`

## Perquè una sessió nova pugui arrencar el servidor local

`.env.local` mai es puja al repo. Cal configurar aquestes 3 variables a l'entorn
de la sessió (valors a Vercel → Settings → Environment Variables, o via Supabase
MCP per a les dues primeres):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (Supabase → NXing → Settings → API Keys → Secret keys)

## Convencions establertes — no trencar-les

- Next.js 16 té diferències respecte al conegut habitualment: llegir
  `node_modules/next/dist/docs/` abans d'escriure codi nou (avís a `AGENTS.md`)
- Mai passar un objecte de traduccions sencer com a prop d'un Server Component a
  un `"use client"` — si conté funcions d'interpolació, Next.js peta en
  producció. Sempre passar `idioma: Idioma` (string) i cridar `dictDe(idioma)`
  dins del component client
- Disseny: un sol color d'accent (`sky-600` / `indigo-400` en fosc); vermell =
  pendent, verd = pagat, cap altre color decoratiu. Títols `h1` sempre
  `text-2xl font-semibold text-sky-600 dark:text-indigo-400`
- Sempre `npx tsc --noEmit && npm run lint && npm run build` abans de fer commit
- Mai `git push` sense confirmació explícita de l'usuari
- Taula nova a Supabase → cal fer `GRANT select,insert,update,delete TO
  authenticated` manualment sempre, no és automàtic
- L'usuari (Guillem) sap de producte i dades però no és tècnic en eines de dev
  — donar-li passos clars; mai demanar-li ni escriure les seves contrasenyes
  reals

## Estat actual

Tot pujat i net. Últim commit `e75afe0` a `origin/main`, res pendent de fer.
Sessió verificada amb accés complet a GitHub, Supabase (MCP) i servidor local
(`.env.local` configurat, `tsc`/`lint`/`build` OK).

## Fet fins ara (de més antic a més recent)

- No-show a reserves/factures
- Prevenció de clients duplicats
- Vista de Planning
- Manual d'operacions i d'ús (docx/pdf/pptx)
- Presentació de producte
- Correcció general de mòbil (capçaleres que es desbordaven, menú de seccions
  col·lapsable, bug de CSS que feia sortir les targetes de reserves de
  pantalla)
- Canvi de tipografia (Source Sans 3 + Hanken Grotesk)
- Eliminació de la capçalera blanca del dashboard i reubicació dels seus botons
- Tots els títols en blau i més grans
- Fletxa "tornar al dashboard" més gran i visible
- Llistes amb barra desllizant a Gestiona reserves
- Configuració d'`ESTAT.md` per facilitar continuar el projecte en converses noves
