import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { 
  Plus, 
  Edit, 
  Trash2, 
  ChevronRight, 
  Clock, 
  Package, 
  Layers,
  CheckCircle2,
  AlertCircle,
  Snowflake,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const STEP_TYPE_LABELS: Record<string, string> = {
  SAFETY_MEETING: "Reunião de Segurança",
  PREPARATION: "Preparação",
  EQUIPMENT_SETUP: "Montagem de Equipamentos",
  SCAFFOLDING: "Andaime",
  EPIs: "EPIs",
  EXECUTION: "Execução",
  BREAK: "Pausa/Descanso",
  CLEANUP: "Limpeza",
  INSPECTION: "Inspeção",
  EQUIPMENT_TEARDOWN: "Desmontagem",
};

const STEP_TYPE_COLORS: Record<string, string> = {
  SAFETY_MEETING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  PREPARATION: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  EQUIPMENT_SETUP: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  SCAFFOLDING: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  EPIs: "bg-green-500/10 text-green-400 border-green-500/20",
  EXECUTION: "bg-primary/10 text-primary border-primary/20",
  BREAK: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  CLEANUP: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  INSPECTION: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  EQUIPMENT_TEARDOWN: "bg-red-500/10 text-red-400 border-red-500/20",
};

const TIME_CALC_LABELS: Record<string, string> = {
  FIXED: "Tempo Fixo",
  PER_M2: "Por m²",
  PER_FLOOR: "Por Andar",
  PER_EQUIPMENT: "Por Equipamento",
  PERCENTAGE_EXECUTION: "% da Execução",
};

export default function TaskTemplates() {
  const [, navigate] = useLocation();
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedSubclass, setSelectedSubclass] = useState<any>(null);

  const { data: classes = [], isLoading: loadingClasses } = trpc.taskClasses.getAll.useQuery();
  const { data: subclasses = [], isLoading: loadingSubclasses } = trpc.taskSubclasses.getByClass.useQuery(
    { classId: selectedClass?.id },
    { enabled: !!selectedClass }
  );
  const { data: steps = [], isLoading: loadingSteps } = trpc.taskSteps.getBySubclass.useQuery(
    { subclassId: selectedSubclass?.id },
    { enabled: !!selectedSubclass }
  );

  if (loadingClasses) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Carregando templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="section-header mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="section-title mb-2">Templates de Tarefas</h1>
              <p className="section-subtitle">
                Classes e subclasses de tarefas com detalhamento completo de tempo, materiais e equipamentos
              </p>
            </div>
            <Button
              size="lg"
              className="gap-2"
              onClick={() => navigate("/create-detailed-task")}
            >
              <Zap className="w-5 h-5" />
              Criar Tarefa Detalhada
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COLUNA 1: Classes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Classes</h2>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Nova Classe
              </Button>
            </div>

            {classes.map((cls: any) => (
              <motion.div
                key={cls.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setSelectedClass(cls);
                  setSelectedSubclass(null);
                }}
                className={`modern-card cursor-pointer transition-all ${
                  selectedClass?.id === cls.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1">{cls.name}</h3>
                    <p className="text-xs text-slate-400">{cls.code}</p>
                  </div>
                  <Badge variant="outline" className="tag tag-blue">
                    {cls.category}
                  </Badge>
                </div>
                
                {cls.description && (
                  <p className="text-sm text-slate-400 mb-3">{cls.description}</p>
                )}

                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-700/50">
                  {cls.requiresScaffolding && (
                    <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-400">
                      Andaime
                    </Badge>
                  )}
                  {cls.requiresSafetyMeeting && (
                    <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-400">
                      Reunião {cls.safetyMeetingMinutes}min
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400">
                    {cls.baseProductivity} m²/dia
                  </Badge>
                </div>
              </motion.div>
            ))}

            {classes.length === 0 && (
              <div className="modern-card text-center py-12">
                <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Nenhuma classe cadastrada</p>
              </div>
            )}
          </div>

          {/* COLUNA 2: Subclasses */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Subclasses</h2>
              {selectedClass && (
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nova Subclasse
                </Button>
              )}
            </div>

            {!selectedClass ? (
              <div className="modern-card text-center py-12">
                <ChevronRight className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Selecione uma classe</p>
              </div>
            ) : loadingSubclasses ? (
              <div className="modern-card text-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400">Carregando...</p>
              </div>
            ) : (
              <>
                {subclasses.map((sub: any) => (
                  <motion.div
                    key={sub.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedSubclass(sub)}
                    className={`modern-card cursor-pointer transition-all ${
                      selectedSubclass?.id === sub.id ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-white mb-1">{sub.name}</h3>
                        <p className="text-xs text-slate-400">{sub.code}</p>
                      </div>
                    </div>
                    
                    {sub.description && (
                      <p className="text-sm text-slate-400 mb-3">{sub.description}</p>
                    )}

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-700/50">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-sm text-slate-300">
                        Produtividade: {(sub.productivityMultiplier * 100).toFixed(0)}%
                      </span>
                    </div>
                  </motion.div>
                ))}

                {subclasses.length === 0 && (
                  <div className="modern-card text-center py-12">
                    <Layers className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">Nenhuma subclasse</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* COLUNA 3: Etapas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Etapas</h2>
              {selectedSubclass && (
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nova Etapa
                </Button>
              )}
            </div>

            {!selectedSubclass ? (
              <div className="modern-card text-center py-12">
                <ChevronRight className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Selecione uma subclasse</p>
              </div>
            ) : loadingSteps ? (
              <div className="modern-card text-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400">Carregando...</p>
              </div>
            ) : (
              <>
                {steps.map((step: any, index: number) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="modern-card"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">{step.stepOrder}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">{step.name}</h3>
                          <Badge 
                            variant="outline" 
                            className={`text-xs mt-1 ${STEP_TYPE_COLORS[step.stepType] || ''}`}
                          >
                            {STEP_TYPE_LABELS[step.stepType]}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {step.description && (
                      <p className="text-xs text-slate-400 mb-3">{step.description}</p>
                    )}

                    <div className="space-y-2">
                      {/* Tempo */}
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="text-slate-300">
                          {step.baseTimeMinutes} min {TIME_CALC_LABELS[step.timeCalculationType]}
                          {step.timeCalculationValue > 0 && ` (${step.timeCalculationValue})`}
                        </span>
                      </div>

                      {/* Cooldown */}
                      {step.requiresCooldown && (
                        <div className="flex items-center gap-2 text-xs">
                          <Snowflake className="w-4 h-4 text-cyan-400" />
                          <span className="text-slate-300">
                            Máx {step.maxContinuousMinutes}min • Esfriar {step.cooldownMinutes}min
                          </span>
                        </div>
                      )}

                      {/* Notas */}
                      {step.notes && (
                        <div className="mt-2 p-2 bg-slate-800/50 rounded text-xs text-slate-400">
                          <AlertCircle className="w-3 h-3 inline-block mr-1" />
                          {step.notes}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {steps.length === 0 && (
                  <div className="modern-card text-center py-12">
                    <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">Nenhuma etapa</p>
                  </div>
                )}

                {steps.length > 0 && (
                  <div className="modern-card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                    <h4 className="text-sm font-bold text-white mb-2">Tempo Total Estimado</h4>
                    <p className="text-xs text-slate-400 mb-3">
                      Para 15m², 3 andares (exemplo)
                    </p>
                    <div className="text-3xl font-bold text-primary">
                      ~{Math.ceil(
                        steps.reduce((total: number, s: any) => {
                          let time = s.baseTimeMinutes || 0;
                          if (s.timeCalculationType === "PER_M2") time = 15 * (s.timeCalculationValue || 0);
                          if (s.timeCalculationType === "PER_FLOOR") time = 3 * (s.timeCalculationValue || 0);
                          return total + time;
                        }, 0) / 60
                      )} horas
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      ({steps.reduce((total: number, s: any) => {
                        let time = s.baseTimeMinutes || 0;
                        if (s.timeCalculationType === "PER_M2") time = 15 * (s.timeCalculationValue || 0);
                        if (s.timeCalculationType === "PER_FLOOR") time = 3 * (s.timeCalculationValue || 0);
                        return total + time;
                      }, 0)} minutos)
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
