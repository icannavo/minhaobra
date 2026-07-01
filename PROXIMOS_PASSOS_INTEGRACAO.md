# 📘 GUIA COMPLETO DE IMPLEMENTAÇÃO - ERP RESTAURO

> ⚠️ **ATENÇÃO:** Antes de iniciar qualquer passo, SEMPRE verifique o arquivo `PASSOS.md`
> para confirmar que o passo anterior está marcado como ✅ CONCLUÍDO.

---

## 🎯 COMO USAR ESTE GUIA

1. **Abra `PASSOS.md`** e encontre o primeiro passo com status `⏳ PENDENTE`
2. **Encontre o passo correspondente** neste arquivo
3. **Leia todas as instruções** antes de começar a implementar
4. **Copie e adapte o código** fornecido
5. **Teste a funcionalidade** localmente
6. **Atualize `PASSOS.md`** marcando como `✅ CONCLUÍDO`

---

## � ÍNDICE DE PASSOS

- [FASE 1: INTEGRAÇÕES BÁSICAS](#fase-1-integrações-básicas) (Passos 1-5)
- [FASE 2: TASK TEMPLATES](#fase-2-task-templates) (Passos 6-12)
- [FASE 3: CRIAÇÃO DE TAREFAS](#fase-3-criação-de-tarefas-detalhadas) (Passos 13-19)
- [FASE 4: NEXT DAY PLANNING](#fase-4-next-day-planning) (Passos 20-22)
- [FASE 5: EXECUÇÃO](#fase-5-execução-de-tarefas) (Passos 23-32)
- [FASE 6: ALERTAS](#fase-6-sistema-de-alertas) (Passos 33-38)
- [FASE 7: ANÁLISES](#fase-7-análises-e-relatórios) (Passos 39-45)
- [FASE 8: PROJETOS WBS](#fase-8-projetos-hierárquicos-e-wbs) (Passos 46-50)
- [FASE 9: RECURSOS AVANÇADOS](#fase-9-recursos-avançados) (Passos 51-55)

---

# FASE 1: INTEGRAÇÕES BÁSICAS

## PASSO 1: INTEGRAR CATALOG - EQUIPAMENTOS

### 📋 Objetivo
Substituir dados mock de equipamentos por dados reais do banco de dados.

### 📁 Arquivo Principal
`client/src/pages/Catalog.tsx`

### 🔌 Endpoints Utilizados
- `trpc.equipments.getAll` - Buscar todos os equipamentos
- `trpc.equipments.create` - Criar novo equipamento
- `trpc.equipments.update` - Atualizar equipamento
- `trpc.equipments.delete` - Deletar equipamento

### 💻 Implementação

#### 1. Adicionar imports necessários

```typescript
// Já deve estar no arquivo, mas verifique:
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
```

#### 2. Substituir a busca de equipamentos

**ANTES (mock):**
```typescript
const tools = [
  { name: "Lava-Jato", category: "Limpeza", timeMinutes: 30 },
  // ... mais dados mock
];
```

**DEPOIS (dados reais):**
```typescript
// Dentro do componente Catalog():
const { 
  data: equipments = [], 
  isLoading: loadingEquipments, 
  refetch: refetchEquipments 
} = trpc.equipments.getAll.useQuery();
```

#### 3. Adicionar estado para modal de criação/edição
```typescript
const [editingEquipment, setEditingEquipment] = useState<any>(null);
const [isEquipmentDialogOpen, setIsEquipmentDialogOpen] = useState(false);
```

#### 4. Criar mutations para CRUD
```typescript
// Criar equipamento
const createEquipment = trpc.equipments.create.useMutation({
  onSuccess: () => {
    refetchEquipments();
    toast.success("Equipamento criado com sucesso!");
    setIsEquipmentDialogOpen(false);
  },
  onError: (error) => {
    toast.error(`Erro: ${error.message}`);
  },
});

// Atualizar equipamento
const updateEquipment = trpc.equipments.update.useMutation({
  onSuccess: () => {
    refetchEquipments();
    toast.success("Equipamento atualizado!");
    setIsEquipmentDialogOpen(false);
    setEditingEquipment(null);
  },
});

// Deletar equipamento
const deleteEquipment = trpc.equipments.delete.useMutation({
  onSuccess: () => {
    refetchEquipments();
    toast.success("Equipamento deletado!");
  },
});
```

#### 5. Atualizar renderização da aba "Ferramentas"

**Substituir:**
```typescript
<TabsContent value="tools">
  {filterItems(CATALOG_DATA.tools).map((item, idx) => (
    <motion.div key={idx}>
      {/* ... */}
    </motion.div>
  ))}
</TabsContent>
```

**Por:**
```typescript
<TabsContent value="tools">
  {loadingEquipments ? (
    <div className="text-center py-12">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-slate-400">Carregando equipamentos...</p>
    </div>
  ) : (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {filterItems(equipments).map((item: any, idx: number) => (
        <motion.div
          key={item.id}
          variants={itemVariants}
          onClick={() => setSelectedItem(item)}
          className="modern-card cursor-pointer relative"
        >
          {/* Botões de ação */}
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setEditingEquipment(item);
                setIsEquipmentDialogOpen(true);
              }}
              className="h-8 w-8"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Deletar ${item.name}?`)) {
                  deleteEquipment.mutate({ id: item.id });
                }
              }}
              className="h-8 w-8 text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <Wrench className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white mb-1 truncate">{item.name}</h3>
              <p className="text-sm text-slate-400">{item.category}</p>
            </div>
          </div>

          {/* Informações */}
          <div className="space-y-2 pt-3 border-t border-slate-700/50">
            {item.costPerDay && (
              <Badge variant="outline" className="text-xs">
                R$ {item.costPerDay}/dia
              </Badge>
            )}
            {item.quantity && (
              <Badge variant="outline" className="text-xs ml-2">
                Qtd: {item.quantity}
              </Badge>
            )}
          </div>
        </motion.div>
      ))}
      
      {/* Botão Adicionar */}
      <motion.div
        variants={itemVariants}
        onClick={() => {
          setEditingEquipment(null);
          setIsEquipmentDialogOpen(true);
        }}
        className="modern-card cursor-pointer border-dashed border-2 border-primary/30 hover:border-primary flex items-center justify-center min-h-[200px]"
      >
        <div className="text-center">
          <Plus className="w-12 h-12 text-primary mx-auto mb-2" />
          <p className="text-primary font-semibold">Adicionar Equipamento</p>
        </div>
      </motion.div>
    </motion.div>
  )}
</TabsContent>
```

#### 6. Adicionar Dialog de Criação/Edição

```typescript
{/* Dialog de Equipamento */}
<Dialog open={isEquipmentDialogOpen} onOpenChange={setIsEquipmentDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>
        {editingEquipment ? "Editar Equipamento" : "Novo Equipamento"}
      </DialogTitle>
    </DialogHeader>
    
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data = {
        name: formData.get("name") as string,
        category: formData.get("category") as string,
        costPerDay: parseFloat(formData.get("costPerDay") as string) || undefined,
        costPerHour: parseFloat(formData.get("costPerHour") as string) || undefined,
        quantity: parseInt(formData.get("quantity") as string) || 1,
        description: formData.get("description") as string || undefined,
      };

      if (editingEquipment) {
        updateEquipment.mutate({ id: editingEquipment.id, ...data });
      } else {
        createEquipment.mutate(data);
      }
    }}>
      <div className="space-y-4 py-4">
        <div>
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={editingEquipment?.name}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="category">Categoria *</Label>
          <Input
            id="category"
            name="category"
            defaultValue={editingEquipment?.category}
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="costPerDay">Custo/Dia (R$)</Label>
            <Input
              id="costPerDay"
              name="costPerDay"
              type="number"
              step="0.01"
              defaultValue={editingEquipment?.costPerDay}
            />
          </div>
          
          <div>
            <Label htmlFor="quantity">Quantidade</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              defaultValue={editingEquipment?.quantity || 1}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={editingEquipment?.description}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => setIsEquipmentDialogOpen(false)}>
          Cancelar
        </Button>
        <Button type="submit">
          {editingEquipment ? "Atualizar" : "Criar"}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

### ✅ Checklist de Conclusão

- [ ] Imports adicionados
- [ ] Query `equipments.getAll` implementada
- [ ] Mutations (create, update, delete) implementadas
- [ ] Renderização atualizada para usar dados reais
- [ ] Botões de editar/deletar funcionando
- [ ] Dialog de criação/edição funcionando
- [ ] Testado localmente em `http://localhost:3000/catalog`
- [ ] Atualizado `PASSOS.md` marcando como ✅ CONCLUÍDO

---

## PASSO 2: INTEGRAR CATALOG - MATERIAIS

### 📋 Objetivo
Substituir dados mock de materiais por dados reais do banco.

### 📁 Arquivo Principal
`client/src/pages/Catalog.tsx`

### 🔌 Endpoints
- `trpc.materials.getAll`
- `trpc.materials.create`
- `trpc.materials.update`
- `trpc.materials.delete`

### 💻 Implementação Rápida

Seguir mesmo padrão do PASSO 1, mas para materiais:

```typescript
// 1. Query
const { data: materials = [], isLoading: loadingMaterials, refetch: refetchMaterials } 
  = trpc.materials.getAll.useQuery();

// 2. Mutations
const createMaterial = trpc.materials.create.useMutation({...});
const updateMaterial = trpc.materials.update.useMutation({...});
const deleteMaterial = trpc.materials.delete.useMutation({...});

// 3. Estado
const [editingMaterial, setEditingMaterial] = useState<any>(null);
const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);

// 4. Campos do formulário (além dos básicos):
// - name, category, type, brand
// - unit, costPerUnit
// - quantityInStock, minStockLevel
// - yieldPerUnit, color
// - description
```

### ⚠️ Diferença Importante
Materiais têm **controle de estoque**:
- Mostrar `quantityInStock` com badge
- Se `quantityInStock < minStockLevel`, exibir alerta vermelho

```typescript
{material.quantityInStock < material.minStockLevel && (
  <Badge variant="destructive" className="text-xs">
    <AlertTriangle className="w-3 h-3 mr-1" />
    Estoque Baixo
  </Badge>
)}
```

---

## PASSO 3: INTEGRAR CATALOG - EQUIPE

### 📋 Objetivo
Substituir dados mock de equipe por dados reais.

### 🔌 Endpoints
- `trpc.teamMembers.getAll`
- `trpc.teamMembers.create`
- `trpc.teamMembers.update`
- `trpc.teamMembers.delete`

### 💻 Campos do Formulário
- name (required)
- role (Pintor, Encarregado, etc)
- specialty
- phone
- email
- avgProductivity (m²/dia)
- isActive (checkbox)

### 🎨 Renderização
```typescript
<TabsContent value="team">
  {teamMembers.map((member) => (
    <div key={member.id} className="modern-card">
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12">
          <AvatarFallback className="bg-primary">
            {member.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-bold">{member.name}</h3>
          <p className="text-sm text-slate-400">{member.role}</p>
        </div>
        {!member.isActive && (
          <Badge variant="secondary">Inativo</Badge>
        )}
      </div>
    </div>
  ))}
</TabsContent>
```

---

## PASSO 4: CATALOG - MOSTRAR STATUS "EM USO"

### 📋 Objetivo
Exibir quais recursos estão sendo usados hoje.

### 🔌 Endpoint Adicional
Criar novo endpoint no backend:
`trpc.catalog.getUsageToday`

### 📁 Arquivo Backend
`server/routers.ts`

```typescript
// Adicionar ao appRouter:
catalog: router({
  getUsageToday: publicProcedure
    .input(z.object({ 
      workId: z.number(),
      date: z.string() 
    }))
    .query(async ({ input }) => {
      // Buscar scheduled_tasks do dia
      const scheduled = await db.getScheduledTasksByDate(input.workId, input.date);
      
      // Extrair IDs de equipments em uso
      const equipmentIds = new Set();
      const materialIds = new Set();
      const teamMemberIds = new Set();
      
      for (const st of scheduled) {
        const detailedTask = await db.getDetailedTaskById(st.detailedTaskId);
        // Buscar step_equipments, materials, team allocations
        // ... adicionar aos Sets
      }
      
      return {
        equipmentsInUse: Array.from(equipmentIds),
        materialsInUse: Array.from(materialIds),
        teamInUse: Array.from(teamMemberIds)
      };
    })
}),
```

### 💻 Frontend
```typescript
const today = format(new Date(), "yyyy-MM-dd");
const { data: usage } = trpc.catalog.getUsageToday.useQuery({
  workId: selectedWorkId!,
  date: today
}, { enabled: !!selectedWorkId });

// Ao renderizar equipamento:
const isInUse = usage?.equipmentsInUse.includes(equipment.id);

{isInUse && (
  <Badge className="bg-yellow-500/10 text-yellow-400">
    <Clock className="w-3 h-3 mr-1" />
    Em Uso Hoje
  </Badge>
)}
```

---

## PASSO 5: CATALOG - SISTEMA DE ESTOQUE

### 📋 Objetivo
Mostrar estoque de materiais com alertas visuais.

### 💻 Implementação

```typescript
// Função helper
const getStockStatus = (material: any) => {
  const percentage = (material.quantityInStock / material.minStockLevel) * 100;
  
  if (percentage <= 0) return { color: "red", label: "SEM ESTOQUE", urgent: true };
  if (percentage < 50) return { color: "orange", label: "CRÍTICO", urgent: true };
  if (percentage < 100) return { color: "yellow", label: "BAIXO", urgent: false };
  return { color: "green", label: "OK", urgent: false };
};

// Na renderização:
{materials.map((material) => {
  const status = getStockStatus(material);
  
  return (
    <div key={material.id} className="modern-card">
      {/* ... conteúdo ... */}
      
      <div className="mt-4 p-3 rounded-lg" style={{
        backgroundColor: `${status.color}/10`,
        border: `1px solid ${status.color}/30`
      }}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold">Estoque</span>
          <Badge style={{ backgroundColor: status.color }}>
            {status.label}
          </Badge>
        </div>
        
        <div className="text-2xl font-bold">
          {material.quantityInStock} {material.unit}
        </div>
        
        <div className="text-xs text-slate-400 mt-1">
          Mínimo: {material.minStockLevel} {material.unit}
        </div>
        
        {status.urgent && (
          <Button size="sm" className="w-full mt-2" variant="outline">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Solicitar Compra
          </Button>
        )}
      </div>
    </div>
  );
})}
```

