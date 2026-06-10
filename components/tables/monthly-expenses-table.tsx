"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  SortableTableHead,
  useSortableData,
} from "@/components/ui/sortable-table-client";
import { ExpenseActionButtons } from "@/components/expense-action-buttons";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, Download } from "lucide-react";
import {
  formatArsToCryptoUsd,
  type CryptoDollarRate,
} from "@/lib/crypto-dollar";

// Tipo para los elementos mensuales
type MonthlyExpenseItem = {
  expenseId: string;
  name: string;
  categoryName: string;
  subcategoryName: string;
  frequency: string;
  estimatedAmount: number;
  actualAmount: number | null;
  isPaid: boolean;
  isSkipped: boolean;
  paidAt: Date | null;
  skippedAt: Date | null;
  hasOccurrence: boolean;
  hasInstallments: boolean;
  isHidden?: boolean;
};

interface MonthlyExpensesTableProps {
  data: MonthlyExpenseItem[];
  year: number;
  month: number;
  emptyMessage?: string;
  cryptoDollarRate: CryptoDollarRate | null;
}

export function MonthlyExpensesTable({
  data,
  year,
  month,
  emptyMessage = "No tienes gastos programados para este mes",
  cryptoDollarRate,
}: MonthlyExpensesTableProps) {
  const frequencyColors = {
    WEEKLY: "bg-muted text-foreground",
    MONTHLY: "bg-primary/10 text-primary",
    ANNUAL: "bg-accent/10 text-accent-foreground",
    ONE_TIME: "bg-muted text-foreground",
  };

  const getStatusName = (expense: MonthlyExpenseItem) => {
    switch (expense.frequency) {
      case "WEEKLY":
        return "Semanal";
      case "MONTHLY":
        return "Mensual";
      case "ANNUAL":
        return "Anual";
      case "ONE_TIME":
        return "Único";
    }
  };

  // Función para obtener el valor de ordenamiento
  const getSortValue = React.useCallback(
    (item: MonthlyExpenseItem, key: string) => {
      switch (key) {
        case "name":
          return item.name;
        case "categoryName":
          return item.categoryName;
        case "frequency":
          return item.frequency;
        case "estimatedAmount":
          return item.estimatedAmount;
        case "actualAmount":
          return item.actualAmount || 0;
        case "status":
          if (!item.hasOccurrence) return 0;
          if (item.isSkipped) return 1;
          if (item.isPaid) return 2;
          return 3; // pending
        default:
          return "";
      }
    },
    [],
  );

  const { sortedData, sortConfig, requestSort } = useSortableData(
    data,
    getSortValue,
  );

  function exportToCsv() {
    const headers = [
      "Gasto",
      "Categoría",
      "Subcategoría",
      "Frecuencia",
      "Estimado",
      "Actual",
      "Estado",
      "Pagado",
      "Omitido",
      "FechaPago",
      "FechaOmitido",
      "ConCuotas",
    ];

    const rows = sortedData.map((item) => {
      const status = !item.hasOccurrence
        ? "Sin ocurrencias"
        : item.isSkipped
          ? "Omitido"
          : item.isPaid
            ? "Pagado"
            : "Pendiente";
      const paidAt = item.paidAt ? new Date(item.paidAt).toISOString() : "";
      const skippedAt = item.skippedAt
        ? new Date(item.skippedAt).toISOString()
        : "";
      return [
        item.name,
        item.categoryName,
        item.subcategoryName,
        getStatusName(item),
        item.estimatedAmount ?? "",
        item.actualAmount ?? "",
        status,
        item.isPaid ? "Sí" : "No",
        item.isSkipped ? "Sí" : "No",
        paidAt,
        skippedAt,
        item.hasInstallments ? "Sí" : "No",
      ];
    });

    const csvContent = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gastos_${year}_${String(month).padStart(2, "0")}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableTableHead
            sortKey="name"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Gasto
          </SortableTableHead>
          <SortableTableHead
            sortKey="categoryName"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Categoría
          </SortableTableHead>
          <SortableTableHead
            sortKey="frequency"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Frecuencia
          </SortableTableHead>
          <SortableTableHead
            sortKey="estimatedAmount"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Estimado
          </SortableTableHead>
          <SortableTableHead
            sortKey="actualAmount"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Actual
          </SortableTableHead>
          <SortableTableHead
            sortKey="status"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Estado
          </SortableTableHead>
          <SortableTableHead
            sortable={false}
            sortKey="actions"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            <div className="flex items-center justify-end gap-2">
              <span>Acciones</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={exportToCsv}
                title="Descargar CSV"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </SortableTableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((item) => (
          <TableRow key={item.expenseId}>
            <TableCell>
              <div className="flex flex-col">
                <span className={`font-medium flex items-center gap-2`}>
                  {item.name}
                  {item.hasInstallments ? (
                    <CreditCard className="h-3.5 w-3.5 text-primary" />
                  ) : null}
                  {item.isHidden ? (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 text-muted-foreground no-underline"
                    >
                      Oculto
                    </Badge>
                  ) : null}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.categoryName} / {item.subcategoryName}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{item.categoryName}</Badge>
            </TableCell>
            <TableCell>
              <Badge
                variant="secondary"
                className={
                  frequencyColors[
                    item.frequency as keyof typeof frequencyColors
                  ]
                }
              >
                {getStatusName(item)}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium">
                  {formatCurrency(item.estimatedAmount)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatArsToCryptoUsd(
                    item.estimatedAmount,
                    cryptoDollarRate,
                  ) ?? "Cotización no disponible"}
                </span>
              </div>
            </TableCell>
            <TableCell>
              {item.actualAmount ? (
                <span className="text-primary font-medium">
                  {formatCurrency(item.actualAmount)}
                </span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </TableCell>
            <TableCell>
              {!item.hasOccurrence ? (
                <Badge variant="destructive">Sin ocurrencias</Badge>
              ) : item.isSkipped ? (
                <Badge variant="outline" className="text-accent-foreground">
                  Omitido
                </Badge>
              ) : item.isPaid ? (
                <Badge variant="default">Pagado</Badge>
              ) : (
                <Badge variant="outline">Pendiente</Badge>
              )}
            </TableCell>
            <TableCell>
              {item.hasOccurrence && (
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
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
