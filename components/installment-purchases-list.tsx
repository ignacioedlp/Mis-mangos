"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { deleteInstallmentPurchase } from "@/actions/installment-actions";
import type { InstallmentPurchaseDTO } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface InstallmentPurchasesListProps {
  purchases: InstallmentPurchaseDTO[];
  onDeleted?: () => void;
}

export function InstallmentPurchasesList({
  purchases,
  onDeleted,
}: InstallmentPurchasesListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteInstallmentPurchase(id);
        toast.success("Compra en cuotas eliminada");
        router.refresh();
        onDeleted?.();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo eliminar la compra",
        );
      }
    });
  };

  if (purchases.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Sin compras en cuotas</CardTitle>
          <CardDescription>
            Agregá una compra financiada para empezar a seguir cuotas mensuales.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {purchases.map((purchase) => {
        const progress =
          purchase.totalInstallments > 0
            ? (purchase.paidCount / purchase.totalInstallments) * 100
            : 0;

        return (
          <Card key={purchase.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <CardTitle className="text-base">
                    {purchase.productName}
                  </CardTitle>
                  <CardDescription>
                    {purchase.paidCount}/{purchase.totalInstallments} cuotas
                    pagadas
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(purchase.id)}
                  disabled={isPending}
                  title="Eliminar compra en cuotas"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={progress} />
              <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                <div>
                  <span className="font-medium text-foreground">Total:</span>{" "}
                  {formatCurrency(purchase.totalPrice)}
                </div>
                <div>
                  <span className="font-medium text-foreground">Cuota:</span>{" "}
                  {formatCurrency(purchase.installmentAmount)}
                </div>
                <div>
                  <span className="font-medium text-foreground">Inicio:</span>{" "}
                  {purchase.startMonth}/{purchase.startYear}
                </div>
                <div>
                  <span className="font-medium text-foreground">
                    Pendientes:
                  </span>{" "}
                  {purchase.pendingCount}
                </div>
              </div>
              {purchase.notes ? (
                <p className="rounded-md border bg-muted/40 p-2 text-xs text-muted-foreground">
                  {purchase.notes}
                </p>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
