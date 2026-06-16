import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CreditCard } from "lucide-react";

import { AdminPageHeader } from "@/components/admin-page-header";
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
      <AdminPageHeader
        eyebrow="Financiación"
        title={`Cuotas de ${expense.name}`}
        description="Gestioná compras financiadas y su progreso de pago mensual."
        actions={
          <>
          <Button variant="outline" asChild>
            <Link href="/expenses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a gastos
            </Link>
          </Button>
          <InstallmentPurchaseForm expenseId={expenseId} />
          </>
        }
      />

      <Card className="border-border/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif text-lg font-bold tracking-normal">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            Compras en cuotas
          </CardTitle>
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
