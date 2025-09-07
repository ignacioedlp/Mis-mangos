"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock } from "lucide-react"
import { getPendingExpenses } from "@/actions/expense-actions"

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
        setPendingItems(items)
      } catch (error) {
        console.error('Failed to fetch pending expenses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPending()
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchPending, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  if (pendingItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-600" />
            Pending Expenses
          </CardTitle>
          <CardDescription>All expenses are up to date!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-green-600">No pending expenses for this month.</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Pending Expenses
          <Badge variant="destructive">{pendingItems.length}</Badge>
        </CardTitle>
        <CardDescription>
          You have {pendingItems.length} unpaid expense{pendingItems.length !== 1 ? 's' : ''} this month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-orange-800 bg-orange-950/20">
              <div className="flex flex-col">
                <span className="font-medium text-sm">{item.name}</span>
                <span className="text-xs text-muted-foreground">
                  {item.categoryName} / {item.subcategoryName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">${item.estimatedAmount.toFixed(2)}</span>
                {item.daysOverdue > 15 && (
                  <Badge variant="destructive" className="text-xs">
                    {item.daysOverdue}d overdue
                  </Badge>
                )}
              </div>
            </div>
          ))}
          <div className="pt-2 border-t">
            <div className="text-sm font-medium">
              Total pending: ${pendingItems.reduce((sum, item) => sum + item.estimatedAmount, 0).toFixed(2)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
