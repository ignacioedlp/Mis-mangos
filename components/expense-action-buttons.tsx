"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { togglePaidAction, skipOccurrenceAction } from "@/actions/monthly-actions"
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
  const [isPending, startTransition] = useTransition()

  const handleTogglePaid = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await togglePaidAction(expenseId, year || new Date().getFullYear(), month || new Date().getMonth() + 1, formData)
        toast.success(isPaid ? "Expense unmarked as paid" : "Expense marked as paid!")
        setPaidOpen(false)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update expense")
      }
    })
  }

  const handleToggleSkip = () => {
    startTransition(async () => {
      try {
        await skipOccurrenceAction(expenseId, year || new Date().getFullYear(), month || new Date().getMonth() + 1)
        toast.success(isSkipped ? "Expense unskipped for this month" : "Expense skipped for this month!")
      } catch {
        toast.error("Failed to skip expense")
      }
    })
  }

  // If expense is skipped, show different UI
  if (isSkipped) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-orange-600 font-medium">Salteado</span>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleToggleSkip}
          disabled={isPending}
        >
          <Calendar className="h-3 w-3 mr-1" />
          Restaurar
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
        disabled={isPending}
        title="Saltar esta ocurrencia"
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
                Desmarcar
              </>
            ) : (
              <>
                <Check className="h-3 w-3 mr-1" />
                Marcar como pagado
              </>
            )}
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
          <form action={handleTogglePaid} className="space-y-4">
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
              <Button type="button" variant="outline" onClick={() => setPaidOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Actualizando..." : (isPaid ? "Desmarcar" : "Marcar como Pagado")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
