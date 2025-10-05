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
         <SidebarHeader className="flex items-center">
            <Logo />
         </SidebarHeader>
         <SidebarContent>
            <SidebarMenu className="px-2 py-4">
               {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                     <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton isActive={item.isActive} size="lg">
                           <Link href={item.href} className={`${item.isActive ? "text-foreground" : "text-primary"} flex items-center gap-3`}>
                              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                                 <Icon className="h-5 w-5" />
                              </div>
                              <span className="text-sm font-medium">{item.label}</span>
                           </Link>
                        </SidebarMenuButton>
                     </SidebarMenuItem>
                  );
               })}
            </SidebarMenu>
         </SidebarContent>
         <SidebarFooter>
            <SignOutForm />
         </SidebarFooter>
         <SidebarRail />
      </Sidebar>
   )
}
