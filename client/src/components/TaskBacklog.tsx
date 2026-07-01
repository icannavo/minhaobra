import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, SortAsc, Clock, Users, Square } from "lucide-react";
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
  status: string;
  progressPercent: number;
  totalSubtasks: number;
  completedSubtasks: number;
  phaseName?: string;
  phaseId: number;
}

interface TaskBacklogProps {
  tasks: ProjectTask[];
  phases?: Array<{ id: number; name: string }>;
}

export default function TaskBacklog({ tasks, phases = [] }: TaskBacklogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("priority");

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter((task) => task.kanbanStatus === "backlog");

    // Busca por texto
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.name.toLowerCase().includes(query) ||
          task.code.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
      );
    }

    // Filtro por prioridade
    if (priorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    // Filtro por fase
    if (phaseFilter !== "all") {
      filtered = filtered.filter((task) => task.phaseId === Number(phaseFilter));
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "priority": {
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        case "duration":
          return b.estimatedDurationMinutes - a.estimatedDurationMinutes;
        case "area":
          return b.area - a.area;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [tasks, searchQuery, priorityFilter, phaseFilter, sortBy]);

  const stats = useMemo(() => {
    const total = filteredAndSortedTasks.length;
    const totalArea = filteredAndSortedTasks.reduce((sum, t) => sum + t.area, 0);
    const totalMinutes = filteredAndSortedTasks.reduce(
      (sum, t) => sum + t.estimatedDurationMinutes,
      0
    );
    const totalHours = Math.floor(totalMinutes / 60);
    const critical = filteredAndSortedTasks.filter((t) => t.priority === "critical").length;
    const high = filteredAndSortedTasks.filter((t) => t.priority === "high").length;

    return { total, totalArea, totalHours, critical, high };
  }, [filteredAndSortedTasks]);

  const groupedByPhase = useMemo(() => {
    const groups = new Map<number, ProjectTask[]>();

    filteredAndSortedTasks.forEach((task) => {
      if (!groups.has(task.phaseId)) {
        groups.set(task.phaseId, []);
      }
      groups.get(task.phaseId)!.push(task);
    });

    return Array.from(groups.entries()).map(([phaseId, tasks]) => ({
      phaseId,
      phaseName: tasks[0]?.phaseName || `Fase ${phaseId}`,
      tasks,
    }));
  }, [filteredAndSortedTasks]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle className="text-lg">Backlog de Tarefas</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.total} tarefas • {stats.totalArea.toFixed(0)} m² • {stats.totalHours}h de
              trabalho estimado
            </p>
          </div>

          <div className="flex gap-2">
            {stats.critical > 0 && (
              <Badge variant="destructive">{stats.critical} críticas</Badge>
            )}
            {stats.high > 0 && (
              <Badge variant="default" className="bg-orange-500">
                {stats.high} alta prioridade
              </Badge>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tarefas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="critical">Crítica</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
            </SelectContent>
          </Select>

          {phases.length > 0 && (
            <Select value={phaseFilter} onValueChange={setPhaseFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Fase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as fases</SelectItem>
                {phases.map((phase) => (
                  <SelectItem key={phase.id} value={String(phase.id)}>
                    {phase.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Prioridade</SelectItem>
              <SelectItem value="duration">Duração</SelectItem>
              <SelectItem value="area">Área</SelectItem>
              <SelectItem value="name">Nome</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-6">
            {filteredAndSortedTasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery || priorityFilter !== "all" || phaseFilter !== "all"
                    ? "Nenhuma tarefa encontrada com os filtros aplicados"
                    : "Não há tarefas no backlog"}
                </p>
              </div>
            ) : (
              groupedByPhase.map((group) => (
                <div key={group.phaseId}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                      {group.phaseName}
                    </h3>
                    <Badge variant="secondary">{group.tasks.length} tarefas</Badge>
                  </div>
                  <div className="space-y-3">
                    {group.tasks.map((task) => (
                      <KanbanTaskCard key={task.id} task={task} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
