"use client";

import { useState } from "react";
import { DollarSign } from "lucide-react";
import { toast } from "sonner";

import { setUsdMonthlyIncome } from "@/actions/usd-cashflow-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatUsdCurrency } from "@/lib/utils";

interface UsdIncomeDialogProps {
  year: number;
  month: number;
  currentAmount?: number;
}

export function UsdIncomeDialog({
  year,
  month,
  currentAmount,
}: UsdIncomeDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    try {
      await setUsdMonthlyIncome({
        year,
        month,
        amount: formData.get("amount"),
      });
      toast.success("Sueldo USD actualizado");
      setOpen(false);
    } catch {
      toast.error("No se pudo guardar el sueldo USD");
    } finally {
      setLoading(false);
    }
  }

  const monthName = new Date(year, month - 1).toLocaleString("es-AR", {
    month: "long",
    year: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <DollarSign className="mr-2 h-4 w-4" />
          {currentAmount
            ? `Sueldo: ${formatUsdCurrency(currentAmount)}`
            : "Cargar sueldo USD"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sueldo mensual en USD</DialogTitle>
          <DialogDescription>
            Definí el total disponible para {monthName}. Este monto no afecta
            el salario ARS del sistema actual.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="usd-income-amount">Monto USD</Label>
            <Input
              id="usd-income-amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              defaultValue={currentAmount?.toFixed(2) ?? ""}
              placeholder="2500.00"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
