import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Save, RotateCcw, TrendingUp, TrendingDown, Clock, 
  Users, Zap, AlertCircle, CheckCircle2, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface TaskProductivity {
  id: string;
  name: string;
  category: string;
  standardTime: number; // minutos
  standardArea: number; // m² por dia
  actualTime: number; // minutos ajustados
  actualArea: number; // m² por dia ajustados
  teamSize: number;
  difficulty: "low" | "medium" | "high";
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 }
};

const DEFAULT_TASKS: TaskProductivity[] = [
  // Montagem
  {
    id: "setup-scaffold-5m",
    name: "Montagem de Andaime 5m",
    category: "setup",
    standardTime: 120,
    standardArea: 0,
    actualTime: 120,
    actualArea: 0,
    teamSize: 2,
    difficulty: "medium"
  },
  {
    id: "setup-scaffold-10m",
    name: "Montagem de Andaime 10m",
    category: "setup",
    standardTime: 180,
    standardArea: 0,
    actualTime: 180,
    actualArea: 0,
    teamSize: 3,
    difficulty: "high"
  },
  {
    id: "setup-washer",
    name: "Preparação de Lava-Jato",
    category: "setup",
    standardTime: 30,
    standardArea: 0,
    actualTime: 30,
    actualArea: 0,
    teamSize: 1,
    difficulty: "low"
  },
  // Limpeza
  {
    id: "clean-pressure-washer",
    name: "Limpeza com Lava-Jato",
    category: "cleaning",
    standardTime: 480,
    standardArea: 100,
    actualTime: 480,
    actualArea: 100,
    teamSize: 2,
    difficulty: "medium"
  },
  {
    id: "clean-manual",
    name: "Limpeza Manual com Escova",
    category: "cleaning",
    standardTime: 480,
    standardArea: 50,
    actualTime: 480,
    actualArea: 50,
    teamSize: 2,
    difficulty: "high"
  },
  // Preparação
  {
    id: "prep-sand",
    name: "Remoção de Tinta (Lixamento)",
    category: "preparation",
    standardTime: 480,
    standardArea: 80,
    actualTime: 480,
    actualArea: 80,
    teamSize: 2,
    difficulty: "high"
  },
  {
    id: "prep-mold",
    name: "Remoção de Mofo e Algas",
    category: "preparation",
    standardTime: 240,
    standardArea: 100,
    actualTime: 240,
    actualArea: 100,
    teamSize: 2,
    difficulty: "medium"
  },
  {
    id: "prep-filler",
    name: "Aplicação de Massa Reparadora",
    category: "preparation",
    standardTime: 480,
    standardArea: 60,
    actualTime: 480,
    actualArea: 60,
    teamSize: 2,
    difficulty: "medium"
  },
  {
    id: "prep-sand-filler",
    name: "Lixamento de Massa",
    category: "preparation",
    standardTime: 240,
    standardArea: 80,
    actualTime: 240,
    actualArea: 80,
    teamSize: 2,
    difficulty: "medium"
  },
  // Pintura
  {
    id: "paint-primer",
    name: "Aplicação de Primer",
    category: "painting",
    standardTime: 480,
    standardArea: 100,
    actualTime: 480,
    actualArea: 100,
    teamSize: 2,
    difficulty: "medium"
  },
  {
    id: "paint-first",
    name: "Aplicação de Tinta (1ª Demão)",
    category: "painting",
    standardTime: 480,
    standardArea: 120,
    actualTime: 480,
    actualArea: 120,
    teamSize: 2,
    difficulty: "low"
  },
  {
    id: "paint-second",
    name: "Aplicação de Tinta (2ª Demão)",
    category: "painting",
    standardTime: 480,
    standardArea: 120,
    actualTime: 480,
    actualArea: 120,
    teamSize: 2,
    difficulty: "low"
  },
  // Desmontagem
  {
    id: "teardown-scaffold-5m",
    name: "Desmontagem de Andaime 5m",
    category: "teardown",
    standardTime: 90,
    standardArea: 0,
    actualTime: 90,
    actualArea: 0,
    teamSize: 2,
    difficulty: "medium"
  }
];

