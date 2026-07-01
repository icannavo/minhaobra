import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Users, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProjectTask {
  id: number;
  code: string;
  name: string;
  description?: string;
  area: number;
  estimatedDurationMinutes: number;
  estimatedEmployees: number;
  priority: "low" | "medium" | "high" | "critical";
  kanbanStatus: string;
  scheduledDate?: string;
  scheduledStartTime?: string;
  status: string;
  progressPercent: number;
  totalSubtasks: number;
  completedSubtasks: number;
  phaseName?: string;
}

interface DayTimelineViewProps {
  tasks: ProjectTask[];
  date: Date;
  onTaskSchedule: (taskId: number, date: string, startTime: string) => void;
}

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
  tasks: ProjectTask[];
}

const priorityColors = {
  low: "bg-slate-500",
  medium: "bg-blue-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
};

function TimeSlotRow({ slot, date }: { slot: TimeSlot; date: Date }) {
  const dateString = format(date, "yyyy-MM-dd");
  const slotId = `${dateString}-${slot.time}`;

  const { setNodeRef, isOver } = useDroppable({
    id: slotId,
  });

  const isBreakTime = slot.hour === 12; // Horário de almoço

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex border-b min-h-20 transition-all",
        isOver && "bg-primary/5 border-primary",
        isBreakTime && "bg-amber-50/50"
      )}
    >
      {/* Time Label */}
      <div className="w-20 flex-shrink-0 p-3 border-r bg-muted/30">
        <p className="text-sm font-medium">{slot.time}</p>
        {isBreakTime && (
          <Badge variant="secondary" className="text-xs mt-1">
            Almoço
          </Badge>
        )}
      </div>

      {/* Task Area */}
      <div className="flex-1 p-2">
        {slot.tasks.length === 0 ? (
          <div
            className={cn(
              "h-full flex items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground text-sm",
              isBreakTime && "opacity-50"
            )}
          >
            {isBreakTime ? "Intervalo" : "Arraste uma tarefa aqui"}
          </div>
        ) : (
          <div className="space-y-2">
            {slot.tasks.map((task) => (
              <Card
                key={task.id}
                className={cn(
                  "border-l-4 hover:shadow-md transition-shadow cursor-pointer",
                  `border-l-${priorityColors[task.priority]}`
                )}
                style={{
                  borderLeftColor:
                    task.priority === "low"
                      ? "#64748b"
                      : task.priority === "medium"
                      ? "#3b82f6"
                      : task.priority === "high"
                      ? "#f59e0b"
                      : "#ef4444",
                }}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground font-mono mb-1">
                        {task.code}
                      </p>
                      <h4 className="font-semibold text-sm mb-2">{task.name}</h4>

                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.floor(task.estimatedDurationMinutes / 60)}h
                          {task.estimatedDurationMinutes % 60 > 0 &&
                            ` ${task.estimatedDurationMinutes % 60}m`}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {task.estimatedEmployees}
                        </div>
                        <div className="flex items-center gap-1">
                          <span>📐</span>
                          {task.area.toFixed(0)} m²
                        </div>
                      </div>

                      {task.phaseName && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {task.phaseName}
                        </Badge>
                      )}
                    </div>

                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0",
                        task.priority === "critical" &&
                          "bg-red-100 text-red-700 border-red-300"
                      )}
                    >
                      {task.priority === "low"
                        ? "Baixa"
                        : task.priority === "medium"
                        ? "Média"
                        : task.priority === "high"
                        ? "Alta"
                        : "Crítica"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DayTimelineView({
  tasks,
  date,
  onTaskSchedule,
}: DayTimelineViewProps) {
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(date);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Gerar slots de tempo (7h às 18h)
  const timeSlots = useMemo(() => {
    const slots: TimeSlot[] = [];
    for (let hour = 7; hour <= 18; hour++) {
      const time = `${hour.toString().padStart(2, "0")}:00`;
      const tasksInSlot = tasks.filter(
        (task) => task.scheduledStartTime === time
      );

      slots.push({
        time,
        hour,
        minute: 0,
        tasks: tasksInSlot,
      });
    }
    return slots;
  }, [tasks]);

  const unscheduledTasks = useMemo(
    () =>
      tasks.filter(
        (task) => !task.scheduledStartTime || task.kanbanStatus === "backlog"
      ),
    [tasks]
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(Number(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTaskId(null);

    if (!over) return;

    const taskId = Number(active.id);
    const slotId = String(over.id);

    // Extrair data e hora do slotId
    const [dateStr, timeStr] = slotId.split("-");
    onTaskSchedule(taskId, dateStr, timeStr);
  };

  const totalScheduledMinutes = useMemo(
    () =>
      tasks
        .filter((t) => t.scheduledStartTime)
        .reduce((sum, task) => sum + task.estimatedDurationMinutes, 0),
    [tasks]
  );

  const goToPreviousDay = () => {
    setSelectedDate((prev) => subDays(prev, 1));
  };

  const goToNextDay = () => {
    setSelectedDate((prev) => addDays(prev, 1));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-4 px-4">
        {/* Timeline */}
        <div className="flex-1 flex flex-col">
          {/* Day Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousDay}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Hoje
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextDay}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">
                  {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {Math.floor(totalScheduledMinutes / 60)}h{" "}
                  {totalScheduledMinutes % 60}m de trabalho agendado
                </p>
              </div>
            </div>

            <Badge variant="outline" className="gap-1">
              <Calendar className="w-3 h-3" />
              {tasks.length} tarefas
            </Badge>
          </div>

          {/* Timeline Grid */}
          <Card className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div>
                {timeSlots.map((slot) => (
                  <TimeSlotRow key={slot.time} slot={slot} date={selectedDate} />
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* Unscheduled Tasks Sidebar */}
        <Card className="w-80 flex-shrink-0">
          <CardHeader>
            <CardTitle className="text-base">Tarefas não agendadas</CardTitle>
            <p className="text-sm text-muted-foreground">
              Arraste para o cronograma
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="space-y-2 p-4">
                {unscheduledTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Todas as tarefas estão agendadas
                  </div>
                ) : (
                  unscheduledTasks.map((task) => (
                    <Card
                      key={task.id}
                      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                      draggable
                    >
                      <CardContent className="p-3">
                        <p className="text-xs text-muted-foreground font-mono mb-1">
                          {task.code}
                        </p>
                        <h4 className="font-semibold text-sm mb-2">
                          {task.name}
                        </h4>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {Math.floor(task.estimatedDurationMinutes / 60)}h
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {task.estimatedEmployees}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <DragOverlay>
        {activeTaskId ? (
          <Card className="w-80 opacity-90">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground font-mono">
                Arrastando tarefa...
              </p>
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
