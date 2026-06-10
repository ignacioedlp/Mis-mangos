"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import {
  createWishlistItem,
  updateWishlistItem,
} from "@/actions/wishlist-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import type { WishlistItemDTO, WishlistPriority } from "@/lib/types";

const wishlistFormSchema = z
  .object({
    name: z.string().trim().min(1, "El nombre es obligatorio").max(120),
    cashPrice: z.coerce.number().positive("El precio debe ser mayor a 0"),
    totalInstallments: z.coerce
      .number()
      .int("Ingresá un número entero")
      .min(1)
      .max(360),
    installmentAmount: z.coerce
      .number()
      .positive("El importe debe ser mayor a 0"),
    subcategoryId: z.string().uuid("Seleccioná una subcategoría"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
    url: z
      .union([z.string().trim().url("Ingresá una URL válida"), z.literal("")])
      .optional(),
  })
  .superRefine((data, context) => {
    if (
      data.totalInstallments * data.installmentAmount + 0.005 <
      data.cashPrice
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["installmentAmount"],
        message: "El total financiado no puede ser menor al precio de contado",
      });
    }
  });

type WishlistFormValues = z.infer<typeof wishlistFormSchema>;

export type WishlistSubcategoryOption = {
  id: string;
  name: string;
  categoryId: string;
  category: { name: string };
};

interface WishlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: WishlistItemDTO | null;
  subcategories: WishlistSubcategoryOption[];
  onSaved: () => void;
}

const defaultValues: WishlistFormValues = {
  name: "",
  cashPrice: 0,
  totalInstallments: 1,
  installmentAmount: 0,
  subcategoryId: "",
  priority: "MEDIUM",
  url: "",
};

export function WishlistDialog({
  open,
  onOpenChange,
  item,
  subcategories,
  onSaved,
}: WishlistDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<WishlistFormValues>({
    resolver: zodResolver(wishlistFormSchema),
    mode: "onSubmit",
    reValidateMode: "onBlur",
    defaultValues,
  });

  useEffect(() => {
    form.reset(
      item
        ? {
            name: item.name,
            cashPrice: item.cashPrice,
            totalInstallments: item.totalInstallments,
            installmentAmount: item.installmentAmount,
            subcategoryId: item.subcategoryId,
            priority: item.priority,
            url: item.url ?? "",
          }
        : defaultValues,
    );
  }, [form, item, open]);

  const [cashPrice, totalInstallments, installmentAmount] = useWatch({
    control: form.control,
    name: ["cashPrice", "totalInstallments", "installmentAmount"],
  });

  const financing = useMemo(() => {
    const cash = Number(cashPrice) || 0;
    const installments = Number(totalInstallments) || 0;
    const amount = Number(installmentAmount) || 0;
    const financedTotal = installments * amount;
    const interestAmount = Math.max(0, financedTotal - cash);
    const interestPercentage =
      cash > 0 ? (interestAmount / cash) * 100 : 0;

    return { financedTotal, interestAmount, interestPercentage };
  }, [cashPrice, installmentAmount, totalInstallments]);

  async function onSubmit(values: WishlistFormValues) {
    setIsSubmitting(true);
    try {
      if (item) {
        await updateWishlistItem(item.id, values);
        toast.success("Artículo actualizado");
      } else {
        await createWishlistItem(values);
        toast.success("Artículo agregado a la lista");
      }
      onOpenChange(false);
      onSaved();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo guardar el artículo",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {item ? "Editar artículo" : "Agregar artículo"}
          </DialogTitle>
          <DialogDescription>
            Registrá el precio de contado y el valor real de la cuota para medir
            el impacto del financiamiento.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Notebook para trabajar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="subcategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategoría</FormLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccioná una subcategoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subcategories.map((subcategory) => (
                          <SelectItem
                            key={subcategory.id}
                            value={subcategory.id}
                          >
                            {subcategory.category.name} / {subcategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridad</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(value as WishlistPriority)
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="HIGH">Alta</SelectItem>
                        <SelectItem value="MEDIUM">Media</SelectItem>
                        <SelectItem value="LOW">Baja</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="cashPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio de contado</FormLabel>
                    <FormControl>
                      <Input type="number" min="0.01" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalInstallments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad de cuotas</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="360" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="installmentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Importe por cuota</FormLabel>
                    <FormControl>
                      <Input type="number" min="0.01" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-3 rounded-xl border bg-muted/30 p-4 sm:grid-cols-3">
              <FinancingMetric
                label="Total financiado"
                value={formatCurrency(financing.financedTotal)}
              />
              <FinancingMetric
                label="Interés total"
                value={formatCurrency(financing.interestAmount)}
              />
              <FinancingMetric
                label="Interés porcentual"
                value={formatPercentage(financing.interestPercentage)}
              />
            </div>

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link del artículo (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://tienda.com/articulo"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Se abrirá en una pestaña nueva desde la tarjeta.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : item ? "Actualizar" : "Agregar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function FinancingMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
