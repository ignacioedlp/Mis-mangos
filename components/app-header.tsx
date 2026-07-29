"use client"
import { SidebarTrigger } from "@/components/ui/sidebar"
import type { User } from "@/lib/types"
import { NotificationsPanel } from "./notifications-panel"
import { ThemeToggle } from "./theme-toggle"
import { usePathname } from "next/navigation"

const routeLabels: Record<string, string> = {
   dashboard: "Panel mensual",
   categories: "Categorías",
   expenses: "Gastos",
   monthly: "Vista mensual",
   budget: "Presupuesto",
   wishlist: "Lista de deseos",
   "usd-cashflow": "USD disponible",
   reports: "Reportes",
   comparison: "Comparador",
}

type UserProps = {
   user: User | null
}

export default function AppHeader({ user }: UserProps) {
   const pathname = usePathname()
   const route = pathname.split("/").filter(Boolean)[0] ?? "dashboard"
   const routeLabel = routeLabels[route] ?? "Mis Mangos"

   return (
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-3 backdrop-blur-xl sm:px-5">
         <SidebarTrigger className="touch-target rounded-md text-muted-foreground hover:bg-accent hover:text-foreground" />
         <div className="h-5 w-px bg-border" aria-hidden="true" />
         <div className="flex min-w-0 flex-1 items-center justify-between">
            <p className="truncate text-sm font-semibold text-foreground">{routeLabel}</p>
            <div className="flex items-center gap-2">
               <NotificationsPanel />
               <ThemeToggle />
               <div className="hidden items-center gap-2 border-l border-border pl-3 sm:flex">
                  <div className="flex size-8 items-center justify-center rounded-full border border-border bg-card text-xs font-bold text-primary">
                     {user?.name?.slice(0, 1).toUpperCase() ?? "M"}
                  </div>
                  <span className="max-w-32 truncate text-sm text-muted-foreground">{user?.name}</span>
               </div>
            </div>
         </div>
      </header>
   )
}
