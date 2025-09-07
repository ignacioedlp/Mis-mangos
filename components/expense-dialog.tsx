"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { createExpense } from "@/actions/expense-actions"
import { toast } from "sonner"

interface CreateExpenseDialogProps {
  categories: Array<{ id: string; name: string }>
  subcategories: Array<{ id: string; name: string; categoryId: string }>
}

export function CreateExpenseDialog({ categories, subcategories }: CreateExpenseDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      const name = String(formData.get("name") || "")
      const estimatedAmount = Number(formData.get("estimatedAmount") || 0)
      const frequency = String(formData.get("frequency") || "MONTHLY") as "WEEKLY" | "MONTHLY" | "ANNUAL"
      const categoryId = String(formData.get("categoryId") || "")
      const subcategoryId = String(formData.get("subcategoryId") || "")
      
      if (!name.trim()) {
        toast.error("Expense name is required")
        return
      }
      
      if (estimatedAmount <= 0) {
        toast.error("Amount must be greater than 0")
        return
      }
      
      if (!categoryId) {
        toast.error("Please select a category")
        return
      }
      
      if (!subcategoryId) {
        toast.error("Please select a subcategory")
        return
      }
      
      await createExpense({ name, estimatedAmount, frequency, categoryId, subcategoryId })
      toast.success("Expense created successfully!")
      setOpen(false)
    } catch {
      toast.error("Failed to create expense")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Expense</DialogTitle>
          <DialogDescription>Add a new recurring expense to track your spending.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="expense-name">Expense Name</Label>
            <Input 
              id="expense-name" 
              name="name" 
              placeholder="e.g., Rent, Internet, Groceries" 
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="expense-amount">Estimated Amount ($)</Label>
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
            <Label htmlFor="expense-frequency">Frequency</Label>
            <select 
              id="expense-frequency" 
              name="frequency" 
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
              required
            >
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="ANNUAL">Annual</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="expense-category">Category</Label>
            <select 
              id="expense-category" 
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
          <div className="grid gap-2">
            <Label htmlFor="expense-subcategory">Subcategory</Label>
            <select 
              id="expense-subcategory" 
              name="subcategoryId" 
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
              required
            >
              <option value="">Select a subcategory...</option>
              {subcategories.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
