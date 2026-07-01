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
  Wrench,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

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
  const [selectedStep, setSelectedStep] = useState<any>(null);

  // PASSO 8: Estados para CRUD de Classes
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [requiresSafetyMeeting, setRequiresSafetyMeeting] = useState(false);

  // PASSO 9: Estados para CRUD de Subclasses
  const [isSubclassDialogOpen, setIsSubclassDialogOpen] = useState(false);
  const [editingSubclass, setEditingSubclass] = useState<any>(null);

  // PASSO 10: Estados para CRUD de Steps
  const [isStepDialogOpen, setIsStepDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<any>(null);
  const [requiresCooldown, setRequiresCooldown] = useState(false);

  const { data: classes = [], isLoading: loadingClasses, refetch: refetchClasses } = trpc.taskClasses.getAll.useQuery();
  const { data: subclasses = [], isLoading: loadingSubclasses, refetch: refetchSubclasses } = trpc.taskSubclasses.getByClass.useQuery(
    { classId: selectedClass?.id },
    { enabled: !!selectedClass }
  );
  const { data: steps = [], isLoading: loadingSteps, refetch: refetchSteps } = trpc.taskSteps.getBySubclass.useQuery(
    { subclassId: selectedSubclass?.id },
    { enabled: !!selectedSubclass }
  );

  // PASSO 6: Buscar equipamentos e materiais do step selecionado
  const { data: stepEquipments = [], isLoading: loadingStepEquipments } = trpc.stepEquipments.getByStep.useQuery(
    { stepId: selectedStep?.id },
    { enabled: !!selectedStep }
  );

  const { data: stepMaterials = [], isLoading: loadingStepMaterials } = trpc.stepMaterials.getByStep.useQuery(
    { stepId: selectedStep?.id },
    { enabled: !!selectedStep }
  );

  // PASSO 8: Mutations para CRUD de Classes
  const createClass = trpc.taskClasses.create.useMutation({
    onSuccess: () => {
      refetchClasses();
      toast.success("Classe criada com sucesso!");
      setIsClassDialogOpen(false);
      setEditingClass(null);
    },
    onError: (error) => {
      toast.error(`Erro ao criar classe: ${error.message}`);
    },
  });

  const updateClass = trpc.taskClasses.update.useMutation({
    onSuccess: () => {
      refetchClasses();
      toast.success("Classe atualizada com sucesso!");
      setIsClassDialogOpen(false);
      setEditingClass(null);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar classe: ${error.message}`);
    },
  });

  const deleteClass = trpc.taskClasses.delete.useMutation({
    onSuccess: () => {
      refetchClasses();
      toast.success("Classe deletada com sucesso!");
      if (selectedClass?.id === editingClass?.id) {
        setSelectedClass(null);
        setSelectedSubclass(null);
        setSelectedStep(null);
      }
    },
    onError: (error) => {
      if (error.message.includes("foreign key") || error.message.includes("FOREIGN KEY")) {
        toast.error("Não é possível deletar. Esta classe possui subclasses ou está sendo usada em tarefas.");
      } else {
        toast.error(`Erro ao deletar classe: ${error.message}`);
      }
    },
  });

  // PASSO 8: Handler para submit do formulário de classe
  const handleSubmitClass = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      name: formData.get("name") as string,
      code: formData.get("code") as string,
      category: formData.get("category") as string,
      description: (formData.get("description") as string) || undefined,
      requiresScaffolding: formData.get("requiresScaffolding") === "on",
      requiresSafetyMeeting: formData.get("requiresSafetyMeeting") === "on",
      safetyMeetingMinutes: formData.get("safetyMeetingMinutes") 
        ? parseInt(formData.get("safetyMeetingMinutes") as string) 
        : undefined,
      baseProductivity: formData.get("baseProductivity") 
        ? parseFloat(formData.get("baseProductivity") as string) 
        : undefined,
    };

    if (editingClass) {
      updateClass.mutate({ id: editingClass.id, ...data });
    } else {
      createClass.mutate(data);
    }
  };

  // PASSO 8: Handler para abrir dialog de edição
  const handleEditClass = (cls: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingClass(cls);
    setRequiresSafetyMeeting(cls.requiresSafetyMeeting || false);
    setIsClassDialogOpen(true);
  };

  // PASSO 8: Handler para deletar classe
  const handleDeleteClass = (cls: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Tem certeza que deseja deletar a classe "${cls.name}"?\n\nEsta ação não pode ser desfeita.`)) {
      deleteClass.mutate({ id: cls.id });
    }
  };

  // PASSO 9: Mutations para CRUD de Subclasses
  const createSubclass = trpc.taskSubclasses.create.useMutation({
    onSuccess: () => {
      refetchSubclasses();
      toast.success("Subclasse criada com sucesso!");
      setIsSubclassDialogOpen(false);
      setEditingSubclass(null);
    },
    onError: (error) => {
      toast.error(`Erro ao criar subclasse: ${error.message}`);
    },
  });

  const updateSubclass = trpc.taskSubclasses.update.useMutation({
    onSuccess: () => {
      refetchSubclasses();
      toast.success("Subclasse atualizada com sucesso!");
      setIsSubclassDialogOpen(false);
      setEditingSubclass(null);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar subclasse: ${error.message}`);
    },
  });

  const deleteSubclass = trpc.taskSubclasses.delete.useMutation({
    onSuccess: () => {
      refetchSubclasses();
      toast.success("Subclasse deletada com sucesso!");
      if (selectedSubclass?.id === editingSubclass?.id) {
        setSelectedSubclass(null);
        setSelectedStep(null);
      }
    },
    onError: (error) => {
      if (error.message.includes("foreign key") || error.message.includes("FOREIGN KEY")) {
        toast.error("Não é possível deletar. Esta subclasse possui etapas ou está sendo usada em tarefas.");
      } else {
        toast.error(`Erro ao deletar subclasse: ${error.message}`);
      }
    },
  });

  // PASSO 9: Handler para submit do formulário de subclasse
  const handleSubmitSubclass = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedClass) {
      toast.error("Selecione uma classe primeiro!");
      return;
    }
    
    const formData = new FormData(e.currentTarget);
    
    const data = {
      classId: selectedClass.id,
      name: formData.get("name") as string,
      code: formData.get("code") as string,
      description: (formData.get("description") as string) || undefined,
      productivityMultiplier: formData.get("productivityMultiplier") 
        ? parseFloat(formData.get("productivityMultiplier") as string) 
        : 1.0,
    };

    if (editingSubclass) {
      updateSubclass.mutate({ id: editingSubclass.id, ...data });
    } else {
      createSubclass.mutate(data);
    }
  };

  // PASSO 9: Handler para abrir dialog de edição de subclasse
  const handleEditSubclass = (sub: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSubclass(sub);
    setIsSubclassDialogOpen(true);
  };

  // PASSO 9: Handler para deletar subclasse
  const handleDeleteSubclass = (sub: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Tem certeza que deseja deletar a subclasse "${sub.name}"?\n\nEsta ação não pode ser desfeita.`)) {
      deleteSubclass.mutate({ id: sub.id });
    }
  };

  // PASSO 10: Mutations para CRUD de Steps
  const createStep = trpc.taskSteps.create.useMutation({
    onSuccess: () => {
      refetchSteps();
      toast.success("Etapa criada com sucesso!");
      setIsStepDialogOpen(false);
      setEditingStep(null);
    },
    onError: (error) => {
      toast.error(`Erro ao criar etapa: ${error.message}`);
    },
  });

  const updateStep = trpc.taskSteps.update.useMutation({
    onSuccess: () => {
      refetchSteps();
      toast.success("Etapa atualizada com sucesso!");
      setIsStepDialogOpen(false);
      setEditingStep(null);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar etapa: ${error.message}`);
    },
  });

  const deleteStep = trpc.taskSteps.delete.useMutation({
    onSuccess: () => {
      refetchSteps();
      toast.success("Etapa deletada com sucesso!");
      if (selectedStep?.id === editingStep?.id) {
        setSelectedStep(null);
      }
    },
    onError: (error) => {
      if (error.message.includes("foreign key") || error.message.includes("FOREIGN KEY")) {
        toast.error("Não é possível deletar. Esta etapa está sendo usada em tarefas.");
      } else {
        toast.error(`Erro ao deletar etapa: ${error.message}`);
      }
    },
  });

  // PASSO 10: Handler para submit do formulário de step
  const handleSubmitStep = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedSubclass) {
      toast.error("Selecione uma subclasse primeiro!");
      return;
    }
    
    const formData = new FormData(e.currentTarget);
    
    const data = {
      subclassId: selectedSubclass.id,
      name: formData.get("name") as string,
      stepOrder: parseInt(formData.get("stepOrder") as string),
      stepType: formData.get("stepType") as any,
      baseTimeMinutes: formData.get("baseTimeMinutes") 
        ? parseInt(formData.get("baseTimeMinutes") as string) 
        : undefined,
      timeCalculationType: formData.get("timeCalculationType") as any,
      timeCalculationValue: formData.get("timeCalculationValue") 
        ? parseFloat(formData.get("timeCalculationValue") as string) 
        : undefined,
      requiresCooldown: formData.get("requiresCooldown") === "on",
      cooldownMinutes: formData.get("cooldownMinutes") 
        ? parseInt(formData.get("cooldownMinutes") as string) 
        : undefined,
      maxContinuousMinutes: formData.get("maxContinuousMinutes") 
        ? parseInt(formData.get("maxContinuousMinutes") as string) 
        : undefined,
      description: (formData.get("description") as string) || undefined,
      notes: (formData.get("notes") as string) || undefined,
    };

    if (editingStep) {
      updateStep.mutate({ id: editingStep.id, ...data });
    } else {
      createStep.mutate(data);
    }
  };

  // PASSO 10: Handler para abrir dialog de edição de step
  const handleEditStep = (step: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingStep(step);
    setRequiresCooldown(step.requiresCooldown || false);
    setIsStepDialogOpen(true);
  };

  // PASSO 10: Handler para deletar step
  const handleDeleteStep = (step: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Tem certeza que deseja deletar a etapa "${step.name}"?\n\nEsta ação não pode ser desfeita.`)) {
      deleteStep.mutate({ id: step.id });
    }
  };

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
              <Button 
                size="sm" 
                className="gap-2"
                onClick={() => {
                  setEditingClass(null);
                  setRequiresSafetyMeeting(false);
                  setIsClassDialogOpen(true);
                }}
              >
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
                className={`modern-card cursor-pointer transition-all relative ${
                  selectedClass?.id === cls.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                {/* PASSO 8: Botões de ação */}
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => handleEditClass(cls, e)}
                    className="h-8 w-8 hover:bg-primary/20"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => handleDeleteClass(cls, e)}
                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 pr-16">
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
                <Button 
                  size="sm" 
                  className="gap-2"
                  onClick={() => {
                    setEditingSubclass(null);
                    setIsSubclassDialogOpen(true);
                  }}
                >
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
                    className={`modern-card cursor-pointer transition-all relative ${
                      selectedSubclass?.id === sub.id ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    {/* PASSO 9: Botões de ação */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => handleEditSubclass(sub, e)}
                        className="h-8 w-8 hover:bg-primary/20"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => handleDeleteSubclass(sub, e)}
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 pr-16">
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
                <Button 
                  size="sm" 
                  className="gap-2"
                  onClick={() => {
                    setEditingStep(null);
                    setRequiresCooldown(false);
                    setIsStepDialogOpen(true);
                  }}
                >
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
                    onClick={() => setSelectedStep(step)}
                    className={`modern-card cursor-pointer transition-all relative ${
                      selectedStep?.id === step.id ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    {/* PASSO 10: Botões de ação */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => handleEditStep(step, e)}
                        className="h-8 w-8 hover:bg-primary/20"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => handleDeleteStep(step, e)}
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 pr-16">
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

                {/* PASSO 6: Card de Recursos Necessários */}
                {selectedStep && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="modern-card bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20"
                  >
                    <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      Recursos Necessários
                    </h4>
                    <p className="text-xs text-slate-400 mb-4">
                      Etapa: <span className="text-primary font-semibold">{selectedStep.name}</span>
                    </p>

                    {/* Equipamentos */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                          <Wrench className="w-4 h-4" />
                          Equipamentos
                        </label>
                      </div>
                      
                      {loadingStepEquipments ? (
                        <div className="text-center py-4">
                          <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                      ) : stepEquipments.length > 0 ? (
                        <div className="space-y-2">
                          {stepEquipments.map((se: any) => (
                            <div
                              key={se.id}
                              className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <Wrench className="w-4 h-4 text-purple-400" />
                                <span className="text-sm text-slate-200">
                                  {se.equipment?.name || `Equipamento #${se.equipmentId}`}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  Qtd: {se.quantity}
                                </Badge>
                                {se.required && (
                                  <Badge variant="destructive" className="text-xs">
                                    Obrigatório
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic py-2">
                          Nenhum equipamento vinculado
                        </p>
                      )}
                    </div>

                    {/* Materiais */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Materiais
                        </label>
                      </div>
                      
                      {loadingStepMaterials ? (
                        <div className="text-center py-4">
                          <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                        </div>
                      ) : stepMaterials.length > 0 ? (
                        <div className="space-y-2">
                          {stepMaterials.map((sm: any) => (
                            <div
                              key={sm.id}
                              className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-cyan-400" />
                                <span className="text-sm text-slate-200">{sm.materialName}</span>
                                <Badge variant="outline" className="text-xs">
                                  {sm.quantity} {sm.unit}
                                </Badge>
                                {sm.required && (
                                  <Badge variant="destructive" className="text-xs">
                                    Obrigatório
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic py-2">
                          Nenhum material vinculado
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

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

      {/* PASSO 8: Dialog de CRUD de Classes */}
      <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingClass ? "Editar Classe" : "Nova Classe"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitClass}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  required 
                  defaultValue={editingClass?.name}
                  placeholder="Ex: Limpeza de Fachada"
                />
              </div>
              
              <div>
                <Label htmlFor="code">Código *</Label>
                <Input 
                  id="code" 
                  name="code" 
                  required 
                  defaultValue={editingClass?.code}
                  placeholder="Ex: LF-001"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Select name="category" defaultValue={editingClass?.category || "Limpeza"}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Limpeza">Limpeza</SelectItem>
                    <SelectItem value="Pintura">Pintura</SelectItem>
                    <SelectItem value="Preparação">Preparação</SelectItem>
                    <SelectItem value="Acabamento">Acabamento</SelectItem>
                    <SelectItem value="Estrutural">Estrutural</SelectItem>
                    <SelectItem value="Revestimento">Revestimento</SelectItem>
                    <SelectItem value="Impermeabilização">Impermeabilização</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="baseProductivity">Produtividade Base (m²/dia)</Label>
                <Input 
                  id="baseProductivity" 
                  name="baseProductivity" 
                  type="number" 
                  step="0.1" 
                  defaultValue={editingClass?.baseProductivity || 20}
                  placeholder="Ex: 20"
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  defaultValue={editingClass?.description}
                  placeholder="Descreva a classe de tarefa..."
                  rows={3}
                />
              </div>
              
              <div className="col-span-2 space-y-3 pt-3 border-t border-slate-700/50">
                <div className="flex items-start gap-3">
                  <Checkbox 
                    id="requiresScaffolding" 
                    name="requiresScaffolding"
                    defaultChecked={editingClass?.requiresScaffolding}
                  />
                  <div className="flex-1">
                    <Label htmlFor="requiresScaffolding" className="cursor-pointer font-semibold">
                      Requer Andaime
                    </Label>
                    <p className="text-xs text-slate-400 mt-1">
                      Marque se esta classe de tarefa necessita montagem de andaime
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Checkbox 
                    id="requiresSafetyMeeting" 
                    name="requiresSafetyMeeting"
                    defaultChecked={editingClass?.requiresSafetyMeeting}
                    onCheckedChange={(checked) => setRequiresSafetyMeeting(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="requiresSafetyMeeting" className="cursor-pointer font-semibold">
                      Requer Reunião de Segurança
                    </Label>
                    <p className="text-xs text-slate-400 mt-1">
                      Marque se é necessário realizar reunião de segurança antes de iniciar
                    </p>
                  </div>
                </div>
                
                {requiresSafetyMeeting && (
                  <div className="ml-8">
                    <Label htmlFor="safetyMeetingMinutes">Duração da Reunião (minutos)</Label>
                    <Input 
                      id="safetyMeetingMinutes" 
                      name="safetyMeetingMinutes" 
                      type="number" 
                      defaultValue={editingClass?.safetyMeetingMinutes || 15}
                      placeholder="Ex: 15"
                      className="mt-2"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter className="gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsClassDialogOpen(false);
                  setEditingClass(null);
                }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={createClass.isPending || updateClass.isPending}
              >
                {(createClass.isPending || updateClass.isPending) ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  editingClass ? "Atualizar" : "Criar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* PASSO 9: Dialog de CRUD de Subclasses */}
      <Dialog open={isSubclassDialogOpen} onOpenChange={setIsSubclassDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSubclass ? "Editar Subclasse" : "Nova Subclasse"}
            </DialogTitle>
            {selectedClass && (
              <p className="text-sm text-slate-400 mt-2">
                Classe: <span className="text-primary font-semibold">{selectedClass.name}</span>
              </p>
            )}
          </DialogHeader>
          
          <form onSubmit={handleSubmitSubclass}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="subclass-name">Nome *</Label>
                <Input 
                  id="subclass-name" 
                  name="name" 
                  required 
                  defaultValue={editingSubclass?.name}
                  placeholder="Ex: Limpeza com Hidrojateamento"
                />
              </div>
              
              <div>
                <Label htmlFor="subclass-code">Código *</Label>
                <Input 
                  id="subclass-code" 
                  name="code" 
                  required 
                  defaultValue={editingSubclass?.code}
                  placeholder="Ex: LF-HJ-001"
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="productivityMultiplier">Multiplicador de Produtividade</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Input 
                    id="productivityMultiplier" 
                    name="productivityMultiplier" 
                    type="number" 
                    step="0.01" 
                    min="0.1"
                    max="3.0"
                    defaultValue={editingSubclass?.productivityMultiplier || 1.0}
                    className="w-32"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-slate-400">
                      Ajusta a produtividade base da classe. 
                      <span className="block mt-1">
                        • <span className="text-green-400">1.0 = 100%</span> (padrão)
                        • <span className="text-yellow-400">&lt; 1.0 = mais lento</span> (ex: 0.8 = 80%)
                        • <span className="text-blue-400">&gt; 1.0 = mais rápido</span> (ex: 1.5 = 150%)
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="subclass-description">Descrição</Label>
                <Textarea 
                  id="subclass-description" 
                  name="description" 
                  defaultValue={editingSubclass?.description}
                  placeholder="Descreva as características específicas desta subclasse..."
                  rows={4}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Dica: Descreva quando usar esta subclasse ao invés de outras da mesma classe
                </p>
              </div>
            </div>
            
            <DialogFooter className="gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsSubclassDialogOpen(false);
                  setEditingSubclass(null);
                }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={createSubclass.isPending || updateSubclass.isPending}
              >
                {(createSubclass.isPending || updateSubclass.isPending) ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  editingSubclass ? "Atualizar" : "Criar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* PASSO 10: Dialog de CRUD de Steps */}
      <Dialog open={isStepDialogOpen} onOpenChange={setIsStepDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStep ? "Editar Etapa" : "Nova Etapa"}
            </DialogTitle>
            {selectedSubclass && (
              <p className="text-sm text-slate-400 mt-2">
                Subclasse: <span className="text-primary font-semibold">{selectedSubclass.name}</span>
              </p>
            )}
          </DialogHeader>
          
          <form onSubmit={handleSubmitStep}>
            <div className="grid grid-cols-2 gap-4 py-4">
              {/* Nome e Ordem */}
              <div>
                <Label htmlFor="step-name">Nome *</Label>
                <Input 
                  id="step-name" 
                  name="name" 
                  required 
                  defaultValue={editingStep?.name}
                  placeholder="Ex: Preparar Equipamentos"
                />
              </div>
              
              <div>
                <Label htmlFor="stepOrder">Ordem *</Label>
                <Input 
                  id="stepOrder" 
                  name="stepOrder" 
                  type="number"
                  min="1"
                  required 
                  defaultValue={editingStep?.stepOrder || (steps.length + 1)}
                  placeholder="1, 2, 3..."
                />
              </div>

              {/* Tipo de Etapa */}
              <div className="col-span-2">
                <Label htmlFor="stepType">Tipo de Etapa *</Label>
                <Select name="stepType" defaultValue={editingStep?.stepType || "EXECUTION"}>
                  <SelectTrigger id="stepType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAFETY_MEETING">🟡 Reunião de Segurança</SelectItem>
                    <SelectItem value="PREPARATION">🔵 Preparação</SelectItem>
                    <SelectItem value="EQUIPMENT_SETUP">🟣 Montagem de Equipamentos</SelectItem>
                    <SelectItem value="SCAFFOLDING">🟠 Andaime</SelectItem>
                    <SelectItem value="EPIs">🟢 EPIs</SelectItem>
                    <SelectItem value="EXECUTION">⚡ Execução</SelectItem>
                    <SelectItem value="BREAK">⚪ Pausa/Descanso</SelectItem>
                    <SelectItem value="CLEANUP">🔵 Limpeza</SelectItem>
                    <SelectItem value="INSPECTION">🌸 Inspeção</SelectItem>
                    <SelectItem value="EQUIPMENT_TEARDOWN">🔴 Desmontagem</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tempo Base */}
              <div>
                <Label htmlFor="baseTimeMinutes">Tempo Base (minutos)</Label>
                <Input 
                  id="baseTimeMinutes" 
                  name="baseTimeMinutes" 
                  type="number"
                  min="0"
                  defaultValue={editingStep?.baseTimeMinutes || 30}
                  placeholder="30"
                />
              </div>

              {/* Tipo de Cálculo */}
              <div>
                <Label htmlFor="timeCalculationType">Tipo de Cálculo *</Label>
                <Select name="timeCalculationType" defaultValue={editingStep?.timeCalculationType || "FIXED"}>
                  <SelectTrigger id="timeCalculationType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIXED">⏱️ Tempo Fixo</SelectItem>
                    <SelectItem value="PER_M2">📏 Por m²</SelectItem>
                    <SelectItem value="PER_FLOOR">🏢 Por Andar</SelectItem>
                    <SelectItem value="PER_EQUIPMENT">🔧 Por Equipamento</SelectItem>
                    <SelectItem value="PERCENTAGE_EXECUTION">📊 % da Execução</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Valor do Cálculo */}
              <div className="col-span-2">
                <Label htmlFor="timeCalculationValue">Valor do Cálculo</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Input 
                    id="timeCalculationValue" 
                    name="timeCalculationValue" 
                    type="number"
                    step="0.1"
                    min="0"
                    defaultValue={editingStep?.timeCalculationValue || 0}
                    className="w-32"
                  />
                  <p className="text-xs text-slate-400 flex-1">
                    • <strong>FIXED:</strong> Ignorado (usa tempo base)
                    • <strong>PER_M2:</strong> minutos por m² (ex: 2.5)
                    • <strong>PER_FLOOR:</strong> minutos por andar (ex: 30)
                    • <strong>PERCENTAGE_EXECUTION:</strong> % do tempo de execução (ex: 10 = 10%)
                  </p>
                </div>
              </div>

              {/* Cooldown */}
              <div className="col-span-2 pt-3 border-t border-slate-700/50">
                <div className="flex items-start gap-3">
                  <Checkbox 
                    id="requiresCooldown" 
                    name="requiresCooldown"
                    defaultChecked={editingStep?.requiresCooldown}
                    onCheckedChange={(checked) => setRequiresCooldown(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="requiresCooldown" className="cursor-pointer font-semibold">
                      Requer Período de Esfriamento (Cooldown)
                    </Label>
                    <p className="text-xs text-slate-400 mt-1">
                      Para tarefas que não podem ser feitas continuamente (ex: pintura em clima quente)
                    </p>
                  </div>
                </div>
                
                {requiresCooldown && (
                  <div className="grid grid-cols-2 gap-4 mt-4 ml-8">
                    <div>
                      <Label htmlFor="maxContinuousMinutes">Tempo Máximo Contínuo (min)</Label>
                      <Input 
                        id="maxContinuousMinutes" 
                        name="maxContinuousMinutes" 
                        type="number"
                        min="1"
                        defaultValue={editingStep?.maxContinuousMinutes || 60}
                        placeholder="60"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cooldownMinutes">Tempo de Esfriamento (min)</Label>
                      <Input 
                        id="cooldownMinutes" 
                        name="cooldownMinutes" 
                        type="number"
                        min="1"
                        defaultValue={editingStep?.cooldownMinutes || 15}
                        placeholder="15"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Descrição */}
              <div className="col-span-2">
                <Label htmlFor="step-description">Descrição</Label>
                <Textarea 
                  id="step-description" 
                  name="description" 
                  defaultValue={editingStep?.description}
                  placeholder="Descreva o que deve ser feito nesta etapa..."
                  rows={2}
                />
              </div>

              {/* Notas */}
              <div className="col-span-2">
                <Label htmlFor="step-notes">Notas/Alertas</Label>
                <Textarea 
                  id="step-notes" 
                  name="notes" 
                  defaultValue={editingStep?.notes}
                  placeholder="Cuidados especiais, alertas de segurança, etc..."
                  rows={2}
                />
              </div>
            </div>
            
            <DialogFooter className="gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsStepDialogOpen(false);
                  setEditingStep(null);
                }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={createStep.isPending || updateStep.isPending}
              >
                {(createStep.isPending || updateStep.isPending) ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  editingStep ? "Atualizar" : "Criar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
