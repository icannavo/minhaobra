# Exemplo de Uso - Sistema Kanban

## 🚀 Como Usar o Sistema

### 1. Criar um Novo Projeto com Geração Automática de Tarefas

```typescript
// No backend (tRPC ou API)
import { generateProject } from './services/projectGenerator';

// Dados do projeto
const projectInput = {
  workId: 1,
  name: "Restauração Edifício Centenário",
  description: "Restauração completa de fachada histórica",
  totalArea: 500, // m²
  totalFloors: 4,
  startDate: "2026-08-01",
  templateId: 1, // Template "Restauração Completa"
};

// Gerar estrutura completa
const generated = await generateProject(projectInput);

// Resultado:
// {
//   project: { ... },
//   phases: [4 fases],
//   tasks: [~48 tarefas], // 4 fachadas × 3 fases × 4 tarefas
//   subtasks: [~432 subtarefas] // 48 tarefas × 9 subtarefas
// }

// Estatísticas
const stats = getProjectStats(generated);
console.log(stats);
// {
//   totalTasks: 48,
//   totalSubtasks: 432,
//   totalHours: 960,
//   totalDays: 120,
//   byPriority: { critical: 4, high: 20, medium: 20, low: 4 }
// }
```

### 2. Inserir no Banco de Dados

```typescript
// Inserir projeto
const project = await db.insert(projects).values(generated.project).returning();

// Inserir fases
for (const phaseData of generated.phases) {
  const phase = await db.insert(projectPhases)
    .values({ ...phaseData, projectId: project.id })
    .returning();
  
  // Inserir tarefas da fase
  const phaseTasks = generated.tasks.filter(t => t.phaseOrder === phaseData.phaseOrder);
  
  for (const taskData of phaseTasks) {
    const task = await db.insert(projectTasks)
      .values({ ...taskData, projectId: project.id, phaseId: phase.id })
      .returning();
    
    // Inserir subtarefas
    const taskSubtasks = generated.subtasks.filter(st => st.taskIndex === taskData.taskOrder);
    
    for (const subtaskData of taskSubtasks) {
      await db.insert(projectSubtasks)
        .values({ ...subtaskData, projectTaskId: task.id });
    }
  }
}
```

### 3. Visualizar no Kanban

```typescript
// Usuário acessa:
// http://localhost:5000/project/1/kanban

// Frontend carrega automaticamente:
// - Todas as 48 tarefas no BACKLOG
// - 0 tarefas agendadas
// - 0 tarefas em andamento
// - 0 tarefas concluídas
```

## 📋 Fluxo Completo de Trabalho

### Fase 1: Planejamento no Kanban

```typescript
// 1. Usuário vê backlog com 48 tarefas
// 2. Filtra por "Fase 1: Preparação"
// 3. Vê 4 tarefas de limpeza (Norte, Sul, Leste, Oeste)

// 4. Arrasta "Limpeza Fachada Norte" para Segunda-feira (29/07)
await trpc.projectTasks.schedule.mutate({
  taskId: 1,
  scheduledDate: "2026-07-29",
  scheduledStartTime: "08:00",
  kanbanStatus: "scheduled"
});

// Tarefa move automaticamente para coluna "Agendado"
```

### Fase 2: Planejar Horários do Dia

```typescript
// Usuário clica em "Linha do Tempo Diária" para Segunda (29/07)

// Vê cronograma:
// 07:00 - Vazio
// 08:00 - "Limpeza Fachada Norte" (já agendada)
// 09:00 - Vazio
// ...

// Arrasta "Limpeza Fachada Sul" do backlog para 13:00
await trpc.projectTasks.schedule.mutate({
  taskId: 2,
  scheduledDate: "2026-07-29",
  scheduledStartTime: "13:00",
  kanbanStatus: "scheduled"
});

// Criar slot assignment
await trpc.taskAssignments.create.mutate({
  projectTaskId: 2,
  calendarSlotId: getSlotId("2026-07-29", "13:00"),
  status: "Agendado"
});
```

### Fase 3: Execução da Tarefa

```typescript
// Segunda-feira, 8h da manhã
// Encarregado inicia a tarefa no app

await trpc.projectTasks.start.mutate({
  taskId: 1,
  actualStartTime: new Date(),
  status: "Em Execução",
  kanbanStatus: "in_progress"
});

// Sistema move tarefa para coluna "Em Andamento"
// Notifica equipe via push notification
```

