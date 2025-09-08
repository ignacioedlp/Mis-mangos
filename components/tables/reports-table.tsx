"use client"

import * as React from "react"
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, BarChart3, TrendingUp, PieChart, Calendar } from "lucide-react"
import { SortableTableHead, useSortableData } from "@/components/ui/sortable-table-client"
import { ReportActions } from "@/components/table-actions/report-actions"

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
  emptyMessage = "No reports generated yet. Use the generator above to create your first report",
  emptyIcon 
}: ReportsTableProps) {
  function getReportIcon(type: string) {
    switch (type) {
      case "MONTHLY_SUMMARY":
        return <Calendar className="h-4 w-4 text-blue-600" />
      case "BUDGET_ANALYSIS":
        return <PieChart className="h-4 w-4 text-green-600" />
      case "SPENDING_TRENDS":
        return <TrendingUp className="h-4 w-4 text-purple-600" />
      case "CATEGORY_BREAKDOWN":
        return <BarChart3 className="h-4 w-4 text-orange-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "GENERATING":
        return "bg-yellow-100 text-yellow-800"
      case "PENDING":
        return "bg-blue-100 text-blue-800"
      case "FAILED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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
        <p className="text-lg font-medium mb-2">No reports generated yet</p>
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
          >
            Report
          </SortableTableHead>
          <SortableTableHead
            sortKey="type"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Type
          </SortableTableHead>
          <SortableTableHead
            sortKey="period"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Period
          </SortableTableHead>
          <SortableTableHead
            sortKey="status"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Status
          </SortableTableHead>
          <SortableTableHead
            sortKey="generatedAt"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Generated
          </SortableTableHead>
          <SortableTableHead
            sortKey="downloadCount"
            currentSort={sortConfig}
            onSort={requestSort}
          >
            Downloads
          </SortableTableHead>
          <SortableTableHead
            sortable={false}
            sortKey="actions"
            currentSort={sortConfig}
            onSort={requestSort}
            className="w-32"
          >
            Actions
          </SortableTableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((report) => (
          <TableRow key={report.id}>
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
              <Badge variant="outline">
                {report.type.replace('_', ' ').toLowerCase()}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                {new Date(report.startDate).toLocaleDateString('es-AR')} - 
                {new Date(report.endDate).toLocaleDateString('es-AR')}
              </div>
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(report.status)}>
                {report.status.toLowerCase()}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                {report.generatedAt 
                  ? new Date(report.generatedAt).toLocaleDateString('es-AR')
                  : '-'
                }
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                {report.downloadCount} times
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
