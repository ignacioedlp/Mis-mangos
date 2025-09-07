"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { togglePaid, skipOccurrence } from "@/actions/expense-actions"
import { toast } from "sonner"
import { Calendar, Check, X, SkipForward } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface ExpenseActionButtonsProps {
  expenseId: string
  expenseName: string
  estimatedAmount: number
  isPaid: boolean
  isSkipped: boolean
  year?: number
  month?: number
}

export function ExpenseActionButtons({ 
  expenseId, 
  expenseName, 
  estimatedAmount, 
  isPaid, 
  isSkipped,
  year,
  month 
}: ExpenseActionButtonsProps) {
  const [paidOpen, setPaidOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleTogglePaid(formData: FormData) {
    setLoading(true)
    try {
      const finalAmount = Number(formData.get("finalAmount") || estimatedAmount)
      
      if (finalAmount <= 0) {
        toast.error("Amount must be greater than 0")
        return
      }
      
      await togglePaid(expenseId, year, month, finalAmount)
      toast.success(isPaid ? "Expense unmarked as paid" : "Expense marked as paid!")
      setPaidOpen(false)
    } catch {
      toast.error("Failed to update expense")
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleSkip() {
    setLoading(true)
    try {
      await skipOccurrence(expenseId, year, month)
      toast.success(isSkipped ? "Expense unskipped for this month" : "Expense skipped for this month!")
    } catch {
      toast.error("Failed to skip expense")
    } finally {
      setLoading(false)
    }
  }

  // If expense is skipped, show different UI
  if (isSkipped) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-orange-600 font-medium">Skipped</span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleToggleSkip}
          disabled={loading}
        >
          <Calendar className="h-3 w-3 mr-1" />
          Unskip
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {/* Skip Button */}
      <Button 
        variant="ghost" 
        size="sm"
        onClick={handleToggleSkip}
        disabled={loading}
        title="Skip this expense for this month"
      >
        <SkipForward className="h-3 w-3" />
      </Button>

      {/* Mark Paid Dialog */}
      <Dialog open={paidOpen} onOpenChange={setPaidOpen}>
        <DialogTrigger asChild>
          <Button 
            variant={isPaid ? "outline" : "default"} 
            size="sm"
          >
            {isPaid ? (
              <>
                <X className="h-3 w-3 mr-1" />
                Unmark
              </>
            ) : (
              <>
                <Check className="h-3 w-3 mr-1" />
                Mark paid
              </>
            )}
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
          <form action={handleTogglePaid} className="space-y-4">
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
                  Estimated: {formatCurrency(estimatedAmount)}
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setPaidOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : (isPaid ? "Unmark" : "Mark Paid")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
