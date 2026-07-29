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
               <a
                  href="#main-content"
                  className="fixed left-4 top-2 z-50 -translate-y-20 rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground transition-transform focus:translate-y-0"
               >
                  Ir al contenido
               </a>
               <AppHeader user={user} />
               <main id="main-content" className="min-w-0 flex-1 overflow-x-hidden bg-background px-3 py-5 sm:px-5 lg:px-8 lg:py-7">
                  <div className="mx-auto min-w-0 w-full max-w-[1520px]">
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
