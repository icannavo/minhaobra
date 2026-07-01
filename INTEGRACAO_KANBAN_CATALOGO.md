# 🔗 Integração Kanban ↔ Catálogo

## Visão Geral

O sistema integra o **Catálogo** existente (`/catalog`) com o **Sistema Kanban** (`DailyDashboard`) para controle de disponibilidade em tempo real.

## 📦 Recursos no Catálogo

### 1. EPIs (Equipamentos de Proteção Individual)
- Capacete de Segurança
- Óculos de Proteção
- Luva de Nitrila
- Luva de Couro
- Máscara Respiratória N95
- Máscara Respiratória PFF2
- Colete de Segurança
- Avental de Proteção
- Bota de Segurança
- Protetor Auricular

### 2. Ferramentas
- (Lista de ferramentas do catálogo)

### 3. Materiais
- (Lista de materiais do catálogo)

### 4. Equipamentos
- (Lista de equipamentos do catálogo)

## 🔄 Fluxo de Integração

### Quando uma Tarefa é Agendada no Kanban:

```typescript
// 1. Usuário arrasta tarefa para um horário
handleDragEnd(taskId, date, slotTime) {
  // 2. Sistema busca recursos necessários da tarefa
  const task = getTask(taskId);
  
  // 3. Para cada recurso (EPIs, Equipamentos, Materiais)
  task.equipments.forEach(equipment => {
    // 4. Verificar disponibilidade no catálogo
    const available = checkAvailability(equipment.id, date);
    
    if (available) {
      // 5. Alocar recurso para aquele dia
      allocateResource({
        resourceType: "equipment",
        resourceId: equipment.id,
        date: date,
        workId: selectedWorkId,
        taskId: taskId,
        quantity: equipment.quantity,
      });
      
      // 6. Atualizar disponibilidade
      updateResourceAvailability(equipment.id, date, false);
    } else {
      // 7. Alertar usuário
      toast.error(`${equipment.name} não disponível para ${date}`);
    }
  });
}
```

## 📊 Tabelas de Controle

### `resource_availability`
Controla disponibilidade diária de cada recurso:

```sql
CREATE TABLE resource_availability (
  id INTEGER PRIMARY KEY,
  resourceType TEXT, -- "equipment" | "team_member" | "material"
  resourceId INTEGER, -- ID do recurso no catálogo
  date TEXT, -- "2026-07-01"
  workId INTEGER, -- Obra onde está alocado
  taskId INTEGER, -- Tarefa onde está alocado
  isAvailable BOOLEAN, -- Se está disponível
  allocatedQuantity REAL, -- Quantidade alocada
  notes TEXT
);
```

### Exemplo de Dados:
```typescript
// Capacete de Segurança (ID: 1)
[
  {
    id: 1,
    resourceType: "equipment",
    resourceId: 1, // Capacete
    date: "2026-07-01",
    workId: 1,
    taskId: 5,
    isAvailable: false, // INDISPONÍVEL
    allocatedQuantity: 3, // 3 unidades alocadas
    notes: "Alocado para Limpeza Fachada Norte"
  },
  {
    id: 2,
    resourceType: "equipment",
    resourceId: 1,
    date: "2026-07-02",
    workId: null,
    taskId: null,
    isAvailable: true, // DISPONÍVEL
    allocatedQuantity: 0,
    notes: null
  }
]
```

## 🎯 Abas do DailyDashboard

### Aba 1: Tarefas (Kanban Principal)
```typescript
// Mostra todas as tarefas com seus recursos
<TabsContent value="tarefas">
  <div className="grid grid-cols-4 gap-4">
    {/* Backlog */}
    <div>
      <h3>Backlog</h3>
      {backlogTasks.map(task => (
        <TaskCard 
          task={task}
          equipments={task.equipments} // Do catálogo
          materials={task.materials}   // Do catálogo
          team={task.teamMembers}      // Do cadastro de equipe
        />
      ))}
    </div>
    
    {/* Timeline 7h-18h */}
    <div className="col-span-3">
      {timeSlots.map(slot => (
        <TimeSlot 
          slot={slot}
          tasks={slotTasks[slot.id]}
          // Ao arrastar tarefa aqui, alocar recursos automaticamente
        />
      ))}
    </div>
  </div>
</TabsContent>
```

