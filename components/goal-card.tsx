"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  PauseCircle,
  PlayCircle,
  XCircle,
  Target,
  TrendingUp,
  Plus,
  Minus,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import type { GoalDTO } from "@/lib/types";
import { deleteGoal, updateGoalStatus, updateGoalAmount } from "@/actions/goal-actions";

interface GoalCardProps {
  goal: GoalDTO;
  onEdit: (goal: GoalDTO) => void;
  onUpdate: () => void;
}

const goalTypeLabels = {
  SAVINGS: "Ahorro",
  DEBT_PAYMENT: "Pago de deuda",
  EXPENSE_REDUCTION: "Reducción de gastos",
  CUSTOM: "Personalizado",
};

const goalTypeColors = {
  SAVINGS: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  DEBT_PAYMENT: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  EXPENSE_REDUCTION: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  CUSTOM: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
};

const statusLabels = {
  ACTIVE: "Activo",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
  PAUSED: "Pausado",
};

const statusColors = {
  ACTIVE: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  PAUSED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
};

export function GoalCard({ goal, onEdit, onUpdate }: GoalCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAmountDialog, setShowAmountDialog] = useState(false);
  const [amountOperation, setAmountOperation] = useState<"add" | "subtract">("add");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await deleteGoal(goal.id);
      toast.success("Objetivo eliminado exitosamente");
      onUpdate();
    } catch {
      toast.error("Error al eliminar el objetivo");
    } finally {
      setIsProcessing(false);
      setShowDeleteDialog(false);
    }
  };

  const handleStatusChange = async (newStatus: "ACTIVE" | "COMPLETED" | "CANCELLED" | "PAUSED") => {
    setIsProcessing(true);
    try {
      await updateGoalStatus(goal.id, newStatus);
      toast.success(`Objetivo marcado como ${statusLabels[newStatus].toLowerCase()}`);
      onUpdate();
    } catch {
      toast.error("Error al actualizar el estado");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAmountUpdate = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Ingresa un monto válido");
      return;
    }

    setIsProcessing(true);
    try {
      await updateGoalAmount(goal.id, {
        amount: parseFloat(amount),
        operation: amountOperation,
      });
      toast.success("Monto actualizado exitosamente");
      setAmount("");
      setShowAmountDialog(false);
      onUpdate();
    } catch {
      toast.error("Error al actualizar el monto");
    } finally {
      setIsProcessing(false);
    }
  };

  const openAmountDialog = (operation: "add" | "subtract") => {
    setAmountOperation(operation);
    setAmount("");
    setShowAmountDialog(true);
  };

  return (
    <>
      <Card className="border-border/60 hover:border-primary/20 transition-all duration-300 hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <Target className="h-4.5 w-4.5 text-primary" />
                </div>
                <CardTitle className="font-serif text-xl font-bold">{goal.name}</CardTitle>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge className={goalTypeColors[goal.type]} variant="secondary">
                  {goalTypeLabels[goal.type]}
                </Badge>
                <Badge className={statusColors[goal.status]} variant="secondary">
                  {statusLabels[goal.status]}
                </Badge>
                {goal.categoryName && (
                  <Badge variant="outline">{goal.categoryName}</Badge>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(goal)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openAmountDialog("add")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar monto
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openAmountDialog("subtract")}>
                  <Minus className="h-4 w-4 mr-2" />
                  Restar monto
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {goal.status === "ACTIVE" && (
                  <>
                    <DropdownMenuItem onClick={() => handleStatusChange("COMPLETED")}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar completado
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange("PAUSED")}>
                      <PauseCircle className="h-4 w-4 mr-2" />
                      Pausar
                    </DropdownMenuItem>
                  </>
                )}
                {goal.status === "PAUSED" && (
                  <DropdownMenuItem onClick={() => handleStatusChange("ACTIVE")}>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Reanudar
                  </DropdownMenuItem>
                )}
                {goal.status !== "CANCELLED" && (
                  <DropdownMenuItem onClick={() => handleStatusChange("CANCELLED")}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {goal.description && (
            <CardDescription className="mt-2">{goal.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">{goal.progress.toFixed(1)}%</span>
            </div>
            <Progress value={goal.progress} className="h-2" />
            <div className="flex justify-between items-center text-sm">
              <div>
                <span className="text-muted-foreground">Actual: </span>
                <span className="font-serif font-bold">
                  ${goal.currentAmount.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Objetivo: </span>
                <span className="font-serif font-bold">
                  ${goal.targetAmount.toLocaleString()}
                </span>
              </div>
            </div>
            {goal.remainingAmount > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Faltan ${goal.remainingAmount.toLocaleString()}</span>
              </div>
            )}
          </div>

          {goal.targetDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Fecha objetivo: {format(new Date(goal.targetDate), "PPP", { locale: es })}
              </span>
            </div>
          )}

          {goal.status === "COMPLETED" && goal.completedAt && (
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">
              ✓ Completado el {format(new Date(goal.completedAt), "PPP", { locale: es })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar objetivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el objetivo
              &quot;{goal.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Amount Update Dialog */}
      <AlertDialog open={showAmountDialog} onOpenChange={setShowAmountDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {amountOperation === "add" ? "Agregar monto" : "Restar monto"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {amountOperation === "add"
                ? "Ingresa el monto que deseas agregar al progreso de tu objetivo."
                : "Ingresa el monto que deseas restar del progreso de tu objetivo."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAmountUpdate();
                  }
                }}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Monto actual: ${goal.currentAmount.toLocaleString()}</p>
              {amount && parseFloat(amount) > 0 && (
                <p className="font-medium mt-1">
                  Nuevo monto:{" "}
                  {amountOperation === "add"
                    ? `$${(goal.currentAmount + parseFloat(amount)).toLocaleString()}`
                    : `$${Math.max(0, goal.currentAmount - parseFloat(amount)).toLocaleString()}`}
                </p>
              )}
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleAmountUpdate} disabled={isProcessing}>
              {isProcessing ? "Actualizando..." : "Actualizar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
