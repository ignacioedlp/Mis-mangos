"use client"

import { Bell, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"

export default function AppHeader() {
   return (
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
         <SidebarTrigger />
         <div className="flex flex-1 items-center justify-between">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <div className="flex items-center gap-4">
               <Button variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Search</span>
               </Button>
               <Button variant="outline" size="icon">
                  <Bell className="h-4 w-4" />
                  <span className="sr-only">Notifications</span>
               </Button>
            </div>
         </div>
      </header>
   )
}
