"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteUsdTransfer } from "@/actions/usd-cashflow-actions";
import { UsdTransferDialog } from "@/components/usd-transfer-dialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatUsdCurrency } from "@/lib/utils";

export interface UsdTransferRow {
  id: string;
  amount: number;
  year: number;
  month: number;
  transferredAt: string;
  description: string | null;
}

interface UsdTransfersTableProps {
  year: number;
  month: number;
  transfers: UsdTransferRow[];
}

function formatTransferDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function DeleteTransferButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);

    try {
      await deleteUsdTransfer(id);
      toast.success("Transferencia eliminada");
    } catch {
      toast.error("No se pudo eliminar la transferencia");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Eliminar transferencia"
          disabled={loading}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar transferencia</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción quitará la transferencia del cálculo de disponible USD.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading}>
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function UsdTransfersTable({
  year,
  month,
  transfers,
}: UsdTransfersTableProps) {
  if (transfers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 bg-background/50 px-4 py-10 text-center">
        <p className="font-medium text-foreground">
          No hay transferencias registradas.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Cuando muevas dólares a tu cuenta de uso, cargalos acá para descontar
          el disponible.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead className="text-right">Monto</TableHead>
          <TableHead className="w-24 text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transfers.map((transfer) => (
          <TableRow key={transfer.id}>
            <TableCell className="font-medium">
              {formatTransferDate(transfer.transferredAt)}
            </TableCell>
            <TableCell className="max-w-[18rem] truncate text-muted-foreground">
              {transfer.description || "Sin descripción"}
            </TableCell>
            <TableCell className="text-right font-serif font-bold tabular-nums">
              {formatUsdCurrency(transfer.amount)}
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-1">
                <UsdTransferDialog
                  year={year}
                  month={month}
                  transfer={transfer}
                  triggerSize="icon"
                />
                <DeleteTransferButton id={transfer.id} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
