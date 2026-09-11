"use client";

import { useMemo, useState } from "react";
import { Calculator, CheckSquare, ReceiptText, X } from "lucide-react";

import { ExpenseActionButtons } from "@/components/expense-action-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { formatArsToCryptoUsd, formatCryptoUsd } from "@/lib/crypto-dollar";
import type { CryptoDollarRate } from "@/lib/crypto-dollar";
import { formatCurrency } from "@/lib/utils";

type DashboardExpense = {
  expenseId: string;
  name: string;
  categoryName: string;
  subcategoryName: string;
  estimatedAmount: number;
  isPaid: boolean;
  isSkipped: boolean;
  hasInstallments?: boolean;
  isHidden?: boolean;
};

interface DashboardExpenseListProps {
  items: DashboardExpense[];
  year: number;
  month: number;
  cryptoDollarRate: CryptoDollarRate | null;
}

export function DashboardExpenseList({
  items,
  year,
  month,
  cryptoDollarRate,
}: DashboardExpenseListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [summaryOpen, setSummaryOpen] = useState(false);

  const selectableItems = useMemo(
    () => items.filter((item) => !item.isPaid && !item.isSkipped && !item.isHidden),
    [items],
  );
  const selectedItems = useMemo(
    () => selectableItems.filter((item) => selectedIds.has(item.expenseId)),
    [selectableItems, selectedIds],
  );
  const total = selectedItems.reduce((sum, item) => sum + item.estimatedAmount, 0);
  const dollarsToSell =
    cryptoDollarRate && cryptoDollarRate.compra > 0
      ? total / cryptoDollarRate.compra
      : null;
  const allSelected = selectableItems.length > 0 && selectedIds.size === selectableItems.length;

  const toggleItem = (expenseId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(expenseId)) {
        next.delete(expenseId);
      } else {
        next.add(expenseId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(selectableItems.map((item) => item.expenseId)));
  };

  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted/40">
          <ReceiptText className="size-5" aria-hidden="true" />
        </div>
        <p className="font-medium">No se encontraron gastos para este mes.</p>
        <p className="mt-1 text-sm">Agregá algunos gastos para comenzar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 rounded-lg border border-primary/20 bg-primary/[0.04] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            id="select-all-pending"
            checked={allSelected}
            onCheckedChange={toggleAll}
            aria-label="Seleccionar todos los gastos pendientes"
            disabled={selectableItems.length === 0}
          />
          <label htmlFor="select-all-pending" className="text-sm text-muted-foreground">
            {selectedItems.length > 0
              ? `${selectedItems.length} gasto${selectedItems.length === 1 ? "" : "s"} seleccionado${selectedItems.length === 1 ? "" : "s"}`
              : "Seleccioná gastos pendientes"}
          </label>
        </div>
        <div className="flex items-center gap-2">
          {selectedItems.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
              <X className="h-4 w-4" /> Limpiar
            </Button>
          )}
          <Button size="sm" onClick={() => setSummaryOpen(true)} disabled={selectedItems.length === 0}>
            <Calculator className="h-4 w-4" /> Calcular total
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        {items.map((item) => {
          const isSelectable = !item.isPaid && !item.isSkipped && !item.isHidden;
          const isSelected = selectedIds.has(item.expenseId);

          return (
            <div
              key={item.expenseId}
              className="grid gap-3 border-b border-border px-4 py-3.5 last:border-b-0 hover:bg-muted/25 md:grid-cols-[1.5rem_minmax(0,1fr)_9rem_12rem] md:items-center"
            >
              <div className="flex items-center">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleItem(item.expenseId)}
                  disabled={!isSelectable}
                  aria-label={`Seleccionar ${item.name}`}
                />
              </div>
              <div className="flex min-w-0 flex-col space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="max-w-[65vw] truncate text-sm font-semibold leading-tight sm:max-w-[35vw]">{item.name}</span>
                  {item.isPaid && <Badge variant="secondary" className="border-0 bg-chart-5/10 px-2 text-chart-5">Pagado</Badge>}
                  {item.isHidden && <Badge variant="outline" className="px-2 text-muted-foreground">Oculto</Badge>}
                </div>
                <span className="text-xs text-muted-foreground">
                  {item.categoryName} <span className="text-border">·</span> {item.subcategoryName}
                </span>
              </div>
              <div className="flex flex-col md:items-end md:text-right">
                <span className="font-serif text-sm font-bold tabular-nums text-foreground">{formatCurrency(item.estimatedAmount)}</span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {formatArsToCryptoUsd(item.estimatedAmount, cryptoDollarRate) ?? "Cotización no disponible"}
                </span>
              </div>
              <div className="flex min-w-0 items-center md:justify-end">
                <ExpenseActionButtons
                  expenseId={item.expenseId}
                  expenseName={item.name}
                  estimatedAmount={item.estimatedAmount}
                  isPaid={item.isPaid}
                  isSkipped={item.isSkipped}
                  hasInstallments={item.hasInstallments}
                  isHidden={item.isHidden}
                  year={year}
                  month={month}
                />
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CheckSquare className="h-5 w-5 text-primary" /> Total a pagar</DialogTitle>
            <DialogDescription>
              {selectedItems.length} gasto{selectedItems.length === 1 ? "" : "s"} pendiente{selectedItems.length === 1 ? "" : "s"} seleccionado{selectedItems.length === 1 ? "" : "s"}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total en pesos</p>
              <p className="mt-1 font-serif text-xl font-bold tabular-nums">{formatCurrency(total)}</p>
            </div>
            <div className="rounded-lg border border-primary/25 bg-primary/[0.06] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">USD a vender</p>
              <p className="mt-1 font-serif text-xl font-bold tabular-nums text-primary">
                {dollarsToSell === null ? "—" : formatCryptoUsd(dollarsToSell)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {cryptoDollarRate ? `A compra: ${formatCurrency(cryptoDollarRate.compra)}` : "Cotización no disponible"}
              </p>
            </div>
          </div>
          <DialogFooter><Button onClick={() => setSummaryOpen(false)}>Listo</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
