"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock } from "lucide-react"
import { getPendingExpenses } from "@/actions/expense-actions"
import { formatCurrency } from "@/lib/utils"

interface PendingItem {
  id: string
  name: string
  categoryName: string
  subcategoryName: string
  estimatedAmount: number
  daysOverdue: number
}

export function PendingAlerts() {
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const items = await getPendingExpenses()
        setPendingItems(Array.isArray(items) ? items : [])
      } catch (error) {
        console.error('Failed to fetch pending expenses:', error)
        setPendingItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchPending()

    // Refresh every 5 minutes
    const interval = setInterval(fetchPending, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const pendingCount = pendingItems.length

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Gastos Pendientes
            {/* Pending Expenses */}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Cargando...</div>
        </CardContent>
      </Card>
    )
  }

  if (pendingCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-chart-5/35 bg-chart-5/10">
              <Clock className="h-4 w-4 text-chart-5" />
            </div>
            Gastos Pendientes
          </CardTitle>
          <CardDescription>¡Todos los gastos están actualizados!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No hay gastos pendientes para este mes.</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-chart-1/35 bg-chart-1/10">
            <AlertTriangle className="h-4 w-4 text-chart-1" />
          </div>
          Gastos Pendientes
          <Badge variant="destructive" className="rounded-full">{pendingCount}</Badge>
        </CardTitle>
        <CardDescription>
          Tienes {pendingCount} gasto{pendingCount !== 1 ? 's' : ''} sin pagar este mes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingItems.map((item) => (
            <div key={item.id} className="data-panel flex items-center justify-between p-3.5 transition-colors hover:bg-primary/5">
              <div className="flex flex-col">
                <span className="font-medium text-sm">{item.name}</span>
                <span className="text-xs text-muted-foreground">
                  {item.categoryName} / {item.subcategoryName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{formatCurrency(item.estimatedAmount)}</span>
                {item.daysOverdue > 15 && (
                  <Badge variant="destructive" className="text-xs">
                    {item.daysOverdue}d de retraso
                  </Badge>
                )}
              </div>
            </div>
          ))}
          <div className="border-t border-border/75 pt-3">
            <div className="text-sm font-bold">
              Total pendiente: {formatCurrency(pendingItems.reduce((sum, item) => sum + item.estimatedAmount, 0))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
