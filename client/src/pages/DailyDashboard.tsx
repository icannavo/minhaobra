import React, { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import {
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  AlertTriangle,
  GripVertical,
  Package,
  Wrench,
  Calendar as CalendarIcon,
  BarChart3,
  Edit2,
  Trash2,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Slots de tempo (7h às 18h)
const TIME_SLOTS = Array.from({ length: 12 }, (_, i) => {
  const hour = i + 7;
  return {
    id: `${hour}:00`,
    label: `${hour.toString().padStart(2, "0")}:00`,
    hour,
    isLunch: hour === 12,
  };
});

interface Task {
  id: string;
  taskName: string;
  description?: string;
  area: number;
  estimatedMinutes: number;
  employees: number;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high" | "critical";
  slotId?: string;
  equipments: Array<{ id: number; name: string; quantity: number }>;
  materials: Array<{ id: number; name: string; quantity: number; unit: string }>;
  teamMembers: Array<{ id: number; name: string; role: string }>;
}

// Componente de Tarefa Arrastável
function DraggableTaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: task,
  });

  const hours = Math.floor(task.estimatedMinutes / 60);
  const minutes = task.estimatedMinutes % 60;

  const priorityColors = {
    low: "bg-slate-500",
    medium: "bg-blue-500",
    high: "bg-orange-500",
    critical: "bg-red-500",
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-slate-800 border border-slate-700 rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:border-primary/50",
        isDragging && "opacity-30 scale-95"
      )}
    >
      <div className="flex items-start gap-2 mb-2">
        <GripVertical className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-sm text-white leading-tight truncate">
              {task.taskName}
            </h4>
            <div
              className={cn("w-2 h-2 rounded-full flex-shrink-0 mt-1", priorityColors[task.priority])}
            />
          </div>

          {task.description && (
            <p className="text-xs text-slate-400 line-clamp-1 mb-2">{task.description}</p>
          )}

          <div className="flex flex-wrap gap-1.5 mb-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {hours}h{minutes > 0 && ` ${minutes}m`}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              {task.employees}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {task.area}m²
            </Badge>
          </div>

          {/* Equipe */}
          {task.teamMembers.length > 0 && (
            <div className="flex -space-x-2 mb-2">
              {task.teamMembers.slice(0, 3).map((member) => (
                <Avatar key={member.id} className="w-6 h-6 border-2 border-slate-800">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {member.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {task.teamMembers.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-xs text-slate-400">
                  +{task.teamMembers.length - 3}
                </div>
              )}
            </div>
          )}

          {/* Status */}
          {task.status === "completed" && (
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Concluído
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente de Slot de Tempo
function TimeSlot({ slot, tasks }: { slot: typeof TIME_SLOTS[0]; tasks: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({
    id: slot.id,
  });

  const totalMinutes = tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const isOverloaded = totalMinutes > 60;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[100px] rounded-lg border-2 border-dashed p-2 transition-all",
        isOver ? "border-primary bg-primary/5 scale-[1.02]" : "border-slate-700/50 bg-slate-900/50",
        isOverloaded && "border-red-500/50 bg-red-500/5",
        slot.isLunch && "bg-amber-500/5 border-amber-500/20"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-400">{slot.label}</span>
        {totalMinutes > 0 && (
          <Badge
            variant="outline"
            className={cn("text-xs", isOverloaded && "bg-red-500/10 text-red-400 border-red-500/20")}
          >
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-4 text-slate-600 text-xs">
            {slot.isLunch ? "Intervalo" : "Arraste tarefas"}
          </div>
        ) : (
          tasks.map((task) => <DraggableTaskCard key={task.id} task={task} />)
        )}
      </div>

      {isOverloaded && (
        <div className="mt-2 p-1.5 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Excede 1 hora!
        </div>
      )}
    </div>
  );
}

export default function DailyDashboard() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(format(today, "yyyy-MM-dd"));
  const [selectedWorkId, setSelectedWorkId] = useState<number | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState("visao-geral");

  // Buscar lista de projetos/obras
  const { data: works } = trpc.works.getAll.useQuery();

  // Buscar cronograma diário da obra selecionada
  const {
    data: dailySchedule,
    isLoading: isLoadingSchedule,
    refetch: refetchSchedule,
  } = trpc.dailySchedules.getByDate.useQuery(
    {
      workId: selectedWorkId!,
      date: selectedDate,
    },
    {
      enabled: selectedWorkId !== null,
    }
  );

  // Buscar tarefas agendadas (Kanban)
  const {
    data: scheduledTasks,
    isLoading: isLoadingTasks,
    refetch: refetchTasks,
  } = trpc.scheduledTasks.getByDay.useQuery(
    {
      dailyScheduleId: dailySchedule?.id!,
    },
    {
      enabled: dailySchedule?.id !== undefined,
    }
  );

  // Buscar tarefas detalhadas disponíveis (backlog)
  const { data: availableTasks } = trpc.detailedTasks.getByWork.useQuery(
    {
      workId: selectedWorkId!,
      date: selectedDate,
    },
    {
      enabled: selectedWorkId !== null,
    }
  );

  // Mutations
  const createScheduledTask = trpc.scheduledTasks.create.useMutation({
    onSuccess: () => {
      refetchTasks();
      toast.success("Tarefa agendada com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao agendar tarefa: ${error.message}`);
    },
  });

  const updateScheduledTask = trpc.scheduledTasks.update.useMutation({
    onSuccess: () => {
      refetchTasks();
      toast.success("Tarefa atualizada!");
    },
  });

  const deleteScheduledTask = trpc.scheduledTasks.delete.useMutation({
    onSuccess: () => {
      refetchTasks();
      toast.success("Tarefa removida do cronograma");
    },
  });

  const createDailySchedule = trpc.dailySchedules.create.useMutation({
    onSuccess: () => {
      refetchSchedule();
    },
  });

  // Criar cronograma automaticamente se não existir
  useEffect(() => {
    if (selectedWorkId && !dailySchedule && !isLoadingSchedule) {
      console.log("=== Criando cronograma diário automaticamente");
      createDailySchedule.mutate({
        workId: selectedWorkId,
        date: selectedDate,
      });
    }
  }, [selectedWorkId, selectedDate, dailySchedule, isLoadingSchedule]);

  // Converter tarefas agendadas para o formato do Kanban
  const timeSlotTasks: Record<string, Task[]> = useMemo(() => {
    if (!scheduledTasks) return {};

    const grouped: Record<string, Task[]> = {};

    scheduledTasks.forEach((st: any) => {
      const task = st.detailedTask;
      if (!task) return;

      // Extrair hora do scheduledStartTime (formato "HH:MM")
      const slotId = st.scheduledStartTime.substring(0, 5); // "08:00"

      if (!grouped[slotId]) {
        grouped[slotId] = [];
      }

      grouped[slotId].push({
        id: st.id.toString(),
        taskName: task.taskName,
        description: task.description,
        area: task.area || 0,
        estimatedMinutes: task.estimatedTotalMinutes || 0,
        employees: task.numberOfEmployees || 0,
        status: st.status === "Concluído" ? "completed" : st.status === "Em Execução" ? "in-progress" : "pending",
        priority: task.priority || "medium",
        slotId,
        equipments: [],
        materials: [],
        teamMembers: [],
      });
    });

    return grouped;
  }, [scheduledTasks]);

  // Tarefas do backlog (não agendadas)
  const backlogTasks: Task[] = useMemo(() => {
    if (!availableTasks) return [];

    const scheduledTaskIds = new Set(scheduledTasks?.map((st: any) => st.detailedTaskId) || []);

    return availableTasks
      .filter((task: any) => !scheduledTaskIds.has(task.id))
      .map((task: any) => ({
        id: `new-${task.id}`,
        taskName: task.taskName,
        description: task.description,
        area: task.area || 0,
        estimatedMinutes: task.estimatedTotalMinutes || 0,
        employees: task.numberOfEmployees || 0,
        status: "pending" as const,
        priority: (task.priority || "medium") as "low" | "medium" | "high" | "critical",
        equipments: [],
        materials: [],
        teamMembers: [],
      }));
  }, [availableTasks, scheduledTasks]);

  // Debug: log quando selectedWorkId muda
  useEffect(() => {
    console.log("=== selectedWorkId mudou para:", selectedWorkId);
    console.log("=== works disponíveis:", works);
  }, [selectedWorkId, works]);

  // Sensors para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTask(event.active.data.current as Task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const targetSlotId = over.id as string;

    console.log("=== Drag End ===");
    console.log("Task ID:", taskId);
    console.log("Target Slot:", targetSlotId);

    // Se está movendo do backlog para um slot
    if (taskId.startsWith("new-")) {
      const detailedTaskId = Number(taskId.replace("new-", ""));
      console.log(">>> Agendando nova tarefa, detailedTaskId:", detailedTaskId);

      if (targetSlotId !== "backlog" && dailySchedule) {
        createScheduledTask.mutate({
          dailyScheduleId: dailySchedule.id,
          detailedTaskId,
          scheduledStartTime: targetSlotId,
          slotOrder: 0,
        });
      }
    } else {
      // Está movendo uma tarefa já agendada
      const scheduledTaskId = Number(taskId);
      console.log(">>> Movendo tarefa agendada, scheduledTaskId:", scheduledTaskId);

      if (targetSlotId === "backlog") {
        // Remover do cronograma
        deleteScheduledTask.mutate({ id: scheduledTaskId });
      } else {
        // Atualizar horário
        updateScheduledTask.mutate({
          id: scheduledTaskId,
          scheduledStartTime: targetSlotId,
        });
      }
    }
  };

  // Estatísticas
  const allScheduledTasks = Object.values(timeSlotTasks).flat();
  const totalTasks = backlogTasks.length + allScheduledTasks.length;
  const completedTasks = allScheduledTasks.filter((t) => t.status === "completed").length;
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const totalScheduledMinutes = allScheduledTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);

  const selectedWork = works?.find((w) => w.id === selectedWorkId);

  // Log para debug
  useEffect(() => {
    console.log("=== Estado atual ===");
    console.log("Obra selecionada:", selectedWorkId);
    console.log("Cronograma diário:", dailySchedule);
    console.log("Tarefas agendadas:", scheduledTasks);
    console.log("Tarefas disponíveis:", availableTasks);
    console.log("Backlog (não agendadas):", backlogTasks);
  }, [selectedWorkId, dailySchedule, scheduledTasks, availableTasks, backlogTasks]);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white">Hoje</h1>
                <p className="text-slate-400 mt-1">
                  {format(new Date(selectedDate), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </p>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
          </div>

          {/* Seletor de Projeto */}
          <Card className="p-4 bg-slate-800 border-slate-700 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-xs text-slate-400 mb-2 block">Projeto/Obra</label>
                <Select
                  value={selectedWorkId !== null ? selectedWorkId.toString() : undefined}
                  onValueChange={(value) => {
                    console.log(">>> Select onValueChange chamado!");
                    console.log(">>> Valor recebido:", value, "Tipo:", typeof value);
                    console.log(">>> selectedWorkId ANTES:", selectedWorkId);
                    
                    if (value === "none") {
                      console.log(">>> Limpando seleção");
                      setSelectedWorkId(null);
                    } else {
                      const newWorkId = Number(value);
                      console.log(">>> Novo ID:", newWorkId);
                      setSelectedWorkId(newWorkId);
                    }
                  }}
                >
                  <SelectTrigger className="w-full bg-slate-700 border-slate-600">
                    <SelectValue placeholder="-- Escolha um projeto --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Escolha um projeto --</SelectItem>
                    {works?.map((work) => (
                      <SelectItem key={work.id} value={work.id.toString()}>
                        {work.code} - {work.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedWork && (
                <div className="flex-1">
                  <label className="text-xs text-slate-400 mb-2 block">Local</label>
                  <p className="text-sm text-white bg-slate-700/50 px-4 py-2 rounded-lg">
                    {selectedWork.location || "Não especificado"}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {!selectedWorkId ? (
            <Card className="p-12 bg-slate-800 border-slate-700 text-center">
              <CalendarIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Selecione um projeto para visualizar as tarefas</p>
            </Card>
          ) : isLoadingSchedule || isLoadingTasks ? (
            <Card className="p-12 bg-slate-800 border-slate-700 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-slate-400">Carregando cronograma...</p>
            </Card>
          ) : (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                  <p className="text-xs text-slate-400 mb-1">Total de Tarefas</p>
                  <p className="text-3xl font-bold text-blue-400">{totalTasks}</p>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                  <p className="text-xs text-slate-400 mb-1">Concluídas</p>
                  <p className="text-3xl font-bold text-green-400">{completedTasks}</p>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                  <p className="text-xs text-slate-400 mb-1">Progresso</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold text-purple-400">{progressPercent.toFixed(0)}%</p>
                    <Progress value={progressPercent} className="flex-1 h-2" />
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
                  <p className="text-xs text-slate-400 mb-1">Tempo Agendado</p>
                  <p className="text-3xl font-bold text-orange-400">
                    {Math.floor(totalScheduledMinutes / 60)}h
                  </p>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-slate-800 border border-slate-700">
                  <TabsTrigger value="visao-geral" className="gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Visão Geral
                  </TabsTrigger>
                  <TabsTrigger value="equipe" className="gap-2">
                    <Users className="w-4 h-4" />
                    Equipe
                  </TabsTrigger>
                  <TabsTrigger value="materiais" className="gap-2">
                    <Package className="w-4 h-4" />
                    Materiais
                  </TabsTrigger>
                </TabsList>

                {/* Visão Geral - Kanban */}
                <TabsContent value="visao-geral" className="space-y-0">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Backlog */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">Backlog</h3>
                        <Badge variant="secondary">{backlogTasks.length}</Badge>
                      </div>

                      <ScrollArea className="h-[calc(100vh-450px)]">
                        <div className="space-y-2 pr-4">
                          {backlogTasks.map((task) => (
                            <DraggableTaskCard key={task.id} task={task} />
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Timeline */}
                    <div className="lg:col-span-3">
                      <h3 className="text-sm font-semibold text-white mb-3">Cronograma do Dia</h3>
                      <ScrollArea className="h-[calc(100vh-450px)]">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                          {TIME_SLOTS.map((slot) => (
                            <TimeSlot key={slot.id} slot={slot} tasks={timeSlotTasks[slot.id] || []} />
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </TabsContent>

                {/* Equipe */}
                <TabsContent value="equipe">
                  <Card className="p-6 bg-slate-800 border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Equipe Alocada</h3>
                    <div className="space-y-3">
                      {[...backlogTasks, ...allScheduledTasks]
                        .flatMap((t) => t.teamMembers)
                        .filter((m, i, arr) => arr.findIndex((mm) => mm.id === m.id) === i)
                        .map((member) => {
                          const memberTasks = [...backlogTasks, ...allScheduledTasks].filter((t) =>
                            t.teamMembers.some((tm) => tm.id === member.id)
                          );

                          return (
                            <div key={member.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarFallback className="bg-primary text-primary-foreground">
                                    {member.name.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-white">{member.name}</p>
                                  <p className="text-xs text-slate-400">{member.role}</p>
                                </div>
                              </div>
                              <Badge variant="outline">{memberTasks.length} tarefas</Badge>
                            </div>
                          );
                        })}
                    </div>
                  </Card>
                </TabsContent>

                {/* Materiais */}
                <TabsContent value="materiais">
                  <Card className="p-6 bg-slate-800 border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Materiais Necessários</h3>
                    <div className="space-y-3">
                      {[...backlogTasks, ...allScheduledTasks]
                        .flatMap((t) => t.materials)
                        .reduce((acc, mat) => {
                          const existing = acc.find((m) => m.id === mat.id);
                          if (existing) {
                            existing.quantity += mat.quantity;
                          } else {
                            acc.push({ ...mat });
                          }
                          return acc;
                        }, [] as typeof backlogTasks[0]["materials"])
                        .map((material) => (
                          <div key={material.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <Package className="w-5 h-5 text-green-400" />
                              </div>
                              <div>
                                <p className="font-semibold text-white">{material.name}</p>
                                <p className="text-xs text-slate-400">Necessário para o dia</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                              {material.quantity} {material.unit}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask && (
          <div className="opacity-90 rotate-2 scale-105">
            <DraggableTaskCard task={activeTask} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
