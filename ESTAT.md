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
- Disseny: un sol color d'accent (`teal-600` / `teal-400` en fosc — provat
  abans `sky-600`/`indigo-400`, després `rose-600`/`rose-400`, i finalment
  `teal` el 2026-08-23 a petició de l'usuari perquè no volia rosa). Verd
  (`emerald`) queda reservat exclusivament per a l'estat "pagat" — per
  això l'accent és `teal` (blau-verdós) i no `emerald`, per no confondre
  els dos significats. Vermell = pendent, blau (`sky-100`/`sky-800`)
  reservat per l'estat "activa" de reserves/ocurrències (no és l'accent,
  és un estat), cap altre color decoratiu. **Fons de pàgina**: ambient
  d'oficina super difuminada (`bg-office-blur dark:bg-black`, classe CSS
  definida a `globals.css` amb taques de color grosses i toves — fusta,
  planta, llum de finestra —, sense cap imatge externa; abans es va
  provar un efecte de marbre, també descartat), no tenyit del color
  d'accent — es va provar tenyit amb el color d'accent a tota la pàgina
  i quedava "terriblement horrible" (massa saturat, sense
  contrast), es va
  revertir el mateix dia. L'accent només s'usa a botons/enllaços/targetes
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
  vora/línia inferior: es fon amb el fons de la pàgina, com el dashboard.
  **Excepció**: el reproductor de música (`/musica`) va en fosc, a petició
  explícita de l'usuari el 2026-09-21 ("més foscos, però no massa") — no
  tornar-lo a clar. És l'única pantalla fosca de tot el projecte
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
- Rendiment: als Server Components, mai encadenar `await supabase...` un
  darrere l'altre si les consultes no depenen realment l'una de l'altra
  (evitar el "waterfall"). Agrupar-les amb `Promise.all([...])`. Quan una
  consulta necessita l'`id` d'un resultat anterior per filtrar (p. ex.
  `ocurrencia_id` que ve de `factures`), sovint es pot evitar aquesta
  dependència fent servir un embed de PostgREST amb `!inner` (filtrar per
  una columna d'una taula relacionada dins del mateix `.select()`) o
  imbricant l'embed (p. ex. `reserves(...).ocurrencies(id, factures(estat))`)
  en lloc de fer una consulta separada amb `.in(...)`. Un `notFound()` ha
  d'anar sempre després del `Promise.all`, no abans (perquè no bloquegi la
  resta de consultes independents)

## Estat actual

S'ha afegit la facturació SaaS→Tenant (Plataforma) i les factures rectificatives
Tenant→Client. Pendent: configurar `CRON_SECRET` a Vercel perquè el cron mensual
funcioni en producció, i que en Guillem es doni d'alta com a autònom (o societat)
abans de confirmar cap factura de plataforma de debò — mentre no ho estigui, les
factures de `/tecnic/factures` s'han de deixar com a esborrany.

S'ha afegit la pàgina pública de reserva (`/reserva/[tenantId]`), pensada perquè
cada coworking la publiqui/incrusti a la seva pròpia web. **Important**: encara
NO crea reserves reals — les sol·licituds es desen com a pendents
(`sol_licituds_reserva`) i el personal les ha d'acceptar o rebutjar manualment
des de "Gestiona reserves". Si en el futur es vol que accepti-les creï la
reserva real automàticament (en lloc de només canviar l'`estat` a
`acceptada`), caldrà reutilitzar la lògica de `app/reserves/nova/actions.ts`
(`crearReserva`/`crear_reserva` RPC), que actualment només s'invoca des de
l'àrea autenticada.

**Pausat (no és al codi actual, però es vol retenir per retorn futur)**: es
va construir un cercador públic de coworkings a `/cerca` (llistava tots els
tenants amb almenys un recurs actiu, amb filtre de text pel nom, i cada
targeta enllaçava a la seva pàgina de reserva `/reserva/[tenantId]`). Es va
fer després de revisar `local-desk-hub` (un projecte de Lovable, marca
"Nexing") com a referència visual d'un marketplace de coworkings — es va
decidir NO reutilitzar-ne el codi (Vite + React Router, i la seva
cerca/reserva/pagament eren només simulacions sobre dades fixes) i
recrear-ho natiu dins de Trempt. L'usuari va demanar treure-ho de l'app
("tornarem en algun moment futur"), així que s'ha revertit
(`app/cerca/`, l'entrada a `PUBLIC_PATHS` i les claus `cerca` als 5
idiomes). El codi complet queda recuperable a l'historial de git de la
branca `claude/coworking-saas-resume-5owz7d` / `main` (commits
"Add public coworking search page at /cerca" i el revert posterior) per
si es vol reprendre. Pendents de decidir quan es reprengui: si `/cerca`
ha de substituir la pàgina d'inici (`/` continua redirigint a
`/dashboard`) o si només s'hi enllaça, i si val la pena ampliar la fitxa
de cada tenant amb camps pensats per a un marketplace (ciutat, foto,
descripció) que ara no existeixen.

