import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Shield, Wrench, Droplet, Package, X, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

const CATALOG_DATA = {
  epis: [
    { name: "Capacete de Segurança", category: "Proteção Cabeça", unit: "unidade" },
    { name: "Óculos de Proteção", category: "Proteção Olhos", unit: "unidade" },
    { name: "Luva de Nitrila", category: "Proteção Mãos", unit: "par" },
    { name: "Luva de Couro", category: "Proteção Mãos", unit: "par" },
    { name: "Máscara Respiratória N95", category: "Proteção Respiratória", unit: "unidade" },
    { name: "Máscara Respiratória PFF2", category: "Proteção Respiratória", unit: "unidade" },
    { name: "Colete de Segurança", category: "Proteção Corpo", unit: "unidade" },
    { name: "Avental de Proteção", category: "Proteção Corpo", unit: "unidade" },
    { name: "Bota de Segurança", category: "Proteção Pés", unit: "par" },
    { name: "Protetor Auricular", category: "Proteção Auditiva", unit: "par" },
  ],
  tools: [
    { name: "Lava-Jato", category: "Limpeza", timeMinutes: 30 },
    { name: "Pincel Pequeno", category: "Pintura", timeMinutes: 0 },
    { name: "Pincel Médio", category: "Pintura", timeMinutes: 0 },
    { name: "Pincel Grande", category: "Pintura", timeMinutes: 0 },
    { name: "Rolo de Pintura 10cm", category: "Pintura", timeMinutes: 0 },
    { name: "Rolo de Pintura 20cm", category: "Pintura", timeMinutes: 0 },
    { name: "Espátula Pequena", category: "Preparação", timeMinutes: 0 },
    { name: "Espátula Grande", category: "Preparação", timeMinutes: 0 },
    { name: "Lixadeira Orbital", category: "Preparação", timeMinutes: 15 },
    { name: "Escada Alumínio 3m", category: "Acesso", timeMinutes: 5 },
    { name: "Escada Alumínio 5m", category: "Acesso", timeMinutes: 10 },
  ],
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

export default function Catalog() {
  const [activeTab, setActiveTab] = useState("epis");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

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
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-slate-800/50 p-1 mb-8">
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
          </TabsList>

          {/* EPIs */}
          <TabsContent value="epis">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filterItems(CATALOG_DATA.epis).map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  onClick={() => setSelectedItem(item)}
                  className="modern-card cursor-pointer"
                >
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
                  <div className="pt-3 border-t border-slate-700/50">
                    <span className="tag tag-blue">Unidade: {item.unit}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* Ferramentas */}
          <TabsContent value="tools">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filterItems(CATALOG_DATA.tools).map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  onClick={() => setSelectedItem(item)}
                  className="modern-card cursor-pointer"
                >
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
                  {item.timeMinutes > 0 && (
                    <div className="pt-3 border-t border-slate-700/50">
                      <span className="tag tag-purple">Tempo: {item.timeMinutes} min</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* Materiais */}
          <TabsContent value="materials">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filterItems(CATALOG_DATA.materials).map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  onClick={() => setSelectedItem(item)}
                  className="modern-card cursor-pointer"
                >
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
                      <p className="text-sm text-slate-400">{item.type}</p>
                    </div>
                  </div>
                  <div className="space-y-2 pt-3 border-t border-slate-700/50">
                    <div className="flex flex-wrap gap-2">
                      <span className="tag tag-green">Cor: {item.color}</span>
                      {item.yield > 0 && (
                        <span className="tag tag-green">Rend: {item.yield} m²/L</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* Equipamentos */}
          <TabsContent value="equipment">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {filterItems(CATALOG_DATA.equipment).map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  onClick={() => setSelectedItem(item)}
                  className="modern-card cursor-pointer"
                >
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
                      <h3 className="font-bold text-white mb-1">{item.name}</h3>
                      <p className="text-sm text-slate-400">{item.category}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700/50">
                    <div className="stats-card bg-orange-500/10 border-orange-500/20 !p-3">
                      <div className="stats-label text-xs">Montagem</div>
                      <div className="stats-value text-xl">{item.setupTime}</div>
                      <div className="stats-unit">minutos</div>
                    </div>
                    <div className="stats-card bg-green-500/10 border-green-500/20 !p-3">
                      <div className="stats-label text-xs">Custo/Dia</div>
                      <div className="stats-value text-xl text-green-400">R$ {item.costPerDay}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
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
      </div>
    </div>
  );
}
