import { NextRequest, NextResponse } from "next/server"
import { getReportById } from "@/actions/report-actions"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { generateReportPDF } from "@/lib/pdf-generator"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: reportId } = await params;
    const report = await getReportById(reportId);

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (!report.data) {
      return NextResponse.json({ error: "Report data not available" }, { status: 400 });
    }

    // Generar nombre del archivo PDF basado en el tipo
    let filename = "";
    
    switch (report.type) {
      case "MONTHLY_SUMMARY":
        filename = `monthly-summary-${report.startDate.toISOString().slice(0, 7)}.pdf`;
        break;
      
      case "BUDGET_ANALYSIS":
        filename = `budget-analysis-${report.startDate.toISOString().slice(0, 7)}.pdf`;
        break;
      
      case "SPENDING_TRENDS":
        filename = `spending-trends-${report.startDate.toISOString().slice(0, 7)}-to-${report.endDate.toISOString().slice(0, 7)}.pdf`;
        break;
      
      default:
        filename = `report-${report.id}.pdf`;
    }

    // Crear el contenido del reporte con metadata adicional
    const reportContent = {
      title: report.title,
      type: report.type,
      description: report.description,
      period: {
        startDate: report.startDate,
        endDate: report.endDate
      },
      data: report.data,
      generatedAt: report.generatedAt,
      downloadedAt: new Date().toISOString()
    };

    // Generar el PDF a partir del JSON
    const pdfBuffer = generateReportPDF(reportContent);
    const contentType = "application/pdf";

    // Crear respuesta con headers para descarga
    const response = new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });

    return response;

  } catch (error) {
    console.error("Error downloading report:", error);
    return NextResponse.json(
      { error: "Failed to download report" },
      { status: 500 }
    );
  }
}

