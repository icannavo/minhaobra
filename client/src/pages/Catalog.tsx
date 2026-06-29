import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Shield, Wrench, Droplet, Package } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export default function Catalog() {
  const [activeTab, setActiveTab] = useState("epis");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Catálogo de Recursos</h1>
          <p className="text-slate-400 mt-2 text-sm sm:text-base">EPIs, Ferramentas, Materiais e Equipamentos</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-slate-800 p-1">
            <TabsTrigger value="epis" className="text-xs sm:text-sm gap-1 sm:gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">EPIs</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="text-xs sm:text-sm gap-1 sm:gap-2">
              <Wrench className="w-4 h-4" />
              <span className="hidden sm:inline">Ferramentas</span>
            </TabsTrigger>
            <TabsTrigger value="materials" className="text-xs sm:text-sm gap-1 sm:gap-2">
              <Droplet className="w-4 h-4" />
              <span className="hidden sm:inline">Materiais</span>
            </TabsTrigger>
            <TabsTrigger value="equipment" className="text-xs sm:text-sm gap-1 sm:gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Equipamentos</span>
            </TabsTrigger>
          </TabsList>

          {/* EPIs */}
          <TabsContent value="epis" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATALOG_DATA.epis.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedItem(item)}
                  className="card p-4 sm:p-6 cursor-pointer hover:border-blue-500 transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Shield className="w-6 h-6 text-blue-400 flex-shrink-0" />
                    <h3 className="font-semibold text-white text-sm sm:text-base">{item.name}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400">{item.category}</p>
                  <p className="text-xs text-slate-500 mt-2">Unidade: {item.unit}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Ferramentas */}
          <TabsContent value="tools" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATALOG_DATA.tools.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedItem(item)}
                  className="card p-4 sm:p-6 cursor-pointer hover:border-purple-500 transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Wrench className="w-6 h-6 text-purple-400 flex-shrink-0" />
                    <h3 className="font-semibold text-white text-sm sm:text-base">{item.name}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 mb-2">{item.category}</p>
                  {item.timeMinutes > 0 && (
                    <p className="text-xs text-slate-500">Tempo: {item.timeMinutes} min</p>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Materiais */}
          <TabsContent value="materials" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATALOG_DATA.materials.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedItem(item)}
                  className="card p-4 sm:p-6 cursor-pointer hover:border-green-500 transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Droplet className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <h3 className="font-semibold text-white text-sm sm:text-base">{item.name}</h3>
                  </div>
                  <div className="space-y-1 text-xs sm:text-sm text-slate-400">
                    <p>Tipo: {item.type}</p>
                    <p>Cor: {item.color}</p>
                    {item.yield > 0 && <p>Rendimento: {item.yield} m²/L</p>}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Equipamentos */}
          <TabsContent value="equipment" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CATALOG_DATA.equipment.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedItem(item)}
                  className="card p-4 sm:p-6 cursor-pointer hover:border-orange-500 transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Package className="w-6 h-6 text-orange-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm sm:text-base">{item.name}</h3>
                      <p className="text-xs text-slate-400">{item.category}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-slate-500">Montagem</p>
                      <p className="font-semibold text-white">{item.setupTime} min</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Custo/Dia</p>
                      <p className="font-semibold text-green-400">R$ {item.costPerDay}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Detalhe do Item */}
        {selectedItem && (
          <div className="card p-4 sm:p-6 space-y-4 animate-fade-in">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex-1">{selectedItem.name}</h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-white text-2xl flex-shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="divider" />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {selectedItem.category && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Categoria</p>
                  <p className="font-semibold text-white">{selectedItem.category}</p>
                </div>
              )}
              {selectedItem.type && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Tipo</p>
                  <p className="font-semibold text-white">{selectedItem.type}</p>
                </div>
              )}
              {selectedItem.unit && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Unidade</p>
                  <p className="font-semibold text-white">{selectedItem.unit}</p>
                </div>
              )}
              {selectedItem.setupTime && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Tempo Montagem</p>
                  <p className="font-semibold text-white">{selectedItem.setupTime} min</p>
                </div>
              )}
              {selectedItem.costPerDay && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Custo/Dia</p>
                  <p className="font-semibold text-green-400">R$ {selectedItem.costPerDay}</p>
                </div>
              )}
              {selectedItem.yield > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Rendimento</p>
                  <p className="font-semibold text-white">{selectedItem.yield} m²/L</p>
                </div>
              )}
            </div>

            <button className="w-full btn btn-primary justify-center mt-4">
              <Plus className="w-4 h-4" />
              Adicionar à Tarefa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
