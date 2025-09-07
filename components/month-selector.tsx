"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface MonthSelectorProps {
  currentYear: number
  currentMonth: number
}

export function MonthSelector({ currentYear, currentMonth }: MonthSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  function navigateToMonth(year: number, month: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("year", year.toString())
    params.set("month", month.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  function goToPrevMonth() {
    let prevMonth = currentMonth - 1
    let prevYear = currentYear
    if (prevMonth === 0) {
      prevMonth = 12
      prevYear = currentYear - 1
    }
    navigateToMonth(prevYear, prevMonth)
  }

  function goToNextMonth() {
    let nextMonth = currentMonth + 1
    let nextYear = currentYear
    if (nextMonth === 13) {
      nextMonth = 1
      nextYear = currentYear + 1
    }
    navigateToMonth(nextYear, nextMonth)
  }

  function goToCurrentMonth() {
    const now = new Date()
    navigateToMonth(now.getFullYear(), now.getMonth() + 1)
  }

  const currentMonthName = monthNames[currentMonth - 1]
  const isCurrentMonth = currentYear === new Date().getFullYear() && currentMonth === new Date().getMonth() + 1

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={goToPrevMonth}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex flex-col items-center min-w-[120px]">
        <span className="font-medium">{currentMonthName}</span>
        <span className="text-sm text-muted-foreground">{currentYear}</span>
      </div>
      
      <Button variant="outline" size="sm" onClick={goToNextMonth}>
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      {!isCurrentMonth && (
        <Button variant="ghost" size="sm" onClick={goToCurrentMonth}>
          Today
        </Button>
      )}
    </div>
  )
}
