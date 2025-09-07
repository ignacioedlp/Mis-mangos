"use client"

import { useState } from "react"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"
import { getSubcategoryDeletionInfo, deleteSubcategory } from "@/actions/expense-actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface DeleteSubcategoryButtonProps {
  subcategoryId: string
  subcategoryName: string
}

export function DeleteSubcategoryButton({ subcategoryId, subcategoryName }: DeleteSubcategoryButtonProps) {
  const [deletionInfo, setDeletionInfo] = useState<{
    expenses: { id: string; name: string }[]
    totalItems: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const loadDeletionInfo = async () => {
    try {
      setIsLoading(true)
      const info = await getSubcategoryDeletionInfo(subcategoryId)
      setDeletionInfo(info)
    } catch (error) {
      toast.error("Error al cargar información de eliminación")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteSubcategory(subcategoryId)
      toast.success(`Subcategoría "${subcategoryName}" eliminada correctamente`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al eliminar la subcategoría")
      throw error // Re-throw para que el dialog maneje el estado de loading
    }
  }

  const getWarningMessage = () => {
    if (!deletionInfo || deletionInfo.totalItems === 0) return undefined
    
    return `Esta acción eliminará permanentemente ${deletionInfo.expenses.length} gasto(s): ${deletionInfo.expenses.map(e => e.name).join(", ")}`
  }

  return (
    <DeleteConfirmationDialog
      title="Eliminar Subcategoría"
      description="¿Estás seguro de que quieres eliminar esta subcategoría? Esta acción no se puede deshacer."
      warningMessage={getWarningMessage()}
      itemName={subcategoryName}
      onConfirm={handleDelete}
      isLoading={isLoading}
    >
      <div onClick={loadDeletionInfo} className="inline">
        <button 
          type="button"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent h-8 w-8 p-0 text-destructive hover:text-destructive"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </DeleteConfirmationDialog>
  )
}
