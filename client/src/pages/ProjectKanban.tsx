import { useState, useMemo } from "react";
import { useParams } from "wouter";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, KanbanSquare, Plus, Clock, Users } from "lucide-react";
import KanbanColumn from "@/components/KanbanColumn";
import KanbanTaskCard from "@/components/KanbanTaskCard";
import WeekCalendarView from "@/components/WeekCalendarView";
import DayTimelineView from "@/components/DayTimelineView";
import TaskBacklog from "@/components/TaskBacklog";
import { cn } from "@/lib/utils";

// Tipos
interface ProjectTask {
  id: number;
  code: string;
  name: string;
  description?: string;
  area: number;
  estimatedDurationMinutes: number;
  estimatedEmployees: number;
  priority: "low" | "medium" | "high" | "critical";
  kanbanStatus: "backlog" | "scheduled" | "in_progress" | "completed" | "cancelled";
  scheduledDate?: string;
  scheduledStartTime?: string;
  status: string;
  progressPercent: number;
  totalSubtasks: number;
  completedSubtasks: number;
  phaseId: number;
  phaseName?: string;
}

interface KanbanColumnData {
  id: string;
  name: string;
  columnType: "backlog" | "scheduled" | "in_progress" | "review" | "completed";
  tasks: ProjectTask[];
  color: string;
}

