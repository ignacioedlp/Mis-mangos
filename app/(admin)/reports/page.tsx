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
        <h2 className="text-3xl font-bold tracking-tight">Reportes y Analiticas</h2>
        <p className="text-muted-foreground">
          Genera reportes detallados y analiza tus datos financieros
        </p>
      </div>

      {/* Report Generator */}
      <ReportsGenerator />

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Reportes Generados
          </CardTitle>
          <CardDescription>
            Tus reportes y analíticas generados previamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportsTable
            data={reports}
            emptyMessage="No hay reportes generados aún. Usa el generador de arriba para crear tu primer reporte"
            emptyIcon={<FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />}
          />
        </CardContent>
      </Card>
    </div>
  )
}
