import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GripVertical, Clock, Users, Square, CheckSquare, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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
  status: string;
  progressPercent: number;
  totalSubtasks: number;
  completedSubtasks: number;
  phaseName?: string;
}

interface KanbanTaskCardProps {
  task: ProjectTask;
}

const priorityColors = {
  low: "bg-slate-100 text-slate-700 border-slate-300",
  medium: "bg-blue-100 text-blue-700 border-blue-300",
  high: "bg-orange-100 text-orange-700 border-orange-300",
  critical: "bg-red-100 text-red-700 border-red-300",
};

const priorityLabels = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  critical: "Crítica",
};

export default function KanbanTaskCard({ task }: KanbanTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md",
        isDragging && "opacity-50 shadow-2xl"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-2">
          <div
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-mono mb-1">
                  {task.code}
                </p>
                <h4 className="font-semibold text-sm leading-tight break-words">
                  {task.name}
                </h4>
              </div>
              <Badge
                variant="outline"
                className={cn("shrink-0 text-xs", priorityColors[task.priority])}
              >
                {priorityLabels[task.priority]}
              </Badge>
            </div>

            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                {task.description}
              </p>
            )}

            {task.phaseName && (
              <Badge variant="secondary" className="mb-3 text-xs">
                {task.phaseName}
              </Badge>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDuration(task.estimatedDurationMinutes)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                <span>{task.estimatedEmployees} pessoa{task.estimatedEmployees > 1 ? "s" : ""}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground col-span-2">
                <Square className="w-3.5 h-3.5" />
                <span>{task.area.toFixed(0)} m²</span>
              </div>
            </div>

            {/* Progress */}
            {task.progressPercent > 0 && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Progresso</span>
                  <span className="text-xs font-medium">{task.progressPercent}%</span>
                </div>
                <Progress value={task.progressPercent} className="h-1.5" />
              </div>
            )}

            {/* Subtasks */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>
                  {task.completedSubtasks}/{task.totalSubtasks} subtarefas
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                {task.status}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
