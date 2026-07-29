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

  const menuSections = [
    {
      label: "Operación",
      items: [
        { href: "/dashboard", icon: LayoutDashboard, label: "Panel mensual" },
        { href: "/expenses", icon: DollarSign, label: "Gastos" },
        { href: "/monthly", icon: Calendar, label: "Vista mensual" },
      ],
    },
    {
      label: "Planificación",
      items: [
        { href: "/budget", icon: PieChart, label: "Presupuesto" },
        { href: "/categories", icon: FolderOpen, label: "Categorías" },
        { href: "/wishlist", icon: Gift, label: "Lista de deseos" },
      ],
    },
    {
      label: "Patrimonio",
      items: [
        { href: "/usd-cashflow", icon: Wallet, label: "USD disponible" },
      ],
    },
    {
      label: "Análisis",
      items: [
        { href: "/reports", icon: FileText, label: "Reportes" },
        { href: "/comparison", icon: TrendingUp, label: "Comparador" },
      ],
    },
  ];

  return (
    <Sidebar collapsible="offcanvas" className="border-sidebar-border bg-sidebar" {...props}>
      <SidebarHeader className="flex items-center border-b border-sidebar-border px-3 py-3">
        <div className="flex w-full items-center gap-3 overflow-hidden px-2 py-1">
          <Logo />
          <div className="min-w-0">
            <span className="block truncate font-serif text-base font-bold tracking-normal">
              Mis Mangos
            </span>
            <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Libro personal
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="py-3">
        {menuSections.map((section) => (
          <div key={section.label} className="mb-4 px-2 last:mb-0">
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
              {section.label}
            </p>
            <SidebarMenu className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      size="lg"
                      tooltip={item.label}
                      className="group rounded-md border-l-2 border-transparent transition-colors hover:bg-sidebar-accent data-[active=true]:border-primary data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-foreground"
                    >
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className={`${isActive ? "font-semibold text-sidebar-foreground" : "text-muted-foreground"} flex items-center gap-3`}
                      >
                        <Icon className={isActive ? "text-primary" : ""} aria-hidden="true" />
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </div>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <SignOutForm />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
