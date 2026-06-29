import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Step3Rooms } from "./NewProject/Step3Rooms";
import { Step4Details } from "./NewProject/Step4Details";
import { 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft,
  Check,
  Home,
  Paintbrush,
  Hammer,
  Layers,
  Users,
  Calendar,
  MapPin,
  Building,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

// ==================== TYPES ====================
interface Room {
  id: string;
  name: string;
  area: number;
  floorType: string;
  characteristics: string[];
}

interface FormData {
  type: string;
  items: {
    epis: string[];
    tools: string[];
    materials: string[];
    equipment: string[];
  };
  rooms: Room[];
  name: string;
  location: string;
  employees: number;
  startDate: string;
  workDays: string[];
}

// ==================== CONSTANTS ====================
const RESTORATION_TYPES = [
  { 
    id: "fachada", 
    label: "Restauração de Fachada",
    icon: Building,
    description: "Limpeza, restauro e pintura de fachadas externas"
  },
  { 
    id: "interna", 
    label: "Pintura Interna", 
    icon: Home,
    description: "Pintura de ambientes internos residenciais e comerciais"
  },
  { 
    id: "externa", 
    label: "Pintura Externa", 
    icon: Paintbrush,
    description: "Pintura de áreas externas e muros"
  },
  { 
    id: "textura", 
    label: "Aplicação de Textura", 
    icon: Layers,
    description: "Aplicação de texturas decorativas e revestimentos"
  },
  { 
    id: "geral", 
    label: "Restauração Geral", 
    icon: Hammer,
    description: "Serviços gerais de restauração e manutenção"
  }
];

const AVAILABLE_ITEMS = {
  epis: [
    "Capacete", "Óculos de Proteção", "Máscara PFF2", "Luvas", 
    "Botas de Segurança", "Cinto de Segurança", "Protetor Auricular"
  ],
  tools: [
    "Rolo de Pintura", "Pincel", "Espátula", "Lixadeira", 
    "Escada", "Andaime", "Nível", "Trena", "Mixer"
  ],
  materials: [
    "Tinta Látex", "Tinta Acrílica", "Massa Corrida", "Selador", 
    "Fundo Preparador", "Verniz", "Textura", "Fita Crepe", "Lona"
  ],
  equipment: [
    "Compressor", "Pistola de Pintura", "Lava Jato", "Gerador", 
    "Andaime Tubular", "Plataforma Elevatória"
  ]
};

const STEPS = [
  { id: 1, label: "Tipo de Obra", icon: Building },
  { id: 2, label: "Itens", icon: Layers },
  { id: 3, label: "Ambientes", icon: Home },
  { id: 4, label: "Detalhes", icon: Users },
  { id: 5, label: "Confirmação", icon: Check }
];

// ==================== MAIN COMPONENT ====================
export default function NewProject() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Only enforce authentication if OAuth is configured
  const isOAuthConfigured = import.meta.env.VITE_OAUTH_PORTAL_URL && import.meta.env.VITE_APP_ID;
  const { isAuthenticated, loading: authLoading } = useAuth({
    redirectOnUnauthenticated: isOAuthConfigured,
  });
  
  const [formData, setFormData] = useState<FormData>({
    type: "",
    items: { epis: [], tools: [], materials: [], equipment: [] },
    rooms: [],
    name: "",
    location: "",
    employees: 1,
    startDate: new Date().toISOString().split('T')[0],
    workDays: ["seg", "ter", "qua", "qui", "sex"]
  });

  const createWorkMutation = trpc.works.create.useMutation({
    onSuccess: () => {
      toast.success("Obra criada com sucesso!");
      navigate("/projects");
    },
    onError: (error: any) => {
      toast.error("Erro ao criar obra: " + error.message);
    }
  });

  // Show loading state while checking authentication (only if OAuth is configured)
  if (isOAuthConfigured && authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // If OAuth is configured but user is not authenticated, the useAuth hook will redirect automatically
  if (isOAuthConfigured && !isAuthenticated) {
    return null;
  }

  // Show warning if OAuth is not configured (development mode)
  const showDevWarning = !isOAuthConfigured && currentStep === 1;

  // ==================== CALCULATIONS ====================
  const totalArea = formData.rooms.reduce((sum, room) => sum + room.area, 0);
  const productivityPerDay = 20; // m² por funcionário por dia (base)
  const estimatedDays = Math.ceil(totalArea / (formData.employees * productivityPerDay));
  
  const calculateEndDate = () => {
    if (!formData.startDate || estimatedDays === 0) return "";
    const start = new Date(formData.startDate);
    let businessDaysToAdd = estimatedDays;
    let currentDate = new Date(start);
    
    while (businessDaysToAdd > 0) {
      currentDate.setDate(currentDate.getDate() + 1);
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // não é fim de semana
        businessDaysToAdd--;
      }
    }
    return currentDate.toISOString().split('T')[0];
  };

  // ==================== HANDLERS ====================
  const handleNext = () => {
    if (currentStep === 1 && !formData.type) {
      toast.error("Selecione o tipo de obra");
      return;
    }
    if (currentStep === 3 && formData.rooms.length === 0) {
      toast.error("Adicione pelo menos um ambiente");
      return;
    }
    if (currentStep === 4) {
      if (!formData.name || !formData.location) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
      }
    }
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const workCode = `OBRA-${Date.now().toString().slice(-6)}`;
    const typeLabel = RESTORATION_TYPES.find(t => t.id === formData.type)?.label || formData.type;
    
    const description = `${typeLabel} - ${totalArea}m² - ${formData.rooms.length} ambientes`;
    
    createWorkMutation.mutate({
      code: workCode,
      name: formData.name,
      description: description,
      location: formData.location,
      startDate: formData.startDate,
      estimatedEndDate: calculateEndDate()
    });
  };

  const addRoom = useCallback(() => {
    const newRoom: Room = {
      id: Date.now().toString(),
      name: "",
      area: 0,
      floorType: "",
      characteristics: []
    };
    setFormData(prev => ({ ...prev, rooms: [...prev.rooms, newRoom] }));
  }, []);

  const updateRoom = useCallback((id: string, field: keyof Room, value: any) => {
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.map(room => 
        room.id === id ? { ...room, [field]: value } : room
      )
    }));
  }, []);

  const removeRoom = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.filter(room => room.id !== id)
    }));
  }, []);

  const toggleItem = (category: keyof FormData['items'], item: string) => {
    const currentItems = formData.items[category];
    const newItems = currentItems.includes(item)
      ? currentItems.filter(i => i !== item)
      : [...currentItems, item];
    
    setFormData({
      ...formData,
      items: { ...formData.items, [category]: newItems }
    });
  };

  // ==================== RENDER STEPS ====================
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1TypeSelection />;
      case 2:
        return <Step2Items />;
      case 3:
        return <Step3Rooms 
          rooms={formData.rooms} 
          totalArea={totalArea}
          onAddRoom={addRoom}
          onUpdateRoom={updateRoom}
          onRemoveRoom={removeRoom}
        />;
      case 4:
        return <Step4Details 
          name={formData.name}
          location={formData.location}
          employees={formData.employees}
          startDate={formData.startDate}
          totalArea={totalArea}
          estimatedDays={estimatedDays}
          endDate={calculateEndDate()}
          onNameChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
          onLocationChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
          onEmployeesChange={(value) => setFormData(prev => ({ ...prev, employees: value }))}
          onStartDateChange={(value) => setFormData(prev => ({ ...prev, startDate: value }))}
        />;
      case 5:
        return <Step5Confirmation />;
      default:
        return null;
    }
  };

  // ==================== STEP 1: TYPE SELECTION ====================
  const Step1TypeSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Selecione o Tipo de Obra</h2>
        <p className="text-slate-400">Escolha o tipo de serviço que será realizado</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {RESTORATION_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = formData.type === type.id;
          
          return (
            <motion.button
              key={type.id}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFormData({ ...formData, type: type.id })}
              className={`modern-card text-left p-6 transition-all ${
                isSelected 
                  ? 'border-slate-700/50 hover:border-slate-600' 
                  : 'border-slate-700/50 hover:border-slate-600'
              }`}
              style={isSelected ? {
                borderColor: 'oklch(0.84 0.19 80.45)',
                backgroundColor: 'oklch(0.84 0.19 80.45 / 0.05)'
              } : {}}
            >
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                style={isSelected ? {
                  backgroundColor: 'oklch(0.84 0.19 80.45 / 0.2)'
                } : {
                  backgroundColor: 'rgb(51 65 85 / 0.5)'
                }}
              >
                <Icon 
                  className="w-7 h-7"
                  style={isSelected ? {
                    color: 'oklch(0.84 0.19 80.45)'
                  } : {
                    color: 'rgb(148 163 184)'
                  }}
                />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{type.label}</h3>
              <p className="text-sm text-slate-400">{type.description}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  // ==================== STEP 2: ITEMS ====================
  const Step2Items = () => {
    const ItemCategory = ({ title, category, items }: { 
      title: string; 
      category: keyof FormData['items']; 
      items: string[] 
    }) => (
      <div className="modern-card p-6">
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        <div className="flex flex-wrap gap-2">
          {items.map(item => {
            const isSelected = formData.items[category].includes(item);
            
            return (
              <button
                key={item}
                onClick={() => toggleItem(category, item)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-primary text-white'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    );

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Selecione os Itens Necessários</h2>
          <p className="text-slate-400">Escolha os EPIs, ferramentas, materiais e equipamentos</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ItemCategory title="EPIs" category="epis" items={AVAILABLE_ITEMS.epis} />
          <ItemCategory title="Ferramentas" category="tools" items={AVAILABLE_ITEMS.tools} />
          <ItemCategory title="Materiais" category="materials" items={AVAILABLE_ITEMS.materials} />
          <ItemCategory title="Equipamentos" category="equipment" items={AVAILABLE_ITEMS.equipment} />
        </div>
      </div>
    );
  };

  // ==================== STEP 5: CONFIRMATION ====================
  const Step5Confirmation = () => {
    const selectedType = RESTORATION_TYPES.find(t => t.id === formData.type);
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">Confirmar Criação da Obra</h2>
          <p className="text-slate-400">Revise as informações antes de finalizar</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações Gerais */}
          <div className="modern-card p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              Informações Gerais
            </h3>
            <div className="space-y-3">
              <div className="info-item">
                <span className="info-label">Nome:</span>
                <span className="info-value">{formData.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Tipo:</span>
                <span className="info-value">{selectedType?.label}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Localização:</span>
                <span className="info-value">{formData.location}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Funcionários:</span>
                <span className="info-value">{formData.employees}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Início:</span>
                <span className="info-value">
                  {new Date(formData.startDate).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>

          {/* Ambientes */}
          <div className="modern-card p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              Ambientes ({formData.rooms.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {formData.rooms.map((room, index) => (
                <div key={room.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-300">{room.name || `Ambiente ${index + 1}`}</span>
                  <span className="text-primary font-semibold">{room.area} m²</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
              <span className="text-slate-400 font-medium">Área Total:</span>
              <span className="text-2xl font-bold text-primary">{totalArea} m²</span>
            </div>
          </div>

          {/* Itens Selecionados */}
          <div className="modern-card p-6 lg:col-span-2">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Itens Selecionados
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-400 mb-2">EPIs ({formData.items.epis.length})</p>
                <div className="flex flex-wrap gap-1">
                  {formData.items.epis.length === 0 ? (
                    <span className="text-xs text-slate-600">Nenhum</span>
                  ) : (
                    formData.items.epis.map(item => (
                      <span key={item} className="tag tag-blue text-xs">{item}</span>
                    ))
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-2">Ferramentas ({formData.items.tools.length})</p>
                <div className="flex flex-wrap gap-1">
                  {formData.items.tools.length === 0 ? (
                    <span className="text-xs text-slate-600">Nenhuma</span>
                  ) : (
                    formData.items.tools.map(item => (
                      <span key={item} className="tag tag-green text-xs">{item}</span>
                    ))
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-2">Materiais ({formData.items.materials.length})</p>
                <div className="flex flex-wrap gap-1">
                  {formData.items.materials.length === 0 ? (
                    <span className="text-xs text-slate-600">Nenhum</span>
                  ) : (
                    formData.items.materials.map(item => (
                      <span key={item} className="tag tag-purple text-xs">{item}</span>
                    ))
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-2">Equipamentos ({formData.items.equipment.length})</p>
                <div className="flex flex-wrap gap-1">
                  {formData.items.equipment.length === 0 ? (
                    <span className="text-xs text-slate-600">Nenhum</span>
                  ) : (
                    formData.items.equipment.map(item => (
                      <span key={item} className="tag tag-orange text-xs">{item}</span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Estimativas */}
          <div className="modern-card p-6 lg:col-span-2 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Cronograma Estimado
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-1">Duração Estimada</p>
                <p className="text-3xl font-bold text-white">{estimatedDays}</p>
                <p className="text-xs text-slate-500">dias úteis</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-1">Produtividade</p>
                <p className="text-3xl font-bold text-white">{productivityPerDay}</p>
                <p className="text-xs text-slate-500">m²/funcionário/dia</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-1">Previsão Término</p>
                <p className="text-lg font-bold text-primary">
                  {calculateEndDate() ? new Date(calculateEndDate()).toLocaleDateString('pt-BR') : '-'}
                </p>
                <p className="text-xs text-slate-500">data estimada</p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-slate-800/50 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300">
                O cronograma será ajustado automaticamente conforme o progresso real da obra. 
                Você poderá marcar as tarefas concluídas diariamente e o sistema recalculará as datas.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==================== MAIN RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-6xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        isActive
                          ? 'bg-primary border-primary text-white'
                          : isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-500'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <StepIcon className="w-6 h-6" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium text-center hidden sm:block ${
                        isActive || isCompleted ? 'text-white' : 'text-slate-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  
                  {index < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 transition-all ${
                        isCompleted ? 'bg-green-500' : 'bg-slate-700'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        {showDevWarning && (
          <div className="mb-6 modern-card p-4 bg-yellow-500/10 border-yellow-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-yellow-400 mb-1">Modo Desenvolvimento</h4>
                <p className="text-xs text-yellow-200/80">
                  OAuth não configurado. Configure VITE_OAUTH_PORTAL_URL e VITE_APP_ID para habilitar autenticação.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div>
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </Button>

          <div className="flex gap-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => navigate("/projects")}
            >
              Cancelar
            </Button>
            
            {currentStep < 5 ? (
              <Button
                size="lg"
                onClick={handleNext}
                className="gap-2"
              >
                Próximo
                <ChevronRight className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={createWorkMutation.isPending}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                {createWorkMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Criar Obra
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
