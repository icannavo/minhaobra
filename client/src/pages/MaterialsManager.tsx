import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Droplet,
  AlertCircle,
  DollarSign,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EditMaterialDialog } from "@/components/EditMaterialDialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function MaterialsManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: materials = [], refetch, isLoading } = trpc.materials.getAll.useQuery();

  const deleteMutation = trpc.materials.delete.useMutation({
    onSuccess: () => {
      toast.success("Material excluído!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });

  const categories = ["all", ...Array.from(new Set(materials.map((m: any) => m.category)))];

  const filteredMaterials = materials.filter((mat: any) => {
    const matchesSearch = mat.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || mat.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockMaterials = materials.filter((m: any) => 
    m.minStockLevel && m.quantityInStock < m.minStockLevel
  );

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este material?")) {
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
              <h1 className="section-title mb-2">Gerenciar Materiais</h1>
              <p className="section-subtitle">Controle de estoque e catálogo de materiais</p>
            </div>
            <Button 
              onClick={() => setIsCreating(true)}
              className="gap-2"
              size="lg"
            >
              <Plus className="w-5 h-5" />
              Novo Material
            </Button>
          </div>
        </motion.div>

        {/* Low Stock Alert */}
        {lowStockMaterials.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="modern-card bg-red-500/10 border-red-500/20 mb-6 p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-red-400 mb-1">Alerta de Estoque Baixo</h3>
                <p className="text-sm text-slate-300">
                  {lowStockMaterials.length} {lowStockMaterials.length === 1 ? "material está" : "materiais estão"} com estoque abaixo do mínimo
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <Input
              type="text"
              placeholder="Buscar material..."
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
            <Droplet className="w-8 h-8 text-primary mb-2" />
            <div className="text-2xl font-bold text-white">{materials.length}</div>
            <div className="text-xs text-slate-400">Total de Materiais</div>
          </div>
          <div className="modern-card p-4">
            <Package className="w-8 h-8 text-green-400 mb-2" />
            <div className="text-2xl font-bold text-white">
              {materials.filter((m: any) => (m.quantityInStock || 0) > 0).length}
            </div>
            <div className="text-xs text-slate-400">Em Estoque</div>
          </div>
          <div className="modern-card p-4 bg-red-500/10 border-red-500/20">
            <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
            <div className="text-2xl font-bold text-red-400">{lowStockMaterials.length}</div>
            <div className="text-xs text-slate-400">Estoque Baixo</div>
          </div>
          <div className="modern-card p-4">
            <DollarSign className="w-8 h-8 text-yellow-400 mb-2" />
            <div className="text-2xl font-bold text-white">
              R$ {materials.reduce((sum: number, m: any) => 
                sum + ((m.quantityInStock || 0) * (m.costPerUnit || 0)), 0
              ).toFixed(2)}
            </div>
            <div className="text-xs text-slate-400">Valor Total em Estoque</div>
          </div>
        </div>

        {/* Materials Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Carregando...</p>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="modern-card p-12 text-center"
          >
            <Droplet className="w-16 h-16 text-slate-600 mx-auto mb-4 opacity-50" />
            <p className="text-slate-400 mb-4">Nenhum material encontrado</p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Material
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredMaterials.map((material: any) => {
                const isLowStock = material.minStockLevel && material.quantityInStock < material.minStockLevel;
                
                return (
                  <motion.div
                    key={material.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                    className={`modern-card ${isLowStock ? 'border-red-500/30' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-white mb-1">{material.name}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            {material.category}
                          </Badge>
                          {material.type && (
                            <Badge variant="outline" className="text-xs">
                              {material.type}
                            </Badge>
                          )}
                          {material.color && (
                            <Badge variant="outline" className="text-xs">
                              {material.color}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingMaterial(material)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(material.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {material.description && (
                      <p className="text-sm text-slate-400 mb-4 line-clamp-2">{material.description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className={`p-3 rounded-lg ${isLowStock ? 'bg-red-500/10' : 'bg-slate-900'}`}>
                        <span className="text-xs text-slate-400">Estoque</span>
                        <p className={`text-lg font-bold ${isLowStock ? 'text-red-400' : 'text-white'}`}>
                          {material.quantityInStock || 0} {material.unit}
                        </p>
                      </div>
                      {material.costPerUnit && (
                        <div className="p-3 bg-slate-900 rounded-lg">
                          <span className="text-xs text-slate-400">Custo/Un.</span>
                          <p className="text-lg font-bold text-green-400">
                            R$ {parseFloat(material.costPerUnit).toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>

                    {material.yieldPerUnit && (
                      <div className="p-2 bg-blue-500/10 rounded text-xs text-blue-400 flex items-center gap-2">
                        <Droplet className="w-3 h-3" />
                        Rendimento: {material.yieldPerUnit} m²/{material.unit}
                      </div>
                    )}

                    {isLowStock && (
                      <div className="mt-3 p-2 bg-red-500/10 rounded text-xs text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-3 h-3" />
                        Estoque abaixo do mínimo ({material.minStockLevel} {material.unit})
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Edit/Create Dialog */}
      <EditMaterialDialog
        material={editingMaterial}
        open={!!editingMaterial || isCreating}
        onOpenChange={(open) => {
          if (!open) {
            setEditingMaterial(null);
            setIsCreating(false);
          }
        }}
        onSuccess={refetch}
      />
    </div>
  );
}
