import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "@/components/app-sidebar"
import AppHeader from "@/components/app-header"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { UserProvider } from "@/context/UserContext"
import ToastHandler from "@/components/toast-handler"
import { PWAInstaller } from "@/components/pwa-installer"
import { Suspense } from "react"


export default async function DashboardLayout({
   children,
}: {
   children: React.ReactNode
}) {
   const session = await auth.api.getSession({
      headers: await headers()
   })

   if (!session) {
      return redirect("/sign-in")
   }

   const user = session?.user;
   return (
      <UserProvider user={user}>
         <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
               <AppHeader user={user} />
               <main className="relative flex-1 overflow-hidden bg-muted/10 p-4 sm:p-6">
                  <div className="fintech-grid pointer-events-none absolute inset-0 opacity-40" />
                  <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-primary/[0.07] blur-3xl" />
                  <div className="relative">
                  <Suspense fallback={null}>
                     <ToastHandler />
                  </Suspense>
                  {children}
                  <PWAInstaller />
                  </div>
               </main>
            </SidebarInset>
         </SidebarProvider>
      </UserProvider>
   )
}

