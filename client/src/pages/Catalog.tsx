import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Shield, Wrench, Droplet, Package, X, Search, Edit2, Trash2, Users, Clock, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// Dados temporários até implementar PASSO 2 e 3
const CATALOG_DATA = {
  materials: [
    { name: "Tinta Acrílica Fosca", type: "Tinta", color: "Branco", yield: 12 },
    { name: "Tinta Acrílica Brilho", type: "Tinta", color: "Branco", yield: 12 },
    { name: "Tinta Epóxi", type: "Tinta", color: "Cinza", yield: 10 },
    { name: "Tinta Poliuretano", type: "Tinta", color: "Branco", yield: 11 },
    { name: "Primer Acrílico", type: "Primer", color: "Branco", yield: 14 },
    { name: "Primer Epóxi", type: "Primer", color: "Cinza", yield: 12 },
    { name: "Massa Acrílica", type: "Massa", color: "Branco", yield: 0 },
    { name: "Massa Epóxi", type: "Massa", color: "Cinza", yield: 0 },
    { name: "Selante Poliuretano", type: "Selante", color: "Branco", yield: 0 },
    { name: "Argamassa Cal", type: "Argamassa", color: "Branco", yield: 0 },
    { name: "Resina de Injeção", type: "Resina", color: "Incolor", yield: 0 },
  ],
  equipment: [
    { name: "Andaime Metálico 5m", category: "Acesso", setupTime: 120, costPerDay: 250 },
    { name: "Andaime Metálico 10m", category: "Acesso", setupTime: 180, costPerDay: 400 },
    { name: "Andaime Suspenso", category: "Acesso", setupTime: 240, costPerDay: 600 },
    { name: "Compressor de Ar", category: "Equipamento", setupTime: 15, costPerDay: 150 },
    { name: "Gerador Elétrico", category: "Equipamento", setupTime: 20, costPerDay: 200 },
    { name: "Bomba de Água", category: "Equipamento", setupTime: 30, costPerDay: 120 },
  ],
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12
    }
  }
};

// Função helper para determinar status do estoque
const getStockStatus = (material: any) => {
  if (!material.quantityInStock || !material.minStockLevel) {
    return { color: "gray", label: "N/A", urgent: false, bgColor: "rgb(71 85 105)", borderColor: "rgb(100 116 139)" };
  }
  
  const percentage = (material.quantityInStock / material.minStockLevel) * 100;
  
  if (percentage <= 0) {
    return { 
      color: "red", 
      label: "SEM ESTOQUE", 
      urgent: true,
      bgColor: "rgb(239 68 68)",
      borderColor: "rgb(248 113 113)"
    };
  }
  if (percentage < 50) {
    return { 
      color: "orange", 
      label: "CRÍTICO", 
      urgent: true,
      bgColor: "rgb(249 115 22)",
      borderColor: "rgb(251 146 60)"
    };
  }
  if (percentage < 100) {
    return { 
      color: "yellow", 
      label: "BAIXO", 
      urgent: false,
      bgColor: "rgb(234 179 8)",
      borderColor: "rgb(250 204 21)"
    };
  }
  return { 
    color: "green", 
    label: "OK", 
    urgent: false,
    bgColor: "rgb(34 197 94)",
    borderColor: "rgb(74 222 128)"
  };
};

