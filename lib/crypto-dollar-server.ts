import "server-only";

import { z } from "zod";
import type { CryptoDollarRate } from "@/lib/crypto-dollar";

const CRYPTO_DOLLAR_URL = "https://dolarapi.com/v1/dolares/cripto";

const cryptoDollarRateSchema = z.object({
  compra: z.number().positive(),
  venta: z.number().positive(),
  fechaActualizacion: z.string().datetime(),
});

export async function getCryptoDollarRate(): Promise<CryptoDollarRate | null> {
  try {
    const response = await fetch(CRYPTO_DOLLAR_URL, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return null;
    }

    const result = cryptoDollarRateSchema.safeParse(await response.json());
    if (!result.success) {
      return null;
    }

    return result.data;
  } catch {
    return null;
  }
}

