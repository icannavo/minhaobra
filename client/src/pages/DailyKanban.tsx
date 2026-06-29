import React, { useState, useEffect } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  Package, 
  CheckCircle2, 
  Circle,
  Edit,
  Trash2,
  Plus,
  Calendar,
  TrendingUp,
  AlertCircle,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Slots de tempo (hora por hora)
const TIME_SLOTS = [
  { id: "07:00", label: "07:00", hour: 7 },
  { id: "08:00", label: "08:00", hour: 8 },
  { id: "09:00", label: "09:00", hour: 9 },
  { id: "10:00", label: "10:00", hour: 10 },
  { id: "11:00", label: "11:00", hour: 11 },
  { id: "12:00", label: "12:00 (Almoço)", hour: 12 },
  { id: "13:00", label: "13:00", hour: 13 },
  { id: "14:00", label: "14:00", hour: 14 },
  { id: "15:00", label: "15:00", hour: 15 },
  { id: "16:00", label: "16:00", hour: 16 },
  { id: "17:00", label: "17:00", hour: 17 },
];

interface Task {
  id: string;
  taskName: string;
  estimatedMinutes: number;
  status: string;
  equipments: any[];
  materials: any[];
  description?: string;
  slotId?: string;
}

interface TimeSlot {
  id: string;
  label: string;
  hour: number;
  tasks: Task[];
}