### Fase 4: Completar Subtarefas

```typescript
// Encarregado marca subtarefas conforme executa:

// 1. Reunião de Segurança (15 min) ✓
await trpc.projectSubtasks.complete.mutate({
  subtaskId: 1,
  actualMinutes: 15,
  status: "Concluído",
  completedAt: new Date()
});

// 2. Montagem de Andaime (240 min - 4 andares × 60min) ✓
await trpc.projectSubtasks.complete.mutate({
  subtaskId: 2,
  actualMinutes: 240,
  status: "Concluído",
  completedAt: new Date()
});

// 3. Vestir EPIs (10 min) ✓
// 4. Preparação de Equipamentos (30 min) ✓
// 5. Limpeza com Lavajato (375 min - 125m² × 3min) ✓
// 6. Intervalo para Almoço (60 min) ✓
// 7. Limpeza da Área (30 min) ✓
// 8. Desmontagem (30 min) ✓
// 9. Inspeção Final (37.5 min - 10% de 375min) ✓

// Sistema atualiza automaticamente:
// task.completedSubtasks = 9/9
// task.progressPercent = 100%
```

### Fase 5: Completar Tarefa

```typescript
// Todas subtarefas concluídas
await trpc.projectTasks.complete.mutate({
  taskId: 1,
  actualEndTime: new Date(),
  actualDurationMinutes: 827.5, // Soma real das subtarefas
  completedArea: 125, // m² realmente limpos
  status: "Concluído",
  kanbanStatus: "completed"
});

// Sistema atualiza automaticamente:
// 1. project.completedTasks = 1/48
// 2. project.progressPercent = 2.08%
// 3. phase.completedTasks = 1/4
// 4. phase.progressPercent = 25%

// 5. Desbloqueia tarefa dependente:
//    "Limpeza Fachada Sul" agora pode ser iniciada
await trpc.projectTasks.unblock.mutate({
  taskId: 2,
  blockedBy: null
});

// 6. Cria alerta de progresso
await trpc.alerts.create.mutate({
  workId: 1,
  type: "META_ATINGIDA",
  title: "Tarefa Concluída",
  message: "Limpeza de Fachada Norte foi concluída com sucesso!",
  severity: "info"
});
```

## 📊 Dashboard de Progresso

```typescript
// Acessar resumo do projeto
const summary = await trpc.projects.getSummary.query({ projectId: 1 });

// Retorna:
{
  project: {
    name: "Restauração Edifício Centenário",
    totalTasks: 48,
    completedTasks: 1,
    progressPercent: 2.08,
    status: "Em Andamento"
  },
  phases: [
    {
      name: "Fase 1: Preparação de Superfície",
      totalTasks: 4,
      completedTasks: 1,
      progressPercent: 25,
      status: "Em Andamento"
    },
    {
      name: "Fase 2: Reparos Estruturais",
      totalTasks: 8,
      completedTasks: 0,
      progressPercent: 0,
      status: "Bloqueado" // Aguarda Fase 1
    },
    // ...
  ],
  upcomingTasks: [
    {
      name: "Limpeza Fachada Sul",
      scheduledDate: "2026-07-29",
      scheduledStartTime: "13:00",
      status: "Agendado"
    }
  ],
  alerts: [
    {
      type: "META_ATINGIDA",
      message: "Limpeza de Fachada Norte concluída!"
    }
  ]
}
```

## 🎯 Cenários Avançados

### 1. Reagendar Tarefa

```typescript
// Tarefa "Limpeza Fachada Sul" estava para 29/07 às 13h
// Mas chuva prevista - reagendar para 30/07

await trpc.projectTasks.reschedule.mutate({
  taskId: 2,
  newDate: "2026-07-30",
  newTime: "08:00",
  reason: "Previsão de chuva"
});

// Log de mudança
await trpc.changeLogs.create.mutate({
  entityType: "project_task",
  entityId: 2,
  action: "UPDATE",
  fieldChanged: "scheduledDate",
  oldValue: "2026-07-29",
  newValue: "2026-07-30",
  reason: "Previsão de chuva"
});
```

### 2. Adicionar Tarefa Customizada

