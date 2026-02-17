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
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/60 px-6 bg-background/80 backdrop-blur-xl">
         <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
         <Separator
            orientation="vertical"
            className="mx-1 data-[orientation=vertical]:h-4"
         />
         <div className="flex flex-1 items-center justify-between">
            <div>
               <h1 className="font-serif text-lg font-bold tracking-tight">Hola, {user?.name}</h1>
               <p className="text-xs text-muted-foreground -mt-0.5">Bienvenido a tu panel financiero</p>
            </div>
            <div className="flex items-center gap-2">
               <NotificationsPanel />
               <ThemeToggle />
            </div>
         </div>
      </header>
   )
}
