"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Calculator, Check, CreditCard } from "lucide-react";
import { toast } from "sonner";

import {
  getPendingInstallmentsForMonth,
  markInstallmentsPaid,
} from "@/actions/installment-actions";
import { formatCurrency } from "@/lib/utils";
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

type EditablePayment = {
  paymentId: string;
  productName: string;
  installmentNumber: number;
  totalInstallments: number;
  amount: number;
  selected: boolean;
};

interface MarkPaidWithInstallmentsDialogProps {
  expenseId: string;
  expenseName: string;
  estimatedAmount: number;
  year: number;
  month: number;
}

export function MarkPaidWithInstallmentsDialog({
  expenseId,
  expenseName,
  estimatedAmount,
  year,
  month,
}: MarkPaidWithInstallmentsDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isLoadingInstallments, setIsLoadingInstallments] = useState(false);
  const [payments, setPayments] = useState<EditablePayment[]>([]);
  const [additionalAmount, setAdditionalAmount] = useState("0");

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const loadInstallments = async () => {
      try {
        setIsLoadingInstallments(true);
        const result = await getPendingInstallmentsForMonth(
          expenseId,
          year,
          month,
        );

        if (cancelled) return;

        const editable = result.map((item) => ({
          paymentId: item.id,
          productName: item.productName,
          installmentNumber: item.installmentNumber,
          totalInstallments: item.totalInstallments,
          amount: item.amount,
          selected: true,
        }));

        setPayments(editable);
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar las cuotas",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingInstallments(false);
        }
      }
    };

    void loadInstallments();

    return () => {
      cancelled = true;
    };
  }, [expenseId, month, open, year]);

  const selectedInstallmentsTotal = useMemo(() => {
    return payments
      .filter((payment) => payment.selected)
      .reduce((sum, payment) => sum + payment.amount, 0);
  }, [payments]);

  const additionalAmountNumber = Number(additionalAmount || 0);
  const finalTotal =
    selectedInstallmentsTotal +
    (Number.isFinite(additionalAmountNumber) ? additionalAmountNumber : 0);

  const updatePaymentAmount = (paymentId: string, amountValue: string) => {
    const nextAmount = Number(amountValue);

    setPayments((prev) =>
      prev.map((payment) => {
        if (payment.paymentId !== paymentId) return payment;
        if (!Number.isFinite(nextAmount)) return payment;

        return {
          ...payment,
          amount: Math.max(0, nextAmount),
        };
      }),
    );
  };

  const togglePaymentSelection = (paymentId: string) => {
    setPayments((prev) =>
      prev.map((payment) =>
        payment.paymentId === paymentId
          ? { ...payment, selected: !payment.selected }
          : payment,
      ),
    );
  };

  const handleConfirm = () => {
    startTransition(async () => {
      try {
        const selectedPayments = payments
          .filter((payment) => payment.selected)
          .map((payment) => ({
            paymentId: payment.paymentId,
            amount: payment.amount,
          }));

        const normalizedAdditionalAmount = Number(additionalAmount || 0);

        await markInstallmentsPaid(
          selectedPayments,
          expenseId,
          year,
          month,
          Number.isFinite(normalizedAdditionalAmount)
            ? normalizedAdditionalAmount
            : 0,
        );

        toast.success("Pago mensual registrado correctamente");
        setOpen(false);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo registrar el pago",
        );
      }
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setPayments([]);
          setAdditionalAmount("0");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Check className="mr-1 h-3 w-3" />
          Marcar como pagado
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Marcar Pago con Cuotas
          </DialogTitle>
          <DialogDescription>
            Seleccioná las cuotas pendientes de {expenseName} para {month}/
            {year} y ajustá montos si hace falta.
          </DialogDescription>
        </DialogHeader>

        {isLoadingInstallments ? (
          <p className="text-sm text-muted-foreground">
            Cargando cuotas pendientes...
          </p>
        ) : (
          <div className="space-y-4">
            <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
              {payments.length === 0 ? (
                <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                  No hay cuotas pendientes en este mes. Podés registrar un monto
                  adicional manual.
                </p>
              ) : (
                payments.map((payment) => (
                  <div
                    key={payment.paymentId}
                    className="rounded-md border p-3"
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <label className="flex items-start gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={payment.selected}
                          onChange={() =>
                            togglePaymentSelection(payment.paymentId)
                          }
                          className="mt-1"
                        />
                        <span>
                          <span className="font-medium">
                            {payment.productName}
                          </span>
                          <span className="text-muted-foreground">
                            {" "}
                            - Cuota {payment.installmentNumber}/
                            {payment.totalInstallments}
                          </span>
                        </span>
                      </label>
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={payment.amount}
                      onChange={(event) =>
                        updatePaymentAmount(
                          payment.paymentId,
                          event.target.value,
                        )
                      }
                      disabled={!payment.selected}
                    />
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2 rounded-md border bg-muted/30 p-3">
              <Label htmlFor="additional-amount" className="text-sm">
                Monto adicional (no asociado a cuotas)
              </Label>
              <Input
                id="additional-amount"
                type="number"
                step="0.01"
                min="0"
                value={additionalAmount}
                onChange={(event) => setAdditionalAmount(event.target.value)}
                placeholder={estimatedAmount.toFixed(2)}
              />
              <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                <p>
                  Cuotas seleccionadas:{" "}
                  {formatCurrency(selectedInstallmentsTotal)}
                </p>
                <p>Total a registrar: {formatCurrency(finalTotal)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border bg-card p-3 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Calculator className="h-4 w-4" />
                Total final
              </span>
              <span className="font-semibold">
                {formatCurrency(finalTotal)}
              </span>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isPending || isLoadingInstallments || finalTotal <= 0}
              >
                {isPending ? "Guardando..." : "Confirmar pago"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
