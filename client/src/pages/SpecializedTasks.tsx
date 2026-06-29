import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SPECIALIZED_TASKS = {
  setup: [
    {
      name: "Montagem de Andaime 5m",
      time: 120,
      team: 2,
      difficulty: "Média",
      epis: ["Capacete", "Luva", "Bota de Segurança"],
      equipment: ["Andaime Metálico 5m"],
    },
    {
      name: "Montagem de Andaime 10m",
      time: 180,
      team: 3,
      difficulty: "Alta",
      epis: ["Capacete", "Luva", "Bota de Segurança", "Cinto de Segurança"],
      equipment: ["Andaime Metálico 10m"],
    },
    {
      name: "Preparação de Lava-Jato",
      time: 30,
      team: 1,
      difficulty: "Baixa",
      epis: ["Capacete", "Óculos", "Luva de Nitrila"],
      equipment: ["Lava-Jato"],
    },
    {
      name: "Montagem de Compressor",
      time: 15,
      team: 1,
      difficulty: "Baixa",
      epis: ["Capacete"],
      equipment: ["Compressor de Ar"],
    },
  ],
  cleaning: [
    {
      name: "Limpeza com Lava-Jato",
      time: 480,
      area: 100,
      productivity: "100 m²/dia",
      epis: ["Capacete", "Óculos", "Luva", "Avental", "Bota"],
      equipment: ["Lava-Jato"],
    },
    {
      name: "Limpeza Manual com Escova",
      time: 480,
      area: 50,
      productivity: "50 m²/dia",
      epis: ["Capacete", "Luva", "Máscara"],
      equipment: ["Escada"],
    },
    {
      name: "Limpeza Final do Dia",
      time: 60,
      team: 2,
      difficulty: "Baixa",
      epis: ["Luva", "Avental"],
      equipment: [],
    },
  ],
  preparation: [
    {
      name: "Remoção de Tinta Antiga (Lixamento)",
      time: 480,
      area: 80,
      productivity: "80 m²/dia",
      epis: ["Capacete", "Máscara PFF2", "Óculos", "Luva"],
      equipment: ["Lixadeira Orbital"],
    },
    {
      name: "Remoção de Mofo e Algas",
      time: 240,
      area: 100,
      productivity: "100 m²/dia",
      epis: ["Capacete", "Máscara", "Luva", "Óculos"],
      equipment: ["Lava-Jato"],
    },
    {
      name: "Aplicação de Massa Reparadora",
      time: 480,
      area: 60,
      productivity: "60 m²/dia",
      epis: ["Capacete", "Luva", "Óculos"],
      equipment: ["Espátula Grande"],
    },
    {
      name: "Lixamento de Massa",
      time: 240,
      area: 80,
      productivity: "80 m²/dia",
      epis: ["Capacete", "Máscara PFF2", "Óculos", "Luva"],
      equipment: ["Lixadeira Orbital"],
    },
  ],
  painting: [
    {
      name: "Aplicação de Primer",
      time: 480,
      area: 100,
      productivity: "100 m²/dia",
      epis: ["Capacete", "Máscara", "Luva", "Óculos"],
      equipment: ["Pincel", "Rolo"],
    },
    {
      name: "Aplicação de Tinta (1ª Demão)",
      time: 480,
      area: 120,
      productivity: "120 m²/dia",
      epis: ["Capacete", "Máscara", "Luva", "Óculos"],
      equipment: ["Pincel", "Rolo"],
    },
    {
      name: "Aplicação de Tinta (2ª Demão)",
      time: 480,
      area: 120,
      productivity: "120 m²/dia",
      epis: ["Capacete", "Máscara", "Luva", "Óculos"],
      equipment: ["Pincel", "Rolo"],
    },
  ],
  teardown: [
    {
      name: "Desmontagem de Andaime 5m",
      time: 90,
      team: 2,
      difficulty: "Média",
      epis: ["Capacete", "Luva", "Bota de Segurança"],
      equipment: ["Andaime Metálico 5m"],
    },
    {
      name: "Desmontagem de Andaime 10m",
      time: 120,
      team: 3,
      difficulty: "Alta",
      epis: ["Capacete", "Luva", "Bota de Segurança", "Cinto de Segurança"],
      equipment: ["Andaime Metálico 10m"],
    },
    {
      name: "Limpeza e Guarda de Equipamentos",
      time: 45,
      team: 2,
      difficulty: "Baixa",
      epis: ["Luva"],
      equipment: [],
    },
  ],
};