S'ha afegit un **reproductor de música** a `/musica`. No té res a veure amb el
negoci del coworking: és una app a part que viu dins d'aquest mateix projecte
(i del mateix desplegament) per no haver de mantenir-ne un altre. Punts
importants:

- És una **PWA amb àmbit propi** (`/musica`): manifest a
  `public/musica/manifest.webmanifest`, service worker a `public/musica-sw.js`
  i icones pròpies a `public/musica/`. El service worker ha de viure a l'arrel
  de `public/` i no dins de `/musica/`, perquè l'àmbit d'un service worker no
  pot pujar de directori i la pàgina és `/musica` (sense barra final).
  Instal·lar el reproductor NO instal·la el SaaS: per al navegador són dues
  apps diferents. A l'ordinador i a Android s'instal·la amb el botó
  "Instal·la"; a l'iPhone i l'iPad, amb Compartir → "Afegeix a la pantalla
  d'inici" (Safari no dispara `beforeinstallprompt` i per tant no hi ha botó).
- Les cançons **no es pugen enlloc**: qui escolta tria fitxers que ja té al
  dispositiu i es desen a IndexedDB (`app/musica/biblioteca.ts`), demanant
  `navigator.storage.persist()` perquè el sistema no els esborri quan li falti
  espai. Cada dispositiu té la seva biblioteca i s'hi han d'afegir les cançons
  un cop; no se sincronitzen entre dispositius (caldria servidor, i la gràcia
  era justament no tenir-ne).
- Títol, artista, àlbum i caràtula es llegeixen de les etiquetes ID3 amb un
  lector escrit a mà (`app/musica/etiquetes.ts`, sense cap dependència nova).
  Si el fitxer no en porta, s'endevinen del nom ("01 - Artista - Títol.mp3").
  Només s'entén ID3 (el que porten els MP3): un FLAC o un M4A amb etiquetes
  d'un altre format sortiran amb el nom del fitxer.
- **Funciona igual executant l'app en local**: el service worker també es
  registra a `npm run dev`, però com a `/musica-sw.js?dev=1`, i amb aquest
  paràmetre no serveix mai res de la memòria cau mentre hi hagi xarxa (els
  fragments de Next.js canvien a cada recàrrega); sense connexió, en canvi,
  segueix servint la còpia desada. A `http://localhost:3000/musica` el
  navegador considera la pàgina segura i deixa instal·lar-la com si fos
  producció.
- La interfície és **només en català**, a diferència de la resta de l'app: no
  passa pel diccionari de `lib/i18n` perquè és una app personal i no part del
  producte multitenant. Si algun dia s'ha de traduir, caldrà afegir-ne les
  claus als 5 idiomes.
- `lib/supabase/proxy.ts` **surt abans de crear el client de Supabase** per a
  tot el que comenci per `/musica` (la pàgina i `/musica-sw.js`). Tres
  conseqüències: funciona igual amb la sessió oberta o sense, no paga una
  crida d'autenticació a cada petició, i s'obre en local encara que no hi
  hagi cap variable d'entorn configurada (`npm run dev` sense `.env.local`:
  la resta de l'app peta, però `/musica` va). Per això `/musica` ja no cal
  que sigui a `PUBLIC_PATHS`.
