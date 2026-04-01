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
import {
  SortableTableHead,
  useSortableData,
} from "@/components/ui/sortable-table-client";
import { ExpenseDeleteButton } from "@/components/table-actions/expense-delete-button";
import { DuplicateExpenseButton } from "@/components/duplicate-expense-button";
import { EditExpenseDialog } from "@/components/edit-expense-dialog";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

// Tipo para los gastos con relaciones incluidas
type ExpenseWithRelations = {
  id: string;
  name: string;
  estimatedAmount: number;
  displayAmount: number;
  frequency: string;
  categoryId: string;
  subcategoryId: string;
  category: {
    name: string;
  };
  subcategory: {
    name: string;
  };
  hasInstallments: boolean;
};

interface ExpensesTableProps {
  data: ExpenseWithRelations[];
  categories: Array<{ id: string; name: string }>;
  subcategories: Array<{ id: string; name: string; categoryId: string }>;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

export function ExpensesTable({
  data,
  categories,
  subcategories,
  emptyMessage = "No hay gastos aún. Crea tu primer gasto para comenzar",
  emptyIcon,
}: ExpensesTableProps) {
  const frequencyColors = {
    WEEKLY: "bg-muted text-foreground",
    MONTHLY: "bg-primary/10 text-primary",
    ANNUAL: "bg-accent/10 text-accent-foreground",
    ONE_TIME: "bg-muted text-foreground",
  };

  // Función para obtener el valor de ordenamiento
  const getSortValue = React.useCallback(
    (item: ExpenseWithRelations, key: string) => {
      switch (key) {
        case "name":
          return item.name;
        case "category":
          return item.category.name;
        case "estimatedAmount":
          return Number(item.displayAmount);
        case "frequency":
          return item.frequency;
        default:
          return "";
      }
    },
    [],
  );

  const getStatusName = (expense: ExpenseWithRelations) => {
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

  const { sortedData, sortConfig, requestSort } = useSortableData(
    data,
    getSortValue,
  );

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyIcon && <div className="mb-4">{emptyIcon}</div>}
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
            Nombre
          </SortableTableHead>
          <SortableTableHead
            sortKey="category"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Categoría
          </SortableTableHead>
          <SortableTableHead
            sortKey="estimatedAmount"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Monto
          </SortableTableHead>
          <SortableTableHead
            sortKey="frequency"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Frecuencia
          </SortableTableHead>
          <SortableTableHead
            sortable={false}
            sortKey="actions"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Acciones
          </SortableTableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((expense) => (
          <TableRow key={expense.id}>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium">{expense.name}</span>
                <span className="text-xs text-muted-foreground">
                  {expense.category.name} / {expense.subcategory.name}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{expense.category.name}</Badge>
            </TableCell>
            <TableCell>
              <span className="font-medium">
                {formatCurrency(expense.displayAmount)}
              </span>
            </TableCell>
            <TableCell>
              <Badge
                variant="secondary"
                className={
                  frequencyColors[
                    expense.frequency as keyof typeof frequencyColors
                  ]
                }
              >
                {getStatusName(expense)}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <EditExpenseDialog
                  expense={{
                    id: expense.id,
                    name: expense.name,
                    frequency: expense.frequency,
                    categoryId: expense.categoryId,
                    subcategoryId: expense.subcategoryId,
                  }}
                  categories={categories}
                  subcategories={subcategories}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  title="Gestionar cuotas"
                >
                  <Link href={`/expenses/${expense.id}/installments`}>
                    <CreditCard
                      className={
                        expense.hasInstallments
                          ? "h-4 w-4 text-primary"
                          : "h-4 w-4"
                      }
                    />
                  </Link>
                </Button>
                <DuplicateExpenseButton
                  expenseId={expense.id}
                  expenseName={expense.name}
                />
                <ExpenseDeleteButton expenseId={expense.id} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
