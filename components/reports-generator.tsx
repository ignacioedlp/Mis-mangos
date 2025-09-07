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
      label: "Monthly Summary",
      description: "Complete financial summary for a specific month",
      icon: <Calendar className="h-4 w-4" />
    },
    {
      value: "BUDGET_ANALYSIS",
      label: "Budget Analysis",
      description: "Detailed budget performance analysis",
      icon: <PieChart className="h-4 w-4" />
    },
    {
      value: "SPENDING_TRENDS",
      label: "Spending Trends",
      description: "Multi-month spending analysis and trends",
      icon: <TrendingUp className="h-4 w-4" />
    }
  ]

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" }
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
          Generate New Report
        </CardTitle>
        <CardDescription>
          Create detailed financial reports and analytics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Type Selection */}
        <div className="space-y-2">
          <Label>Report Type</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="Select report type..." />
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
                  <Label>Year</Label>
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
                  <Label>Month</Label>
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
                    <Label>Start Year</Label>
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
                    <Label>Start Month</Label>
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
                    <Label>End Year</Label>
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
                    <Label>End Month</Label>
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
          {loading ? "Generating Report..." : "Generate Report"}
        </Button>
      </CardContent>
    </Card>
  )
}