### Aba 2: Equipe (Kanban de Pessoas)
```typescript
<TabsContent value="equipe">
  <TeamKanban 
    date={selectedDate}
    workId={selectedWorkId}
    // Lista TODOS os membros cadastrados
    members={allTeamMembers}
    // Mostra disponibilidade para o dia
    availability={teamAvailability[selectedDate]}
    // Permite arrastar para tarefas
    onAllocate={(memberId, taskId) => {
      // Marca como indisponível
      updateResourceAvailability("team_member", memberId, selectedDate, false);
    }}
  />
  
  {/* Visualização: */}
  <div className="grid grid-cols-2 gap-4">
    {/* Esquerda: Membros Disponíveis */}
    <div>
      <h3>Disponíveis (Verde ✅)</h3>
      {availableMembers.map(member => (
        <DraggableTeamMember 
          member={member}
          isAvailable={true}
          currentWork={null}
        />
      ))}
    </div>
    
    {/* Direita: Já Alocados */}
    <div>
      <h3>Alocados (Vermelho ❌)</h3>
      {allocatedMembers.map(member => (
        <TeamMemberCard 
          member={member}
          isAvailable={false}
          currentWork="Obra Centro"
          currentTask="Limpeza Fachada Norte"
          allocatedHours={8}
        />
      ))}
    </div>
  </div>
</TabsContent>
```

### Aba 3: Materiais (Kanban de Materiais)
```typescript
<TabsContent value="materiais">
  <MaterialsKanban 
    date={selectedDate}
    workId={selectedWorkId}
    // Busca materiais do CATÁLOGO
    materials={catalogMaterials}
    // Mostra disponibilidade
    availability={materialAvailability[selectedDate]}
    onAllocate={(materialId, taskId, quantity) => {
      // Reduz disponibilidade
      updateMaterialStock(materialId, -quantity);
      // Registra alocação
      createAllocation(materialId, taskId, date, quantity);
    }}
  />
  
  {/* Visualização: */}
  <div className="grid grid-cols-2 gap-4">
    {/* Esquerda: Estoque */}
    <div>
      <h3>Estoque de Materiais</h3>
      {materials.map(material => (
        <MaterialCard 
          material={material}
          inStock={material.quantityInStock}
          available={material.quantityAvailable}
          allocated={material.quantityAllocated}
          // Cores:
          // Verde: available > 0
          // Laranja: available < minStock
          // Vermelho: available = 0
        />
      ))}
    </div>
    
    {/* Direita: Alocar em Tarefas */}
    <div>
      <h3>Alocar em Tarefas</h3>
      {tasks.map(task => (
        <TaskMaterialDropZone 
          task={task}
          allocatedMaterials={taskMaterials[task.id]}
          // Arraste materiais aqui
          // Digite quantidade
        />
      ))}
    </div>
  </div>
</TabsContent>
```

## 🔍 Consultas SQL para Disponibilidade

### Verificar Disponibilidade de Equipamento
```sql
SELECT 
  e.id,
  e.name,
  e.quantity as total_quantity,
  COALESCE(
    (SELECT SUM(allocatedQuantity) 
     FROM daily_equipment_allocations 
     WHERE equipmentId = e.id 
     AND date = '2026-07-01'
    ), 0
  ) as allocated_quantity,
  (e.quantity - COALESCE(...)) as available_quantity
FROM equipments e;
```

### Verificar Disponibilidade de Membro da Equipe
```sql
SELECT 
  tm.id,
  tm.name,
  tm.role,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM daily_team_allocations 
      WHERE teamMemberId = tm.id 
      AND date = '2026-07-01'
    ) THEN 0 
    ELSE 1 
  END as is_available,
  w.name as current_work,
  dt.taskName as current_task
FROM team_members tm
LEFT JOIN daily_team_allocations dta ON tm.id = dta.teamMemberId AND dta.date = '2026-07-01'
LEFT JOIN works w ON dta.workId = w.id
LEFT JOIN detailed_tasks dt ON dta.taskId = dt.id;
```

### Verificar Disponibilidade de Material
```sql
SELECT 
  m.id,
  m.name,
  m.quantityInStock,
  COALESCE(
    (SELECT SUM(allocatedQuantity) 
     FROM daily_material_allocations 
     WHERE materialId = m.id 
     AND date = '2026-07-01'
    ), 0
  ) as allocated_quantity,
  (m.quantityInStock - COALESCE(...)) as available_quantity,
  m.minStockLevel,
  CASE 
    WHEN (m.quantityInStock - COALESCE(...)) = 0 THEN 'out_of_stock'
    WHEN (m.quantityInStock - COALESCE(...)) < m.minStockLevel THEN 'low_stock'
    ELSE 'available'
  END as status
FROM materials m;
```

