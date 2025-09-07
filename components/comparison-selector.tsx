"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ComparisonSelectorProps {
  startYear: number
  startMonth: number
  endYear: number
  endMonth: number
}

export function ComparisonSelector({ startYear, startMonth, endYear, endMonth }: ComparisonSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]

  function updateComparison(newStartYear: number, newStartMonth: number, newEndYear: number, newEndMonth: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("startYear", newStartYear.toString())
    params.set("startMonth", newStartMonth.toString())
    params.set("endYear", newEndYear.toString())
    params.set("endMonth", newEndMonth.toString())
    router.push(`/comparison?${params.toString()}`)
  }

  function setPreset(months: number) {
    const currentDate = new Date()
    const endY = currentDate.getFullYear()
    const endM = currentDate.getMonth() + 1
    const startDate = new Date(endY, endM - months - 1, 1)
    const startY = startDate.getFullYear()
    const startM = startDate.getMonth() + 1
    
    updateComparison(startY, startM, endY, endM)
  }

  return (
    <Card className="w-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Period Selection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground">
          {monthNames[startMonth - 1]} {startYear} - {monthNames[endMonth - 1]} {endYear}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPreset(3)}>
            Last 3M
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPreset(6)}>
            Last 6M
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPreset(12)}>
            Last Year
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
