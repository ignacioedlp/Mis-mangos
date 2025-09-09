"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { togglePaid } from "@/actions/expense-actions"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

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
          {isPaid ? "Pagado" : "Marcar como pagado"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
              {isPaid ? "Desmarcar como Pagado" : "Marcar como Pagado"}
          </DialogTitle>
          <DialogDescription>
            {isPaid 
              ? `Desmarcar "${expenseName}" como pagado para este mes.`
              : `Marcar "${expenseName}" como pagado y opcionalmente ajustar el monto final.`
            }
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          {!isPaid && (
            <div className="grid gap-2">
              <Label htmlFor="final-amount">Monto Final ($)</Label>
              <Input 
                id="final-amount" 
                name="finalAmount" 
                type="number" 
                step="0.01" 
                defaultValue={formatCurrency(estimatedAmount)}
                placeholder="0.00"
                required
              />
              <p className="text-xs text-muted-foreground">
                Estimado: {formatCurrency(estimatedAmount)}
              </p>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Actualizando..." : (isPaid ? "Desmarcar" : "Marcar como Pagado")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
