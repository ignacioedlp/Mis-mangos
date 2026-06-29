"use client";

import { useMemo, useRef, useState } from "react";
import { FileUp } from "lucide-react";
import Papa from "papaparse";
import { toast } from "sonner";

import { importUsdTransfers } from "@/actions/usd-cashflow-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatUsdCurrency } from "@/lib/utils";

interface UsdCsvImportDialogProps {
  year: number;
  month: number;
}

interface ParsedTransfer {
  amount: number;
  transferredAt: string;
  description: string;
}

interface RejectedRow {
  row: number;
  reason: string;
}

type CsvRow = Record<string, string | undefined>;

const dateColumns = ["fecha", "date", "transferredat", "transferred_at"];
const amountColumns = ["monto", "amount", "importe", "usd"];
const descriptionColumns = [
  "descripcion",
  "description",
  "detalle",
  "concepto",
  "nota",
];

function normalizeKey(key: string) {
  return key
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function getColumnValue(row: CsvRow, columns: string[]) {
  const entries = Object.entries(row);
  const found = entries.find(([key]) => columns.includes(normalizeKey(key)));
  return found?.[1]?.trim() ?? "";
}

function parseAmount(value: string) {
  const cleanValue = value.replace(/[^\d,.-]/g, "");

  if (!cleanValue) return Number.NaN;

  const lastComma = cleanValue.lastIndexOf(",");
  const lastDot = cleanValue.lastIndexOf(".");

  if (lastComma > lastDot) {
    return Number(cleanValue.replace(/\./g, "").replace(",", "."));
  }

  if (lastDot > lastComma) {
    return Number(cleanValue.replace(/,/g, ""));
  }

  return Number(cleanValue.replace(",", "."));
}

function parseDate(value: string) {
  const trimmedValue = value.trim();
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmedValue);
  if (isoMatch) return trimmedValue;

  const slashMatch = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(trimmedValue);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const parsedDate = new Date(trimmedValue);
  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toISOString().slice(0, 10);
}

function isSameMonth(dateValue: string, year: number, month: number) {
  const [dateYear, dateMonth] = dateValue.split("-").map(Number);
  return dateYear === year && dateMonth === month;
}

function parseRows(rows: CsvRow[], year: number, month: number) {
  const transfers: ParsedTransfer[] = [];
  const rejectedRows: RejectedRow[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const amount = parseAmount(getColumnValue(row, amountColumns));
    const transferredAt = parseDate(getColumnValue(row, dateColumns));
    const description = getColumnValue(row, descriptionColumns).slice(0, 120);

    if (!Number.isFinite(amount) || amount <= 0) {
      rejectedRows.push({ row: rowNumber, reason: "monto inválido" });
      return;
    }

    if (!transferredAt) {
      rejectedRows.push({ row: rowNumber, reason: "fecha inválida" });
      return;
    }

    if (!isSameMonth(transferredAt, year, month)) {
      rejectedRows.push({
        row: rowNumber,
        reason: "la fecha no corresponde al mes seleccionado",
      });
      return;
    }

    transfers.push({ amount, transferredAt, description });
  });

  return { transfers, rejectedRows };
}

export function UsdCsvImportDialog({ year, month }: UsdCsvImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transfers, setTransfers] = useState<ParsedTransfer[]>([]);
  const [rejectedRows, setRejectedRows] = useState<RejectedRow[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const total = useMemo(
    () => transfers.reduce((sum, transfer) => sum + transfer.amount, 0),
    [transfers],
  );

  function resetImport() {
    setTransfers([]);
    setRejectedRows([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleFileChange(file?: File) {
    resetImport();

    if (!file) return;

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: "greedy",
      complete: (results) => {
        const parsed = parseRows(results.data, year, month);
        setTransfers(parsed.transfers);
        setRejectedRows(parsed.rejectedRows);

        if (parsed.transfers.length === 0) {
          toast.error("No encontré transferencias válidas en el CSV");
        }
      },
      error: () => {
        toast.error("No se pudo leer el CSV");
      },
    });
  }

  async function handleImport() {
    setLoading(true);

    try {
      const result = await importUsdTransfers({
        year,
        month,
        transfers,
      });
      toast.success(`${result.count} transferencia${result.count === 1 ? "" : "s"} importada${result.count === 1 ? "" : "s"}`);
      setOpen(false);
      resetImport();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudieron importar las transferencias";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const monthName = new Date(year, month - 1).toLocaleString("es-AR", {
    month: "long",
    year: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileUp className="mr-2 h-4 w-4" />
          Importar CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Importar transferencias USD</DialogTitle>
          <DialogDescription>
            Subí un CSV con columnas fecha, monto y descripción para cargar
            movimientos de {monthName}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="usd-csv-file">Archivo CSV</Label>
            <Input
              ref={fileInputRef}
              id="usd-csv-file"
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => handleFileChange(event.target.files?.[0])}
            />
            <p className="text-xs text-muted-foreground">
              Encabezados aceptados: fecha/date, monto/amount,
              descripcion/description.
            </p>
          </div>

          {(transfers.length > 0 || rejectedRows.length > 0) && (
            <div className="rounded-lg border border-border/70 bg-background/50 p-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium">
                  {transfers.length} lista{transfers.length === 1 ? "" : "s"}{" "}
                  para importar
                </span>
                <span className="font-serif font-bold tabular-nums">
                  {formatUsdCurrency(total)}
                </span>
              </div>
              {rejectedRows.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {rejectedRows.length} fila
                  {rejectedRows.length === 1 ? "" : "s"} omitida
                  {rejectedRows.length === 1 ? "" : "s"}:{" "}
                  {rejectedRows
                    .slice(0, 3)
                    .map((row) => `${row.row} (${row.reason})`)
                    .join(", ")}
                  {rejectedRows.length > 3 ? "..." : ""}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={loading || transfers.length === 0}
            >
              {loading ? "Importando..." : "Importar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
