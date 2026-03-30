import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CreditCard } from "lucide-react";

import { listExpenses } from "@/actions/expense-actions";
import { listInstallmentPurchases } from "@/actions/installment-actions";
import { InstallmentPurchaseForm } from "@/components/installment-purchase-form";
import { InstallmentPurchasesList } from "@/components/installment-purchases-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface InstallmentsPageProps {
  params: Promise<{ expenseId: string }>;
}

export default async function InstallmentsPage({
  params,
}: InstallmentsPageProps) {
  const { expenseId } = await params;

  const [expenses, purchases] = await Promise.all([
    listExpenses(),
    listInstallmentPurchases(expenseId),
  ]);

  const expense = expenses.find((item) => item.id === expenseId);

  if (!expense) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 font-serif text-3xl font-extrabold tracking-tight">
            <CreditCard className="h-7 w-7 text-primary" />
            Cuotas de {expense.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            Gestioná compras financiadas y su progreso de pago mensual.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/expenses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a gastos
            </Link>
          </Button>
          <InstallmentPurchaseForm expenseId={expenseId} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compras en cuotas</CardTitle>
          <CardDescription>
            Revisá cuotas pagadas, pendientes y eliminá registros incorrectos
            cuando sea necesario.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InstallmentPurchasesList purchases={purchases} />
        </CardContent>
      </Card>
    </div>
  );
}
