"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createInstallmentPurchase } from "@/actions/installment-actions";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

const MONTHS = [
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

interface InstallmentPurchaseFormProps {
  expenseId: string;
  onCreated?: () => void;
}

export function InstallmentPurchaseForm({
  expenseId,
  onCreated,
}: InstallmentPurchaseFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const now = new Date();
  const [productName, setProductName] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [totalInstallments, setTotalInstallments] = useState("");
  const [installmentAmount, setInstallmentAmount] = useState("");
  const [startMonth, setStartMonth] = useState(String(now.getMonth() + 1));
  const [startYear, setStartYear] = useState(String(now.getFullYear()));
  const [notes, setNotes] = useState("");
  const [markPreviousAsPaid, setMarkPreviousAsPaid] = useState(false);

  // Auto-calculate installment amount when total and count change
  const handleTotalOrCountChange = (newTotal: string, newCount: string) => {
    const total = parseFloat(newTotal);
    const count = parseInt(newCount);
    if (!isNaN(total) && !isNaN(count) && count > 0) {
      setInstallmentAmount((total / count).toFixed(2));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createInstallmentPurchase({
          expenseId,
          productName,
          totalPrice: parseFloat(totalPrice),
          totalInstallments: parseInt(totalInstallments),
          installmentAmount: parseFloat(installmentAmount),
          startYear: parseInt(startYear),
          startMonth: parseInt(startMonth),
          notes: notes || null,
          markPreviousAsPaid,
        });
        toast.success("Compra en cuotas creada correctamente");
        setOpen(false);
        setProductName("");
        setTotalPrice("");
        setTotalInstallments("");
        setInstallmentAmount("");
        setNotes("");
        setMarkPreviousAsPaid(false);
        router.refresh();
        onCreated?.();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error al crear la compra",
        );
      }
    });
  };

  const currentYear = now.getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva compra en cuotas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar compra en cuotas</DialogTitle>
          <DialogDescription>
            Registrá una compra financiada para hacer seguimiento de cada cuota.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="productName">Nombre del producto / compra</Label>
            <Input
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder='Ej: TV Samsung 55"'
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="totalPrice">Precio total ($)</Label>
              <Input
                id="totalPrice"
                type="number"
                step="0.01"
                min="0.01"
                value={totalPrice}
                onChange={(e) => {
                  setTotalPrice(e.target.value);
                  handleTotalOrCountChange(e.target.value, totalInstallments);
                }}
                placeholder="0.00"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="totalInstallments">Cantidad de cuotas</Label>
              <Input
                id="totalInstallments"
                type="number"
                min="1"
                max="360"
                value={totalInstallments}
                onChange={(e) => {
                  setTotalInstallments(e.target.value);
                  handleTotalOrCountChange(totalPrice, e.target.value);
                }}
                placeholder="12"
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="installmentAmount">Monto por cuota ($)</Label>
            <Input
              id="installmentAmount"
              type="number"
              step="0.01"
              min="0.01"
              value={installmentAmount}
              onChange={(e) => setInstallmentAmount(e.target.value)}
              placeholder="0.00"
              required
            />
            <p className="text-xs text-muted-foreground">
              Auto-calculado a partir del precio total. Podés ajustarlo si hay
              intereses.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Mes de inicio</Label>
              <Select value={startMonth} onValueChange={setStartMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Año de inicio</Label>
              <Select value={startYear} onValueChange={setStartYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="markPrevious"
              checked={markPreviousAsPaid}
              onCheckedChange={(v) => setMarkPreviousAsPaid(!!v)}
            />
            <Label
              htmlFor="markPrevious"
              className="text-sm font-normal cursor-pointer"
            >
              Marcar cuotas anteriores al mes actual como ya pagadas
            </Label>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
