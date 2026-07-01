import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { Package, GripVertical, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Material {
  id: number;
  name: string;
  category: string;
  unit: string;
  quantityInStock: number;
  quantityAllocated: number; // Quantidade já alocada para o dia
  quantityAvailable: number; // Disponível = InStock - Allocated
  costPerUnit: number;
  minStockLevel: number;
}

interface MaterialAllocation {
  materialId: number;
  materialName: string;
  quantity: number;
  unit: string;
}

interface MaterialsKanbanProps {
  date: string;
  workId: number;
  onAllocate: (materialId: number, taskId: string, quantity: number) => void;
}

// Componente de material arrastável
function DraggableMaterial({ material }: { material: Material }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `material-${material.id}`,
    data: material,
    disabled: material.quantityAvailable <= 0,
  });

  const isLowStock = material.quantityInStock < material.minStockLevel;
  const isOutOfStock = material.quantityAvailable <= 0;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-slate-800 border border-slate-700 rounded-lg p-3 transition-all",
        isOutOfStock
          ? "opacity-50 cursor-not-allowed"
          : "cursor-grab active:cursor-grabbing hover:border-primary/50",
        isDragging && "opacity-30"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
            isOutOfStock ? "bg-red-500/10" : isLowStock ? "bg-orange-500/10" : "bg-green-500/10"
          )}
        >
          <Package className={cn("w-5 h-5", isOutOfStock ? "text-red-400" : isLowStock ? "text-orange-400" : "text-green-400")} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h4 className="font-semibold text-white text-sm leading-tight">{material.name}</h4>
            {isOutOfStock ? (
              <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-xs shrink-0 ml-2">
                Indisponível
              </Badge>
            ) : isLowStock ? (
              <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-xs shrink-0 ml-2">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Baixo Estoque
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 text-xs shrink-0 ml-2">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Disponível
              </Badge>
            )}
          </div>

          <p className="text-xs text-slate-400 mb-2">{material.category}</p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-slate-500">Em Estoque</p>
              <p className="text-white font-semibold">
                {material.quantityInStock} {material.unit}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Disponível</p>
              <p
                className={cn(
                  "font-semibold",
                  material.quantityAvailable === 0 ? "text-red-400" : material.quantityAvailable < 10 ? "text-orange-400" : "text-green-400"
                )}
              >
                {material.quantityAvailable} {material.unit}
              </p>
            </div>
          </div>

          {material.quantityAllocated > 0 && (
            <div className="mt-2 p-2 bg-blue-500/10 rounded text-xs text-blue-400">
              {material.quantityAllocated} {material.unit} já alocados hoje
            </div>
          )}

          <div className="mt-2 text-xs text-slate-500">
            R$ {material.costPerUnit.toFixed(2)}/{material.unit}
          </div>
        </div>
      </div>
    </div>
  );
}

