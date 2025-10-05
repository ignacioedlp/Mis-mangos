"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";
import { GoalDialog } from "@/components/goal-dialog";
import { GoalCard } from "@/components/goal-card";
import { StatCard } from "@/components/stat-card";
import { listGoals, getGoalsSummary } from "@/actions/goal-actions";
import { listCategories } from "@/actions/expense-actions";
import type { GoalDTO, CategoryDTO } from "@/lib/types";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function GoalsPage() {
  const [goals, setGoals] = useState<GoalDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [summary, setSummary] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [goalsData, categoriesData, summaryData] = await Promise.all([
        listGoals(),
        listCategories(),
        getGoalsSummary(),
      ]);
      setGoals(goalsData);
      setCategories(categoriesData);
      setSummary(summaryData);
    } catch {
      toast.error("Error al cargar los datos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (goal: GoalDTO) => {
    setSelectedGoal(goal);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedGoal(null);
  };

  const handleSuccess = () => {
    loadData();
  };

  const activeGoals = goals.filter(g => g.status === "ACTIVE");
  const completedGoals = goals.filter(g => g.status === "COMPLETED");
  const pausedGoals = goals.filter(g => g.status === "PAUSED");

  const displayGoals = activeTab === "all" ? goals :
    activeTab === "active" ? activeGoals :
      activeTab === "completed" ? completedGoals :
        pausedGoals;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Cargando objetivos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            Mis Objetivos
          </h1>
          <p className="text-muted-foreground mt-2">
            Define y alcanza tus metas financieras
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo objetivo
        </Button>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Objetivos activos"
            value={summary.activeGoals}
            iconName="trendingUp"
          />
          <StatCard
            title="Completados"
            value={summary.completedGoals}
            iconName="trendingUp"
          />
          <StatCard
            title="Progreso general"
            value={`${summary.overallProgress.toFixed(1)}%`}
            iconName="trendingUp"
            progress={summary.overallProgress}
          />
          <StatCard
            title="Total objetivo"
            value={`$${summary.totalTargetAmount.toLocaleString()}`}
            iconName="dollar"
          />
        </div>
      )}

      {/* Goals List */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            Todos ({goals.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Activos ({activeGoals.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completados ({completedGoals.length})
          </TabsTrigger>
          <TabsTrigger value="paused">
            Pausados ({pausedGoals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {displayGoals.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {activeTab === "all"
                  ? "No tienes objetivos aún"
                  : `No tienes objetivos ${activeTab === "active" ? "activos" : activeTab === "completed" ? "completados" : "pausados"}`
                }
              </h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primer objetivo financiero para empezar a alcanzar tus metas
              </p>
              {activeTab === "all" && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear objetivo
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displayGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={handleEdit}
                  onUpdate={handleSuccess}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Goal Dialog */}
      <GoalDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        goal={selectedGoal}
        categories={categories}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
