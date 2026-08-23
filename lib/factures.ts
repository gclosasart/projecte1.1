export function formatNumeroFactura(serie: string, numero: number): string {
  return `${serie}-${String(numero).padStart(4, "0")}`;
}
