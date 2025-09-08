import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Prisma } from '@prisma/client'

// Extender el tipo jsPDF para incluir las propiedades de autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number
    }
  }
}

// Tipos para los datos del reporte
type ReportData = {
  title: string
  type: string
  description?: string | null
  period: {
    startDate: string | Date
    endDate: string | Date
  }
  data: Prisma.JsonValue
  generatedAt: string | Date | null
  downloadedAt: string
}

// Tipos específicos para cada tipo de reporte
type MonthlySummaryData = {
  period?: {
    year: number
    month: number
    monthName: string
  }
  summary?: {
    totalEstimated: number
    totalActual: number
    totalPaid: number
    totalPending: number
    monthlyIncome: number
    savingsAmount: number
    savingsRate: number
  }
  categoryBreakdown?: Array<{
    category: string
    estimated: number
    actual: number
    count: number
  }>
  expenses?: Array<{
    name: string
    category: string
    estimated: number
    actual?: number
    isPaid: boolean
  }>
}

type BudgetAnalysisData = {
  budgetSummary?: {
    monthlyIncome: number
    totalBudgetPercentage: number
    unassignedAmount: number
  }
  categories?: Array<{
    name: string
    budgetPercentage: number
    budgetAmount: number
    actualSpent: number
    usagePercentage: number
    isOverBudget: boolean
  }>
  recommendations?: Array<{
    type: string
    priority: string
    title: string
    description: string
  }>
}

type SpendingTrendsData = {
  totalSpending?: Array<{
    period: string
    estimated: number
    actual: number
    year: number
    month: number
  }>
  categoryTrends?: Record<string, Array<{
    period: string
    amount: number
  }>>
}

// Función principal para generar PDF desde el JSON del reporte
export function generateReportPDF(reportContent: ReportData): ArrayBuffer {
  const doc = new jsPDF()
  
  // Configurar fuente y colores
  doc.setFont('helvetica')
  
  // Header del documento
  addHeader(doc, reportContent)
  
  // Contenido específico según el tipo de reporte
  switch (reportContent.type) {
    case 'MONTHLY_SUMMARY':
      addMonthlySummaryContent(doc, reportContent)
      break
    case 'BUDGET_ANALYSIS':
      addBudgetAnalysisContent(doc, reportContent)
      break
    case 'SPENDING_TRENDS':
      addSpendingTrendsContent(doc, reportContent)
      break
    default:
      addGenericContent(doc, reportContent)
  }
  
  // Footer con información de generación
  addFooter(doc, reportContent)
  
  // Convertir a ArrayBuffer para la respuesta HTTP
  const pdfOutput = doc.output('arraybuffer')
  return pdfOutput
}

// Función para agregar el header del documento
function addHeader(doc: jsPDF, reportContent: ReportData) {
  // Título principal
  doc.setFontSize(20)
  doc.setTextColor(40, 40, 40)
  doc.text(reportContent.title, 20, 25)
  
  // Subtítulo con descripción
  if (reportContent.description) {
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.text(reportContent.description, 20, 35)
  }
  
  // Información del período
  const startDate = new Date(reportContent.period.startDate).toLocaleDateString('es-ES')
  const endDate = new Date(reportContent.period.endDate).toLocaleDateString('es-ES')
  doc.setFontSize(10)
  doc.setTextColor(120, 120, 120)
  doc.text(`Período: ${startDate} - ${endDate}`, 20, 45)
  
  // Línea separadora
  doc.setDrawColor(200, 200, 200)
  doc.line(20, 50, 190, 50)
}