- **L'ordre de la llista el decideix qui escolta**, arrossegant les cançons
  per l'agafador de l'esquerra (o amb les fletxes amunt/avall quan l'agafador
  té el focus). Es fa amb esdeveniments de punter, no amb l'arrossegament
  natiu del navegador, perquè al mòbil aquell no existeix: així el dit i el
  ratolí segueixen exactament el mateix camí (cal `touch-none` a l'agafador o
  el mòbil fa scroll en lloc d'arrossegar). Aquest ordre és també el de
  reproducció (el botó "següent" va a la cançó de sota). Les cançons noves
  s'afegeixen al final, alfabètiques entre elles, per no descol·locar res.
  Mentre hi ha una cerca activa no es pot reordenar, perquè la llista que es
  veu no és la sencera.
- **La base de dades va per la versió 2**: el camp nou `ordre` a cada cançó.
  La migració des de la versió 1 (`onupgradeneeded` a `biblioteca.ts`)
  numera les cançons que ja hi havia per ordre alfabètic d'artista/àlbum/
  títol, que és com es veien abans, de manera que qui ja tingués biblioteca
  no nota cap salt. Provat sembrant una base de dades v1 a mà i obrint el
  reproductor.
- **Paleta fosca** (només aquí): fons `.bg-estudi` a `globals.css`, base
  `#23262b` amb les mateixes taques difuminades que el fons clar però en to
  mitjanit; targetes `bg-white/[0.06]` amb vora `border-white/10`; barra del
  reproductor `bg-[#1c1f23]/95`; text `zinc-50`/`zinc-400`; accent `teal-400`
  per a text i icones i `teal-500` amb text `zinc-950` per als botons plens
  (sobre fosc contrasta molt més que el `teal-600` amb text blanc de la resta
  de l'app). El `theme_color` del manifest i el `themeColor` de la pàgina són
  `#23262b`, perquè la barra de sistema del mòbil hi vagi a joc. Les barres de
  progrés i volum es dibuixen amb CSS propi (`::-webkit-slider-runnable-track`
  amb la variable `--progres` que hi posa el component): amb `accent-color`
  sol, el Chrome deixa el solc buit d'un gris clar fix i quedava una ratlla
  blanca damunt del fons fosc.
- Per fer-lo anar en local: `npm run dev` i obrir
  `http://localhost:3000/musica` (no `127.0.0.1`, que en desenvolupament fa
  que Next bloquegi el websocket de recàrrega automàtica i la pàgina es
  recarregui en bucle). Un cop instal·lat, ja no depèn ni del servidor local
  ni d'internet.
- Les icones es regeneren amb `node scripts/genera-icones-musica.mjs`, que
  escriu els PNG a mà (sense dependències) a partir d'un dibuix vectorial
  senzill amb el teal de l'app.

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
- Canvi de color d'accent de rosa a teal, i del fons a un ambient
  d'oficina super difuminada (`bg-office-blur`, gradients CSS)
- Afegits el francès (`fr`) i l'italià (`it`) com a idiomes, amb
  traducció completa dels 5 idiomes (`lib/i18n/*.ts`)
- Optimització de rendiment: eliminats els "waterfalls" de consultes
  seqüencials a Supabase a totes les pàgines de Server Component que en
  tenien (dashboard, tecnic, tecnic/[tenantId], tecnic/factures, factures,
  factures/[id], factures/plataforma/[id], plataforma, equip,
  reserves/gestio, reserves/gestio/[id]), agrupant-les amb `Promise.all` o
  restructurant-les amb embeds de PostgREST per evitar dependències
  artificials entre consultes
- Afegit `app/loading.tsx` (un sol spinner arrel, ja que no hi ha cap altre
  `layout.tsx` a sota del principal): sense això, Next.js no mostrava cap
  feedback durant la navegació entre pàgines fins que el Server Component de
  destí acabava totes les seves consultes — es notava com a canvis de
  pàgina "molt lents" encara que les consultes ja estiguessin
  paral·lelitzades. Si en el futur alguna secció necessita un loading propi
  més específic (esquelet en lloc de spinner genèric), afegir un
  `loading.tsx` dins d'aquella carpeta de ruta
- L'app segueix sentint-se lenta després de paral·lelitzar consultes i
  afegir `loading.tsx` → sospita principal: les funcions serverless de
  Vercel corren per defecte a `iad1` (Washington DC) mentre la base de
  dades de Supabase és a `eu-west-2` (Londres) — cada `await supabase...`
  (incloent `auth.getUser()`, que sempre valida contra el servidor) paga
  una travessia transatlàntica. S'ha afegit `"regions": ["lhr1"]` a
  `vercel.json` per fer que les funcions corrin a Londres, a prop de la
  BD. **Important**: la selecció de regió de Vercel només té efecte als
  plans Pro/Enterprise — al pla Hobby (gratuït) les funcions sempre corren
  a `iad1` i aquest ajust no farà res. Cal que en Guillem comprovi el seu
  pla de Vercel (Settings del projecte → Functions → Function Region)
- Pàgina pública de reserva `/reserva/[tenantId]` (sense necessitat de
  compte), amb enllaç i botó "Copia l'enllaç" a Configuració. Nova taula
  `sol_licituds_reserva` (amb RLS) per a les sol·licituds pendents, i una
  secció "Sol·licituds pendents des de la web" a Gestiona reserves amb
  botons Accepta/Rebutja. No crea reserves automàticament (decisió
  explícita de l'usuari, per evitar abús sense protecció anti-bots): el
  personal ha de revisar-les i crear la reserva real a mà si l'accepta
- Reproductor de música offline a `/musica`: PWA instal·lable a ordinador i
  mòbil, biblioteca de cançons pròpies desada a IndexedDB, lector d'etiquetes
  ID3 propi, cerca, ordre aleatori, repetició i controls a la pantalla de
  bloqueig (Media Session)