```typescript
// Encontrado problema não previsto: infiltração
const customTask = await trpc.projectTasks.create.mutate({
  projectId: 1,
  phaseId: 2, // Fase de Reparos
  code: "F2-T999",
  name: "Reparo de Infiltração Imprevista",
  description: "Infiltração encontrada durante limpeza",
  area: 5,
  estimatedDurationMinutes: 240,
  estimatedEmployees: 2,
  priority: "critical",
  kanbanStatus: "backlog",
  status: "Pendente"
});

// Aparece automaticamente no backlog
// Encarregado pode arrastar para dia apropriado
```

### 3. Dividir Tarefa Grande

```typescript
// "Limpeza Fachada Norte" é muito grande (125m²)
// Dividir em 2 tarefas menores

const [task1, task2] = await trpc.projectTasks.split.mutate({
  taskId: 1,
  splitCount: 2
});

// Cria:
// - "Limpeza Fachada Norte - Parte 1" (62.5m²)
// - "Limpeza Fachada Norte - Parte 2" (62.5m²)

// Cada uma com suas próprias subtarefas
// Facilita agendamento em dias diferentes
```

### 4. Relatório de Produtividade

```typescript
// Ao final da semana
const report = await trpc.productivity.getWeeklyReport.query({
  projectId: 1,
  weekStart: "2026-07-27"
});

// Retorna:
{
  week: "27/07 - 02/08",
  tasksCompleted: 8,
  hoursWorked: 64,
  areaCompleted: 250, // m²
  productivity: {
    planned: 20, // m²/pessoa/dia
    actual: 18.5, // m²/pessoa/dia
    deviation: -7.5% // 7.5% abaixo do planejado
  },
  recommendations: [
    "Produtividade abaixo do esperado na Fase 1",
    "Considerar aumentar equipe para 4 pessoas",
    "Tempo de montagem de andaime está acima da média"
  ]
}
```

## 🔔 Notificações e Alertas Automáticos

```typescript
// Sistema gera alertas automaticamente:

// 1. Tarefa atrasada
if (task.scheduledDate < today && task.status !== "Concluído") {
  await createAlert({
    type: "TAREFA_ATRASADA",
    title: "Tarefa Atrasada",
    message: `${task.name} deveria ter sido concluída em ${task.scheduledDate}`,
    severity: "warning"
  });
}

// 2. Desvio de produtividade
if (task.actualDurationMinutes > task.estimatedDurationMinutes * 1.2) {
  await createAlert({
    type: "TAREFA_DESVIO_NEGATIVO",
    title: "Desvio de Tempo",
    message: `${task.name} levou 20% mais tempo que o estimado`,
    severity: "warning"
  });
}

// 3. Cronograma em risco
const remainingDays = calculateRemainingDays(project);
if (remainingDays < 0) {
  await createAlert({
    type: "CRONOGRAMA_AFETADO",
    title: "Projeto Atrasado",
    message: `Projeto está ${Math.abs(remainingDays)} dias atrasado`,
    severity: "error"
  });
}

// 4. Meta atingida
if (phase.progressPercent === 100) {
  await createAlert({
    type: "META_ATINGIDA",
    title: "Fase Concluída",
    message: `${phase.name} foi concluída!`,
    severity: "info"
  });
}
```

## 🎨 Interface Visual