---

# FASE 2: TASK TEMPLATES

## PASSO 6-7: MOSTRAR EQUIPAMENTOS E MATERIAIS DOS STEPS

### 📋 Objetivo
Ao selecionar um step, mostrar recursos vinculados.

### 🔌 Novos Endpoints Necessários
Criar em `server/routers.ts`:

```typescript
stepEquipments: router({
  getByStep: publicProcedure
    .input(z.object({ stepId: z.number() }))
    .query(({ input }) => db.getStepEquipments(input.stepId)),
    
  add: protectedProcedure
    .input(z.object({
      stepId: z.number(),
      equipmentId: z.number(),
      quantity: z.number().default(1),
      required: z.boolean().default(true)
    }))
    .mutation(({ input }) => db.addStepEquipment(input)),
    
  remove: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => db.removeStepEquipment(input.id))
}),

stepMaterials: router({
  // Mesmo padrão
}),
```

### 📁 Arquivo Backend
`server/db.ts` - Adicionar funções:

```typescript
export async function getStepEquipments(stepId: number) {
  const results = await db
    .select({
      id: stepEquipments.id,
      stepId: stepEquipments.stepId,
      equipmentId: stepEquipments.equipmentId,
      quantity: stepEquipments.quantity,
      required: stepEquipments.required,
      equipment: equipments
    })
    .from(stepEquipments)
    .innerJoin(equipments, eq(stepEquipments.equipmentId, equipments.id))
    .where(eq(stepEquipments.stepId, stepId));
    
  return results;
}
```

### 💻 Frontend em TaskTemplates.tsx

```typescript
// Ao selecionar um step:
const [selectedStep, setSelectedStep] = useState<any>(null);

const { data: stepEquipments = [] } = trpc.stepEquipments.getByStep.useQuery(
  { stepId: selectedStep?.id! },
  { enabled: !!selectedStep }
);

const { data: stepMaterials = [] } = trpc.stepMaterials.getByStep.useQuery(
  { stepId: selectedStep?.id! },
  { enabled: !!selectedStep }
);

// Renderizar:
{selectedStep && (
  <Card className="mt-4 p-4">
    <h4 className="font-bold mb-3">Recursos Necessários</h4>
    
    {/* Equipamentos */}
    <div className="mb-4">
      <Label className="text-sm text-slate-400">Equipamentos</Label>
      {stepEquipments.map((se) => (
        <div key={se.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded mt-2">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            <span>{se.equipment.name}</span>
            <Badge variant="outline" className="text-xs">
              Qtd: {se.quantity}
            </Badge>
            {se.required && (
              <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
            )}
          </div>
          <Button size="icon" variant="ghost" onClick={() => removeStepEquipment(se.id)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
      
      <Button size="sm" variant="outline" className="w-full mt-2">
        <Plus className="w-4 h-4 mr-2" />
        Adicionar Equipamento
      </Button>
    </div>
    
    {/* Materiais - mesmo padrão */}
  </Card>
)}
```

---

## PASSOS 8-12: CRUD COMPLETO DE TEMPLATES

### 📋 Pattern Geral

Para cada entidade (Classes, Subclasses, Steps):

1. **Dialog de Criação/Edição**
2. **Form com validação**
3. **Botões de ação (Edit, Delete)**
4. **Confirmação antes de deletar**

### 💻 Exemplo - Dialog de Task Class

```typescript
<Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>
        {editingClass ? "Editar Classe" : "Nova Classe"}
      </DialogTitle>
    </DialogHeader>
    
    <form onSubmit={handleSubmitClass}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nome *</Label>
          <Input name="name" required defaultValue={editingClass?.name} />
        </div>
        
        <div>
          <Label>Código *</Label>
          <Input name="code" required defaultValue={editingClass?.code} />
        </div>
        
        <div>
          <Label>Categoria *</Label>
          <Select name="category" defaultValue={editingClass?.category}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Limpeza">Limpeza</SelectItem>
              <SelectItem value="Pintura">Pintura</SelectItem>
              <SelectItem value="Preparação">Preparação</SelectItem>
              <SelectItem value="Acabamento">Acabamento</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Produtividade Base (m²/dia)</Label>
          <Input name="baseProductivity" type="number" step="0.1" 
            defaultValue={editingClass?.baseProductivity || 20} />
        </div>
        
        <div className="col-span-2">
          <Label className="flex items-center gap-2">
            <Checkbox name="requiresScaffolding" 
              defaultChecked={editingClass?.requiresScaffolding} />
            Requer Andaime
          </Label>
        </div>
        
        <div className="col-span-2">
          <Label className="flex items-center gap-2">
            <Checkbox name="requiresSafetyMeeting" 
              defaultChecked={editingClass?.requiresSafetyMeeting} />
            Requer Reunião de Segurança
          </Label>
        </div>
        
        {watch("requiresSafetyMeeting") && (
          <div>
            <Label>Duração da Reunião (min)</Label>
            <Input name="safetyMeetingMinutes" type="number" 
              defaultValue={editingClass?.safetyMeetingMinutes || 15} />
          </div>
        )}
        
        <div className="col-span-2">
          <Label>Descrição</Label>
          <Textarea name="description" defaultValue={editingClass?.description} />
        </div>
      </div>
      
      <DialogFooter className="mt-4">
        <Button type="button" variant="outline" onClick={() => setIsClassDialogOpen(false)}>
          Cancelar
        </Button>
        <Button type="submit">
          {editingClass ? "Atualizar" : "Criar"}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

### ⚠️ Validações Importantes

1. **Código único** - Verificar se já existe
2. **Dependências** - Ao deletar classe, verificar se tem subclasses
3. **Em uso** - Não permitir deletar se usado em detailed_tasks

```typescript
const deleteClass = trpc.taskClasses.delete.useMutation({
  onError: (error) => {
    if (error.message.includes("foreign key")) {
      toast.error("Não é possível deletar. Esta classe está sendo usada em tarefas.");
    } else {
      toast.error(error.message);
    }
  }
});
```

---

## CONTINUA NOS PRÓXIMOS PASSOS...

Devido ao limite de espaço, os passos 13-55 seguem o mesmo padrão detalhado.
Para cada passo restante, consulte:
- Arquivos de exemplo similares já implementados
- Schema em `drizzle/schema.ts` para tipos corretos
- Routers em `server/routers.ts` para endpoints disponíveis

---

# PADRÕES E CONVENÇÕES

## 🎨 Padrão de Components

```typescript
// 1. Imports
import React, { useState } from "react";
import { trpc } from "@/lib/trpc";

// 2. Types
interface Props {
  workId: number;
}

// 3. Component
export default function MyComponent({ workId }: Props) {
  // 4. Queries
  const { data, isLoading } = trpc.endpoint.useQuery();
  
  // 5. Mutations
  const mutation = trpc.endpoint.useMutation({});
  
  // 6. State
  const [state, setState] = useState();
  
  // 7. Effects
  useEffect(() => {}, []);
  
  // 8. Handlers
  const handleAction = () => {};
  
  // 9. Render
  return <div>...</div>;
}
```

## 🔒 Tratamento de Erros

```typescript
try {
  await mutation.mutateAsync(data);
  toast.success("Sucesso!");
} catch (error) {
  if (error instanceof TRPCError) {
    toast.error(error.message);
  } else {
    toast.error("Erro desconhecido");
    console.error(error);
  }
}
```

## 📊 Loading States

```typescript
{isLoading ? (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
) : data?.length === 0 ? (
  <EmptyState />
) : (
  <DataList data={data} />
)}
```

---

**Total de Linhas:** ~600 (será expandido para 1000+ à medida que implementar)

**Última Atualização:** 2026-07-01

**Próximo Passo:** Ver `PASSOS.md` para status atual

# FASE 3: CRIAÇÃO DE TAREFAS DETALHADAS

## PASSO 13: CRIAR PÁGINA CreateDetailedTask

### 📋 Objetivo
Criar página completa para gerar tarefas detalhadas a partir de templates.

### 📁 Arquivo
`client/src/pages/CreateDetailedTask.tsx` (já existe, precisa integrar)

### 💻 Estrutura Completa

```typescript
import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Square, ChevronRight, Check } from "lucide-react";
import { format } from "date-fns";

interface StepPreview {
  id: number;
  name: string;
  stepType: string;
  estimatedMinutes: number;
  equipments: any[];
  materials: any[];
}

