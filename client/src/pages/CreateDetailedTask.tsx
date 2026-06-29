import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { 
  ArrowLeft, 
  Calculator, 
  Clock, 
  Package, 
  Layers,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function CreateDetailedTask() {
  const [, navigate] = useLocation();
  const [selectedWorkId, setSelectedWorkId] = useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedSubclassId, setSelectedSubclassId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    taskName: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    area: 0,
    height: 0,
    width: 0,
    floors: 1,
    team: "",
    numberOfEmployees: 1,
    weather: "",
    temperature: 25,
  });

  const [calculatedRequirements, setCalculatedRequirements] = useState<any>(null);

  // Queries
  const { data: works = [] } = trpc.works.getAll.useQuery();
  const { data: classes = [] } = trpc.taskClasses.getAll.useQuery();
  const { data: subclasses = [] } = trpc.taskSubclasses.getByClass.useQuery(
    { classId: selectedClassId! },
    { enabled: !!selectedClassId }
  );

  const calculateMutation = trpc.detailedTasks.calculateRequirements.useQuery(
    {
      subclassId: selectedSubclassId!,
      area: formData.area,
      floors: formData.floors,
    },
    {
      enabled: !!selectedSubclassId && formData.area > 0,
    }
  );

  const createMutation = trpc.detailedTasks.create.useMutation({
    onSuccess: () => {
      toast.success("Tarefa criada com sucesso!");
      navigate("/daily");
    },
    onError: (error) => {
      toast.error("Erro ao criar tarefa: " + error.message);
    },
  });

  useEffect(() => {
    if (calculateMutation.data) {
      setCalculatedRequirements(calculateMutation.data);
    }
  }, [calculateMutation.data]);

  useEffect(() => {
    // Calcular área automaticamente se altura e largura forem fornecidas
    if (formData.height > 0 && formData.width > 0) {
      setFormData(prev => ({
        ...prev,
        area: prev.height * prev.width,
      }));
    }
  }, [formData.height, formData.width]);

  useEffect(() => {
    // Calcular número de andares baseado na altura
    if (formData.height > 0) {
      const floors = Math.ceil(formData.height / 2); // 2m por andar
      setFormData(prev => ({
        ...prev,
        floors,
      }));
    }
  }, [formData.height]);

  const handleSubmit = () => {
    if (!selectedWorkId) {
      toast.error("Selecione uma obra");
      return;
    }
    if (!selectedClassId || !selectedSubclassId) {
      toast.error("Selecione classe e subclasse");
      return;
    }
    if (!formData.taskName) {
      toast.error("Informe o nome da tarefa");
      return;
    }
    if (formData.area <= 0) {
      toast.error("Informe a área ou dimensões");
      return;
    }

    createMutation.mutate({
      workId: selectedWorkId,
      date: formData.date,
      classId: selectedClassId,
      subclassId: selectedSubclassId,
      taskName: formData.taskName,
      description: formData.description,
      area: formData.area,
      height: formData.height,
      width: formData.width,
      floors: formData.floors,
      team: formData.team,
      numberOfEmployees: formData.numberOfEmployees,
      weather: formData.weather,
      temperature: formData.temperature,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            className="mb-4 gap-2"
            onClick={() => navigate("/task-templates")}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Templates
          </Button>
          <h1 className="section-title mb-2">Nova Tarefa Detalhada</h1>
          <p className="section-subtitle">
            Crie uma tarefa com cálculo automático de tempo, materiais e equipamentos
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* COLUNA ESQUERDA: Formulário */}
          <div className="space-y-6">
            {/* Obra e Data */}
            <div className="modern-card p-6">
              <h2 className="text-lg font-bold text-white mb-4">Informações Básicas</h2>
              
              <div className="space-y-4">
                <div>
                  <Label>Obra *</Label>
                  <Select
                    value={selectedWorkId?.toString()}
                    onValueChange={(value) => setSelectedWorkId(Number(value))}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Selecione a obra" />
                    </SelectTrigger>
                    <SelectContent>
                      {works.map((work: any) => (
                        <SelectItem key={work.id} value={work.id.toString()}>
                          {work.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Data *</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Nome da Tarefa *</Label>
                  <Input
                    placeholder="Ex: Limpeza Parede Externa Bloco A"
                    value={formData.taskName}
                    onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    placeholder="Detalhes adicionais..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1.5"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Tipo de Tarefa */}
            <div className="modern-card p-6">
              <h2 className="text-lg font-bold text-white mb-4">Tipo de Tarefa</h2>
              
              <div className="space-y-4">
                <div>
                  <Label>Classe *</Label>
                  <Select
                    value={selectedClassId?.toString()}
                    onValueChange={(value) => {
                      setSelectedClassId(Number(value));
                      setSelectedSubclassId(null);
                    }}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Selecione a classe" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls: any) => (
                        <SelectItem key={cls.id} value={cls.id.toString()}>
                          {cls.name} ({cls.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedClassId && (
                  <div>
                    <Label>Subclasse *</Label>
                    <Select
                      value={selectedSubclassId?.toString()}
                      onValueChange={(value) => setSelectedSubclassId(Number(value))}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Selecione a subclasse" />
                      </SelectTrigger>
                      <SelectContent>
                        {subclasses.map((sub: any) => (
                          <SelectItem key={sub.id} value={sub.id.toString()}>
                            {sub.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Dimensões */}
            <div className="modern-card p-6">
              <h2 className="text-lg font-bold text-white mb-4">Dimensões</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Altura (m)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.height || ''}
                    onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Largura (m)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.width || ''}
                    onChange={(e) => setFormData({ ...formData, width: Number(e.target.value) })}
                    className="mt-1.5"
                  />
                </div>

                <div className="col-span-2">
                  <Label>Área Total (m²)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.area || ''}
                    onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
                    className="mt-1.5"
                    placeholder="Calculado automaticamente"
                  />
                  {formData.height > 0 && formData.width > 0 && (
                    <p className="text-xs text-green-400 mt-1">
                      ✓ Calculado: {formData.height} × {formData.width} = {formData.area} m²
                    </p>
                  )}
                </div>

                <div className="col-span-2">
                  <Label>Andares de Andaime</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.floors}
                    onChange={(e) => setFormData({ ...formData, floors: Number(e.target.value) })}
                    className="mt-1.5"
                  />
                  {formData.height > 0 && (
                    <p className="text-xs text-slate-400 mt-1">
                      Sugestão: {Math.ceil(formData.height / 2)} andares (altura {formData.height}m ÷ 2m por andar)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Equipe e Condições */}
            <div className="modern-card p-6">
              <h2 className="text-lg font-bold text-white mb-4">Equipe e Condições</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Equipe</Label>
                  <Input
                    placeholder="Ex: Equipe Alpha"
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Funcionários</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.numberOfEmployees}
                    onChange={(e) => setFormData({ ...formData, numberOfEmployees: Number(e.target.value) })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Temperatura (°C)</Label>
                  <Input
                    type="number"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: Number(e.target.value) })}
                    className="mt-1.5"
                  />
                </div>

                <div className="col-span-2">
                  <Label>Clima</Label>
                  <Select
                    value={formData.weather}
                    onValueChange={(value) => setFormData({ ...formData, weather: value })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Selecione o clima" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ensolarado">☀️ Ensolarado</SelectItem>
                      <SelectItem value="Nublado">☁️ Nublado</SelectItem>
                      <SelectItem value="Chuvoso">🌧️ Chuvoso</SelectItem>
                      <SelectItem value="Ventoso">💨 Ventoso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: Cálculos */}
          <div className="space-y-6">
            {!selectedSubclassId || formData.area <= 0 ? (
              <div className="modern-card p-12 text-center">
                <Calculator className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">Configure a tarefa e dimensões</p>
                <p className="text-xs text-slate-500">
                  Selecione classe, subclasse e informe as dimensões para ver os cálculos
                </p>
              </div>
            ) : calculateMutation.isLoading ? (
              <div className="modern-card p-12 text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400">Calculando...</p>
              </div>
            ) : calculatedRequirements ? (
              <>
                {/* Tempo Total */}
                <div className="modern-card p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm text-slate-400">Tempo Total Estimado</h3>
                      <p className="text-3xl font-bold text-primary">
                        {Math.ceil(calculatedRequirements.totalTime / 60)} horas
                      </p>
                      <p className="text-xs text-slate-500">
                        ({calculatedRequirements.totalTime} minutos)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-primary/20">
                    {calculatedRequirements.breakdown.map((step: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">{step.stepName}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {step.stepType}
                          </Badge>
                          <span className="font-semibold text-primary">
                            {step.timeMinutes} min
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Equipamentos */}
                <div className="modern-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-bold text-white">
                      Equipamentos ({calculatedRequirements.equipments.length})
                    </h3>
                  </div>
                  
                  {calculatedRequirements.equipments.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">
                      Nenhum equipamento necessário
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {calculatedRequirements.equipments.map((eq: any, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-800/50 rounded-lg">
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-sm font-medium text-white">
                              {eq.quantity}× {eq.equipmentId}
                            </span>
                            {eq.required && (
                              <Badge variant="outline" className="text-xs bg-red-500/10 text-red-400">
                                Obrigatório
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">
                            Para: {eq.stepName}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Materiais */}
                <div className="modern-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Layers className="w-5 h-5 text-green-400" />
                    <h3 className="text-lg font-bold text-white">
                      Materiais ({calculatedRequirements.materials.length})
                    </h3>
                  </div>
                  
                  {calculatedRequirements.materials.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">
                      Nenhum material necessário
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {calculatedRequirements.materials.map((mat: any, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-800/50 rounded-lg">
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-sm font-medium text-white">
                              {mat.calculatedQuantity.toFixed(1)} {mat.unit} - {mat.materialName}
                            </span>
                            {mat.required && (
                              <Badge variant="outline" className="text-xs bg-red-500/10 text-red-400">
                                Obrigatório
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span>{mat.materialCategory}</span>
                            <span>•</span>
                            <span>Para: {mat.stepName}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Alertas */}
                {calculatedRequirements.breakdown.some((s: any) => s.requiresCooldown) && (
                  <div className="modern-card p-4 bg-yellow-500/10 border-yellow-500/20">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-yellow-400 mb-1">
                          Atenção: Equipamento com Restrição
                        </h4>
                        <p className="text-xs text-yellow-200/80">
                          Algum equipamento requer tempo de resfriamento. Verifique o breakdown para detalhes.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : null}

            {/* Botão de Criar */}
            {selectedSubclassId && formData.area > 0 && (
              <Button
                size="lg"
                className="w-full gap-2"
                onClick={handleSubmit}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Criar Tarefa Detalhada
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