// Zona de drop para tarefas
function TaskMaterialDropZone({
  taskId,
  taskName,
  materials,
  onQuantityChange,
}: {
  taskId: string;
  taskName: string;
  materials: MaterialAllocation[];
  onQuantityChange: (materialId: number, quantity: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `task-material-${taskId}`,
  });

  const totalCost = materials.reduce((sum, m) => {
    // TODO: Calcular custo real baseado no material
    return sum + m.quantity * 10; // Placeholder
  }, 0);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[100px] rounded-lg border-2 border-dashed p-3 transition-all",
        isOver ? "border-primary bg-primary/5" : "border-slate-700/50 bg-slate-900/30"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-slate-400">{taskName}</h4>
        {materials.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {materials.length} materiais
          </Badge>
        )}
      </div>

      {materials.length === 0 ? (
        <p className="text-xs text-slate-600 text-center py-4">Arraste materiais aqui</p>
      ) : (
        <div className="space-y-2">
          {materials.map((material) => (
            <div key={material.materialId} className="flex items-center justify-between bg-slate-700/50 rounded p-2">
              <div className="flex-1">
                <p className="text-xs font-medium text-white">{material.materialName}</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={material.quantity}
                  onChange={(e) => onQuantityChange(material.materialId, parseFloat(e.target.value) || 0)}
                  className="w-20 h-8 text-xs bg-slate-800 border-slate-600 text-white"
                />
                <span className="text-xs text-slate-400 w-8">{material.unit}</span>
              </div>
            </div>
          ))}

          <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-xs">
            <span className="text-slate-400">Custo Estimado:</span>
            <span className="font-semibold text-green-400">R$ {totalCost.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MaterialsKanban({ date, workId, onAllocate }: MaterialsKanbanProps) {
  // Mock data - virá do backend
  const [materials, setMaterials] = useState<Material[]>([
    {
      id: 1,
      name: "Tinta Acrílica Branca",
      category: "Tintas",
      unit: "L",
      quantityInStock: 150,
      quantityAllocated: 30,
      quantityAvailable: 120,
      costPerUnit: 45.0,
      minStockLevel: 50,
    },
    {
      id: 2,
      name: "Primer Acrílico",
      category: "Preparação",
      unit: "L",
      quantityInStock: 80,
      quantityAllocated: 20,
      quantityAvailable: 60,
      costPerUnit: 38.0,
      minStockLevel: 30,
    },
    {
      id: 3,
      name: "Selante Poliuretano",
      category: "Vedação",
      unit: "kg",
      quantityInStock: 15,
      quantityAllocated: 5,
      quantityAvailable: 10,
      costPerUnit: 85.0,
      minStockLevel: 20,
    },
    {
      id: 4,
      name: "Massa Acrílica",
      category: "Preparação",
      unit: "kg",
      quantityInStock: 45,
      quantityAllocated: 15,
      quantityAvailable: 30,
      costPerUnit: 28.0,
      minStockLevel: 25,
    },
    {
      id: 5,
      name: "Detergente Industrial",
      category: "Limpeza",
      unit: "L",
      quantityInStock: 5,
      quantityAllocated: 5,
      quantityAvailable: 0,
      costPerUnit: 15.0,
      minStockLevel: 10,
    },
  ]);

  const [allocatedMaterials, setAllocatedMaterials] = useState<Record<string, MaterialAllocation[]>>({});
  const [activeMat, setActiveMat] = useState<Material | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveMat(event.active.data.current as Material);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveMat(null);

    if (!over) return;

    const materialId = Number(String(active.id).replace("material-", ""));
    const taskId = String(over.id).replace("task-material-", "");

    const material = materials.find((m) => m.id === materialId);
    if (!material || material.quantityAvailable <= 0) return;

    // Adicionar material à tarefa (quantidade padrão = 1)
    const newAllocation: MaterialAllocation = {
      materialId: material.id,
      materialName: material.name,
      quantity: 1,
      unit: material.unit,
    };

    setAllocatedMaterials((prev) => {
      const taskMaterials = prev[taskId] || [];
      const existingIndex = taskMaterials.findIndex((m) => m.materialId === materialId);

      if (existingIndex >= 0) {
        // Já existe, apenas incrementar
        const updated = [...taskMaterials];
        updated[existingIndex].quantity += 1;
        return { ...prev, [taskId]: updated };
      } else {
        // Novo material
        return { ...prev, [taskId]: [...taskMaterials, newAllocation] };
      }
    });

    // Atualizar disponibilidade
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === materialId
          ? {
              ...m,
              quantityAllocated: m.quantityAllocated + 1,
              quantityAvailable: m.quantityAvailable - 1,
            }
          : m
      )
    );

    onAllocate(materialId, taskId, 1);
  };

  const handleQuantityChange = (taskId: string, materialId: number, newQuantity: number) => {
    setAllocatedMaterials((prev) => {
      const taskMaterials = prev[taskId] || [];
      const updated = taskMaterials.map((m) => (m.materialId === materialId ? { ...m, quantity: newQuantity } : m));
      return { ...prev, [taskId]: updated };
    });
  };

  const lowStockCount = materials.filter((m) => m.quantityInStock < m.minStockLevel).length;
  const outOfStockCount = materials.filter((m) => m.quantityAvailable === 0).length;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Materiais</h3>
              <p className="text-xs text-slate-400">Arraste para alocar em tarefas</p>
            </div>
          </div>

          <div className="flex gap-2">
            {lowStockCount > 0 && (
              <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {lowStockCount} baixo estoque
              </Badge>
            )}
            {outOfStockCount > 0 && (
              <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
                {outOfStockCount} indisponíveis
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Materiais Disponíveis */}
          <Card className="p-4 bg-slate-800 border-slate-700">
            <h4 className="text-sm font-semibold text-white mb-3">Estoque de Materiais</h4>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2 pr-4">
                {materials.map((material) => (
                  <DraggableMaterial key={material.id} material={material} />
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Tarefas (Zones de Drop) */}
          <Card className="p-4 bg-slate-800 border-slate-700">
            <h4 className="text-sm font-semibold text-white mb-3">Alocar em Tarefas</h4>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                <TaskMaterialDropZone
                  taskId="task-1"
                  taskName="Limpeza Fachada Norte"
                  materials={allocatedMaterials["task-1"] || []}
                  onQuantityChange={(matId, qty) => handleQuantityChange("task-1", matId, qty)}
                />
                <TaskMaterialDropZone
                  taskId="task-2"
                  taskName="Aplicação de Primer"
                  materials={allocatedMaterials["task-2"] || []}
                  onQuantityChange={(matId, qty) => handleQuantityChange("task-2", matId, qty)}
                />
                <TaskMaterialDropZone
                  taskId="task-3"
                  taskName="Tratamento de Trincas"
                  materials={allocatedMaterials["task-3"] || []}
                  onQuantityChange={(matId, qty) => handleQuantityChange("task-3", matId, qty)}
                />
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>

      <DragOverlay>
        {activeMat && (
          <div className="opacity-90 scale-105">
            <DraggableMaterial material={activeMat} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
