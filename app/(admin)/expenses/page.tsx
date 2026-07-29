import { listCategories, listExpenses, listSubcategories } from "@/actions/expense-actions"
import { DollarSign, Calendar, FolderTree, ReceiptText } from "lucide-react"
import { AdminPageHeader } from "@/components/admin-page-header"
import { CreateExpenseDialog } from "@/components/expense-dialog"
import { DeletedExpensesDialog } from "@/components/deleted-expenses-dialog"
import { ExpensesTable } from "@/components/tables/expenses-table"
import { formatCurrency } from "@/lib/utils"
import { SummaryStrip } from "@/components/summary-strip"
import { DataSection } from "@/components/data-section"

async function Prefetch() {
  const [categories, subcategories, expenses] = await Promise.all([
    listCategories(),
    listSubcategories(),
    listExpenses(),
  ])
  return { categories, subcategories, expenses }
}

export default async function ExpensesPage() {
  const { categories, subcategories, expenses } = await Prefetch()

  const totalEstimated = expenses.reduce((sum: number, expense: { displayAmount: number }) => sum + expense.displayAmount, 0)
  const totalSubcategories = subcategories.length

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Catálogo"
        title="Gestión de Gastos"
        description="Administra tus gastos recurrentes y optimiza tu presupuesto."
        actions={
          <>
          <DeletedExpensesDialog />
          <CreateExpenseDialog categories={categories} subcategories={subcategories} />
          </>
        }
      />

      <SummaryStrip
        aria-label="Resumen de gastos recurrentes"
        items={[
          { label: "Estimado mensual", value: formatCurrency(totalEstimated), detail: "Proyección recurrente", icon: DollarSign, tone: "accent" },
          { label: "Gastos activos", value: expenses.length, detail: "Recurrentes y únicos", icon: ReceiptText },
          { label: "Categorías", value: categories.length, detail: "Categorías activas", icon: FolderTree },
          { label: "Subcategorías", value: totalSubcategories, detail: "Clasificaciones disponibles", icon: Calendar },
        ]}
      />

      <DataSection
        title="Lista de gastos"
        description="Administrá tus gastos recurrentes y sus condiciones."
      >
          <ExpensesTable
            data={expenses}
            categories={categories}
            subcategories={subcategories}
            emptyMessage="No hay gastos aún. Crea tu primer gasto para comenzar"
            emptyIcon={<DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />}
          />
      </DataSection>
    </div>
  )
}
