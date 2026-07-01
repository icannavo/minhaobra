import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronLeft,
  Settings,
  Users,
  Wrench,
  Package,
  Activity,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface StepWithExecution {
  id: number;
  name: string;
  stepOrder: number;
  stepType: string;
  baseTimeMinutes: number;
  description?: string;
  execution?: {
    id: number;
    status: string;
    startTime?: Date;
    endTime?: Date;
    durationMinutes: number;
  };
}

const STEP_TYPE_ICONS = {
  SAFETY_MEETING: "🛡️",
  PREPARATION: "📋",
  EQUIPMENT_SETUP: "🔧",
  SCAFFOLDING: "🏗️",
  EPIs: "🦺",
  EXECUTION: "⚡",
  BREAK: "☕",
  CLEANUP: "🧹",
  INSPECTION: "🔍",
  EQUIPMENT_TEARDOWN: "📦",
};

const STEP_TYPE_LABELS = {
  SAFETY_MEETING: "Reunião de Segurança",
  PREPARATION: "Preparação",
  EQUIPMENT_SETUP: "Montagem de Equipamentos",
  SCAFFOLDING: "Montagem de Andaime",
  EPIs: "Vestir EPIs",
  EXECUTION: "Execução",
  BREAK: "Intervalo",
  CLEANUP: "Limpeza",
  INSPECTION: "Inspeção",
  EQUIPMENT_TEARDOWN: "Desmontagem",
};

