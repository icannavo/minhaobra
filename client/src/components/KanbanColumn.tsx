import { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import KanbanTaskCard from "./KanbanTaskCard";
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

interface KanbanColumnProps {
  column: {
    id: string;
    name: string;
    columnType: string;
    color: string;
    tasks: ProjectTask[];
  };
}

export default function KanbanColumn({ column }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const taskIds = useMemo(() => column.tasks.map((task) => task.id), [column.tasks]);

  const totalArea = useMemo(
    () => column.tasks.reduce((sum, task) => sum + task.area, 0),
    [column.tasks]
  );

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        "w-80 flex flex-col shrink-0 transition-all",
        isOver && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: column.color }}
            />
            {column.name}
          </CardTitle>
          <Badge variant="secondary">{column.tasks.length}</Badge>
        </div>
        {totalArea > 0 && (
          <p className="text-xs text-muted-foreground">
            Total: {totalArea.toFixed(0)} m²
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[calc(100vh-280px)] px-4 pb-4">
          <SortableContext
            items={taskIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {column.tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Arraste tarefas aqui
                </div>
              ) : (
                column.tasks.map((task) => (
                  <KanbanTaskCard key={task.id} task={task} />
                ))
              )}
            </div>
          </SortableContext>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
