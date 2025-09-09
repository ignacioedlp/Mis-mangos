"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DollarSign } from "lucide-react"
import { setSalary } from "@/actions/expense-actions"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

interface SalaryDialogProps {
  year: number
  month: number
  currentSalary?: number
}

export function SalaryDialog({ year, month, currentSalary }: SalaryDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      const amount = Number(formData.get("amount") || 0)
      
      if (amount <= 0) {
        toast.error("Salary amount must be greater than 0")
        return
      }
      
      await setSalary({ amount, year, month })
      toast.success("Salary updated successfully!")
      setOpen(false)
    } catch {
      toast.error("Failed to update salary")
    } finally {
      setLoading(false)
    }
  }

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <DollarSign className="h-4 w-4 mr-2" />
          {currentSalary ? `Salary: ${formatCurrency(currentSalary)}` : "Set Salary"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Establecer Salario Mensual</DialogTitle>
          <DialogDescription>
            Establece tu salario para {monthName} para calcular las proporciones de gastos y la tasa de ahorro.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="salary-amount">Salario Mensual ($)</Label>
            <Input 
              id="salary-amount" 
              name="amount" 
              type="number" 
              step="0.01" 
              defaultValue={currentSalary?.toFixed(2) || ""}
              placeholder="5000.00"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Salario"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