export default function ProjectKanban() {
  const { projectId } = useParams();
  const [activeView, setActiveView] = useState<"kanban" | "calendar" | "timeline">("kanban");
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Mock data - em produção virá do backend
  const [columns, setColumns] = useState<KanbanColumnData[]>([
    {
      id: "backlog",
      name: "Backlog",
      columnType: "backlog",
      color: "#64748b",
      tasks: [
        {
          id: 1,
          code: "F1-T001",
          name: "Limpeza de Fachada Norte",
          description: "Limpeza completa da fachada norte com lavajato",
          area: 120,
          estimatedDurationMinutes: 480,
          estimatedEmployees: 3,
          priority: "high",
          kanbanStatus: "backlog",
          status: "Pendente",
          progressPercent: 0,
          totalSubtasks: 8,
          completedSubtasks: 0,
          phaseId: 1,
          phaseName: "Preparação de Superfície",
        },
        {
          id: 2,
          code: "F1-T002",
          name: "Limpeza de Fachada Sul",
          area: 100,
          estimatedDurationMinutes: 420,
          estimatedEmployees: 3,
          priority: "high",
          kanbanStatus: "backlog",
          status: "Pendente",
          progressPercent: 0,
          totalSubtasks: 8,
          completedSubtasks: 0,
          phaseId: 1,
          phaseName: "Preparação de Superfície",
        },
        {
          id: 3,
          code: "F1-T003",
          name: "Limpeza de Fachada Leste",
          area: 80,
          estimatedDurationMinutes: 360,
          estimatedEmployees: 2,
          priority: "medium",
          kanbanStatus: "backlog",
          status: "Pendente",
          progressPercent: 0,
          totalSubtasks: 8,
          completedSubtasks: 0,
          phaseId: 1,
          phaseName: "Preparação de Superfície",
        },
      ],
    },
    {
      id: "scheduled",
      name: "Agendado",
      columnType: "scheduled",
      color: "#3b82f6",
      tasks: [],
    },
    {
      id: "in_progress",
      name: "Em Andamento",
      columnType: "in_progress",
      color: "#f59e0b",
      tasks: [],
    },
    {
      id: "review",
      name: "Revisão",
      columnType: "review",
      color: "#8b5cf6",
      tasks: [],
    },
    {
      id: "completed",
      name: "Concluído",
      columnType: "completed",
      color: "#10b981",
      tasks: [],
    },
  ]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveTaskId(Number(active.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = Number(active.id);
    const overId = String(over.id);

    // Encontrar coluna de origem e destino
    const activeColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === activeId)
    );
    const overColumn = columns.find((col) => col.id === overId || col.tasks.some((t) => t.id === Number(overId)));

    if (!activeColumn || !overColumn) return;
    if (activeColumn.id === overColumn.id) return;

    setColumns((cols) => {
      const activeItems = activeColumn.tasks;
      const overItems = overColumn.tasks;

      const activeIndex = activeItems.findIndex((t) => t.id === activeId);
      const overIndex = overItems.findIndex((t) => t.id === Number(overId));

      const newActiveItems = activeItems.filter((t) => t.id !== activeId);
      const movedTask = { ...activeItems[activeIndex], kanbanStatus: overColumn.columnType };

      const newOverItems = [...overItems];
      const insertIndex = overIndex >= 0 ? overIndex : overItems.length;
      newOverItems.splice(insertIndex, 0, movedTask);

      return cols.map((col) => {
        if (col.id === activeColumn.id) {
          return { ...col, tasks: newActiveItems };
        }
        if (col.id === overColumn.id) {
          return { ...col, tasks: newOverItems };
        }
        return col;
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTaskId(null);

    if (!over) return;

    const activeId = Number(active.id);
    const overId = String(over.id);

    // Aqui você salvaria no backend
    console.log(`Task ${activeId} moved to ${overId}`);
  };

  const activeTask = useMemo(() => {
    if (!activeTaskId) return null;
    for (const column of columns) {
      const task = column.tasks.find((t) => t.id === activeTaskId);
      if (task) return task;
    }
    return null;
  }, [activeTaskId, columns]);

  const handleTaskSchedule = (taskId: number, date: string, startTime: string) => {
    setColumns((cols) =>
      cols.map((col) => ({
        ...col,
        tasks: col.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                scheduledDate: date,
                scheduledStartTime: startTime,
                kanbanStatus: "scheduled",
              }
            : task
        ),
      }))
    );

    // Mover para coluna "Agendado"
    setColumns((cols) => {
      const sourceCol = cols.find((c) => c.tasks.some((t) => t.id === taskId));
      const targetCol = cols.find((c) => c.columnType === "scheduled");

      if (!sourceCol || !targetCol) return cols;

      const task = sourceCol.tasks.find((t) => t.id === taskId);
      if (!task) return cols;

      return cols.map((col) => {
        if (col.id === sourceCol.id) {
          return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) };
        }
        if (col.id === targetCol.id) {
          return { ...col, tasks: [...col.tasks, { ...task, scheduledDate: date, scheduledStartTime: startTime }] };
        }
        return col;
      });
    });
  };

  const allTasks = useMemo(() => {
    return columns.flatMap((col) => col.tasks);
  }, [columns]);

  const projectStats = useMemo(() => {
    const total = allTasks.length;
    const completed = allTasks.filter((t) => t.kanbanStatus === "completed").length;
    const inProgress = allTasks.filter((t) => t.kanbanStatus === "in_progress").length;
    const scheduled = allTasks.filter((t) => t.kanbanStatus === "scheduled").length;
    const backlog = allTasks.filter((t) => t.kanbanStatus === "backlog").length;

    return { total, completed, inProgress, scheduled, backlog };
  }, [allTasks]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold">Kanban - Projeto #{projectId}</h1>
            <p className="text-sm text-muted-foreground">
              Arraste as tarefas do backlog para o calendário e planeje seu dia
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Badge variant="outline">
                <span className="text-muted-foreground mr-1">Total:</span>
                {projectStats.total}
              </Badge>
              <Badge variant="secondary">
                <span className="text-muted-foreground mr-1">Backlog:</span>
                {projectStats.backlog}
              </Badge>
              <Badge variant="default" className="bg-blue-500">
                <span className="text-white mr-1">Agendado:</span>
                {projectStats.scheduled}
              </Badge>
              <Badge variant="default" className="bg-orange-500">
                <span className="text-white mr-1">Em Andamento:</span>
                {projectStats.inProgress}
              </Badge>
              <Badge variant="default" className="bg-green-500">
                <span className="text-white mr-1">Concluído:</span>
                {projectStats.completed}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* View Switcher */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4 w-fit">
          <TabsTrigger value="kanban" className="gap-2">
            <KanbanSquare className="w-4 h-4" />
            Quadro Kanban
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="w-4 h-4" />
            Calendário Semanal
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2">
            <Clock className="w-4 h-4" />
            Linha do Tempo Diária
          </TabsTrigger>
        </TabsList>

        {/* Kanban View */}
        <TabsContent value="kanban" className="flex-1 mt-4 overflow-hidden">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <ScrollArea className="h-full px-4 pb-4">
              <div className="flex gap-4 pb-4" style={{ minWidth: "max-content" }}>
                {columns.map((column) => (
                  <KanbanColumn key={column.id} column={column} />
                ))}
              </div>
            </ScrollArea>

            <DragOverlay>
              {activeTask ? (
                <div className="rotate-3 opacity-80">
                  <KanbanTaskCard task={activeTask} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar" className="flex-1 mt-4 overflow-hidden">
          <WeekCalendarView
            tasks={allTasks}
            onTaskSchedule={handleTaskSchedule}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </TabsContent>

        {/* Timeline View */}
        <TabsContent value="timeline" className="flex-1 mt-4 overflow-hidden">
          <DayTimelineView
            tasks={allTasks.filter((t) => t.scheduledDate === selectedDate.toISOString().split("T")[0])}
            date={selectedDate}
            onTaskSchedule={handleTaskSchedule}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
