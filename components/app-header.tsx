"use client"
import { SidebarTrigger } from "@/components/ui/sidebar"
import type { User } from "@/lib/types"
import { Separator } from "./ui/separator"
import { NotificationsPanel } from "./notifications-panel"
import { ThemeToggle } from "./theme-toggle"

type UserProps = {
   user: User | null
}

export default function AppHeader({ user }: UserProps) {
   return (
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/70 bg-background/75 px-4 shadow-sm backdrop-blur-2xl sm:px-6">
         <SidebarTrigger className="rounded-lg text-muted-foreground hover:bg-accent/70 hover:text-foreground" />
         <Separator
            orientation="vertical"
            className="mx-1 data-[orientation=vertical]:h-5"
         />
         <div className="flex flex-1 items-center justify-between">
            <div>
               <h1 className="font-serif text-lg font-bold tracking-normal">Hola, {user?.name}</h1>
               <p className="-mt-0.5 text-xs font-medium text-muted-foreground">Panel financiero actualizado</p>
            </div>
            <div className="flex items-center gap-2">
               <NotificationsPanel />
               <ThemeToggle />
            </div>
         </div>
      </header>
   )
}
