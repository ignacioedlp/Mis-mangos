import { SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "@/components/app-sidebar"
import AppHeader from "@/components/app-header"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { UserProvider } from "@/context/UserContext"


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
      <SidebarProvider>
         <UserProvider user={user}>
            <div className="flex min-h-screen w-full">
               <AppSidebar user={user} />
               <div className="w-full flex flex-1 flex-col">
                  <AppHeader />
                  <main className="flex-1 p-6">{children}</main>
               </div>
            </div>
         </UserProvider>
      </SidebarProvider>
   )
}

