"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { createExpense } from "@/actions/expense-actions"
import { toast } from "sonner"

interface CreateExpenseDialogProps {
  categories: Array<{ id: string; name: string; budgetPercentage?: number | null }>
  subcategories: Array<{ id: string; name: string; categoryId: string }>
}

export function CreateExpenseDialog({ categories, subcategories }: CreateExpenseDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState("")

  // Filtrar subcategorías basadas en la categoría seleccionada
  const filteredSubcategories = useMemo(() => {
    if (!selectedCategoryId) return []
    return subcategories.filter(sub => sub.categoryId === selectedCategoryId)
  }, [selectedCategoryId, subcategories])

  // Función para resetear el formulario cuando se abre el diálogo
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      // Resetear el estado cuando se abre el diálogo
      setSelectedCategoryId("")
    }
  }

  // Función para manejar el cambio de categoría
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
    // Resetear la subcategoría seleccionada cuando cambia la categoría
    const subcategorySelect = document.getElementById("expense-subcategory") as HTMLSelectElement
    if (subcategorySelect) {
      subcategorySelect.value = ""
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      const name = String(formData.get("name") || "")
      const estimatedAmount = Number(formData.get("estimatedAmount") || 0)
      const frequency = String(formData.get("frequency") || "MONTHLY") as "WEEKLY" | "MONTHLY" | "ANNUAL" | "ONE_TIME"
      const categoryId = String(formData.get("categoryId") || "")
      const subcategoryId = String(formData.get("subcategoryId") || "")
      
      if (!name.trim()) {
        toast.error("El nombre del gasto es requerido")
        return
      }
      
      if (estimatedAmount <= 0) {
        toast.error("El monto debe ser mayor a 0")
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
      
      await createExpense({ name, estimatedAmount, frequency, categoryId, subcategoryId })
      toast.success("¡Gasto creado exitosamente!")
      handleOpenChange(false)
    } catch {
      toast.error("Error al crear el gasto")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Gasto</DialogTitle>
          <DialogDescription>Agrega un nuevo gasto recurrente para hacer seguimiento de tus gastos.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="expense-name">Nombre del Gasto</Label>
            <Input 
              id="expense-name" 
              name="name" 
              placeholder="ej. Renta, Internet, Supermercado" 
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="expense-amount">Monto Estimado ($)</Label>
            <Input 
              id="expense-amount" 
              name="estimatedAmount" 
              type="number" 
              step="0.01" 
              placeholder="0.00"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="expense-frequency">Frecuencia</Label>
            <select 
              id="expense-frequency" 
              name="frequency" 
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
            <Label htmlFor="expense-category">Categoría</Label>
            <select 
              id="expense-category" 
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
            <Label htmlFor="expense-subcategory">Subcategoría</Label>
            <select 
              id="expense-subcategory" 
              name="subcategoryId" 
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
            {selectedCategoryId && filteredSubcategories.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No hay subcategorías para esta categoría. Puedes crear una desde la sección de Categorías.
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Gasto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
