# 🎯 Exemplo Completo - Sistema Kanban

## Cenário Real: Restauração Edifício Central

### 📋 Dados do Projeto
```typescript
const projeto = {
  id: 1,
  workId: 1,
  name: "Restauração Edifício Central",
  location: "Av. Paulista, 1000 - São Paulo",
  totalArea: 500, // m²
  totalFloors: 4,
  startDate: "2026-07-01",
  estimatedEndDate: "2026-10-30",
};
```

### 🏢 Ambientes Gerados Automaticamente
```typescript
const ambientes = [
  { id: "env-1", name: "Fachada Norte", area: 125, floors: 4 },
  { id: "env-2", name: "Fachada Sul", area: 100, floors: 4 },
  { id: "env-3", name: "Fachada Leste", area: 80, floors: 4 },
  { id: "env-4", name: "Fachada Oeste", area: 95, floors: 4 },
];
```

## 📝 Tarefas Geradas (76 no total)

### Fase 1: Preparação de Superfície (28 tarefas)

#### Fachada Norte (7 tarefas)
```typescript
[
  {
    id: "task-1-1",
    taskName: "Reunião de Segurança - DDS - Fachada Norte",
    estimatedMinutes: 15,
    employees: 0, // Toda equipe
    isRoutine: true,
    priority: "critical",
  },
  {
    id: "task-1-2",
    taskName: "Montagem de Andaime - Fachada Norte",
    estimatedMinutes: 480, // 2h × 4 andares = 8h
    employees: 2,
    isRoutine: true,
    priority: "high",
  },
  {
    id: "task-1-3",
    taskName: "Distribuição de EPIs - Fachada Norte",
    estimatedMinutes: 10,
    employees: 1,
    isRoutine: true,
    priority: "critical",
  },
  {
    id: "task-1-4",
    taskName: "Transporte de Equipamentos - Fachada Norte",
    estimatedMinutes: 30,
    employees: 2,
    isRoutine: true,
    priority: "high",
  },
  {
    id: "task-1-5",
    taskName: "Limpeza com Lavajato - Fachada Norte",
    estimatedMinutes: 375, // 125m² × 3min = 375min = 6h15min
    employees: 3,
    area: 125,
    isRoutine: false,
    priority: "high",
  },
  {
    id: "task-1-6",
    taskName: "Limpeza Final da Área - Fachada Norte",
    estimatedMinutes: 30,
    employees: 2,
    isRoutine: true,
    priority: "medium",
  },
  {
    id: "task-1-7",
    taskName: "Desmontagem de Andaime - Fachada Norte",
    estimatedMinutes: 240, // 1h × 4 andares = 4h
    employees: 2,
    isRoutine: true,
    priority: "medium",
  },
]
```

#### Fachada Sul (7 tarefas)
```typescript
// Mesma estrutura, área = 100m²
// Limpeza = 100m² × 3min = 300min = 5h
```

#### Fachada Leste (7 tarefas)
```typescript
// Área = 80m²
// Limpeza = 80m² × 3min = 240min = 4h
```

#### Fachada Oeste (7 tarefas)
```typescript
// Área = 95m²
// Limpeza = 95m² × 3min = 285min = 4h45min
```

### Fase 2: Reparos Estruturais (16 tarefas)

#### Fachada Norte (4 tarefas)
```typescript
[
  {
    id: "task-2-1",
    taskName: "Inspeção e Mapeamento - Fachada Norte",
    estimatedMinutes: 188, // 125m² × 1.5min = 187.5min
    employees: 1,
    area: 125,
    priority: "critical",
  },
  {
    id: "task-2-2",
    taskName: "Abertura de Trincas - Fachada Norte",
    estimatedMinutes: 63, // 12.5m² × 5min = 62.5min (10% da área)
    employees: 1,
    area: 12.5,
    priority: "high",
  },
  {
    id: "task-2-3",
    taskName: "Aplicação de Selante - Fachada Norte",
    estimatedMinutes: 100, // 12.5m² × 8min
    employees: 1,
    area: 12.5,
    priority: "critical",
  },
  {
    id: "task-2-4",
    taskName: "Aplicação de Massa - Fachada Norte",
    estimatedMinutes: 150, // 25m² × 6min (20% da área)
    employees: 2,
    area: 25,
    priority: "high",
  },
]
```

### Fase 3: Impermeabilização (8 tarefas)

