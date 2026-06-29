import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  CheckCircle2,
  AlertCircle,
  Plus,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  MapPin,
  AlertTriangle,
} from "lucide-react";

interface Task {
  id: string;
  name: string;
  location: string;
  meta: number;
  completed: number;
  employees: number;
  equipment: string[];
  materials: string[];
  timeEstimate: number;
  status: "pending" | "in-progress" | "completed";
}

export default function DailyDashboard() {
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [completedArea, setCompletedArea] = useState("");

  // Mock data - será substituído por tRPC
  const mockTasks: Task[] = [
    {
      id: "1",
      name: "Limpeza com Lava-Jato",
      location: "Fachada Prédio Centro",
      meta: 100,
      completed: 0,
      employees: 2,
      equipment: ["Lava-Jato", "Compressor"],
      materials: ["Água", "Detergente"],
      timeEstimate: 480,
      status: "pending",
    },
    {
      id: "2",
      name: "Aplicação de Primer",
      location: "Fachada Prédio Centro",
      meta: 80,
      completed: 0,
      employees: 3,
      equipment: ["Andaime 5m", "Rolo"],
      materials: ["Primer Acrílico"],
      timeEstimate: 360,
      status: "pending",
    },
    {
      id: "3",
      name: "Tratamento de Trincas",
      location: "Fachada Prédio Centro",
      meta: 30,
      completed: 0,
      employees: 1,
      equipment: ["Escada", "Espátula"],
      materials: ["Selante Poliuretano", "Massa"],
      timeEstimate: 240,
      status: "pending",
    },
  ];

  const [tasks, setTasks] = useState(mockTasks);

  const calculateDeviation = (task: Task) => {
    return task.completed - task.meta;
  };

  const calculateProductivity = (task: Task) => {
    if (task.employees === 0) return 0;
    return (task.completed / task.employees).toFixed(1);
  };

  const handleMarkComplete = (task: Task) => {
    setSelectedTask(task);
    setCompletedArea(String(task.completed || 0));
    setShowCompleteDialog(true);
  };

  const handleSaveCompletion = () => {
    if (!completedArea || Number(completedArea) < 0) {
      toast.error("Insira uma área válida");
      return;
    }

    if (selectedTask) {
      setTasks(
        tasks.map((t) =>
          t.id === selectedTask.id
            ? {
                ...t,
                completed: Number(completedArea),
                status: Number(completedArea) >= t.meta ? "completed" : "in-progress",
              }
            : t
        )
      );

      toast.success("Tarefa atualizada com sucesso!");
      setShowCompleteDialog(false);
      setCompletedArea("");
      setSelectedTask(null);
    }
  };

  const totalMeta = tasks.reduce((sum, t) => sum + t.meta, 0);
  const totalCompleted = tasks.reduce((sum, t) => sum + t.completed, 0);
  const totalDeviation = totalCompleted - totalMeta;
  const progressPercentage = totalMeta > 0 ? (totalCompleted / totalMeta) * 100 : 0;

  const hasNegativeDeviation = tasks.some((t) => calculateDeviation(t) < 0 && t.status !== "completed");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Tarefas do Dia</h1>
              <p className="text-slate-400 mt-2">{today}</p>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card p-6">
            <p className="text-xs text-slate-400 mb-2">Meta Total</p>
            <p className="text-3xl font-bold text-blue-400">{totalMeta}</p>
            <p className="text-xs text-slate-600 mt-2">m² de parede</p>
          </div>

          <div className="card p-6">
            <p className="text-xs text-slate-400 mb-2">Realizado</p>
            <p className="text-3xl font-bold text-green-400">{totalCompleted}</p>
            <p className="text-xs text-slate-600 mt-2">m² concluído</p>
          </div>

          <div className={`card p-6 ${totalDeviation < 0 ? "border-red-500" : "border-slate-700"}`}>
            <p className="text-xs text-slate-400 mb-2">Desvio</p>
            <p className={`text-3xl font-bold ${totalDeviation < 0 ? "text-red-400" : "text-green-400"}`}>
              {totalDeviation > 0 ? "+" : ""}{totalDeviation}
            </p>
            <p className="text-xs text-slate-600 mt-2">m² de diferença</p>
          </div>

          <div className="card p-6">
            <p className="text-xs text-slate-400 mb-2">Progresso</p>
            <p className="text-3xl font-bold text-purple-400">{progressPercentage.toFixed(0)}%</p>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Alerts */}
        {hasNegativeDeviation && (
          <div className="alert alert-warning mb-8">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Atenção: Desvio Negativo Detectado</p>
              <p className="text-sm mt-1">Algumas tarefas estão com progresso abaixo da meta. Verifique o cronograma.</p>
            </div>
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks.map((task) => {
            const deviation = calculateDeviation(task);
            const productivity = calculateProductivity(task);
            const isCompleted = task.status === "completed";
            const isNegativeDeviation = deviation < 0 && !isCompleted;

            return (
              <div
                key={task.id}
                className={`card p-6 transition-all ${
                  isNegativeDeviation ? "border-red-500 bg-red-500/5" : "border-slate-700"
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                  {/* Task Info */}
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-bold text-white mb-2">{task.name}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <MapPin className="w-4 h-4" />
                        {task.location}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Users className="w-4 h-4" />
                        {task.employees} funcionários
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Clock className="w-4 h-4" />
                        {task.timeEstimate} minutos
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Meta</p>
                      <p className="text-2xl font-bold text-blue-400">{task.meta}</p>
                      <p className="text-xs text-slate-600">m²</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Realizado</p>
                      <p className="text-2xl font-bold text-green-400">{task.completed}</p>
                      <p className="text-xs text-slate-600">m²</p>
                    </div>
                  </div>

                  {/* Deviation & Productivity */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Desvio</p>
                      <p className={`text-2xl font-bold ${deviation < 0 ? "text-red-400" : "text-green-400"}`}>
                        {deviation > 0 ? "+" : ""}{deviation}
                      </p>
                      <p className="text-xs text-slate-600">m²</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Produtividade</p>
                      <p className="text-2xl font-bold text-purple-400">{productivity}</p>
                      <p className="text-xs text-slate-600">m²/pessoa</p>
                    </div>
                  </div>
                </div>

                {/* Equipment & Materials */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pb-6 border-b border-slate-700">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 mb-2">EQUIPAMENTOS</p>
                    <div className="flex flex-wrap gap-2">
                      {task.equipment.map((eq, idx) => (
                        <span key={idx} className="badge badge-info">
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 mb-2">MATERIAIS</p>
                    <div className="flex flex-wrap gap-2">
                      {task.materials.map((mat, idx) => (
                        <span key={idx} className="badge badge-success">
                          {mat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Button */}
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isCompleted ? "bg-green-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${Math.min((task.completed / task.meta) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleMarkComplete(task)}
                    className={`btn ${
                      isCompleted ? "btn-success" : "btn-primary"
                    } whitespace-nowrap`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Concluído
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Marcar
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="empty-state">
            <Calendar className="empty-state-icon" />
            <p className="empty-state-title">Nenhuma tarefa para hoje</p>
            <p className="empty-state-text">Crie uma nova obra para gerar tarefas</p>
          </div>
        )}
      </div>

      {/* Complete Task Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Marcar Tarefa como Concluída</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <p className="text-white font-semibold mb-2">{selectedTask?.name}</p>
              <p className="text-sm text-slate-400">Meta: {selectedTask?.meta} m²</p>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Área Concluída (m²)</label>
              <Input
                type="number"
                value={completedArea}
                onChange={(e) => setCompletedArea(e.target.value)}
                placeholder="Ex: 50"
                className="w-full"
              />
            </div>

            {completedArea && selectedTask && (
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="text-xs text-slate-400 mb-2">Desvio Calculado</p>
                <p className={`text-2xl font-bold ${
                  Number(completedArea) >= selectedTask.meta ? "text-green-400" : "text-red-400"
                }`}>
                  {Number(completedArea) - selectedTask.meta > 0 ? "+" : ""}
                  {Number(completedArea) - selectedTask.meta} m²
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setShowCompleteDialog(false)} className="flex-1 btn btn-secondary">
                Cancelar
              </button>
              <button onClick={handleSaveCompletion} className="flex-1 btn btn-primary">
                Confirmar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
