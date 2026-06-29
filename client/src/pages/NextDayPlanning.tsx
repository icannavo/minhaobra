import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, TrendingUp, Users, Ruler } from "lucide-react";

export default function NextDayPlanning() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  const [formData, setFormData] = useState({
    workId: 1,
    date: tomorrowStr,
    taskName: "",
    numberOfEmployees: 3,
    targetArea: "",
    description: "",
  });

  // Buscar tarefas do próximo dia
  const { data: nextDayTasks, refetch } = trpc.dailyTasks.getByDate.useQuery({
    date: tomorrowStr,
  });

  // Buscar histórico para calcular produtividade média
  const { data: productivityHistory } = trpc.productivity.getHistory.useQuery({
    workId: 1,
  });

  // Mutation para criar tarefa
  const createTask = trpc.dailyTasks.create.useMutation({
    onSuccess: () => {
      toast.success("Tarefa planejada para amanhã!");
      setFormData({
        workId: 1,
        date: tomorrowStr,
        taskName: "",
        numberOfEmployees: 3,
        targetArea: "",
        description: "",
      });
      setShowNewTaskDialog(false);
      refetch();
    },
    onError: () => {
      toast.error("Erro ao criar tarefa");
    },
  });

  const handleCreateTask = () => {
    if (!formData.taskName || !formData.targetArea) {
      toast.error("Preencha todos os campos");
      return;
    }

    createTask.mutate(formData);
  };

  // Calcular produtividade média
  const avgProductivity = productivityHistory
    ? productivityHistory.reduce((sum: number, h: any) => sum + Number(h.productivity || 0), 0) /
      productivityHistory.length
    : 0;

  // Estimar duração
  const estimatedDays = formData.targetArea
    ? Math.ceil(Number(formData.targetArea) / (avgProductivity * formData.numberOfEmployees))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white">Planejamento do Próximo Dia</h1>
          <p className="text-slate-400 mt-2">
            {tomorrow.toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Produtividade Média</p>
                <p className="text-2xl font-bold text-blue-400">
                  {avgProductivity.toFixed(1)} m²/p
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Funcionários Disponíveis</p>
                <p className="text-2xl font-bold text-purple-400">{formData.numberOfEmployees}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Ruler className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Duração Estimada</p>
                <p className="text-2xl font-bold text-green-400">{estimatedDays} dia(s)</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tarefas Planejadas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Tarefas Planejadas</h2>
            <Button
              onClick={() => setShowNewTaskDialog(true)}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova Tarefa
            </Button>
          </div>

          {nextDayTasks && nextDayTasks.length > 0 ? (
            <div className="space-y-3">
              {nextDayTasks.map((task: any) => (
                <Card key={task.id} className="p-4 bg-slate-800 border-slate-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{task.taskName}</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-slate-400">Meta</p>
                          <p className="text-lg font-bold text-blue-400">{task.targetArea} m²</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Funcionários</p>
                          <p className="text-lg font-bold text-purple-400">
                            {task.numberOfEmployees}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Duração Estimada</p>
                          <p className="text-lg font-bold text-green-400">
                            {Math.ceil(
                              Number(task.targetArea) /
                                (avgProductivity * task.numberOfEmployees)
                            )}{" "}
                            dia(s)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 bg-slate-800 border-slate-700 text-center">
              <p className="text-slate-400">Nenhuma tarefa planejada para amanhã</p>
            </Card>
          )}
        </div>

        {/* Dialog para nova tarefa */}
        <Dialog open={showNewTaskDialog} onOpenChange={setShowNewTaskDialog}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Planejar Nova Tarefa</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Nome da Tarefa</label>
                <Input
                  value={formData.taskName}
                  onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
                  placeholder="Ex: Limpeza de fachada"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Funcionários</label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.numberOfEmployees}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numberOfEmployees: Number(e.target.value),
                      })
                    }
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Área (m²)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.targetArea}
                    onChange={(e) => setFormData({ ...formData, targetArea: e.target.value })}
                    placeholder="Ex: 50"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Descrição (opcional)</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalhes adicionais"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              {/* Preview */}
              {formData.targetArea && (
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-slate-400 mb-2">Estimativa</p>
                  <p className="text-lg font-bold text-green-400">
                    {estimatedDays} dia(s) para conclusão
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCreateTask}
                  disabled={createTask.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {createTask.isPending ? "Criando..." : "Criar Tarefa"}
                </Button>
                <Button
                  onClick={() => setShowNewTaskDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
