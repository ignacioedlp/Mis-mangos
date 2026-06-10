import type { CryptoDollarRate } from "@/lib/crypto-dollar";
import { formatCurrency } from "@/lib/utils";

interface CryptoDollarQuoteProps {
  rate: CryptoDollarRate | null;
}

export function CryptoDollarQuote({ rate }: CryptoDollarQuoteProps) {
  if (!rate) {
    return (
      <div className="w-fit rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        Dólar cripto: cotización no disponible
      </div>
    );
  }

  const updatedAt = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(rate.fechaActualizacion));

  return (
    <div className="flex w-fit flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">Dólar cripto</span>
      <span>Compra {formatCurrency(rate.compra)}</span>
      <span>Venta {formatCurrency(rate.venta)}</span>
      <span>Actualizado {updatedAt}</span>
    </div>
  );
}

