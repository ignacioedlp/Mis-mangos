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
    <Sidebar collapsible="offcanvas" className="border-sidebar-border/70 bg-sidebar/95" {...props}>
      <SidebarHeader className="flex items-center px-4 py-5">
        <div className="relative flex w-full items-center gap-2.5 overflow-hidden rounded-xl border border-border/70 bg-card/80 px-3 py-2.5 shadow-sm">
          <div className="pointer-events-none absolute -right-6 -top-8 h-16 w-16 rounded-full bg-primary/[0.12] blur-2xl" />
          <Logo />
          <span className="relative font-serif text-base font-bold tracking-normal">
            Mis Mangos
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="px-3 py-2">
          <span className="px-3 font-mono text-[10px] font-semibold uppercase tracking-normal text-muted-foreground/70">
            Navegación
          </span>
        </div>
        <SidebarMenu className="px-2 space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={item.isActive}
                  size="lg"
                  className="group rounded-lg border border-transparent transition-all hover:border-primary/15 hover:bg-sidebar-accent/50 data-[active=true]:border-primary/25 data-[active=true]:bg-primary/10 data-[active=true]:shadow-sm"
                >
                  <Link
                    href={item.href}
                    className={`${item.isActive ? "text-foreground font-semibold" : "text-muted-foreground"} flex items-center gap-3 transition-colors`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border ${item.isActive ? "border-primary/25 bg-primary/20 text-primary shadow-xs shadow-primary/20" : "border-border/50 bg-background/60 text-muted-foreground"} transition-colors`}
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
