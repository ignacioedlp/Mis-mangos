"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { createSubcategory } from "@/actions/expense-actions"
import { toast } from "sonner"

interface CreateSubcategoryDialogProps {
  categories: Array<{ id: string; name: string }>
}

export function CreateSubcategoryDialog({ categories }: CreateSubcategoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      const name = String(formData.get("name") || "")
      const categoryId = String(formData.get("categoryId") || "")
      
      if (!name.trim()) {
        toast.error("Subcategory name is required")
        return
      }
      
      if (!categoryId) {
        toast.error("Please select a category")
        return
      }
      
      await createSubcategory({ name, categoryId })
      toast.success("Subcategory created successfully!")
      setOpen(false)
    } catch {
      toast.error("Failed to create subcategory")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={categories.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Subcategoría
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nueva Subcategoría</DialogTitle>
          <DialogDescription>Agrega una subcategoría para organizar mejor tus gastos.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="subcategory-name">Nombre de la Subcategoría</Label>
            <Input 
              id="subcategory-name" 
              name="name" 
              placeholder="e.g., Electricidad, Compras, Gas" 
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="parent-category">Categoría Principal</Label>
            <select 
              id="parent-category" 
              name="categoryId" 
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
              required
            >
              <option value="">Selecciona una categoría...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Subcategoría"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
