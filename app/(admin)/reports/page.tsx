import { getUserReports } from "@/actions/report-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { ReportsGenerator } from "@/components/reports-generator"
import { ReportsTable } from "@/components/tables/reports-table"

async function ReportsData() {
  const reports = await getUserReports()
  return { reports }
}

export default async function ReportsPage() {
  const { reports } = await ReportsData()

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
          <ReportsTable
            data={reports}
            emptyMessage="No reports generated yet. Use the generator above to create your first report"
            emptyIcon={<FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />}
          />
        </CardContent>
      </Card>
    </div>
  )
}
