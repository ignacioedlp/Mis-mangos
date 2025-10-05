"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { duplicateExpenseOccurrence } from "@/actions/expense-actions";
import { toast } from "sonner";

interface DuplicateExpenseButtonProps {
  expenseId: string;
  expenseName: string;
  onSuccess?: () => void;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
}

export function DuplicateExpenseButton({
  expenseId,
  expenseName,
  onSuccess,
  variant = "ghost",
  size = "icon",
  showLabel = false,
}: DuplicateExpenseButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDuplicate = async () => {
    setIsProcessing(true);
    try {
      const result = await duplicateExpenseOccurrence(expenseId);
      toast.success(
        `Nueva ocurrencia creada para "${expenseName}" en el mes actual`,
        {
          description: `Monto: $${result.expense.estimatedAmount.toLocaleString()}`,
        }
      );
      setShowDialog(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Error al crear la nueva ocurrencia"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const ButtonContent = () => (
    <>
      <Copy className="h-4 w-4" />
      {showLabel && <span className="ml-2">Duplicar</span>}
    </>
  );

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size={size}
              onClick={() => setShowDialog(true)}
            >
              <ButtonContent />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Crear nueva ocurrencia para el mes actual</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Crear nueva ocurrencia?</DialogTitle>
            <DialogDescription>
              Se creará una nueva ocurrencia del gasto &quot;{expenseName}&quot; para el mes actual.
              <br />
              <br />
              Esto es útil cuando un gasto de tipo &quot;único&quot; necesita repetirse, o cuando
              quieres agregar una ocurrencia adicional de un gasto recurrente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDialog(false)}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDuplicate}
              disabled={isProcessing}
            >
              {isProcessing ? "Creando..." : "Crear ocurrencia"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
