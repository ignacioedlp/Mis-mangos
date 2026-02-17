"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface DailyExpense {
    day: number
    amount: number
}

interface ExpenseHeatmapProps {
    data: DailyExpense[]
    year: number
    month: number
}

export function ExpenseHeatmap({ data, year, month }: ExpenseHeatmapProps) {
    // Calculate max amount for color intensity
    const maxAmount = Math.max(...data.map(d => d.amount), 1)

    // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
    const firstDay = new Date(year, month - 1, 1).getDay()

    // Days of the week starting from Sunday
    const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

    // Create calendar grid with empty cells for alignment
    const calendarGrid: (DailyExpense | null)[] = Array(firstDay).fill(null).concat(data)

    // Get color intensity based on amount (0-100%) - Orange scale
    const getColorIntensity = (amount: number) => {
        if (amount === 0) return 'bg-muted/20'
        const intensity = (amount / maxAmount) * 100

        if (intensity <= 20) return 'bg-orange-100 dark:bg-orange-950/30'
        if (intensity <= 40) return 'bg-orange-200 dark:bg-orange-900/40'
        if (intensity <= 60) return 'bg-orange-300 dark:bg-orange-800/50'
        if (intensity <= 80) return 'bg-orange-400 dark:bg-orange-700/60'
        return 'bg-orange-500 dark:bg-orange-600/70'
    }

    // Get tooltip text
    const getTooltip = (day: DailyExpense) => {
        if (day.amount === 0) return `${day.day} - Sin gastos`
        return `${day.day} - ${formatCurrency(day.amount)}`
    }

    const monthName = new Date(year, month - 1).toLocaleString('es-ES', {
        month: 'long',
        year: 'numeric'
    })

    return (
        <Card className="w-full md:w-2xl border-border/60">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-lg font-bold">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    Calendario de Gastos
                </CardTitle>
                <CardDescription>
                    Visualización diaria de gastos pagados en {monthName}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {/* Days of week header */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                        {daysOfWeek.map((day) => (
                            <div
                                key={day}
                                className="text-center text-[10px] font-medium text-muted-foreground"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarGrid.map((dayData, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "aspect-square rounded-sm flex items-center justify-center text-xs font-medium transition-all hover:scale-110 hover:shadow-md cursor-pointer",
                                    dayData
                                        ? getColorIntensity(dayData.amount)
                                        : "bg-transparent"
                                )}
                                title={dayData ? getTooltip(dayData) : undefined}
                            >
                                {dayData && (
                                    <span className={cn(
                                        "text-[10px]",
                                        dayData.amount > maxAmount * 0.6
                                            ? "text-white font-semibold"
                                            : "text-foreground"
                                    )}>
                                        {dayData.day}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-xs text-muted-foreground">Intensidad:</span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground">Menos</span>
                            <div className="flex gap-0.5">
                                <div className="w-3 h-3 rounded-sm bg-muted/20" title="Sin gastos" />
                                <div className="w-3 h-3 rounded-sm bg-orange-100 dark:bg-orange-950/30" title="20%" />
                                <div className="w-3 h-3 rounded-sm bg-orange-200 dark:bg-orange-900/40" title="40%" />
                                <div className="w-3 h-3 rounded-sm bg-orange-300 dark:bg-orange-800/50" title="60%" />
                                <div className="w-3 h-3 rounded-sm bg-orange-400 dark:bg-orange-700/60" title="80%" />
                                <div className="w-3 h-3 rounded-sm bg-orange-500 dark:bg-orange-600/70" title="100%" />
                            </div>
                            <span className="text-[10px] text-muted-foreground">Más</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="space-y-0.5">
                            <p className="text-[10px] text-muted-foreground">Días con gastos</p>
                            <p className="text-base font-bold text-orange-600 dark:text-orange-500">
                                {data.filter(d => d.amount > 0).length}
                            </p>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[10px] text-muted-foreground">Día con más gastos</p>
                            <p className="text-base font-bold text-orange-600 dark:text-orange-500">
                                {maxAmount > 0
                                    ? `${data.find(d => d.amount === maxAmount)?.day || '-'} (${formatCurrency(maxAmount)})`
                                    : 'N/A'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