#### Todas as Fachadas (2 tarefas cada)
```typescript
[
  {
    id: "task-3-1",
    taskName: "Aplicação de Selador - Fachada Norte",
    estimatedMinutes: 313, // 125m² × 2.5min
    employees: 3,
    area: 125,
    priority: "high",
  },
  {
    id: "task-3-2",
    taskName: "Tempo de Cura - Fachada Norte",
    estimatedMinutes: 240, // 4 horas
    employees: 0,
    isRoutine: true,
    priority: "medium",
  },
]
```

### Fase 4: Pintura (24 tarefas)

#### Fachada Norte (6 tarefas)
```typescript
[
  {
    id: "task-4-1",
    taskName: "Primeira Demão - Fachada Norte",
    estimatedMinutes: 188, // 125m² × 1.5min
    employees: 4,
    area: 125,
    priority: "high",
  },
  {
    id: "task-4-2",
    taskName: "Secagem - Primeira Demão - Fachada Norte",
    estimatedMinutes: 180, // 3 horas
    employees: 0,
    isRoutine: true,
    priority: "low",
  },
  {
    id: "task-4-3",
    taskName: "Segunda Demão - Fachada Norte",
    estimatedMinutes: 188,
    employees: 4,
    area: 125,
    priority: "high",
  },
  {
    id: "task-4-4",
    taskName: "Secagem - Segunda Demão - Fachada Norte",
    estimatedMinutes: 180,
    employees: 0,
    isRoutine: true,
    priority: "low",
  },
  {
    id: "task-4-5",
    taskName: "Terceira Demão (Final) - Fachada Norte",
    estimatedMinutes: 188,
    employees: 4,
    area: 125,
    priority: "medium",
  },
  {
    id: "task-4-6",
    taskName: "Inspeção Final - Fachada Norte",
    estimatedMinutes: 63, // 125m² × 0.5min
    employees: 1,
    area: 125,
    priority: "high",
  },
]
```

## 🗓️ Planejamento Semana 1

### Segunda-feira (01/07/2026)

```
📅 Fachada Norte - Fase 1: Preparação

Backlog:
- [28 tarefas pendentes da Fase 1]
- [16 tarefas da Fase 2]
- [8 tarefas da Fase 3]
- [24 tarefas da Fase 4]

Cronograma do Dia:
┌──────┬────────────────────────────────────────────┐
│ 07:00│ Reunião de Segurança (DDS) - 15min         │
├──────┼────────────────────────────────────────────┤
│ 07:15│ Transporte de Equipamentos - 30min         │
├──────┼────────────────────────────────────────────┤
│ 07:45│ Montagem de Andaime - 8h                   │
│ 15:45│ (continua...)                              │
├──────┼────────────────────────────────────────────┤
│ 16:00│ Limpeza Final - 30min                      │
└──────┴────────────────────────────────────────────┘

Ao final do dia:
✅ 4 tarefas concluídas (de 76)
📊 Progresso: 5.3%
```

### Terça-feira (02/07/2026)

```
Cronograma:
┌──────┬────────────────────────────────────────────┐
│ 07:00│ DDS - 15min                                │
├──────┼────────────────────────────────────────────┤
│ 07:15│ Distribuição de EPIs - 10min               │
├──────┼────────────────────────────────────────────┤
│ 07:30│ Limpeza com Lavajato - 6h15min             │
│ 13:45│ (continua após almoço)                     │
├──────┼────────────────────────────────────────────┤
│ 14:00│ Almoço - 1h                                │
├──────┼────────────────────────────────────────────┤
│ 15:00│ Desmontagem de Andaime - 4h                │
└──────┴────────────────────────────────────────────┘

Ao final do dia:
✅ 8 tarefas concluídas (de 76)
📊 Progresso: 10.5%
```

### Quarta-feira (03/07/2026)

```
📅 Fachada Sul - Fase 1: Preparação

Cronograma:
┌──────┬────────────────────────────────────────────┐
│ 07:00│ DDS - 15min                                │
├──────┼────────────────────────────────────────────┤
│ 07:15│ Transporte de Equipamentos - 30min         │
├──────┼────────────────────────────────────────────┤
│ 07:45│ Montagem de Andaime - 8h                   │
├──────┼────────────────────────────────────────────┤
│ 16:00│ Limpeza Final - 30min                      │
└──────┴────────────────────────────────────────────┘

✅ 12 tarefas concluídas (de 76)
📊 Progresso: 15.8%
```

## 📊 Estatísticas Após 1 Mês

