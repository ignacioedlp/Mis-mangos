"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Download, FileText, FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Papa from 'papaparse'

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
        'Expense Name': item.name,
        'Category': item.categoryName,
        'Subcategory': item.subcategoryName,
        'Frequency': item.frequency,
        'Estimated Amount': item.estimatedAmount,
        'Actual Amount': item.actualAmount || '',
        'Status': item.isPaid ? 'Paid' : 'Pending',
      }))

      // Add summary row
      csvData.push({
        'Expense Name': '--- SUMMARY ---',
        'Category': '',
        'Subcategory': '',
        'Frequency': '',
        'Estimated Amount': data.totalEstimated,
        'Actual Amount': data.totalActual,
        'Status': `${data.totalPaid} paid, ${data.totalPending} pending`,
      })

      if (data.salary) {
        csvData.push({
          'Expense Name': '--- SALARY ---',
          'Category': '',
          'Subcategory': '',
          'Frequency': '',
          'Estimated Amount': data.salary,
          'Actual Amount': data.salary - data.totalActual,
          'Status': `Savings: ${(((data.salary - data.totalActual) / data.salary) * 100).toFixed(1)}%`,
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
      doc.text(`Expense Report - ${data.monthName}`, 20, 20)
      
      // Summary
      doc.setFontSize(12)
      let yPos = 40
      doc.text(`Total Estimated: $${data.totalEstimated.toFixed(2)}`, 20, yPos)
      yPos += 10
      doc.text(`Total Actual: $${data.totalActual.toFixed(2)}`, 20, yPos)
      yPos += 10
      doc.text(`Items Paid: ${data.totalPaid}`, 20, yPos)
      yPos += 10
      doc.text(`Items Pending: ${data.totalPending}`, 20, yPos)
      
      if (data.salary) {
        yPos += 10
        doc.text(`Monthly Salary: $${data.salary.toFixed(2)}`, 20, yPos)
        yPos += 10
        const savingsRate = ((data.salary - data.totalActual) / data.salary) * 100
        doc.text(`Savings Rate: ${savingsRate.toFixed(1)}%`, 20, yPos)
      }
      
      yPos += 20

      // Expenses table
      const tableData = data.items.map(item => [
        item.name,
        item.categoryName,
        item.subcategoryName,
        item.frequency,
        `$${item.estimatedAmount.toFixed(2)}`,
        item.actualAmount ? `$${item.actualAmount.toFixed(2)}` : '-',
        item.isPaid ? 'Paid' : 'Pending'
      ])

      autoTable(doc, {
        head: [['Name', 'Category', 'Subcategory', 'Frequency', 'Estimated', 'Actual', 'Status']],
        body: tableData,
        startY: yPos,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
      })

      // Category breakdown on new page if needed
      if (data.categoryData.length > 0) {
        doc.addPage()
        doc.setFontSize(16)
        doc.text('Category Breakdown', 20, 20)
        
        const categoryTableData = data.categoryData.map(cat => [
          cat.category,
          cat.count.toString(),
          `$${cat.estimated.toFixed(2)}`,
          `$${cat.actual.toFixed(2)}`,
          `${((cat.actual / cat.estimated) * 100).toFixed(1)}%`
        ])

        autoTable(doc, {
          head: [['Category', 'Count', 'Estimated', 'Actual', '% of Estimated']],
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
          Export
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>
            Export your expense data for {data.monthName} in different formats
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Button
            onClick={exportToCSV}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export as CSV
          </Button>
          <Button
            onClick={exportToPDF}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Export as PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
