import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface EditEquipmentDialogProps {
  equipment?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditEquipmentDialog({ equipment, open, onOpenChange, onSuccess }: EditEquipmentDialogProps) {
  const isEdit = !!equipment;
  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    costPerDay: "",
    costPerHour: "",
    quantity: 1,
    description: "",
  });

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name || "",
        category: equipment.category || "",
        costPerDay: equipment.costPerDay?.toString() || "",
        costPerHour: equipment.costPerHour?.toString() || "",
        quantity: equipment.quantity || 1,
        description: equipment.description || "",
      });
    } else {
      setFormData({
        name: "",
        category: "",
        costPerDay: "",
        costPerHour: "",
        quantity: 1,
        description: "",
      });
    }
  }, [equipment, open]);

  const createMutation = trpc.equipments.create.useMutation({
    onSuccess: () => {
      toast.success("Equipamento criado com sucesso!");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Erro ao criar: ${error.message}`);
    },
  });

  const updateMutation = trpc.equipments.update.useMutation({
    onSuccess: () => {
      toast.success("Equipamento atualizado com sucesso!");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    if (isEdit) {
      updateMutation.mutate({
        id: equipment.id,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isEdit ? "Editar Equipamento" : "Novo Equipamento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Nome *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Lavajato Profissional"
              />
            </div>
            <div>
              <Label className="text-white">Categoria *</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ex: Limpeza, Acesso"
              />
            </div>
          </div>

          <div>
            <Label className="text-white">Descrição</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição detalhada do equipamento"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-white">Custo por Dia (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.costPerDay}
                onChange={(e) => setFormData({ ...formData, costPerDay: e.target.value })}
                placeholder="100.00"
              />
            </div>
            <div>
              <Label className="text-white">Custo por Hora (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.costPerHour}
                onChange={(e) => setFormData({ ...formData, costPerHour: e.target.value })}
                placeholder="15.00"
              />
            </div>
            <div>
              <Label className="text-white">Quantidade</Label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              />
            </div>
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
                : isEdit ? "Salvar Alterações" : "Criar Equipamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