const CATEGORY_INFO = {
  setup: { label: "Montagem", icon: Zap, color: "blue" },
  cleaning: { label: "Limpeza", icon: AlertCircle, color: "green" },
  preparation: { label: "Preparação", icon: Clock, color: "orange" },
  painting: { label: "Pintura", icon: CheckCircle2, color: "purple" },
  teardown: { label: "Desmontagem", icon: RotateCcw, color: "red" }
};

export default function ProductivitySettings() {
  const [tasks, setTasks] = useState<TaskProductivity[]>(DEFAULT_TASKS);
  const [hasChanges, setHasChanges] = useState(false);


  const updateTask = (taskId: string, field: keyof TaskProductivity, value: number) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, [field]: value } : task
      )
    );
    setHasChanges(true);
  };

  const resetTask = (taskId: string) => {
    const defaultTask = DEFAULT_TASKS.find(t => t.id === taskId);
    if (defaultTask) {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId 
            ? { ...task, actualTime: defaultTask.standardTime, actualArea: defaultTask.standardArea }
            : task
        )
      );
      setHasChanges(true);
      toast.success("Valores padrão restaurados");
    }
  };

  const resetAll = () => {
    setTasks(DEFAULT_TASKS.map(task => ({
      ...task,
      actualTime: task.standardTime,
      actualArea: task.standardArea
    })));
    setHasChanges(true);
    toast.success("Todos os valores foram restaurados");
  };

  const saveChanges = () => {
    // Aqui você salvaria no localStorage ou backend
    localStorage.setItem("productivitySettings", JSON.stringify(tasks));
    setHasChanges(false);
    toast.success("Configurações salvas com sucesso!");
  };


  const calculateVariation = (actual: number, standard: number) => {
    if (standard === 0) return 0;
    return ((actual - standard) / standard) * 100;
  };

  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, TaskProductivity[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="section-header mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="section-title">Configurações de Produtividade</h1>
              <p className="section-subtitle">
                Ajuste os tempos baseado na experiência real da sua equipe
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={resetAll}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Restaurar Tudo
              </Button>
              <Button
                onClick={saveChanges}
                disabled={!hasChanges}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                Salvar Alterações
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Info Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="modern-card mb-8 flex items-start gap-4 bg-blue-500/10 border-blue-500/30"
        >
          <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-2">Por que ajustar os tempos?</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">
              Os tempos padrão são médias ideais. Na prática, fatores como experiência da equipe, 
              condições climáticas, acesso ao local e qualidade dos materiais afetam a produtividade.
            </p>
            <ul className="text-sm text-slate-400 space-y-1">
              <li>• <strong className="text-white">Equipe experiente:</strong> Reduza 10-20% do tempo</li>
              <li>• <strong className="text-white">Equipe iniciante:</strong> Aumente 20-30% do tempo</li>
              <li>• <strong className="text-white">Condições difíceis:</strong> Aumente 30-50% do tempo</li>
            </ul>
          </div>
        </motion.div>

        {/* Tasks by Category */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Accordion type="multiple" defaultValue={Object.keys(groupedTasks)} className="space-y-4">
            {Object.entries(groupedTasks).map(([category, categoryTasks]) => {
              const info = CATEGORY_INFO[category as keyof typeof CATEGORY_INFO];
              const CategoryIcon = info.icon;
              
              return (
                <motion.div key={category} variants={itemVariants}>
                  <AccordionItem value={category} className="modern-card border-none">
                    <AccordionTrigger className="hover:no-underline px-6 py-4">
                      <div className="flex items-center gap-4 flex-1 text-left">
                        <div className={`icon-badge icon-badge-${info.color}`}>
                          <CategoryIcon className={`w-6 h-6 text-${info.color}-400`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">{info.label}</h3>
                          <p className="text-sm text-slate-400">{categoryTasks.length} tarefas</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-4 pt-4">
                        {categoryTasks.map((task) => {
                          const timeVariation = calculateVariation(task.actualTime, task.standardTime);
                          const areaVariation = task.standardArea > 0 
                            ? calculateVariation(task.actualArea, task.standardArea)
                            : 0;
                          
                          return (
                            <Card key={task.id} className="p-4 md:p-6 bg-slate-800/40 border-slate-700">
                              {/* Task Header */}
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-white mb-2">{task.name}</h4>
                                  <div className="flex flex-wrap items-center gap-3 text-sm">
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                      <Users className="w-4 h-4" />
                                      <span>{task.teamSize} pessoa{task.teamSize > 1 ? 's' : ''}</span>
                                    </div>
                                    <span className={`status-badge ${
                                      task.difficulty === "low" ? "status-badge bg-green-500/20 text-green-400" :
                                      task.difficulty === "medium" ? "status-badge bg-yellow-500/20 text-yellow-400" :
                                      "status-badge bg-red-500/20 text-red-400"
                                    }`}>
                                      {task.difficulty === "low" && "Fácil"}
                                      {task.difficulty === "medium" && "Médio"}
                                      {task.difficulty === "high" && "Difícil"}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => resetTask(task.id)}
                                  className="gap-2"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  Restaurar
                                </Button>
                              </div>

                              {/* Metrics Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Time Configuration */}
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-blue-400" />
                                    <Label className="text-white font-semibold">Tempo (minutos)</Label>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-xs text-slate-400 mb-2 block">Padrão</Label>
                                      <div className="bg-slate-900/50 rounded-lg px-4 py-3 text-center">
                                        <span className="text-lg font-semibold text-slate-300">
                                          {task.standardTime}
                                        </span>
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-slate-400 mb-2 block">Ajustado</Label>
                                      <Input
                                        type="number"
                                        value={task.actualTime}
                                        onChange={(e) => updateTask(task.id, "actualTime", parseInt(e.target.value) || 0)}
                                        className="text-center text-lg font-semibold"
                                        min="1"
                                      />
                                    </div>
                                  </div>

                                  {/* Time Variation */}
                                  {timeVariation !== 0 && (
                                    <div className={`flex items-center gap-2 text-sm ${
                                      timeVariation > 0 ? "text-red-400" : "text-green-400"
                                    }`}>
                                      {timeVariation > 0 ? (
                                        <TrendingUp className="w-4 h-4" />
                                      ) : (
                                        <TrendingDown className="w-4 h-4" />
                                      )}
                                      <span className="font-semibold">
                                        {timeVariation > 0 ? "+" : ""}{timeVariation.toFixed(1)}%
                                      </span>
                                      <span className="text-slate-400">
                                        {timeVariation > 0 ? "mais lento" : "mais rápido"}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Area Configuration (if applicable) */}
                                {task.standardArea > 0 && (
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                      <Zap className="w-5 h-5 text-purple-400" />
                                      <Label className="text-white font-semibold">Produtividade (m²/dia)</Label>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-xs text-slate-400 mb-2 block">Padrão</Label>
                                        <div className="bg-slate-900/50 rounded-lg px-4 py-3 text-center">
                                          <span className="text-lg font-semibold text-slate-300">
                                            {task.standardArea}
                                          </span>
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="text-xs text-slate-400 mb-2 block">Ajustado</Label>
                                        <Input
                                          type="number"
                                          value={task.actualArea}
                                          onChange={(e) => updateTask(task.id, "actualArea", parseInt(e.target.value) || 0)}
                                          className="text-center text-lg font-semibold"
                                          min="1"
                                        />
                                      </div>
                                    </div>

                                    {/* Area Variation */}
                                    {areaVariation !== 0 && (
                                      <div className={`flex items-center gap-2 text-sm ${
                                        areaVariation > 0 ? "text-green-400" : "text-red-400"
                                      }`}>
                                        {areaVariation > 0 ? (
                                          <TrendingUp className="w-4 h-4" />
                                        ) : (
                                          <TrendingDown className="w-4 h-4" />
                                        )}
                                        <span className="font-semibold">
                                          {areaVariation > 0 ? "+" : ""}{areaVariation.toFixed(1)}%
                                        </span>
                                        <span className="text-slate-400">
                                          {areaVariation > 0 ? "mais produtivo" : "menos produtivo"}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              );
            })}
          </Accordion>
        </motion.div>

        {/* Floating Save Button */}
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <Button
              size="lg"
              onClick={saveChanges}
              className="gap-2 shadow-2xl shadow-primary/50"
            >
              <Save className="w-5 h-5" />
              Salvar {tasks.filter(t => t.actualTime !== DEFAULT_TASKS.find(dt => dt.id === t.id)?.standardTime).length} Alterações
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