// Contenido específico para Monthly Summary
function addMonthlySummaryContent(doc: jsPDF, reportContent: ReportData) {
  let yPosition = 65
  const data = reportContent.data as MonthlySummaryData
  
  // Resumen financiero
  doc.setFontSize(14)
  doc.setTextColor(40, 40, 40)
  doc.text('Resumen Financiero', 20, yPosition)
  yPosition += 10
  
  const summaryData = [
    ['Total Estimado', `$${data.summary?.totalEstimated?.toLocaleString('es-ES') || '0'}`],
    ['Total Real', `$${data.summary?.totalActual?.toLocaleString('es-ES') || '0'}`],
    ['Gastos Pagados', `${data.summary?.totalPaid || '0'} items`],
    ['Gastos Pendientes', `${data.summary?.totalPending || '0'} items`],
    ['Ingreso Mensual', `$${data.summary?.monthlyIncome?.toLocaleString('es-ES') || '0'}`],
    ['Ahorro', `$${data.summary?.savingsAmount?.toLocaleString('es-ES') || '0'} (${data.summary?.savingsRate?.toFixed(1) || '0'}%)`]
  ]
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Concepto', 'Valor']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] },
    styles: { fontSize: 10 },
    margin: { left: 20, right: 20 }
  })
  
  yPosition = doc.lastAutoTable.finalY + 15
  
  // Desglose por categorías
  if (data.categoryBreakdown && data.categoryBreakdown.length > 0) {
    doc.setFontSize(14)
    doc.text('Desglose por Categorías', 20, yPosition)
    yPosition += 5
    
    const categoryData = data.categoryBreakdown.map((cat) => [
      cat.category,
      `$${cat.estimated?.toLocaleString('es-ES') || '0'}`,
      `$${cat.actual?.toLocaleString('es-ES') || '0'}`,
      `${cat.count || '0'} gastos`
    ])
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Categoría', 'Estimado', 'Real', 'Cantidad']],
      body: categoryData,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 9 },
      margin: { left: 20, right: 20 }
    })
    
    yPosition = doc.lastAutoTable.finalY + 15
  }
  
  // Lista de gastos (primeros 20)
  if (data.expenses && data.expenses.length > 0) {
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 25
    }
    
    doc.setFontSize(14)
    doc.text('Detalle de Gastos', 20, yPosition)
    yPosition += 5
    
    const expenseData = data.expenses.slice(0, 20).map((expense) => [
      expense.name,
      expense.category,
      `$${expense.estimated?.toLocaleString('es-ES') || '0'}`,
      expense.actual ? `$${expense.actual.toLocaleString('es-ES')}` : 'Pendiente',
      expense.isPaid ? 'Pagado' : 'Pendiente'
    ])
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Gasto', 'Categoría', 'Estimado', 'Real', 'Estado']],
      body: expenseData,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 8 },
      margin: { left: 20, right: 20 }
    })
    
    if (data.expenses.length > 20) {
      yPosition = doc.lastAutoTable.finalY + 5
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Mostrando 20 de ${data.expenses.length} gastos`, 20, yPosition)
    }
  }
}

// Contenido específico para Budget Analysis
function addBudgetAnalysisContent(doc: jsPDF, reportContent: ReportData) {
  let yPosition = 65
  const data = reportContent.data as BudgetAnalysisData
  
  // Resumen del presupuesto
  doc.setFontSize(14)
  doc.setTextColor(40, 40, 40)
  doc.text('Análisis de Presupuesto', 20, yPosition)
  yPosition += 10
  
  const budgetSummaryData = [
    ['Ingreso Mensual', `$${data.budgetSummary?.monthlyIncome?.toLocaleString('es-ES') || '0'}`],
    ['Presupuesto Asignado', `${data.budgetSummary?.totalBudgetPercentage?.toFixed(1) || '0'}%`],
    ['Ingreso Sin Asignar', `$${data.budgetSummary?.unassignedAmount?.toLocaleString('es-ES') || '0'}`]
  ]
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Concepto', 'Valor']],
    body: budgetSummaryData,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] },
    styles: { fontSize: 10 },
    margin: { left: 20, right: 20 }
  })
  
  yPosition = doc.lastAutoTable.finalY + 15
  
  // Rendimiento por categorías
  if (data.categories && data.categories.length > 0) {
    doc.setFontSize(14)
    doc.text('Rendimiento por Categoría', 20, yPosition)
    yPosition += 5
    
    const categoryData = data.categories.map((cat) => [
      cat.name,
      `${cat.budgetPercentage?.toFixed(1) || '0'}%`,
      `$${cat.budgetAmount?.toLocaleString('es-ES') || '0'}`,
      `$${cat.actualSpent?.toLocaleString('es-ES') || '0'}`,
      `${cat.usagePercentage?.toFixed(1) || '0'}%`,
      cat.isOverBudget ? 'Excedido' : 'En rango'
    ])
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Categoría', '% Presup.', 'Asignado', 'Gastado', '% Usado', 'Estado']],
      body: categoryData,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 8 },
      margin: { left: 20, right: 20 },
      didParseCell: function(data) {
        // Colorear filas de categorías excedidas
        if (data.section === 'body' && data.column.index === 5) {
          if (data.cell.text[0] === 'Excedido') {
            data.cell.styles.textColor = [220, 38, 38] // Rojo
            data.cell.styles.fontStyle = 'bold'
          }
        }
      }
    })
    
    yPosition = doc.lastAutoTable.finalY + 15
  }
  
  // Recomendaciones
  if (data.recommendations && data.recommendations.length > 0) {
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 25
    }
    
    doc.setFontSize(14)
    doc.text('Recomendaciones', 20, yPosition)
    yPosition += 10
    
    data.recommendations.forEach((rec, index) => {
      // Título de la recomendación
      doc.setFontSize(11)
      doc.setTextColor(40, 40, 40)
      const titleLines = doc.splitTextToSize(`${index + 1}. ${rec.title}`, 170)
      doc.text(titleLines, 20, yPosition)
      yPosition += titleLines.length * 5 + 2
      
      // Descripción de la recomendación
      doc.setFontSize(9)
      doc.setTextColor(80, 80, 80)
      const descLines = doc.splitTextToSize(`   ${rec.description}`, 170)
      doc.text(descLines, 20, yPosition)
      yPosition += descLines.length * 4 + 5
      
      if (yPosition > 275) {
        doc.addPage()
        yPosition = 25
      }
    })
  }
}

// Contenido específico para Spending Trends
function addSpendingTrendsContent(doc: jsPDF, reportContent: ReportData) {
  let yPosition = 65
  const data = reportContent.data as SpendingTrendsData
  
  // Tendencias de gasto total
  doc.setFontSize(14)
  doc.setTextColor(40, 40, 40)
  doc.text('Tendencias de Gasto', 20, yPosition)
  yPosition += 10
  
  if (data.totalSpending && data.totalSpending.length > 0) {
    const spendingData = data.totalSpending.map((item) => [
      item.period,
      `$${item.estimated?.toLocaleString('es-ES') || '0'}`,
      `$${item.actual?.toLocaleString('es-ES') || '0'}`,
      `${((item.actual / item.estimated) * 100).toFixed(1)}%`
    ])
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Período', 'Estimado', 'Real', '% Cumplimiento']],
      body: spendingData,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 9 },
      margin: { left: 20, right: 20 }
    })
    
    yPosition = doc.lastAutoTable.finalY + 15
  }
  
  // Tendencias por categoría (si están disponibles)
  if (data.categoryTrends && Object.keys(data.categoryTrends).length > 0) {
    if (yPosition > 200) {
      doc.addPage()
      yPosition = 25
    }
    
    doc.setFontSize(14)
    doc.text('Tendencias por Categoría', 20, yPosition)
    yPosition += 5
    
    Object.entries(data.categoryTrends).forEach(([category, trends]) => {
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 25
      }
      
      doc.setFontSize(12)
      doc.setTextColor(60, 60, 60)
      doc.text(category, 20, yPosition)
      yPosition += 5
      
      const categoryData = trends.map((trend) => [
        trend.period,
        `$${trend.amount?.toLocaleString('es-ES') || '0'}`
      ])
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Período', 'Gasto']],
        body: categoryData,
        theme: 'plain',
        headStyles: { fillColor: [229, 231, 235] },
        styles: { fontSize: 8 },
        margin: { left: 30, right: 20 }
      })
      
      yPosition = doc.lastAutoTable.finalY + 10
    })
  }
}

// Contenido genérico para otros tipos de reportes
function addGenericContent(doc: jsPDF, reportContent: ReportData) {
  let yPosition = 65
  
  doc.setFontSize(14)
  doc.setTextColor(40, 40, 40)
  doc.text('Datos del Reporte', 20, yPosition)
  yPosition += 15
  
  // Mostrar el JSON de manera estructurada
  doc.setFontSize(10)
  doc.setTextColor(60, 60, 60)
  
  const jsonString = JSON.stringify(reportContent.data, null, 2)
  const lines = doc.splitTextToSize(jsonString, 170)
  
  lines.forEach((line: string) => {
    if (yPosition > 280) {
      doc.addPage()
      yPosition = 25
    }
    doc.text(line, 20, yPosition)
    yPosition += 4
  })
}

// Función para agregar el footer del documento
function addFooter(doc: jsPDF, reportContent: ReportData) {
  const pageCount = doc.getNumberOfPages()
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    
    // Información de generación
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    
    const generatedDate = reportContent.generatedAt 
      ? new Date(reportContent.generatedAt).toLocaleString('es-ES') 
      : 'No disponible'
    const downloadedDate = new Date(reportContent.downloadedAt).toLocaleString('es-ES')
    
    doc.text(`Generado: ${generatedDate}`, 20, 285)
    doc.text(`Descargado: ${downloadedDate}`, 20, 292)
    
    // Número de página
    doc.text(`Página ${i} de ${pageCount}`, 170, 292)
    
    // Línea superior del footer
    doc.setDrawColor(200, 200, 200)
    doc.line(20, 280, 190, 280)
  }
}
