"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Pencil } from "lucide-react"
import { updateExpense } from "@/actions/expense-actions"
import { toast } from "sonner"

interface EditExpenseDialogProps {
  expense: {
    id: string
    name: string
    frequency: string
    categoryId: string
    subcategoryId: string
  }
  categories: Array<{ id: string; name: string }>
  subcategories: Array<{ id: string; name: string; categoryId: string }>
}

export function EditExpenseDialog({ expense, categories, subcategories }: EditExpenseDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState(expense.categoryId)

  const filteredSubcategories = useMemo(() => {
    if (!selectedCategoryId) return []
    return subcategories.filter(sub => sub.categoryId === selectedCategoryId)
  }, [selectedCategoryId, subcategories])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      setSelectedCategoryId(expense.categoryId)
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    const subcategorySelect = document.getElementById(`edit-expense-subcategory-${expense.id}`) as HTMLSelectElement
    if (subcategorySelect) {
      subcategorySelect.value = ""
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      const name = String(formData.get("name") || "")
      const frequency = String(formData.get("frequency") || "MONTHLY") as "WEEKLY" | "MONTHLY" | "ANNUAL" | "ONE_TIME"
      const categoryId = String(formData.get("categoryId") || "")
      const subcategoryId = String(formData.get("subcategoryId") || "")

      if (!name.trim()) {
        toast.error("El nombre del gasto es requerido")
        return
      }

      if (!categoryId) {
        toast.error("Por favor selecciona una categoría")
        return
      }

      if (!subcategoryId) {
        toast.error("Por favor selecciona una subcategoría")
        return
      }

      await updateExpense(expense.id, { name, frequency, categoryId, subcategoryId })
      toast.success("¡Gasto actualizado exitosamente!")
      handleOpenChange(false)
    } catch {
      toast.error("Error al actualizar el gasto")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant="ghost" size="icon" title="Editar gasto" onClick={() => handleOpenChange(true)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Gasto</DialogTitle>
          <DialogDescription>Modifica los datos del gasto recurrente.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor={`edit-expense-name-${expense.id}`}>Nombre del Gasto</Label>
            <Input
              id={`edit-expense-name-${expense.id}`}
              name="name"
              defaultValue={expense.name}
              placeholder="ej. Renta, Internet, Supermercado"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`edit-expense-frequency-${expense.id}`}>Frecuencia</Label>
            <select
              id={`edit-expense-frequency-${expense.id}`}
              name="frequency"
              defaultValue={expense.frequency}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            >
              <option value="WEEKLY">Semanal</option>
              <option value="MONTHLY">Mensual</option>
              <option value="ANNUAL">Anual</option>
              <option value="ONE_TIME">Único (no recurrente)</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`edit-expense-category-${expense.id}`}>Categoría</Label>
            <select
              id={`edit-expense-category-${expense.id}`}
              name="categoryId"
              value={selectedCategoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            >
              <option value="">Selecciona una categoría...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`edit-expense-subcategory-${expense.id}`}>Subcategoría</Label>
            <select
              id={`edit-expense-subcategory-${expense.id}`}
              name="subcategoryId"
              defaultValue={expense.subcategoryId}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              required
              disabled={!selectedCategoryId}
            >
              <option value="">
                {!selectedCategoryId
                  ? "Primero selecciona una categoría..."
                  : filteredSubcategories.length === 0
                    ? "No hay subcategorías disponibles"
                    : "Selecciona una subcategoría..."
                }
              </option>
              {filteredSubcategories.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
