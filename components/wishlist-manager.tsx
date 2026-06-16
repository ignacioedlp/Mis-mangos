"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  CircleDollarSign,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Plus,
  ShoppingBag,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  deleteWishlistItem,
  updateWishlistItemStatus,
} from "@/actions/wishlist-actions";
import {
  WishlistDialog,
  type WishlistSubcategoryOption,
} from "@/components/wishlist-dialog";
import { AdminPageHeader } from "@/components/admin-page-header";
import { CryptoDollarQuote } from "@/components/crypto-dollar-quote";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import {
  formatArsToCryptoUsd,
  type CryptoDollarRate,
} from "@/lib/crypto-dollar";
import type {
  WishlistItemDTO,
  WishlistPriority,
  WishlistStatus,
  WishlistSummaryDTO,
} from "@/lib/types";

interface WishlistManagerProps {
  initialItems: WishlistItemDTO[];
  summary: WishlistSummaryDTO;
  subcategories: WishlistSubcategoryOption[];
  cryptoDollarRate: CryptoDollarRate | null;
}

const statusLabels: Record<WishlistStatus, string> = {
  PLANNED: "Planeado",
  COMPLETED: "Realizado",
  DISCARDED: "Descartado",
};

const priorityLabels: Record<WishlistPriority, string> = {
  HIGH: "Alta",
  MEDIUM: "Media",
  LOW: "Baja",
};

