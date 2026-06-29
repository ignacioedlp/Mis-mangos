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

export function convertCryptoUsdToArs(
  amountInUsd: number,
  rate: CryptoDollarRate | null,
): number | null {
  if (!rate || rate.compra <= 0 || !Number.isFinite(amountInUsd)) {
    return null;
  }

  return amountInUsd * rate.compra;
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

export function formatCryptoUsdToArs(
  amountInUsd: number,
  rate: CryptoDollarRate | null,
): string | null {
  const amountInArs = convertCryptoUsdToArs(amountInUsd, rate);

  if (amountInArs === null) {
    return null;
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountInArs);
}