export default function CreateDetailedTask() {
  const [, navigate] = useLocation();
  
  // Estado do formulário
  const [selectedWorkId, setSelectedWorkId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedSubclassId, setSelectedSubclassId] = useState<number | null>(null);
  
  // Dados da tarefa
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [floors, setFloors] = useState<number>(1);
  const [numberOfEmployees, setNumberOfEmployees] = useState<number>(1);
  
  // Preview
  const [stepsPreview, setStepsPreview] = useState<StepPreview[]>([]);
  const [totalEstimatedMinutes, setTotalEstimatedMinutes] = useState(0);
  
  // Queries
  const { data: works } = trpc.works.getAll.useQuery();
  const { data: classes } = trpc.taskClasses.getAll.useQuery();
  const { data: subclasses } = trpc.taskSubclasses.getByClass.useQuery(
    { classId: selectedClassId! },
    { enabled: !!selectedClassId }
  );
  const { data: steps } = trpc.taskSteps.getBySubclass.useQuery(
    { subclassId: selectedSubclassId! },
    { enabled: !!selectedSubclassId }
  );
  
  // Mutation
  const createTask = trpc.detailedTasks.create.useMutation({
    onSuccess: (data) => {
      toast.success("Tarefa criada com sucesso!");
      navigate(`/daily?date=${selectedDate}&highlight=${data.id}`);
    },
    onError: (error) => {
      toast.error(`Erro ao criar tarefa: ${error.message}`);
    }
  });
  
  // Calcular tempo total quando steps mudarem
  useEffect(() => {
    if (!steps || steps.length === 0) return;
    
    let total = 0;
    const preview: StepPreview[] = [];
    
    for (const step of steps) {
      let stepMinutes = step.baseTimeMinutes || 0;
      
      // Aplicar cálculo baseado no tipo
      switch (step.timeCalculationType) {
        case "PER_M2":
          stepMinutes = area * (step.timeCalculationValue || 0);
          break;
        case "PER_FLOOR":
          stepMinutes = floors * (step.timeCalculationValue || 0);
          break;
        case "PERCENTAGE_EXECUTION":
          // Será calculado depois baseado no tempo total de execução
          break;
        case "FIXED":
        default:
          stepMinutes = step.baseTimeMinutes || 0;
      }
      
      total += stepMinutes;
      
      preview.push({
        id: step.id,
        name: step.name,
        stepType: step.stepType,
        estimatedMinutes: Math.round(stepMinutes),
        equipments: [], // Será carregado
        materials: []   // Será carregado
      });
    }
    
    setStepsPreview(preview);
    setTotalEstimatedMinutes(Math.round(total));
  }, [steps, area, floors]);
```

  
  // Handler de submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWorkId || !selectedClassId || !selectedSubclassId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    createTask.mutate({
      workId: selectedWorkId,
      date: selectedDate,
      classId: selectedClassId,
      subclassId: selectedSubclassId,
      taskName,
      description,
      area,
      height,
      width,
      floors,
      numberOfEmployees,
      estimatedTotalMinutes: totalEstimatedMinutes
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Criar Tarefa Detalhada</h1>
          <p className="text-slate-400 mt-2">
            Gere uma tarefa completa a partir de um template com todos os recursos necessários
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* COLUNA 1: Seleção */}
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-bold mb-4">1. Informações Básicas</h3>
                
                {/* Obra */}
                <div className="mb-4">
                  <Label>Obra *</Label>
                  <Select value={selectedWorkId?.toString()} onValueChange={(v) => setSelectedWorkId(Number(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a obra" />
                    </SelectTrigger>
                    <SelectContent>
                      {works?.map((work) => (
                        <SelectItem key={work.id} value={work.id.toString()}>
                          {work.code} - {work.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Data */}
                <div className="mb-4">
                  <Label>Data *</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                
                {/* Nome da Tarefa */}
                <div className="mb-4">
                  <Label>Nome da Tarefa *</Label>
                  <Input
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    placeholder="Ex: Limpeza de Fachada Norte"
                  />
                </div>
                
                {/* Descrição */}
                <div>
                  <Label>Descrição</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalhes adicionais..."
                    rows={3}
                  />
                </div>
              </Card>
              
              <Card className="p-4">
                <h3 className="font-bold mb-4">2. Template</h3>
                
                {/* Classe */}
                <div className="mb-4">
                  <Label>Classe de Tarefa *</Label>
                  <Select 
                    value={selectedClassId?.toString()} 
                    onValueChange={(v) => {
                      setSelectedClassId(Number(v));
                      setSelectedSubclassId(null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a classe" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes?.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id.toString()}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
```

                
                {/* Subclasse */}
                {selectedClassId && (
                  <div>
                    <Label>Subclasse *</Label>
                    <Select 
                      value={selectedSubclassId?.toString()} 
                      onValueChange={(v) => setSelectedSubclassId(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a subclasse" />
                      </SelectTrigger>
                      <SelectContent>
                        {subclasses?.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id.toString()}>
                            {sub.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </Card>
            </div>
            
            {/* COLUNA 2: Dimensões */}
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-bold mb-4">3. Dimensões</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Área (m²) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={area}
                      onChange={(e) => setArea(Number(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <Label>Altura (m)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <Label>Largura (m)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                    />
                  </div>
                  
                  <div>
                    <Label>Andares</Label>
                    <Input
                      type="number"
                      min="1"
                      value={floors}
                      onChange={(e) => setFloors(Number(e.target.value))}
                    />
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <h3 className="font-bold mb-4">4. Equipe</h3>
                
                <div>
                  <Label>Número de Funcionários *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={numberOfEmployees}
                    onChange={(e) => setNumberOfEmployees(Number(e.target.value))}
                  />
                </div>
              </Card>
              
              {/* Resumo */}
              <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5">
                <h3 className="font-bold mb-4">📊 Resumo</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Total de Etapas</span>
                    <span className="font-bold">{stepsPreview.length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Tempo Estimado</span>
                    <span className="font-bold text-primary">
                      {Math.floor(totalEstimatedMinutes / 60)}h {totalEstimatedMinutes % 60}min
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Área Total</span>
                    <span className="font-bold">{area} m²</span>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full mt-4"
                  disabled={!selectedWorkId || !selectedSubclassId || createTask.isLoading}
                >
                  {createTask.isLoading ? "Criando..." : "Criar Tarefa e Agendar"}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            </div>
```

            
            {/* COLUNA 3: Preview das Etapas */}
            <div>
              <Card className="p-4">
                <h3 className="font-bold mb-4">5. Etapas (Preview)</h3>
                
                {stepsPreview.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    Selecione uma subclasse para ver as etapas
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {stepsPreview.map((step, idx) => (
                      <div key={step.id} className="p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-primary">{idx + 1}</span>
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{step.name}</h4>
                            <Badge variant="outline" className="text-xs mt-1">
                              {step.stepType}
                            </Badge>
                            
                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                              <Clock className="w-3 h-3" />
                              <span>{step.estimatedMinutes} min</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
```

### ✅ Checklist
- [ ] Componente completo criado
- [ ] Queries implementadas
- [ ] Cálculo de tempo funcionando
- [ ] Preview de etapas mostrando
- [ ] Botão de criar funcionando
- [ ] Redirecionamento para /daily após criar
- [ ] PASSOS.md atualizado

---

## PASSO 14-19: CONTINUAÇÃO DE CreateDetailedTask

### Estes passos são detalhamentos do PASSO 13:

- **PASSO 14:** Já implementado (seleção classe/subclasse)
- **PASSO 15:** Já implementado (buscar steps)
- **PASSO 16:** Adicionar busca de equipamentos/materiais
- **PASSO 17:** Já implementado (cálculo de tempo)
- **PASSO 18:** Já implementado (criar DetailedTask)
- **PASSO 19:** Já implementado (redirecionar)

### Para PASSO 16 - Buscar Equipamentos/Materiais:

```typescript
// Adicionar ao componente:
const { data: stepEquipments } = trpc.stepEquipments.getByStep.useQuery(
  { stepId: step.id },
  { enabled: !!step.id }
);

const { data: stepMaterials } = trpc.stepMaterials.getByStep.useQuery(
  { stepId: step.id },
  { enabled: !!step.id }
);

// No preview, mostrar:
{step.equipments?.length > 0 && (
  <div className="mt-2">
    <Label className="text-xs text-slate-500">Equipamentos:</Label>
    <div className="flex flex-wrap gap-1 mt-1">
      {step.equipments.map((eq) => (
        <Badge key={eq.id} variant="outline" className="text-xs">
          {eq.equipment.name} x{eq.quantity}
        </Badge>
      ))}
    </div>
  </div>
)}
```

---

# FASE 4: NEXT DAY PLANNING

## PASSO 20-22: INTEGRAR NEXT DAY PLANNING

### 📋 Objetivo
Aplicar mesma lógica de /daily mas para data futura.

### 📁 Arquivo
`client/src/pages/NextDayPlanning.tsx`

### 💻 Mudanças Necessárias

```typescript
// ANTES:
const [backlogTasks, setBacklogTasks] = useState<Task[]>([...mock...]);

// DEPOIS:
const tomorrow = addDays(new Date(), 1);
const tomorrowStr = format(tomorrow, "yyyy-MM-dd");

const { data: dailySchedule, refetch } = trpc.dailySchedules.getByDate.useQuery({
  workId: selectedWorkId!,
  date: tomorrowStr
}, { enabled: !!selectedWorkId });

const { data: scheduledTasks } = trpc.scheduledTasks.getByDay.useQuery({
  dailyScheduleId: dailySchedule?.id!
}, { enabled: !!dailySchedule });

const { data: availableTasks } = trpc.detailedTasks.getByWork.useQuery({
  workId: selectedWorkId!,
  date: tomorrowStr
}, { enabled: !!selectedWorkId });
```

### Botão "Confirmar Planejamento"

```typescript
const confirmPlanning = trpc.dailySchedules.update.useMutation({
  onSuccess: () => {
    toast.success("Planejamento confirmado!");
    navigate("/daily"); // Ir para o dia atual
  }
});

const handleConfirmPlanning = () => {
  if (!dailySchedule) return;
  
  confirmPlanning.mutate({
    id: dailySchedule.id,
    status: "Planejado"
  });
};
```

---

# FASE 5: EXECUÇÃO DE TAREFAS

## PASSO 23: CRIAR PÁGINA TaskExecution

### 📋 Objetivo
Registrar execução passo a passo de uma tarefa.

### 📁 Criar Arquivo
`client/src/pages/TaskExecution.tsx`

### 💻 Código Completo

```typescript
import React, { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Play, Pause, CheckCircle, Clock, AlertCircle, Package } from "lucide-react";
import { format, differenceInMinutes } from "date-fns";

export default function TaskExecution() {
  const [, params] = useRoute("/task/:id/execute");
  const taskId = Number(params?.id);
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isStepRunning, setIsStepRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showMaterialDialog, setShowMaterialDialog] = useState(false);
  
  // Queries
  const { data: detailedTask } = trpc.detailedTasks.getById.useQuery({ id: taskId });
  const { data: steps } = trpc.taskSteps.getBySubclass.useQuery(
    { subclassId: detailedTask?.subclassId! },
    { enabled: !!detailedTask }
  );
  const { data: executions, refetch: refetchExecutions } = trpc.stepExecutions.getByTask.useQuery(
    { detailedTaskId: taskId }
  );
  
  // Mutations
  const startStep = trpc.stepExecutions.start.useMutation({
    onSuccess: () => {
      refetchExecutions();
      setIsStepRunning(true);
      toast.success("Etapa iniciada!");
    }
  });
  
  const completeStep = trpc.stepExecutions.complete.useMutation({
    onSuccess: () => {
      refetchExecutions();
      setIsStepRunning(false);
      setElapsedSeconds(0);
      setCurrentStepIndex(prev => prev + 1);
      toast.success("Etapa concluída!");
    }
  });
  
  const completeTask = trpc.detailedTasks.update.useMutation({
    onSuccess: () => {
      toast.success("Tarefa concluída! Redirecionando...");
      setTimeout(() => window.location.href = "/daily", 2000);
    }
  });
```
      taskClassId: selectedClassId,
      taskSubclassId: selectedSubclassId,
      name: taskName,
      description: description,
      area: area,
      height: height,
      width: width,
      floors: floors,
      numberOfEmployees: numberOfEmployees,
      estimatedMinutes: totalEstimatedMinutes
    });
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Criar Tarefa Detalhada</h1>
          <p className="text-slate-400">Configure os parâmetros e gere uma tarefa a partir de templates</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Seleção de Obra e Data */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Obra e Data
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Obra *</Label>
                <Select value={selectedWorkId?.toString()} onValueChange={(v) => setSelectedWorkId(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a obra" />
                  </SelectTrigger>
                  <SelectContent>
                    {works?.map((work) => (
                      <SelectItem key={work.id} value={work.id.toString()}>
                        {work.code} - {work.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Data de Execução</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Card 2: Seleção de Template */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ChevronRight className="w-5 h-5 text-primary" />
              Template de Tarefa
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Classe *</Label>
                <Select value={selectedClassId?.toString()} onValueChange={(v) => {
                  setSelectedClassId(parseInt(v));
                  setSelectedSubclassId(null); // Reset subclass
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a classe" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes?.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Subclasse *</Label>
                <Select 
                  value={selectedSubclassId?.toString()} 
                  onValueChange={(v) => setSelectedSubclassId(parseInt(v))}
                  disabled={!selectedClassId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedClassId ? "Selecione a subclasse" : "Selecione uma classe primeiro"} />
                  </SelectTrigger>
                  <SelectContent>
                    {subclasses?.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id.toString()}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-4">
              <Label>Nome da Tarefa *</Label>
              <Input
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="Ex: Pintura Externa - Fachada Principal"
                required
              />
            </div>
            
            <div className="mt-4">
              <Label>Descrição</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalhes adicionais sobre a tarefa..."
                rows={3}
              />
            </div>
          </Card>

          {/* Card 3: Parâmetros de Cálculo */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Square className="w-5 h-5 text-primary" />
              Parâmetros de Cálculo
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Área (m²) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={area || ''}
                  onChange={(e) => setArea(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              
              <div>
                <Label>Altura (m)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={height || ''}
                  onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <Label>Largura (m)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={width || ''}
                  onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <Label>Andares</Label>
                <Input
                  type="number"
                  value={floors || ''}
                  onChange={(e) => setFloors(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <Label>Número de Funcionários</Label>
              <Input
                type="number"
                value={numberOfEmployees || ''}
                onChange={(e) => setNumberOfEmployees(parseInt(e.target.value) || 1)}
              />
            </div>
          </Card>
          
          {/* Card 4: Preview dos Steps */}
          {stepsPreview.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-primary" />
                Preview dos Steps ({stepsPreview.length})
              </h2>

              <div className="mb-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="text-lg font-semibold">Tempo Total Estimado:</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {Math.floor(totalEstimatedMinutes / 60)}h {totalEstimatedMinutes % 60}min
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                {stepsPreview.map((step, index) => (
                  <div key={step.id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{step.name}</h4>
                          <p className="text-sm text-slate-400">{step.stepType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-sm">
                          <Clock className="w-3 h-3 mr-1" />
                          {Math.floor(step.estimatedMinutes / 60)}h {step.estimatedMinutes % 60}min
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
          
          {/* Botões de Ação */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/tasks")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!selectedWorkId || !selectedClassId || !selectedSubclassId || !taskName || createTask.isLoading}>
              {createTask.isLoading ? "Criando..." : "Criar Tarefa"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
```

### ✅ Checklist PASSO 13
- [ ] Imports adicionados
- [ ] Queries implementadas
- [ ] Cálculo de tempo dinâmico
- [ ] Preview dos steps
- [ ] Validação de campos
- [ ] Redirecionamento após criar
- [ ] Testado localmente

---

## PASSO 14-19: DETALHES ADICIONAIS DA CRIAÇÃO

### PASSO 14: Auto-carregamento de Subclasses

**Lógica:** Quando usuário seleciona uma classe, automaticamente buscar subclasses relacionadas.

```typescript
// Já implementado no código acima com:
const { data: subclasses } = trpc.taskSubclasses.getByClass.useQuery(
  { classId: selectedClassId! },
  { enabled: !!selectedClassId }
);

// E reset ao trocar classe:
onValueChange={(v) => {
  setSelectedClassId(parseInt(v));
  setSelectedSubclassId(null); // Reset subclass
}}
```

### PASSO 15: Auto-carregamento de Steps


**Lógica:** Ao selecionar subclasse, buscar todos os steps automaticamente.

```typescript
const { data: steps } = trpc.taskSteps.getBySubclass.useQuery(
  { subclassId: selectedSubclassId! },
  { enabled: !!selectedSubclassId }
);

// useEffect recalcula tempos quando steps mudam
useEffect(() => {
  if (!steps || steps.length === 0) return;
  
  let total = 0;
  const preview: StepPreview[] = [];
  
  for (const step of steps) {
    let stepMinutes = calculateStepTime(step, area, floors);
    total += stepMinutes;
    
    preview.push({
      id: step.id,
      name: step.name,
      stepType: step.stepType,
      estimatedMinutes: Math.round(stepMinutes),
      equipments: [],
      materials: []
    });
  }
  
  setStepsPreview(preview);
  setTotalEstimatedMinutes(Math.round(total));
}, [steps, area, floors]);
```

### PASSO 16: Buscar Equipamentos e Materiais dos Steps

**Backend:** Criar endpoint que retorna steps com recursos vinculados.

```typescript
// Em server/routers.ts
taskSteps: router({
  getBySubclassWithResources: publicProcedure
    .input(z.object({ subclassId: z.number() }))
    .query(async ({ input }) => {
      const steps = await db.getStepsBySubclass(input.subclassId);
      
      // Para cada step, buscar equipamentos e materiais
      const stepsWithResources = await Promise.all(
        steps.map(async (step) => {
          const equipments = await db.getStepEquipments(step.id);
          const materials = await db.getStepMaterials(step.id);
          
          return {
            ...step,
            equipments,
            materials
          };
        })
      );
      
      return stepsWithResources;
    })
}),
```

**Frontend:** Atualizar query para usar o novo endpoint.

```typescript
const { data: steps } = trpc.taskSteps.getBySubclassWithResources.useQuery(
  { subclassId: selectedSubclassId! },
  { enabled: !!selectedSubclassId }
);


### PASSO 17: Cálculo Dinâmico de Tempo por Tipo

**Função Helper:**

```typescript
function calculateStepTime(step: any, area: number, floors: number): number {
  let minutes = 0;
  
  switch (step.timeCalculationType) {
    case "FIXED":
      minutes = step.baseTimeMinutes || 0;
      break;
      
    case "PER_M2":
      // Ex: 0.5 min por m² * 100 m² = 50 min
      minutes = area * (step.timeCalculationValue || 0);
      break;
      
    case "PER_FLOOR":
      // Ex: 60 min por andar * 3 andares = 180 min
      minutes = floors * (step.timeCalculationValue || 0);
      break;
      
    case "PERCENTAGE_EXECUTION":
      // Será calculado como % do tempo total de execução
      // Por enquanto, usar baseTimeMinutes
      minutes = step.baseTimeMinutes || 0;
      break;
      
    case "PER_LINEAR_METER":
      // Se temos largura, usar ela
      const linearMeters = step.width || 0;
      minutes = linearMeters * (step.timeCalculationValue || 0);
      break;
      
    default:
      minutes = step.baseTimeMinutes || 0;
  }
  
  return minutes;
}
```

### PASSO 18: Criar DetailedTask no Backend

**Backend endpoint já existe, mas vamos garantir que salva tudo:**

```typescript
// Em server/db.ts
export async function createDetailedTask(data: {
  workId: number;
  taskClassId: number;
  taskSubclassId: number;
  name: string;
  description?: string;
  area: number;
  height?: number;
  width?: number;
  floors?: number;
  numberOfEmployees?: number;
  estimatedMinutes: number;
}) {
  const [task] = await db.insert(detailedTasks).values({
    workId: data.workId,
    taskClassId: data.taskClassId,
    taskSubclassId: data.taskSubclassId,
    name: data.name,
    description: data.description,
    area: data.area,
    height: data.height,
    width: data.width,
    floors: data.floors,
    numberOfEmployees: data.numberOfEmployees,
    estimatedMinutes: data.estimatedMinutes,
    status: "PENDING",
    createdAt: new Date()
  }).returning();
  
  return task;
}
```

### PASSO 19: Redirecionar para Daily após Criar

**Implementação já feita:**

```typescript
const createTask = trpc.detailedTasks.create.useMutation({
  onSuccess: (data) => {
    toast.success("Tarefa criada com sucesso!");
    // Redireciona para daily com a tarefa em destaque
    navigate(`/daily?date=${selectedDate}&highlight=${data.id}`);
  },
  onError: (error) => {
    toast.error(`Erro ao criar tarefa: ${error.message}`);
  }
});
```

**No DailyDashboard, capturar o parâmetro:**

```typescript
// Em DailyDashboard.tsx
const [searchParams] = useSearchParams();
const highlightTaskId = searchParams.get("highlight");

useEffect(() => {
  if (highlightTaskId) {
    // Scroll até a tarefa e destacar com animação
    const element = document.getElementById(`task-${highlightTaskId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("ring-4", "ring-primary", "animate-pulse");
      
      setTimeout(() => {
        element.classList.remove("animate-pulse");
      }, 2000);
    }
  }
}, [highlightTaskId]);
```

---

# FASE 4: NEXT DAY PLANNING

## PASSO 20-22: PLANEJAMENTO DO DIA SEGUINTE


### 📋 Objetivo
Página para planejar tarefas do dia seguinte, similar ao DailyDashboard mas focada no futuro.

### 📁 Arquivo
`client/src/pages/NextDayPlanning.tsx`

### 💻 Implementação Completa

```typescript
import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { DndContext, DragEndEvent, useSensors, useSensor, PointerSensor } from "@dnd-kit/core";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Check, Clock, Users } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

export default function NextDayPlanning() {
  const [, navigate] = useLocation();
  
  // Data de amanhã
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const [selectedWorkId, setSelectedWorkId] = useState<number | null>(null);
  
  // Queries
  const { data: works } = trpc.works.getAll.useQuery();
  const { data: schedule, refetch: refetchSchedule } = trpc.dailySchedules.getByDate.useQuery(
    { workId: selectedWorkId!, date: tomorrow },
    { enabled: !!selectedWorkId }
  );
  
  const { data: availableTasks } = trpc.detailedTasks.getByWork.useQuery(
    { workId: selectedWorkId! },
    { enabled: !!selectedWorkId }
  );
  
  // Mutations
  const createSchedule = trpc.dailySchedules.create.useMutation({
    onSuccess: () => {
      refetchSchedule();
      toast.success("Cronograma criado!");
    }
  });
  
  const addTaskToSchedule = trpc.scheduledTasks.create.useMutation({
    onSuccess: () => {
      refetchSchedule();
      toast.success("Tarefa adicionada ao cronograma!");
    }
  });
  
  const updateScheduledTask = trpc.scheduledTasks.update.useMutation({
    onSuccess: () => {
      refetchSchedule();
    }
  });
  
  const confirmPlanning = trpc.dailySchedules.confirm.useMutation({
    onSuccess: () => {
      toast.success("Planejamento confirmado!");
      navigate("/daily");
    }
  });
  
  // Criar schedule automaticamente se não existir
  useEffect(() => {
    if (selectedWorkId && !schedule) {
      createSchedule.mutate({
        workId: selectedWorkId,
        date: tomorrow,
        status: "PLANNING"
      });
    }
  }, [selectedWorkId, schedule]);
  
  // Sensors para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  
  // Handler para drag and drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !schedule) return;
    
    const taskId = parseInt(active.id as string);
    const targetSlot = over.id as string; // Ex: "slot-08:00"
    
    // Extrair horário do slot
    const timeMatch = targetSlot.match(/slot-(\d{2}:\d{2})/);
    if (!timeMatch) return;
    
    const time = timeMatch[1];
    
    // Verificar se tarefa já está no cronograma
    const existingTask = schedule.scheduledTasks?.find(st => st.detailedTaskId === taskId);
    
    if (existingTask) {
      // Atualizar horário
      updateScheduledTask.mutate({
        id: existingTask.id,
        scheduledTime: time
      });
    } else {
      // Adicionar nova tarefa ao cronograma
      addTaskToSchedule.mutate({
        dailyScheduleId: schedule.id,
        detailedTaskId: taskId,
        scheduledTime: time,
        status: "SCHEDULED"
      });
    }
  };
  
  // Handler para confirmar planejamento
  const handleConfirm = () => {
    if (!schedule) return;
    
    const scheduledCount = schedule.scheduledTasks?.length || 0;
    
    if (scheduledCount === 0) {
      toast.error("Adicione pelo menos uma tarefa ao cronograma");
      return;
    }
    
    if (confirm(`Confirmar planejamento com ${scheduledCount} tarefa(s)?`)) {
      confirmPlanning.mutate({
        id: schedule.id,
        status: "CONFIRMED"
      });
    }
  };
  
  // Calcular resumo
  const summary = React.useMemo(() => {
    if (!schedule?.scheduledTasks) return { tasks: 0, hours: 0, workers: 0 };
    
    const tasks = schedule.scheduledTasks.length;
    const hours = schedule.scheduledTasks.reduce((sum, st) => {
      return sum + (st.detailedTask?.estimatedMinutes || 0);
    }, 0) / 60;
    const workers = schedule.scheduledTasks.reduce((sum, st) => {
      return sum + (st.detailedTask?.numberOfEmployees || 0);
    }, 0);
    
    return { tasks, hours: Math.round(hours * 10) / 10, workers };
  }, [schedule]);
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            Planejamento do Próximo Dia
          </h1>
          <p className="text-slate-400">
            {format(addDays(new Date(), 1), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>

        
        {/* Seletor de Obra */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <label className="text-sm font-medium text-slate-400 mb-2 block">Selecione a Obra</label>
              <Select value={selectedWorkId?.toString()} onValueChange={(v) => setSelectedWorkId(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha uma obra" />
                </SelectTrigger>
                <SelectContent>
                  {works?.map((work) => (
                    <SelectItem key={work.id} value={work.id.toString()}>
                      {work.code} - {work.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Resumo */}
            {selectedWorkId && (
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{summary.tasks}</div>
                  <div className="text-sm text-slate-400">Tarefas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{summary.hours}h</div>
                  <div className="text-sm text-slate-400">Estimadas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{summary.workers}</div>
                  <div className="text-sm text-slate-400">Funcionários</div>
                </div>
              </div>
            )}
          </div>
        </Card>
        
        {selectedWorkId && (
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Coluna 1: Tarefas Disponíveis */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Tarefas Disponíveis</h2>
                
                <div className="space-y-2">
                  {availableTasks?.filter(task => task.status === "PENDING").map((task) => {
                    const isScheduled = schedule?.scheduledTasks?.some(st => st.detailedTaskId === task.id);
                    
                    return (
                      <div
                        key={task.id}
                        draggable
                        className={`p-3 rounded-lg border cursor-move transition-all ${
                          isScheduled 
                            ? "bg-green-500/10 border-green-500/30 opacity-50" 
                            : "bg-slate-700/30 border-slate-600 hover:bg-slate-700/50"
                        }`}
                      >
                        <div className="font-semibold text-white text-sm mb-1">{task.name}</div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          {Math.round((task.estimatedMinutes || 0) / 60)}h
                          <Users className="w-3 h-3 ml-2" />
                          {task.numberOfEmployees || 1}
                        </div>
                        {isScheduled && (
                          <div className="mt-1 text-xs text-green-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Agendada
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {availableTasks?.filter(task => task.status === "PENDING").length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      Nenhuma tarefa disponível
                    </div>
                  )}
                </div>
              </Card>

              
              {/* Coluna 2 e 3: Timeline do Dia */}
              <div className="lg:col-span-2">
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Cronograma do Dia</h2>
                  
                  <div className="space-y-2">
                    {Array.from({ length: 10 }, (_, i) => {
                      const hour = 7 + i; // 07:00 até 16:00
                      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
                      const scheduledTask = schedule?.scheduledTasks?.find(st => st.scheduledTime === timeSlot);
                      
                      return (
                        <div
                          key={timeSlot}
                          id={`slot-${timeSlot}`}
                          className={`p-4 rounded-lg border-2 border-dashed transition-all min-h-[80px] ${
                            scheduledTask 
                              ? "bg-primary/10 border-primary" 
                              : "bg-slate-800/30 border-slate-700 hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="text-sm font-bold text-slate-400 w-16">{timeSlot}</div>
                            
                            {scheduledTask ? (
                              <div className="flex-1">
                                <div className="font-semibold text-white mb-1">
                                  {scheduledTask.detailedTask?.name}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {Math.round((scheduledTask.detailedTask?.estimatedMinutes || 0) / 60)}h
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {scheduledTask.detailedTask?.numberOfEmployees || 1}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex-1 text-center text-slate-500 text-sm">
                                Arraste uma tarefa para este horário
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </div>
          </DndContext>
        )}
        
        {/* Botões de Ação */}
        {selectedWorkId && schedule && (
          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" onClick={() => navigate("/daily")}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={summary.tasks === 0}>
              <Check className="w-4 h-4 mr-2" />
              Confirmar Planejamento
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
```

### ✅ Checklist PASSO 20-22
- [ ] NextDayPlanning.tsx criado
- [ ] Drag & drop implementado
- [ ] Auto-criação de schedule
- [ ] Cálculo de resumo
- [ ] Confirmação de planejamento
- [ ] Redirecionamento após confirmar

---

# FASE 5: EXECUÇÃO DE TAREFAS

## PASSO 23: CRIAR PÁGINA TaskExecution

### 📋 Objetivo
Página para registrar execução de tarefas passo a passo, com timer e consumo de materiais.

### 📁 Arquivo
`client/src/pages/TaskExecution.tsx` (criar novo)

### 🔌 Endpoints Necessários
- `trpc.detailedTasks.getById` - Buscar tarefa
- `trpc.stepExecutions.start` - Iniciar step
- `trpc.stepExecutions.complete` - Finalizar step
- `trpc.materialConsumptions.record` - Registrar consumo
- `trpc.detailedTasks.complete` - Finalizar tarefa

### 💻 Implementação Completa


```typescript
import React, { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Play, Pause, Check, Clock, AlertCircle, Package } from "lucide-react";
import { format, differenceInSeconds } from "date-fns";
import DashboardLayout from "@/components/DashboardLayout";

interface StepExecution {
  id: number;
  stepId: number;
  startTime?: Date;
  endTime?: Date;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
}

export default function TaskExecution() {
  const [, params] = useRoute("/task/:id/execute");
  const [, navigate] = useLocation();
  const taskId = params?.id ? parseInt(params.id) : null;
  
  // Estados
  const [activeStepId, setActiveStepId] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [stepExecutions, setStepExecutions] = useState<Record<number, StepExecution>>({});
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [selectedStepForMaterial, setSelectedStepForMaterial] = useState<number | null>(null);
  
  // Queries
  const { data: task, refetch: refetchTask } = trpc.detailedTasks.getById.useQuery(
    { id: taskId! },
    { enabled: !!taskId }
  );
  
  const { data: steps } = trpc.taskSteps.getBySubclassWithResources.useQuery(
    { subclassId: task?.taskSubclassId! },
    { enabled: !!task?.taskSubclassId }
  );
  
  // Mutations
  const startStep = trpc.stepExecutions.start.useMutation({
    onSuccess: (data) => {
      setStepExecutions(prev => ({
        ...prev,
        [data.stepId]: { ...data, status: "IN_PROGRESS" }
      }));
      setActiveStepId(data.stepId);
      toast.success("Step iniciado!");
    }
  });
  
  const completeStep = trpc.stepExecutions.complete.useMutation({
    onSuccess: (data) => {
      setStepExecutions(prev => ({
        ...prev,
        [data.stepId]: { ...data, status: "COMPLETED" }
      }));
      setActiveStepId(null);
      setElapsedTime(0);
      toast.success("Step concluído!");
    }
  });
  
  const recordMaterial = trpc.materialConsumptions.record.useMutation({
    onSuccess: () => {
      toast.success("Consumo registrado!");
      setMaterialDialogOpen(false);
    }
  });
  
  const completeTask = trpc.detailedTasks.complete.useMutation({
    onSuccess: () => {
      toast.success("Tarefa concluída!");
      navigate("/daily");
    }
  });

  
  // Timer effect
  useEffect(() => {
    if (!activeStepId) return;
    
    const execution = stepExecutions[activeStepId];
    if (!execution?.startTime) return;
    
    const interval = setInterval(() => {
      const seconds = differenceInSeconds(new Date(), new Date(execution.startTime!));
      setElapsedTime(seconds);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeStepId, stepExecutions]);
  
  // Handlers
  const handleStartStep = (stepId: number) => {
    if (activeStepId) {
      toast.error("Finalize o step atual antes de iniciar outro");
      return;
    }
    
    startStep.mutate({
      detailedTaskId: taskId!,
      stepId: stepId,
      startTime: new Date().toISOString()
    });
  };
  
  const handleCompleteStep = (stepId: number) => {
    const execution = stepExecutions[stepId];
    if (!execution) return;
    
    completeStep.mutate({
      id: execution.id,
      endTime: new Date().toISOString()
    });
  };
  
  const handleRecordMaterial = (data: { materialId: number; quantity: number }) => {
    if (!selectedStepForMaterial) return;
    
    const execution = stepExecutions[selectedStepForMaterial];
    if (!execution) return;
    
    recordMaterial.mutate({
      stepExecutionId: execution.id,
      materialId: data.materialId,
      quantityUsed: data.quantity,
      recordedAt: new Date().toISOString()
    });
  };
  
  const handleCompleteTask = () => {
    const allCompleted = steps?.every(step => 
      stepExecutions[step.id]?.status === "COMPLETED"
    );
    
    if (!allCompleted) {
      toast.error("Complete todos os steps antes de finalizar a tarefa");
      return;
    }
    
    if (confirm("Confirmar conclusão da tarefa?")) {
      completeTask.mutate({
        id: taskId!,
        status: "COMPLETED",
        completedAt: new Date().toISOString()
      });
    }
  };
  
  // Calcular progresso
  const progress = React.useMemo(() => {
    if (!steps) return 0;
    const completed = steps.filter(s => stepExecutions[s.id]?.status === "COMPLETED").length;
    return Math.round((completed / steps.length) * 100);
  }, [steps, stepExecutions]);
  
  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (!task || !steps) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Carregando tarefa...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{task.name}</h1>
          <p className="text-slate-400">{task.description}</p>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-400">Progresso Geral</span>
              <span className="text-sm font-bold text-white">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </div>
        
        {/* Active Step Timer */}
        {activeStepId && (
          <Card className="p-6 mb-6 bg-primary/10 border-primary">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-1">Step em Execução</div>
                <div className="text-xl font-bold text-white">
                  {steps.find(s => s.id === activeStepId)?.name}
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-mono font-bold text-primary mb-2">
                  {formatTime(elapsedTime)}
                </div>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleCompleteStep(activeStepId)}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Finalizar Step
                </Button>
              </div>
            </div>
          </Card>
        )}
        
        {/* Steps List */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const execution = stepExecutions[step.id];
            const isCompleted = execution?.status === "COMPLETED";
            const isActive = activeStepId === step.id;
            const isPending = !execution || execution.status === "PENDING";
            
            return (
              <Card 
                key={step.id} 
                className={`p-6 transition-all ${
                  isActive ? "ring-2 ring-primary" : 
                  isCompleted ? "bg-green-500/10 border-green-500/30" : 
                  "bg-slate-800/50"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Step Number */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    isCompleted ? "bg-green-500 text-white" :
                    isActive ? "bg-primary text-white" :
                    "bg-slate-700 text-slate-400"
                  }`}>
                    {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                  </div>
                  
                  {/* Step Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{step.name}</h3>
                    <p className="text-sm text-slate-400 mb-3">{step.stepType}</p>
                    
                    {/* Recursos */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {step.equipments?.map((eq: any) => (
                        <Badge key={eq.id} variant="outline" className="text-xs">
                          🔧 {eq.equipment.name}
                        </Badge>
                      ))}
                      {step.materials?.map((mat: any) => (
                        <Badge key={mat.id} variant="outline" className="text-xs">
                          📦 {mat.material.name} ({mat.estimatedQuantity} {mat.material.unit})
                        </Badge>
                      ))}
                    </div>
                    
                    {/* Tempo */}
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="w-4 h-4" />
                      Estimado: {Math.round(step.baseTimeMinutes || 0)} min
                      {execution?.startTime && execution?.endTime && (
                        <span className="ml-4 text-green-400">
                          Real: {Math.round(differenceInSeconds(
                            new Date(execution.endTime),
                            new Date(execution.startTime)
                          ) / 60)} min
                        </span>
                      )}
                    </div>
                  </div>

                  
                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {isPending && !activeStepId && (
                      <Button onClick={() => handleStartStep(step.id)} size="sm">
                        <Play className="w-4 h-4 mr-2" />
                        Iniciar
                      </Button>
                    )}
                    
                    {isActive && (
                      <Button onClick={() => handleCompleteStep(step.id)} size="sm" variant="destructive">
                        <Check className="w-4 h-4 mr-2" />
                        Concluir
                      </Button>
                    )}
                    
                    {(isActive || isCompleted) && step.materials && step.materials.length > 0 && (
                      <Button 
                        onClick={() => {
                          setSelectedStepForMaterial(step.id);
                          setMaterialDialogOpen(true);
                        }}
                        size="sm"
                        variant="outline"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Registrar Material
                      </Button>
                    )}
                    
                    {isCompleted && (
                      <Badge className="bg-green-500">
                        <Check className="w-3 h-3 mr-1" />
                        Concluído
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        
        {/* Complete Task Button */}
        {progress === 100 && (
          <div className="mt-8 flex justify-end">
            <Button size="lg" onClick={handleCompleteTask} className="text-lg">
              <Check className="w-5 h-5 mr-2" />
              Finalizar Tarefa Completa
            </Button>
          </div>
        )}
        
        {/* Material Consumption Dialog */}
        <Dialog open={materialDialogOpen} onOpenChange={setMaterialDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Consumo de Material</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleRecordMaterial({
                materialId: parseInt(formData.get("materialId") as string),
                quantity: parseFloat(formData.get("quantity") as string)
              });
            }}>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Material</Label>
                  <select
                    name="materialId"
                    className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white"
                    required
                  >
                    <option value="">Selecione...</option>
                    {selectedStepForMaterial && 
                      steps.find(s => s.id === selectedStepForMaterial)?.materials?.map((mat: any) => (
                        <option key={mat.material.id} value={mat.material.id}>
                          {mat.material.name} (Estimado: {mat.estimatedQuantity} {mat.material.unit})
                        </option>
                      ))
                    }
                  </select>
                </div>
                
                <div>
                  <Label>Quantidade Usada</Label>
                  <Input
                    name="quantity"
                    type="number"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setMaterialDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Registrar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
```

### ✅ Checklist PASSO 23-32
- [ ] TaskExecution.tsx criado
- [ ] Timer de execução implementado
- [ ] Início/fim de steps
- [ ] Registro de consumo de materiais
- [ ] Atualização de estoque (backend)
- [ ] Conclusão da tarefa
- [ ] Progress bar visual
- [ ] Validações implementadas

---

## PASSO 24-32: DETALHES ADICIONAIS DE EXECUÇÃO

### Backend: Atualizar Estoque ao Registrar Consumo

**Em `server/db.ts`:**

```typescript
export async function recordMaterialConsumption(data: {
  stepExecutionId: number;
  materialId: number;
  quantityUsed: number;
  recordedAt: string;
}) {
  // 1. Registrar consumo
  const [consumption] = await db.insert(materialConsumptions).values(data).returning();
  
  // 2. Atualizar estoque
  const material = await db.query.materials.findFirst({
    where: eq(materials.id, data.materialId)
  });
  
  if (material) {
    const newStock = (material.quantityInStock || 0) - data.quantityUsed;
    
    await db.update(materials)
      .set({ quantityInStock: newStock })
      .where(eq(materials.id, data.materialId));
    
    // 3. Criar alerta se estoque baixo
    if (newStock < (material.minStockLevel || 0)) {
      await db.insert(alerts).values({
        type: "LOW_STOCK",
        severity: newStock <= 0 ? "CRITICAL" : "HIGH",
        title: `Estoque Baixo: ${material.name}`,
        message: `Estoque atual: ${newStock} ${material.unit}. Mínimo: ${material.minStockLevel} ${material.unit}`,
        relatedEntityType: "MATERIAL",
        relatedEntityId: material.id,
        isRead: false,
        createdAt: new Date()
      });
    }
  }
  
  return consumption;
}
```

### Registrar Horas Trabalhadas

**Backend:**

```typescript
export async function updateTeamHours(data: {
  taskId: number;
  teamMemberId: number;
  hoursWorked: number;
}) {
  // Atualizar allocation
  await db.update(taskTeamAllocations)
    .set({ 
      hoursWorked: data.hoursWorked,
      updatedAt: new Date()
    })
    .where(and(
      eq(taskTeamAllocations.detailedTaskId, data.taskId),
      eq(taskTeamAllocations.teamMemberId, data.teamMemberId)
    ));
}
```

---

# FASE 6: SISTEMA DE ALERTAS

## PASSO 33-38: ALERTAS AUTOMÁTICOS

### 📋 Objetivo
Sistema completo de alertas com triggers automáticos e página de visualização.

### 📁 Arquivos
- `client/src/pages/Alerts.tsx` (criar)
- `server/alerts.ts` (criar)
- Atualizar `server/db.ts` com funções de alerta

### 💻 Backend - Sistema de Alertas


**Criar `server/alerts.ts`:**

```typescript
import { db } from "./db";
import { alerts } from "../drizzle/schema";

export interface CreateAlertInput {
  type: "LOW_STOCK" | "TASK_OVERRUN" | "GOAL_NOT_MET" | "EQUIPMENT_ISSUE" | "SAFETY_CONCERN";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  workId?: number;
}

export async function createAlert(data: CreateAlertInput) {
  const [alert] = await db.insert(alerts).values({
    ...data,
    isRead: false,
    createdAt: new Date()
  }).returning();
  
  return alert;
}

export async function checkLowStock(materialId: number) {
  const material = await db.query.materials.findFirst({
    where: eq(materials.id, materialId)
  });
  
  if (!material) return;
  
  const stockPercentage = (material.quantityInStock / material.minStockLevel) * 100;
  
  if (stockPercentage < 50) {
    await createAlert({
      type: "LOW_STOCK",
      severity: stockPercentage === 0 ? "CRITICAL" : stockPercentage < 25 ? "HIGH" : "MEDIUM",
      title: `Estoque Baixo: ${material.name}`,
      message: `Estoque atual: ${material.quantityInStock} ${material.unit}. Reposição necessária!`,
      relatedEntityType: "MATERIAL",
      relatedEntityId: material.id
    });
  }
}

export async function checkTaskOverrun(detailedTaskId: number) {
  const task = await db.query.detailedTasks.findFirst({
    where: eq(detailedTasks.id, detailedTaskId)
  });
  
  if (!task || !task.actualMinutes) return;
  
  const overrunPercentage = ((task.actualMinutes - task.estimatedMinutes) / task.estimatedMinutes) * 100;
  
  if (overrunPercentage > 20) {
    await createAlert({
      type: "TASK_OVERRUN",
      severity: overrunPercentage > 50 ? "HIGH" : "MEDIUM",
      title: `Tarefa Excedeu Prazo: ${task.name}`,
      message: `Tempo estimado: ${task.estimatedMinutes}min. Tempo real: ${task.actualMinutes}min (+${Math.round(overrunPercentage)}%)`,
      relatedEntityType: "DETAILED_TASK",
      relatedEntityId: task.id,
      workId: task.workId
    });
  }
}

export async function checkDailyGoal(scheduleId: number) {
  const schedule = await db.query.dailySchedules.findFirst({
    where: eq(dailySchedules.id, scheduleId),
    with: { scheduledTasks: { with: { detailedTask: true } } }
  });
  
  if (!schedule) return;
  
  const completedArea = schedule.scheduledTasks
    .filter(st => st.status === "COMPLETED")
    .reduce((sum, st) => sum + (st.detailedTask?.area || 0), 0);
  
  const targetArea = schedule.targetArea || 0;
  
  if (completedArea < targetArea * 0.8) {
    await createAlert({
      type: "GOAL_NOT_MET",
      severity: "MEDIUM",
      title: "Meta Diária Não Atingida",
      message: `Meta: ${targetArea}m². Realizado: ${completedArea}m² (${Math.round((completedArea/targetArea)*100)}%)`,
      relatedEntityType: "DAILY_SCHEDULE",
      relatedEntityId: schedule.id,
      workId: schedule.workId
    });
  }
}
```

### Frontend - Página de Alertas

**Criar `client/src/pages/Alerts.tsx`:**

```typescript
import React from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, Info, Check, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import DashboardLayout from "@/components/DashboardLayout";

export default function Alerts() {
  const { data: alerts, refetch } = trpc.alerts.getAll.useQuery();
  
  const markAsRead = trpc.alerts.markAsRead.useMutation({
    onSuccess: () => refetch()
  });
  
  const deleteAlert = trpc.alerts.delete.useMutation({
    onSuccess: () => refetch()
  });
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "HIGH":
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case "MEDIUM":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return "bg-red-500/10 border-red-500/30";
      case "HIGH": return "bg-orange-500/10 border-orange-500/30";
      case "MEDIUM": return "bg-yellow-500/10 border-yellow-500/30";
      default: return "bg-blue-500/10 border-blue-500/30";
    }
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Central de Alertas</h1>
          <p className="text-slate-400">
            {alerts?.filter(a => !a.isRead).length || 0} alertas não lidos
          </p>
        </div>
        
        <div className="space-y-4">
          {alerts?.map((alert) => (
            <Card 
              key={alert.id} 
              className={`p-6 ${getSeverityColor(alert.severity)} ${
                !alert.isRead ? "ring-2 ring-primary" : "opacity-60"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getSeverityIcon(alert.severity)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{alert.title}</h3>
                      <p className="text-sm text-slate-300">{alert.message}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      {!alert.isRead && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => markAsRead.mutate({ id: alert.id })}
                          title="Marcar como lido"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteAlert.mutate({ id: alert.id })}
                        title="Excluir"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-3">
                    <Badge variant="outline">{alert.type}</Badge>
                    <Badge variant="outline">{alert.severity}</Badge>
                    <span>{format(new Date(alert.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          {alerts?.length === 0 && (
            <div className="text-center py-12">
              <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Nenhum alerta</h3>
              <p className="text-slate-400">Tudo está funcionando perfeitamente!</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
```

### Badge de Alertas no Navigation

**Atualizar `client/src/components/Navigation.tsx`:**

```typescript
// Adicionar query
const { data: unreadAlerts } = trpc.alerts.getAll.useQuery(
  { unreadOnly: true },
  { refetchInterval: 30000 } // Atualiza a cada 30s
);

const unreadCount = unreadAlerts?.length || 0;

// No menu, adicionar badge:
<Link to="/alerts" className="nav-link">
  <AlertCircle className="w-5 h-5" />
  <span>Alertas</span>
  {unreadCount > 0 && (
    <Badge className="ml-2 bg-red-500">{unreadCount}</Badge>
  )}
</Link>
```

---

# FASE 7: ANÁLISES E RELATÓRIOS

## PASSO 39-45: DASHBOARD DE ANÁLISES

### 📋 Objetivo
Página completa de analytics com gráficos e métricas.

### 📁 Arquivo
`client/src/pages/Analytics.tsx` (criar)

### 📦 Biblioteca de Gráficos
```bash
npm install recharts
```

### 💻 Implementação


```typescript
import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Users, Clock, Package, DollarSign } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { format, subDays } from "date-fns";

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function Analytics() {
  const [selectedWorkId, setSelectedWorkId] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState("7"); // dias
  
  const { data: works } = trpc.works.getAll.useQuery();
  
  // Dados de produtividade
  const { data: productivityData } = trpc.analytics.productivityTrend.useQuery({
    workId: selectedWorkId!,
    days: parseInt(timeRange)
  }, { enabled: !!selectedWorkId });
  
  // Dados de desvios
  const { data: deviationData } = trpc.analytics.taskDeviations.useQuery({
    workId: selectedWorkId!
  }, { enabled: !!selectedWorkId });
  
  // Consumo de materiais
  const { data: materialData } = trpc.analytics.materialConsumption.useQuery({
    workId: selectedWorkId!,
    days: parseInt(timeRange)
  }, { enabled: !!selectedWorkId });
  
  // Performance da equipe
  const { data: teamPerformance } = trpc.analytics.teamPerformance.useQuery({
    workId: selectedWorkId!
  }, { enabled: !!selectedWorkId });
  
  // KPIs
  const kpis = React.useMemo(() => {
    if (!productivityData || productivityData.length === 0) return null;
    
    const latest = productivityData[productivityData.length - 1];
    const previous = productivityData[productivityData.length - 2];
    
    const trend = previous ? ((latest.productivity - previous.productivity) / previous.productivity) * 100 : 0;
    
    return {
      avgProductivity: latest.productivity,
      trend: trend,
      totalArea: productivityData.reduce((sum, d) => sum + d.area, 0),
      totalHours: productivityData.reduce((sum, d) => sum + d.hours, 0)
    };
  }, [productivityData]);
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Analytics & Relatórios</h1>
          <p className="text-slate-400">Análises detalhadas de performance e produtividade</p>
        </div>
        
        {/* Filtros */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">Obra</label>
              <Select value={selectedWorkId?.toString()} onValueChange={(v) => setSelectedWorkId(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma obra" />
                </SelectTrigger>
                <SelectContent>
                  {works?.map((work) => (
                    <SelectItem key={work.id} value={work.id.toString()}>
                      {work.code} - {work.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">Período</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="15">Últimos 15 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
        
        {selectedWorkId && kpis && (
          <>
            {/* KPIs Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Produtividade Média</span>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {kpis.avgProductivity.toFixed(1)} m²/h
                </div>
                <div className={`text-xs flex items-center gap-1 ${kpis.trend >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {kpis.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(kpis.trend).toFixed(1)}% vs período anterior
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Área Total</span>
                  <Package className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {kpis.totalArea.toFixed(0)} m²
                </div>
                <div className="text-xs text-slate-400">
                  Últimos {timeRange} dias
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Horas Trabalhadas</span>
                  <Clock className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {kpis.totalHours.toFixed(0)}h
                </div>
                <div className="text-xs text-slate-400">
                  Total acumulado
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Equipe Ativa</span>
                  <Users className="w-5 h-5 text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {teamPerformance?.length || 0}
                </div>
                <div className="text-xs text-slate-400">
                  Membros trabalhando
                </div>
              </Card>
            </div>
      classId: selectedClassId,
      subclassId: selectedSubclassId,
      name: taskName,
      description,
      estimatedMinutes: totalEstimatedMinutes,
      area,
      height,
      width,
      floors,
      numberOfEmployees
    });
  };
  
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Criar Tarefa Detalhada</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Formulário de seleção */}
          {/* Preview de steps */}
          {/* Botão de criar */}
        </form>
      </div>
    </DashboardLayout>
  );
}
```

### ✅ Checklist
- [ ] Formulário com campos de obra, classe, subclasse
- [ ] Cálculo automático de tempo baseado em área/andares
- [ ] Preview dos steps que serão criados
- [ ] Criar detailed_task no banco
- [ ] Redirecionar para /daily após criar

---

## PASSO 14: SELEÇÃO DE CLASSE/SUBCLASSE

### 📋 Objetivo
Interface para selecionar classe e subclasse de tarefa.

### 🎯 Instruções
1. Criar Select para Classe
2. Ao selecionar classe, habilitar Select de Subclasse
3. Buscar subclasses com `trpc.taskSubclasses.getByClass`
4. Ao selecionar subclasse, buscar steps automaticamente

### 🔌 Endpoints
- `trpc.taskClasses.getAll`
- `trpc.taskSubclasses.getByClass`

---

## PASSO 15: BUSCAR STEPS AUTOMATICAMENTE

### 📋 Objetivo
Ao selecionar subclasse, buscar todos os steps vinculados.

### 🎯 Instruções
1. Usar `trpc.taskSteps.getBySubclass` com `enabled: !!selectedSubclassId`
2. Exibir lista de steps em preview
3. Para cada step, mostrar: nome, tipo, tempo estimado

---

## PASSO 16: BUSCAR EQUIPAMENTOS/MATERIAIS DOS STEPS

### 📋 Objetivo
Para cada step, buscar equipamentos e materiais necessários.

### 🎯 Instruções
1. Para cada step no preview, fazer query de `stepEquipments` e `stepMaterials`
2. Exibir badges com ícones mostrando quantos equipamentos/materiais são necessários
3. Tooltip ao passar mouse mostrando detalhes

### 🔌 Endpoints
- `trpc.stepEquipments.getByStep`
- `trpc.stepMaterials.getByStep`

---

## PASSO 17: CALCULAR TEMPO TOTAL

### 📋 Objetivo
Calcular tempo estimado baseado em área, andares, etc.

### 🎯 Instruções
1. Para cada step, verificar `timeCalculationType`
2. Aplicar fórmula correspondente:
   - `FIXED`: usar `baseTimeMinutes`
   - `PER_M2`: multiplicar área por `timeCalculationValue`
   - `PER_FLOOR`: multiplicar andares por `timeCalculationValue`
   - `PERCENTAGE_EXECUTION`: calcular % do tempo total de execução
3. Somar todos os tempos e exibir total
4. Atualizar em tempo real quando usuário mudar área/andares

### 💡 Dica
Use `useEffect` com dependências em `[steps, area, floors]` para recalcular automaticamente.

---

## PASSO 18: CRIAR DETAILED_TASK

### 📋 Objetivo
Salvar tarefa detalhada no banco de dados.

### 🎯 Instruções
1. Validar campos obrigatórios: workId, classId, subclassId, name
2. Chamar `trpc.detailedTasks.create` com todos os dados
3. Exibir toast de sucesso
4. Armazenar ID retornado para próximo passo

### 🔌 Endpoint
- `trpc.detailedTasks.create`

### 📦 Campos a Enviar
- workId, classId, subclassId
- name, description
- estimatedMinutes (calculado)
- area, height, width, floors
- numberOfEmployees

---

## PASSO 19: REDIRECIONAR PARA DAILY

### 📋 Objetivo
Após criar, redirecionar para /daily para agendar a tarefa.

### 🎯 Instruções
1. No `onSuccess` da mutation, usar `navigate()` do wouter
2. Passar data selecionada como query param
3. Passar ID da tarefa criada para destacar na tela
4. URL final: `/daily?date=2026-07-01&highlight=123`

### 💡 Dica
Na página Daily, ler o param `highlight` e aplicar animação na tarefa correspondente.

---

# FASE 4: NEXT DAY PLANNING

## PASSO 20: INTEGRAR NextDayPlanning COM BANCO

### 📋 Objetivo
Substituir mock por dados reais do dia seguinte.

### 📁 Arquivo
`client/src/pages/NextDayPlanning.tsx`

### 🎯 Instruções
1. Calcular data de amanhã: `const tomorrow = add(new Date(), { days: 1 })`
2. Buscar daily_schedule de amanhã com `trpc.dailySchedules.getByDate`
3. Buscar scheduled_tasks de amanhã
4. Se não existir daily_schedule, criar automaticamente

### 🔌 Endpoints
- `trpc.dailySchedules.getByDate`
- `trpc.scheduledTasks.getBySchedule`
- `trpc.dailySchedules.create`

---

## PASSO 21: CRIAR DAILY_SCHEDULE AUTOMATICAMENTE

### 📋 Objetivo
Se não existir cronograma para amanhã, criar automaticamente.

### 🎯 Instruções
1. No `useEffect`, verificar se `dailySchedule` existe
2. Se não existir, chamar `createSchedule.mutate({ workId, date: tomorrow })`
3. Após criar, buscar novamente os dados
4. Exibir loader durante criação

### 💡 Lógica
```typescript
useEffect(() => {
  if (!dailySchedule && workId && !isLoading) {
    createSchedule.mutate({ workId, date: tomorrowDate });
  }
}, [dailySchedule, workId, isLoading]);
```

---

## PASSO 22: BOTÃO CONFIRMAR PLANEJAMENTO

### 📋 Objetivo
Ao confirmar, salvar todas as tarefas agendadas.

### 🎯 Instruções
1. Criar botão "Confirmar Planejamento" no rodapé
2. Ao clicar, iterar sobre todas as scheduled_tasks
3. Atualizar status de cada tarefa para "confirmed"
4. Atualizar status do daily_schedule para "confirmed"
5. Exibir toast de sucesso
6. Redirecionar para /daily do dia seguinte

### 🔌 Mutations Necessárias
- `trpc.scheduledTasks.updateBatch`
- `trpc.dailySchedules.updateStatus`

---

# FASE 5: EXECUÇÃO DE TAREFAS

## PASSO 23: CRIAR PÁGINA TaskExecution

### 📋 Objetivo
Nova página para registrar execução passo a passo.

### 📁 Arquivo
`client/src/pages/TaskExecution.tsx` (criar novo arquivo)

### 📍 Rota
`/task/:id/execute`

### 🎯 Estrutura Básica
1. Receber taskId da URL com `useParams()`
2. Buscar detailed_task pelo ID
3. Buscar todos os steps da subclasse
4. Criar lista de execução com checkboxes
5. Layout com sidebar de steps e área principal de execução

### 🔌 Endpoints
- `trpc.detailedTasks.getById`
- `trpc.taskSteps.getBySubclass`
- `trpc.stepExecutions.getByTask`

---

## PASSO 24: LISTAR STEPS DA TAREFA

### 📋 Objetivo
Mostrar todos os steps da detailed_task em lista ordenada.

### 🎯 Instruções
1. Renderizar lista vertical de steps
2. Cada step deve mostrar: ícone, nome, tempo estimado, status
3. Status pode ser: pending, in_progress, completed
4. Steps já executados devem mostrar tempo real gasto
5. Step atual deve estar destacado

### 🎨 UI Sugerida
- Step pendente: cinza
- Step em andamento: amarelo com spinner
- Step concluído: verde com checkmark

---

## PASSO 25: INICIAR STEP

### 📋 Objetivo
Botão para iniciar execução de um step.

### 🎯 Instruções
1. Criar botão "Iniciar" visível apenas em steps pendentes
2. Ao clicar, criar registro em `step_executions`
3. Salvar `startTime` como timestamp atual
4. Atualizar UI para mostrar timer em andamento
5. Desabilitar botão de iniciar outros steps

### 🔌 Endpoint
- `trpc.stepExecutions.start`

### 📦 Dados a Enviar
- detailedTaskId
- stepId
- startTime: `new Date().toISOString()`
- executedBy: userId atual

---

## PASSO 26: TIMER DE EXECUÇÃO

### 📋 Objetivo
Timer contando tempo desde startTime em tempo real.

### 🎯 Instruções
1. Usar `useEffect` com `setInterval` para atualizar a cada segundo
2. Calcular diferença entre `Date.now()` e `startTime`
3. Formatar como "HH:mm:ss"
4. Exibir de forma destacada ao lado do step em execução
5. Limpar interval no cleanup do useEffect

### 💡 Exemplo
```typescript
useEffect(() => {
  if (!currentExecution) return;
  
  const interval = setInterval(() => {
    const elapsed = Date.now() - new Date(currentExecution.startTime).getTime();
    setElapsedSeconds(Math.floor(elapsed / 1000));
  }, 1000);
  
  return () => clearInterval(interval);
}, [currentExecution]);
```

---

## PASSO 27: CONCLUIR STEP

### 📋 Objetivo
Botão para finalizar step e registrar endTime.

### 🎯 Instruções
1. Botão "Concluir" visível apenas em step em andamento
2. Ao clicar, atualizar step_execution com `endTime`
3. Calcular `actualMinutes` automaticamente
4. Comparar com `estimatedMinutes` e mostrar desvio
5. Habilitar botão de iniciar próximo step
6. Exibir toast com resumo: "Step concluído em X min (Y% mais rápido/lento)"

### 🔌 Endpoint
- `trpc.stepExecutions.complete`

### 📦 Dados
- id: step_execution.id
- endTime: `new Date().toISOString()`
- actualMinutes: calculado automaticamente no backend

---

## PASSO 28: REGISTRAR CONSUMO DE MATERIAL

### 📋 Objetivo
Interface para informar quantidade real usada de cada material.

### 🎯 Instruções
1. Ao concluir step, abrir modal "Confirmar Materiais"
2. Listar todos os materiais do step com quantidade planejada
3. Input para usuário informar quantidade real consumida
4. Calcular diferença (planejado vs real)
5. Salvar em `material_consumptions`

### 🔌 Endpoint
- `trpc.materialConsumptions.record`

### 📦 Dados
- stepExecutionId
- materialId
- plannedQuantity (do step_materials)
- actualQuantity (input do usuário)
- unit

### 💡 UI Sugerida
```
Material: Tinta Branca
Planejado: 5.0 L
Real: [_____] L
Diferença: +0.5 L (10% a mais)
```

---

## PASSO 29: ATUALIZAR ESTOQUE

### 📋 Objetivo
Ao registrar consumo, diminuir quantityInStock automaticamente.

### 📁 Arquivo Backend
`server/db.ts` - função `recordMaterialConsumption`

### 🎯 Instruções
1. Ao salvar material_consumption, buscar material atual
2. Subtrair `actualQuantity` de `quantityInStock`
3. Atualizar registro do material
4. Se estoque ficar < minStockLevel, criar alerta automático
5. Retornar novo estoque

### 💡 Lógica SQL
```typescript
const material = await db.getMaterialById(materialId);
const newStock = material.quantityInStock - actualQuantity;

await db.updateMaterial(materialId, { 
  quantityInStock: newStock 
});

if (newStock < material.minStockLevel) {
  await db.createAlert({
    type: 'STOCK_LOW',
    message: `Estoque baixo: ${material.name}`,
    // ...
  });
}
```

---

## PASSO 30: REGISTRAR HORAS TRABALHADAS

### 📋 Objetivo
Atualizar hoursWorked da equipe alocada.

### 🎯 Instruções
1. Ao concluir step, buscar task_team_allocations da tarefa
2. Para cada membro alocado, calcular horas trabalhadas
3. Atualizar campo `hoursWorked` em task_team_allocations
4. Se step durou mais que previsto, marcar como overtime

### 🔌 Endpoint
- `trpc.taskTeamAllocations.updateHours`

### 📦 Cálculo
```
hoursWorked = actualMinutes / 60
```

---

## PASSO 31: CONCLUIR TAREFA COMPLETA

### 📋 Objetivo
Ao concluir último step, marcar tarefa inteira como concluída.

### 🎯 Instruções
1. Verificar se todos os steps foram executados
2. Se sim, atualizar `detailed_task` com status "completed"
3. Atualizar `scheduled_task` correspondente
4. Atualizar `daily_schedule` com área concluída
5. Calcular métricas finais: tempo total, desvio, produtividade
6. Exibir modal de conclusão com resumo

### 🔌 Endpoints
- `trpc.detailedTasks.complete`
- `trpc.scheduledTasks.updateStatus`
- `trpc.dailySchedules.updateProgress`

### 📊 Métricas a Calcular
- Tempo total gasto vs estimado
- Produtividade real (m²/hora)
- Desvio percentual
- Materiais consumidos vs planejados

---

## PASSO 32: CRIAR PRODUCTIVITY HISTORY

### 📋 Objetivo
Ao concluir tarefa, registrar em productivity_history para análises.

### 📁 Arquivo Backend
`server/db.ts` - função `recordProductivity`

### 🎯 Instruções
1. Após completar detailed_task, criar registro em productivity_history
2. Calcular métricas de produtividade
3. Associar com obra, classe, subclasse
4. Salvar para uso em gráficos e relatórios

### 📦 Dados a Salvar
- workId, classId, subclassId
- date
- areaCompleted
- timeSpentMinutes
- productivityRate (m²/hora ou m²/dia)
- numberOfEmployees
- weatherCondition (se disponível)
- deviationPercentage

### 🔌 Endpoint
- `trpc.productivity.record`

---

# FASE 6: SISTEMA DE ALERTAS

## PASSO 33: CRIAR SISTEMA DE ALERTAS AUTOMÁTICOS

### 📋 Objetivo
Função para criar alertas baseado em condições do sistema.

### 📁 Arquivos
- `server/db.ts` - função `createAlert`
- `server/alerts.ts` (criar novo) - lógica de triggers

### 🎯 Instruções
1. Criar tabela `alerts` se ainda não existe (verificar schema)
2. Implementar função genérica `createAlert(type, message, data)`
3. Tipos de alerta: STOCK_LOW, TASK_DELAYED, GOAL_NOT_MET, WEATHER_WARNING
4. Cada alerta tem: type, message, severity, workId, createdAt, readAt

### 💡 Estrutura
```typescript
export async function createAlert(data: {
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  workId: number;
  relatedId?: number;
  metadata?: any;
}) {
  // Inserir no banco
  // Enviar notificação (futuro: WebSocket)
  // Retornar alerta criado
}
```

---

## PASSO 34: ALERTA - ESTOQUE BAIXO

### 📋 Objetivo
Criar alerta quando material < minStockLevel.

### 📁 Arquivo
`server/db.ts` - dentro de `recordMaterialConsumption`

### 🎯 Instruções
1. Após atualizar estoque, verificar se `quantityInStock < minStockLevel`
2. Se sim, chamar `createAlert({ type: 'STOCK_LOW', ... })`
3. Incluir no alerta: nome do material, estoque atual, estoque mínimo
4. Severity baseada na urgência:
   - `high`: estoque = 0
   - `medium`: estoque < 50% do mínimo
   - `low`: estoque < mínimo

### 💡 Exemplo
```typescript
if (newStock < material.minStockLevel) {
  const severity = newStock === 0 ? 'high' : 
                   newStock < (material.minStockLevel * 0.5) ? 'medium' : 'low';
  
  await createAlert({
    type: 'STOCK_LOW',
    message: `Estoque baixo: ${material.name} (${newStock} ${material.unit})`,
    severity,
    workId: material.workId,
    relatedId: material.id,
    metadata: { materialId: material.id, currentStock: newStock }
  });
}
```

---

## PASSO 35: ALERTA - TAREFA ATRASADA

### 📋 Objetivo
Alerta quando actualMinutes > estimatedMinutes * 1.2 (20% mais lento).

### 🎯 Instruções
1. Ao completar step, comparar tempo real vs estimado
2. Se desvio > 20%, criar alerta
3. Incluir nome da tarefa, step, desvio percentual
4. Permitir que gerente tome ação corretiva

### 💡 Lógica
```typescript
const deviation = ((actualMinutes - estimatedMinutes) / estimatedMinutes) * 100;

if (deviation > 20) {
  await createAlert({
    type: 'TASK_DELAYED',
    message: `Tarefa atrasada: ${task.name} (${deviation.toFixed(0)}% mais lento)`,
    severity: deviation > 50 ? 'high' : 'medium',
    workId: task.workId,
    relatedId: task.id
  });
}
```

---

## PASSO 36: ALERTA - META DIÁRIA NÃO ATINGIDA

### 📋 Objetivo
Ao final do dia, verificar se meta foi atingida.

### 🎯 Instruções
1. Criar job agendado ou verificação manual ao fim do expediente
2. Comparar `completedArea` vs `targetArea` do daily_schedule
3. Se completedArea < targetArea, criar alerta
4. Incluir análise de motivos (tarefas atrasadas, ausências, clima)

### 💡 Implementação
- Pode ser verificado ao clicar em "Finalizar Dia"
- Ou criar endpoint separado `/check-daily-goal`
- Backend calcula e cria alerta se necessário

### 📦 Dados do Alerta
```typescript
{
  type: 'GOAL_NOT_MET',
  message: `Meta do dia não atingida: ${completedArea}m² de ${targetArea}m²`,
  severity: 'medium',
  metadata: {
    targetArea,
    completedArea,
    percentage: (completedArea / targetArea) * 100
  }
}
```

---

## PASSO 37: PÁGINA DE ALERTAS

### 📋 Objetivo
Listar todos os alertas do sistema com filtros.

### 📁 Arquivo
`client/src/pages/Alerts.tsx` (criar novo)

### 📍 Rota
`/alerts`

### 🎯 Instruções
1. Buscar alertas com `trpc.alerts.getAll`
2. Permitir filtros: tipo, severity, obra, lido/não lido
3. Ordenar por data (mais recentes primeiro)
4. Marcar como lido ao clicar
5. Ações rápidas: "Marcar todos como lidos", "Arquivar"

### 🔌 Endpoints
- `trpc.alerts.getAll`
- `trpc.alerts.markAsRead`
- `trpc.alerts.delete`

### 🎨 UI Sugerida
- Severity high: fundo vermelho
- Severity medium: fundo amarelo
- Severity low: fundo azul
- Alertas não lidos: badge com contador

---

## PASSO 38: BADGE DE ALERTAS NO NAVIGATION

### 📋 Objetivo
Mostrar contador de alertas não lidos no menu.

### 📁 Arquivo
`client/src/components/Navigation.tsx`

### 🎯 Instruções
1. Buscar alertas não lidos com `trpc.alerts.getUnreadCount`
2. Exibir badge com número ao lado do ícone de sino
3. Atualizar em tempo real quando novos alertas chegarem
4. Ao clicar, navegar para `/alerts`
5. Se contador > 0, fazer ícone pulsar

### 💡 Exemplo
```typescript
const { data: unreadCount = 0 } = trpc.alerts.getUnreadCount.useQuery(
  { workId: selectedWorkId! },
  { enabled: !!selectedWorkId, refetchInterval: 30000 } // Atualiza a cada 30s
);

<Badge variant="destructive" className="absolute -top-1 -right-1">
  {unreadCount}
</Badge>
```

---

# FASE 7: ANÁLISES E RELATÓRIOS

## PASSO 39: DASHBOARD DE ANÁLISES

### 📋 Objetivo
Página com gráficos e análises de produtividade.

### 📁 Arquivo
`client/src/pages/Analytics.tsx` (criar novo)

### 📍 Rota
`/analytics`

### 🎯 Estrutura
1. Filtros: obra, período (última semana, mês, trimestre)
2. Cards com métricas principais: produtividade média, desvio médio, tarefas concluídas
3. Seção de gráficos (4-5 gráficos principais)
4. Botões de exportar relatórios

### 📊 Bibliotecas Sugeridas
- `recharts` ou `chart.js` para gráficos
- `date-fns` para manipulação de datas

---

## PASSO 40: GRÁFICO DE PRODUTIVIDADE AO LONGO DO TEMPO

### 📋 Objetivo
Line chart mostrando evolução da produtividade.

### 🎯 Instruções
1. Buscar dados de `productivity_history` com `trpc.productivity.getTimeSeries`
2. Eixo X: datas
3. Eixo Y: produtividade (m²/dia)
4. Mostrar linha de meta (produtividade esperada)
5. Cores: verde quando acima da meta, vermelho quando abaixo

### 🔌 Endpoint
- `trpc.productivity.getTimeSeries` (criar se não existe)

### 📦 Query Params
- workId
- startDate
- endDate

---

## PASSO 41: GRÁFICO DE DESVIOS POR TIPO DE TAREFA

### 📋 Objetivo
Bar chart comparando estimado vs real por classe de tarefa.

### 🎯 Instruções
1. Agrupar tarefas por `classId`
2. Calcular média de desvio para cada classe
3. Renderizar barras horizontais
4. Cor verde para desvios negativos (mais rápido)
5. Cor vermelha para desvios positivos (mais lento)

### 🔌 Endpoint
- `trpc.reports.deviationByClass`

---

## PASSO 42: GRÁFICO DE CONSUMO DE MATERIAIS

### 📋 Objetivo
Comparar planejado vs consumido para principais materiais.

### 🎯 Instruções
1. Buscar top 10 materiais mais consumidos
2. Para cada material, somar planejado e real
3. Gráfico de barras agrupadas (planejado e real lado a lado)
4. Calcular % de desvio
5. Destacar materiais com desvio > 15%

### 🔌 Endpoint
- `trpc.materialConsumptions.summary` (criar)

---

## PASSO 43: RANKING DE PERFORMANCE DA EQUIPE

### 📋 Objetivo
Mostrar produtividade média de cada membro da equipe.

### 🎯 Instruções
1. Buscar team_members com cálculo de produtividade
2. Ordenar por produtividade (maior para menor)
3. Exibir em tabela: nome, função, produtividade, horas trabalhadas
4. Badge para top 3 performers
5. Gráfico de radar comparando habilidades

### 🔌 Endpoint
- `trpc.teamMembers.getWithProductivity`

---

## PASSO 44: RELATÓRIO DIÁRIO EXPORTÁVEL (PDF)

### 📋 Objetivo
Gerar PDF do relatório diário para enviar por email ou imprimir.

### 📁 Arquivo Backend
`server/reports.ts` (criar novo arquivo)

### 🎯 Instruções
1. Instalar biblioteca: `npm install pdfkit` ou `puppeteer`
2. Criar endpoint `trpc.reports.generateDailyPDF`
3. Template deve incluir:
   - Cabeçalho com logo e data
   - Resumo do dia: tarefas concluídas, área, horas
   - Lista de tarefas executadas com tempos
   - Consumo de materiais
   - Alertas do dia
   - Assinatura do responsável
4. Retornar buffer ou URL temporária do PDF

### 🔌 Endpoint
- `trpc.reports.generateDailyPDF`

### 💡 Alternativa Simples
Se PDF for complexo, começar com HTML estilizado que pode ser impresso via navegador (window.print).

---

## PASSO 45: RELATÓRIO SEMANAL EXPORTÁVEL (EXCEL)

### 📋 Objetivo
Gerar Excel do relatório semanal com múltiplas abas.

### 🎯 Instruções
1. Instalar: `npm install exceljs`
2. Criar endpoint `trpc.reports.generateWeeklyExcel`
3. Abas do Excel:
   - **Resumo**: métricas gerais da semana
   - **Tarefas**: lista todas as tarefas executadas
   - **Materiais**: consumo detalhado
   - **Equipe**: horas trabalhadas por pessoa
   - **Gráficos**: produtividade e desvios (se possível)
4. Aplicar formatação: cores, bordas, células mescladas
5. Retornar arquivo para download

### 🔌 Endpoint
- `trpc.reports.generateWeeklyExcel`

### 📦 Dados a Incluir
- Período (início e fim da semana)
- Total de área concluída
- Produtividade média
- Desvios por dia
- Ranking de tarefas mais demoradas

---

# FASE 8: PROJETOS HIERÁRQUICOS E WBS

## PASSO 46: BOTÃO CRIAR PROJETO WBS

### 📋 Objetivo
Ao criar obra, oferecer opção de gerar estrutura WBS automaticamente.

### 📁 Arquivo
`client/src/pages/ProjectsList.tsx` ou página de criação de projetos

### 🎯 Instruções
1. Ao salvar novo projeto, abrir modal "Gerar WBS?"
2. Perguntar: tipo de obra (residencial, comercial, industrial)
3. Confirmar área total
4. Botão "Gerar Estrutura Automática"
5. Se usuário aceitar, chamar endpoint de geração

### 💡 UX
- Explicar o que é WBS: "Work Breakdown Structure - divisão hierárquica do projeto"
- Mencionar que pode ser editado depois
- Opção de criar projeto vazio (sem WBS)

---

## PASSO 47: GERADOR AUTOMÁTICO DE WBS

### 📋 Objetivo
Função que gera fases e tarefas automaticamente baseado em templates.

### 📁 Arquivo Backend
`server/db.ts` - função `generateWBS`

### 🎯 Instruções
1. Receber: workId, workType, totalArea
2. Buscar templates de fases típicas (ex: Preparação, Execução, Acabamento)
3. Para cada fase, criar registro em `project_phases`
4. Para cada fase, gerar `project_tasks` baseado em área e tipo
5. Calcular dependências entre tarefas
6. Atribuir ordem e datas estimadas

### 📦 Exemplo de Estrutura
```
Projeto: Pintura Residencial 200m²
├─ FASE 1: Preparação (20% do tempo)
│  ├─ Limpeza geral
│  ├─ Proteção de áreas
│  └─ Lixamento
├─ FASE 2: Execução (60% do tempo)
│  ├─ Primeira demão
│  ├─ Segunda demão
│  └─ Retoques
└─ FASE 3: Acabamento (20% do tempo)
   ├─ Limpeza final
   └─ Vistoria
```

### 🔌 Endpoint
- `trpc.projects.generateWBS`

---

## PASSO 48: PÁGINA ProjectKanban

### 📋 Objetivo
Kanban para gerenciar project_tasks de forma visual.

### 📁 Arquivo
`client/src/pages/ProjectKanban.tsx` (já existe, precisa integrar)

### 🎯 Instruções
1. Buscar project_tasks com `trpc.projectTasks.getByWork`
2. Agrupar por status: backlog, scheduled, in_progress, completed
3. Implementar drag & drop entre colunas (usar `@dnd-kit/core`)
4. Ao mover tarefa, atualizar status no banco
5. Permitir editar tarefa ao clicar

### 🔌 Endpoints
- `trpc.projectTasks.getByWork`
- `trpc.projectTasks.updateStatus`

### 🎨 Colunas
- **Backlog**: tarefas ainda não agendadas
- **Agendado**: tarefas com data definida
- **Em Execução**: tarefas sendo realizadas
- **Concluído**: tarefas finalizadas

---

## PASSO 49: INTEGRAR ProjectKanban COM DailySchedule

### 📋 Objetivo
Ao arrastar tarefa para "Agendado", criar detailed_task e agendar.

### 🎯 Instruções
1. Ao mover project_task para coluna "Agendado", abrir modal
2. Modal pergunta: "Para qual data deseja agendar?"
3. Ao confirmar:
   - Criar detailed_task baseada no project_task
   - Criar scheduled_task para a data escolhida
   - Vincular com daily_schedule correspondente
   - Atualizar status do project_task
4. Redirecionar para /daily da data escolhida

### 🔌 Mutations
- `trpc.detailedTasks.createFromProjectTask`
- `trpc.scheduledTasks.create`

---

## PASSO 50: SISTEMA DE DEPENDÊNCIAS DE TAREFAS

### 📋 Objetivo
Implementar bloqueio de tarefas baseado em dependências.

### 🎯 Instruções
1. No schema, `project_tasks` tem campo `dependsOnTaskIds` (array)
2. Ao tentar iniciar tarefa, verificar se dependências foram concluídas
3. Se não foram, exibir alerta: "Esta tarefa depende de X, Y, Z"
4. Mostrar ícone de cadeado em tarefas bloqueadas
5. Ao concluir tarefa, verificar quais tarefas ficam desbloqueadas

### 💡 Validação
```typescript
const canStartTask = (task: ProjectTask, allTasks: ProjectTask[]) => {
  if (!task.dependsOnTaskIds || task.dependsOnTaskIds.length === 0) {
    return true;
  }
  
  const dependencies = allTasks.filter(t => 
    task.dependsOnTaskIds!.includes(t.id)
  );
  
  return dependencies.every(dep => dep.status === 'completed');
};
```

---

# FASE 9: RECURSOS AVANÇADOS

## PASSO 51: IMPLEMENTAR WEBSOCKETS PARA NOTIFICAÇÕES

### 📋 Objetivo
Notificações em tempo real quando algo importante acontece.

### 📁 Arquivo Backend
`server/_core/websocket.ts` (criar novo)

### 🎯 Instruções
1. Instalar: `npm install socket.io`
2. Configurar servidor WebSocket no Express
3. Emitir eventos para:
   - Novo alerta criado
   - Tarefa concluída por outro usuário
   - Estoque atualizado
   - Meta diária atingida
4. No frontend, conectar e escutar eventos
5. Mostrar toast quando receber notificação

### 💡 Estrutura Backend
```typescript
import { Server } from 'socket.io';

export function setupWebSocket(httpServer: any) {
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });
  
  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);
    
    socket.on('join-work', (workId: number) => {
      socket.join(`work-${workId}`);
    });
  });
  
  return io;
}

export function emitAlert(io: any, workId: number, alert: any) {
  io.to(`work-${workId}`).emit('new-alert', alert);
}
```

### 💡 Estrutura Frontend
```typescript
import { io } from 'socket.io-client';

useEffect(() => {
  const socket = io('http://localhost:3000');
  
  socket.on('new-alert', (alert) => {
    toast.warning(alert.message);
    refetchAlerts();
  });
  
  socket.emit('join-work', selectedWorkId);
  
  return () => { socket.disconnect(); };
}, [selectedWorkId]);
```

---

## PASSO 52: SERVICE WORKER PARA PWA

### 📋 Objetivo
Transformar aplicação em Progressive Web App para funcionar offline.

### 📁 Arquivos
- `client/public/sw.js` (criar service worker)
- `client/public/manifest.json` (já existe, verificar)
- `client/src/main.tsx` (registrar service worker)

### 🎯 Instruções
1. Criar service worker que intercepta requests
2. Cachear assets estáticos (CSS, JS, imagens)
3. Implementar estratégias de cache:
   - **Cache First**: para assets estáticos
   - **Network First**: para API calls
   - **Stale While Revalidate**: para dados que mudam pouco
4. Permitir adicionar app à tela inicial do celular
5. Funcionar mesmo sem internet (dados em cache)

### 💡 Service Worker Básico
```javascript
const CACHE_NAME = 'erp-restauro-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

### 📦 Registrar no main.tsx
```typescript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW registrado', reg))
    .catch(err => console.log('Erro no SW', err));
}
```

---

## PASSO 53: INDEXEDDB PARA MODO OFFLINE

### 📋 Objetivo
Salvar dados localmente para funcionar sem internet.

### 🎯 Instruções
1. Instalar: `npm install dexie`
2. Criar `client/src/lib/offline.ts`
3. Definir schema do IndexedDB com tabelas principais
4. Sincronizar dados ao carregar app (se online)
5. Salvar modificações localmente se offline
6. Ao voltar online, sincronizar mudanças

### 💡 Estrutura com Dexie
```typescript
import Dexie, { Table } from 'dexie';

class OfflineDB extends Dexie {
  works!: Table<any>;
  tasks!: Table<any>;
  materials!: Table<any>;
  equipments!: Table<any>;
  
  constructor() {
    super('ERPRestauroOffline');
    this.version(1).stores({
      works: 'id, name',
      tasks: 'id, workId, date, status',
      materials: 'id, name, quantityInStock',
      equipments: 'id, name'
    });
  }
}

export const db = new OfflineDB();
```

### 🎯 Uso no Frontend
```typescript
// Salvar localmente
await db.tasks.put({ id: 1, name: 'Tarefa', status: 'pending' });

// Buscar local
const tasks = await db.tasks.where('workId').equals(1).toArray();

// Verificar se está online
const isOnline = navigator.onLine;
```

---

## PASSO 54: SINCRONIZAÇÃO OFFLINE → ONLINE

### 📋 Objetivo
Quando voltar online, sincronizar mudanças locais com servidor.

### 🎯 Instruções
1. Criar fila de operações pendentes em IndexedDB
2. Ao fazer operação offline, salvar em `pendingOperations`
3. Escutar evento `online` do navegador
4. Ao voltar online, processar fila sequencialmente
5. Para cada operação:
   - Tentar executar no servidor
   - Se sucesso, remover da fila
   - Se erro, manter na fila e exibir alerta
6. Resolver conflitos (se dado mudou no servidor)

### 💡 Fila de Operações
```typescript
interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'task' | 'material' | 'equipment';
  data: any;
  timestamp: number;
}

export async function queueOperation(op: PendingOperation) {
  await db.pendingOperations.add(op);
}

export async function syncPendingOperations() {
  const pending = await db.pendingOperations.toArray();
  
  for (const op of pending) {
    try {
      // Executar operação via tRPC
      await executeOperation(op);
      await db.pendingOperations.delete(op.id);
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      // Manter na fila para tentar depois
    }
  }
}

// Escutar evento online
window.addEventListener('online', () => {
  toast.success('Conexão restaurada! Sincronizando...');
  syncPendingOperations();
});
```

---

## PASSO 55: INTEGRAÇÃO COM API DE CLIMA

### 📋 Objetivo
Buscar clima do dia automaticamente para registrar condições de trabalho.

### 📁 Arquivo Backend
`server/integrations/weather.ts` (criar novo)

### 🎯 Instruções
1. Escolher API: OpenWeatherMap (gratuita até 1000 req/dia)
2. Criar conta e obter API key
3. Salvar key em `.env`: `WEATHER_API_KEY=...`
4. Criar função que busca clima baseado em coordenadas da obra
5. Salvar resultado em `daily_schedules.weatherCondition`
6. Atualizar automaticamente toda manhã (ou ao criar cronograma)

### 🔌 API OpenWeatherMap
```typescript
export async function getWeather(lat: number, lon: number) {
  const apiKey = process.env.WEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  return {
    description: data.weather[0].description, // "céu limpo", "chuva"
    temp: data.main.temp,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed
  };
}
```

### 💡 Uso
```typescript
// Ao criar daily_schedule:
const work = await db.getWorkById(workId);
if (work.latitude && work.longitude) {
  const weather = await getWeather(work.latitude, work.longitude);
  await db.updateDailySchedule(scheduleId, {
    weatherCondition: weather.description,
    temperature: weather.temp
  });
}
```

### 🎨 UI
- Exibir ícone de clima no header do DailyDashboard
- Tooltip com detalhes: temperatura, umidade, vento
- Alerta se clima for ruim para trabalho externo

---

# 🎉 CONCLUSÃO

## ✅ CHECKLIST FINAL

Ao completar todos os 55 passos, você terá:

### ✅ Backend Completo
- [x] Banco de dados 100% relacional
- [x] Endpoints tRPC para todas as operações
- [x] Sistema de alertas automáticos
- [x] Geração de relatórios PDF e Excel
- [x] API de clima integrada
- [x] WebSockets para tempo real

### ✅ Frontend Completo
- [x] Catálogo de recursos com CRUD
- [x] Templates de tarefas hierárquicos
- [x] Criação de tarefas detalhadas
- [x] Planejamento diário e semanal
- [x] Execução passo a passo
- [x] Dashboard de análises
- [x] Sistema de alertas visual
- [x] Kanban de projetos
- [x] Modo offline (PWA)

### ✅ Features Avançadas
- [x] WBS automático
- [x] Dependências entre tarefas
- [x] Sincronização offline
- [x] Notificações em tempo real
- [x] Controle de estoque automático
- [x] Histórico de produtividade
- [x] Ranking de equipe

---

## 🚀 PRÓXIMOS PASSOS SUGERIDOS (Além dos 55)

1. **Mobile App Nativo**: React Native para melhor experiência mobile
2. **Sistema de Permissões**: Diferentes níveis de acesso (admin, gerente, operador)
3. **Integração com ERP Contábil**: Exportar dados financeiros
4. **Reconhecimento de Voz**: Registrar execução por comando de voz
5. **Fotos de Antes/Depois**: Upload de imagens em cada step
6. **Assinatura Digital**: Validação de conclusão com assinatura
7. **Backup Automático**: Cloud backup diário
8. **Multi-idioma**: Suporte a outros idiomas
9. **Tema Claro/Escuro**: Opção de tema claro
10. **Gamificação**: Pontos e badges para equipe mais produtiva

---

## 📚 DOCUMENTAÇÃO COMPLEMENTAR

Consulte sempre:
- `MODELO_RELACIONAL_COMPLETO.md` - Entender relacionamentos
- `PASSOS.md` - Controlar progresso
- `drizzle/schema.ts` - Ver estrutura do banco
- `server/routers.ts` - Endpoints disponíveis
- `ARQUITETURA_SISTEMA.md` - Visão geral do sistema

---

**✨ Boa sorte na implementação! Lembre-se: um passo de cada vez, sempre testando antes de avançar.**

**Última Atualização:** 2026-07-01  
**Total de Linhas:** ~4000+  
**Cobertura:** 100% dos 55 passos planejados
