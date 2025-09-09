"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { listDeletedExpenses, restoreExpense } from "@/actions/expense-actions"
import { toast } from "sonner"
import { Trash2, RotateCcw } from "lucide-react"
import { DeletedExpenseDTO } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

export function DeletedExpensesDialog() {
  const [open, setOpen] = useState(false)
  const [deletedExpenses, setDeletedExpenses] = useState<DeletedExpenseDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [restoring, setRestoring] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      loadDeletedExpenses()
    }
  }, [open])

  async function loadDeletedExpenses() {
    setLoading(true)
    try {
      const expenses = await listDeletedExpenses()
      setDeletedExpenses(expenses as DeletedExpenseDTO[])
    } catch {
      toast.error("Failed to load deleted expenses")
    } finally {
      setLoading(false)
    }
  }

  async function handleRestore(expenseId: string) {
    setRestoring(expenseId)
    try {
      await restoreExpense(expenseId)
      toast.success("Expense restored successfully!")
      // Remove from the list
      setDeletedExpenses(prev => prev.filter(expense => expense.id !== expenseId))
    } catch {
      toast.error("Failed to restore expense")
    } finally {
      setRestoring(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Gastos Eliminados
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Gastos Eliminados</DialogTitle>
          <DialogDescription>
            Visualiza y restaura gastos eliminados previamente. Estos gastos fueron eliminados de forma suave y pueden ser recuperados.
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-sm text-muted-foreground">Cargando...</div>
            </div>
          ) : deletedExpenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron gastos eliminados.</p>
              <p className="text-sm">¡Todos tus gastos están activos!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deletedExpenses.map((expense) => (
                <Card key={expense.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{expense.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {expense.frequency}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {expense.category.name} / {expense.subcategory.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Eliminado el {new Date(expense.deletedAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm font-medium">
                        {formatCurrency(expense.estimatedAmount)}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(expense.id)}
                      disabled={restoring === expense.id}
                    >
                      {restoring === expense.id ? (
                        <>
                          <div className="h-3 w-3 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          Restaurando...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-3 w-3 mr-2" />
                          Restaurar
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
