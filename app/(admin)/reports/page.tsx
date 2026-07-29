import { getUserReports } from "@/actions/report-actions"
import { AdminPageHeader } from "@/components/admin-page-header"
import { FileText } from "lucide-react"
import { ReportsGenerator } from "@/components/reports-generator"
import { ReportsTable } from "@/components/tables/reports-table"
import { DataSection } from "@/components/data-section"

async function ReportsData() {
  const reports = await getUserReports()
  return { reports }
}

export default async function ReportsPage() {
  const { reports } = await ReportsData()

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Analítica"
        title="Reportes y Analíticas"
        description="Genera reportes detallados y analiza tus datos financieros."
      />

      {/* Report Generator */}
      <ReportsGenerator />

      <DataSection
        title="Reportes generados"
        description="Historial de documentos y análisis disponibles."
      >
          <ReportsTable
            data={reports}
            emptyMessage="No hay reportes generados aún. Usa el generador de arriba para crear tu primer reporte"
            emptyIcon={<FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />}
          />
      </DataSection>
    </div>
  )
}
