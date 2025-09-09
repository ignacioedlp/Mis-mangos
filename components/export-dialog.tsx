"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Download, FileText, FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Papa from 'papaparse'
import { formatCurrency } from "@/lib/utils"

interface ExportDialogProps {
  data: {
    monthName: string
    totalEstimated: number
    totalActual: number
    totalPaid: number
    totalPending: number
    items: Array<{
      name: string
      categoryName: string
      subcategoryName: string
      estimatedAmount: number
      actualAmount: number | null
      isPaid: boolean
      frequency: string
    }>
    categoryData: Array<{
      category: string
      estimated: number
      actual: number
      count: number
    }>
    salary?: number
  }
}

export function ExportDialog({ data }: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const exportToCSV = () => {
    setLoading(true)
    try {
      const csvData = data.items.map(item => ({
        'Nombre del Gasto': item.name,
        'Categoría': item.categoryName,
        'Subcategoría': item.subcategoryName,
        'Frecuencia': item.frequency,
        'Monto Estimado': item.estimatedAmount,
        'Monto Real': item.actualAmount || '',
        'Estado': item.isPaid ? 'Pagado' : 'Pendiente',
      }))

      // Add summary row
      csvData.push({
        'Nombre del Gasto': '--- SUMMARY ---',
        'Categoría': '',
        'Subcategoría': '',
        'Frecuencia': '',
        'Monto Estimado': data.totalEstimated,
        'Monto Real': data.totalActual,
        'Estado': `${data.totalPaid} pagado, ${data.totalPending} pendientes`,
      })

      if (data.salary) {
        csvData.push({
          'Nombre del Gasto': '--- SALARY ---',
          'Categoría': '',
          'Subcategoría': '',
          'Frecuencia': '',
          'Monto Estimado': data.salary,
          'Monto Real': data.salary - data.totalActual,
          'Estado': `Ahorros: ${(((data.salary - data.totalActual) / data.salary) * 100).toFixed(1)}%`,
        })
      }

      const csv = Papa.unparse(csvData)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `expenses-${data.monthName.replace(' ', '-').toLowerCase()}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('CSV exported successfully!')
      setOpen(false)
    } catch {
      toast.error('Failed to export CSV')
    } finally {
      setLoading(false)
    }
  }

  const exportToPDF = () => {
    setLoading(true)
    try {
      const doc = new jsPDF()
      
      // Title
      doc.setFontSize(20)
      doc.text(`Reporte de Gastos - ${data.monthName}`, 20, 20)

      // Summary
      doc.setFontSize(12)
      let yPos = 40
      doc.text(`Total Estimado: ${formatCurrency(data.totalEstimated)}`, 20, yPos)
      yPos += 10
      doc.text(`Total Actual: ${formatCurrency(data.totalActual)}`, 20, yPos)
      yPos += 10
      doc.text(`Items Pagados: ${data.totalPaid}`, 20, yPos)
      yPos += 10
      doc.text(`Items Pendientes: ${data.totalPending}`, 20, yPos)

      if (data.salary) {
        yPos += 10
        doc.text(`Salario Mensual: ${formatCurrency(data.salary)}`, 20, yPos)
        yPos += 10
        const savingsRate = ((data.salary - data.totalActual) / data.salary) * 100
        doc.text(`Tasa de Ahorro: ${savingsRate.toFixed(1)}%`, 20, yPos)
      }
      
      yPos += 20

      // Expenses table
      const tableData = data.items.map(item => [
        item.name,
        item.categoryName,
        item.subcategoryName,
        item.frequency,
        formatCurrency(item.estimatedAmount),
        item.actualAmount ? formatCurrency(item.actualAmount) : '-',
        item.isPaid ? 'Pagado' : 'Pendiente'
      ])

      autoTable(doc, {
        head: [['Nombre', 'Categoría', 'Subcategoría', 'Frecuencia', 'Estimado', 'Real', 'Estado']],
        body: tableData,
        startY: yPos,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
      })

      // Category breakdown on new page if needed
      if (data.categoryData.length > 0) {
        doc.addPage()
        doc.setFontSize(16)
        doc.text('Desglose por Categoría', 20, 20)

        const categoryTableData = data.categoryData.map(cat => [
          cat.category,
          cat.count.toString(),
          formatCurrency(cat.estimated),
          formatCurrency(cat.actual),
          `${((cat.actual / cat.estimated) * 100).toFixed(1)}%`
        ])

        autoTable(doc, {
          head: [['Categoría', 'Cantidad', 'Estimado', 'Real', '% de Estimado']],
          body: categoryTableData,
          startY: 40,
          styles: { fontSize: 10 },
          headStyles: { fillColor: [66, 139, 202] },
        })
      }

      doc.save(`expenses-${data.monthName.replace(' ', '-').toLowerCase()}.pdf`)
      toast.success('PDF exported successfully!')
      setOpen(false)
    } catch {
      toast.error('Failed to export PDF')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar Datos
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exportar Datos</DialogTitle>
          <DialogDescription>
            Exporta los datos de tus gastos para {data.monthName} en diferentes formatos
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Button
            onClick={exportToCSV}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exportar como CSV
          </Button>
          <Button
            onClick={exportToPDF}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Exportar como PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
