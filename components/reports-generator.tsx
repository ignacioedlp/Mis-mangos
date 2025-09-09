"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { generateMonthlySummaryReport, generateBudgetAnalysisReport, generateSpendingTrendsReport } from "@/actions/report-actions"
import { toast } from "sonner"
import { FileText, Calendar, PieChart, TrendingUp } from "lucide-react"

export function ReportsGenerator() {
  const [reportType, setReportType] = useState("")
  const [loading, setLoading] = useState(false)
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString())
  const [startYear, setStartYear] = useState(new Date().getFullYear().toString())
  const [startMonth, setStartMonth] = useState("1")
  const [endYear, setEndYear] = useState(new Date().getFullYear().toString())
  const [endMonth, setEndMonth] = useState((new Date().getMonth() + 1).toString())

  const reportTypes = [
    {
      value: "MONTHLY_SUMMARY",
      label: "Resumen Mensual",
      description: "Resumen financiero completo para un mes específico",
      icon: <Calendar className="h-4 w-4" />
    },
    {
      value: "BUDGET_ANALYSIS",
      label: "Análisis de Presupuesto",
      description: "Análisis detallado del rendimiento del presupuesto",
      icon: <PieChart className="h-4 w-4" />
    },
    {
      value: "SPENDING_TRENDS",
      label: "Tendencias de Gastos",
      description: "Análisis y tendencias de gastos a lo largo de varios meses",
      icon: <TrendingUp className="h-4 w-4" />
    }
  ]

  const months = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" }
  ]

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i
    return { value: year.toString(), label: year.toString() }
  })

  async function handleGenerate() {
    if (!reportType) {
      toast.error("Please select a report type")
      return
    }

    setLoading(true)
    try {
      switch (reportType) {
        case "MONTHLY_SUMMARY":
          await generateMonthlySummaryReport(parseInt(year), parseInt(month))
          break
        case "BUDGET_ANALYSIS":
          await generateBudgetAnalysisReport(parseInt(year), parseInt(month))
          break
        case "SPENDING_TRENDS":
          await generateSpendingTrendsReport(
            parseInt(startYear), 
            parseInt(startMonth), 
            parseInt(endYear), 
            parseInt(endMonth)
          )
          break
        default:
          throw new Error("Invalid report type")
      }

      toast.success("Report generated successfully!")
      
      // Reset form
      setReportType("")
      
      // Refresh page to show new report
      window.location.reload()
      
    } catch (error) {
      console.error("Report generation error:", error)
      toast.error("Failed to generate report")
    } finally {
      setLoading(false)
    }
  }

  const selectedReportType = reportTypes.find(type => type.value === reportType)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Generador de Reportes
        </CardTitle>
        <CardDescription>
          Crea reportes y análisis financieros detallados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Type Selection */}
        <div className="space-y-2">
          <Label>Tipo de Reporte</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo de reporte..." />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    {type.icon}
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {type.description}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Parameters based on report type */}
        {reportType && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              {selectedReportType?.icon}
              <h4 className="font-medium">{selectedReportType?.label} Parameters</h4>
            </div>

            {(reportType === "MONTHLY_SUMMARY" || reportType === "BUDGET_ANALYSIS") && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Año</Label>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mes</Label>
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {reportType === "SPENDING_TRENDS" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Año de Inicio</Label>
                    <Select value={startYear} onValueChange={setStartYear}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year.value} value={year.value}>
                            {year.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Mes de Inicio</Label>
                    <Select value={startMonth} onValueChange={setStartMonth}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Año de Fin</Label>
                    <Select value={endYear} onValueChange={setEndYear}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year.value} value={year.value}>
                            {year.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Mes de Fin</Label>
                    <Select value={endMonth} onValueChange={setEndMonth}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Generate Button */}
        <Button 
          onClick={handleGenerate} 
          disabled={!reportType || loading}
          className="w-full"
        >
          {loading ? "Generando Reporte..." : "Generar Reporte"}
        </Button>
      </CardContent>
    </Card>
  )
}