### Kanban Board
```
┌─────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│  BACKLOG    │   AGENDADO   │ EM ANDAMENTO │   REVISÃO    │  CONCLUÍDO   │
│  (40)       │     (5)      │     (2)      │     (1)      │    (0)       │
├─────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│             │              │              │              │              │
│ [F1-T003]   │ [F1-T001]    │ [F1-T002]    │              │              │
│ Limpeza     │ Limpeza      │ Limpeza      │              │              │
│ Leste       │ Norte        │ Sul          │              │              │
│ 🔴 Alta     │ 29/07 08:00  │ Em execução  │              │              │
│ 80m² 360min │ 125m² 480min │ 50% completo │              │              │
│             │              │              │              │              │
│ [F1-T004]   │ [F2-T001]    │              │              │              │
│ Limpeza     │ Mapeamento   │              │              │              │
│ Oeste       │ Fissuras     │              │              │              │
│ 🟡 Média    │ 30/07 08:00  │              │              │              │
│             │              │              │              │              │
│ [F2-T002]   │              │              │              │              │
│ Reparo      │              │              │              │              │
│ Fissuras    │              │              │              │              │
│ 🔴 Crítica  │              │              │              │              │
│ 🔒 Bloqueado│              │              │              │              │
└─────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

### Calendário Semanal
```
┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│   DOM   │   SEG   │   TER   │   QUA   │   QUI   │   SEX   │   SÁB   │
│   27    │   28    │   29    │   30    │   31    │   01    │   02    │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│         │         │         │         │         │         │         │
│         │ F1-T001 │ F1-T002 │ F2-T001 │ F2-T002 │ F3-T001 │         │
│         │ 08:00   │ 08:00   │ 08:00   │ 08:00   │ 08:00   │         │
│         │ 8h      │ 7h      │ 6h      │ 8h      │ 8h      │         │
│         │ 125m²   │ 100m²   │ 125m²   │ 25m²    │ 125m²   │         │
│         │         │         │         │         │         │         │
│         │         │ F1-T003 │         │         │         │         │
│         │         │ 13:00   │         │         │         │         │
│         │         │ 6h      │         │         │         │         │
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘
```

### Timeline Diária
```
Segunda-feira, 29 de Julho
8h de trabalho agendado

┌──────┬────────────────────────────────────────────────────────────┐
│ 07:00│                                                             │
├──────┼────────────────────────────────────────────────────────────┤
│ 08:00│ [F1-T001] Limpeza de Fachada Norte                         │
│      │ ⏱ 8h | 👥 3 pessoas | 📐 125m² | 🔴 Alta prioridade        │
│      │ Fase 1: Preparação de Superfície                           │
├──────┼────────────────────────────────────────────────────────────┤
│ 09:00│ ... (continuação da mesma tarefa)                          │
├──────┼────────────────────────────────────────────────────────────┤
│ 10:00│ ... (continuação da mesma tarefa)                          │
├──────┼────────────────────────────────────────────────────────────┤
│ 11:00│ ... (continuação da mesma tarefa)                          │
├──────┼────────────────────────────────────────────────────────────┤
│ 12:00│ 🍽️ INTERVALO PARA ALMOÇO                                   │
├──────┼────────────────────────────────────────────────────────────┤
│ 13:00│ [F1-T003] Limpeza de Fachada Leste                         │
│      │ ⏱ 6h | 👥 2 pessoas | 📐 80m² | 🟡 Média prioridade        │
├──────┼────────────────────────────────────────────────────────────┤
│ 14:00│ ... (continuação da mesma tarefa)                          │
├──────┼────────────────────────────────────────────────────────────┤
│ 15:00│ ... (continuação da mesma tarefa)                          │
├──────┼────────────────────────────────────────────────────────────┤
│ 16:00│ ... (continuação da mesma tarefa)                          │
├──────┼────────────────────────────────────────────────────────────┤
│ 17:00│                                                             │
├──────┼────────────────────────────────────────────────────────────┤
│ 18:00│                                                             │
└──────┴────────────────────────────────────────────────────────────┘

Tarefas não agendadas (38):
• [F1-T004] Limpeza Oeste
• [F2-T001] Mapeamento Fissuras
• [F2-T002] Reparo Fissuras
• ...
```

## ✨ Recursos Interativos

### Drag-and-Drop
- ✅ Arrastar tarefas entre colunas do Kanban
- ✅ Arrastar do backlog para dias da semana
- ✅ Arrastar do backlog para horários específicos
- ✅ Reordenar tarefas dentro de uma coluna
- ✅ Feedback visual durante arraste (sombra, rotação)

### Filtros e Busca
- ✅ Busca por nome ou código de tarefa
- ✅ Filtrar por prioridade
- ✅ Filtrar por fase
- ✅ Ordenar por: prioridade, duração, área, nome
- ✅ Agrupar por fase

### Indicadores Visuais
- ✅ Cores por prioridade (Crítica: 🔴, Alta: 🟠, Média: 🔵, Baixa: ⚪)
- ✅ Progresso em barra
- ✅ Subtarefas completadas (3/9)
- ✅ Duração estimada
- ✅ Número de pessoas
- ✅ Área em m²
- ✅ Ícone de bloqueio para tarefas dependentes

Este sistema oferece uma solução completa e profissional para gestão de projetos de restauração, inspirado nas melhores práticas do mercado! 🚀