export default function SpecializedTasks() {
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const TaskCard = ({ task, icon: Icon }: any) => (
    <div className="card p-4 sm:p-6 cursor-pointer hover:border-blue-500 transition-all"
      onClick={() => setSelectedTask(task)}
    >
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm sm:text-base truncate">{task.name}</h3>
          {task.difficulty && (
            <p className={`text-xs font-semibold mt-1 ${
              task.difficulty === "Alta" ? "text-red-400" :
              task.difficulty === "Média" ? "text-yellow-400" :
              "text-green-400"
            }`}>
              {task.difficulty}
            </p>
          )}
        </div>
        <Icon className="w-5 h-5 text-slate-400 flex-shrink-0" />
      </div>

      <div className="space-y-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2 text-slate-400">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>{task.time} min</span>
        </div>
        {task.team && <p className="text-slate-500">Equipe: {task.team} p</p>}
        {task.area && <p className="text-slate-500">Área: {task.area} m²</p>}
        {task.productivity && <p className="text-slate-500">{task.productivity}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Tarefas Especializadas</h1>
          <p className="text-slate-400 mt-2 text-sm sm:text-base">Tempos padrão e recursos necessários</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 bg-slate-800 p-1">
            <TabsTrigger value="setup">Montagem</TabsTrigger>
            <TabsTrigger value="cleaning">Limpeza</TabsTrigger>
            <TabsTrigger value="preparation">Preparação</TabsTrigger>
            <TabsTrigger value="painting">Pintura</TabsTrigger>
            <TabsTrigger value="teardown">Desmontagem</TabsTrigger>
          </TabsList>

          {/* Montagem */}
          <TabsContent value="setup" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SPECIALIZED_TASKS.setup.map((task, idx) => (
                <TaskCard key={idx} task={task} icon={AlertCircle} />
              ))}
            </div>
          </TabsContent>

          {/* Limpeza */}
          <TabsContent value="cleaning" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SPECIALIZED_TASKS.cleaning.map((task, idx) => (
                <TaskCard key={idx} task={task} icon={CheckCircle2} />
              ))}
            </div>
          </TabsContent>

          {/* Preparação */}
          <TabsContent value="preparation" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SPECIALIZED_TASKS.preparation.map((task, idx) => (
                <TaskCard key={idx} task={task} icon={AlertCircle} />
              ))}
            </div>
          </TabsContent>

          {/* Pintura */}
          <TabsContent value="painting" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SPECIALIZED_TASKS.painting.map((task, idx) => (
                <TaskCard key={idx} task={task} icon={CheckCircle2} />
              ))}
            </div>
          </TabsContent>

          {/* Desmontagem */}
          <TabsContent value="teardown" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SPECIALIZED_TASKS.teardown.map((task, idx) => (
                <TaskCard key={idx} task={task} icon={AlertCircle} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Task Details */}
        {selectedTask && (
          <div className="card p-4 sm:p-6 space-y-4 animate-fade-in">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg sm:text-2xl font-bold text-white flex-1">{selectedTask.name}</h2>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-white text-2xl flex-shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="divider" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Tempo Total</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-400">{selectedTask.time} min</p>
              </div>
              {selectedTask.team && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Equipe</p>
                  <p className="text-lg sm:text-2xl font-bold text-purple-400">{selectedTask.team} p</p>
                </div>
              )}
              {selectedTask.area && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Área</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-400">{selectedTask.area} m²</p>
                </div>
              )}
              {selectedTask.difficulty && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Dificuldade</p>
                  <p className={`text-lg sm:text-xl font-bold ${
                    selectedTask.difficulty === "Alta" ? "text-red-400" :
                    selectedTask.difficulty === "Média" ? "text-yellow-400" :
                    "text-green-400"
                  }`}>
                    {selectedTask.difficulty}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h3 className="font-semibold text-white mb-3 text-sm sm:text-base">EPIs Necessários</h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  {selectedTask.epis?.map((epi: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>{epi}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-3 text-sm sm:text-base">Equipamentos</h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  {selectedTask.equipment?.length > 0 ? (
                    selectedTask.equipment.map((eq: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <span>{eq}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-xs">Nenhum equipamento especial</p>
                  )}
                </div>
              </div>
            </div>

            <button className="w-full btn btn-primary justify-center mt-4">
              Adicionar à Tarefa do Dia
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
