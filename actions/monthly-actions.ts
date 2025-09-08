"use server"

import { togglePaid, skipOccurrence } from "@/actions/expense-actions"
import { revalidatePath } from "next/cache"

export async function togglePaidAction(expenseId: string, year: number, month: number, formData: FormData) {
  const finalAmount = Number(formData.get("finalAmount") || 0)
  
  if (finalAmount <= 0) {
    throw new Error("Amount must be greater than 0")
  }
  
  await togglePaid(expenseId, year, month, finalAmount)
  revalidatePath('/monthly')
}

export async function skipOccurrenceAction(expenseId: string, year: number, month: number) {
  await skipOccurrence(expenseId, year, month)
  revalidatePath('/monthly')
}