```typescript
// Após 30 dias de trabalho
const estatisticas = {
  totalTarefas: 76,
  concluidas: 38, // 50%
  emAndamento: 2,
  pendentes: 36,
  
  // Por fase
  fase1: {
    total: 28,
    concluidas: 28, // 100% ✅
    progresso: "100%",
  },
  fase2: {
    total: 16,
    concluidas: 10, // 62.5%
    progresso: "62.5%",
  },
  fase3: {
    total: 8,
    concluidas: 0, // Aguardando fase 2
    progresso: "0%",
  },
  fase4: {
    total: 24,
    concluidas: 0,
    progresso: "0%",
  },
  
  // Tempo trabalhado
  horasEstimadas: 320, // Total estimado
  horasRealizadas: 185, // Real até agora
  desvio: -15, // 15 horas a menos (mais rápido!)
  
  // Produtividade
  produtividadeMedia: 22.5, // m²/pessoa/dia
  produtividadeEsperada: 20, // m²/pessoa/dia
  desempenho: "+12.5%", // Acima da meta! 🎉
};
```

## 🎯 Como Usar na Prática

### 1. Criar Projeto
```typescript
// No NewProject.tsx
import { generateProjectTasks } from "@/utils/taskGenerator";

const handleCreateProject = async () => {
  // 1. Criar projeto no banco
  const project = await trpc.projects.create.mutate({
    workId: 1,
    name: "Restauração Edifício Central",
    totalArea: 500,
    totalFloors: 4,
  });
  
  // 2. Gerar tarefas automaticamente
  const environments = [
    { id: "env-1", name: "Fachada Norte", area: 125, floors: 4 },
    { id: "env-2", name: "Fachada Sul", area: 100, floors: 4 },
    { id: "env-3", name: "Fachada Leste", area: 80, floors: 4 },
    { id: "env-4", name: "Fachada Oeste", area: 95, floors: 4 },
  ];
  
  const tasks = generateProjectTasks(project.id.toString(), environments);
  
  // 3. Salvar todas as tarefas no banco
  await trpc.projectTasks.createMany.mutate({
    tasks: tasks.map(t => ({
      projectId: project.id,
      taskName: t.taskName,
      description: t.description,
      area: t.area,
      estimatedMinutes: t.estimatedMinutes,
      employees: t.employees,
      priority: t.priority,
      phaseOrder: t.phaseOrder,
      isRoutine: t.isRoutine,
      status: "pending",
    }))
  });
  
  toast.success(`Projeto criado com ${tasks.length} tarefas!`);
};
```

### 2. Planejar o Dia
```typescript
// No DailyDashboard.tsx ou NextDayPlanning.tsx

// 1. Selecionar projeto
setSelectedWorkId(1);

// 2. Carregar tarefas do projeto
const { data: tasks } = trpc.projectTasks.getByProject.useQuery({
  projectId: 1,
  status: "pending", // Apenas pendentes
});

// 3. Arrastar tarefas para horários
// (Drag-and-drop já implementado)

// 4. Salvar agendamento
const handleSaveSchedule = async () => {
  await trpc.dailySchedule.create.mutate({
    projectId: 1,
    date: selectedDate,
    tasks: scheduledTasks.map(t => ({
      taskId: t.id,
      slotId: t.slotId,
      scheduledStartTime: t.slotId,
    }))
  });
};
```

### 3. Executar e Concluir
```typescript
// Durante o dia

// Marcar como em progresso
const handleStartTask = async (taskId: string) => {
  await trpc.projectTasks.update.mutate({
    taskId,
    status: "in-progress",
    actualStartTime: new Date(),
  });
};

// Concluir tarefa
const handleCompleteTask = async (taskId: string) => {
  await trpc.projectTasks.complete.mutate({
    taskId,
    status: "completed",
    completedAt: new Date(),
  });
  
  // Tarefa some do backlog automaticamente
  // Progresso atualiza
  toast.success("Tarefa concluída! 🎉");
};
```

## 🚀 Resumo

**Sistema completo e funcional com:**
- ✅ 76 tarefas geradas automaticamente
- ✅ Tarefas rotineiras incluídas
- ✅ Editável e personalizável
- ✅ Drag-and-drop bidirecional
- ✅ Multi-dia
- ✅ Sistema de conclusão
- ✅ Cálculo de progresso
- ✅ Integração com Equipe e Materiais

**Pronto para produção!** 🎯
