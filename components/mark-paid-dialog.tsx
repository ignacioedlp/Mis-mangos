"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { togglePaid } from "@/actions/expense-actions"
import { toast } from "sonner"

interface MarkPaidDialogProps {
  expenseId: string
  expenseName: string
  estimatedAmount: number
  isPaid: boolean
}

export function MarkPaidDialog({ expenseId, expenseName, estimatedAmount, isPaid }: MarkPaidDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      const finalAmount = Number(formData.get("finalAmount") || estimatedAmount)
      
      if (finalAmount <= 0) {
        toast.error("Amount must be greater than 0")
        return
      }
      
      await togglePaid(expenseId, undefined, undefined, finalAmount)
      toast.success(isPaid ? "Expense unmarked as paid" : "Expense marked as paid!")
      setOpen(false)
    } catch {
      toast.error("Failed to update expense")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={isPaid ? "outline" : "default"} 
          size="sm"
        >
          {isPaid ? "Unmark" : "Mark paid"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isPaid ? "Unmark as Paid" : "Mark as Paid"}
          </DialogTitle>
          <DialogDescription>
            {isPaid 
              ? `Unmark "${expenseName}" as paid for this month.`
              : `Mark "${expenseName}" as paid and optionally adjust the final amount.`
            }
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          {!isPaid && (
            <div className="grid gap-2">
              <Label htmlFor="final-amount">Final Amount ($)</Label>
              <Input 
                id="final-amount" 
                name="finalAmount" 
                type="number" 
                step="0.01" 
                defaultValue={estimatedAmount.toFixed(2)}
                placeholder="0.00"
                required
              />
              <p className="text-xs text-muted-foreground">
                Estimated: ${estimatedAmount.toFixed(2)}
              </p>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : (isPaid ? "Unmark" : "Mark Paid")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
