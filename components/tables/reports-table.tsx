"use client"

import * as React from "react"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, BarChart3, TrendingUp, PieChart, Calendar, CheckCircle, AlertTriangle, Clock, Loader2 } from "lucide-react"
import { SortableTableHead, useSortableData } from "@/components/ui/sortable-table-client"
import { ReportActions } from "@/components/table-actions/report-actions"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Tipo para los reportes
type ReportData = {
  id: string
  title: string
  description: string | null
  type: string
  status: string
  startDate: Date
  endDate: Date
  generatedAt: Date | null
  downloadCount: number
}

interface ReportsTableProps {
  data: ReportData[]
  emptyMessage?: string
  emptyIcon?: React.ReactNode
}

export function ReportsTable({ 
  data, 
  emptyMessage = "No tienes reportes generados aún",
  emptyIcon 
}: ReportsTableProps) {
  function getTypeLabel(type: string) {
    switch (type) {
      case "MONTHLY_SUMMARY":
        return "Resumen mensual"
      case "BUDGET_ANALYSIS":
        return "Análisis de presupuesto"
      case "SPENDING_TRENDS":
        return "Tendencias de gasto"
      case "CATEGORY_BREAKDOWN":
        return "Por categoría"
      default:
        return type.replaceAll("_", " ").toLowerCase()
    }
  }

  function getReportIcon(type: string) {
    switch (type) {
      case "MONTHLY_SUMMARY":
        return <Calendar className="h-4 w-4 text-primary" />
      case "BUDGET_ANALYSIS":
        return <PieChart className="h-4 w-4 text-primary" />
      case "SPENDING_TRENDS":
        return <TrendingUp className="h-4 w-4 text-accent-foreground" />
      case "CATEGORY_BREAKDOWN":
        return <BarChart3 className="h-4 w-4 text-accent-foreground" />
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "COMPLETED":
        return "bg-primary/10 text-primary"
      case "GENERATING":
        return "bg-accent/10 text-accent-foreground"
      case "PENDING":
        return "bg-muted text-foreground"
      case "FAILED":
        return "bg-destructive/10 text-destructive"
      default:
        return "bg-muted text-foreground"
    }
  }

  function getStatusBadge(status: string) {
    const base = `inline-flex items-center gap-1.5 ${getStatusColor(status)} capitalize` as const
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className={`${base}`}>
            <CheckCircle className="h-3.5 w-3.5" /> Completado
          </Badge>
        )
      case "GENERATING":
        return (
          <Badge className={`${base}`}>
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Generando
          </Badge>
        )
      case "PENDING":
        return (
          <Badge className={`${base}`}>
            <Clock className="h-3.5 w-3.5" /> Pendiente
          </Badge>
        )
      case "FAILED":
        return (
          <Badge className={`${base}`}>
            <AlertTriangle className="h-3.5 w-3.5" /> Fallido
          </Badge>
        )
      default:
        return <Badge className={`${base}`}>{status.toLowerCase()}</Badge>
    }
  }

  function formatPeriod(startDate: Date, endDate: Date) {
    try {
      const from = format(new Date(startDate), "MMM yyyy", { locale: es })
      const to = format(new Date(endDate), "MMM yyyy", { locale: es })
      return `${from} — ${to}`
    } catch {
      return `${new Date(startDate).toLocaleDateString('es-AR')} - ${new Date(endDate).toLocaleDateString('es-AR')}`
    }
  }

  function formatDate(d: Date | null) {
    if (!d) return "-"
    try {
      return format(new Date(d), "dd MMM yyyy, HH:mm", { locale: es })
    } catch {
      return new Date(d).toLocaleDateString('es-AR')
    }
  }

  // Función para obtener el valor de ordenamiento
  const getSortValue = React.useCallback((item: ReportData, key: string) => {
    switch (key) {
      case 'title':
        return item.title
      case 'type':
        return item.type
      case 'period':
        return new Date(item.startDate).getTime()
      case 'status':
        return item.status
      case 'generatedAt':
        if (!item.generatedAt) return 0
        return new Date(item.generatedAt).getTime()
      case 'downloadCount':
        return item.downloadCount
      default:
        return ''
    }
  }, [])

  const { sortedData, sortConfig, requestSort } = useSortableData(data, getSortValue)

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyIcon && <div className="mb-4">{emptyIcon}</div>}
        <p className="text-lg font-medium mb-2">No tienes reportes generados aún</p>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableTableHead
            sortKey="title"
            currentSort={sortConfig}
            onSort={requestSort}
            className="min-w-[260px]"
          >
            Reporte
          </SortableTableHead>
          <SortableTableHead
            sortKey="type"
            currentSort={sortConfig}
            onSort={requestSort}
            className="w-[160px]"
          >
            Tipo
          </SortableTableHead>
          <SortableTableHead
            sortKey="period"
            currentSort={sortConfig}
            onSort={requestSort}
            className="w-[220px]"
          >
            Periodo
          </SortableTableHead>
          <SortableTableHead
            sortKey="status"
            currentSort={sortConfig}
            onSort={requestSort}
            className="w-[160px]"
          >
            Estado
          </SortableTableHead>
          <SortableTableHead
            sortKey="generatedAt"
            currentSort={sortConfig}
            onSort={requestSort}
            className="w-[200px]"
          >
            Generado el
          </SortableTableHead>
          <SortableTableHead
            sortKey="downloadCount"
            currentSort={sortConfig}
            onSort={requestSort}
            className="w-[120px] text-right"
          >
            Descargas
          </SortableTableHead>
          <SortableTableHead
            sortable={false}
            sortKey="actions"
            currentSort={sortConfig}
            onSort={requestSort}
            className="w-32"
          >
            Acciones
          </SortableTableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((report) => (
          <TableRow key={report.id} className="hover:bg-muted/50">
            <TableCell>
              <div className="flex items-center gap-3">
                {getReportIcon(report.type)}
                <div>
                  <div className="font-medium">{report.title}</div>
                  {report.description && (
                    <div className="text-sm text-muted-foreground">
                      {report.description}
                    </div>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                {getTypeLabel(report.type)}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="text-sm">{formatPeriod(report.startDate, report.endDate)}</div>
            </TableCell>
            <TableCell>
              {getStatusBadge(report.status)}
            </TableCell>
            <TableCell>
              <div className="text-sm">{formatDate(report.generatedAt)}</div>
            </TableCell>
            <TableCell>
              <div className="text-sm text-right font-mono tabular-nums">
                {report.downloadCount}
              </div>
            </TableCell>
            <TableCell>
              <ReportActions reportId={report.id} status={report.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
