"use client"
import { SidebarTrigger } from "@/components/ui/sidebar"
import type { User } from "@/lib/types"
import { Separator } from "./ui/separator"
import { NotificationsPanel } from "./notifications-panel"

type UserProps = {
   user: User | null
}

export default function AppHeader({ user }: UserProps) {
   return (
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b px-6 bg-background">
         <SidebarTrigger />
         <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
         />
         <div className="flex flex-1 items-center justify-between">
            <h1 className="text-xl font-semibold">Bienvenido, {user?.name} </h1>
            <div className="flex items-center gap-4">
               <NotificationsPanel />
            </div>
         </div>
      </header>
   )
}
