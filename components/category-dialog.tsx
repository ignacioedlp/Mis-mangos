"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { createCategory } from "@/actions/expense-actions"
import { toast } from "sonner"

export function CreateCategoryDialog() {
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
      
      await createCategory({ name, budgetPercentage: budgetPercentageValue })
      toast.success("Category created successfully!")
      setOpen(false)
    } catch {
      toast.error("Failed to create category")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>Add a new expense category and optionally set a budget percentage.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="category-name">Category Name</Label>
            <Input 
              id="category-name" 
              name="name" 
              placeholder="e.g., Utilities, Food, Transportation" 
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="budget-percentage">Budget Percentage (Optional)</Label>
            <Input 
              id="budget-percentage" 
              name="budgetPercentage" 
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="e.g., 30 (for 30% of income)"
            />
            <p className="text-xs text-muted-foreground">
              What percentage of your monthly income should be allocated to this category?
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
