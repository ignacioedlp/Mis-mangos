"use client";

import { useState } from "react";
import { ArrowDownToLine, Pencil } from "lucide-react";
import { toast } from "sonner";

import {
  createUsdTransfer,
  updateUsdTransfer,
} from "@/actions/usd-cashflow-actions";
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

interface UsdTransferDialogProps {
  year: number;
  month: number;
  transfer?: {
    id: string;
    amount: number;
    transferredAt: string;
    description: string | null;
  };
  triggerSize?: "default" | "sm" | "icon";
}

function toDateInputValue(value?: string) {
  if (!value) return "";
  return value.slice(0, 10);
}

export function UsdTransferDialog({
  year,
  month,
  transfer,
  triggerSize = "sm",
}: UsdTransferDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(transfer);

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    const input = {
      year,
      month,
      amount: formData.get("amount"),
      transferredAt: formData.get("transferredAt"),
      description: formData.get("description")?.toString() ?? "",
    };

    try {
      if (transfer) {
        await updateUsdTransfer(transfer.id, input);
        toast.success("Transferencia actualizada");
      } else {
        await createUsdTransfer(input);
        toast.success("Transferencia registrada");
      }
      setOpen(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo guardar la transferencia";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const defaultDate =
    toDateInputValue(transfer?.transferredAt) ||
    new Date(Date.UTC(year, month - 1, 1, 12)).toISOString().slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isEditing ? "ghost" : "default"}
          size={triggerSize}
          aria-label={isEditing ? "Editar transferencia" : undefined}
        >
          {isEditing ? (
            <Pencil className="h-4 w-4" />
          ) : (
            <>
              <ArrowDownToLine className="mr-2 h-4 w-4" />
              Registrar transferencia
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar transferencia" : "Registrar transferencia"}
          </DialogTitle>
          <DialogDescription>
            Cargá el monto en USD que moviste a tu cuenta de uso.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="usd-transfer-amount">Monto USD</Label>
            <Input
              id="usd-transfer-amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              defaultValue={transfer?.amount.toFixed(2) ?? ""}
              placeholder="500.00"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="usd-transfer-date">Fecha</Label>
            <Input
              id="usd-transfer-date"
              name="transferredAt"
              type="date"
              defaultValue={defaultDate}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="usd-transfer-description">Descripción</Label>
            <Input
              id="usd-transfer-description"
              name="description"
              defaultValue={transfer?.description ?? ""}
              maxLength={120}
              placeholder="Cuenta de uso, retiro, banco..."
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
              {loading ? "Guardando..." : isEditing ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
