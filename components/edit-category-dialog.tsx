"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Edit } from "lucide-react"
import { updateCategory } from "@/actions/expense-actions"
import { toast } from "sonner"
import { CategoryDTO } from "@/lib/types"

interface EditCategoryDialogProps {
  category: CategoryDTO
}

export function EditCategoryDialog({ category }: EditCategoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      const name = String(formData.get("name") || "")
      const budgetPercentage = formData.get("budgetPercentage")
      
      if (!name.trim()) {
        toast.error("Category name is required")
        return
      }

      const budgetPercentageValue = budgetPercentage ? Number(budgetPercentage) : null
      if (budgetPercentageValue !== null && (budgetPercentageValue < 0 || budgetPercentageValue > 100)) {
        toast.error("Budget percentage must be between 0 and 100")
        return
      }
      
      await updateCategory(category.id, { name, budgetPercentage: budgetPercentageValue })
      toast.success("Category updated successfully!")
      setOpen(false)
    } catch {
      toast.error("Failed to update category")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar categoría</DialogTitle>
          <DialogDescription>Actualiza el nombre de la categoría y el porcentaje del presupuesto.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-category-name">Nombre de la categoría</Label>
            <Input 
              id="edit-category-name" 
              name="name" 
              defaultValue={category.name}
              placeholder="e.g., Utilities, Food, Transportation" 
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-budget-percentage">Porcentaje del Presupuesto (Opcional)</Label>
            <Input 
              id="edit-budget-percentage" 
              name="budgetPercentage" 
              type="number"
              min="0"
              max="100"
              step="0.01"
              defaultValue={category.budgetPercentage || ""}
              placeholder="e.g., 30 (for 30% of income)"
            />
            <p className="text-xs text-muted-foreground">
              ¿Qué porcentaje de tus ingresos mensuales debería asignarse a esta categoría?
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar categoría"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
