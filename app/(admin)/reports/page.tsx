import { getUserReports, deleteReport } from "@/actions/report-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download, Trash2, BarChart3, TrendingUp, PieChart, Calendar } from "lucide-react"
import { ReportsGenerator } from "@/components/reports-generator"

async function ReportsData() {
  const reports = await getUserReports()
  return { reports }
}

export default async function ReportsPage() {
  const { reports } = await ReportsData()

  async function deleteReportAction(formData: FormData) {
    "use server"
    const reportId = String(formData.get("reportId") || "")
    try {
      await deleteReport(reportId)
    } catch (error) {
      console.error("Failed to delete report:", error)
    }
  }

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
        <p className="text-muted-foreground">
          Generate detailed reports and analyze your financial data
        </p>
      </div>

      {/* Report Generator */}
      <ReportsGenerator />

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generated Reports
          </CardTitle>
          <CardDescription>
            Your previously generated reports and analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No reports generated yet</p>
              <p className="text-sm">Use the generator above to create your first report</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
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
                      <div className="flex items-center gap-1">
                        {report.status === "COMPLETED" && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`/api/reports/${report.id}/download`}>
                              <Download className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                        <form action={deleteReportAction} className="inline">
                          <input type="hidden" name="reportId" value={report.id} />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            type="submit"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
