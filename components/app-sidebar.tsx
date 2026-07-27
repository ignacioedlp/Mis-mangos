"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  FolderOpen,
  DollarSign,
  Calendar,
  TrendingUp,
  PieChart,
  FileText,
  Gift,
  Wallet,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import SignOutForm from "./sign-out-form";
import Logo from "./logo";
import { usePathname } from "next/navigation";

export default function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const menuItems = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      label: "Panel mensual",
      isActive: pathname.startsWith("/dashboard"),
    },
    {
      href: "/categories",
      icon: FolderOpen,
      label: "Categorías",
      isActive: pathname.startsWith("/categories"),
    },
    {
      href: "/expenses",
      icon: DollarSign,
      label: "Gastos",
      isActive: pathname.startsWith("/expenses"),
    },
    {
      href: "/monthly",
      icon: Calendar,
      label: "Mensual",
      isActive: pathname.startsWith("/monthly"),
    },
    {
      href: "/budget",
      icon: PieChart,
      label: "Presupuesto",
      isActive: pathname.startsWith("/budget"),
    },
    {
      href: "/wishlist",
      icon: Gift,
      label: "Lista de deseos",
      isActive: pathname.startsWith("/wishlist"),
    },
    {
      href: "/usd-cashflow",
      icon: Wallet,
      label: "USD disponible",
      isActive: pathname.startsWith("/usd-cashflow"),
    },
    {
      href: "/reports",
      icon: FileText,
      label: "Reportes",
      isActive: pathname.startsWith("/reports"),
    },
    {
      href: "/comparison",
      icon: TrendingUp,
      label: "Comparador",
      isActive: pathname.startsWith("/comparison"),
    },
  ];

  return (
    <Sidebar collapsible="offcanvas" className="border-sidebar-border/75 bg-sidebar" {...props}>
      <SidebarHeader className="flex items-center px-3 py-4">
        <div className="relative flex w-full items-center gap-3 overflow-hidden rounded-xl border border-sidebar-border/80 bg-background/55 px-3 py-2.5 shadow-sm">
          <Logo />
          <div className="min-w-0">
            <span className="block truncate font-serif text-base font-extrabold tracking-normal">
              Mis Mangos
            </span>
            <span className="block truncate font-mono text-[10px] font-bold uppercase text-muted-foreground">
              Finanzas personales
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="px-3 pb-2 pt-1">
          <span className="px-3 font-mono text-[10px] font-bold uppercase tracking-normal text-muted-foreground/75">
            Navegación
          </span>
        </div>
        <SidebarMenu className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={item.isActive}
                  size="lg"
                  tooltip={item.label}
                  className="group rounded-lg border border-transparent transition-all hover:border-primary/20 hover:bg-sidebar-accent/55 data-[active=true]:border-primary/40 data-[active=true]:bg-primary/10 data-[active=true]:shadow-sm"
                >
                  <Link
                    href={item.href}
                    className={`${item.isActive ? "font-bold text-sidebar-foreground" : "text-muted-foreground"} flex items-center gap-3 transition-colors`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border ${item.isActive ? "border-primary/45 bg-primary text-primary-foreground shadow-xs shadow-primary/25" : "border-border/55 bg-background/55 text-muted-foreground"} transition-colors`}
                    >
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
  );
}
