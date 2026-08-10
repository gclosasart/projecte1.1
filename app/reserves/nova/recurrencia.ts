const MAX_OCURRENCIES = 52;
const MAX_DIES_ESCANEJATS = 730;

function parseISODate(s: string): Date | null {
  const parts = s.split("-").map(Number);
  const [y, m, d] = parts;
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export type CondicioTipus = "data" | "sessions" | "obert";

export function generarDates(params: {
  dataInici: string;
  diesNum: number[];
  condicioTipus: CondicioTipus;
  dataFi?: string;
  numSessions?: number;
}): string[] {
  const inici = parseISODate(params.dataInici);
  if (!inici || params.diesNum.length === 0) return [];

  const fi = params.condicioTipus === "data" && params.dataFi ? parseISODate(params.dataFi) : null;
  const limitSessions =
    params.condicioTipus === "sessions" && params.numSessions ? params.numSessions : MAX_OCURRENCIES;

  const resultat: string[] = [];
  const cursor = new Date(inici);
  let diesEscanejats = 0;

  while (resultat.length < Math.min(limitSessions, MAX_OCURRENCIES) && diesEscanejats < MAX_DIES_ESCANEJATS) {
    if (fi && cursor > fi) break;
    if (params.diesNum.includes(cursor.getDay())) {
      resultat.push(toISODate(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
    diesEscanejats++;
  }

  return resultat;
}

export function calcularHores(horaInici: string, horaFi: string): number {
  const [hi, mi] = horaInici.split(":").map(Number);
  const [hf, mf] = horaFi.split(":").map(Number);
  return (hf * 60 + mf - (hi * 60 + mi)) / 60;
}

export function textFrequencia(
  diesNum: number[],
  diesSetmana: { num: number; label: string }[],
  connectors: { cada: (llista: string) => string; i: string },
): string {
  const labels = diesSetmana.filter((d) => diesNum.includes(d.num)).map((d) => d.label.toLowerCase());
  if (labels.length === 0) return "";
  const llista =
    labels.length === 1
      ? labels[0]
      : `${labels.slice(0, -1).join(", ")} ${connectors.i} ${labels[labels.length - 1]}`;
  return connectors.cada(llista);
}

export function textCondicioFinal(
  tipus: CondicioTipus,
  textos: { finsAl: (data: string) => string; sessionsText: (n: number) => string; finsCancelacio: string },
  dataFi?: string,
  numSessions?: number,
): string {
  if (tipus === "data" && dataFi) return textos.finsAl(dataFi);
  if (tipus === "sessions" && numSessions) return textos.sessionsText(numSessions);
  return textos.finsCancelacio;
}

export function calcularPreusBase(params: {
  dates: string[];
  recursos: { preu: number; unitat_preu: "hora" | "dia" }[];
  horaInici: string;
  horaFi: string;
  modelPreu: "per_ocurrencia" | "abonament_fix";
  preuAbonament?: number;
}): number[] {
  const { dates, recursos, horaInici, horaFi, modelPreu, preuAbonament } = params;

  if (modelPreu === "per_ocurrencia") {
    const hores = calcularHores(horaInici, horaFi);
    const totalPerOcurrencia = recursos.reduce((acc, r) => {
      const unitats = r.unitat_preu === "hora" ? hores : 1;
      return acc + r.preu * unitats;
    }, 0);
    return dates.map(() => Math.round(totalPerOcurrencia * 100) / 100);
  }

  const fee = preuAbonament ?? 0;
  const perMes = new Map<string, number>();
  for (const d of dates) {
    const mes = d.slice(0, 7);
    perMes.set(mes, (perMes.get(mes) ?? 0) + 1);
  }
  return dates.map((d) => {
    const mes = d.slice(0, 7);
    const count = perMes.get(mes) ?? 1;
    return Math.round((fee / count) * 100) / 100;
  });
}
