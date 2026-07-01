import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
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
import { Users, GripVertical, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  specialty?: string;
  phone?: string;
  isAvailable: boolean; // Se está disponível para o dia
  currentWork?: string; // Obra onde está alocado
  currentTask?: string; // Tarefa onde está alocado
  allocatedHours?: number; // Horas alocadas no dia
}

interface TeamKanbanProps {
  date: string;
  workId: number;
  onAllocate: (memberId: number, taskId: string) => void;
}

// Componente de membro da equipe arrastável
function DraggableTeamMember({ member }: { member: TeamMember }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `member-${member.id}`,
    data: member,
    disabled: !member.isAvailable,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-slate-800 border border-slate-700 rounded-lg p-3 transition-all",
        member.isAvailable
          ? "cursor-grab active:cursor-grabbing hover:border-primary/50"
          : "opacity-50 cursor-not-allowed",
        isDragging && "opacity-30"
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
            {member.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-white text-sm truncate">{member.name}</h4>
            {member.isAvailable ? (
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Disponível
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                Ocupado
              </Badge>
            )}
          </div>

          <p className="text-xs text-slate-400 mb-1">{member.role}</p>

          {member.specialty && (
            <Badge variant="secondary" className="text-xs">
              {member.specialty}
            </Badge>
          )}

          {!member.isAvailable && (
            <div className="mt-2 text-xs text-slate-500">
              <p>🏗️ {member.currentWork}</p>
              {member.currentTask && <p className="truncate">📋 {member.currentTask}</p>}
            </div>
          )}

          {member.allocatedHours && member.allocatedHours > 0 && (
            <div className="mt-2 flex items-center gap-1 text-xs text-orange-400">
              <Clock className="w-3 h-3" />
              {member.allocatedHours}h alocadas
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Zona de drop para tarefas
function TaskDropZone({ taskId, taskName, members }: { taskId: string; taskName: string; members: TeamMember[] }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `task-${taskId}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[80px] rounded-lg border-2 border-dashed p-3 transition-all",
        isOver ? "border-primary bg-primary/5" : "border-slate-700/50 bg-slate-900/30"
      )}
    >
      <h4 className="text-xs font-semibold text-slate-400 mb-2">{taskName}</h4>

      {members.length === 0 ? (
        <p className="text-xs text-slate-600 text-center py-2">Arraste membros da equipe aqui</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-2 bg-slate-700/50 rounded px-2 py-1">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {member.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-white">{member.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TeamKanban({ date, workId, onAllocate }: TeamKanbanProps) {
  // Mock data - virá do backend
  const [availableMembers, setAvailableMembers] = useState<TeamMember[]>([
    {
      id: 1,
      name: "André Silva",
      role: "Encarregado",
      specialty: "Coordenação",
      isAvailable: true,
      allocatedHours: 0,
    },
    {
      id: 2,
      name: "Daia Santos",
      role: "Operador",
      specialty: "Lavajato",
      isAvailable: true,
      allocatedHours: 0,
    },
    {
      id: 3,
      name: "Elton Costa",
      role: "Auxiliar",
      isAvailable: false,
      currentWork: "Obra Centro",
      currentTask: "Limpeza Fachada Sul",
      allocatedHours: 8,
    },
    {
      id: 4,
      name: "Gabriela Lima",
      role: "Pintora",
      specialty: "Pintura Externa",
      isAvailable: true,
      allocatedHours: 4,
    },
    {
      id: 5,
      name: "Graziela Rocha",
      role: "Ajudante",
      isAvailable: true,
      allocatedHours: 0,
    },
    {
      id: 6,
      name: "Guilherme Alves",
      role: "Especialista",
      specialty: "Reparos Estruturais",
      isAvailable: false,
      currentWork: "Obra Paulista",
      currentTask: "Tratamento de Trincas",
      allocatedHours: 8,
    },
  ]);

  const [allocatedMembers, setAllocatedMembers] = useState<Record<string, TeamMember[]>>({});
  const [activeM, setActiveM] = useState<TeamMember | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveM(event.active.data.current as TeamMember);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveM(null);

    if (!over) return;

    const memberId = Number(String(active.id).replace("member-", ""));
    const taskId = String(over.id).replace("task-", "");

    // Alocar membro à tarefa
    const member = availableMembers.find((m) => m.id === memberId);
    if (!member || !member.isAvailable) return;

    setAllocatedMembers((prev) => ({
      ...prev,
      [taskId]: [...(prev[taskId] || []), member],
    }));

    // Marcar como indisponível
    setAvailableMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, isAvailable: false, currentTask: taskId } : m))
    );

    onAllocate(memberId, taskId);
  };

  const availableCount = availableMembers.filter((m) => m.isAvailable).length;
  const allocatedCount = availableMembers.filter((m) => !m.isAvailable).length;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Equipe</h3>
              <p className="text-xs text-slate-400">Arraste para alocar em tarefas</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
              {availableCount} disponíveis
            </Badge>
            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
              {allocatedCount} alocados
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Membros Disponíveis */}
          <Card className="p-4 bg-slate-800 border-slate-700">
            <h4 className="text-sm font-semibold text-white mb-3">Membros da Equipe</h4>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2 pr-4">
                {availableMembers.map((member) => (
                  <DraggableTeamMember key={member.id} member={member} />
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Tarefas (Zones de Drop) */}
          <Card className="p-4 bg-slate-800 border-slate-700">
            <h4 className="text-sm font-semibold text-white mb-3">Alocar em Tarefas</h4>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                <TaskDropZone taskId="task-1" taskName="Limpeza Fachada Norte" members={allocatedMembers["task-1"] || []} />
                <TaskDropZone taskId="task-2" taskName="Aplicação de Primer" members={allocatedMembers["task-2"] || []} />
                <TaskDropZone
                  taskId="task-3"
                  taskName="Tratamento de Trincas"
                  members={allocatedMembers["task-3"] || []}
                />
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>

      <DragOverlay>
        {activeM && (
          <div className="opacity-90 scale-105">
            <DraggableTeamMember member={activeM} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