export function WishlistManager({
  initialItems,
  summary,
  subcategories,
  cryptoDollarRate,
}: WishlistManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WishlistItemDTO | null>(null);
  const [itemToDelete, setItemToDelete] = useState<WishlistItemDTO | null>(null);

  const filteredItems = useMemo(
    () =>
      initialItems.filter(
        (item) =>
          (statusFilter === "ALL" || item.status === statusFilter) &&
          (priorityFilter === "ALL" || item.priority === priorityFilter),
      ),
    [initialItems, priorityFilter, statusFilter],
  );

  const refresh = () => {
    setSelectedItem(null);
    router.refresh();
  };

  const changeStatus = (item: WishlistItemDTO, status: WishlistStatus) => {
    startTransition(async () => {
      try {
        await updateWishlistItemStatus(item.id, status);
        toast.success(
          `"${item.name}" ahora está ${statusLabels[status].toLowerCase()}`,
        );
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "No se pudo cambiar el estado",
        );
      }
    });
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    startTransition(async () => {
      try {
        await deleteWishlistItem(itemToDelete.id);
        toast.success("Artículo eliminado");
        setItemToDelete(null);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "No se pudo eliminar el artículo",
        );
      }
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Planificación"
        title="Lista de deseos"
        description={
          <>
            Compará cada compra con tus compromisos y presupuesto del mes actual.
            <span className="mt-2 block">
              <CryptoDollarQuote rate={cryptoDollarRate} />
            </span>
          </>
        }
        actions={
        <Button
          onClick={() => {
            setSelectedItem(null);
            setDialogOpen(true);
          }}
          disabled={subcategories.length === 0}
        >
          <Plus data-icon="inline-start" />
          Agregar artículo
        </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Planeados" value={String(summary.planned)} />
        <SummaryCard title="Realizados" value={String(summary.completed)} />
        <SummaryCard title="Descartados" value={String(summary.discarded)} />
        <SummaryCard
          title="Total financiado planeado"
          value={formatCurrency(summary.plannedFinancedTotal)}
          detail={
            formatArsToCryptoUsd(
              summary.plannedFinancedTotal,
              cryptoDollarRate,
            ) ?? "Cotización no disponible"
          }
        />
      </div>

      <div className="fintech-surface flex flex-col gap-3 rounded-xl p-4 sm:flex-row">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los estados</SelectItem>
            <SelectItem value="PLANNED">Planeados</SelectItem>
            <SelectItem value="COMPLETED">Realizados</SelectItem>
            <SelectItem value="DISCARDED">Descartados</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas las prioridades</SelectItem>
            <SelectItem value="HIGH">Alta</SelectItem>
            <SelectItem value="MEDIUM">Media</SelectItem>
            <SelectItem value="LOW">Baja</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {subcategories.length === 0 ? (
        <Card className="border-dashed border-border/70">
          <CardHeader className="items-center text-center">
            <CardTitle>Primero necesitás una subcategoría</CardTitle>
            <CardDescription>
              Creala desde Categorías para poder clasificar y evaluar tus deseos.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : filteredItems.length === 0 ? (
        <Card className="border-dashed border-border/70">
          <CardHeader className="items-center text-center">
            <ShoppingBag className="size-10 text-muted-foreground" />
            <CardTitle>No hay artículos para mostrar</CardTitle>
            <CardDescription>
              Agregá un deseo o cambiá los filtros seleccionados.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredItems.map((item) => (
            <WishlistCard
              key={item.id}
              item={item}
              cryptoDollarRate={cryptoDollarRate}
              disabled={isPending}
              onEdit={() => {
                setSelectedItem(item);
                setDialogOpen(true);
              }}
              onDelete={() => setItemToDelete(item)}
              onStatusChange={(status) => changeStatus(item, status)}
            />
          ))}
        </div>
      )}

      <WishlistDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={selectedItem}
        subcategories={subcategories}
        onSaved={refresh}
      />

      <AlertDialog
        open={itemToDelete !== null}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar artículo</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará “{itemToDelete?.name}” de forma permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isPending}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail?: string;
}) {
  return (
    <Card className="border-border/70">
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="font-serif text-2xl font-extrabold">{value}</p>
        {detail && (
          <p className="mt-1 text-xs text-muted-foreground">
            {detail} a vender
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function WishlistCard({
  item,
  cryptoDollarRate,
  disabled,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  item: WishlistItemDTO;
  cryptoDollarRate: CryptoDollarRate | null;
  disabled: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: WishlistStatus) => void;
}) {
  const affordability = {
    AFFORDABLE: {
      label: "Podés pagarlo",
      icon: CheckCircle2,
      badge: "default" as const,
    },
    NOT_AFFORDABLE: {
      label: "No entra en el presupuesto",
      icon: XCircle,
      badge: "destructive" as const,
    },
    INSUFFICIENT_DATA: {
      label: "Sin datos suficientes",
      icon: CircleDollarSign,
      badge: "secondary" as const,
    },
  }[item.affordabilityStatus];
  const AffordabilityIcon = affordability.icon;

  return (
    <Card className="overflow-hidden border-border/70">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate font-serif text-xl">
              {item.name}
            </CardTitle>
            <CardDescription>
              {item.categoryName} / {item.subcategoryName}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Acciones">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil />
                Editar
              </DropdownMenuItem>
              {item.url && (
                <DropdownMenuItem asChild>
                  <a href={item.url} target="_blank" rel="noreferrer">
                    <ExternalLink />
                    Abrir artículo
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {item.status !== "PLANNED" && (
                <DropdownMenuItem onClick={() => onStatusChange("PLANNED")}>
                  Marcar como planeado
                </DropdownMenuItem>
              )}
              {item.status !== "COMPLETED" && (
                <DropdownMenuItem onClick={() => onStatusChange("COMPLETED")}>
                  Marcar como realizado
                </DropdownMenuItem>
              )}
              {item.status !== "DISCARDED" && (
                <DropdownMenuItem onClick={() => onStatusChange("DISCARDED")}>
                  Marcar como descartado
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} disabled={disabled}>
                <Trash2 />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{statusLabels[item.status]}</Badge>
          <Badge variant="secondary">
            Prioridad {priorityLabels[item.priority].toLowerCase()}
          </Badge>
          <Badge variant={affordability.badge}>
            <AffordabilityIcon />
            {affordability.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Precio contado" value={formatCurrency(item.cashPrice)} />
          <Metric
            label={`${item.totalInstallments} cuotas`}
            value={formatCurrency(item.installmentAmount)}
          />
          <Metric
            label="Total financiado"
            value={formatCurrency(item.financedTotal)}
          />
        </div>

        <div className="grid gap-3 rounded-xl border border-border/60 bg-background/35 p-4 sm:grid-cols-2">
          <Metric
            label="Interés total"
            value={`${formatCurrency(item.interestAmount)} (${formatPercentage(item.interestPercentage)})`}
          />
          <Metric
            label="Dólares a vender para la cuota"
            value={
              formatArsToCryptoUsd(
                item.installmentAmount,
                cryptoDollarRate,
              ) ?? "Cotización no disponible"
            }
          />
          <Metric
            label="Comprometido en la categoría"
            value={formatCurrency(item.categoryCommittedAmount)}
          />
          <Metric
            label="Presupuesto de la categoría"
            value={
              item.categoryBudgetAmount === null
                ? "Sin asignar"
                : formatCurrency(item.categoryBudgetAmount)
            }
          />
          <Metric
            label="Saldo disponible"
            value={
              item.categoryAvailableAmount === null
                ? "No disponible"
                : formatCurrency(item.categoryAvailableAmount)
            }
          />
          <Metric
            label="Saldo luego de la cuota"
            value={
              item.balanceAfterPurchase === null
                ? "No disponible"
                : formatCurrency(item.balanceAfterPurchase)
            }
          />
          <Metric
            label="Saldo mensual global"
            value={
              item.monthlyAvailableAmount === null
                ? "No disponible"
                : formatCurrency(item.monthlyAvailableAmount)
            }
          />
        </div>

        <p className="text-sm text-muted-foreground">
          {item.affordabilityReason}
        </p>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate font-semibold">{value}</p>
    </div>
  );
}
