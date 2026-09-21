/** "3:07" a partir de segons. Qui no sàpiga la durada, que no cridi la funció. */
export function formatDurada(segons: number): string {
  if (!Number.isFinite(segons) || segons <= 0) return "0:00";
  const total = Math.floor(segons);
  const hores = Math.floor(total / 3600);
  const minuts = Math.floor((total % 3600) / 60);
  const resta = total % 60;
  const dosDigits = (valor: number) => String(valor).padStart(2, "0");
  return hores > 0
    ? `${hores}:${dosDigits(minuts)}:${dosDigits(resta)}`
    : `${minuts}:${dosDigits(resta)}`;
}

/** "42,7 MB" a partir de bytes. */
export function formatMida(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 MB";
  const unitats = ["B", "kB", "MB", "GB", "TB"];
  let valor = bytes;
  let unitat = 0;
  while (valor >= 1000 && unitat < unitats.length - 1) {
    valor /= 1000;
    unitat += 1;
  }
  const decimals = valor < 10 && unitat > 1 ? 1 : 0;
  return `${valor.toLocaleString("ca-ES", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} ${unitats[unitat]}`;
}