// Componente de Tarefa Arrastável
function DraggableTask({ task, isOverlay = false }: { task: Task; isOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: task,
  });

  const hours = Math.floor(task.estimatedMinutes / 60);
  const minutes = task.estimatedMinutes % 60;
  const timeStr = hours > 0 ? `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}` : `${minutes}min`;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "modern-card p-4 cursor-move transition-all",
        isDragging && !isOverlay && "opacity-30",
        isOverlay && "shadow-2xl scale-105 rotate-2"
      )}
    >
      <div className="flex items-start gap-3">
        <GripVertical className="w-5 h-5 text-slate-500 flex-shrink-0 mt-1" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-white text-sm leading-tight">
              {task.taskName}
            </h3>
            {task.status === "Concluído" ? (
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-slate-500 flex-shrink-0" />
            )}
          </div>

          {task.description && (
            <p className="text-xs text-slate-400 mb-2 line-clamp-2">{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20">
              <Clock className="w-3 h-3 mr-1" />
              {timeStr}
            </Badge>
            
            {task.equipments.length > 0 && (
              <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/20">
                <Package className="w-3 h-3 mr-1" />
                {task.equipments.length} equip.
              </Badge>
            )}
          </div>

          {/* Lista de equipamentos (resumida) */}
          {task.equipments.length > 0 && (
            <div className="text-xs text-slate-500 space-y-0.5">
              {task.equipments.slice(0, 2).map((eq: any, idx: number) => (
                <div key={idx}>• {eq.name || `Equip. ${eq.equipmentId}`}</div>
              ))}
              {task.equipments.length > 2 && (
                <div>• +{task.equipments.length - 2} mais...</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente de Slot de Tempo
function TimeSlotDroppable({ slot, tasks }: { slot: { id: string; label: string; hour: number }; tasks: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({
    id: slot.id,
    data: { slotId: slot.id },
  });

  const totalMinutes = tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const isOverloaded = totalMinutes > 60;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[120px] rounded-xl border-2 border-dashed transition-all p-3",
        isOver ? "border-primary bg-primary/5 scale-[1.02]" : "border-slate-700/50 bg-slate-800/30",
        isOverloaded && "border-red-500/50 bg-red-500/5"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">{slot.label}</h3>
        {totalMinutes > 0 && (
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs",
              isOverloaded ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-slate-700 text-slate-300"
            )}
          >
            {hours > 0 && `${hours}h `}{minutes}min
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-6 text-slate-600 text-xs">
            Arraste tarefas aqui
          </div>
        ) : (
          tasks.map((task) => (
            <DraggableTask key={task.id} task={task} />
          ))
        )}
      </div>

      {isOverloaded && (
        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Tempo excede 1 hora!</span>
        </div>
      )}
    </div>
  );
}

export default function DailyKanban() {
  const [selectedWorkId, setSelectedWorkId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  // Estado local das tarefas e seus slots
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(
    TIME_SLOTS.map(slot => ({ ...slot, tasks: [] }))
  );
  const [unscheduledTasks, setUnscheduledTasks] = useState<Task[]>([]);

  // Queries
  const { data: works = [] } = trpc.works.getAll.useQuery();
  const { data: detailedTasks = [], refetch: refetchTasks } = trpc.detailedTasks.getByWork.useQuery(
    { workId: selectedWorkId!, date: selectedDate },
    { enabled: !!selectedWorkId }
  );

  const updateTaskMutation = trpc.detailedTasks.update.useMutation({
    onSuccess: () => {
      toast.success("Tarefa atualizada!");
      refetchTasks();
    },
  });

  // Converter tarefas do backend para o formato local
  useEffect(() => {
    if (detailedTasks.length > 0) {
      const tasks: Task[] = detailedTasks.map((t: any) => ({
        id: t.id.toString(),
        taskName: t.taskName,
        estimatedMinutes: t.estimatedTotalMinutes || 0,
        status: t.status,
        equipments: [], // TODO: buscar equipamentos
        materials: [], // TODO: buscar materiais
        description: t.description,
        slotId: undefined, // Por padrão, não agendado
      }));

      setUnscheduledTasks(tasks);
    }
  }, [detailedTasks]);

  // Calcular progresso da obra
  const totalTasks = timeSlots.reduce((sum, slot) => sum + slot.tasks.length, 0) + unscheduledTasks.length;
  const completedTasks = [...timeSlots.flatMap(s => s.tasks), ...unscheduledTasks].filter(t => t.status === "Concluído").length;
  const workProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Calcular tempo total agendado
  const totalScheduledMinutes = timeSlots.reduce((sum, slot) => {
    return sum + slot.tasks.reduce((slotSum, task) => slotSum + task.estimatedMinutes, 0);
  }, 0);
  const totalScheduledHours = Math.floor(totalScheduledMinutes / 60);
  const totalScheduledMins = totalScheduledMinutes % 60;

  // Handlers de drag and drop
  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current as Task;
    setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const targetSlotId = over.id as string;

    // Encontrar a tarefa
    let task: Task | undefined;
    let sourceSlotId: string | undefined;

    // Procurar nos slots
    for (const slot of timeSlots) {
      const foundTask = slot.tasks.find(t => t.id === taskId);
      if (foundTask) {
        task = foundTask;
        sourceSlotId = slot.id;
        break;
      }
    }

    // Ou nas tarefas não agendadas
    if (!task) {
      task = unscheduledTasks.find(t => t.id === taskId);
    }

    if (!task) return;

    // Remover da origem
    if (sourceSlotId) {
      setTimeSlots(prev => prev.map(slot => 
        slot.id === sourceSlotId 
          ? { ...slot, tasks: slot.tasks.filter(t => t.id !== taskId) }
          : slot
      ));
    } else {
      setUnscheduledTasks(prev => prev.filter(t => t.id !== taskId));
    }

    // Adicionar ao destino
    if (targetSlotId === 'unscheduled') {
      setUnscheduledTasks(prev => [...prev, { ...task!, slotId: undefined }]);
    } else {
      setTimeSlots(prev => prev.map(slot => 
        slot.id === targetSlotId 
          ? { ...slot, tasks: [...slot.tasks, { ...task!, slotId: targetSlotId }] }
          : slot
      ));
    }
  };

  const handleMarkComplete = (taskId: string) => {
    // Atualizar localmente
    const updateTaskStatus = (tasks: Task[]) => 
      tasks.map(t => t.id === taskId ? { ...t, status: "Concluído" } : t);

    setTimeSlots(prev => prev.map(slot => ({
      ...slot,
      tasks: updateTaskStatus(slot.tasks)
    })));
    setUnscheduledTasks(prev => updateTaskStatus(prev));

    // Atualizar no backend
    updateTaskMutation.mutate({
      id: Number(taskId),
      status: "Concluído",
    });
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="section-title mb-2">Planejamento Diário - Kanban</h1>
            <p className="section-subtitle">Arraste as tarefas para organizar o dia de trabalho</p>
          </motion.div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="modern-card p-4">
              <label className="text-sm text-slate-400 mb-2 block">Obra</label>
              <Select
                value={selectedWorkId?.toString()}
                onValueChange={(value) => setSelectedWorkId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a obra" />
                </SelectTrigger>
                <SelectContent>
                  {works.map((work: any) => (
                    <SelectItem key={work.id} value={work.id.toString()}>
                      {work.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="modern-card p-4">
              <label className="text-sm text-slate-400 mb-2 block">Data</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
              />
            </div>

            <div className="modern-card p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <label className="text-sm text-slate-400 mb-2 block">Progresso da Obra</label>
              <div className="flex items-center gap-3">
                <Progress value={workProgress} className="flex-1" />
                <span className="text-lg font-bold text-primary">{workProgress.toFixed(0)}%</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {completedTasks} de {totalTasks} tarefas concluídas
              </p>
            </div>
          </div>

          {!selectedWorkId ? (
            <div className="modern-card p-12 text-center">
              <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Selecione uma obra para começar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* COLUNA 1: Tarefas Não Agendadas */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">
                    Tarefas Disponíveis
                  </h2>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nova
                  </Button>
                </div>

                <div
                  className="modern-card p-4 min-h-[600px] max-h-[800px] overflow-y-auto"
                >
                  <div className="space-y-3">
                    {unscheduledTasks.length === 0 ? (
                      <div className="text-center py-12 text-slate-600">
                        <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhuma tarefa disponível</p>
                      </div>
                    ) : (
                      unscheduledTasks.map((task) => (
                        <DraggableTask key={task.id} task={task} />
                      ))
                    )}
                  </div>
                </div>

                {/* Resumo */}
                <div className="modern-card p-4 bg-slate-800/50">
                  <h3 className="text-sm font-bold text-white mb-3">Resumo do Dia</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Tempo agendado:</span>
                      <span className="font-semibold text-primary">
                        {totalScheduledHours}h {totalScheduledMins}min
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Tarefas agendadas:</span>
                      <span className="font-semibold text-white">
                        {timeSlots.reduce((sum, slot) => sum + slot.tasks.length, 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Não agendadas:</span>
                      <span className="font-semibold text-slate-400">
                        {unscheduledTasks.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUNAS 2-4: Slots de Tempo */}
              <div className="lg:col-span-3">
                <h2 className="text-lg font-bold text-white mb-4">
                  Cronograma do Dia
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {timeSlots.map((slot) => (
                    <TimeSlotDroppable key={slot.id} slot={slot} tasks={slot.tasks} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask && <DraggableTask task={activeTask} isOverlay />}
      </DragOverlay>
    </DndContext>
  );
}
