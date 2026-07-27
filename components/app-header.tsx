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
      <header className="sticky top-0 z-30 flex h-15 items-center gap-3 border-b border-border/75 bg-background/80 px-3 shadow-sm backdrop-blur-2xl sm:px-5">
         <SidebarTrigger className="rounded-lg border border-border/60 bg-background/55 text-muted-foreground hover:border-primary/35 hover:bg-accent/70 hover:text-foreground" />
         <Separator
            orientation="vertical"
            className="mx-1 data-[orientation=vertical]:h-5"
         />
         <div className="flex flex-1 items-center justify-between">
            <div className="min-w-0">
               <h1 className="truncate font-serif text-base font-extrabold tracking-normal sm:text-lg">Hola, {user?.name}</h1>
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
