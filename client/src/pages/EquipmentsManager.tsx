import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Package,
  DollarSign,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EditEquipmentDialog } from "@/components/EditEquipmentDialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function EquipmentsManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingEquipment, setEditingEquipment] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: equipments = [], refetch, isLoading } = trpc.equipments.getAll.useQuery();

  const deleteMutation = trpc.equipments.delete.useMutation({
    onSuccess: () => {
      toast.success("Equipamento excluído!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });

  const categories = ["all", ...Array.from(new Set(equipments.map((e: any) => e.category)))];

  const filteredEquipments = equipments.filter((eq: any) => {
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || eq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este equipamento?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="section-title mb-2">Gerenciar Equipamentos</h1>
              <p className="section-subtitle">Adicione, edite e remova equipamentos</p>
            </div>
            <Button 
              onClick={() => setIsCreating(true)}
              className="gap-2"
              size="lg"
            >
              <Plus className="w-5 h-5" />
              Novo Equipamento
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <Input
              type="text"
              placeholder="Buscar equipamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className="cursor-pointer px-4 py-2"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === "all" ? "Todas" : cat}
            </Badge>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="modern-card p-4">
            <Package className="w-8 h-8 text-primary mb-2" />
            <div className="text-2xl font-bold text-white">{equipments.length}</div>
            <div className="text-xs text-slate-400">Total de Equipamentos</div>
          </div>
          <div className="modern-card p-4">
            <Hash className="w-8 h-8 text-green-400 mb-2" />
            <div className="text-2xl font-bold text-white">
              {equipments.reduce((sum: number, e: any) => sum + (e.quantity || 0), 0)}
            </div>
            <div className="text-xs text-slate-400">Unidades Disponíveis</div>
          </div>
          <div className="modern-card p-4">
            <DollarSign className="w-8 h-8 text-yellow-400 mb-2" />
            <div className="text-2xl font-bold text-white">
              R$ {equipments.reduce((sum: number, e: any) => sum + (parseFloat(e.costPerDay || 0)), 0).toFixed(2)}
            </div>
            <div className="text-xs text-slate-400">Custo Total/Dia</div>
          </div>
          <div className="modern-card p-4">
            <Package className="w-8 h-8 text-blue-400 mb-2" />
            <div className="text-2xl font-bold text-white">{categories.length - 1}</div>
            <div className="text-xs text-slate-400">Categorias</div>
          </div>
        </div>

        {/* Equipment List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Carregando...</p>
          </div>
        ) : filteredEquipments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="modern-card p-12 text-center"
          >
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4 opacity-50" />
            <p className="text-slate-400 mb-4">Nenhum equipamento encontrado</p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Equipamento
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredEquipments.map((equipment: any) => (
                <motion.div
                  key={equipment.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                  className="modern-card"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">{equipment.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {equipment.category}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingEquipment(equipment)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(equipment.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {equipment.description && (
                    <p className="text-sm text-slate-400 mb-4">{equipment.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {equipment.costPerDay && (
                      <div className="p-3 bg-slate-900 rounded-lg">
                        <span className="text-xs text-slate-400">Custo/Dia</span>
                        <p className="text-lg font-bold text-green-400">
                          R$ {parseFloat(equipment.costPerDay).toFixed(2)}
                        </p>
                      </div>
                    )}
                    {equipment.costPerHour && (
                      <div className="p-3 bg-slate-900 rounded-lg">
                        <span className="text-xs text-slate-400">Custo/Hora</span>
                        <p className="text-lg font-bold text-blue-400">
                          R$ {parseFloat(equipment.costPerHour).toFixed(2)}
                        </p>
                      </div>
                    )}
                    <div className="p-3 bg-slate-900 rounded-lg">
                      <span className="text-xs text-slate-400">Quantidade</span>
                      <p className="text-lg font-bold text-white">{equipment.quantity || 0}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Edit/Create Dialog */}
      <EditEquipmentDialog
        equipment={editingEquipment}
        open={!!editingEquipment || isCreating}
        onOpenChange={(open) => {
          if (!open) {
            setEditingEquipment(null);
            setIsCreating(false);
          }
        }}
        onSuccess={refetch}
      />
    </div>
  );
}
