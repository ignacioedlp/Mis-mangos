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
               <main className="flex-1 p-6">
                  <Suspense fallback={null}>
                     <ToastHandler />
                  </Suspense>
                  {children}
                  <PWAInstaller />
               </main>
            </SidebarInset>
         </SidebarProvider>
      </UserProvider>
   )
}