export default function TaskExecution() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const taskId = parseInt(id || "0");

  // Estado para timer
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Estado para dialog de material
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [selectedStepForMaterial, setSelectedStepForMaterial] = useState<number | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [materialQuantity, setMaterialQuantity] = useState<number>(0);
  const [materialNotes, setMaterialNotes] = useState("");

  // Buscar tarefa detalhada
  const { data: task, isLoading: loadingTask, refetch: refetchTask } = 
    trpc.detailedTasks.getById.useQuery({ id: taskId }, { enabled: !!taskId });

  // Buscar steps da subclasse
  const { data: steps = [], isLoading: loadingSteps, refetch: refetchSteps } = 
    trpc.taskSteps.getBySubclass.useQuery(
      { subclassId: task?.subclassId! },
      { enabled: !!task?.subclassId }
    );

  // Buscar execuções dos steps
  const { data: executions = [], refetch: refetchExecutions } = 
    trpc.stepExecutions.getByTask.useQuery(
      { detailedTaskId: taskId },
      { enabled: !!taskId }
    );

  // Buscar materiais disponíveis
  const { data: allMaterials = [] } = trpc.materials.getAll.useQuery();

  // Buscar consumos de material desta tarefa
  const { data: materialConsumptions = [], refetch: refetchConsumptions } = 
    trpc.materialConsumptions.getByTask.useQuery(
      { detailedTaskId: taskId },
      { enabled: !!taskId }
    );

  // Mutations
  const startStepMutation = trpc.stepExecutions.start.useMutation({
    onSuccess: () => {
      refetchExecutions();
      refetchTask();
      toast.success("Etapa iniciada!");
    },
    onError: (error) => {
      toast.error(`Erro ao iniciar etapa: ${error.message}`);
    },
  });

  const completeStepMutation = trpc.stepExecutions.complete.useMutation({
    onSuccess: () => {
      refetchExecutions();
      refetchTask();
      toast.success("Etapa concluída!");
    },
    onError: (error) => {
      toast.error(`Erro ao concluir etapa: ${error.message}`);
    },
  });

  const recordMaterialMutation = trpc.materialConsumptions.record.useMutation({
    onSuccess: () => {
      refetchConsumptions();
      toast.success("Consumo de material registrado!");
      setMaterialDialogOpen(false);
      setSelectedMaterial(null);
      setMaterialQuantity(0);
      setMaterialNotes("");
    },
    onError: (error) => {
      toast.error(`Erro ao registrar consumo: ${error.message}`);
    },
  });

  // Timer que atualiza a cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Combinar steps com executions
  const stepsWithExecutions: StepWithExecution[] = steps.map((step: any) => {
    const execution = executions.find((ex: any) => ex.stepId === step.id);
    return {
      ...step,
      execution: execution ? {
        id: execution.id,
        status: execution.status,
        startTime: execution.startTime ? new Date(execution.startTime) : undefined,
        endTime: execution.endTime ? new Date(execution.endTime) : undefined,
        durationMinutes: execution.durationMinutes || 0,
      } : undefined,
    };
  });

  // Calcular progresso
  const totalSteps = stepsWithExecutions.length;
  const completedSteps = stepsWithExecutions.filter(
    (s) => s.execution?.status === "Concluído"
  ).length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  // Step em execução atualmente
  const currentStep = stepsWithExecutions.find(
    (s) => s.execution?.status === "Em Execução"
  );

  // Calcular tempo decorrido do step atual
  const getElapsedTime = (startTime?: Date) => {
    if (!startTime) return 0;
    return Math.floor((currentTime - startTime.getTime()) / 1000); // segundos
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handlers
  const handleStartStep = (stepId: number) => {
    if (!taskId) return;
    
    // Verificar se já tem um step em execução
    const hasStepInProgress = stepsWithExecutions.some(
      (s) => s.execution?.status === "Em Execução"
    );
    
    if (hasStepInProgress) {
      toast.error("Já existe uma etapa em execução. Conclua-a primeiro.");
      return;
    }
    
    startStepMutation.mutate({
      detailedTaskId: taskId,
      stepId,
    });
  };

  const handleCompleteStep = (executionId: number) => {
    completeStepMutation.mutate({
      executionId,
      notes: undefined,
      issues: undefined,
    });
  };

  const handleOpenMaterialDialog = (stepId: number) => {
    setSelectedStepForMaterial(stepId);
    setMaterialDialogOpen(true);
  };

  const handleRecordMaterial = () => {
    if (!selectedMaterial || materialQuantity <= 0) {
      toast.error("Selecione um material e informe a quantidade");
      return;
    }

    recordMaterialMutation.mutate({
      detailedTaskId: taskId,
      materialId: selectedMaterial.id,
      actualQuantity: materialQuantity,
      notes: materialNotes || undefined,
    });
  };

  if (loadingTask || loadingSteps) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Carregando tarefa...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center">
        <Card className="p-8 bg-slate-800 border-slate-700 text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Tarefa não encontrada</h2>
          <p className="text-slate-400 mb-4">ID: {taskId}</p>
          <Button onClick={() => navigate("/daily")}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/daily")}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-3xl font-bold text-white">{task.taskName}</h1>
                  <p className="text-slate-400 mt-1">
                    {format(new Date(task.date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>
              </div>
              
              {task.description && (
                <p className="text-slate-300 mt-2">{task.description}</p>
              )}
            </div>

            <Badge
              variant={
                task.status === "Concluído" ? "default" :
                task.status === "Em Execução" ? "default" :
                "secondary"
              }
              className={cn(
                "text-sm px-4 py-2",
                task.status === "Concluído" && "bg-green-500/10 text-green-400 border-green-500/20",
                task.status === "Em Execução" && "bg-blue-500/10 text-blue-400 border-blue-500/20"
              )}
            >
              {task.status}
            </Badge>
          </div>
        </div>

        {/* Progresso Geral */}
        <Card className="p-6 bg-slate-800 border-slate-700 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Progresso Geral</h3>
              <p className="text-sm text-slate-400">
                {completedSteps} de {totalSteps} etapas concluídas
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {progressPercentage.toFixed(0)}%
              </div>
            </div>
          </div>

          <Progress value={progressPercentage} className="h-3" />

          {/* Informações da Tarefa */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Equipe</p>
                <p className="text-sm font-semibold text-white">{task.numberOfEmployees} pessoas</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Área</p>
                <p className="text-sm font-semibold text-white">{task.area} m²</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Tempo Estimado</p>
                <p className="text-sm font-semibold text-white">
                  {Math.floor(task.estimatedTotalMinutes / 60)}h {task.estimatedTotalMinutes % 60}m
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Tempo Real</p>
                <p className="text-sm font-semibold text-white">
                  {Math.floor(task.actualTotalMinutes / 60)}h {task.actualTotalMinutes % 60}m
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Timer do Step Atual */}
        {currentStep && (
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">
                  {STEP_TYPE_ICONS[currentStep.stepType as keyof typeof STEP_TYPE_ICONS]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{currentStep.name}</h3>
                  <p className="text-sm text-blue-300">Em execução agora</p>
                </div>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400 mb-1 tabular-nums">
                  {formatTime(getElapsedTime(currentStep.execution?.startTime))}
                </div>
                <p className="text-xs text-slate-400">
                  Estimado: {currentStep.baseTimeMinutes}min
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Lista de Steps */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white mb-4">Etapas da Tarefa</h3>
          
          {stepsWithExecutions.map((step, index) => {
            const isCompleted = step.execution?.status === "Concluído";
            const isInProgress = step.execution?.status === "Em Execução";
            const isPending = !step.execution || step.execution.status === "Pendente";

            return (
              <Card
                key={step.id}
                className={cn(
                  "p-4 border-2 transition-all",
                  isCompleted && "bg-green-500/5 border-green-500/20",
                  isInProgress && "bg-blue-500/10 border-blue-500/30 shadow-lg",
                  isPending && "bg-slate-800 border-slate-700"
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Número e Ícone */}
                  <div className="flex-shrink-0">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold border-2",
                        isCompleted && "bg-green-500/20 border-green-500 text-green-400",
                        isInProgress && "bg-blue-500/20 border-blue-500 text-blue-400 animate-pulse",
                        isPending && "bg-slate-700 border-slate-600 text-slate-400"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">
                        {STEP_TYPE_ICONS[step.stepType as keyof typeof STEP_TYPE_ICONS]}
                      </span>
                      <h4 className="font-semibold text-white">{step.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {STEP_TYPE_LABELS[step.stepType as keyof typeof STEP_TYPE_LABELS]}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {step.baseTimeMinutes}min
                      </span>
                      
                      {step.execution?.durationMinutes > 0 && (
                        <span className="flex items-center gap-1 text-blue-400">
                          <Activity className="w-3 h-3" />
                          Real: {step.execution.durationMinutes}min
                        </span>
                      )}

                      {isInProgress && step.execution?.startTime && (
                        <span className="flex items-center gap-1 text-blue-400 font-semibold">
                          <PlayCircle className="w-3 h-3" />
                          {formatTime(getElapsedTime(step.execution.startTime))}
                        </span>
                      )}
                    </div>

                    {step.description && (
                      <p className="text-xs text-slate-500 mt-2">{step.description}</p>
                    )}

                    {/* Botão para registrar material */}
                    {(isInProgress || isCompleted) && (
                      <div className="mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 text-xs"
                          onClick={() => handleOpenMaterialDialog(step.id)}
                        >
                          <Plus className="w-3 h-3" />
                          Registrar Material
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex-shrink-0">
                    {isPending && (
                      <Button 
                        size="sm" 
                        className="gap-2"
                        onClick={() => handleStartStep(step.id)}
                        disabled={startStepMutation.isPending}
                      >
                        <PlayCircle className="w-4 h-4" />
                        Iniciar
                      </Button>
                    )}

                    {isInProgress && step.execution && (
                      <Button 
                        size="sm" 
                        variant="default" 
                        className="gap-2 bg-green-600 hover:bg-green-700"
                        onClick={() => handleCompleteStep(step.execution!.id)}
                        disabled={completeStepMutation.isPending}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Concluir
                      </Button>
                    )}

                    {isCompleted && (
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                        Concluído
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Botão Concluir Tarefa */}
        {completedSteps === totalSteps && totalSteps > 0 && (
          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-green-400 mb-1">
                  Todas as etapas concluídas!
                </h3>
                <p className="text-slate-300">
                  Clique no botão para finalizar esta tarefa.
                </p>
              </div>
              <Button size="lg" className="gap-2 bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="w-5 h-5" />
                Concluir Tarefa
              </Button>
            </div>
          </Card>
        )}

        {/* Dialog de Consumo de Material */}
        <Dialog open={materialDialogOpen} onOpenChange={setMaterialDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Consumo de Material</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="material">Material *</Label>
                <select
                  id="material"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm mt-1"
                  value={selectedMaterial?.id || ""}
                  onChange={(e) => {
                    const material = allMaterials.find((m: any) => m.id === parseInt(e.target.value));
                    setSelectedMaterial(material);
                  }}
                >
                  <option value="">Selecione um material</option>
                  {allMaterials.map((material: any) => (
                    <option key={material.id} value={material.id}>
                      {material.name} - {material.category} ({material.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="quantity">Quantidade Usada *</Label>
                <div className="flex gap-2 items-center mt-1">
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    min="0"
                    value={materialQuantity}
                    onChange={(e) => setMaterialQuantity(parseFloat(e.target.value) || 0)}
                    className="flex-1"
                  />
                  {selectedMaterial && (
                    <Badge variant="outline">{selectedMaterial.unit}</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Informe a quantidade real consumida nesta etapa
                </p>
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Ex: Material de boa qualidade, sem desperdício"
                  value={materialNotes}
                  onChange={(e) => setMaterialNotes(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>

              {selectedMaterial && selectedMaterial.quantityInStock !== undefined && (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-300">
                      Estoque atual: {selectedMaterial.quantityInStock} {selectedMaterial.unit}
                    </span>
                  </div>
                  {materialQuantity > selectedMaterial.quantityInStock && (
                    <p className="text-xs text-yellow-400 mt-1">
                      ⚠️ Quantidade maior que o estoque disponível
                    </p>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setMaterialDialogOpen(false);
                  setSelectedMaterial(null);
                  setMaterialQuantity(0);
                  setMaterialNotes("");
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRecordMaterial}
                disabled={!selectedMaterial || materialQuantity <= 0 || recordMaterialMutation.isPending}
              >
                {recordMaterialMutation.isPending ? "Registrando..." : "Registrar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
