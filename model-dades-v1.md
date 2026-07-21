# Model de dades — v1

Set entitats, amb el Tenant com a arrel de tot (multitenant: cada coworking té les seves dades completament aïllades).

---

## Tenant
El propi coworking. **Necessita les seves pròpies dades fiscals**, ja que apareix com a emissor a cada factura — no ho havíem contemplat fins ara.

| Camp | Tipus | Notes |
|---|---|---|
| id | UUID | |
| nom_comercial | text | |
| raó_social | text | Per a la factura |
| nif | text | Del coworking, no del client |
| adreça_fiscal | text | |
| següent_num_factura | enter | Comptador intern per garantir numeració correlativa (veure nota més avall) |

## Usuari
Staff del coworking. Un únic rol, sense jerarquies.

| Camp | Tipus | Notes |
|---|---|---|
| id | UUID | |
| tenant_id | FK → Tenant | |
| nom | text | |
| email | text | Login |
| password_hash | text | |

## Recurs
Espai o element reservable (sala, taula, despatx...).

| Camp | Tipus | Notes |
|---|---|---|
| id | UUID | |
| tenant_id | FK → Tenant | |
| nom | text | |
| capacitat | enter | |
| preu | decimal | Preu base actual |
| unitat_preu | enum | hora / dia |
| actiu | booleà | Per donar de baixa sense esborrar l'historial de reserves passades |

## Client
Directori de clients del tenant. Sense login ni contrasenya.

| Camp | Tipus | Notes |
|---|---|---|
| id | UUID | |
| tenant_id | FK → Tenant | |
| nom | text | |
| nif | text | Per a la factura |
| email | text | |
| adreça | text | |

## Reserva
La "comanda" en si — pot ser puntual o recurrent. Genera una o més Ocurrències.

| Camp | Tipus | Notes |
|---|---|---|
| id | UUID | |
| tenant_id | FK → Tenant | |
| recurs_id | FK → Recurs | |
| client_id | FK → Client | |
| creat_per | FK → Usuari | Auditoria: qui l'ha donat d'alta |
| tipus | enum | puntual / recurrent |
| freqüència | text | Només si recurrent (p. ex. "cada dilluns") |
| data_inici | data | |
| condició_final | text | Data concreta / núm. sessions / fins a cancel·lació |
| model_preu | enum | per_ocurrència / abonament_fix — només si recurrent |
| preu_base_snapshot | decimal | Preu del recurs **en el moment de crear la reserva** (veure nota) |
| estat | enum | activa / cancel·lada |

## Ocurrència
Cada data/hora concreta generada per una Reserva. És el que realment ocupa el calendari i es valida contra overbooking.

| Camp | Tipus | Notes |
|---|---|---|
| id | UUID | |
| reserva_id | FK → Reserva | |
| data | data | |
| hora_inici | hora | |
| hora_fi | hora | |
| estat | enum | activa / cancel·lada |
| preu | decimal | Import concret d'aquesta ocurrència (ja calculat segons el model de preu) |

## Factura
Una per Ocurrència. Relació 1:1.

| Camp | Tipus | Notes |
|---|---|---|
| id | UUID | |
| tenant_id | FK → Tenant | |
| ocurrència_id | FK → Ocurrència | 1:1 |
| número | enter | Correlatiu per tenant (ve del comptador del Tenant) |
| data_emissió | data | |
| base_imposable | decimal | |
| iva_percent | decimal | Configurable, per defecte 21% |
| total | decimal | |
| estat | enum | pendent / pagada / anul·lada |

---

## Decisions de disseny rellevants

**1. Preu "congelat" (snapshot)**
El preu d'un Recurs pot canviar amb el temps (puja de tarifes, per exemple). Si una Reserva o Ocurrència simplement "mirés" el preu actual del Recurs cada vegada, les factures antigues canviarien retroactivament — cosa inadmissible legalment. Per això, el preu es copia ("snapshot") a la Reserva/Ocurrència en el moment de crear-se, i ja no depèn del preu actual del Recurs.

**2. Numeració correlativa de factures**
Cal garantir que dues factures no tinguin mai el mateix número dins un mateix tenant, fins i tot si dos usuaris creen reserves simultàniament. El camp `següent_num_factura` al Tenant s'incrementa de forma atòmica cada vegada que es genera una factura nova.

**3. Client sense compte**
Client és purament un registre de dades (directori), no un usuari del sistema — coherent amb la decisió que l'eina és només per a l'staff.

**4. Relació Reserva → Ocurrència**
Una reserva puntual genera exactament 1 ocurrència. Una reserva recurrent en genera tantes com calgui segons el patró. Cancel·lar "només una ocurrència" vs. "tota la sèrie" es tradueix directament en canviar l'estat d'una o vàries files d'Ocurrència, sense tocar la Reserva pare (llevat que es cancel·li tota la sèrie, cas en què també es marca `estat = cancel·lada` a la Reserva).