export default function Catalog() {
  const [activeTab, setActiveTab] = useState("epis");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkId, setSelectedWorkId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Estado para epis
  const [editingEpi, setEditingEpi] = useState<any>(null);
  const [isEpiDialogOpen, setIsEpiDialogOpen] = useState(false);
  
  // Estado para equipamentos
  const [editingEquipment, setEditingEquipment] = useState<any>(null);
  const [isEquipmentDialogOpen, setIsEquipmentDialogOpen] = useState(false);
  
  // Estado para materiais
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);
  
  // Estado para membros da equipe
  const [editingTeamMember, setEditingTeamMember] = useState<any>(null);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);

  // Buscar dados REAIS do banco de dados
  const { data: works = [] } = trpc.works.getAll.useQuery();
  const { data: episData = [], isLoading: loadingEpis, refetch: refetchEpis } = trpc.epis.getAll.useQuery();
  const { data: equipmentsData = [], isLoading: loadingEquipments, refetch: refetchEquipments } = trpc.equipments.getAll.useQuery();
  const { data: materialsData = [], isLoading: loadingMaterials, refetch: refetchMaterials } = trpc.materials.getAll.useQuery();
  const { data: teamMembersData = [], isLoading: loadingTeam, refetch: refetchTeam } = trpc.teamMembers.getAll.useQuery();
  
  // Buscar uso hoje
  const { data: usageToday } = trpc.catalog.getUsageToday.useQuery(
    { workId: selectedWorkId!,
      date: selectedDate
    },
    { enabled: selectedWorkId !== null }
  );

  // Mutations para epis
  const createEpi = trpc.epis.create.useMutation({
    onSuccess: () => {
      refetchEpis();
      toast.success("EPI criado com sucesso!");
      setIsEpiDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const updateEpi = trpc.epis.update.useMutation({
    onSuccess: () => {
      refetchEpis();
      toast.success("EPI atualizado!");
      setIsEpiDialogOpen(false);
      setEditingEpi(null);
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deleteEpi = trpc.epis.delete.useMutation({
    onSuccess: () => {
      refetchEpis();
      toast.success("EPI deletado!");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  // Mutations para equipamentos
  const createEquipment = trpc.equipments.create.useMutation({
    onSuccess: () => {
      refetchEquipments();
      toast.success("Equipamento criado com sucesso!");
      setIsEquipmentDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const updateEquipment = trpc.equipments.update.useMutation({
    onSuccess: () => {
      refetchEquipments();
      toast.success("Equipamento atualizado!");
      setIsEquipmentDialogOpen(false);
      setEditingEquipment(null);
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deleteEquipment = trpc.equipments.delete.useMutation({
    onSuccess: () => {
      refetchEquipments();
      toast.success("Equipamento deletado!");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });
  
  // Mutations para materiais
  const createMaterial = trpc.materials.create.useMutation({
    onSuccess: () => {
      refetchMaterials();
      toast.success("Material criado com sucesso!");
      setIsMaterialDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const updateMaterial = trpc.materials.update.useMutation({
    onSuccess: () => {
      refetchMaterials();
      toast.success("Material atualizado!");
      setIsMaterialDialogOpen(false);
      setEditingMaterial(null);
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deleteMaterial = trpc.materials.delete.useMutation({
    onSuccess: () => {
      refetchMaterials();
      toast.success("Material deletado!");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });
  
  // Mutations para membros da equipe
  const createTeamMember = trpc.teamMembers.create.useMutation({
    onSuccess: () => {
      refetchTeam();
      toast.success("Membro da equipe criado com sucesso!");
      setIsTeamDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const updateTeamMember = trpc.teamMembers.update.useMutation({
    onSuccess: () => {
      refetchTeam();
      toast.success("Membro da equipe atualizado!");
      setIsTeamDialogOpen(false);
      setEditingTeamMember(null);
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deleteTeamMember = trpc.teamMembers.delete.useMutation({
    onSuccess: () => {
      refetchTeam();
      toast.success("Membro da equipe deletado!");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const filterItems = (items: any[]) => {
    if (!searchTerm) return items;
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

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
          <h1 className="section-title mb-2">Catálogo de Recursos</h1>
          <p className="section-subtitle">EPIs, Ferramentas, Materiais e Equipamentos disponíveis</p>
        </motion.div>

        {/* Work and Date Selectors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="w-full sm:w-auto flex-1 max-w-xs">
              <Label htmlFor="work-selector">Selecione uma obra</Label>
              <Select 
                value={selectedWorkId?.toString() || ""} 
                onValueChange={(v) => setSelectedWorkId(v ? parseInt(v) : null)}
              >
                <SelectTrigger id="work-selector">
                  <SelectValue placeholder="Selecione uma obra" />
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

            <div className="w-full sm:w-auto max-w-xs">
              <Label htmlFor="date-selector">Data</Label>
              <Input
                id="date-selector"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Buscar item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 bg-slate-800/50 p-1 mb-8">
            <TabsTrigger value="epis" className="gap-2">
              <Shield className="w-4 h-4" />
              EPIs
            </TabsTrigger>
            <TabsTrigger value="tools" className="gap-2">
              <Wrench className="w-4 h-4" />
              Ferramentas
            </TabsTrigger>
            <TabsTrigger value="materials" className="gap-2">
              <Droplet className="w-4 h-4" />
              Materiais
            </TabsTrigger>
            <TabsTrigger value="equipment" className="gap-2">
              <Package className="w-4 h-4" />
              Equipamentos
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="w-4 h-4" />
              Equipe
            </TabsTrigger>
          </TabsList>

          {/* EPIs */}
          <TabsContent value="epis">
            {loadingEpis ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400">Carregando EPIs...</p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filterItems(episData).map((item: any, idx: number) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    onClick={() => setSelectedItem(item)}
                    className="modern-card cursor-pointer relative"
                  >
                    {/* Botões de ação */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingEpi(item);
                          setIsEpiDialogOpen(true);
                        }}
                        className="h-8 w-8"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Deletar ${item.name}?`)) {
                            deleteEpi.mutate({ id: item.id });
                          }
                        }}
                        className="h-8 w-8 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-start gap-3 mb-4">
                      <div 
                        className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0"
                        style={selectedItem === item ? { 
                          backgroundColor: 'oklch(0.84 0.19 80.45 / 0.2)',
                          border: '2px solid oklch(0.84 0.19 80.45)'
                        } : {}}
                      >
                        <Shield 
                          className="w-6 h-6"
                          style={selectedItem === item ? { color: 'oklch(0.84 0.19 80.45)' } : { color: 'rgb(96 165 250)' }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white mb-1 truncate">{item.name}</h3>
                        <p className="text-sm text-slate-400">{item.category}</p>
                      </div>
                    </div>
                    
                    {/* Informações */}
                    <div className="space-y-2 pt-3 border-t border-slate-700/50">
                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                        Unidade: {item.unit}
                      </Badge>
                      {item.costPerUnit && (
                        <Badge variant="outline" className="text-xs ml-2">
                          R$ {item.costPerUnit}/{item.unit}
                        </Badge>
                      )}
                      {item.quantityInStock !== undefined && (
                        <Badge variant="outline" className="text-xs ml-2">
                          Estoque: {item.quantityInStock}
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Botão Adicionar */}
                <motion.div
                  variants={itemVariants}
                  onClick={() => {
                    setEditingEpi(null);
                    setIsEpiDialogOpen(true);
                  }}
                  className="modern-card cursor-pointer border-dashed border-2 border-primary/30 hover:border-primary flex items-center justify-center min-h-[200px]"
                >
                  <div className="text-center">
                    <Plus className="w-12 h-12 text-primary mx-auto mb-2" />
                    <p className="text-primary font-semibold">Adicionar EPI</p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </TabsContent>

          {/* Ferramentas */}
          <TabsContent value="tools">
            {loadingEquipments ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400">Carregando equipamentos...</p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filterItems(equipmentsData).map((item: any, idx: number) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    onClick={() => setSelectedItem(item)}
                    className="modern-card cursor-pointer relative"
                  >
                    {/* Botões de ação */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingEquipment(item);
                          setIsEquipmentDialogOpen(true);
                        }}
                        className="h-8 w-8"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Deletar ${item.name}?`)) {
                            deleteEquipment.mutate({ id: item.id });
                          }
                        }}
                        className="h-8 w-8 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-start gap-3 mb-4">
                      <div 
                        className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0"
                        style={selectedItem === item ? { 
                          backgroundColor: 'oklch(0.84 0.19 80.45 / 0.2)',
                          border: '2px solid oklch(0.84 0.19 80.45)'
                        } : {}}
                      >
                        <Wrench 
                          className="w-6 h-6"
                          style={selectedItem === item ? { color: 'oklch(0.84 0.19 80.45)' } : { color: 'rgb(192 132 252)' }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white mb-1 truncate">{item.name}</h3>
                        <p className="text-sm text-slate-400">{item.category}</p>
                      </div>
                    </div>

                    {/* Informações */}
                    <div className="space-y-2 pt-3 border-t border-slate-700/50">
                      {usageToday?.equipmentsInUse.includes(item.id) && (
                        <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Em Uso Hoje
                        </Badge>
                      )}
                      {item.costPerDay && (
                        <Badge variant="outline" className="text-xs">
                          R$ {item.costPerDay}/dia
                        </Badge>
                      )}
                      {item.quantity && (
                        <Badge variant="outline" className="text-xs ml-2">
                          Qtd: {item.quantity}
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {/* Botão Adicionar */}
                <motion.div
                  variants={itemVariants}
                  onClick={() => {
                    setEditingEquipment(null);
                    setIsEquipmentDialogOpen(true);
                  }}
                  className="modern-card cursor-pointer border-dashed border-2 border-primary/30 hover:border-primary flex items-center justify-center min-h-[200px]"
                >
                  <div className="text-center">
                    <Plus className="w-12 h-12 text-primary mx-auto mb-2" />
                    <p className="text-primary font-semibold">Adicionar Equipamento</p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </TabsContent>

          {/* Materiais */}
          <TabsContent value="materials">
            {loadingMaterials ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400">Carregando materiais...</p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filterItems(materialsData).map((item: any, idx: number) => {
                  const stockStatus = getStockStatus(item);
                  
                  return (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      onClick={() => setSelectedItem(item)}
                      className="modern-card cursor-pointer relative"
                    >
                      {/* Botões de ação */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingMaterial(item);
                            setIsMaterialDialogOpen(true);
                          }}
                          className="h-8 w-8"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Deletar ${item.name}?`)) {
                              deleteMaterial.mutate({ id: item.id });
                            }
                          }}
                          className="h-8 w-8 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-start gap-3 mb-4">
                        <div 
                          className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0"
                          style={selectedItem === item ? { 
                            backgroundColor: 'oklch(0.84 0.19 80.45 / 0.2)',
                            border: '2px solid oklch(0.84 0.19 80.45)'
                          } : {}}
                        >
                          <Droplet 
                            className="w-6 h-6"
                            style={selectedItem === item ? { color: 'oklch(0.84 0.19 80.45)' } : { color: 'rgb(74 222 128)' }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white mb-1 truncate">{item.name}</h3>
                          <p className="text-sm text-slate-400">{item.category}</p>
                        </div>
                      </div>

                      {/* Informações básicas */}
                      <div className="space-y-2 pt-3 border-t border-slate-700/50 mb-3">
                        <div className="flex flex-wrap gap-2">
                          {usageToday?.materialsInUse.includes(item.id) && (
                            <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Em Uso Hoje
                            </Badge>
                          )}
                          {item.color && (
                            <Badge variant="outline" className="text-xs">
                              Cor: {item.color}
                            </Badge>
                          )}
                          {item.yieldPerUnit && (
                            <Badge variant="outline" className="text-xs">
                              Rend: {item.yieldPerUnit} m²/{item.unit}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Sistema de Estoque - PASSO 5 */}
                      {item.quantityInStock !== undefined && item.minStockLevel !== undefined && (
                        <div 
                          className="mt-4 p-3 rounded-lg border"
                          style={{
                            backgroundColor: `${stockStatus.bgColor}15`,
                            borderColor: `${stockStatus.borderColor}50`
                          }}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-white">Estoque</span>
                            <Badge 
                              className="text-xs font-bold"
                              style={{ 
                                backgroundColor: stockStatus.bgColor,
                                color: 'white',
                                border: 'none'
                              }}
                            >
                              {stockStatus.label}
                            </Badge>
                          </div>
                          
                          <div className="text-2xl font-bold text-white mb-1">
                            {item.quantityInStock} {item.unit}
                          </div>
                          
                          <div className="text-xs text-slate-400 mb-3">
                            Mínimo: {item.minStockLevel} {item.unit}
                          </div>
                          
                          {/* Barra de progresso visual */}
                          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                            <div 
                              className="h-full transition-all duration-500"
                              style={{
                                width: `${Math.min(100, (item.quantityInStock / item.minStockLevel) * 100)}%`,
                                backgroundColor: stockStatus.bgColor
                              }}
                            />
                          </div>
                          
                          {stockStatus.urgent && (
                            <Button 
                              size="sm" 
                              className="w-full" 
                              variant="outline"
                              style={{
                                borderColor: stockStatus.borderColor,
                                color: stockStatus.bgColor
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.info(`Funcionalidade de compra para ${item.name} será implementada em breve!`);
                              }}
                            >
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              Solicitar Compra
                            </Button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
                
                {/* Botão Adicionar */}
                <motion.div
                  variants={itemVariants}
                  onClick={() => {
                    setEditingMaterial(null);
                    setIsMaterialDialogOpen(true);
                  }}
                  className="modern-card cursor-pointer border-dashed border-2 border-primary/30 hover:border-primary flex items-center justify-center min-h-[200px]"
                >
                  <div className="text-center">
                    <Plus className="w-12 h-12 text-primary mx-auto mb-2" />
                    <p className="text-primary font-semibold">Adicionar Material</p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </TabsContent>

          {/* Equipamentos */}
          <TabsContent value="equipment">
            {loadingEquipments ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400">Carregando equipamentos...</p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filterItems(equipmentsData).map((item: any, idx: number) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    onClick={() => setSelectedItem(item)}
                    className="modern-card cursor-pointer relative"
                  >
                    {/* Botões de ação */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingEquipment(item);
                          setIsEquipmentDialogOpen(true);
                        }}
                        className="h-8 w-8"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Deletar ${item.name}?`)) {
                            deleteEquipment.mutate({ id: item.id });
                          }
                        }}
                        className="h-8 w-8 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-start gap-3 mb-4">
                      <div 
                        className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0"
                        style={selectedItem === item ? { 
                          backgroundColor: 'oklch(0.84 0.19 80.45 / 0.2)',
                          border: '2px solid oklch(0.84 0.19 80.45)'
                        } : {}}
                      >
                        <Package 
                          className="w-6 h-6"
                          style={selectedItem === item ? { color: 'oklch(0.84 0.19 80.45)' } : { color: 'rgb(251 146 60)' }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white mb-1 truncate">{item.name}</h3>
                        <p className="text-sm text-slate-400">{item.category}</p>
                      </div>
                    </div>

                    {/* Informações */}
                    <div className="space-y-2 pt-3 border-t border-slate-700/50">
                      {usageToday?.equipmentsInUse.includes(item.id) && (
                        <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Em Uso Hoje
                        </Badge>
                      )}
                      {item.costPerDay && (
                        <Badge variant="outline" className="text-xs">
                          R$ {item.costPerDay}/dia
                        </Badge>
                      )}
                      {item.quantity && (
                        <Badge variant="outline" className="text-xs ml-2">
                          Qtd: {item.quantity}
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {/* Botão Adicionar */}
                <motion.div
                  variants={itemVariants}
                  onClick={() => {
                    setEditingEquipment(null);
                    setIsEquipmentDialogOpen(true);
                  }}
                  className="modern-card cursor-pointer border-dashed border-2 border-primary/30 hover:border-primary flex items-center justify-center min-h-[200px]"
                >
                  <div className="text-center">
                    <Plus className="w-12 h-12 text-primary mx-auto mb-2" />
                    <p className="text-primary font-semibold">Adicionar Equipamento</p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </TabsContent>
          
          {/* Equipe */}
          <TabsContent value="team">
            {loadingTeam ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400">Carregando equipe...</p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filterItems(teamMembersData).map((item: any, idx: number) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    onClick={() => setSelectedItem(item)}
                    className="modern-card cursor-pointer relative"
                  >
                    {/* Botões de ação */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTeamMember(item);
                          setIsTeamDialogOpen(true);
                        }}
                        className="h-8 w-8"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Deletar ${item.name}?`)) {
                            deleteTeamMember.mutate({ id: item.id });
                          }
                        }}
                        className="h-8 w-8 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-start gap-3 mb-4">
                      <div 
                        className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0"
                        style={selectedItem === item ? { 
                          backgroundColor: 'oklch(0.84 0.19 80.45 / 0.2)',
                          border: '2px solid oklch(0.84 0.19 80.45)'
                        } : {}}
                      >
                        <Users 
                          className="w-6 h-6"
                          style={selectedItem === item ? { color: 'oklch(0.84 0.19 80.45)' } : { color: 'rgb(96 165 250)' }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white mb-1 truncate">{item.name}</h3>
                        <p className="text-sm text-slate-400">{item.role}</p>
                      </div>
                    </div>

                    {/* Informações */}
                    <div className="space-y-2 pt-3 border-t border-slate-700/50">
                      {usageToday?.teamInUse.includes(item.id) && (
                        <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Em Uso Hoje
                        </Badge>
                      )}
                      {item.specialty && (
                        <Badge variant="outline" className="text-xs">
                          Especialidade: {item.specialty}
                        </Badge>
                      )}
                      {item.avgProductivity && (
                        <Badge variant="outline" className="text-xs ml-2">
                          Prod: {item.avgProductivity} m²/dia
                        </Badge>
                      )}
                      {item.isActive !== undefined && (
                        <Badge 
                          variant={item.isActive ? "outline" : "destructive"} 
                          className="text-xs"
                        >
                          {item.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {/* Botão Adicionar */}
                <motion.div
                  variants={itemVariants}
                  onClick={() => {
                    setEditingTeamMember(null);
                    setIsTeamDialogOpen(true);
                  }}
                  className="modern-card cursor-pointer border-dashed border-2 border-primary/30 hover:border-primary flex items-center justify-center min-h-[200px]"
                >
                  <div className="text-center">
                    <Plus className="w-12 h-12 text-primary mx-auto mb-2" />
                    <p className="text-primary font-semibold">Adicionar Membro</p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedItem(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="modern-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex-1">{selectedItem.name}</h2>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setSelectedItem(null)}
                    className="text-slate-400 hover:text-white flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {selectedItem.category && (
                      <div className="info-item">
                        <span className="info-label">Categoria</span>
                        <span className="info-value">{selectedItem.category}</span>
                      </div>
                    )}
                    {selectedItem.type && (
                      <div className="info-item">
                        <span className="info-label">Tipo</span>
                        <span className="info-value">{selectedItem.type}</span>
                      </div>
                    )}
                    {selectedItem.unit && (
                      <div className="info-item">
                        <span className="info-label">Unidade</span>
                        <span className="info-value">{selectedItem.unit}</span>
                      </div>
                    )}
                    {selectedItem.setupTime !== undefined && (
                      <div className="info-item">
                        <span className="info-label">Tempo Montagem</span>
                        <span className="info-value">{selectedItem.setupTime} min</span>
                      </div>
                    )}
                    {selectedItem.costPerDay && (
                      <div className="info-item">
                        <span className="info-label">Custo/Dia</span>
                        <span className="info-value text-green-400">R$ {selectedItem.costPerDay}</span>
                      </div>
                    )}
                    {selectedItem.yield > 0 && (
                      <div className="info-item">
                        <span className="info-label">Rendimento</span>
                        <span className="info-value">{selectedItem.yield} m²/L</span>
                      </div>
                    )}
                    {selectedItem.color && (
                      <div className="info-item">
                        <span className="info-label">Cor</span>
                        <span className="info-value">{selectedItem.color}</span>
                      </div>
                    )}
                    {selectedItem.timeMinutes > 0 && (
                      <div className="info-item">
                        <span className="info-label">Tempo Uso</span>
                        <span className="info-value">{selectedItem.timeMinutes} min</span>
                      </div>
                    )}
                  </div>

                  <Button className="w-full gap-2" size="lg">
                    <Plus className="w-5 h-5" />
                    Adicionar à Tarefa
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dialog de EPI */}
        <Dialog open={isEpiDialogOpen} onOpenChange={setIsEpiDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEpi ? "Editar EPI" : "Novo EPI"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = {
                name: formData.get("name") as string,
                category: formData.get("category") as string,
                unit: formData.get("unit") as string,
                costPerUnit: parseFloat(formData.get("costPerUnit") as string) || undefined,
                quantityInStock: parseFloat(formData.get("quantityInStock") as string) || 0,
                minStockLevel: parseFloat(formData.get("minStockLevel") as string) || undefined,
                description: formData.get("description") as string || undefined,
                notes: formData.get("notes") as string || undefined,
              };

              if (editingEpi) {
                updateEpi.mutate({ id: editingEpi.id, ...data });
              } else {
                createEpi.mutate(data);
              }
            }}>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingEpi?.name}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Categoria *</Label>
                    <Input
                      id="category"
                      name="category"
                      defaultValue={editingEpi?.category}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unidade *</Label>
                    <Input
                      id="unit"
                      name="unit"
                      defaultValue={editingEpi?.unit}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="costPerUnit">Custo/Unidade (R$)</Label>
                    <Input
                      id="costPerUnit"
                      name="costPerUnit"
                      type="number"
                      step="0.01"
                      defaultValue={editingEpi?.costPerUnit}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantityInStock">Estoque Atual</Label>
                    <Input
                      id="quantityInStock"
                      name="quantityInStock"
                      type="number"
                      step="1"
                      min="0"
                      defaultValue={editingEpi?.quantityInStock || 0}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="minStockLevel">Estoque Mínimo</Label>
                  <Input
                    id="minStockLevel"
                    name="minStockLevel"
                    type="number"
                    step="1"
                    min="0"
                    defaultValue={editingEpi?.minStockLevel}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingEpi?.description}
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    defaultValue={editingEpi?.notes}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEpiDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createEpi.isPending || updateEpi.isPending}>
                  {editingEpi ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog de Equipamento */}
        <Dialog open={isEquipmentDialogOpen} onOpenChange={setIsEquipmentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEquipment ? "Editar Equipamento" : "Novo Equipamento"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = {
                name: formData.get("name") as string,
                category: formData.get("category") as string,
                costPerDay: formData.get("costPerDay") as string || undefined,
                costPerHour: formData.get("costPerHour") as string || undefined,
                quantity: parseInt(formData.get("quantity") as string) || 1,
                description: formData.get("description") as string || undefined,
              };

              if (editingEquipment) {
                updateEquipment.mutate({ id: editingEquipment.id, ...data });
              } else {
                createEquipment.mutate(data);
              }
            }}>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingEquipment?.name}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Input
                    id="category"
                    name="category"
                    defaultValue={editingEquipment?.category}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="costPerDay">Custo/Dia (R$)</Label>
                    <Input
                      id="costPerDay"
                      name="costPerDay"
                      type="number"
                      step="0.01"
                      defaultValue={editingEquipment?.costPerDay}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="costPerHour">Custo/Hora (R$)</Label>
                    <Input
                      id="costPerHour"
                      name="costPerHour"
                      type="number"
                      step="0.01"
                      defaultValue={editingEquipment?.costPerHour}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      defaultValue={editingEquipment?.quantity || 1}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingEquipment?.description}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEquipmentDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createEquipment.isPending || updateEquipment.isPending}>
                  {editingEquipment ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog de Material */}
        <Dialog open={isMaterialDialogOpen} onOpenChange={setIsMaterialDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingMaterial ? "Editar Material" : "Novo Material"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = {
                name: formData.get("name") as string,
                category: formData.get("category") as string,
                type: formData.get("type") as string || undefined,
                brand: formData.get("brand") as string || undefined,
                unit: formData.get("unit") as string,
                costPerUnit: parseFloat(formData.get("costPerUnit") as string) || undefined,
                quantityInStock: parseFloat(formData.get("quantityInStock") as string) || 0,
                minStockLevel: parseFloat(formData.get("minStockLevel") as string) || undefined,
                yieldPerUnit: parseFloat(formData.get("yieldPerUnit") as string) || undefined,
                color: formData.get("color") as string || undefined,
                description: formData.get("description") as string || undefined,
                notes: formData.get("notes") as string || undefined,
              };

              if (editingMaterial) {
                updateMaterial.mutate({ id: editingMaterial.id, ...data });
              } else {
                createMaterial.mutate(data);
              }
            }}>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingMaterial?.name}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Categoria *</Label>
                    <Input
                      id="category"
                      name="category"
                      defaultValue={editingMaterial?.category}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unidade *</Label>
                    <Input
                      id="unit"
                      name="unit"
                      defaultValue={editingMaterial?.unit}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Input
                      id="type"
                      name="type"
                      defaultValue={editingMaterial?.type}
                    />
                  </div>
                  <div>
                    <Label htmlFor="brand">Marca</Label>
                    <Input
                      id="brand"
                      name="brand"
                      defaultValue={editingMaterial?.brand}
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Cor</Label>
                    <Input
                      id="color"
                      name="color"
                      defaultValue={editingMaterial?.color}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="costPerUnit">Custo/Unidade (R$)</Label>
                    <Input
                      id="costPerUnit"
                      name="costPerUnit"
                      type="number"
                      step="0.01"
                      defaultValue={editingMaterial?.costPerUnit}
                    />
                  </div>
                  <div>
                    <Label htmlFor="yieldPerUnit">Rendimento/Unidade</Label>
                    <Input
                      id="yieldPerUnit"
                      name="yieldPerUnit"
                      type="number"
                      step="0.01"
                      defaultValue={editingMaterial?.yieldPerUnit}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantityInStock">Estoque Atual</Label>
                    <Input
                      id="quantityInStock"
                      name="quantityInStock"
                      type="number"
                      step="0.01"
                      defaultValue={editingMaterial?.quantityInStock || 0}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minStockLevel">Estoque Mínimo</Label>
                    <Input
                      id="minStockLevel"
                      name="minStockLevel"
                      type="number"
                      step="0.01"
                      defaultValue={editingMaterial?.minStockLevel}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingMaterial?.description}
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    defaultValue={editingMaterial?.notes}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsMaterialDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMaterial.isPending || updateMaterial.isPending}>
                  {editingMaterial ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog de Membro da Equipe */}
        <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTeamMember ? "Editar Membro da Equipe" : "Novo Membro da Equipe"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = {
                name: formData.get("name") as string,
                role: formData.get("role") as string || undefined,
                specialty: formData.get("specialty") as string || undefined,
                phone: formData.get("phone") as string || undefined,
                email: formData.get("email") as string || undefined,
                avgProductivity: parseFloat(formData.get("avgProductivity") as string) || undefined,
              };

              if (editingTeamMember) {
                updateTeamMember.mutate({ id: editingTeamMember.id, ...data });
              } else {
                createTeamMember.mutate(data);
              }
            }}>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingTeamMember?.name}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Cargo</Label>
                    <Input
                      id="role"
                      name="role"
                      defaultValue={editingTeamMember?.role}
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialty">Especialidade</Label>
                    <Input
                      id="specialty"
                      name="specialty"
                      defaultValue={editingTeamMember?.specialty}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      defaultValue={editingTeamMember?.phone}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={editingTeamMember?.email}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="avgProductivity">Produtividade Média (m²/dia)</Label>
                  <Input
                    id="avgProductivity"
                    name="avgProductivity"
                    type="number"
                    step="0.01"
                    defaultValue={editingTeamMember?.avgProductivity}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsTeamDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createTeamMember.isPending || updateTeamMember.isPending}>
                  {editingTeamMember ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
