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

A Vercel (producció, no cal per local) també falta configurar `CRON_SECRET` — protegeix
`/api/cron/factures-plataforma`, cridat pel cron mensual definit a `vercel.json`. Sense
aquesta variable configurada a Vercel, el cron respondrà 401 i no generarà els esborranys.

## Convencions establertes — no trencar-les

- Next.js 16 té diferències respecte al conegut habitualment: llegir
  `node_modules/next/dist/docs/` abans d'escriure codi nou (avís a `AGENTS.md`)
- Mai passar un objecte de traduccions sencer com a prop d'un Server Component a
  un `"use client"` — si conté funcions d'interpolació, Next.js peta en
  producció. Sempre passar `idioma: Idioma` (string) i cridar `dictDe(idioma)`
  dins del component client
- Disseny: un sol color d'accent (`rose-600` / `rose-400` en fosc — abans
  `sky-600`/`indigo-400`, canviat el 2026-08-23 a petició explícita de
  l'usuari per donar-hi un aire més "Airbnb"); vermell = pendent, verd =
  pagat, blau (`sky-100`/`sky-800`) reservat per l'estat "activa" de
  reserves/ocurrències (no és l'accent, és un estat), cap altre color
  decoratiu. **Fons de pàgina neutre** (`bg-neutral-50 dark:bg-black`), no
  tenyit del color d'accent — es va provar `bg-rose-50` a tota la pàgina i
  quedava "terriblement horrible" (massa saturat, sense contrast), es va
  revertir el mateix dia. El rosa només s'usa a botons/enllaços/targetes
  seleccionades, mai com a fons de pàgina sencer. Títols `h1` de pàgina
  sempre `text-2xl font-bold tracking-tight text-zinc-900
  dark:text-zinc-50` (neutre, no rosa — provat en rosa i quedava massa
  cridaner per ser només un títol; el rosa es reserva als elements
  interactius). Botó "tornar enrere": component compartit
  `<BackButton href="..." />` (`app/BackButton.tsx`), un cercle amb icona
  de fletxa SVG — abans un caràcter "←" de text pla en `text-5xl` rosa,
  que junt amb el títol quedava "massa simple, massa lleig" segons
  l'usuari. Targetes: `rounded-2xl border
  border-black/5 bg-white shadow-sm` (`dark:border-white/10
  dark:bg-zinc-950 dark:shadow-none`) — abans `rounded-xl border
  border-black/10` sense ombra. Es va provar un estil "Nike/Puma" (botó
  negre, títol en majúscules/cursiva/negreta, barra d'accent) a totes les
  pàgines i es va revertir el 2026-08-21 — no tornar-hi sense que
  l'usuari ho demani explícitament. La capçalera no té fons blanc ni
  vora/línia inferior: es fon amb el fons de la pàgina, com el dashboard
- Tipografia (des del 2026-08-23): una sola família, Nunito Sans, tant pel
  cos com pels títols (abans Source Sans 3 + Hanken Grotesk) — arrodonida i
  càlida, a l'estil Airbnb (Cereal és propietària, no es pot fer servir)
- Sempre `npx tsc --noEmit && npm run lint && npm run build` abans de fer commit
- Commit i push automàtics: a partir del 2026-08-21 l'usuari ha autoritzat fer
  `commit` + `push` (a la branca de treball i fusió a `main`) sense demanar
  confirmació cada vegada per a canvis normals de codi. Segueix demanant
  confirmació per a accions destructives o irreversibles (force-push, reset
  --hard, esborrar branques, etc.)
- Taula nova a Supabase → cal fer `GRANT select,insert,update,delete TO
  authenticated` manualment sempre, no és automàtic
- L'usuari (Guillem) sap de producte i dades però no és tècnic en eines de dev
  — donar-li passos clars; mai demanar-li ni escriure les seves contrasenyes
  reals

## Estat actual

S'ha afegit la facturació SaaS→Tenant (Plataforma) i les factures rectificatives
Tenant→Client. Pendent: configurar `CRON_SECRET` a Vercel perquè el cron mensual
funcioni en producció, i que en Guillem es doni d'alta com a autònom (o societat)
abans de confirmar cap factura de plataforma de debò — mentre no ho estigui, les
factures de `/tecnic/factures` s'han de deixar com a esborrany.

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
- Facturació SaaS→Tenant (`plataforma`, `factures_plataforma`, `/plataforma`,
  `/tecnic/factures`, cron mensual d'esborranys) i factures rectificatives
  Tenant→Client (sèrie `R`, botó manual, vista imprimible/PDF a totes dues)
- Restyling inspirat en Airbnb a tota l'app: accent `sky`→`rose`, targetes
  més arrodonides (`rounded-2xl`) amb ombra suau, més espai vertical a les
  pàgines (`py-8`→`py-10`)
- Ajustos del restyling després de feedback ("terriblement horrible" /
  "massa simple, massa lleig"): fons de pàgina neutre en lloc de rosa,
  tipografia unificada en Nunito Sans, títols en color neutre en lloc de
  rosa, fletxa "enrere" com a botó circular amb icona (`BackButton`) en
  lloc d'un caràcter de text gegant
