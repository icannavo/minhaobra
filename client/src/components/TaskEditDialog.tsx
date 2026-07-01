import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Users, Square } from "lucide-react";

interface Task {
  id: string;
  taskName: string;
  description?: string;
  area: number;
  estimatedMinutes: number;
  employees: number;
  priority: "low" | "medium" | "high" | "critical";
}

interface TaskEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onSave: (task: Task) => void;
}

export default function TaskEditDialog({ open, onOpenChange, task, onSave }: TaskEditDialogProps) {
  const [formData, setFormData] = useState<Task | null>(null);

  useEffect(() => {
    if (task) {
      setFormData({ ...task });
    }
  }, [task]);

  if (!formData) return null;

  const hours = Math.floor(formData.estimatedMinutes / 60);
  const minutes = formData.estimatedMinutes % 60;

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Editar Tarefa</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nome */}
          <div>
            <Label className="text-slate-300 mb-2">Nome da Tarefa</Label>
            <Input
              value={formData.taskName}
              onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          {/* Descrição */}
          <div>
            <Label className="text-slate-300 mb-2">Descrição</Label>
            <Textarea
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white min-h-[80px]"
              placeholder="Detalhes sobre a tarefa..."
            />
          </div>

          {/* Grid de inputs */}
          <div className="grid grid-cols-3 gap-4">
            {/* Duração */}
            <div>
              <Label className="text-slate-300 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Duração
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="number"
                    min="0"
                    value={hours}
                    onChange={(e) => {
                      const newHours = parseInt(e.target.value) || 0;
                      setFormData({
                        ...formData,
                        estimatedMinutes: newHours * 60 + minutes,
                      });
                    }}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Horas"
                  />
                  <span className="text-xs text-slate-400 mt-1">horas</span>
                </div>
                <div>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(e) => {
                      const newMinutes = parseInt(e.target.value) || 0;
                      setFormData({
                        ...formData,
                        estimatedMinutes: hours * 60 + newMinutes,
                      });
                    }}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Min"
                  />
                  <span className="text-xs text-slate-400 mt-1">min</span>
                </div>
              </div>
            </div>

            {/* Funcionários */}
            <div>
              <Label className="text-slate-300 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Funcionários
              </Label>
              <Input
                type="number"
                min="1"
                value={formData.employees}
                onChange={(e) => setFormData({ ...formData, employees: parseInt(e.target.value) || 1 })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            {/* Área */}
            <div>
              <Label className="text-slate-300 mb-2 flex items-center gap-2">
                <Square className="w-4 h-4" />
                Área (m²)
              </Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) || 0 })}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          {/* Prioridade */}
          <div>
            <Label className="text-slate-300 mb-2">Prioridade</Label>
            <div className="grid grid-cols-4 gap-2">
              {(["low", "medium", "high", "critical"] as const).map((priority) => (
                <button
                  key={priority}
                  onClick={() => setFormData({ ...formData, priority })}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    formData.priority === priority
                      ? priority === "low"
                        ? "bg-slate-500 text-white"
                        : priority === "medium"
                        ? "bg-blue-500 text-white"
                        : priority === "high"
                        ? "bg-orange-500 text-white"
                        : "bg-red-500 text-white"
                      : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                  )}
                >
                  {priority === "low"
                    ? "Baixa"
                    : priority === "medium"
                    ? "Média"
                    : priority === "high"
                    ? "Alta"
                    : "Crítica"}
                </button>
              ))}
            </div>
          </div>

          {/* Preview de duração */}
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <p className="text-xs text-slate-400 mb-1">Duração Total</p>
            <p className="text-2xl font-bold text-primary">
              {hours > 0 && `${hours}h `}
              {minutes > 0 && `${minutes}min`}
              {hours === 0 && minutes === 0 && "0min"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Com {formData.employees} funcionário(s) trabalhando
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90">
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