## 🎨 UI - Estados Visuais

### Equipamento Disponível
```tsx
<Card className="border-green-500/20 bg-green-500/5">
  <Badge className="bg-green-500/10 text-green-400">
    <CheckCircle /> Disponível
  </Badge>
  <p>5 unidades disponíveis</p>
</Card>
```

### Equipamento Indisponível
```tsx
<Card className="border-red-500/20 bg-red-500/5 opacity-50 cursor-not-allowed">
  <Badge className="bg-red-500/10 text-red-400">
    <AlertCircle /> Indisponível
  </Badge>
  <p>Alocado em: Obra Centro - Limpeza Fachada Norte</p>
</Card>
```

### Material com Baixo Estoque
```tsx
<Card className="border-orange-500/20 bg-orange-500/5">
  <Badge className="bg-orange-500/10 text-orange-400">
    <AlertTriangle /> Baixo Estoque
  </Badge>
  <p>8 L disponíveis (Mínimo: 20 L)</p>
</Card>
```

## 📱 Exemplo Prático Completo

### Dia 1: Segunda-feira (01/07/2026)

#### 1. Abrir DailyDashboard
```
URL: /daily
Selecionar Projeto: "Restauração Edifício Central"
Data: 01/07/2026
```

#### 2. Aba Tarefas
```
Backlog mostra:
- [76 tarefas do projeto]
- Cada tarefa lista:
  - Equipamentos necessários (vem do catálogo)
  - Materiais necessários (vem do catálogo)
  - Equipe necessária
```

#### 3. Arrastar Tarefa para 08:00
```
Tarefa: "Limpeza Fachada Norte"

Equipamentos necessários:
✅ Lavajato (1x) - Disponível
✅ Andaime 5m (1x) - Disponível
✅ Compressor (1x) - Disponível

Sistema:
1. Verifica disponibilidade de TODOS
2. Se todos disponíveis → Permite arrastar
3. Ao soltar no slot 08:00:
   - Aloca recursos
   - Marca como indisponíveis para o dia
   - Salva no banco
```

#### 4. Aba Equipe
```
Ver alocação da equipe:

Disponíveis:
✅ André Silva (Encarregado) - Disponível
✅ Daia Santos (Operador) - Disponível
✅ Graziela Rocha (Ajudante) - Disponível

Indisponíveis:
❌ Elton Costa - Alocado em "Obra Paulista - Pintura Fachada Sul"
❌ Guilherme Alves - Alocado em "Obra Centro - Reparos"

Ação:
- Arrastar André, Daia e Graziela para "Limpeza Fachada Norte"
- Eles ficam INDISPONÍVEIS para outras tarefas do dia
```

#### 5. Aba Materiais
```
Estoque:

✅ Detergente Industrial: 50L disponíveis (Precisa: 5L)
⚠️ Água: 100L disponíveis (Precisa: 200L) - Baixo estoque!
❌ Tinta Branca: 0L disponíveis - INDISPONÍVEL

Ação:
- Arrastar Detergente (5L) para "Limpeza Fachada Norte"
- Sistema reduz disponibilidade: 50L → 45L
- Alerta aparece: "Água insuficiente! Reabasteça"
```

## 🔄 Atualização em Tempo Real

### Quando Recurso é Alocado:
```typescript
// Exemplo: Capacete alocado
const handleAllocateResource = async (resourceId, date, taskId) => {
  // 1. Criar alocação
  await trpc.resourceAvailability.create.mutate({
    resourceType: "equipment",
    resourceId,
    date,
    taskId,
    isAvailable: false,
    allocatedQuantity: 1,
  });
  
  // 2. Atualizar UI em todas as abas
  refetchAvailability();
  
  // 3. Mostrar em outras páginas
  // Se usuário abrir outro projeto no mesmo dia
  // O recurso aparece como INDISPONÍVEL
};
```

## 🎯 Resumo da Integração

1. **Catálogo** (`/catalog`) → Fonte de dados (EPIs, Equipamentos, Materiais)
2. **DailyDashboard** → Consumidor que mostra disponibilidade
3. **Tabelas de Controle** → Registram alocações diárias
4. **Sistema Kanban** → Drag-and-drop aloca/desaloca automaticamente
5. **Feedback Visual** → Verde (disponível), Laranja (baixo), Vermelho (indisponível)

**Tudo está interconectado e relacional!** 🔗
