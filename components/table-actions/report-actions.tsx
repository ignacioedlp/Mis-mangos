"use client"

import { Button } from "@/components/ui/button"
import { Download, Trash2 } from "lucide-react"
import { deleteReport } from "@/actions/report-actions"
import { useTransition } from "react"

interface ReportActionsProps {
  reportId: string
  status: string
}

export function ReportActions({ reportId, status }: ReportActionsProps) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      await deleteReport(reportId)
    })
  }

  return (
    <div className="flex items-center gap-1">
      {status === "COMPLETED" && (
        <Button variant="ghost" size="sm" asChild>
          <a href={`/api/reports/${reportId}/download`}>
            <Download className="h-3 w-3" />
          </a>
        </Button>
      )}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleDelete}
        disabled={isPending}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  )
}
