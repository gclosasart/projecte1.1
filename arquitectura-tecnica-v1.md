# Arquitectura tècnica — v1

## Stack

| Peça | Elecció | Per què |
|---|---|---|
| Frontend | Next.js (React) | Framework més estès, molt ben suportat per eines d'IA com Claude Code, ideal per a dashboards amb formularis |
| Backend + BBDD | Supabase (Postgres) | Ja en teníeu part reutilitzable; inclou autenticació i seguretat a nivell de fila (RLS) |
| Allotjament frontend | Vercel | Gratuït per a un MVP, fet específicament per a Next.js, desacobla el projecte de les limitacions del hosting de Hostinger |
| Domini | Hostinger (ja el teniu) | Només cal apuntar el DNS cap a Vercel |
| Control de versions | GitHub (projecte ja creat) | Repositori únic per a tot el projecte |

**Nota important**: no cal esperar a comprovar si el pla de Hostinger suporta Node.js. El domini només s'usa per apuntar (DNS) cap a Vercel, on realment viu l'aplicació. Això desbloqueja poder començar ja.

---

## Estructura del repositori (proposta)

```
coworking-saas/
├── app/                       # Pantalles (Next.js App Router)
│   ├── dashboard/              # Panell de control
│   ├── reserves/                # Crear/editar/cancel·lar reserves
│   ├── recursos/                 # Alta/edició d'espais
│   ├── clients/                    # Directori de clients
│   └── factures/                    # Llistat i estat de factures
├── components/                # Peces reutilitzables (calendari, formularis, taules...)
├── lib/
│   └── supabase.ts             # Connexió i client de Supabase
└── supabase/
    └── migrations/              # Definició de les taules (el model de dades ja documentat)
```

---

## Seguretat multitenant (Row Level Security)

Cada taula de la base de dades porta un camp `tenant_id`. Amb Row Level Security de Supabase, es defineix una regla a nivell de base de dades que impedeix que cap consulta retorni files d'un tenant diferent al de l'usuari connectat — independentment del que faci el codi de l'aplicació. És una segona capa de protecció, no només confiança en que el codi estigui ben escrit.

---

## Pròxims passos pràctics

1. **Comprovar el pla de Hostinger** — no bloqueja res, però és bo saber-ho per si en el futur es vol allotjar alguna cosa addicional allà
2. **Crear el projecte a Supabase** i crear les taules segons el model de dades ja definit (`model-dades-v1.md`)
3. **Connectar Claude Code al repositori de GitHub** i començar a generar el codi de l'aplicació, pantalla per pantalla, seguint el flux d'usuari ja documentat (`flux-usuari-v1.md`)
