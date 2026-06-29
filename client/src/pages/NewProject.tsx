import React, { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, Plus, Trash2, ArrowRight, ArrowLeft, 
  Home, Briefcase, Calendar, Users, MapPin, Building2,
  CheckCheck, Sparkles
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Room {
  id: string;
  name: string;
  type: string;
  area: number;
  hasFloor: boolean;
  floorType: string;
  hasPainting: boolean;
  hasPlumbing: boolean;
  hasElectrical: boolean;
  notes: string;
}

interface ProjectData {
  name: string;
  location: string;
  restorationType: string[];
  selectedItems: string[];
  rooms: Room[];
  numberOfEmployees: number;
  startDate: string;
  workOnSaturday: boolean;
  workOnSunday: boolean;
}

const RESTORATION_TYPES = [
  { id: "external-paint", name: "Pintura Externa", icon: Building2, color: "blue" },
  { id: "internal-paint", name: "Pintura Interna", icon: Home, color: "purple" },
  { id: "facade", name: "Restauração Fachada", icon: Building2, color: "orange" },
  { id: "cleaning", name: "Limpeza Fachada", icon: Sparkles, color: "green" },
  { id: "cracks", name: "Tratamento Trincas", icon: Building2, color: "red" },
  { id: "bathroom", name: "Banheiro", icon: Home, color: "cyan" },
  { id: "internal-house", name: "Casa Interna", icon: Home, color: "indigo" },
  { id: "full-house", name: "Casa Inteira", icon: Briefcase, color: "pink" },
];

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

const stepConfig = [
  { id: "type", label: "Tipo", icon: Briefcase },
  { id: "items", label: "Itens", icon: CheckCheck },
  { id: "rooms", label: "Cômodos", icon: Home },
  { id: "details", label: "Detalhes", icon: Users },
  { id: "calendar", label: "Resumo", icon: Calendar },
];

const AVAILABLE_ITEMS = {
  epis: [
    { id: "helmet", name: "Capacete de Segurança" },
    { id: "gloves", name: "Luvas de Proteção" },
    { id: "glasses", name: "Óculos de Segurança" },
    { id: "mask", name: "Máscara Respiratória" },
    { id: "boots", name: "Bota de Segurança" },
    { id: "vest", name: "Colete Refletor" },
  ],
  tools: [
    { id: "pressure-washer", name: "Lava-Jato" },
    { id: "brush", name: "Pincéis" },
    { id: "roller", name: "Rolos" },
    { id: "spatula", name: "Espátulas" },
    { id: "sander", name: "Lixadeira" },
    { id: "ladder", name: "Escada" },
  ],
  materials: [
    { id: "acrylic-paint", name: "Tinta Acrílica" },
    { id: "epoxy-primer", name: "Primer Epóxi" },
    { id: "filler", name: "Massa Reparadora" },
    { id: "sealant", name: "Selante Poliuretano" },
    { id: "mortar", name: "Argamassa Cal" },
    { id: "resin", name: "Resina de Injeção" },
  ],
  equipment: [
    { id: "scaffold", name: "Andaime" },
    { id: "compressor", name: "Compressor" },
    { id: "generator", name: "Gerador" },
    { id: "pump", name: "Bomba" },
  ],
};

export default function NewProject() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"type" | "items" | "rooms" | "details" | "calendar">("type");
  const [formData, setFormData] = useState<ProjectData>({
    name: "",
    location: "",
    restorationType: [],
    selectedItems: [],
    rooms: [],
    numberOfEmployees: 1,
    startDate: new Date().toISOString().split("T")[0],
    workOnSaturday: false,
    workOnSunday: false,
  });

  const createWorkMutation = trpc.works.create.useMutation({
    onSuccess: () => {
      toast.success("Obra criada com sucesso!");
      setLocation("/projects");
    },
    onError: (error) => {
      toast.error(`Erro ao criar obra: ${error.message}`);
    },
  });

  const [currentRoom, setCurrentRoom] = useState<Room>({
    id: Date.now().toString(),
    name: "",
    type: "Sala",
    area: 0,
    hasFloor: false,
    floorType: "",
    hasPainting: true,
    hasPlumbing: false,
    hasElectrical: false,
    notes: "",
  });

  const currentStepIndex = stepConfig.findIndex(s => s.id === step);

  // Passo 1: Selecionar Tipo de Restauro
  if (step === "type") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 py-8 px-4">
        <div className="container max-w-5xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4">
            {stepConfig.map((stepItem, index) => {
              const StepIcon = stepItem.icon;
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;
              
              return (
                <React.Fragment key={stepItem.id}>
                  <div className="flex flex-col items-center gap-2 min-w-[60px]">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center transition-all
                      ${isActive ? 'bg-primary text-primary-foreground ring-4 ring-primary/30 scale-110' : 
                        isCompleted ? 'bg-green-500 text-white' : 
                        'bg-slate-800 text-slate-400'}
                    `}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${
                      isActive ? 'text-primary' : isCompleted ? 'text-green-400' : 'text-slate-500'
                    }`}>
                      {stepItem.label}
                    </span>
                  </div>
                  {index < stepConfig.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 transition-colors ${
                      isCompleted ? 'bg-green-500' : 'bg-slate-800'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key="type"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-3">Qual é o tipo de restauro?</h1>
                <p className="text-slate-400 text-sm md:text-base">Selecione um ou mais tipos de trabalho</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
                {RESTORATION_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.restorationType.includes(type.id);
                  
                  return (
                    <motion.div
                      key={type.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const isSelected = formData.restorationType.includes(type.id);
                        setFormData({
                          ...formData,
                          restorationType: isSelected
                            ? formData.restorationType.filter((t) => t !== type.id)
                            : [...formData.restorationType, type.id],
                        });
                      }}
                      className={`
                        modern-card cursor-pointer text-center p-4 md:p-6
                        ${isSelected ? `border-${type.color}-500 bg-${type.color}-500/10` : ''}
                      `}
                    >
                      <Icon className={`w-8 h-8 md:w-10 md:h-10 mx-auto mb-3 ${
                        isSelected ? `text-${type.color}-400` : 'text-slate-400'
                      }`} />
                      <p className="font-semibold text-white text-sm md:text-base mb-2">{type.name}</p>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto" />
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.history.back()}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  size="lg"
                  onClick={() => {
                    if (formData.restorationType.length === 0) {
                      toast.error("Selecione pelo menos um tipo de restauro");
                      return;
                    }
                    setStep("items");
                  }}
                  className="flex-1"
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Passo 2: Selecionar Itens
  if (step === "items") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 py-8 px-4">
        <div className="container max-w-5xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4">
            {stepConfig.map((stepItem, index) => {
              const StepIcon = stepItem.icon;
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;
              
              return (
                <React.Fragment key={stepItem.id}>
                  <div className="flex flex-col items-center gap-2 min-w-[60px]">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center transition-all
                      ${isActive ? 'bg-primary text-primary-foreground ring-4 ring-primary/30 scale-110' : 
                        isCompleted ? 'bg-green-500 text-white' : 
                        'bg-slate-800 text-slate-400'}
                    `}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${
                      isActive ? 'text-primary' : isCompleted ? 'text-green-400' : 'text-slate-500'
                    }`}>
                      {stepItem.label}
                    </span>
                  </div>
                  {index < stepConfig.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 transition-colors ${
                      isCompleted ? 'bg-green-500' : 'bg-slate-800'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key="items"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-3">Selecione os itens necessários</h1>
                <p className="text-slate-400 text-sm md:text-base">
                  {formData.selectedItems.length} itens selecionados
                </p>
              </div>

              <div className="space-y-6 mb-8">
                {Object.entries(AVAILABLE_ITEMS).map(([category, items]) => (
                  <div key={category} className="modern-card">
                    <h3 className="text-sm md:text-base font-semibold text-slate-300 uppercase tracking-wider mb-4">
                      {category === "epis" && "EPIs"}
                      {category === "tools" && "Ferramentas"}
                      {category === "materials" && "Materiais"}
                      {category === "equipment" && "Equipamentos"}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {items.map((item: any) => {
                        const isSelected = formData.selectedItems.includes(item.id);
                        return (
                          <label
                            key={item.id}
                            className={`
                              flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                              ${isSelected ? 'bg-primary/20 border-2 border-primary' : 'bg-slate-800/40 border-2 border-transparent hover:bg-slate-800/60'}
                            `}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    selectedItems: [...formData.selectedItems, item.id],
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    selectedItems: formData.selectedItems.filter((i) => i !== item.id),
                                  });
                                }
                              }}
                              className="w-5 h-5 rounded accent-primary"
                            />
                            <span className="text-sm text-slate-200 flex-1">{item.name}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setStep("type")}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  size="lg"
                  onClick={() => setStep("rooms")}
                  className="flex-1"
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Passo 3: Descrever Cômodos
  if (step === "rooms") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 py-8 px-4">
        <div className="container max-w-5xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4">
            {stepConfig.map((stepItem, index) => {
              const StepIcon = stepItem.icon;
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;
              
              return (
                <React.Fragment key={stepItem.id}>
                  <div className="flex flex-col items-center gap-2 min-w-[60px]">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center transition-all
                      ${isActive ? 'bg-primary text-primary-foreground ring-4 ring-primary/30 scale-110' : 
                        isCompleted ? 'bg-green-500 text-white' : 
                        'bg-slate-800 text-slate-400'}
                    `}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${
                      isActive ? 'text-primary' : isCompleted ? 'text-green-400' : 'text-slate-500'
                    }`}>
                      {stepItem.label}
                    </span>
                  </div>
                  {index < stepConfig.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 transition-colors ${
                      isCompleted ? 'bg-green-500' : 'bg-slate-800'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key="rooms"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-3">Descreva os cômodos</h1>
                <p className="text-slate-400 text-sm md:text-base">
                  {formData.rooms.length} cômodo{formData.rooms.length !== 1 ? 's' : ''} adicionado{formData.rooms.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Lista de Cômodos Adicionados */}
              {formData.rooms.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Cômodos Adicionados</h3>
                  <div className="grid gap-3">
                    {formData.rooms.map((room) => (
                      <motion.div
                        key={room.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="modern-card bg-blue-500/10 border-blue-500/30"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white mb-1 truncate">
                              {room.name} <span className="text-slate-400">({room.type})</span>
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              <span className="tag tag-blue">{room.area} m²</span>
                              {room.hasFloor && (
                                <span className="tag tag-green">Piso: {room.floorType}</span>
                              )}
                              {room.hasPainting && (
                                <span className="tag tag-purple">Pintura</span>
                              )}
                              {room.hasPlumbing && (
                                <span className="tag tag-blue">Hidráulica</span>
                              )}
                              {room.hasElectrical && (
                                <span className="tag tag-orange">Elétrica</span>
                              )}
                            </div>
                            {room.notes && (
                              <p className="text-xs text-slate-400 mt-2">Obs: {room.notes}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                rooms: formData.rooms.filter((r) => r.id !== room.id),
                              });
                              toast.success("Cômodo removido");
                            }}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulário para Adicionar Cômodo */}
              <div className="modern-card mb-8">
                <h3 className="text-lg font-semibold text-white mb-6">Adicionar Novo Cômodo</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label className="text-white mb-2 block">Nome do Cômodo *</Label>
                    <Input
                      type="text"
                      value={currentRoom.name}
                      onChange={(e) => setCurrentRoom({ ...currentRoom, name: e.target.value })}
                      placeholder="Ex: Sala de Estar"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label className="text-white mb-2 block">Tipo de Cômodo *</Label>
                    <select 
                      value={currentRoom.type} 
                      onChange={(e) => setCurrentRoom({ ...currentRoom, type: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option>Sala</option>
                      <option>Quarto</option>
                      <option>Banheiro</option>
                      <option>Cozinha</option>
                      <option>Corredor</option>
                      <option>Área Externa</option>
                      <option>Outro</option>
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <Label className="text-white mb-2 block">Área (m²) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={currentRoom.area || ""}
                    onChange={(e) => setCurrentRoom({ ...currentRoom, area: parseFloat(e.target.value) || 0 })}
                    placeholder="Ex: 20"
                    className="w-full"
                  />
                </div>

                <div className="mb-6">
                  <Label className="text-white mb-3 block">Características</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/40 cursor-pointer hover:bg-slate-800/60 transition-colors">
                      <input
                        type="checkbox"
                        checked={currentRoom.hasPainting}
                        onChange={(e) => setCurrentRoom({ ...currentRoom, hasPainting: e.target.checked })}
                        className="w-5 h-5 rounded accent-primary"
                      />
                      <span className="text-sm text-white">Tem pintura</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/40 cursor-pointer hover:bg-slate-800/60 transition-colors">
                      <input
                        type="checkbox"
                        checked={currentRoom.hasFloor}
                        onChange={(e) => setCurrentRoom({ ...currentRoom, hasFloor: e.target.checked })}
                        className="w-5 h-5 rounded accent-primary"
                      />
                      <span className="text-sm text-white">Tem piso</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/40 cursor-pointer hover:bg-slate-800/60 transition-colors">
                      <input
                        type="checkbox"
                        checked={currentRoom.hasPlumbing}
                        onChange={(e) => setCurrentRoom({ ...currentRoom, hasPlumbing: e.target.checked })}
                        className="w-5 h-5 rounded accent-primary"
                      />
                      <span className="text-sm text-white">Tem hidráulica</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/40 cursor-pointer hover:bg-slate-800/60 transition-colors">
                      <input
                        type="checkbox"
                        checked={currentRoom.hasElectrical}
                        onChange={(e) => setCurrentRoom({ ...currentRoom, hasElectrical: e.target.checked })}
                        className="w-5 h-5 rounded accent-primary"
                      />
                      <span className="text-sm text-white">Tem elétrica</span>
                    </label>
                  </div>
                </div>

                {currentRoom.hasFloor && (
                  <div className="mb-6">
                    <Label className="text-white mb-2 block">Tipo de Piso</Label>
                    <Input
                      type="text"
                      value={currentRoom.floorType}
                      onChange={(e) => setCurrentRoom({ ...currentRoom, floorType: e.target.value })}
                      placeholder="Ex: Cerâmica, Madeira, Porcelanato"
                      className="w-full"
                    />
                  </div>
                )}

                <div className="mb-6">
                  <Label className="text-white mb-2 block">Observações</Label>
                  <textarea
                    value={currentRoom.notes}
                    onChange={(e) => setCurrentRoom({ ...currentRoom, notes: e.target.value })}
                    placeholder="Ex: Parede com mofo, trincas, etc"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[100px] resize-y"
                  />
                </div>

                <Button
                  onClick={() => {
                    if (!currentRoom.name || currentRoom.area === 0) {
                      toast.error("Preencha nome e área do cômodo");
                      return;
                    }
                    if (currentRoom.hasFloor && !currentRoom.floorType) {
                      toast.error("Especifique o tipo de piso");
                      return;
                    }
                    setFormData({
                      ...formData,
                      rooms: [...formData.rooms, currentRoom],
                    });
                    setCurrentRoom({
                      id: Date.now().toString(),
                      name: "",
                      type: "Sala",
                      area: 0,
                      hasFloor: false,
                      floorType: "",
                      hasPainting: true,
                      hasPlumbing: false,
                      hasElectrical: false,
                      notes: "",
                    });
                    toast.success("Cômodo adicionado!");
                  }}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Plus className="w-5 h-5" />
                  Adicionar Cômodo
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setStep("items")}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  size="lg"
                  onClick={() => {
                    if (formData.rooms.length === 0) {
                      toast.error("Adicione pelo menos um cômodo");
                      return;
                    }
                    setStep("details");
                  }}
                  className="flex-1"
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Passo 4: Detalhes Finais
  if (step === "details") {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ maxWidth: "700px" }}>
          <div className="page-header mb-8">
            <h1>Detalhes da Obra</h1>
            <p>Preencha os últimos detalhes para gerar o cronograma</p>
          </div>

          <div className="card" style={{ padding: "2rem" }}>
            <div className="form-group">
              <label>Nome da Obra *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Restauração Apartamento Centro"
                required
              />
            </div>

            <div className="form-group">
              <label>Localização *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: Rua das Flores, 123 - São Paulo"
                required
              />
            </div>

            <div className="form-group">
              <label>Número de Funcionários *</label>
              <input
                type="number"
                min="1"
                value={formData.numberOfEmployees}
                onChange={(e) => setFormData({ ...formData, numberOfEmployees: parseInt(e.target.value) || 1 })}
                required
              />
            </div>

            <div className="form-group">
              <label>Data de Início *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <p style={{ marginBottom: "1rem", fontWeight: "600", color: "#fff" }}>Dias de Trabalho</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.workOnSaturday}
                    onChange={(e) => setFormData({ ...formData, workOnSaturday: e.target.checked })}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <span>Trabalhar aos sábados</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.workOnSunday}
                    onChange={(e) => setFormData({ ...formData, workOnSunday: e.target.checked })}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <span>Trabalhar aos domingos</span>
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button onClick={() => setStep("rooms")} className="btn btn-secondary" style={{ flex: 1 }}>
                Voltar
              </button>
              <button
                onClick={() => {
                  if (!formData.name || !formData.location) {
                    toast.error("Preencha todos os campos");
                    return;
                  }
                  setStep("calendar");
                  toast.success("Cronograma gerado!");
                }}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Gerar Cronograma
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Passo 5: Calendário
  if (step === "calendar") {
    const totalArea = formData.rooms.reduce((sum, room) => sum + room.area, 0);
    const estimatedDays = Math.ceil((totalArea / 25) / formData.numberOfEmployees);

    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="page-header mb-8">
            <h1>{formData.name}</h1>
            <p>{formData.location}</p>
          </div>

          {/* Resumo */}
          <div className="grid grid-cols-1" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
              <p style={{ color: "#94a3b8", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Área Total</p>
              <p style={{ fontSize: "1.75rem", fontWeight: "700", color: "#3b82f6" }}>{totalArea.toFixed(0)} m²</p>
            </div>
            <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
              <p style={{ color: "#94a3b8", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Cômodos</p>
              <p style={{ fontSize: "1.75rem", fontWeight: "700", color: "#8b5cf6" }}>{formData.rooms.length}</p>
            </div>
            <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
              <p style={{ color: "#94a3b8", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Funcionários</p>
              <p style={{ fontSize: "1.75rem", fontWeight: "700", color: "#ec4899" }}>{formData.numberOfEmployees}</p>
            </div>
            <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
              <p style={{ color: "#94a3b8", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Dias Estimados</p>
              <p style={{ fontSize: "1.75rem", fontWeight: "700", color: "#10b981" }}>{estimatedDays}</p>
            </div>
          </div>

          {/* Cômodos */}
          <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
            <h2 style={{ marginBottom: "1.5rem" }}>Cômodos da Obra</h2>
            <div style={{ display: "grid", gap: "1rem" }}>
              {formData.rooms.map((room) => (
                <div
                  key={room.id}
                  style={{
                    padding: "1rem",
                    borderRadius: "8px",
                    background: "rgba(59, 130, 246, 0.08)",
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                  }}
                >
                  <p style={{ fontWeight: "600", color: "#fff", marginBottom: "0.5rem" }}>
                    {room.name} ({room.type})
                  </p>
                  <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                    Área: {room.area} m²
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {room.hasPainting && <span className="badge badge-info">Pintura</span>}
                    {room.hasFloor && <span className="badge badge-info">Piso: {room.floorType}</span>}
                    {room.hasPlumbing && <span className="badge badge-info">Hidráulica</span>}
                    {room.hasElectrical && <span className="badge badge-info">Elétrica</span>}
                  </div>
                  {room.notes && <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "0.5rem" }}>Obs: {room.notes}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Itens Selecionados */}
          <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
            <h2 style={{ marginBottom: "1.5rem" }}>Itens Selecionados</h2>
            <p style={{ color: "#94a3b8", marginBottom: "1rem" }}>Total de {formData.selectedItems.length} itens</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
              {formData.selectedItems.map((itemId) => {
                for (const [category, items] of Object.entries(AVAILABLE_ITEMS)) {
                  const item = items.find((i: any) => i.id === itemId);
                  if (item) {
                    return (
                      <div key={itemId} className="badge badge-success" style={{ padding: "0.75rem", textAlign: "center" }}>
                        {item.name}
                      </div>
                    );
                  }
                }
                return null;
              })}
            </div>
          </div>

          {/* Botões */}
          <div style={{ display: "flex", gap: "1rem" }}>
            <button onClick={() => setStep("details")} className="btn btn-secondary" style={{ flex: 1 }}>
              Voltar
            </button>
            <button
              onClick={() => {
                // Gerar código único para a obra
                const timestamp = Date.now();
                const code = `OBRA-${timestamp}`;

                // Calcular data estimada de fim
                const totalArea = formData.rooms.reduce((sum, room) => sum + room.area, 0);
                const estimatedDays = Math.ceil((totalArea / 25) / formData.numberOfEmployees);
                const startDate = new Date(formData.startDate);
                const estimatedEndDate = new Date(startDate);
                estimatedEndDate.setDate(startDate.getDate() + estimatedDays);

                // Preparar descrição com detalhes
                const description = `Tipos de restauro: ${formData.restorationType.join(", ")}. ${formData.rooms.length} cômodo(s), ${totalArea.toFixed(0)} m² total. ${formData.selectedItems.length} itens selecionados.`;

                // Criar obra no banco de dados
                createWorkMutation.mutate({
                  code,
                  name: formData.name,
                  description,
                  location: formData.location,
                  startDate: formData.startDate,
                  estimatedEndDate: estimatedEndDate.toISOString().split("T")[0],
                });
              }}
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={createWorkMutation.isPending}
            >
              {createWorkMutation.isPending ? "Salvando..." : "Confirmar e Começar"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
