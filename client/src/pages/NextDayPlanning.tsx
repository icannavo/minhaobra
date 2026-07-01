import React, { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Plus,
  Users,
  TrendingUp,
  Clock,
  GripVertical,
  Package,
  Wrench,
  Calendar as CalendarIcon,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
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
  status: "pending" | "planned";
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
            <div className="flex -space-x-2">
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
    </div>
  );
}

export default function NextDayPlanning() {
  const tomorrow = addDays(new Date(), 1);
  const [selectedWorkId, setSelectedWorkId] = useState<number | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Mock data
  const [backlogTasks, setBacklogTasks] = useState<Task[]>([
    {
      id: "1",
      taskName: "Aplicação de Textura",
      description: "Textura acrílica na fachada leste",
      area: 80,
      estimatedMinutes: 300,
      employees: 2,
      status: "pending",
      priority: "high",
      equipments: [{ id: 1, name: "Rolo Textura", quantity: 2 }],
      materials: [{ id: 1, name: "Textura Acrílica", quantity: 15, unit: "kg" }],
      teamMembers: [
        { id: 1, name: "André", role: "Pintor" },
        { id: 2, name: "Daia", role: "Ajudante" },
      ],
    },
    {
      id: "2",
      taskName: "Pintura Fachada Sul",
      description: "Segunda demão de pintura",
      area: 100,
      estimatedMinutes: 420,
      employees: 3,
      status: "pending",
      priority: "medium",
      equipments: [{ id: 2, name: "Andaime", quantity: 1 }],
      materials: [{ id: 2, name: "Tinta Acrílica", quantity: 25, unit: "L" }],
      teamMembers: [
        { id: 3, name: "Elton", role: "Pintor" },
        { id: 4, name: "Gabriela", role: "Pintora" },
        { id: 5, name: "Graziela", role: "Ajudante" },
      ],
    },
    {
      id: "3",
      taskName: "Impermeabilização de Janelas",
      area: 20,
      estimatedMinutes: 180,
      employees: 1,
      status: "pending",
      priority: "critical",
      equipments: [{ id: 3, name: "Pistola Aplicadora", quantity: 1 }],
      materials: [{ id: 3, name: "Silicone", quantity: 5, unit: "tubo" }],
      teamMembers: [{ id: 6, name: "Guilherme", role: "Especialista" }],
    },
  ]);

  const [timeSlotTasks, setTimeSlotTasks] = useState<Record<string, Task[]>>({});

  // Buscar lista de projetos/obras
  const { data: works } = trpc.works.getAll.useQuery();

  // Buscar histórico para produtividade
  const { data: productivityHistory } = trpc.productivity.getHistory.useQuery(
    { workId: selectedWorkId! },
    { enabled: !!selectedWorkId }
  );

  // Sensors
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

    // Encontrar tarefa
    let task = backlogTasks.find((t) => t.id === taskId);
    let sourceSlotId: string | undefined;

    if (!task) {
      for (const [slotId, tasks] of Object.entries(timeSlotTasks)) {
        const found = tasks.find((t) => t.id === taskId);
        if (found) {
          task = found;
          sourceSlotId = slotId;
          break;
        }
      }
    }

    if (!task) return;

    // Remover da origem
    if (sourceSlotId) {
      setTimeSlotTasks((prev) => ({
        ...prev,
        [sourceSlotId]: prev[sourceSlotId].filter((t) => t.id !== taskId),
      }));
    } else {
      setBacklogTasks((prev) => prev.filter((t) => t.id !== taskId));
    }

    // Adicionar ao destino
    if (targetSlotId === "backlog") {
      setBacklogTasks((prev) => [...prev, { ...task!, slotId: undefined, status: "pending" }]);
    } else {
      setTimeSlotTasks((prev) => ({
        ...prev,
        [targetSlotId]: [...(prev[targetSlotId] || []), { ...task!, slotId: targetSlotId, status: "planned" }],
      }));
      toast.success(`Tarefa planejada para ${targetSlotId}`);
    }
  };

  // Estatísticas
  const allScheduledTasks = Object.values(timeSlotTasks).flat();
  const totalScheduledMinutes = allScheduledTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const avgProductivity = productivityHistory
    ? productivityHistory.reduce((sum: number, h: any) => sum + Number(h.productivity || 0), 0) /
      productivityHistory.length
    : 20;

  const selectedWork = works?.find((w) => w.id === selectedWorkId);

  // Confirmar planejamento
  const handleConfirmPlanning = () => {
    if (allScheduledTasks.length === 0) {
      toast.error("Adicione pelo menos uma tarefa ao cronograma");
      return;
    }

    // TODO: Salvar no backend
    toast.success(`${allScheduledTasks.length} tarefas planejadas para amanhã!`);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <CalendarIcon className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-white">Próximo Dia</h1>
                <p className="text-slate-400 mt-1">
                  {format(tomorrow, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>

          {/* Seletor de Projeto */}
          <Card className="p-4 bg-slate-800 border-slate-700 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-2 block">Projeto/Obra</label>
                <select
                  value={selectedWorkId || ""}
                  onChange={(e) => setSelectedWorkId(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                >
                  <option value="">-- Escolha um projeto --</option>
                  {works?.map((work) => (
                    <option key={work.id} value={work.id}>
                      {work.code} - {work.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Produtividade Média</p>
                  <p className="text-xl font-bold text-blue-400">{avgProductivity.toFixed(1)} m²/p</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Tempo Planejado</p>
                  <p className="text-xl font-bold text-purple-400">
                    {Math.floor(totalScheduledMinutes / 60)}h{" "}
                    {totalScheduledMinutes % 60 > 0 && `${totalScheduledMinutes % 60}m`}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {!selectedWorkId ? (
            <Card className="p-12 bg-slate-800 border-slate-700 text-center">
              <CalendarIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Selecione um projeto para planejar o próximo dia</p>
            </Card>
          ) : (
            <>
              {/* Status Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4 bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                      <Package className="w-5 h-5 text-slate-300" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Backlog</p>
                      <p className="text-2xl font-bold text-white">{backlogTasks.length}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Planejadas</p>
                      <p className="text-2xl font-bold text-blue-400">{allScheduledTasks.length}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                  <Button
                    onClick={handleConfirmPlanning}
                    className="w-full h-full bg-green-600 hover:bg-green-700"
                    disabled={allScheduledTasks.length === 0}
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Confirmar Planejamento
                  </Button>
                </Card>
              </div>

              {/* Kanban */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Backlog */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Tarefas Disponíveis</h3>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Plus className="w-3 h-3" />
                      Nova
                    </Button>
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
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white">Cronograma Planejado</h3>
                    <Badge variant="outline" className="gap-1">
                      {allScheduledTasks.length} tarefas agendadas
                    </Badge>
                  </div>

                  <ScrollArea className="h-[calc(100vh-450px)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {TIME_SLOTS.map((slot) => (
                        <TimeSlot key={slot.id} slot={slot} tasks={timeSlotTasks[slot.id] || []} />
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
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
