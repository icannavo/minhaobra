import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface EditMaterialDialogProps {
  material?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditMaterialDialog({ material, open, onOpenChange, onSuccess }: EditMaterialDialogProps) {
  const isEdit = !!material;
  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    type: "",
    brand: "",
    unit: "L",
    costPerUnit: "",
    quantityInStock: "",
    minStockLevel: "",
    yieldPerUnit: "",
    color: "",
    description: "",
    notes: "",
  });

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name || "",
        category: material.category || "",
        type: material.type || "",
        brand: material.brand || "",
        unit: material.unit || "L",
        costPerUnit: material.costPerUnit?.toString() || "",
        quantityInStock: material.quantityInStock?.toString() || "",
        minStockLevel: material.minStockLevel?.toString() || "",
        yieldPerUnit: material.yieldPerUnit?.toString() || "",
        color: material.color || "",
        description: material.description || "",
        notes: material.notes || "",
      });
    } else {
      setFormData({
        name: "",
        category: "",
        type: "",
        brand: "",
        unit: "L",
        costPerUnit: "",
        quantityInStock: "",
        minStockLevel: "",
        yieldPerUnit: "",
        color: "",
        description: "",
        notes: "",
      });
    }
  }, [material, open]);

  const createMutation = trpc.materials.create.useMutation({
    onSuccess: () => {
      toast.success("Material criado com sucesso!");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Erro ao criar: ${error.message}`);
    },
  });

  const updateMutation = trpc.materials.update.useMutation({
    onSuccess: () => {
      toast.success("Material atualizado com sucesso!");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.unit) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const data = {
      ...formData,
      costPerUnit: formData.costPerUnit ? parseFloat(formData.costPerUnit) : undefined,
      quantityInStock: formData.quantityInStock ? parseFloat(formData.quantityInStock) : undefined,
      minStockLevel: formData.minStockLevel ? parseFloat(formData.minStockLevel) : undefined,
      yieldPerUnit: formData.yieldPerUnit ? parseFloat(formData.yieldPerUnit) : undefined,
    };

    if (isEdit) {
      updateMutation.mutate({
        id: material.id,
        ...data,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isEdit ? "Editar Material" : "Novo Material"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Nome *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Tinta Acrílica Fosca"
              />
            </div>
            <div>
              <Label className="text-white">Categoria *</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ex: Tinta, Massa, Selante"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-white">Tipo</Label>
              <Input
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="Ex: Acrílico, Epóxi"
              />
            </div>
            <div>
              <Label className="text-white">Marca</Label>
              <Input
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Marca do material"
              />
            </div>
            <div>
              <Label className="text-white">Cor</Label>
              <Input
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="Ex: Branco, Cinza"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Unidade *</Label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
              >
                <option value="L">Litros (L)</option>
                <option value="kg">Quilogramas (kg)</option>
                <option value="m">Metros (m)</option>
                <option value="unidade">Unidade</option>
                <option value="saco">Saco</option>
                <option value="lata">Lata</option>
              </select>
            </div>
            <div>
              <Label className="text-white">Rendimento (m²/unidade)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.yieldPerUnit}
                onChange={(e) => setFormData({ ...formData, yieldPerUnit: e.target.value })}
                placeholder="Ex: 12"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-white">Custo por Unidade (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.costPerUnit}
                onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
                placeholder="45.00"
              />
            </div>
            <div>
              <Label className="text-white">Quantidade em Estoque</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.quantityInStock}
                onChange={(e) => setFormData({ ...formData, quantityInStock: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-white">Nível Mínimo de Estoque</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                placeholder="5"
              />
            </div>
          </div>

          <div>
            <Label className="text-white">Descrição</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição do material"
              rows={2}
            />
          </div>

          <div>
            <Label className="text-white">Observações</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionais"
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending 
                ? "Salvando..." 
                : isEdit ? "Salvar Alterações" : "Criar Material"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
