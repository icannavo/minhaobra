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
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import KanbanTaskCard from "./KanbanTaskCard";

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

interface WeekCalendarViewProps {
  tasks: ProjectTask[];
  onTaskSchedule: (taskId: number, date: string, startTime: string) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

interface DaySlot {
  date: Date;
  dateString: string;
  tasks: ProjectTask[];
}

function DroppableDay({ date, tasks, onTaskDrop }: { date: Date; tasks: ProjectTask[]; onTaskDrop: (date: string) => void }) {
  const dateString = format(date, "yyyy-MM-dd");
  const { setNodeRef, isOver } = useDroppable({
    id: dateString,
  });

  const totalMinutes = useMemo(
    () => tasks.reduce((sum, task) => sum + task.estimatedDurationMinutes, 0),
    [tasks]
  );

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h${mins > 0 ? ` ${mins}m` : ""}`;
    return `${mins}m`;
  };

  const isToday = isSameDay(date, new Date());
  const isPast = date < new Date() && !isToday;

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        "flex-1 min-w-0 transition-all",
        isOver && "ring-2 ring-primary ring-offset-2",
        isToday && "border-primary border-2",
        isPast && "opacity-60"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase">
              {format(date, "EEE", { locale: ptBR })}
            </p>
            <p className={cn("text-lg font-bold", isToday && "text-primary")}>
              {format(date, "dd")}
            </p>
          </div>
          <div className="text-right">
            <Badge variant="secondary" className="mb-1">
              {tasks.length}
            </Badge>
            {totalMinutes > 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(totalMinutes)}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-400px)]">
          <div className="space-y-2 p-4">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                {isPast ? "Dia passado" : "Arraste tarefas aqui"}
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="relative">
                  <KanbanTaskCard task={task} />
                  {task.scheduledStartTime && (
                    <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium border">
                      {task.scheduledStartTime}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default function WeekCalendarView({
  tasks,
  onTaskSchedule,
  selectedDate,
  onDateChange,
}: WeekCalendarViewProps) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(selectedDate, { weekStartsOn: 0 }));
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const weekDays = useMemo(() => {
    const days: DaySlot[] = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const dateString = format(date, "yyyy-MM-dd");
      const dayTasks = tasks.filter((task) => task.scheduledDate === dateString);
      days.push({ date, dateString, tasks: dayTasks });
    }
    return days;
  }, [weekStart, tasks]);

  const backlogTasks = useMemo(
    () => tasks.filter((task) => task.kanbanStatus === "backlog"),
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
    const dateString = String(over.id);

    // Adicionar horário padrão 08:00
    onTaskSchedule(taskId, dateString, "08:00");
  };

  const activeTask = useMemo(() => {
    if (!activeTaskId) return null;
    return tasks.find((t) => t.id === activeTaskId) || null;
  }, [activeTaskId, tasks]);

  const goToPreviousWeek = () => {
    setWeekStart((prev) => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setWeekStart((prev) => addDays(prev, 7));
  };

  const goToToday = () => {
    const today = new Date();
    setWeekStart(startOfWeek(today, { weekStartsOn: 0 }));
    onDateChange(today);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full px-4">
        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoje
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">
                {format(weekStart, "MMMM yyyy", { locale: ptBR })}
              </h3>
              <p className="text-sm text-muted-foreground">
                Semana de {format(weekStart, "dd/MM")} a {format(addDays(weekStart, 6), "dd/MM")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Calendar className="w-3 h-3" />
              {backlogTasks.length} tarefas no backlog
            </Badge>
          </div>
        </div>

        {/* Week Grid */}
        <div className="flex gap-3 flex-1 overflow-hidden">
          {weekDays.map((day) => (
            <DroppableDay
              key={day.dateString}
              date={day.date}
              tasks={day.tasks}
              onTaskDrop={(date) => console.log("Drop on", date)}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-90 scale-95">
            <KanbanTaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
