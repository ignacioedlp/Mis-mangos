"use client"

import { Button } from "@/components/ui/button"
import { EyeOff, Trash2 } from "lucide-react"
import { deleteExpense } from "@/actions/expense-actions"
import { useTransition } from "react"

interface ExpenseDeleteButtonProps {
  expenseId: string
}

export function ExpenseDeleteButton({ expenseId }: ExpenseDeleteButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      await deleteExpense(expenseId)
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
    >
      <EyeOff className="h-4 w-4" />
    </Button>
  )
}
