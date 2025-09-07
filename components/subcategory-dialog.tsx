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
          Add Subcategory
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Subcategory</DialogTitle>
          <DialogDescription>Add a subcategory to better organize your expenses.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="subcategory-name">Subcategory Name</Label>
            <Input 
              id="subcategory-name" 
              name="name" 
              placeholder="e.g., Electricity, Groceries, Gas" 
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="parent-category">Parent Category</Label>
            <select 
              id="parent-category" 
              name="categoryId" 
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
              required
            >
              <option value="">Select a category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Subcategory"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
