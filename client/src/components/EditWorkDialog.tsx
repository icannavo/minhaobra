import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface EditWorkDialogProps {
  work: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditWorkDialog({ work, open, onOpenChange, onSuccess }: EditWorkDialogProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    location: "",
    status: "Planejamento",
    startDate: "",
    estimatedEndDate: "",
  });

  useEffect(() => {
    if (work) {
      setFormData({
        code: work.code || "",
        name: work.name || "",
        description: work.description || "",
        location: work.location || "",
        status: work.status || "Planejamento",
        startDate: work.startDate || "",
        estimatedEndDate: work.estimatedEndDate || "",
      });
    }
  }, [work]);

  const updateMutation = trpc.works.update.useMutation({
    onSuccess: () => {
      toast.success("Obra atualizada com sucesso!");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    updateMutation.mutate({
      id: work.id,
      ...formData,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Editar Obra</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Código *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Ex: OBRA-001"
              />
            </div>
            <div>
              <Label className="text-white">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planejamento">Planejamento</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                  <SelectItem value="Pausada">Pausada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-white">Nome *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome da obra"
            />
          </div>

          <div>
            <Label className="text-white">Descrição</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição detalhada"
              rows={3}
            />
          </div>

          <div>
            <Label className="text-white">Localização</Label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Endereço completo"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Data de Início</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-white">Data Estimada de Conclusão</Label>
              <Input
                type="date"
                value={formData.estimatedEndDate}
                onChange={(e) => setFormData({ ...formData, estimatedEndDate: e.target.value })}
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
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
