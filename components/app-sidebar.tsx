"use client"

import Link from "next/link"
import { LayoutDashboard, FolderOpen, DollarSign, Calendar, TrendingUp, PieChart, FileText, Target } from "lucide-react"
import {
   Sidebar,
   SidebarContent,
   SidebarFooter,
   SidebarHeader,
   SidebarMenu,
   SidebarMenuItem,
   SidebarMenuButton,
   SidebarRail,
} from "@/components/ui/sidebar"
import SignOutForm from "./sign-out-form"
import Logo from "./logo"
import { usePathname } from "next/navigation"

export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
   const pathname = usePathname();

   const menuItems = [
      {
         href: "/dashboard",
         icon: LayoutDashboard,
         label: "Panel mensual",
         isActive: pathname.startsWith("/dashboard")
      },
      {
         href: "/categories",
         icon: FolderOpen,
         label: "Categorías",
         isActive: pathname.startsWith("/categories")
      },
      {
         href: "/expenses",
         icon: DollarSign,
         label: "Gastos",
         isActive: pathname.startsWith("/expenses")
      },
      {
         href: "/monthly",
         icon: Calendar,
         label: "Mensual",
         isActive: pathname.startsWith("/monthly")
      },
      {
         href: "/budget",
         icon: PieChart,
         label: "Presupuesto",
         isActive: pathname.startsWith("/budget")
      },
      {
         href: "/goals",
         icon: Target,
         label: "Objetivos",
         isActive: pathname.startsWith("/goals")
      },
      {
         href: "/reports",
         icon: FileText,
         label: "Reportes",
         isActive: pathname.startsWith("/reports")
      },
      {
         href: "/comparison",
         icon: TrendingUp,
         label: "Comparador",
         isActive: pathname.startsWith("/comparison")
      }
   ];

   return (
      <Sidebar collapsible="offcanvas" {...props}>
         <SidebarHeader className="flex items-center px-4 py-5">
            <div className="flex items-center gap-2.5">
               <Logo />
               <span className="font-serif text-base font-bold tracking-tight">Mis Mangos</span>
            </div>
         </SidebarHeader>
         <SidebarContent>
            <div className="px-3 py-2">
               <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3">
                  Navegación
               </span>
            </div>
            <SidebarMenu className="px-2 space-y-0.5">
               {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                     <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton isActive={item.isActive} size="lg" className="rounded-xl">
                           <Link href={item.href} className={`${item.isActive ? "text-foreground font-semibold" : "text-muted-foreground"} flex items-center gap-3 transition-colors`}>
                              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"} transition-colors`}>
                                 <Icon className="h-4 w-4" />
                              </div>
                              <span className="text-sm">{item.label}</span>
                           </Link>
                        </SidebarMenuButton>
                     </SidebarMenuItem>
                  );
               })}
            </SidebarMenu>
         </SidebarContent>
         <SidebarFooter className="p-3">
            <SignOutForm />
         </SidebarFooter>
         <SidebarRail />
      </Sidebar>
   )
}
