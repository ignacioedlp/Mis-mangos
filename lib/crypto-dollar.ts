export type CryptoDollarRate = {
  compra: number;
  venta: number;
  fechaActualizacion: string;
};

export function convertArsToCryptoUsd(
  amountInArs: number,
  rate: CryptoDollarRate | null,
): number | null {
  if (!rate || rate.venta <= 0 || !Number.isFinite(amountInArs)) {
    return null;
  }

  return amountInArs / rate.venta;
}

export function formatCryptoUsd(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "code",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatArsToCryptoUsd(
  amountInArs: number,
  rate: CryptoDollarRate | null,
): string | null {
  const amountInUsd = convertArsToCryptoUsd(amountInArs, rate);
  return amountInUsd === null ? null : formatCryptoUsd(amountInUsd);
}

